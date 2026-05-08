import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import fs from "fs";
import path from "path";
import { getSupabase } from "@/lib/supabase";

interface ToolEntry {
  id: string;
  name: string;
  vendor: string;
  category: string;
  department: string[];
  uses_ai: boolean;
  ai_features: string | null;
  pricing_model: string;
  typical_monthly_cost_usd: number;
  energy_transparency: string;
  environmental_notes: string | null;
  waste_patterns: string[];
  leaner_alternatives: string[];
}

interface AuditAnswers {
  business_name: string;
  business_type: string;
  team_size: string;
  departments: string[];
  tools_by_department: Record<string, string[]>;
  ai_usage: Record<string, boolean>;
  monthly_spend_range: string;
  additional_tools: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { auditId, answers }: { auditId: string; answers: AuditAnswers } = body;

    if (!auditId || !answers) {
      return NextResponse.json({ error: "Missing auditId or answers" }, { status: 400 });
    }

    // Read tool registry
    const registryPath = path.join(process.cwd(), "content", "tool-registry.json");
    const registry: ToolEntry[] = JSON.parse(fs.readFileSync(registryPath, "utf-8"));

    // Collect all tools the user selected
    const allSelectedTools = [
      ...new Set(Object.values(answers.tools_by_department).flat()),
    ];

    // Build tool context string
    const toolContextLines = allSelectedTools.map((toolName) => {
      const match = registry.find(
        (r) => r.name.toLowerCase() === toolName.toLowerCase()
      );
      if (match) {
        return [
          `${match.name} (${match.category}, $${match.typical_monthly_cost_usd}/mo typical):`,
          `  AI features: ${match.ai_features ?? "none"}`,
          `  Energy transparency: ${match.energy_transparency}`,
          `  Waste patterns: ${match.waste_patterns.join("; ")}`,
          `  Leaner alternatives: ${match.leaner_alternatives.join("; ")}`,
        ].join("\n");
      }
      return `${toolName}: unrecognized tool â€” assess manually based on category and typical pricing`;
    });

    // Format tools by department for readability
    const toolsByDeptFormatted = Object.entries(answers.tools_by_department)
      .map(([dept, tools]) => `  ${dept}: ${tools.join(", ")}`)
      .join("\n");

    // Format AI usage
    const aiUsageFormatted = Object.entries(answers.ai_usage)
      .filter(([, enabled]) => enabled)
      .map(([tool]) => tool)
      .join(", ") || "none selected";

    const userMessage = `Analyze this business's AI and software stack and produce a waste estimate report.

Business: ${answers.business_name}
Type: ${answers.business_type}
Team size: ${answers.team_size}
Monthly software spend: ${answers.monthly_spend_range}
Departments: ${answers.departments.join(", ")}

Tools by department:
${toolsByDeptFormatted}

AI features actively used in: ${aiUsageFormatted}

Additional tools mentioned: ${answers.additional_tools || "none"}

Tool registry context:
${toolContextLines.join("\n\n")}

Respond with valid JSON matching this exact schema:
{
  "headline": "string â€” one punchy sentence summarizing the waste picture",
  "waste_score": "low | medium | high | critical",
  "estimated_monthly_waste_low": number,
  "estimated_monthly_waste_high": number,
  "estimated_hours_wasted_per_month": number,
  "summary": "string â€” 2-3 sentences plain language overview",
  "findings": [
    {
      "tool": "string",
      "department": "string",
      "issue": "string â€” what the problem is",
      "impact": "low | medium | high",
      "recommendation": "string â€” what to do about it"
    }
  ],
  "quick_wins": ["string â€” up to 5 specific actions they can take immediately"],
  "environmental_note": "string â€” honest plain-language note about the energy footprint of their stack",
  "redirect_estimate_usd": number
}

Be specific. Name actual tools. Give real dollar estimates based on typical pricing. If you cannot estimate confidently, give a conservative range. Never use vague language like "significant" or "substantial" â€” use numbers.`;

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 4096,
      system:
        "You are an AI operations auditor. You analyze SMB tool stacks and identify waste, redundancy, and environmental impact. You respond only with valid JSON. No preamble, no markdown fences.",
      messages: [{ role: "user", content: userMessage }],
    });

    const rawText =
      message.content[0].type === "text" ? message.content[0].text.trim() : "";

    // Strip markdown code fences if Claude adds them despite instructions
    const cleaned = rawText
      .replace(/^```(?:json)?\n?/, "")
      .replace(/\n?```$/, "");

    let report: Record<string, unknown>;
    try {
      report = JSON.parse(cleaned);
    } catch {
      return NextResponse.json(
        { error: "Failed to parse audit report from Claude", raw: cleaned },
        { status: 500 }
      );
    }

    // Update audit_estimates row if auditId is provided and Supabase is configured
    if (auditId && process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const supabase = getSupabase();
        await supabase
          .from("audit_estimates")
          .update({
            report,
            status: "complete",
            updated_at: new Date().toISOString(),
          })
          .eq("id", auditId);
      } catch {
        // Log but don't fail â€” report is still returned to client
        console.error("Failed to persist report to Supabase");
      }
    }

    return NextResponse.json(report);
  } catch (err) {
    console.error("generate-audit error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}


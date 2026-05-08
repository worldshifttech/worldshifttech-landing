import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getSupabase } from "@/lib/supabase";
import { loadCaseStudies } from "@/lib/case-studies";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const INDUSTRY_SLUGS = [
  "marketing", "agency", "saas", "nonprofit", "consulting",
  "technology", "ecommerce", "healthcare", "operations", "creative", "other",
];

const SOLUTION_SLUGS = [
  "onboarding-automation", "reporting-automation", "sales-workflow",
  "intake-automation", "custom-app-build", "ai-agent-setup", "website-build",
  "workflow-optimization", "donor-retention", "triage-automation",
  "operations-visibility", "finance-automation", "other",
];

interface ClassifyResult {
  industry: string;
  solution: string;
  industry_label: string;
  solution_label: string;
}

interface GenerateResult {
  headline: string;
  problem: string;
  solution_body: string;
  use_cases: { title: string; description: string }[];
}

export async function POST(req: NextRequest) {
  let body: { source?: string; description?: string; interests?: string[]; freeform?: string; turnstileToken?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { source = "", description = "", interests = [], freeform = "", turnstileToken = "" } = body;

  // Turnstile verification — block bots before any Claude or Supabase work
  if (!turnstileToken) {
    return NextResponse.json({ error: "Bot detected" }, { status: 403 });
  }
  try {
    const verifyRes = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        secret: process.env.TURNSTILE_SECRET_KEY,
        response: turnstileToken,
      }),
    });
    const verifyData = await verifyRes.json();
    if (!verifyData.success) {
      return NextResponse.json({ error: "Bot detected" }, { status: 403 });
    }
  } catch (err) {
    console.error("Turnstile verify error:", err);
    return NextResponse.json({ error: "Bot detected" }, { status: 403 });
  }

  // Step 1 — Classify
  let classification: ClassifyResult;
  try {
    const classifyMsg = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 500,
      system: "Return ONLY valid JSON, no preamble, no markdown fences.",
      messages: [
        {
          role: "user",
          content: `Classify this website visitor into the best-matching industry and solution slugs.

Visitor answers:
- How they found the site: ${source}
- What they do: ${description}
- Interested in: ${interests.join(", ")}
- Additional context: ${freeform}

Valid industry slugs: ${INDUSTRY_SLUGS.join(", ")}
Valid solution slugs: ${SOLUTION_SLUGS.join(", ")}

Return JSON:
{
  "industry": "<slug>",
  "solution": "<slug>",
  "industry_label": "<human-readable label>",
  "solution_label": "<human-readable label>"
}`,
        },
      ],
    });

    const raw = (classifyMsg.content[0] as { type: string; text: string }).text.trim();
    classification = JSON.parse(raw);
  } catch (err) {
    console.error("Classify error:", err);
    return NextResponse.json({ error: "Classification failed" }, { status: 500 });
  }

  const { industry, solution, industry_label, solution_label } = classification;

  // Step 2 — Cache check
  try {
    const { data, error } = await getSupabase()
      .from("generated_pages")
      .select("*")
      .eq("industry", industry)
      .eq("solution", solution)
      .single();

    if (data && !error) {
      return NextResponse.json({
        hit: true,
        industry,
        solution,
        industry_label,
        solution_label,
        headline: data.headline,
        problem: data.problem,
        solution_body: data.solution_body,
        use_cases: data.use_cases,
      });
    }
  } catch (err) {
    // Cache miss or Supabase error — proceed to generate
    console.warn("Cache check skipped:", err);
  }

  // Step 3 — Generate
  let generated: GenerateResult;
  try {
    const caseStudies = loadCaseStudies();

    const generateMsg = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      system: `You are generating a personalized landing page for a visitor to worldshifttech.com.
Drew Griffiths is a fractional COO and automation consultant who builds custom AI agents, workflow automations, and tools for businesses.

Generate a landing page tailored to this visitor's industry and needs.
Return ONLY valid JSON with no preamble and no markdown fences:
{
  "headline": "<punchy, outcome-focused, specific to their industry — max 12 words>",
  "problem": "<2-3 sentences on the pain point this person likely has — specific to their role and industry, not generic>",
  "solution_body": "<2-3 sentences on what Drew would build for them — concrete, outcome-focused, references the type of tool or automation>",
  "use_cases": [
    { "title": "<string>", "description": "<string>" },
    { "title": "<string>", "description": "<string>" }
  ]
}

Draw from the case studies provided as evidence of what Drew actually builds. Do not invent capabilities he does not have. Lead with outcomes, not tools.`,
      messages: [
        {
          role: "user",
          content: `Visitor answers:
- How they found the site: ${source}
- What they do: ${description}
- Interested in: ${interests.join(", ")}
- Additional context: ${freeform}
- Classified as: ${industry_label} / ${solution_label}

Case studies:
${caseStudies}`,
        },
      ],
    });

    const raw = (generateMsg.content[0] as { type: string; text: string }).text.trim();
    generated = JSON.parse(raw);
  } catch (err) {
    console.error("Generate error:", err);
    return NextResponse.json({ error: "Generation failed" }, { status: 500 });
  }

  // Step 4 — Save to Supabase
  try {
    await getSupabase().from("generated_pages").insert({
      industry,
      solution,
      headline: generated.headline,
      problem: generated.problem,
      solution_body: generated.solution_body,
      use_cases: generated.use_cases,
    });
  } catch (err) {
    console.warn("Supabase insert failed:", err);
    // Non-fatal — still return the generated content
  }

  // Step 5 — Return
  return NextResponse.json({
    hit: false,
    industry,
    solution,
    industry_label,
    solution_label,
    ...generated,
  });
}

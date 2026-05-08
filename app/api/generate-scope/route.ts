import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getSupabase } from "@/lib/supabase";
import fs from "fs";
import path from "path";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

function loadPricingIntelligence(): string {
  try {
    const filePath = path.join(process.cwd(), "content", "pricing-intelligence.md");
    return fs.readFileSync(filePath, "utf-8");
  } catch {
    return "";
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { projectId, answers } = body;

  const pricingIntel = loadPricingIntelligence();

  const userPrompt = `Here are the answers from a user who wants to build a custom tool:

Q1 - What kind of tool: ${answers.q1}
Q2 - Who it's for: ${answers.q2}
Q3 - Problem description: ${answers.q3}
Q4 - What it costs them: ${(answers.q4 as string[]).join(", ")}
Q5 - Value if it worked perfectly (value signals): ${(answers.value_signals as string[]).join(", ")}
Q6 - What would change: ${answers.q6}
Q7 - Needs AI: ${answers.q7}
Q8 - Who else uses it: ${answers.q8}
Q9 - Success in 90 days: ${answers.q9}
Q10 - Existing tools: ${(answers.q10 as string[]).join(", ")}${answers.q10_other ? ` (Other: ${answers.q10_other})` : ""}
Q11 - Technical level: ${answers.q11}
Q12 - Anything else: ${answers.q12 || "Nothing additional"}

## PRICING INTELLIGENCE
${pricingIntel}

Return ONLY valid JSON with this exact shape. No preamble, no markdown fences, no extra text:
{
  "title": "short project title (5 words max, no generic phrases like Custom Tool)",
  "the_problem": "2-3 sentences describing what they are solving and why it matters",
  "without_it": "2-3 sentences describing the current pain, specific not generic",
  "with_it": "2-3 sentences describing the outcome unlocked, lead with the business result",
  "green_score": "Light",
  "green_score_reason": "1 sentence explaining why this footprint rating was assigned",
  "green_offset_estimate": "$0.50-1/mo equivalent",
  "pricing": {
    "mvp": {
      "low": 2000,
      "high": 3000,
      "description": "What MVP includes — 1 sentence"
    },
    "polished": {
      "low": 2500,
      "high": 4500,
      "description": "What Polished adds — 1 sentence"
    },
    "perfected": {
      "low": 5000,
      "high": 8000,
      "description": "What Perfected adds — 1 sentence"
    },
    "value_rationale": "2-3 sentences explaining how value signals and industry baseline informed the pricing"
  }
}

Pricing must follow this order:
1. Start from the value the client signaled this tool would deliver. Use Q5 value signals and Q6/Q9 answers as the primary input. What is this tool worth to their business — in time recovered, revenue enabled, costs displaced, or capacity unlocked?
2. Set the MVP price from that value first. A project where the client said it saves $50,000/year or unlocks more clients without more headcount should price significantly above the MVP floor, not at it.
3. After setting the value-based price, verify it is not below the tier floor. If it is, raise it to the floor. If it is above, keep it — do not anchor downward toward the floor.

Tier floors (never go below these): MVP low $2,000. Polished is typically 1.5–1.75× MVP. Perfected is typically 2–2.5× MVP.

Price the MVP at the simplest working version of exactly what was described — nothing more. Write value_rationale as if explaining to the client why the investment makes sense — outcomes-focused, not hours-focused.

For green_score use exactly one of: "Light", "Moderate", "Heavy"
- Light: static or simple tools with no AI calls and few or no external integrations
- Moderate: tools that use AI occasionally or connect to a moderate number of external services
- Heavy: tools that make frequent AI calls, connect to many external services, or process large data volumes in real-time

For green_score_reason write 1 sentence explaining the rating. Examples:
- Light: "This tool stores and displays data with no AI calls and minimal integrations."
- Moderate: "This tool uses AI for periodic analysis and connects to a few external services."
- Heavy: "This tool makes frequent AI calls and integrates with multiple external platforms in real-time."

For green_offset_estimate provide a rough monthly CO2 offset cost framing:
- Light tools: "$0.50-1/mo equivalent"
- Moderate tools: "$1-3/mo equivalent"
- Heavy tools: "$3-6/mo equivalent"

For all pricing fields use integers with no dollar sign.`;

  let scope: Record<string, unknown>;

  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system:
        "You are a product scoping assistant for World Shift Technologies. You help founders and operators understand what it would take to build their idea. Be specific, concrete, and founder-friendly. No jargon. No em-dashes. Lead with outcomes.",
      messages: [{ role: "user", content: userPrompt }],
    });

    const raw =
      message.content[0].type === "text" ? message.content[0].text.trim() : "";
    scope = JSON.parse(raw);
  } catch {
    return NextResponse.json(
      { error: "Scope generation failed" },
      { status: 500 }
    );
  }

  // Populate price_low / price_high from pricing.mvp so nothing downstream breaks
  const pricing = scope.pricing as { mvp: { low: number; high: number } } | undefined;
  if (pricing?.mvp) {
    scope.price_low = pricing.mvp.low;
    scope.price_high = pricing.mvp.high;
  }

  const supabase = getSupabase();
  await supabase
    .from("projects")
    .update({
      scope,
      title: scope.title,
      status: "scoped",
      updated_at: new Date().toISOString(),
    })
    .eq("id", projectId);

  return NextResponse.json(scope);
}

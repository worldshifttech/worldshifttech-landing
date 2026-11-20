import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getSupabase } from "@/lib/supabase";
import { loadCaseStudies } from "@/lib/case-studies";
import { DEFAULT_INDUSTRY, DEFAULT_SOLUTION, DEFAULT_PAGE } from "@/lib/default-page";

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

// Model choices (wst-build-manager catalog entry 7). Claude 5.x thinks by default and thinking
// tokens count against max_tokens, so thinking is set explicitly on both calls.
// Sonnet 5.5 answers 400 to { type: "disabled" } and takes { type: "between_tools" };
// Haiku 5.5 takes "disabled". The SDK types lag the API, hence the cast.
// Classify uses Sonnet too: in a real-model comparison (Session 91) Haiku 5.5 answered "other" for
// a nonprofit director and a SaaS consultant where Sonnet picked donor-retention and
// workflow-optimization, and a vaguer slug means fewer shared cached pages.
const MODEL = "claude-sonnet-5-5";
const THINKING = { type: "between_tools" } as never;

// Pull the JSON object out of a reply even if the model wraps it in fences or adds a stray word.
function parseJson<T>(msg: Anthropic.Message): T {
  const block = msg.content.find((b) => b.type === "text") as { text: string } | undefined;
  if (!block) throw new Error(`No text in reply (stop_reason: ${msg.stop_reason})`);
  const text = block.text.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end < start) throw new Error(`No JSON in reply (stop_reason: ${msg.stop_reason})`);
  return JSON.parse(text.slice(start, end + 1)) as T;
}

function validSlug(value: unknown, allowed: string[]): string {
  return typeof value === "string" && allowed.includes(value) ? value : "other";
}

function validGenerated(g: Partial<GenerateResult> | null): g is GenerateResult {
  return (
    !!g &&
    typeof g.headline === "string" && g.headline.length > 0 &&
    typeof g.problem === "string" && g.problem.length > 0 &&
    typeof g.solution_body === "string" && g.solution_body.length > 0 &&
    Array.isArray(g.use_cases) && g.use_cases.length > 0 &&
    g.use_cases.every((u) => typeof u?.title === "string" && typeof u?.description === "string")
  );
}

// Fail soft: a model or parsing failure shows the built-in default page, not an error.
function defaultResponse() {
  return NextResponse.json({
    hit: false,
    fallback: true,
    industry: DEFAULT_INDUSTRY,
    solution: DEFAULT_SOLUTION,
    industry_label: "General",
    solution_label: "Overview",
    ...DEFAULT_PAGE,
  });
}

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
      model: MODEL,
      thinking: THINKING,
      max_tokens: 1000,
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

    const parsed = parseJson<Partial<ClassifyResult>>(classifyMsg);
    const industry = validSlug(parsed.industry, INDUSTRY_SLUGS);
    const solution = validSlug(parsed.solution, SOLUTION_SLUGS);
    classification = {
      industry,
      solution,
      industry_label: parsed.industry_label || industry,
      solution_label: parsed.solution_label || solution,
    };
  } catch (err) {
    console.error("Classify error:", err);
    return defaultResponse();
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
      model: MODEL,
      thinking: THINKING,
      max_tokens: 2000,
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

    const parsed = parseJson<Partial<GenerateResult>>(generateMsg);
    if (!validGenerated(parsed)) throw new Error("Generated page is missing fields");
    generated = {
      headline: parsed.headline,
      problem: parsed.problem,
      solution_body: parsed.solution_body,
      use_cases: parsed.use_cases,
    };
  } catch (err) {
    console.error("Generate error:", err);
    return defaultResponse();
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

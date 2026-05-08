import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getSupabase } from "@/lib/supabase";
import fs from "fs";
import path from "path";

const ADMIN_EMAIL = "drew@worldshifttech.com";
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const ANSWER_LABELS: Record<string, string> = {
  q1: "Q1 - What kind of tool",
  q2: "Q2 - Who it's for",
  q3: "Q3 - The problem",
  q4: "Q4 - What it costs",
  q5: "Q5 - What would change",
  q6: "Q6 - Needs AI?",
  q7: "Q7 - Who else uses it",
  q8: "Q8 - Success in 90 days",
  q9: "Q9 - Existing integrations",
  q9_other: "Q9 (Other) - Other integration",
  q10: "Q10 - Technical level",
  q11: "Q11 - Anything else",
};

export async function PATCH(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "").trim();

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const supabase = getSupabase();
  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user || user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { projectId, status } = await req.json();

  if (!projectId || !status) {
    return NextResponse.json({ error: "Missing projectId or status" }, { status: 400 });
  }

  const { error: updateError } = await supabase
    .from("projects")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", projectId);

  if (updateError) {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }

  if (status !== "approved") {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  // Generate and save demo URL
  const demoUrl = `https://demo-${projectId}.vercel.app`;
  await supabase
    .from("projects")
    .update({ demo_url: demoUrl })
    .eq("id", projectId);

  // Fetch scope and answers for Claude prompt generation
  const { data: project } = await supabase
    .from("projects")
    .select("scope, answers")
    .eq("id", projectId)
    .single();

  let claudeCodePrompt: string | null = null;
  let projectReadme: string | null = null;

  if (project) {
    const scope = project.scope as Record<string, unknown>;
    const answers = project.answers as Record<string, unknown>;

    const answersText = Object.entries(ANSWER_LABELS)
      .map(([key, label]) => {
        const value = answers?.[key];
        if (!value) return null;
        const text = Array.isArray(value) ? value.join(", ") : String(value);
        return text.trim() ? `${label}: ${text}` : null;
      })
      .filter(Boolean)
      .join("\n");

    let template = "";
    let systemPrompt =
      "You are a senior full-stack developer writing a Claude Code build prompt. Write clear, numbered, file-specific instructions.";

    try {
      const templatePath = path.join(process.cwd(), "content", "claude-code-prompt-template.md");
      template = fs.readFileSync(templatePath, "utf-8");
      systemPrompt =
        "You are generating a Claude Code build prompt for an approved client project. Follow the structure, rules, and conventions in this template exactly:\n\n" +
        template;
    } catch {
      console.log("[PROMPT TEMPLATE READ FAILED]");
    }

    const projectContext = `Project title: ${scope?.title ?? ""}
The problem: ${scope?.the_problem ?? ""}
With it: ${scope?.with_it ?? ""}
Without it: ${scope?.without_it ?? ""}
Green score: ${scope?.green_score ?? ""}
Raw answers:
${answersText}`;

    try {
      const message = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4096,
        system: systemPrompt,
        messages: [
          {
            role: "user",
            content: `Generate a Claude Code build prompt for this project following the template exactly. Stack default is React + Vite + Supabase + Vercel + Anthropic Claude API — only use Next.js if SEO or SSR is explicitly required by the scope. AI model is always Anthropic (claude-sonnet-4-20250514 for user-facing output, claude-haiku-4-5-20251001 for utility tasks) — never OpenAI. Include all companion docs (SETUP.md, schema.sql, CONTEXT.md, README.md, .env.local.example) as numbered steps. Every feature must be fully wired — no skeletons, no TODOs.\n\n${projectContext}`,
          },
        ],
      });

      claudeCodePrompt =
        message.content[0].type === "text" ? message.content[0].text.trim() : null;
    } catch {
      console.error("[PROMPT GENERATION FAILED]");
      claudeCodePrompt = null;
    }

    try {
      const readmeMessage = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4096,
        system:
          "You are generating a project README for a new client app repository. Follow the README.md section in the claude-code-prompt-template.md exactly for structure and content. The README must reflect the stack decision rules in the template — React + Vite is the default unless SSR or SEO is explicitly required. AI model is Anthropic Claude (claude-sonnet-4-20250514 / claude-haiku-4-5-20251001), never OpenAI. Here is the full template:\n\n" +
          template,
        messages: [
          {
            role: "user",
            content: `Generate the project README for this app following the README.md format in the template exactly. Default to React + Vite stack unless the scope explicitly requires Next.js. Use Anthropic Claude for AI, not OpenAI. Do not invent env vars or file paths not implied by the scope.\n\nFor the ## Questions to Resolve section: write a numbered list of every question Drew needs to answer before or during the build session. Derive these from the scope, stack, integrations, and answers — ask about credentials, existing tools, accounts, data sources, compliance requirements, and anything the scope implies but doesn't specify. Always include: (1) GitHub repo URL, (2) Supabase project URL, (3) Vercel project URL. Add 5–10 additional questions specific to this project and its integrations.\n\n${projectContext}`,
          },
        ],
      });

      projectReadme =
        readmeMessage.content[0].type === "text"
          ? readmeMessage.content[0].text.trim()
          : null;
    } catch {
      console.error("[README GENERATION FAILED]");
      projectReadme = null;
    }

    if (claudeCodePrompt || projectReadme) {
      await supabase
        .from("projects")
        .update({
          ...(claudeCodePrompt !== null ? { claude_code_prompt: claudeCodePrompt } : {}),
          ...(projectReadme !== null ? { project_readme: projectReadme } : {}),
        })
        .eq("id", projectId);
    }
  }

  return NextResponse.json(
    { ok: true, demo_url: demoUrl, claude_code_prompt: claudeCodePrompt, project_readme: projectReadme },
    { status: 200 }
  );
}

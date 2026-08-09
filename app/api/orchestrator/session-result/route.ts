import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

type OpenQuestionInput = {
  question: string;
  suggested_options?: string[];
  answer: string | null;
};

type KbDraftInput = {
  title?: string;
  problem_solved?: string;
  tags?: string[];
  tech_stack?: string[];
  artifact_location?: string;
};

type ReviewInput = {
  kind: "consolidated_review" | "production_risk_flag" | "kb_entry_draft" | "build_result";
  summary: string;
  open_questions?: OpenQuestionInput[];
  proposed_content?: string;
  // kb_entry_draft only — the structured metadata a promoted knowledge_base_entries row
  // needs beyond proposed_content (which carries the long-form artifact_description). See
  // NOTES.md Session 55.
  kb_draft?: KbDraftInput;
};

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "").trim();

  if (!token || token !== process.env.WST_ORCHESTRATOR_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body = (await req.json()) as {
    session_id?: string;
    status?: string;
    build_prompt?: string;
    pr_url?: string;
    pr_preview_url?: string;
    merged_commit_sha?: string;
    github_run_id?: number;
    review?: ReviewInput;
    // Session 68 — a build session's own self-reported progress, written by
    // wst-orchestrator-runner (its own Session 9) at logical stopping points and sent
    // regardless of final status (done or failed) — a session that finished cleanly just
    // has an unused checkpoint sitting on its row. Stored as-is, no shape validation here;
    // lib/orchestrator-dispatch.ts reads individual fields defensively when building a
    // follow-up dispatch's resume_context.
    checkpoint?: { progress_status?: string; narrative?: string; remaining_work?: string };
    // Session 72 — wst-orchestrator-runner's own Session 10 sums modelUsage[].costUSD
    // from Claude Code's own JSON result and sends it here on every report, regardless of
    // status — a failed session's cost is the whole reason this exists. See
    // ORCHESTRATOR_DESIGN.md §11.
    cost_usd?: number;
    // true/false/null — null means the target repo had no package.json to check at all,
    // distinct from an actual failing check. Never used to override `status` itself; see
    // that same runner session's own reasoning for why in its NOTES.md.
    checks_passed?: boolean | null;
  };

  const {
    session_id,
    status,
    build_prompt,
    pr_url,
    pr_preview_url,
    merged_commit_sha,
    github_run_id,
    review,
    checkpoint,
    cost_usd,
    checks_passed,
  } = body;

  if (!session_id || !status) {
    return NextResponse.json({ error: "session_id and status are required" }, { status: 400 });
  }

  const supabase = getSupabase();

  const sessionUpdate: Record<string, unknown> = {
    status,
    updated_at: new Date().toISOString(),
  };
  if (typeof build_prompt === "string") sessionUpdate.build_prompt = build_prompt;
  if (typeof pr_url === "string") sessionUpdate.pr_url = pr_url;
  if (typeof pr_preview_url === "string") sessionUpdate.pr_preview_url = pr_preview_url;
  if (typeof merged_commit_sha === "string") sessionUpdate.merged_commit_sha = merged_commit_sha;
  if (typeof github_run_id === "number") sessionUpdate.github_run_id = github_run_id;
  if (checkpoint && typeof checkpoint === "object") sessionUpdate.checkpoint = checkpoint;
  if (typeof cost_usd === "number") sessionUpdate.cost_usd = cost_usd;
  if (checks_passed !== undefined) sessionUpdate.checks_passed = checks_passed;
  if (status === "done" || status === "failed") sessionUpdate.completed_at = new Date().toISOString();

  const { error: updateError } = await supabase.from("agent_sessions").update(sessionUpdate).eq("id", session_id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  // Session 71 — closes a real gap found live during a full orchestrator test: three
  // sessions failed on entos-group-website with zero notification anywhere, only
  // discoverable by directly querying agent_sessions or GitHub Actions. Fire-and-forget,
  // same pattern as every other notify-slack call site — a Slack hiccup must never fail
  // this route, which is the one thing standing between a real failure and total silence.
  // See ORCHESTRATOR_DESIGN.md §11.
  if (status === "failed") {
    const { data: sessionRow } = await supabase
      .from("agent_sessions")
      .select("session_type, repo_id, repos(name)")
      .eq("id", session_id)
      .single();

    if (sessionRow?.repo_id) {
      const repoName = (sessionRow.repos as unknown as { name: string } | null)?.name ?? "Unknown repo";
      fetch(new URL("/api/notify-slack", req.nextUrl.origin), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "session_failed",
          repoName,
          repoId: sessionRow.repo_id,
          sessionType: sessionRow.session_type,
        }),
      }).catch(() => {});
    }
  }

  if (review) {
    const { error: reviewError } = await supabase.from("review_items").insert({
      session_id,
      kind: review.kind,
      summary: review.summary,
      open_questions: review.open_questions ?? [],
      proposed_content: review.proposed_content ?? null,
      kb_draft: review.kb_draft ?? null,
      status: "pending",
    });

    if (reviewError) {
      return NextResponse.json({ error: reviewError.message }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true });
}

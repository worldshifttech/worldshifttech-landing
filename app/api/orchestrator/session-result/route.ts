import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

type OpenQuestionInput = {
  question: string;
  suggested_options?: string[];
  answer: string | null;
};

type ReviewInput = {
  kind: "consolidated_review" | "production_risk_flag" | "kb_entry_draft";
  summary: string;
  open_questions?: OpenQuestionInput[];
  proposed_content?: string;
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
  };

  const { session_id, status, build_prompt, pr_url, pr_preview_url, merged_commit_sha, github_run_id, review } =
    body;

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
  if (status === "done" || status === "failed") sessionUpdate.completed_at = new Date().toISOString();

  const { error: updateError } = await supabase.from("agent_sessions").update(sessionUpdate).eq("id", session_id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  if (review) {
    const { error: reviewError } = await supabase.from("review_items").insert({
      session_id,
      kind: review.kind,
      summary: review.summary,
      open_questions: review.open_questions ?? [],
      proposed_content: review.proposed_content ?? null,
      status: "pending",
    });

    if (reviewError) {
      return NextResponse.json({ error: reviewError.message }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true });
}

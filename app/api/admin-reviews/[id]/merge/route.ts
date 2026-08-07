import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { getInstallationToken } from "@/lib/github-app";

const ADMIN_EMAIL = "drew@worldshifttech.com";

async function verifyAdmin(req: NextRequest): Promise<boolean> {
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "").trim();
  if (!token) return false;
  const supabase = getSupabase();
  const { data, error } = await supabase.auth.getUser(token);
  return !error && data.user?.email === ADMIN_EMAIL;
}

// Merges a build session's PR straight from a review card's "Merge to Production"
// button — the one genuinely irreversible action in this whole flow, gated behind the
// same admin auth every other action here uses. Squash merge is a judgment call, not a
// hard requirement: keeps the target repo's main-branch history to one commit per
// session rather than whatever intermediate commits the build session made along the
// way. See NOTES.md Session 53.
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await verifyAdmin(req))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const supabase = getSupabase();

  const { data: reviewItem, error: reviewError } = await supabase
    .from("review_items")
    .select("session_id")
    .eq("id", id)
    .single();

  if (reviewError || !reviewItem) {
    return NextResponse.json({ error: "Review item not found" }, { status: 404 });
  }

  const { data: session, error: sessionError } = await supabase
    .from("agent_sessions")
    .select("repo_id, pr_url")
    .eq("id", reviewItem.session_id)
    .single();

  if (sessionError || !session || !session.pr_url) {
    return NextResponse.json({ error: "No PR URL on this session" }, { status: 400 });
  }

  const { data: repo, error: repoError } = await supabase
    .from("repos")
    .select("github_owner, github_repo, github_app_installation_id")
    .eq("id", session.repo_id)
    .single();

  if (repoError || !repo || !repo.github_app_installation_id) {
    return NextResponse.json({ error: "Repo not found or has no GitHub App installation" }, { status: 400 });
  }

  const prNumber = session.pr_url.split("/").filter(Boolean).pop();
  if (!prNumber || !/^\d+$/.test(prNumber)) {
    return NextResponse.json({ error: `Could not parse a PR number from ${session.pr_url}` }, { status: 500 });
  }

  try {
    const installationToken = await getInstallationToken(repo.github_app_installation_id);

    const mergeRes = await fetch(
      `https://api.github.com/repos/${repo.github_owner}/${repo.github_repo}/pulls/${prNumber}/merge`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${installationToken}`,
          Accept: "application/vnd.github+json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ merge_method: "squash" }),
      }
    );

    const mergeData = await mergeRes.json();

    if (!mergeRes.ok || !mergeData.merged) {
      return NextResponse.json(
        { error: mergeData.message ?? `GitHub merge failed: ${mergeRes.status}` },
        { status: 502 }
      );
    }

    await supabase
      .from("agent_sessions")
      .update({ merged_commit_sha: mergeData.sha ?? null })
      .eq("id", reviewItem.session_id);

    await supabase
      .from("review_items")
      .update({ status: "answered", drew_response: "Merged to production", answered_at: new Date().toISOString() })
      .eq("id", id);

    return NextResponse.json({ ok: true, sha: mergeData.sha ?? null });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Merge failed" }, { status: 500 });
  }
}

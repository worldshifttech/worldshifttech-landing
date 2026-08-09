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

// Fetches a build_result card's actual PR diff on demand (Session 71) — closes a real
// gap: "review" meant reading the card's own summary, since nothing in the dashboard
// showed the actual change without leaving for GitHub. Same GitHub App token-exchange
// pattern as [id]/merge. Fetched lazily on click, not on every card render, to avoid
// spending API calls on cards nobody looks at. See ORCHESTRATOR_DESIGN.md §11.
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    const diffRes = await fetch(
      `https://api.github.com/repos/${repo.github_owner}/${repo.github_repo}/pulls/${prNumber}`,
      {
        headers: {
          Authorization: `Bearer ${installationToken}`,
          Accept: "application/vnd.github.v3.diff",
        },
      }
    );

    if (!diffRes.ok) {
      return NextResponse.json({ error: `GitHub returned ${diffRes.status} fetching the diff` }, { status: 502 });
    }

    const diff = await diffRes.text();
    return NextResponse.json({ diff });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed to fetch diff" }, { status: 500 });
  }
}

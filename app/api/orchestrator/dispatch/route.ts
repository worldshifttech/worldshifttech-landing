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

export async function POST(req: NextRequest) {
  if (!(await verifyAdmin(req))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { repo_id, session_type, brief } = (await req.json()) as {
    repo_id?: string;
    session_type?: "planning" | "build";
    brief?: string;
  };

  if (!repo_id || !session_type || !brief) {
    return NextResponse.json({ error: "repo_id, session_type, and brief are required" }, { status: 400 });
  }

  const runnerRepo = process.env.WST_ORCHESTRATOR_RUNNER_REPO;
  if (!runnerRepo) {
    return NextResponse.json({ error: "WST_ORCHESTRATOR_RUNNER_REPO is not set" }, { status: 500 });
  }

  const supabase = getSupabase();

  const { data: repo, error: repoError } = await supabase
    .from("repos")
    .select("github_owner, github_repo, github_app_installation_id")
    .eq("id", repo_id)
    .single();

  if (repoError || !repo) {
    return NextResponse.json({ error: "Repo not found" }, { status: 404 });
  }

  if (!repo.github_app_installation_id) {
    return NextResponse.json(
      { error: "This repo has no GitHub App Installation ID set — add it on the repo's detail page first" },
      { status: 400 }
    );
  }

  const { data: session, error: sessionError } = await supabase
    .from("agent_sessions")
    .insert({
      repo_id,
      session_type,
      status: "running",
      brief,
    })
    .select("id")
    .single();

  if (sessionError || !session) {
    return NextResponse.json({ error: sessionError?.message ?? "Could not create session" }, { status: 500 });
  }

  try {
    const installationToken = await getInstallationToken(repo.github_app_installation_id);

    const dispatchRes = await fetch(`https://api.github.com/repos/${runnerRepo}/dispatches`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${installationToken}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        event_type: "wst-session",
        client_payload: {
          repo_id,
          session_id: session.id,
          session_type,
          brief,
          github_owner: repo.github_owner,
          github_repo: repo.github_repo,
          resume_context: null,
        },
      }),
    });

    if (!dispatchRes.ok) {
      const text = await dispatchRes.text();
      await supabase.from("agent_sessions").update({ status: "failed" }).eq("id", session.id);
      return NextResponse.json({ error: `GitHub dispatch failed: ${dispatchRes.status} ${text}` }, { status: 502 });
    }

    if (session_type === "planning") {
      await supabase
        .from("repos")
        .update({ last_planning_session_at: new Date().toISOString() })
        .eq("id", repo_id);
    }
  } catch (err) {
    await supabase.from("agent_sessions").update({ status: "failed" }).eq("id", session.id);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Dispatch failed" },
      { status: 500 }
    );
  }

  return NextResponse.json({ session_id: session.id });
}

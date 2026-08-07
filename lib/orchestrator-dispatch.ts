// Fires an orchestrator session dispatch for one repo — the same logic whether it's
// triggered by Drew clicking "Run Planning Session" in the admin UI or by the Session 52
// scheduler-tick cron hitting an automated repo. Extracted here specifically so those two
// callers can't drift apart. See NOTES.md Session 52.

import { getSupabase } from "@/lib/supabase";
import { getInstallationToken } from "@/lib/github-app";

export type DispatchResult =
  | { ok: true; sessionId: string }
  | { ok: false; error: string; status: number };

export async function dispatchOrchestratorSession({
  repoId,
  sessionType,
  brief,
}: {
  repoId: string;
  sessionType: "planning" | "build";
  brief: string;
}): Promise<DispatchResult> {
  const runnerRepo = process.env.WST_ORCHESTRATOR_RUNNER_REPO;
  if (!runnerRepo) {
    return { ok: false, error: "WST_ORCHESTRATOR_RUNNER_REPO is not set", status: 500 };
  }

  const supabase = getSupabase();

  const { data: repo, error: repoError } = await supabase
    .from("repos")
    .select("github_owner, github_repo, github_app_installation_id")
    .eq("id", repoId)
    .single();

  if (repoError || !repo) {
    return { ok: false, error: "Repo not found", status: 404 };
  }

  if (!repo.github_app_installation_id) {
    return {
      ok: false,
      error: "This repo has no GitHub App Installation ID set — add it on the repo's detail page first",
      status: 400,
    };
  }

  const { data: session, error: sessionError } = await supabase
    .from("agent_sessions")
    .insert({
      repo_id: repoId,
      session_type: sessionType,
      status: "running",
      brief,
    })
    .select("id")
    .single();

  if (sessionError || !session) {
    return { ok: false, error: sessionError?.message ?? "Could not create session", status: 500 };
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
          repo_id: repoId,
          session_id: session.id,
          session_type: sessionType,
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
      return { ok: false, error: `GitHub dispatch failed: ${dispatchRes.status} ${text}`, status: 502 };
    }

    if (sessionType === "planning") {
      await supabase
        .from("repos")
        .update({ last_planning_session_at: new Date().toISOString() })
        .eq("id", repoId);
    }
  } catch (err) {
    await supabase.from("agent_sessions").update({ status: "failed" }).eq("id", session.id);
    return { ok: false, error: err instanceof Error ? err.message : "Dispatch failed", status: 500 };
  }

  return { ok: true, sessionId: session.id };
}

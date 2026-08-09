// Fires an orchestrator session dispatch for one repo — the same logic whether it's
// triggered by Drew clicking "Run Planning Session" in the admin UI or by the Session 52
// scheduler-tick cron hitting an automated repo. Extracted here specifically so those two
// callers can't drift apart. See NOTES.md Session 52.

import { getSupabase } from "@/lib/supabase";
import { getInstallationToken } from "@/lib/github-app";
import { searchKnowledgeBase, formatKnowledgeForPrompt } from "@/lib/knowledge-base";

export type DispatchResult =
  | { ok: true; sessionId: string }
  | { ok: false; error: string; status: number };

export async function dispatchOrchestratorSession({
  repoId,
  sessionType,
  brief,
  sourceReviewItemId,
  resumeFromSessionId,
  contextFiles,
}: {
  repoId: string;
  sessionType: "planning" | "build";
  brief: string;
  sourceReviewItemId?: string;
  // Session 68 — when set, this dispatch is a retry of a specific prior session. Threads
  // that prior session's self-reported checkpoint (if it wrote one before failing) into
  // this dispatch's resume_context, so the build job can pick up where it left off instead
  // of restarting from scratch. Never hard-fails a dispatch over a missing/mismatched id —
  // worst case is the same as today, resume_context: null. See NOTES.md.
  resumeFromSessionId?: string;
  // Session 80 — files/screenshots an admin attached as extra context before dispatching.
  // Control-plane half only: this signs read URLs and threads them into the dispatch
  // payload, but nothing in wst-orchestrator-runner reads them into a run yet. See
  // ORCHESTRATOR_DESIGN.md §4.
  contextFiles?: { file_name: string; storage_path: string; content_type?: string }[];
}): Promise<DispatchResult> {
  const runnerRepo = process.env.WST_ORCHESTRATOR_RUNNER_REPO;
  if (!runnerRepo) {
    return { ok: false, error: "WST_ORCHESTRATOR_RUNNER_REPO is not set", status: 500 };
  }

  const supabase = getSupabase();

  const { data: repo, error: repoError } = await supabase
    .from("repos")
    .select("github_owner, github_repo, github_app_installation_id, system_group")
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
      ...(sourceReviewItemId ? { source_review_item_id: sourceReviewItemId } : {}),
    })
    .select("id")
    .single();

  if (sessionError || !session) {
    return { ok: false, error: sessionError?.message ?? "Could not create session", status: 500 };
  }

  try {
    const installationToken = await getInstallationToken(repo.github_app_installation_id);

    // Retrieve step (Phase 3): only for planning — a build session executes an
    // already-fully-specified prompt, it doesn't need a second injection. Best-effort,
    // via lib/knowledge-base.ts which fails open to [] / null on any Voyage/Supabase
    // hiccup rather than blocking dispatch. Surfaced entries count as "used" for
    // reuse_count purposes the moment they're offered to an agent, not only once a human
    // confirms they were actually applied — a cheap, good-enough usage signal.
    let knowledgeContext: string | null = null;
    if (sessionType === "planning") {
      const matches = await searchKnowledgeBase(brief);
      knowledgeContext = formatKnowledgeForPrompt(matches);
      if (matches.length > 0) {
        // Best-effort counter bump in its own try/catch, not the outer one — this is a
        // serverless function, so a fire-and-forget call risks being cut off before it
        // completes once the response goes out; awaiting it here, but a failure must
        // never mark the whole session failed over a reuse_count hiccup.
        try {
          const { error } = await supabase.rpc("increment_kb_reuse_count", {
            entry_ids: matches.map((m) => m.id),
          });
          if (error) console.error("[orchestrator-dispatch] reuse_count bump failed:", error.message);
        } catch (err) {
          console.error("[orchestrator-dispatch] reuse_count bump failed:", err);
        }
      }
    }

    // Resume step (Session 68): look up the prior session's own pr_url + checkpoint, scoped
    // to this same repo so a stray/mismatched id can never leak another repo's state into
    // this dispatch. Fails open to null on any lookup issue, same posture as the knowledge
    // base retrieve step above — a resume is a nice-to-have, never a reason to block a
    // dispatch Drew explicitly clicked.
    let resumeContext: Record<string, unknown> | null = null;
    if (resumeFromSessionId) {
      try {
        const { data: priorSession } = await supabase
          .from("agent_sessions")
          .select("repo_id, pr_url, checkpoint")
          .eq("id", resumeFromSessionId)
          .single();

        if (priorSession && priorSession.repo_id === repoId && priorSession.checkpoint) {
          const checkpoint = priorSession.checkpoint as {
            progress_status?: string;
            narrative?: string;
            remaining_work?: string;
          };
          resumeContext = {
            pr_url: priorSession.pr_url ?? null,
            progress_status: checkpoint.progress_status ?? null,
            narrative: checkpoint.narrative ?? null,
            remaining_work: checkpoint.remaining_work ?? null,
          };
        }
      } catch (err) {
        console.error("[orchestrator-dispatch] resume lookup failed:", err);
      }
    }

    // Context files (Session 80): an admin can attach files/screenshots as extra context
    // before dispatching. Best-effort per file, same fail-open posture as the reuse_count
    // bump and the resume lookup above — a signing hiccup on one file must never block the
    // dispatch itself. Control-plane half only: nothing downloads these URLs into the
    // runner's checkout yet, see ORCHESTRATOR_DESIGN.md §4.
    let sessionContextFiles: { file_name: string; url: string; content_type: string | null }[] | null = null;
    if (contextFiles && contextFiles.length > 0) {
      const signed: { file_name: string; url: string; content_type: string | null }[] = [];
      for (const file of contextFiles) {
        try {
          const { data: signedUrlData, error: signError } = await supabase.storage
            .from("session-context-files")
            .createSignedUrl(file.storage_path, 60 * 60 * 24);
          if (signError || !signedUrlData) {
            console.error("[orchestrator-dispatch] context file sign failed:", signError?.message);
            continue;
          }

          const { error: insertError } = await supabase.from("agent_session_context_files").insert({
            session_id: session.id,
            file_name: file.file_name,
            storage_path: file.storage_path,
            content_type: file.content_type ?? null,
          });
          if (insertError) {
            console.error("[orchestrator-dispatch] context file insert failed:", insertError.message);
          }

          signed.push({
            file_name: file.file_name,
            url: signedUrlData.signedUrl,
            content_type: file.content_type ?? null,
          });
        } catch (err) {
          console.error("[orchestrator-dispatch] context file handling failed:", err);
        }
      }
      sessionContextFiles = signed.length > 0 ? signed : null;
    }

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
          resume_context: resumeContext,
          knowledge_context: knowledgeContext,
          context_files: sessionContextFiles,
          // Purely a display label for the runner's run-name title — no dispatch
          // behavior depends on it. null when this repo has no group set.
          system_group: repo.system_group ?? null,
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

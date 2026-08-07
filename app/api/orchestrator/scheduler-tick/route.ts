import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { dispatchOrchestratorSession } from "@/lib/orchestrator-dispatch";

// Vercel Cron hits this on a schedule (see vercel.json). Vercel automatically sends
// Authorization: Bearer $CRON_SECRET on cron-triggered requests when that env var is set
// on the project — this is the documented way to confirm a hit on this route actually
// came from Vercel's own scheduler, not an arbitrary public request (the route URL itself
// is otherwise unauthenticated and guessable). See NOTES.md Session 52.
function verifyCron(req: NextRequest): boolean {
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "").trim();
  return Boolean(token) && token === process.env.CRON_SECRET;
}

// Generic brief for a repo with no human-specified scope this tick. Deliberately
// discourages manufacturing busywork — an autonomous session that invents a task every
// single tick just to have something to report would be worse than one that sometimes
// says "nothing worth doing right now."
const SCHEDULED_PLANNING_BRIEF =
  "Routine scheduled check-in — no specific brief given. Review recent activity, " +
  "README/NOTES for open items, and any signals worth planning around. If something " +
  "concrete and valuable is scoped, produce a full build prompt. If nothing rises to " +
  "that bar right now, say so plainly in the summary rather than manufacturing busywork.";

type TickResult = {
  repo_id: string;
  repo_name: string;
  action: "dispatched" | "skipped";
  reason?: string;
  session_id?: string;
};

export async function GET(req: NextRequest) {
  if (!verifyCron(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const supabase = getSupabase();

  const { data: settings } = await supabase
    .from("orchestrator_settings")
    .select("automation_paused")
    .limit(1)
    .maybeSingle();

  if (settings?.automation_paused) {
    return NextResponse.json({ paused: true, results: [] });
  }

  // Per-repo pause is automation_enabled itself (see RepoDetailClient.tsx's own note on
  // that field) — no separate per-repo pause column needed. planning_interval_hours null
  // means "never auto-run," same as the UI's own "Blank = never" placeholder implies.
  const { data: repos, error: reposError } = await supabase
    .from("repos")
    .select("id, name, planning_interval_hours, last_planning_session_at")
    .eq("automation_enabled", true)
    .not("planning_interval_hours", "is", null);

  if (reposError) {
    return NextResponse.json({ error: reposError.message }, { status: 500 });
  }

  const results: TickResult[] = [];

  for (const repo of repos ?? []) {
    const { data: openSessions } = await supabase
      .from("agent_sessions")
      .select("id")
      .eq("repo_id", repo.id)
      .not("status", "in", "(done,failed)")
      .limit(1);

    if (openSessions && openSessions.length > 0) {
      results.push({ repo_id: repo.id, repo_name: repo.name, action: "skipped", reason: "session already open" });
      continue;
    }

    const intervalMs = (repo.planning_interval_hours as number) * 3600 * 1000;
    const dueAt = repo.last_planning_session_at
      ? new Date(repo.last_planning_session_at as string).getTime() + intervalMs
      : 0; // never run before — due immediately

    if (Date.now() < dueAt) {
      results.push({ repo_id: repo.id, repo_name: repo.name, action: "skipped", reason: "not due yet" });
      continue;
    }

    const dispatch = await dispatchOrchestratorSession({
      repoId: repo.id,
      sessionType: "planning",
      brief: SCHEDULED_PLANNING_BRIEF,
    });

    results.push(
      dispatch.ok
        ? { repo_id: repo.id, repo_name: repo.name, action: "dispatched", session_id: dispatch.sessionId }
        : { repo_id: repo.id, repo_name: repo.name, action: "skipped", reason: dispatch.error }
    );
  }

  return NextResponse.json({ paused: false, results });
}

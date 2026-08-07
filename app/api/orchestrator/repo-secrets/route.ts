import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

// Built this session (Session 51) but not yet called from wst-orchestrator-runner — a
// future session there wires a workflow step to fetch this before checking out a target
// repo, so build sessions can resolve feedback tickets using that repo's own scripts, not
// just the admin UI's manual read/resolve path. Same bearer-secret pattern as
// session-result (called by the runner, not the browser) — this is the one route in the
// system whose entire job is returning a raw credential, so it exists deliberately, not
// as an oversight of the "never echo secret values" convention elsewhere.
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "").trim();

  if (!token || token !== process.env.WST_ORCHESTRATOR_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const repoId = req.nextUrl.searchParams.get("repo_id");
  if (!repoId) {
    return NextResponse.json({ error: "repo_id is required" }, { status: 400 });
  }

  const supabase = getSupabase();

  const { data: repo, error } = await supabase
    .from("repos")
    .select("target_supabase_url, target_supabase_service_role_key")
    .eq("id", repoId)
    .single();

  if (error || !repo || !repo.target_supabase_url || !repo.target_supabase_service_role_key) {
    return NextResponse.json({ error: "No target credentials configured for this repo" }, { status: 404 });
  }

  return NextResponse.json({
    target_supabase_url: repo.target_supabase_url,
    target_supabase_service_role_key: repo.target_supabase_service_role_key,
  });
}

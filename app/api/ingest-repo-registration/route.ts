import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

// WST Orchestrator Phase 5 — closes the gap where new wst-build-manager projects
// previously had to be added to the fleet by hand. Same shared-secret POST shape as
// /api/ingest-build-cost (auth pattern, not endpoint), called from bootstrap.js once a
// new project's GitHub repo + Vercel project exist. See NOTES.md.
export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "").trim();

  if (!token || token !== process.env.WST_INGEST_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body = (await req.json()) as {
    name?: string;
    githubOwner?: string;
    githubRepo?: string;
    localPath?: string;
    vercelProjectId?: string;
    frameworkType?: string;
    authConvention?: string;
  };

  const { name, githubOwner, githubRepo } = body;
  if (!name || !githubOwner || !githubRepo) {
    return NextResponse.json({ error: "name, githubOwner, and githubRepo are required" }, { status: 400 });
  }

  const supabase = getSupabase();

  // repos.github_repo has no unique constraint at the DB layer (see Session 48's own
  // migration comment) — this check is what keeps a retried bootstrap.js run from
  // duplicating the row, since bootstrap.js's own registration step is deliberately
  // safe to call more than once for the same project.
  const { data: existing, error: lookupError } = await supabase
    .from("repos")
    .select("id")
    .eq("github_repo", githubRepo)
    .maybeSingle();

  if (lookupError) {
    return NextResponse.json({ error: lookupError.message }, { status: 500 });
  }

  if (existing) {
    return NextResponse.json({ success: true, alreadyRegistered: true, id: existing.id });
  }

  const { data: inserted, error: insertError } = await supabase
    .from("repos")
    .insert({
      name,
      local_path: body.localPath ?? null,
      github_owner: githubOwner,
      github_repo: githubRepo,
      vercel_project_id: body.vercelProjectId ?? null,
      framework_type: body.frameworkType ?? "vite",
      auth_convention: body.authConvention ?? "shared_secret",
    })
    .select("id")
    .single();

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, alreadyRegistered: false, id: inserted.id });
}

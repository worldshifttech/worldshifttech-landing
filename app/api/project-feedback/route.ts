import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { verifyClientAccess, verifyTurnstile } from "@/lib/project-access";

// Client-facing feedback submission — a text answer or note tied to a project,
// optionally scoped to a specific milestone's "action needed" item. Mirrors
// project-files' access pattern (Turnstile, then password/public project check)
// since both are unauthenticated client actions on a project.
export async function POST(req: NextRequest) {
  const body = (await req.json()) as {
    projectId?: string;
    slug?: string;
    milestoneId?: string;
    message?: string;
    turnstileToken?: string;
    attachedFileId?: string;
  };

  const { projectId, slug, milestoneId, message, turnstileToken, attachedFileId } = body;

  if (!projectId || !slug || !message) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (!message.trim()) {
    return NextResponse.json({ error: "Message cannot be empty" }, { status: 400 });
  }

  const supabase = getSupabase();

  // Session 78 — a ticket can now carry one attached file, uploaded just before this call
  // through the same signed-URL flow /api/project-files already gates (which verifies its
  // own Turnstile token). Confirmed here to actually belong to this project, be a client
  // upload, be recent (< 5 min — this is a one-shot exemption tied to a just-completed
  // upload, not a standing bypass), and not already linked to some other ticket (so a file
  // can't be reused across unrelated submissions to dodge the check below more than once).
  let verifiedAttachedFileId: string | null = null;
  if (attachedFileId) {
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const { data: attachedFile } = await supabase
      .from("project_files")
      .select("id")
      .eq("id", attachedFileId)
      .eq("project_id", projectId)
      .eq("uploaded_by", "client")
      .gte("created_at", fiveMinAgo)
      .single();

    if (attachedFile) {
      const { data: alreadyLinked } = await supabase
        .from("project_feedback")
        .select("id")
        .eq("attached_file_id", attachedFileId)
        .limit(1);
      if (!alreadyLinked || alreadyLinked.length === 0) {
        verifiedAttachedFileId = attachedFile.id;
      }
    }
  }

  // Cloudflare Turnstile tokens are single-use. When a file was attached, the browser
  // already spent this exact token verifying /api/project-files/upload-url a moment earlier
  // in the same submission — re-verifying it here would always fail with "Bot detected,"
  // which is a real bug this fixes, not a hypothetical one (caught live testing this
  // session). A verified attachment above is sufficient proof this request is part of that
  // same already-gated flow; a text-only submission still verifies normally.
  if (!verifiedAttachedFileId) {
    if (!(await verifyTurnstile(turnstileToken ?? ""))) {
      return NextResponse.json({ error: "Bot detected" }, { status: 403 });
    }
  }

  if (!(await verifyClientAccess(req, slug))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data, error } = await supabase
    .from("project_feedback")
    .insert({
      project_id: projectId,
      milestone_id: milestoneId ?? null,
      message: message.trim(),
      status: "new",
      attached_file_id: verifiedAttachedFileId,
    })
    .select("id")
    .single();

  if (error || !data) {
    return NextResponse.json({ error: error?.message ?? "Could not submit feedback" }, { status: 500 });
  }

  const { data: project } = await supabase.from("projects").select("title").eq("id", projectId).single();
  let milestoneTitle: string | null = null;
  if (milestoneId) {
    const { data: milestone } = await supabase
      .from("project_milestones")
      .select("title")
      .eq("id", milestoneId)
      .single();
    milestoneTitle = milestone?.title ?? null;
  }
  fetch(new URL("/api/notify-slack", req.nextUrl.origin), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      type: "milestone_response",
      projectId,
      projectTitle: project?.title ?? "Untitled",
      milestoneTitle,
      message: message.trim(),
    }),
  }).catch(() => {});

  return NextResponse.json({ ok: true, id: data.id });
}

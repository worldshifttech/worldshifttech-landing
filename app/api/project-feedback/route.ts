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

  if (!(await verifyTurnstile(turnstileToken ?? ""))) {
    return NextResponse.json({ error: "Bot detected" }, { status: 403 });
  }

  if (!(await verifyClientAccess(req, slug))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const supabase = getSupabase();

  // Session 78 — a ticket can now carry one attached file (uploaded just before this call,
  // same signed-URL flow /api/project-files already gates). Confirm it actually belongs to
  // this project before linking it — cheap defense in depth; the display side already only
  // resolves a download URL for files matching the current project regardless.
  let verifiedAttachedFileId: string | null = null;
  if (attachedFileId) {
    const { data: attachedFile } = await supabase
      .from("project_files")
      .select("id")
      .eq("id", attachedFileId)
      .eq("project_id", projectId)
      .single();
    verifiedAttachedFileId = attachedFile?.id ?? null;
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

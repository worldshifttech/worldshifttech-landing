import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { verifyClientAccess } from "@/lib/project-access";

// Client-facing edit/delete for an open item they submitted. Same dual-actor pattern as
// app/api/project-files/[id]/route.ts's client-delete branch: no per-person ownership check
// (there's no client-account system anywhere in this app), just "does the row belong to
// this project and does the requester have valid access to it" — the same trust boundary
// every project_feedback row already sits behind, since there's no admin-side writer for
// this table at all, only the resolve-only PATCH in admin-project-feedback/[id].
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = (await req.json()) as { slug?: string; message?: string };
  const { slug, message } = body;

  if (!slug || !message) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  if (!message.trim()) {
    return NextResponse.json({ error: "Message cannot be empty" }, { status: 400 });
  }

  if (!(await verifyClientAccess(req, slug))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const supabase = getSupabase();
  const { data: existing } = await supabase
    .from("project_feedback")
    .select("status")
    .eq("id", id)
    .single();

  if (!existing) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }
  if (existing.status === "resolved") {
    return NextResponse.json({ error: "This item has already been resolved" }, { status: 409 });
  }

  // An edit is new information Drew hasn't seen the updated form of yet — bump a
  // previously-read item back to "new" so it doesn't sit silently in a seen state.
  const nextStatus = existing.status === "read" ? "new" : existing.status;

  const { error } = await supabase
    .from("project_feedback")
    .update({ message: message.trim(), updated_at: new Date().toISOString(), status: nextStatus })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const slug = body?.slug as string | undefined;

  if (!slug) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (!(await verifyClientAccess(req, slug))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const supabase = getSupabase();
  const { data: existing } = await supabase
    .from("project_feedback")
    .select("status, message, project_id, milestone_id")
    .eq("id", id)
    .single();

  if (!existing) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }
  if (existing.status === "resolved") {
    return NextResponse.json({ error: "This item has already been resolved" }, { status: 409 });
  }

  // Files linked via attached_file_id or feedback_id are NOT deleted — they simply become
  // unlinked (ON DELETE SET NULL), matching the asymmetric precedent already established
  // for deleting a milestone.
  const { error } = await supabase.from("project_feedback").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data: project } = await supabase.from("projects").select("title").eq("id", existing.project_id).single();
  let milestoneTitle: string | null = null;
  if (existing.milestone_id) {
    const { data: milestone } = await supabase
      .from("project_milestones")
      .select("title")
      .eq("id", existing.milestone_id)
      .single();
    milestoneTitle = milestone?.title ?? null;
  }
  fetch(new URL("/api/notify-slack", req.nextUrl.origin), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      type: "feedback_deleted",
      projectId: existing.project_id,
      projectTitle: project?.title ?? "Untitled",
      milestoneTitle,
      message: existing.message,
    }),
  }).catch(() => {});

  return NextResponse.json({ ok: true });
}

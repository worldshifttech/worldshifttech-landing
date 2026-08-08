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
  };

  const { projectId, slug, milestoneId, message, turnstileToken } = body;

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
  const { data, error } = await supabase
    .from("project_feedback")
    .insert({
      project_id: projectId,
      milestone_id: milestoneId ?? null,
      message: message.trim(),
      status: "new",
    })
    .select("id")
    .single();

  if (error || !data) {
    return NextResponse.json({ error: error?.message ?? "Could not submit feedback" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, id: data.id });
}

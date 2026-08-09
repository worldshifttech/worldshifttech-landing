import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

const ADMIN_EMAIL = "drew@worldshifttech.com";

async function verifyAdmin(req: NextRequest): Promise<boolean> {
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "").trim();
  if (!token) return false;
  const supabase = getSupabase();
  const { data, error } = await supabase.auth.getUser(token);
  return !error && data.user?.email === ADMIN_EMAIL;
}

type OpenQuestionInput = {
  question: string;
  suggested_options?: string[];
  answer: string;
};

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await verifyAdmin(req))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = (await req.json()) as {
    open_questions?: OpenQuestionInput[];
    drew_response?: string;
    proposed_content?: string;
    // Session 68 — the manual archive state. Anything other than "archived" (including
    // absent, every pre-existing caller's shape) keeps today's only behavior. Archiving
    // stamps archived_at and leaves answered_at untouched; un-archiving (status: "answered"
    // sent explicitly on an already-archived card) re-stamps answered_at, same as any other
    // answer — harmless, just reads as "last touched" rather than "originally answered".
    status?: "answered" | "archived";
  };

  const supabase = getSupabase();

  const updateFields: Record<string, unknown> =
    body.status === "archived"
      ? { status: "archived", archived_at: new Date().toISOString() }
      : { status: "answered", answered_at: new Date().toISOString() };

  if (Array.isArray(body.open_questions)) {
    updateFields.open_questions = body.open_questions;
  }
  if (typeof body.drew_response === "string") {
    updateFields.drew_response = body.drew_response || null;
  }
  if (typeof body.proposed_content === "string") {
    updateFields.proposed_content = body.proposed_content;
  }

  const { error } = await supabase.from("review_items").update(updateFields).eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

// Removes a review card outright — for stray/test dispatches that don't belong in the
// inbox at all, as opposed to PATCH's "answered" path for real ones. Only deletes the
// review_items row, not its parent agent_sessions row (that stays as the historical
// record that a dispatch happened, same reasoning as leaving stuck-running sessions
// alone elsewhere in this system — see NOTES.md Session 50).
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await verifyAdmin(req))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const supabase = getSupabase();

  const { error } = await supabase.from("review_items").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

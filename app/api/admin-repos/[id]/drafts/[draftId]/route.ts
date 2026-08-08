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

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string; draftId: string }> }) {
  if (!(await verifyAdmin(req))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id, draftId } = await params;
  const supabase = getSupabase();

  // Scoped by both repo_id and id — a draft ID leaking or being guessed can't delete a
  // draft belonging to a different repo than the page it was deleted from.
  const { error } = await supabase.from("session_drafts").delete().eq("id", draftId).eq("repo_id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

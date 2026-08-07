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

// Deliberately separate from the general PATCH /api/admin-repos/[id] route, and
// write-only — this is the only route that ever writes target_supabase_service_role_key,
// and no route ever returns it. Keeping it out of the general repo-fields PATCH means a
// future edit to that route (which handles a dozen unrelated fields) can't accidentally
// sweep this value into some other response. See NOTES.md Session 51.
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await verifyAdmin(req))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = (await req.json()) as {
    target_supabase_url?: string;
    target_supabase_service_role_key?: string;
  };

  const supabase = getSupabase();
  const updateFields: Record<string, unknown> = {};

  // target_supabase_url isn't a secret the same way the key is (it's a project
  // subdomain, not a credential) — updated whenever a value is sent, blank clears it.
  if (typeof body.target_supabase_url === "string") {
    updateFields.target_supabase_url = body.target_supabase_url || null;
  }

  // The key only ever gets overwritten when a genuinely new, non-empty value is sent.
  // The UI never re-populates this field with the stored value (see
  // RepoDetailClient.tsx), so an empty string here means "left blank," not "clear it" —
  // there's no way to intentionally clear the key through this route, only replace it.
  if (typeof body.target_supabase_service_role_key === "string" && body.target_supabase_service_role_key.trim()) {
    updateFields.target_supabase_service_role_key = body.target_supabase_service_role_key.trim();
  }

  if (Object.keys(updateFields).length === 0) {
    return NextResponse.json({ ok: true });
  }

  const { error } = await supabase.from("repos").update(updateFields).eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

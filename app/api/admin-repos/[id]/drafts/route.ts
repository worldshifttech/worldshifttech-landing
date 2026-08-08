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

// Saves a not-yet-dispatched planning or build brief against this repo — the real
// feature Session 63 built after Session 62's stopgap (a hardcoded default textarea
// value) turned out not to actually satisfy "a ticket in the app I can look at later."
// See NOTES.md Session 63.
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await verifyAdmin(req))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = (await req.json()) as {
    session_type?: string;
    title?: string;
    brief?: string;
  };

  if (body.session_type !== "planning" && body.session_type !== "build") {
    return NextResponse.json({ error: "session_type must be 'planning' or 'build'" }, { status: 400 });
  }
  if (!body.brief?.trim()) {
    return NextResponse.json({ error: "brief is required" }, { status: 400 });
  }

  // A title makes the draft list scannable, but requiring Drew to type one before every
  // save is friction a quick "save this before I lose it" click shouldn't have — falls
  // back to a truncated snippet of the brief itself.
  const title = body.title?.trim() || `${body.brief.trim().slice(0, 60)}${body.brief.trim().length > 60 ? "…" : ""}`;

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("session_drafts")
    .insert({ repo_id: id, session_type: body.session_type, title, brief: body.brief })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ draft: data });
}

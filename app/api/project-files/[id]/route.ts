import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { verifyClientAccess } from "@/lib/project-access";
import { BUCKET } from "@/lib/project-files";

const ADMIN_EMAIL = "drew@worldshifttech.com";

async function verifyAdmin(req: NextRequest): Promise<boolean> {
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "").trim();
  if (!token) return false;
  const supabase = getSupabase();
  const { data, error } = await supabase.auth.getUser(token);
  return !error && data.user?.email === ADMIN_EMAIL;
}

// Admin can delete any file. A client can only delete their own uploads (never a file
// Drew sent down to them) and only with valid access to the project it belongs to —
// the request body carries `slug` for that check since a client has no bearer token.
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = getSupabase();

  const { data: file } = await supabase
    .from("project_files")
    .select("storage_path, uploaded_by")
    .eq("id", id)
    .single();
  if (!file) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  if (!(await verifyAdmin(req))) {
    const body = await req.json().catch(() => ({}));
    const slug = body?.slug as string | undefined;
    if (file.uploaded_by !== "client" || !slug || !(await verifyClientAccess(req, slug))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  await supabase.storage.from(BUCKET).remove([file.storage_path]);

  const { error } = await supabase.from("project_files").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

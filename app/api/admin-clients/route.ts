import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { hashPassword } from "@/lib/project-access";

const ADMIN_EMAIL = "drew@worldshifttech.com";

async function verifyAdmin(req: NextRequest): Promise<boolean> {
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "").trim();
  if (!token) return false;
  const supabase = getSupabase();
  const { data, error } = await supabase.auth.getUser(token);
  return !error && data.user?.email === ADMIN_EMAIL;
}

// Creates a client hub (worldshifttech.com/clients/{slug}) — the entity multiple projects
// can now be scoped under. Same admin-auth + hashPassword pattern as /api/admin-projects.
export async function POST(req: NextRequest) {
  if (!(await verifyAdmin(req))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { name, slug, access_mode, password } = (await req.json()) as {
    name?: string;
    slug?: string;
    access_mode?: string;
    password?: string;
  };

  if (!name || !slug) {
    return NextResponse.json({ error: "Name and slug are required" }, { status: 400 });
  }

  const mode = access_mode === "password" ? "password" : "public";

  if (mode === "password" && !password) {
    return NextResponse.json({ error: "Password required for password-protected access" }, { status: 400 });
  }

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("client_hubs")
    .insert({
      name,
      slug,
      access_mode: mode,
      access_password_hash: mode === "password" ? hashPassword(password!) : null,
    })
    .select("id, slug, name, access_mode")
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: error?.message ?? "Could not create client — slug may already be in use" },
      { status: 400 }
    );
  }

  return NextResponse.json(data);
}

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

export async function POST(req: NextRequest) {
  if (!(await verifyAdmin(req))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { title, client_name, slug, access_mode, password } = (await req.json()) as {
    title?: string;
    client_name?: string;
    slug?: string;
    access_mode?: string;
    password?: string;
  };

  if (!title || !slug) {
    return NextResponse.json({ error: "Title and slug are required" }, { status: 400 });
  }

  const mode = access_mode === "public" ? "public" : "password";

  if (mode === "password" && !password) {
    return NextResponse.json({ error: "Password required for password-protected access" }, { status: 400 });
  }

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("projects")
    .insert({
      title,
      client_name: client_name || null,
      slug,
      access_mode: mode,
      access_password_hash: mode === "password" ? hashPassword(password!) : null,
    })
    .select("id")
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: error?.message ?? "Could not create project — slug may already be in use" },
      { status: 400 }
    );
  }

  return NextResponse.json({ id: data.id });
}

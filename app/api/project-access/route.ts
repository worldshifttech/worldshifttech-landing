import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { verifyPassword, signAccessToken, accessCookieName } from "@/lib/project-access";

export async function POST(req: NextRequest) {
  const { slug, password } = (await req.json()) as { slug?: string; password?: string };

  if (!slug || !password) {
    return NextResponse.json({ error: "Missing slug or password" }, { status: 400 });
  }

  const supabase = getSupabase();
  const { data: project } = await supabase
    .from("projects")
    .select("access_mode, access_password_hash")
    .eq("slug", slug)
    .single();

  if (!project || project.access_mode !== "password" || !project.access_password_hash) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!verifyPassword(password, project.access_password_hash)) {
    return NextResponse.json({ error: "Incorrect password" }, { status: 403 });
  }

  const token = signAccessToken(slug);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(accessCookieName(slug), token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });
  return res;
}

import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { verifyPassword, verifyTurnstile, signAccessToken, accessCookieName } from "@/lib/project-access";

export async function POST(req: NextRequest) {
  const { slug, password, turnstileToken } = (await req.json()) as {
    slug?: string;
    password?: string;
    turnstileToken?: string;
  };

  if (!slug || !password) {
    return NextResponse.json({ error: "Missing slug or password" }, { status: 400 });
  }

  // Previously zero bot/abuse protection on this route at all — nothing slowed down
  // repeated password guesses beyond network latency. verifyTurnstile() already existed
  // in lib/project-access.ts, just never called from here. See same-day security review.
  if (!(await verifyTurnstile(turnstileToken ?? ""))) {
    return NextResponse.json({ error: "Bot detected" }, { status: 403 });
  }

  const supabase = getSupabase();
  const { data: project } = await supabase
    .from("projects")
    .select("access_mode, access_password_hash")
    .eq("slug", slug)
    .single();

  // Both branches return the same generic error now — previously "no such project" (404)
  // and "wrong password" (403) were distinguishable, letting an unauthenticated request
  // enumerate which slugs are real password-protected projects. Low practical impact
  // (slugs are already handed directly to clients), but free to close.
  if (
    !project ||
    project.access_mode !== "password" ||
    !project.access_password_hash ||
    !verifyPassword(password, project.access_password_hash)
  ) {
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

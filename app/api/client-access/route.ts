import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { verifyPassword, verifyTurnstile, signAccessToken } from "@/lib/project-access";
import { clientAccessCookieName } from "@/lib/client-access";

// Mirrors /api/project-access exactly, targeting `clients` instead of `projects` — Turnstile
// and the generic "Incorrect password" error (no slug-validity leak) are built in from day
// one here, rather than added after the fact like the project route needed in Session 74.
export async function POST(req: NextRequest) {
  const { slug, password, turnstileToken } = (await req.json()) as {
    slug?: string;
    password?: string;
    turnstileToken?: string;
  };

  if (!slug || !password) {
    return NextResponse.json({ error: "Missing slug or password" }, { status: 400 });
  }

  if (!(await verifyTurnstile(turnstileToken ?? ""))) {
    return NextResponse.json({ error: "Bot detected" }, { status: 403 });
  }

  const supabase = getSupabase();
  const { data: client } = await supabase
    .from("client_hubs")
    .select("access_mode, access_password_hash")
    .eq("slug", slug)
    .single();

  if (
    !client ||
    client.access_mode !== "password" ||
    !client.access_password_hash ||
    !verifyPassword(password, client.access_password_hash)
  ) {
    return NextResponse.json({ error: "Incorrect password" }, { status: 403 });
  }

  const token = signAccessToken(slug);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(clientAccessCookieName(slug), token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });
  return res;
}

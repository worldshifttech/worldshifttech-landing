// Password hashing + cookie signing for client-facing project pages.
// No client accounts, no Supabase Auth here — just a per-project password
// checked against a salted hash, and a signed cookie so the browser doesn't
// have to re-enter it every visit. Uses Node's built-in crypto, no new dependency.

import crypto from "crypto";
import { NextRequest } from "next/server";
import { getSupabase } from "@/lib/supabase";

// Required in production — set in Vercel env vars. Falling back to a fixed
// dev-only value keeps `npm run dev` working without a local .env entry.
function getCookieSecret(): string {
  return process.env.WST_COOKIE_SECRET ?? "dev-only-insecure-secret-do-not-use-in-prod";
}

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const hashBuffer = Buffer.from(hash, "hex");
  const attemptBuffer = crypto.scryptSync(password, salt, 64);
  if (hashBuffer.length !== attemptBuffer.length) return false;
  return crypto.timingSafeEqual(hashBuffer, attemptBuffer);
}

export function signAccessToken(slug: string): string {
  return crypto.createHmac("sha256", getCookieSecret()).update(slug).digest("hex");
}

export function verifyAccessToken(slug: string, token: string): boolean {
  const expected = signAccessToken(slug);
  const a = Buffer.from(token, "hex");
  const b = Buffer.from(expected, "hex");
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export function accessCookieName(slug: string): string {
  return `wst_pa_${slug}`;
}

// Shared by every route that lets an unauthenticated client act on a project
// (file uploads, feedback submission): public projects pass automatically,
// password-protected ones need the signed per-project cookie set after a
// correct password entry.
export async function verifyClientAccess(req: NextRequest, slug: string): Promise<boolean> {
  const supabase = getSupabase();
  const { data: project } = await supabase.from("projects").select("access_mode").eq("slug", slug).single();

  if (!project) return false;
  if (project.access_mode === "public") return true;

  const token = req.cookies.get(accessCookieName(slug))?.value;
  return !!token && verifyAccessToken(slug, token);
}

export async function verifyTurnstile(token: string): Promise<boolean> {
  if (!token) return false;
  try {
    const verifyRes = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        secret: process.env.TURNSTILE_SECRET_KEY,
        response: token,
      }),
    });
    const verifyData = await verifyRes.json();
    return !!verifyData.success;
  } catch {
    return false;
  }
}

import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
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

// Unambiguous charset — no 0/O or 1/l/I — since this is meant to be read off a screen
// and typed (or copy-pasted) by a client, not machine-generated-and-forgotten.
const PASSWORD_CHARS = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";

function generateReadablePassword(length = 12): string {
  const bytes = crypto.randomBytes(length);
  let out = "";
  for (let i = 0; i < length; i++) {
    out += PASSWORD_CHARS[bytes[i] % PASSWORD_CHARS.length];
  }
  return out;
}

// Generates a fresh client-portal password for a project, same one-time-reveal pattern
// as a provider showing a freshly-generated API key: the plaintext is returned in this
// response only, never stored or logged anywhere — access_password_hash (via the same
// hashPassword() the admin-projects PATCH route already uses) is the only thing that
// persists. Always sets access_mode to 'password' — generating a password only makes
// sense as a move toward requiring one. See NOTES.md.
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await verifyAdmin(req))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const password = generateReadablePassword();
  const supabase = getSupabase();

  const { error } = await supabase
    .from("projects")
    .update({
      access_mode: "password",
      access_password_hash: hashPassword(password),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ password });
}

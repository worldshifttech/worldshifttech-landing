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

// Same unambiguous charset as /api/admin-projects/[id]/generate-password — no 0/O or
// 1/l/I, meant to be read off a screen and typed by a client.
const PASSWORD_CHARS = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";

function generateReadablePassword(length = 12): string {
  const bytes = crypto.randomBytes(length);
  let out = "";
  for (let i = 0; i < length; i++) {
    out += PASSWORD_CHARS[bytes[i] % PASSWORD_CHARS.length];
  }
  return out;
}

// Client-hub equivalent of /api/admin-projects/[id]/generate-password — same one-time-reveal
// pattern (plaintext returned only in this response, never stored or logged), always sets
// access_mode to 'password'. Session 76: since a project linked to a hub defers entirely to
// the hub's own access, this is now the single password an entire client's project area
// shares — "one password grants access to their dashboard and associated projects."
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await verifyAdmin(req))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const password = generateReadablePassword();
  const supabase = getSupabase();

  const { error } = await supabase
    .from("client_hubs")
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

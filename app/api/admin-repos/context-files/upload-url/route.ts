import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { BUCKET, MAX_FILE_SIZE, buildStoragePath } from "@/lib/session-context-files";

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

  const { pendingKey, fileName, fileSize } = (await req.json()) as {
    pendingKey?: string;
    fileName?: string;
    fileSize?: number;
  };

  if (!pendingKey || !fileName) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (typeof fileSize === "number" && fileSize > MAX_FILE_SIZE) {
    return NextResponse.json({ error: "Files are limited to 25MB" }, { status: 400 });
  }

  const path = buildStoragePath(pendingKey, fileName);
  const supabase = getSupabase();
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUploadUrl(path);

  if (error || !data) {
    return NextResponse.json({ error: error?.message ?? "Could not create upload URL" }, { status: 500 });
  }

  return NextResponse.json({ signedUrl: data.signedUrl, token: data.token, path });
}

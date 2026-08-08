import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { verifyClientAccess, verifyTurnstile } from "@/lib/project-access";
import { BUCKET, MAX_FILE_SIZE, buildStoragePath } from "@/lib/project-files";

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
  const body = (await req.json()) as {
    projectId?: string;
    slug?: string;
    fileName?: string;
    fileSize?: number;
    uploadedBy?: "client" | "drew";
    turnstileToken?: string;
    milestoneId?: string;
  };

  const { projectId, slug, fileName, fileSize, uploadedBy } = body;

  if (!projectId || !slug || !fileName || !uploadedBy) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (typeof fileSize === "number" && fileSize > MAX_FILE_SIZE) {
    return NextResponse.json({ error: "Files are limited to 25MB" }, { status: 400 });
  }

  if (uploadedBy === "drew") {
    if (!(await verifyAdmin(req))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  } else {
    if (!(await verifyTurnstile(body.turnstileToken ?? ""))) {
      return NextResponse.json({ error: "Bot detected" }, { status: 403 });
    }
    if (!(await verifyClientAccess(req, slug))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const path = buildStoragePath(projectId, fileName);
  const supabase = getSupabase();
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUploadUrl(path);

  if (error || !data) {
    return NextResponse.json({ error: error?.message ?? "Could not create upload URL" }, { status: 500 });
  }

  return NextResponse.json({ signedUrl: data.signedUrl, token: data.token, path });
}

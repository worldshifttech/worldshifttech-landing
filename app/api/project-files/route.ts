import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { verifyClientAccess } from "@/lib/project-access";

const ADMIN_EMAIL = "drew@worldshifttech.com";

async function verifyAdmin(req: NextRequest): Promise<boolean> {
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "").trim();
  if (!token) return false;
  const supabase = getSupabase();
  const { data, error } = await supabase.auth.getUser(token);
  return !error && data.user?.email === ADMIN_EMAIL;
}

// Records the project_files row once the browser has finished uploading to the
// signed URL from /api/project-files/upload-url. Re-runs the same access check
// as that route for defense in depth, but does not re-verify turnstileToken —
// Cloudflare tokens are single-use and were already spent there.
export async function POST(req: NextRequest) {
  const body = (await req.json()) as {
    projectId?: string;
    slug?: string;
    storagePath?: string;
    fileName?: string;
    uploadedBy?: "client" | "drew";
    note?: string;
    milestoneId?: string;
    feedbackId?: string;
  };

  const { projectId, slug, storagePath, fileName, uploadedBy, note, milestoneId, feedbackId } = body;

  if (!projectId || !slug || !storagePath || !fileName || !uploadedBy) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (uploadedBy === "drew") {
    if (!(await verifyAdmin(req))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  } else {
    if (!(await verifyClientAccess(req, slug))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("project_files")
    .insert({
      project_id: projectId,
      file_name: fileName,
      storage_path: storagePath,
      uploaded_by: uploadedBy,
      note: note || null,
      milestone_id: milestoneId ?? null,
      feedback_id: feedbackId ?? null,
    })
    .select("id")
    .single();

  if (error || !data) {
    return NextResponse.json({ error: error?.message ?? "Could not save file" }, { status: 500 });
  }

  if (uploadedBy === "client") {
    const { data: project } = await supabase.from("projects").select("title").eq("id", projectId).single();
    let milestoneTitle: string | null = null;
    if (milestoneId) {
      const { data: milestone } = await supabase
        .from("project_milestones")
        .select("title")
        .eq("id", milestoneId)
        .single();
      milestoneTitle = milestone?.title ?? null;
    }
    fetch(new URL("/api/notify-slack", req.nextUrl.origin), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "file_upload",
        fileName,
        projectTitle: project?.title ?? "Untitled",
        projectId,
        milestoneTitle,
      }),
    }).catch(() => {});
  }

  return NextResponse.json({ ok: true, id: data.id });
}

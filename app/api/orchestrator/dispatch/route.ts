import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { dispatchOrchestratorSession } from "@/lib/orchestrator-dispatch";

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

  const { repo_id, session_type, brief, source_review_item_id, resume_from_session_id, context_files } =
    (await req.json()) as {
      repo_id?: string;
      session_type?: "planning" | "build";
      brief?: string;
      source_review_item_id?: string;
      resume_from_session_id?: string;
      context_files?: { file_name: string; storage_path: string; content_type?: string; bucket?: string }[];
    };

  if (!repo_id || !session_type || !brief) {
    return NextResponse.json({ error: "repo_id, session_type, and brief are required" }, { status: 400 });
  }

  const result = await dispatchOrchestratorSession({
    repoId: repo_id,
    sessionType: session_type,
    brief,
    sourceReviewItemId: source_review_item_id,
    resumeFromSessionId: resume_from_session_id,
    contextFiles: context_files,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({ session_id: result.sessionId });
}

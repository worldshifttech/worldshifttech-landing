import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { getTargetSupabaseClient } from "@/lib/target-supabase";
import { getFeedbackAdapter } from "@/lib/feedback-adapters";

const ADMIN_EMAIL = "drew@worldshifttech.com";

async function verifyAdmin(req: NextRequest): Promise<boolean> {
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "").trim();
  if (!token) return false;
  const supabase = getSupabase();
  const { data, error } = await supabase.auth.getUser(token);
  return !error && data.user?.email === ADMIN_EMAIL;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; ticketId: string }> }
) {
  if (!(await verifyAdmin(req))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id, ticketId } = await params;
  const supabase = getSupabase();

  const { data: repo, error: repoError } = await supabase
    .from("repos")
    .select("github_repo, target_supabase_url, target_supabase_service_role_key")
    .eq("id", id)
    .single();

  if (repoError || !repo) {
    return NextResponse.json({ error: "Repo not found" }, { status: 404 });
  }

  const adapter = getFeedbackAdapter(repo.github_repo);

  if (!adapter || !repo.target_supabase_url || !repo.target_supabase_service_role_key) {
    return NextResponse.json({ error: "This repo has no feedback source configured" }, { status: 404 });
  }

  const targetClient = getTargetSupabaseClient(repo.target_supabase_url, repo.target_supabase_service_role_key);

  const updateFields: Record<string, unknown> = {
    [adapter.resolveField]: adapter.resolveValue,
  };
  if (adapter.resolveTimestampField) {
    updateFields[adapter.resolveTimestampField] = new Date().toISOString();
  }

  const { error } = await targetClient.from(adapter.table).update(updateFields).eq("id", ticketId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}

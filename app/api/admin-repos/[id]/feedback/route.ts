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

export type FeedbackItem = {
  id: string;
  title: string;
  body: string | null;
  status: string;
  created_at: string;
};

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await verifyAdmin(req))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
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

  // Not an error — most repos in the fleet have neither an adapter nor credentials set.
  // The UI treats this as "nothing to show," not a failure.
  if (!adapter || !repo.target_supabase_url || !repo.target_supabase_service_role_key) {
    return NextResponse.json({ items: [], configured: false });
  }

  const targetClient = getTargetSupabaseClient(repo.target_supabase_url, repo.target_supabase_service_role_key);

  const { data: rows, error: targetError } = await targetClient
    .from(adapter.table)
    .select("*")
    .in(adapter.resolveField, adapter.openStatuses)
    .order("created_at", { ascending: true });

  if (targetError) {
    return NextResponse.json({ error: targetError.message }, { status: 502 });
  }

  const items: FeedbackItem[] = (rows ?? []).map((row) => ({
    id: row.id as string,
    title: row[adapter.titleField] as string,
    body: adapter.bodyField ? ((row[adapter.bodyField] as string | null) ?? null) : null,
    status: row[adapter.resolveField] as string,
    created_at: row.created_at as string,
  }));

  return NextResponse.json({ items, configured: true });
}

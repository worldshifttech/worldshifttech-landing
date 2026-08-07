import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/auth-helpers-nextjs";
import { getSupabase } from "@/lib/supabase";
import ReviewInboxClient, { type ReviewItem } from "./ReviewInboxClient";

const ADMIN_EMAIL = "drew@worldshifttech.com";

type RawReviewRow = {
  id: string;
  session_id: string;
  kind: string;
  summary: string;
  open_questions: { question: string; suggested_options?: string[]; answer: string | null }[] | null;
  proposed_content: string | null;
  kb_draft: { title?: string; problem_solved?: string; tags?: string[]; tech_stack?: string[]; artifact_location?: string } | null;
  drew_response: string | null;
  status: string;
  created_at: string;
  answered_at: string | null;
  agent_sessions: {
    repo_id: string;
    session_type: string;
    pr_url: string | null;
    pr_preview_url: string | null;
    repos: { name: string } | null;
  } | null;
};

export default async function AdminReviewsPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => {},
      },
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session || session.user.email !== ADMIN_EMAIL) {
    redirect("/admin/login");
  }

  const serviceClient = getSupabase();

  const { data: rawRows } = await serviceClient
    .from("review_items")
    .select("*, agent_sessions(repo_id, session_type, pr_url, pr_preview_url, repos(name))")
    .order("created_at", { ascending: false });

  const rows = (rawRows ?? []) as unknown as RawReviewRow[];

  const reviewItems: ReviewItem[] = rows.map((r) => ({
    id: r.id,
    kind: r.kind as ReviewItem["kind"],
    summary: r.summary,
    open_questions: (r.open_questions ?? []).map((q) => ({
      question: q.question,
      suggested_options: q.suggested_options ?? [],
      answer: q.answer ?? "",
    })),
    proposed_content: r.proposed_content,
    kb_draft: r.kb_draft,
    drew_response: r.drew_response,
    status: r.status as ReviewItem["status"],
    created_at: r.created_at,
    repo_id: r.agent_sessions?.repo_id ?? null,
    repo_name: r.agent_sessions?.repos?.name ?? "Unknown repo",
    session_type: r.agent_sessions?.session_type ?? "planning",
    pr_url: r.agent_sessions?.pr_url ?? null,
    pr_preview_url: r.agent_sessions?.pr_preview_url ?? null,
  }));

  return <ReviewInboxClient initialItems={reviewItems} />;
}

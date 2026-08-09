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

  // FK explicitly hinted (review_items_session_id_fkey) — Session 65 added a second FK
  // between these two tables (agent_sessions.source_review_item_id, for linked-build
  // tracking), so an unhinted embed is now ambiguous and PostgREST errors on it. Same bug
  // as app/admin/repos/[id]/page.tsx — see that file's comment and NOTES.md.
  const { data: rawRows, error: rawRowsError } = await serviceClient
    .from("review_items")
    .select("*, agent_sessions!review_items_session_id_fkey(repo_id, session_type, pr_url, pr_preview_url, repos(name))")
    .order("created_at", { ascending: false });

  if (rawRowsError) {
    console.error("[admin/reviews] review_items query failed:", rawRowsError.message);
  }

  const rows = (rawRows ?? []) as unknown as RawReviewRow[];

  // Persisted build-dispatch status for every consolidated_review card (Session 65) —
  // replaces the old client-only buildSessionId state that reset on every page reload.
  // See NOTES.md.
  const consolidatedReviewIds = rows.filter((r) => r.kind === "consolidated_review").map((r) => r.id);

  const linkedBuildBySourceId = new Map<
    string,
    { id: string; status: string; pr_url: string | null; pr_preview_url: string | null }
  >();

  if (consolidatedReviewIds.length > 0) {
    const { data: linkedBuildRows } = await serviceClient
      .from("agent_sessions")
      .select("id, status, pr_url, pr_preview_url, source_review_item_id, created_at")
      .in("source_review_item_id", consolidatedReviewIds)
      .order("created_at", { ascending: false });

    for (const row of linkedBuildRows ?? []) {
      const sourceId = row.source_review_item_id as string;
      if (!linkedBuildBySourceId.has(sourceId)) {
        linkedBuildBySourceId.set(sourceId, {
          id: row.id as string,
          status: row.status as string,
          pr_url: (row.pr_url as string | null) ?? null,
          pr_preview_url: (row.pr_preview_url as string | null) ?? null,
        });
      }
    }
  }

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
    linked_build: r.kind === "consolidated_review" ? linkedBuildBySourceId.get(r.id) ?? null : null,
  }));

  return <ReviewInboxClient initialItems={reviewItems} />;
}

import { redirect, notFound } from "next/navigation";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/auth-helpers-nextjs";
import { getSupabase } from "@/lib/supabase";
import RepoDetailClient from "./RepoDetailClient";
import type { ProjectOption } from "../RepoFleetClient";
import type { ReviewItem } from "../../reviews/ReviewInboxClient";

type RawReviewRow = {
  id: string;
  kind: string;
  summary: string;
  open_questions: { question: string; suggested_options?: string[]; answer: string | null }[] | null;
  proposed_content: string | null;
  drew_response: string | null;
  status: string;
  created_at: string;
  agent_sessions: {
    repo_id: string;
    session_type: string;
    repos: { name: string } | null;
  } | null;
};

const ADMIN_EMAIL = "drew@worldshifttech.com";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminRepoDetailPage({ params }: PageProps) {
  const { id } = await params;

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

  const { data: repo } = await serviceClient.from("repos").select("*").eq("id", id).single();

  if (!repo) notFound();

  const { data: rawProjects } = await serviceClient
    .from("projects")
    .select("id, title")
    .order("title", { ascending: true });

  const projects: ProjectOption[] = (rawProjects ?? []).map((p) => ({
    id: p.id as string,
    title: p.title as string,
  }));

  // This repo's own review items, scoped via !inner so .eq() on the joined table's
  // column actually filters rather than just shaping which nested rows come back. Same
  // shape as app/admin/reviews/page.tsx's global query, just narrowed to one repo_id.
  const { data: rawReviewRows } = await serviceClient
    .from("review_items")
    .select("*, agent_sessions!inner(repo_id, session_type, repos(name))")
    .eq("agent_sessions.repo_id", id)
    .order("created_at", { ascending: false });

  const reviewRows = (rawReviewRows ?? []) as unknown as RawReviewRow[];

  const reviewItems: ReviewItem[] = reviewRows.map((r) => ({
    id: r.id,
    kind: r.kind as ReviewItem["kind"],
    summary: r.summary,
    open_questions: (r.open_questions ?? []).map((q) => ({
      question: q.question,
      suggested_options: q.suggested_options ?? [],
      answer: q.answer ?? "",
    })),
    proposed_content: r.proposed_content,
    drew_response: r.drew_response,
    status: r.status as ReviewItem["status"],
    created_at: r.created_at,
    repo_id: r.agent_sessions?.repo_id ?? null,
    repo_name: r.agent_sessions?.repos?.name ?? "Unknown repo",
    session_type: r.agent_sessions?.session_type ?? "planning",
  }));

  return (
    <RepoDetailClient
      repo={{
        id: repo.id,
        name: repo.name,
        local_path: repo.local_path,
        github_owner: repo.github_owner,
        github_repo: repo.github_repo,
        vercel_project_id: repo.vercel_project_id,
        framework_type: repo.framework_type ?? "other",
        auth_convention: repo.auth_convention ?? "none",
        client_project_id: repo.client_project_id,
        automation_enabled: Boolean(repo.automation_enabled),
        planning_interval_hours: repo.planning_interval_hours,
        github_app_installation_id: repo.github_app_installation_id,
        target_supabase_url: repo.target_supabase_url ?? null,
        // Never the raw value — see lib/feedback-adapters.ts / NOTES.md Session 51 for
        // why this field never leaves the server as anything but a boolean.
        has_target_supabase_service_role_key: Boolean(repo.target_supabase_service_role_key),
      }}
      projects={projects}
      reviewItems={reviewItems}
    />
  );
}

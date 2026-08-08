import { redirect, notFound } from "next/navigation";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/auth-helpers-nextjs";
import { getSupabase } from "@/lib/supabase";
import RepoDetailClient, { type SessionDraft } from "./RepoDetailClient";
import type { ProjectOption } from "../RepoFleetClient";
import type { ReviewItem } from "../../reviews/ReviewInboxClient";

type RawReviewRow = {
  id: string;
  kind: string;
  summary: string;
  open_questions: { question: string; suggested_options?: string[]; answer: string | null }[] | null;
  proposed_content: string | null;
  kb_draft: { title?: string; problem_solved?: string; tags?: string[]; tech_stack?: string[]; artifact_location?: string } | null;
  drew_response: string | null;
  status: string;
  created_at: string;
  agent_sessions: {
    repo_id: string;
    session_type: string;
    pr_url: string | null;
    pr_preview_url: string | null;
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
    .select("id, title, slug, access_mode, access_password_hash")
    .order("title", { ascending: true });

  const projects: ProjectOption[] = (rawProjects ?? []).map((p) => ({
    id: p.id as string,
    title: p.title as string,
    slug: p.slug as string,
    access_mode: p.access_mode as string,
    has_password: Boolean(p.access_password_hash),
  }));

  // This repo's own review items, scoped via !inner so .eq() on the joined table's
  // column actually filters rather than just shaping which nested rows come back. Same
  // shape as app/admin/reviews/page.tsx's global query, just narrowed to one repo_id.
  const { data: rawReviewRows } = await serviceClient
    .from("review_items")
    .select("*, agent_sessions!inner(repo_id, session_type, pr_url, pr_preview_url, repos(name))")
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

  // Saved-but-not-dispatched planning/build briefs for this repo (Session 63). See
  // NOTES.md.
  const { data: rawDrafts } = await serviceClient
    .from("session_drafts")
    .select("id, session_type, title, brief, created_at")
    .eq("repo_id", id)
    .order("created_at", { ascending: false });

  const drafts: SessionDraft[] = (rawDrafts ?? []).map((d) => ({
    id: d.id,
    session_type: d.session_type as "planning" | "build",
    title: d.title,
    brief: d.brief,
    created_at: d.created_at,
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
        deployed_sha: repo.deployed_sha ?? null,
        github_head_sha: repo.github_head_sha ?? null,
        drift_checked_at: repo.drift_checked_at ?? null,
        system_group: repo.system_group ?? null,
      }}
      projects={projects}
      reviewItems={reviewItems}
      initialDrafts={drafts}
    />
  );
}

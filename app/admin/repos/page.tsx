import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/auth-helpers-nextjs";
import { getSupabase } from "@/lib/supabase";
import RepoFleetClient, { type Repo, type ProjectOption } from "./RepoFleetClient";

const ADMIN_EMAIL = "drew@worldshifttech.com";

export default async function AdminReposPage() {
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

  const { data: rawRepos } = await serviceClient
    .from("repos")
    .select("*")
    .order("created_at", { ascending: true });

  const repos: Repo[] = (rawRepos ?? []).map((r) => ({
    id: r.id as string,
    name: r.name as string,
    local_path: r.local_path as string,
    github_owner: r.github_owner as string,
    github_repo: r.github_repo as string,
    vercel_project_id: (r.vercel_project_id as string | null) ?? null,
    framework_type: (r.framework_type as string) ?? "other",
    auth_convention: (r.auth_convention as string) ?? "none",
    client_project_id: (r.client_project_id as string | null) ?? null,
    automation_enabled: Boolean(r.automation_enabled),
    planning_interval_hours: (r.planning_interval_hours as number | null) ?? null,
    last_planning_session_at: (r.last_planning_session_at as string | null) ?? null,
  }));

  const { data: rawProjects } = await serviceClient
    .from("projects")
    .select("id, title")
    .order("title", { ascending: true });

  const projects: ProjectOption[] = (rawProjects ?? []).map((p) => ({
    id: p.id as string,
    title: p.title as string,
  }));

  return <RepoFleetClient initialRepos={repos} projects={projects} />;
}

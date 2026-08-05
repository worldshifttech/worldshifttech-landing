import { redirect, notFound } from "next/navigation";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/auth-helpers-nextjs";
import { getSupabase } from "@/lib/supabase";
import RepoDetailClient from "./RepoDetailClient";
import type { ProjectOption } from "../RepoFleetClient";

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
      }}
      projects={projects}
    />
  );
}

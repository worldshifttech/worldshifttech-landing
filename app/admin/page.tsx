import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/auth-helpers-nextjs";
import { getSupabase } from "@/lib/supabase";
import AdminDashboard, { type AdminProject, type ScopeData } from "./AdminDashboard";

const ADMIN_EMAIL = "drew@worldshifttech.com";

export default async function AdminPage() {
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
    redirect("/");
  }

  const serviceClient = getSupabase();

  const { data: rawProjects } = await serviceClient
    .from("projects")
    .select("id, title, status, created_at, scope, answers, user_id, claude_code_prompt, demo_url, project_readme, guest")
    .order("created_at", { ascending: false });

  const projects = rawProjects ?? [];

  // Batch user email lookups — only for rows with a non-null user_id
  const uniqueUserIds = [
    ...new Set(
      projects
        .map((p) => p.user_id as string | null)
        .filter((id): id is string => id !== null)
    ),
  ];
  const userEmailMap: Record<string, string> = {};

  await Promise.all(
    uniqueUserIds.map(async (uid) => {
      const { data } = await serviceClient.auth.admin.getUserById(uid);
      if (data?.user?.email) {
        userEmailMap[uid] = data.user.email;
      }
    })
  );

  const adminProjects: AdminProject[] = projects.map((p) => ({
    id: p.id as string,
    title: p.title as string | null,
    status: p.status as string,
    created_at: p.created_at as string,
    scope: (p.scope as ScopeData) ?? null,
    answers: (p.answers as Record<string, unknown>) ?? null,
    user_id: (p.user_id as string | null) ?? null,
    userEmail: p.user_id ? (userEmailMap[p.user_id as string] ?? "unknown") : "Guest",
    claude_code_prompt: (p.claude_code_prompt as string | null) ?? null,
    demo_url: (p.demo_url as string | null) ?? null,
    project_readme: (p.project_readme as string | null) ?? null,
    guest: (p.guest as boolean) ?? false,
  }));

  return <AdminDashboard initialProjects={adminProjects} />;
}

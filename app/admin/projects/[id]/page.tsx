import { redirect, notFound } from "next/navigation";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/auth-helpers-nextjs";
import { getSupabase } from "@/lib/supabase";
import ProjectDetailClient from "./ProjectDetailClient";

const ADMIN_EMAIL = "drew@worldshifttech.com";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminProjectDetailPage({ params }: PageProps) {
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

  const { data: project } = await serviceClient
    .from("projects")
    .select("*")
    .eq("id", id)
    .single();

  if (!project) notFound();

  const { data: milestones } = await serviceClient
    .from("project_milestones")
    .select("*")
    .eq("project_id", id)
    .order("sort_order", { ascending: true });

  const { data: costRows } = await serviceClient
    .from("build_cost_entries")
    .select("human_hours, ai_hours, total_cost")
    .eq("project_slug", project.slug);

  const hoursLogged = (costRows ?? []).reduce(
    (sum, r) => sum + (Number(r.human_hours) || 0) + (Number(r.ai_hours) || 0),
    0
  );
  const costLogged = (costRows ?? []).reduce((sum, r) => sum + (Number(r.total_cost) || 0), 0);

  return (
    <ProjectDetailClient
      project={{
        id: project.id,
        slug: project.slug,
        title: project.title,
        client_name: project.client_name,
        percent_complete: project.percent_complete ?? 0,
        next_update_note: project.next_update_note,
        next_due_date: project.next_due_date,
        access_mode: project.access_mode,
        budget_type: project.budget_type,
        budget_hours_cap: project.budget_hours_cap,
        hourly_rate: project.hourly_rate,
      }}
      initialMilestones={(milestones ?? []).map((m) => ({
        title: m.title,
        description: m.description,
        status: m.status,
        target_date: m.target_date,
      }))}
      hoursLogged={hoursLogged}
      costLogged={costLogged}
    />
  );
}

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/auth-helpers-nextjs";
import { getSupabase } from "@/lib/supabase";
import AdminDashboard, { type AdminProject, type AuditEstimate } from "./AdminDashboard";

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
    redirect("/admin/login");
  }

  const serviceClient = getSupabase();

  const { data: rawProjects } = await serviceClient
    .from("projects")
    .select(
      "id, slug, client_name, title, percent_complete, next_update_note, next_due_date, access_mode, budget_type, budget_hours_cap, hourly_rate, created_at"
    )
    .order("created_at", { ascending: false });

  const adminProjects: AdminProject[] = (rawProjects ?? []).map((p) => ({
    id: p.id as string,
    slug: p.slug as string,
    client_name: (p.client_name as string | null) ?? null,
    title: p.title as string,
    percent_complete: (p.percent_complete as number) ?? 0,
    next_update_note: (p.next_update_note as string | null) ?? null,
    next_due_date: (p.next_due_date as string | null) ?? null,
    access_mode: (p.access_mode as "public" | "password") ?? "password",
    budget_type: (p.budget_type as "none" | "hourly") ?? "none",
    budget_hours_cap: (p.budget_hours_cap as number | null) ?? null,
    hourly_rate: (p.hourly_rate as number | null) ?? null,
    created_at: p.created_at as string,
  }));

  const { data: auditData } = await serviceClient
    .from("audit_estimates")
    .select("*")
    .order("created_at", { ascending: false });

  const auditEstimates: AuditEstimate[] = (auditData ?? []).map((a) => ({
    id: a.id as string,
    created_at: a.created_at as string,
    business_name: (a.business_name as string | null) ?? null,
    business_type: (a.business_type as string) ?? "",
    team_size: (a.team_size as string) ?? "",
    departments: (a.departments as string[]) ?? [],
    tools_by_department: (a.tools_by_department as Record<string, string[]>) ?? {},
    ai_usage: (a.ai_usage as Record<string, boolean>) ?? {},
    monthly_spend_range: (a.monthly_spend_range as string) ?? "",
    report: (a.report as AuditEstimate["report"]) ?? null,
  }));

  return <AdminDashboard initialProjects={adminProjects} auditEstimates={auditEstimates} />;
}

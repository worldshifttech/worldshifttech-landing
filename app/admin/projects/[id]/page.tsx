import { redirect, notFound } from "next/navigation";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/auth-helpers-nextjs";
import { getSupabase } from "@/lib/supabase";
import { BUCKET } from "@/lib/project-files";
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

  const { data: fileRows } = await serviceClient
    .from("project_files")
    .select("*")
    .eq("project_id", id)
    .order("created_at", { ascending: false });

  const milestoneTitleById = new Map((milestones ?? []).map((m) => [m.id as string, m.title as string]));

  const files = await Promise.all(
    (fileRows ?? []).map(async (f) => {
      // download option forces Content-Disposition: attachment regardless of the
      // uploaded file's content type — see app/projects/[slug]/page.tsx's own comment
      // and the same-day security review for why this matters even on the admin side.
      const { data: signed } = await serviceClient.storage
        .from(BUCKET)
        .createSignedUrl(f.storage_path, 3600, { download: f.file_name });
      return {
        id: f.id,
        file_name: f.file_name,
        uploaded_by: f.uploaded_by,
        note: f.note,
        created_at: f.created_at,
        downloadUrl: signed?.signedUrl ?? null,
        milestoneTitle: f.milestone_id ? milestoneTitleById.get(f.milestone_id) ?? null : null,
        // Session 83 — needed (not just the downloadUrl above) so a feedback item's
        // attachment can be re-signed fresh at dispatch time as real planning-session
        // context, rather than reusing a URL that's only valid for the next hour.
        storage_path: f.storage_path as string,
      };
    })
  );

  const { data: feedbackRows } = await serviceClient
    .from("project_feedback")
    .select("id, message, status, created_at, milestone_id, attached_file_id, project_milestones(title)")
    .eq("project_id", id)
    .order("created_at", { ascending: false });

  // Resolved against the same `files` array already fetched above (already-signed,
  // forced-download URLs) — same pattern as app/projects/[slug]/page.tsx, no second query.
  const fileById = new Map(files.map((f) => [f.id, f]));

  const feedback = (feedbackRows ?? []).map((f) => {
    const attachedFile = f.attached_file_id ? fileById.get(f.attached_file_id as string) : undefined;
    return {
      id: f.id as string,
      message: f.message as string,
      status: f.status as "new" | "read" | "resolved",
      created_at: f.created_at as string,
      milestoneTitle: (f.project_milestones as unknown as { title: string } | null)?.title ?? null,
      attachedFile: attachedFile
        ? {
            file_name: attachedFile.file_name,
            downloadUrl: attachedFile.downloadUrl,
            storagePath: attachedFile.storage_path,
          }
        : null,
    };
  });

  // The repo (if any) this project's own codebase lives in — lets "Run Planning Session"
  // on a feedback item dispatch to the right place. A project with no linked repo (e.g.
  // one that's roadmap-only, no orchestrator-managed codebase yet) just won't offer it.
  const { data: linkedRepoRow } = await serviceClient
    .from("repos")
    .select("id, name, github_app_installation_id")
    .eq("client_project_id", id)
    .limit(1)
    .maybeSingle();

  const linkedRepo = linkedRepoRow
    ? {
        id: linkedRepoRow.id as string,
        name: linkedRepoRow.name as string,
        hasInstallation: linkedRepoRow.github_app_installation_id != null,
      }
    : null;

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
        id: m.id,
        title: m.title,
        description: m.description,
        status: m.status,
        target_date: m.target_date,
        action_owner: m.action_owner ?? "drew",
        action_note: m.action_note ?? null,
      }))}
      hoursLogged={hoursLogged}
      costLogged={costLogged}
      files={files}
      feedback={feedback}
      linkedRepo={linkedRepo}
    />
  );
}

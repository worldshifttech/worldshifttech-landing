import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import Image from "next/image";
import { getSupabase } from "@/lib/supabase";
import { verifyAccessToken, accessCookieName } from "@/lib/project-access";
import { BUCKET } from "@/lib/project-files";
import PasswordGate from "./PasswordGate";
import FileUploads from "./FileUploads";
import MilestoneActionPanel from "./MilestoneActionPanel";

const STATUS_LABEL: Record<string, string> = {
  not_started: "Not started",
  in_progress: "In progress",
  done: "Done",
};

const STATUS_STYLE: Record<string, string> = {
  not_started: "bg-[#00205C]/[0.05] text-[#76777A] border border-[#00205C]/15",
  in_progress: "bg-[#4B858E]/10 text-[#4B858E] border border-[#4B858E]/30",
  done: "bg-green-500/15 text-green-600 border border-green-500/30",
};

function formatDate(dateStr: string | null): string | null {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProjectRoadmapPage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = getSupabase();

  const { data: project } = await supabase.from("projects").select("*").eq("slug", slug).single();

  if (!project) notFound();

  if (project.access_mode === "password") {
    const cookieStore = await cookies();
    const token = cookieStore.get(accessCookieName(slug))?.value;
    const unlocked = token ? verifyAccessToken(slug, token) : false;
    if (!unlocked) {
      return <PasswordGate slug={slug} />;
    }
  }

  const { data: milestones } = await supabase
    .from("project_milestones")
    .select("*")
    .eq("project_id", project.id)
    .order("sort_order", { ascending: true });

  let budgetLine: string | null = null;
  if (project.budget_type === "hourly") {
    const { data: costRows } = await supabase
      .from("build_cost_entries")
      .select("human_hours, ai_hours")
      .eq("project_slug", slug);

    const hoursUsed = (costRows ?? []).reduce(
      (sum, r) => sum + (Number(r.human_hours) || 0) + (Number(r.ai_hours) || 0),
      0
    );

    budgetLine = project.budget_hours_cap
      ? `${hoursUsed.toFixed(1)} of ${project.budget_hours_cap} hours used`
      : `${hoursUsed.toFixed(1)} hours logged`;
  }

  const { data: fileRows } = await supabase
    .from("project_files")
    .select("*")
    .eq("project_id", project.id)
    .order("created_at", { ascending: false });

  const files = await Promise.all(
    (fileRows ?? []).map(async (f) => {
      const { data: signed } = await supabase.storage.from(BUCKET).createSignedUrl(f.storage_path, 3600);
      return {
        id: f.id,
        file_name: f.file_name,
        uploaded_by: f.uploaded_by,
        note: f.note,
        created_at: f.created_at,
        downloadUrl: signed?.signedUrl ?? null,
        milestone_id: f.milestone_id ?? null,
      };
    })
  );

  const nextDue = formatDate(project.next_due_date);

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F2EE]">
      {/* Nav */}
      <nav className="w-full bg-white border-b border-[#00205C]/10">
        <div className="flex items-center px-6 py-5 max-w-3xl mx-auto w-full">
          <Image
            src="/World_shift_tech_LOGO_PRIMARY.png"
            alt="World Shift Technologies"
            width={160}
            height={38}
            className="object-contain"
            priority
          />
        </div>
      </nav>

      <main className="flex-1 px-6 py-12">
        <div className="w-full max-w-3xl mx-auto">
          {project.client_name && (
            <p className="text-[#4B858E] text-xs font-semibold tracking-widest uppercase mb-2">
              {project.client_name}
            </p>
          )}
          <h1 className="text-3xl sm:text-4xl font-bold text-[#00205C] leading-snug mb-6">{project.title}</h1>

          {/* Status summary */}
          <div className="bg-white border border-[#00205C]/10 rounded-2xl p-6 mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold tracking-widest uppercase text-[#4B858E]">Progress</span>
              <span className="text-[#00205C] text-sm font-semibold">{project.percent_complete}%</span>
            </div>
            <div className="h-2 bg-[#00205C]/[0.08] rounded-full overflow-hidden mb-5">
              <div
                className="h-full bg-[#4B858E] rounded-full"
                style={{ width: `${project.percent_complete}%` }}
              />
            </div>

            {project.next_update_note && (
              <div className="mb-2">
                <span className="text-[#76777A] text-xs block mb-0.5">Next update</span>
                <p className="text-[#00205C] text-sm">{project.next_update_note}</p>
              </div>
            )}
            {nextDue && (
              <div>
                <span className="text-[#76777A] text-xs block mb-0.5">Expected by</span>
                <p className="text-[#00205C] text-sm">{nextDue}</p>
              </div>
            )}

            {budgetLine && (
              <div className="mt-4 pt-4 border-t border-[#00205C]/[0.08]">
                <span className="text-[#76777A] text-xs block mb-0.5">Budget</span>
                <p className="text-[#00205C] text-sm">{budgetLine}</p>
              </div>
            )}
          </div>

          {/* Milestones */}
          <div className="mb-8">
            <span className="text-xs font-bold tracking-widest uppercase text-[#4B858E] block mb-4">
              Milestones
            </span>
            {!milestones || milestones.length === 0 ? (
              <p className="text-[#76777A] text-sm">Milestones will show up here as the project moves forward.</p>
            ) : (
              <div className="space-y-3">
                {milestones.map((m) => (
                  <div key={m.id} className="bg-white border border-[#00205C]/10 rounded-xl p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
                      <p className="text-[#00205C] font-medium">{m.title}</p>
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${STATUS_STYLE[m.status] ?? STATUS_STYLE.not_started}`}
                      >
                        {STATUS_LABEL[m.status] ?? m.status}
                      </span>
                    </div>
                    {m.description && (
                      <p className="text-[#00205C]/70 text-sm leading-relaxed mb-2">{m.description}</p>
                    )}
                    {m.target_date && (
                      <p className="text-[#76777A] text-xs">Target: {formatDate(m.target_date)}</p>
                    )}
                    {m.action_owner === "client" && m.status !== "done" && (
                      <MilestoneActionPanel
                        projectId={project.id}
                        slug={slug}
                        milestoneId={m.id}
                        actionNote={m.action_note}
                        files={files}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mb-4">
            <FileUploads projectId={project.id} slug={slug} files={files} />
          </div>
        </div>
      </main>

      <footer className="border-t border-[#00205C]/[0.10] py-6 px-6">
        <div className="max-w-3xl mx-auto text-center text-[#76777A] text-xs">
          &copy; {new Date().getFullYear()} World Shift Technologies
        </div>
      </footer>
    </div>
  );
}

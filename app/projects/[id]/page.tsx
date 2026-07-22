import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/auth-helpers-nextjs";
import Link from "next/link";
import Image from "next/image";
import { getSupabase } from "@/lib/supabase";
import SignOutButton from "@/app/components/SignOutButton";
import ProjectDetailClient from "./ProjectDetailClient";

// ─── Badge maps ───────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<string, { label: string; classes: string }> = {
  draft: {
    label: "Draft",
    classes: "bg-white text-[#76777A] border border-[#00205C]/15",
  },
  scoped: {
    label: "Scoped",
    classes: "bg-[#4B858E]/10 text-[#4B858E] border border-[#4B858E]/30",
  },
  submitted: {
    label: "Submitted",
    classes: "bg-[#4B858E] text-white border border-[#4B858E]",
  },
  reviewed: {
    label: "In Review",
    classes: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
  },
  approved: {
    label: "Approved",
    classes: "bg-green-600/20 text-green-400 border border-green-600/30",
  },
  building: {
    label: "Building",
    classes: "bg-orange-500/20 text-orange-400 border border-orange-500/30",
  },
  live: {
    label: "Live",
    classes: "bg-green-400/20 text-green-300 border border-green-400/30",
  },
  resubmitted: {
    label: "Resubmitted",
    classes: "bg-purple-500/20 text-purple-400 border border-purple-500/30",
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatStartDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

// ─── Page ─────────────────────────────────────────────────────────────────────

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const { id } = await params;

  // Auth check via anon key (same pattern as /projects)
  const cookieStore = await cookies();
  const authClient = createServerClient(
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
  } = await authClient.auth.getSession();

  if (!session) redirect("/?login=true");

  // Fetch project via service role, filtered to current user
  const { data: project } = await getSupabase()
    .from("projects")
    .select("id, title, status, created_at, scope, demo_url, answers, user_id")
    .eq("id", id)
    .eq("user_id", session.user.id)
    .single();

  if (!project) redirect("/projects");

  const statusStyle = STATUS_STYLES[project.status] ?? STATUS_STYLES.draft;
  const userEmail = session.user.email ?? "";

  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav */}
      <nav className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-sm border-b border-[#00205C]/10 shadow-sm">
        <div className="flex items-center justify-between px-6 py-5">
          <Link href="/">
            <Image
              src="/World_shift_tech_LOGO_PRIMARY.png"
              alt="World Shift Technologies"
              width={160}
              height={38}
              className="object-contain"
              priority
            />
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-[#76777A] hidden sm:block font-normal">
              {userEmail}
            </span>
            <SignOutButton />
          </div>
        </div>
      </nav>

      {/* Main */}
      <main className="flex-1 px-6 py-12">
        <div className="w-full max-w-2xl mx-auto">
          {/* Back link */}
          <Link
            href="/projects"
            className="inline-flex items-center gap-1.5 text-sm text-[#76777A] hover:text-[#00205C] transition-colors"
          >
            &larr; Your Projects
          </Link>

          {/* Title row */}
          <div className="mt-6 flex flex-wrap items-start gap-4">
            <h1 className="flex-1 min-w-0 text-3xl sm:text-4xl font-bold text-[#00205C] leading-snug">
              {project.title ?? "Untitled Project"}
            </h1>
            <span
              className={`flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full ${statusStyle.classes}`}
            >
              {statusStyle.label}
            </span>
          </div>

          {/* Created date */}
          <p className="mt-2 text-[#76777A] text-sm font-normal">
            Started {formatStartDate(project.created_at)}
          </p>

          {/* Live demo link */}
          {project.status === "live" && (
            <div className="mt-5">
              {project.demo_url ? (
                <a
                  href={project.demo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-[#4B858E] text-white text-sm font-bold px-7 py-3 rounded-full hover:bg-[#5a9aa4] transition-colors"
                >
                  View Your Demo &rarr;
                </a>
              ) : (
                <p className="text-[#76777A] text-sm font-normal">
                  Demo coming soon
                </p>
              )}
            </div>
          )}

          {/* Scope card + edit form (client component) */}
          <ProjectDetailClient
            id={project.id}
            title={project.title}
            status={project.status}
            scope={project.scope as Parameters<typeof ProjectDetailClient>[0]["scope"]}
            answers={project.answers as Record<string, unknown> | null}
            userEmail={userEmail}
            demo_url={project.demo_url ?? null}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#00205C]/[0.08] py-6 px-6">
        <div className="max-w-6xl mx-auto text-center text-[#76777A] text-xs font-normal">
          &copy; {new Date().getFullYear()} World Shift Technologies
        </div>
      </footer>
    </div>
  );
}

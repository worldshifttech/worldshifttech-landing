import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getSupabase } from "@/lib/supabase";
import { verifyAccessToken } from "@/lib/project-access";
import { clientAccessCookieName } from "@/lib/client-access";
import ClientPasswordGate from "@/app/components/ClientPasswordGate";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Client hub — one page per client (worldshifttech.com/clients/{slug}) listing every project
// scoped for them as its own link. Built because a single client can have multiple distinct
// projects (e.g. Entos: onboarding, and separately a website rebuild) and there was previously
// no shared home for them — each project only ever had its own standalone /projects/{slug}
// link with nothing tying sibling projects together. This page's own gate (below) protects
// the index itself — client name + list of project titles/links. As of Session 77, it also
// gates every linked project: a project's own access_mode is no longer consulted once it has
// a client_id (see lib/project-access.ts's verifyClientAccess() and this project's own
// app/projects/[slug]/page.tsx gate), so there's no per-project Public/Password badge to show
// here anymore — every project listed on this page is, by definition, already gated by the
// same password you just entered to see this list. See NOTES.md Session 76/77.
export default async function ClientHubPage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = getSupabase();

  const { data: client } = await supabase.from("client_hubs").select("*").eq("slug", slug).single();

  if (!client) notFound();

  if (client.access_mode === "password") {
    const cookieStore = await cookies();
    const token = cookieStore.get(clientAccessCookieName(slug))?.value;
    const unlocked = token ? verifyAccessToken(slug, token) : false;
    if (!unlocked) {
      return <ClientPasswordGate slug={slug} />;
    }
  }

  const { data: projects } = await supabase
    .from("projects")
    .select("id, slug, title, percent_complete")
    .eq("client_id", client.id)
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F2EE]">
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
          <p className="text-[#4B858E] text-xs font-semibold tracking-widest uppercase mb-2">Project Area</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#00205C] leading-snug mb-8">{client.name}</h1>

          {!projects || projects.length === 0 ? (
            <p className="text-[#76777A] text-sm">No projects yet. Check back soon.</p>
          ) : (
            <div className="space-y-3">
              {projects.map((p) => (
                <Link
                  key={p.id}
                  href={`/projects/${p.slug}`}
                  className="flex items-center justify-between gap-4 px-6 py-5 border border-[#00205C]/10 rounded-2xl bg-white hover:border-[#4B858E]/40 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-[#00205C] font-medium truncate">{p.title}</p>
                    <div className="h-1.5 bg-[#00205C]/[0.08] rounded-full overflow-hidden mt-2 w-40">
                      <div className="h-full bg-[#4B858E] rounded-full" style={{ width: `${p.percent_complete}%` }} />
                    </div>
                  </div>
                  <span className="text-[#76777A] text-xs flex-shrink-0">{p.percent_complete}%</span>
                </Link>
              ))}
            </div>
          )}
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

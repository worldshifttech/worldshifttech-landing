import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/auth-helpers-nextjs";
import SignOutButton from "@/app/components/SignOutButton";
import ProjectList, { type Project } from "./ProjectList";
import GuestProjectAttacher from "./GuestProjectAttacher";

export default async function ProjectsPage() {
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

  if (!session) {
    redirect("/?login=true");
  }

  const userEmail = session.user.email ?? "";

  const { data: projects } = await supabase
    .from("projects")
    .select("id, title, status, created_at, scope, demo_url")
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-5 border-b border-[#00205C]/[0.08]">
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
          <Link
            href="/curriculum"
            className="text-sm font-medium text-[#4B858E] border border-[#4B858E]/60 px-4 py-2 rounded-full hover:bg-[#4B858E] hover:text-white transition-all duration-200 hidden sm:inline-flex"
          >
            Curriculum
          </Link>
          <Link
            href="/your-team-and-ai"
            className="text-sm font-medium text-[#4B858E] border border-[#4B858E]/60 px-4 py-2 rounded-full hover:bg-[#4B858E] hover:text-white transition-all duration-200 hidden sm:inline-flex"
          >
            Your Team &amp; AI
          </Link>
          <span className="text-sm text-[#76777A] hidden sm:block">
            {userEmail}
          </span>
          <SignOutButton />
        </div>
      </nav>

      {/* Main */}
      <main className="flex-1 px-6 py-16">
        <div className="w-full max-w-3xl mx-auto">
          <div className="flex flex-wrap items-center justify-between gap-y-3 mb-10">
            <h1 className="text-4xl sm:text-5xl font-bold text-[#00205C]">
              Your Projects
            </h1>
            <div className="flex items-center gap-3 flex-shrink-0">
              <Link
                href="/audit"
                className="text-sm font-bold px-6 py-3 rounded-full border border-[#4B858E] text-[#4B858E] hover:bg-[#4B858E]/10 transition-colors"
              >
                Get an Audit
              </Link>
              <Link
                href="/projects/new"
                className="inline-block bg-[#4B858E] text-[#080C14] text-sm font-bold px-6 py-3 rounded-full hover:bg-[#5a9aa4] transition-colors"
              >
                Start a New Project
              </Link>
            </div>
          </div>

          <GuestProjectAttacher />
          <ProjectList initialProjects={(projects ?? []) as Project[]} />
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

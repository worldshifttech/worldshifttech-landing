import Image from "next/image";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/auth-helpers-nextjs";
import SignOutButton from "@/app/components/SignOutButton";
import {
  getDomains,
  getModulesByDomain,
  getLessonsByModule,
  getAssessmentByModule,
  getUserProgress,
} from "@/lib/curriculum";

export default async function ModulePage({
  params,
}: {
  params: Promise<{ domain: string; module: string }>;
}) {
  const { domain: domainParam, module: moduleParam } = await params;
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
  if (!session) redirect("/?login=true");
  if (session.user.email !== "drew@worldshifttech.com") redirect("/");

  const domainNumber = parseInt(domainParam);
  if (isNaN(domainNumber)) notFound();
  const moduleNumber = moduleParam.toUpperCase();

  const [domains, modules, lessons, progress] = await Promise.all([
    getDomains(),
    getModulesByDomain(domainNumber),
    getLessonsByModule(moduleNumber),
    getUserProgress(session.user.id),
  ]);

  const domain = domains.find((d) => d.number === domainNumber);
  const mod = modules.find((m) => m.module_number === moduleNumber);
  if (!domain || !mod) notFound();
  if (lessons.length === 0) notFound();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let assessment: any = null;
  try {
    assessment = await getAssessmentByModule(moduleNumber);
  } catch {}

  const completedLessonIds = new Set(
    progress
      .filter((p) => p.status === "completed")
      .map((p) => p.lesson_id)
  );

  const completedCount = lessons.filter((l) => completedLessonIds.has(l.id)).length;

  return (
    <div className="min-h-screen flex flex-col bg-offwhite">
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
            href={`/curriculum/${domainNumber}`}
            className="text-sm text-[#4B858E] hover:underline hidden sm:block"
          >
            Domain {domainNumber}
          </Link>
          <SignOutButton />
        </div>
      </nav>

      <main className="flex-1 px-6 py-16">
        <div className="w-full max-w-3xl mx-auto">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-[#76777A] mb-8 flex-wrap">
            <Link href="/curriculum" className="hover:text-[#4B858E] transition-colors">
              Curriculum
            </Link>
            <span>/</span>
            <Link
              href={`/curriculum/${domainNumber}`}
              className="hover:text-[#4B858E] transition-colors"
            >
              {domain.title}
            </Link>
            <span>/</span>
            <span className="text-[#00205C]/50">Module {moduleNumber}</span>
          </nav>

          {/* Module header */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-xs font-bold text-[#4B858E] bg-[#4B858E]/10 px-2 py-0.5 rounded">
                Module {moduleNumber}
              </span>
              <span className="text-xs text-[#76777A]">{mod.estimated_time}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-[#00205C] mb-6 font-light">
              {mod.title}
            </h1>

            {/* Learning objectives */}
            {Array.isArray(mod.learning_objectives) &&
              (mod.learning_objectives as string[]).length > 0 && (
                <div className="bg-white border border-[#00205C]/10 rounded-xl p-5">
                  <p className="text-xs font-semibold tracking-widest text-[#4B858E] uppercase mb-4">
                    Learning Objectives
                  </p>
                  <ul className="space-y-3">
                    {(mod.learning_objectives as string[]).map((obj, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-3 text-sm text-[#00205C]/80 font-normal"
                      >
                        <span className="text-[#4B858E] flex-shrink-0 mt-0.5 text-xs">◆</span>
                        {obj}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
          </div>

          {/* Lessons */}
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-[#00205C] font-light">
              Lessons
            </h2>
            <span className="text-sm text-[#76777A]">
              {completedCount}/{lessons.length} complete
            </span>
          </div>

          <div className="space-y-2 mb-10">
            {lessons.map((lesson) => {
              const isComplete = completedLessonIds.has(lesson.id);
              return (
                <Link
                  key={lesson.id}
                  href={`/curriculum/${domainNumber}/${moduleNumber}/${lesson.lesson_number}`}
                  className="block group"
                >
                  <div
                    className={`flex items-center gap-4 px-5 py-4 rounded-xl border transition-all duration-200 ${
                      isComplete
                        ? "bg-[#4B858E]/10 border-[#4B858E]/30"
                        : "bg-white border-[#00205C]/10 hover:border-[#4B858E]/40 hover:bg-[#00205C]/[0.04]"
                    }`}
                  >
                    {/* Completion circle */}
                    <div
                      className={`w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center border-2 transition-colors ${
                        isComplete
                          ? "bg-[#4B858E] border-[#4B858E]"
                          : "border-[#00205C]/20 group-hover:border-[#4B858E]/50"
                      }`}
                    >
                      {isComplete && (
                        <span className="text-white text-[10px] font-bold leading-none">
                          ✓
                        </span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <span className="text-xs text-[#76777A] mr-2">
                        {lesson.lesson_number}
                      </span>
                      <span
                        className={`text-sm ${
                          isComplete
                            ? "text-[#00205C]/50"
                            : "text-[#00205C] group-hover:text-[#00205C]"
                        } transition-colors font-normal`}
                      >
                        {lesson.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="text-xs text-[#76777A] hidden sm:block">
                        {lesson.estimated_time}
                      </span>
                      <span className="text-[#4B858E] group-hover:translate-x-1 transition-transform">
                        →
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Assessment */}
          {assessment && (
            <div className="border border-[#4B858E]/30 rounded-xl p-6 bg-[#4B858E]/5">
              <p className="text-xs font-semibold tracking-widest text-[#4B858E] uppercase mb-3">
                Assessment{assessment.is_capstone ? " — Capstone" : ""}
              </p>
              <p className="text-sm text-[#00205C]/80 leading-relaxed mb-3 font-normal">
                {assessment.prompt}
              </p>
              {assessment.what_it_measures && (
                <p className="text-xs text-[#76777A]">
                  Measures: {assessment.what_it_measures}
                </p>
              )}
            </div>
          )}
        </div>
      </main>

      <footer className="border-t border-[#00205C]/[0.08] py-6 px-6">
        <div className="max-w-6xl mx-auto text-center text-[#76777A] text-xs">
          &copy; {new Date().getFullYear()} World Shift Technologies
        </div>
      </footer>
    </div>
  );
}

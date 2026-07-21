import Image from "next/image";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/auth-helpers-nextjs";
import SignOutButton from "@/app/components/SignOutButton";
import { getLesson, getLessonsByModule, getUserProgress } from "@/lib/curriculum";
import LessonViewer from "./LessonViewer";

export default async function LessonPage({
  params,
}: {
  params: Promise<{ domain: string; module: string; lesson: string }>;
}) {
  const { domain: domainParam, module: moduleParam, lesson: lessonParam } = await params;
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
  const lessonNumber = lessonParam.toUpperCase();

  const [lesson, allLessons, progress] = await Promise.all([
    getLesson(lessonNumber).catch(() => null),
    getLessonsByModule(moduleNumber),
    getUserProgress(session.user.id),
  ]);

  if (!lesson) notFound();

  const sorted = [...allLessons].sort((a, b) => a.sort_order - b.sort_order);
  const currentIndex = sorted.findIndex(
    (l) => l.lesson_number === lessonNumber
  );
  const prevLesson = currentIndex > 0 ? sorted[currentIndex - 1] : null;
  const nextLesson =
    currentIndex < sorted.length - 1 ? sorted[currentIndex + 1] : null;

  const isComplete = progress.some(
    (p) => p.lesson_id === lesson.id && p.status === "completed"
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mod = (lesson as any).curriculum_modules;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const domain = mod?.curriculum_domains;

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
            href={`/curriculum/${domainNumber}/${moduleNumber}`}
            className="text-sm text-[#4B858E] hover:underline hidden sm:block"
          >
            Module {moduleNumber}
          </Link>
          <SignOutButton />
        </div>
      </nav>

      <main className="flex-1 px-6 py-12">
        <div className="w-full max-w-3xl mx-auto">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-[#76777A] mb-8 flex-wrap">
            <Link
              href="/curriculum"
              className="hover:text-[#4B858E] transition-colors"
            >
              Curriculum
            </Link>
            <span>/</span>
            <Link
              href={`/curriculum/${domainNumber}`}
              className="hover:text-[#4B858E] transition-colors"
            >
              {domain?.title ?? `Domain ${domainNumber}`}
            </Link>
            <span>/</span>
            <Link
              href={`/curriculum/${domainNumber}/${moduleNumber}`}
              className="hover:text-[#4B858E] transition-colors"
            >
              {mod?.title ?? `Module ${moduleNumber}`}
            </Link>
            <span>/</span>
            <span className="text-[#00205C]/40">{lesson.lesson_number}</span>
          </nav>

          <LessonViewer
            lesson={lesson}
            isComplete={isComplete}
            prevLesson={
              prevLesson
                ? {
                    lesson_number: prevLesson.lesson_number,
                    title: prevLesson.title,
                    href: `/curriculum/${domainNumber}/${moduleNumber}/${prevLesson.lesson_number}`,
                  }
                : null
            }
            nextLesson={
              nextLesson
                ? {
                    lesson_number: nextLesson.lesson_number,
                    title: nextLesson.title,
                    href: `/curriculum/${domainNumber}/${moduleNumber}/${nextLesson.lesson_number}`,
                  }
                : null
            }
            moduleHref={`/curriculum/${domainNumber}/${moduleNumber}`}
          />
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

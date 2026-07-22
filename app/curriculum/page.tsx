import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/auth-helpers-nextjs";
import SignOutButton from "@/app/components/SignOutButton";
import { getDomains } from "@/lib/curriculum";

export default async function CurriculumPage() {
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

  const domains = await getDomains();

  return (
    <div className="min-h-screen flex flex-col bg-offwhite">
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
            <Link
              href="/projects"
              className="text-sm text-[#4B858E] hover:underline hidden sm:block"
            >
              Projects
            </Link>
            <SignOutButton />
          </div>
        </div>
      </nav>

      <main className="flex-1 px-6 py-16">
        <div className="w-full max-w-4xl mx-auto">
          <p className="text-xs font-semibold tracking-widest text-[#4B858E] uppercase mb-4">
            WST PRACTITIONER CURRICULUM
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold text-[#00205C] mb-4 font-light">
            Six Domains.
          </h1>
          <p className="text-[#00205C]/70 text-lg mb-12 max-w-2xl font-normal">
            Work through each domain in order. Take your time with the material.
            This is not a certification — it is formation.
          </p>

          <div className="space-y-4">
            {domains.map((domain) => (
              <Link
                key={domain.id}
                href={`/curriculum/${domain.number}`}
                className="block group"
              >
                <div className="bg-white border border-[#00205C]/10 rounded-xl p-6 hover:border-[#4B858E]/50 hover:bg-[#00205C]/[0.04] transition-all duration-200">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-5">
                      <span className="text-3xl font-bold text-[#4B858E]/30 tabular-nums leading-tight flex-shrink-0 font-light">
                        {String(domain.number).padStart(2, "0")}
                      </span>
                      <div>
                        <h2 className="text-xl font-bold text-[#00205C] mb-1 group-hover:text-[#00205C] transition-colors font-light">
                          {domain.title}
                        </h2>
                        <p className="text-sm text-[#00205C]/60 mb-3 font-normal">
                          {domain.subtitle}
                        </p>
                        <div className="flex items-center gap-4">
                          <span className="text-xs text-[#76777A]">
                            {domain.estimated_hours}
                          </span>
                          {domain.prerequisites &&
                            domain.prerequisites !== "None" && (
                              <span className="text-xs text-[#76777A]">
                                Prereq: {domain.prerequisites}
                              </span>
                            )}
                        </div>
                      </div>
                    </div>
                    <span className="text-[#4B858E] text-lg flex-shrink-0 group-hover:translate-x-1 transition-transform mt-1">
                      →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
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

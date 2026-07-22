import Image from "next/image";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/auth-helpers-nextjs";
import SignOutButton from "@/app/components/SignOutButton";
import { getDomains, getModulesByDomain } from "@/lib/curriculum";

export default async function DomainPage({
  params,
}: {
  params: Promise<{ domain: string }>;
}) {
  const { domain: domainParam } = await params;
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

  const [domains, modules] = await Promise.all([
    getDomains(),
    getModulesByDomain(domainNumber),
  ]);

  const domain = domains.find((d) => d.number === domainNumber);
  if (!domain) notFound();

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
            <Link href="/curriculum" className="text-sm text-[#4B858E] hover:underline">
              Curriculum
            </Link>
            <SignOutButton />
          </div>
        </div>
      </nav>

      <main className="flex-1 px-6 py-16">
        <div className="w-full max-w-4xl mx-auto">
          <Link
            href="/curriculum"
            className="text-sm text-[#4B858E] hover:underline mb-8 inline-block"
          >
            ← All Domains
          </Link>

          <div className="mb-10">
            <p className="text-xs font-semibold tracking-widest text-[#4B858E] uppercase mb-3">
              Domain {domain.number}
            </p>
            <h1 className="text-4xl sm:text-5xl font-bold text-[#00205C] mb-3 font-light">
              {domain.title}
            </h1>
            <p className="text-[#00205C]/70 text-lg mb-5 font-normal">
              {domain.subtitle}
            </p>
            <div className="flex items-center gap-5 text-sm text-[#76777A]">
              <span>{domain.estimated_hours}</span>
              {domain.prerequisites && (
                <span>Prereq: {domain.prerequisites}</span>
              )}
            </div>
          </div>

          {/* Overview */}
          <div className="bg-white border border-[#00205C]/10 rounded-xl p-6 mb-8">
            <p className="text-xs font-semibold tracking-widest text-[#4B858E] uppercase mb-4">
              Overview
            </p>
            <div className="text-[#00205C]/80 text-sm leading-relaxed whitespace-pre-wrap font-normal">
              {domain.overview_text}
            </div>
          </div>

          {/* Practitioner Note */}
          {domain.practitioner_note && (
            <div className="border-l-2 border-[#4B858E] pl-5 mb-12">
              <p className="text-xs font-semibold tracking-widest text-[#4B858E] uppercase mb-3">
                Practitioner Note
              </p>
              <div className="text-[#00205C]/70 text-sm leading-relaxed whitespace-pre-wrap font-normal">
                {domain.practitioner_note}
              </div>
            </div>
          )}

          {/* Modules */}
          <h2 className="text-2xl font-bold text-[#00205C] mb-5 font-light">
            Modules
          </h2>
          <div className="space-y-3">
            {modules.map((mod) => (
              <Link
                key={mod.id}
                href={`/curriculum/${domain.number}/${mod.module_number}`}
                className="block group"
              >
                <div className="bg-white border border-[#00205C]/10 rounded-xl p-5 hover:border-[#4B858E]/50 hover:bg-[#00205C]/[0.04] transition-all duration-200">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-xs font-bold text-[#4B858E] bg-[#4B858E]/10 px-2 py-0.5 rounded">
                          {mod.module_number}
                        </span>
                        <span className="text-xs text-[#76777A]">
                          {mod.estimated_time}
                        </span>
                      </div>
                      <h3 className="text-base font-semibold text-[#00205C] group-hover:text-[#00205C] transition-colors font-medium">
                        {mod.title}
                      </h3>
                    </div>
                    <span className="text-[#4B858E] flex-shrink-0 group-hover:translate-x-1 transition-transform">
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

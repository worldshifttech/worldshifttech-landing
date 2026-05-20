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
  params: { domain: string };
}) {
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

  const domainNumber = parseInt(params.domain);
  if (isNaN(domainNumber)) notFound();

  const [domains, modules] = await Promise.all([
    getDomains(),
    getModulesByDomain(domainNumber),
  ]);

  const domain = domains.find((d) => d.number === domainNumber);
  if (!domain) notFound();

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#080C14" }}>
      <nav className="flex items-center justify-between px-6 py-5 border-b border-white/[0.06]">
        <Link href="/">
          <Image
            src="/World_shift_tech_LOGO_WHITE.png"
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
            <h1
              className="text-4xl sm:text-5xl font-bold text-[#F4F2EE] mb-3"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              {domain.title}
            </h1>
            <p
              className="text-[#F4F2EE]/70 text-lg mb-5"
              style={{ fontFamily: "var(--font-dm-sans)" }}
            >
              {domain.subtitle}
            </p>
            <div className="flex items-center gap-5 text-sm text-[#767B7A]">
              <span>{domain.estimated_hours}</span>
              {domain.prerequisites && (
                <span>Prereq: {domain.prerequisites}</span>
              )}
            </div>
          </div>

          {/* Overview */}
          <div className="bg-[#00205C]/30 border border-white/[0.06] rounded-xl p-6 mb-8">
            <p className="text-xs font-semibold tracking-widest text-[#4B858E] uppercase mb-4">
              Overview
            </p>
            <div
              className="text-[#F4F2EE]/80 text-sm leading-relaxed whitespace-pre-wrap"
              style={{ fontFamily: "var(--font-dm-sans)" }}
            >
              {domain.overview_text}
            </div>
          </div>

          {/* Practitioner Note */}
          {domain.practitioner_note && (
            <div className="border-l-2 border-[#4B858E] pl-5 mb-12">
              <p className="text-xs font-semibold tracking-widest text-[#4B858E] uppercase mb-3">
                Practitioner Note
              </p>
              <div
                className="text-[#F4F2EE]/70 text-sm leading-relaxed whitespace-pre-wrap"
                style={{ fontFamily: "var(--font-dm-sans)" }}
              >
                {domain.practitioner_note}
              </div>
            </div>
          )}

          {/* Modules */}
          <h2
            className="text-2xl font-bold text-[#F4F2EE] mb-5"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            Modules
          </h2>
          <div className="space-y-3">
            {modules.map((mod) => (
              <Link
                key={mod.id}
                href={`/curriculum/${domain.number}/${mod.module_number}`}
                className="block group"
              >
                <div className="bg-[#00205C]/40 border border-white/[0.08] rounded-xl p-5 hover:border-[#4B858E]/50 hover:bg-[#00205C]/60 transition-all duration-200">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-xs font-bold text-[#4B858E] bg-[#4B858E]/10 px-2 py-0.5 rounded">
                          {mod.module_number}
                        </span>
                        <span className="text-xs text-[#767B7A]">
                          {mod.estimated_time}
                        </span>
                      </div>
                      <h3
                        className="text-base font-semibold text-[#F4F2EE] group-hover:text-white transition-colors"
                        style={{ fontFamily: "var(--font-dm-sans)" }}
                      >
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

      <footer className="border-t border-white/[0.06] py-6 px-6">
        <div className="max-w-6xl mx-auto text-center text-[#767B7A] text-xs">
          &copy; {new Date().getFullYear()} World Shift Technologies
        </div>
      </footer>
    </div>
  );
}

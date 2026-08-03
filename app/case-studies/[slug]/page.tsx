import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Reveal from "@/app/components/Reveal";
import {
  formatLabel,
  getCaseStudy,
  getCaseStudySlugs,
  getStoryParagraphs,
} from "@/lib/case-studies";

const CALENDLY = "https://calendly.com/fractionalbusinesscompanion/wst";

export function generateStaticParams() {
  return getCaseStudySlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const caseStudy = getCaseStudy(slug);
  if (!caseStudy) return {};

  return {
    title: `${caseStudy.headline.split(".")[0]} — World Shift Technologies`,
    description: caseStudy.headline,
  };
}

export default async function CaseStudyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const caseStudy = getCaseStudy(slug);
  if (!caseStudy) notFound();

  const paragraphs = getStoryParagraphs(caseStudy.story);
  const stats = [
    { label: "Time Saved", value: caseStudy.results.time_saved },
    { label: "ROI", value: caseStudy.results.roi },
    { label: "Payback Period", value: caseStudy.results.payback_period },
  ].filter((stat) => stat.value);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav */}
      <nav className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-sm border-b border-[#00205C]/10 shadow-sm">
        <div className="flex items-center justify-between px-6 py-5 max-w-6xl mx-auto w-full">
          <Link href="/">
            <Image
              src="/World_shift_tech_LOGO_PRIMARY.png"
              alt="World Shift Technologies"
              width={180}
              height={45}
              className="object-contain"
              priority
            />
          </Link>
          <Link
            href="/operational-tools"
            className="text-sm font-medium text-[#4B858E] border border-[#4B858E]/60 px-5 py-2 rounded-full hover:bg-[#4B858E] hover:text-white hover:border-[#4B858E] transition-all duration-200"
          >
            &larr; Operational Tools
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto w-full px-6 pt-16 pb-14">
        <Reveal>
          <p className="text-[#4B858E] text-xs font-semibold tracking-[0.2em] uppercase mb-6">
            {formatLabel(caseStudy.client_type)}
            {caseStudy.industry ? ` · ${formatLabel(caseStudy.industry)}` : ""}
          </p>
          <h1 className="text-3xl sm:text-4xl xl:text-[2.75rem] font-light leading-[1.2] tracking-tight text-[#00205C]">
            {caseStudy.headline}
          </h1>
        </Reveal>
      </section>

      {/* Results stat row */}
      {stats.length > 0 && (
        <section className="w-full bg-white border-y border-[#00205C]/[0.1] py-10">
          <div className="max-w-4xl mx-auto px-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {stats.map((stat, i) => (
                <Reveal key={stat.label} delay={i * 80}>
                  <p className="text-[#4B858E] text-xs font-semibold tracking-[0.15em] uppercase mb-2">
                    {stat.label}
                  </p>
                  <p className="text-[#00205C] text-lg font-light leading-snug">{stat.value}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* The problem */}
      {caseStudy.pain_points.length > 0 && (
        <section className="max-w-4xl mx-auto w-full px-6 pt-14">
          <Reveal>
            <p className="text-[#00205C] font-semibold text-sm tracking-wide uppercase mb-6">
              The Problem
            </p>
            <ul className="space-y-3 mb-4">
              {caseStudy.pain_points.map((point) => (
                <li key={point} className="flex items-start gap-3">
                  <span className="text-[#4B858E] font-bold mt-0.5 leading-none">+</span>
                  <span className="text-[#00205C]/80 text-base leading-relaxed">
                    {point.charAt(0).toUpperCase() + point.slice(1)}
                  </span>
                </li>
              ))}
            </ul>
          </Reveal>
        </section>
      )}

      {/* The story */}
      <section className="max-w-4xl mx-auto w-full px-6 py-14">
        <Reveal>
          <p className="text-[#00205C] font-semibold text-sm tracking-wide uppercase mb-6">
            What We Built
          </p>
          <div className="space-y-4 text-[#00205C]/80 text-base leading-relaxed">
            {paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </Reveal>
      </section>

      {/* Tools used */}
      {caseStudy.tools_used.length > 0 && (
        <section className="max-w-4xl mx-auto w-full px-6 pb-14">
          <Reveal>
            <p className="text-[#00205C] font-semibold text-sm tracking-wide uppercase mb-5">
              Tools Involved
            </p>
            <div className="flex flex-wrap gap-2">
              {caseStudy.tools_used.map((tool) => (
                <span
                  key={tool}
                  className="text-xs font-medium text-[#00205C] bg-[#F4F2EE] border border-[#00205C]/[0.1] rounded-full px-3 py-1.5"
                >
                  {tool}
                </span>
              ))}
            </div>
          </Reveal>
        </section>
      )}

      {/* CTA */}
      <section className="w-full bg-[#00205C]/[0.04] border-t border-[#00205C]/[0.12] py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <Reveal>
            <h2 className="text-2xl sm:text-3xl font-light text-[#00205C] leading-[1.25] mb-4 max-w-lg mx-auto">
              Have a similar gap in your operations?
            </h2>
            <p className="text-gray text-base leading-relaxed max-w-md mx-auto mb-8">
              Let&apos;s talk through what you&apos;re dealing with and whether a tool like this
              one makes sense.
            </p>
            <a
              href={CALENDLY}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-[#4B858E] text-white text-base font-bold px-8 py-4 rounded-full hover:bg-[#3a6b73] transition-colors duration-200 shadow-lg shadow-[#4B858E]/20"
            >
              Book a Strategy Call &rarr;
            </a>
          </Reveal>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#00205C]/[0.12] py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-gray text-sm">
          <p>&copy; {new Date().getFullYear()} World Shift Technologies</p>
          <a
            href="mailto:drew@worldshifttech.com"
            className="hover:text-[#4B858E] transition-colors"
          >
            drew@worldshifttech.com
          </a>
        </div>
      </footer>
    </div>
  );
}

import Image from "next/image";
import Link from "next/link";
import Reveal from "@/app/components/Reveal";

export const metadata = {
  title: "Example Client Dashboard — World Shift Technologies",
  description:
    "A sample client-facing dashboard built from representative data, showing the kind of KPI dashboard and progress view I build on top of tools like ClickUp.",
};

const CALENDLY = "https://calendly.com/fractionalbusinesscompanion/wst";

const KPIS = [
  { label: "Tasks Completed This Sprint", value: "42", note: "+8 vs. last sprint" },
  { label: "On-Time Delivery", value: "94%", note: "Target: 90%" },
  { label: "Hours Saved via Automation", value: "11.5", note: "per week" },
  { label: "Open Quality Flags", value: "2", note: "down from 6" },
];

const PHASES = [
  {
    name: "Discovery",
    status: "Complete",
    window: "Week 1–2",
    detail: "Workspace audit, process mapping, and the client data record built out.",
  },
  {
    name: "Build",
    status: "In Progress",
    progress: 64,
    window: "Week 3–6",
    detail: "Integrations, QC agent, and the branded dashboard you're looking at right now.",
  },
  {
    name: "QA & Launch",
    status: "Upcoming",
    window: "Week 7",
    detail: "End-to-end testing against real workflows, then handoff to the live team.",
  },
  {
    name: "Optimize",
    status: "Upcoming",
    window: "Ongoing",
    detail: "Monthly tuning based on what the usage data actually shows.",
  },
];

const ACTIVITY = [
  { time: "2 hours ago", text: "Automation created: invoice sync from QuickBooks to project record" },
  { time: "Yesterday", text: "QC agent flagged 1 intake submission for manual review" },
  { time: "2 days ago", text: "Client data record schema finalized — 28 fields" },
  { time: "3 days ago", text: "KPI dashboard v1 shared with client for feedback" },
  { time: "5 days ago", text: "Discovery phase marked complete" },
];

const STATUS_STYLES: Record<string, string> = {
  Complete: "bg-[#4B858E]/15 text-[#4B858E] border-[#4B858E]/30",
  "In Progress": "bg-[#91B6BB]/20 text-[#00205C] border-[#91B6BB]/50",
  Upcoming: "bg-[#00205C]/[0.05] text-[#00205C]/50 border-[#00205C]/[0.12]",
};

export default function OperationalToolsExamplePage() {
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
      <section className="max-w-6xl mx-auto w-full px-6 pt-16 pb-14">
        <Reveal>
          <p className="text-[#4B858E] text-xs font-semibold tracking-[0.2em] uppercase mb-6">
            Sample Client Dashboard
          </p>
          <h1 className="text-3xl sm:text-4xl xl:text-[2.75rem] font-light leading-[1.15] tracking-tight text-[#00205C] mb-6 max-w-2xl">
            This is what your clients would see.
          </h1>
          <p className="text-gray text-lg leading-relaxed max-w-2xl">
            Everything below is built from representative sample data, not a real client. It
            shows the shape of a KPI dashboard and progress view built on top of a tool like
            ClickUp and skinned to look like your company instead of a third-party app. No two
            real builds look the same. This is just the pattern.
          </p>
        </Reveal>
      </section>

      {/* Sample data banner */}
      <div className="max-w-6xl mx-auto w-full px-6">
        <div className="bg-[#4B858E]/10 border border-[#4B858E]/30 rounded-lg px-5 py-3 text-sm text-[#00205C]/80 mb-4">
          <strong className="font-semibold">Sample data.</strong> Everything on this page is
          illustrative. Real dashboards are scoped and branded per client.
        </div>
      </div>

      {/* KPI strip */}
      <section className="max-w-6xl mx-auto w-full px-6 pt-8 pb-16">
        <Reveal>
          <p className="text-[#00205C] font-semibold text-sm tracking-wide uppercase mb-6">
            KPI Dashboard
          </p>
        </Reveal>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {KPIS.map((kpi, i) => (
            <Reveal
              key={kpi.label}
              delay={i * 80}
              className="bg-white border border-[#00205C]/[0.1] rounded-xl px-5 py-6"
            >
              <p className="text-[#00205C]/60 text-xs font-medium leading-snug mb-3">
                {kpi.label}
              </p>
              <p className="text-[#00205C] text-3xl font-light mb-1">{kpi.value}</p>
              <p className="text-[#4B858E] text-xs font-semibold">{kpi.note}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Progress map */}
      <section className="w-full bg-white py-16 border-y border-[#00205C]/[0.1]">
        <div className="max-w-6xl mx-auto px-6">
          <Reveal>
            <p className="text-[#00205C] font-semibold text-sm tracking-wide uppercase mb-8">
              Project Progress Map
            </p>
          </Reveal>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
            {PHASES.map((phase, i) => (
              <Reveal
                key={phase.name}
                delay={i * 100}
                className="bg-[#F4F2EE] rounded-xl px-5 py-6 flex flex-col"
              >
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[#00205C] font-light text-lg">{phase.name}</p>
                  <span
                    className={`text-[11px] font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full border ${STATUS_STYLES[phase.status]}`}
                  >
                    {phase.status}
                  </span>
                </div>
                <p className="text-[#00205C]/50 text-xs font-medium mb-3">{phase.window}</p>
                {typeof phase.progress === "number" && (
                  <div className="w-full h-1.5 rounded-full bg-[#00205C]/[0.08] mb-4 overflow-hidden">
                    <div
                      className="h-full bg-[#4B858E] rounded-full"
                      style={{ width: `${phase.progress}%` }}
                    />
                  </div>
                )}
                <p className="text-[#00205C]/70 text-sm leading-relaxed">{phase.detail}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Development progress / activity feed */}
      <section className="max-w-6xl mx-auto w-full px-6 py-16">
        <Reveal>
          <p className="text-[#00205C] font-semibold text-sm tracking-wide uppercase mb-8">
            Development Progress
          </p>
        </Reveal>
        <div className="max-w-2xl space-y-0 divide-y divide-[#00205C]/[0.08]">
          {ACTIVITY.map((item, i) => (
            <Reveal
              key={item.text}
              delay={i * 60}
              className="flex items-start gap-4 py-4"
            >
              <span className="flex-shrink-0 w-2 h-2 rounded-full bg-[#4B858E] mt-2" />
              <div>
                <p className="text-[#00205C] text-sm leading-relaxed">{item.text}</p>
                <p className="text-[#00205C]/45 text-xs mt-1">{item.time}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="w-full bg-[#00205C]/[0.04] border-t border-[#00205C]/[0.12] py-20">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <Reveal>
            <h2 className="text-2xl sm:text-3xl font-light text-[#00205C] leading-[1.25] mb-4 max-w-lg mx-auto">
              Want a dashboard like this branded for your business?
            </h2>
            <p className="text-gray text-base leading-relaxed max-w-md mx-auto mb-8">
              Built from the tools you already run, styled to look like you, not like a plugin.
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

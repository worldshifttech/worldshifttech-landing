import Image from "next/image";
import Link from "next/link";

const CALENDLY = "https://calendly.com/fractionalbusinesscompanion/wst";

export default function FractionalPage() {
  return (
    <div className="min-h-screen flex flex-col">

      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-6 max-w-6xl mx-auto w-full">
        <Link href="/">
          <Image
            src="/World_shift_tech_LOGO_WHITE.png"
            alt="World Shift Technologies"
            width={200}
            height={48}
            className="object-contain"
            priority
          />
        </Link>
        <a
          href={CALENDLY}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-bold text-[#080C14] bg-[#4B858E] px-5 py-2 rounded-full hover:bg-[#3a6b73] transition-colors duration-200"
        >
          Book a Call
        </a>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto w-full px-6 pt-16 pb-24">
        <p className="text-[#4B858E] text-xs font-semibold tracking-[0.2em] uppercase mb-6">
          ClickUp Certified Consultant
        </p>
        <h1
          className="text-4xl sm:text-5xl xl:text-[3.5rem] font-bold leading-[1.15] tracking-tight text-[#F4F2EE] mb-7 max-w-3xl"
          style={{ fontFamily: "var(--font-playfair)" }}
        >
          Your Operations, Finally{" "}
          <span className="text-[#4B858E]">Running Itself.</span>
        </h1>
        <p className="text-[#767B7A] text-lg leading-relaxed max-w-2xl mb-10">
          I embed as your Fractional COO and rebuild your ClickUp from the ground up, not just as a project
          manager, but as an intelligent system that works while you don&apos;t.
        </p>
        <a
          href={CALENDLY}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-[#4B858E] text-[#080C14] text-base font-bold px-8 py-4 rounded-full hover:bg-[#3a6b73] transition-colors duration-200 shadow-lg shadow-[#4B858E]/20"
        >
          Book a Strategy Call &rarr;
        </a>
      </section>

      {/* Credential Strip */}
      <section className="w-full border-y border-white/[0.06] bg-[#00205C]/30 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-0">
            <div className="px-8 py-3 text-center">
              <p className="text-[#4B858E] text-xs font-semibold tracking-[0.15em] uppercase mb-1">Certified</p>
              <p className="text-[#F4F2EE] font-semibold text-sm">ClickUp Verified Consultant</p>
            </div>
            <div className="hidden sm:block h-10 w-px bg-[#4B858E]/30" />
            <div className="px-8 py-3 text-center">
              <p className="text-[#4B858E] text-xs font-semibold tracking-[0.15em] uppercase mb-1">Certified</p>
              <p className="text-[#F4F2EE] font-semibold text-sm">ClickUp Power User</p>
            </div>
            <div className="hidden sm:block h-10 w-px bg-[#4B858E]/30" />
            <div className="px-8 py-3 text-center">
              <p className="text-[#4B858E] text-xs font-semibold tracking-[0.15em] uppercase mb-1">Certified</p>
              <p className="text-[#F4F2EE] font-semibold text-sm">ClickUp AI Power User</p>
            </div>
          </div>
          <p className="text-center text-[#767B7A] text-sm mt-8">
            One of a small number of consultants holding all three ClickUp certifications.
          </p>
        </div>
      </section>

      {/* What This Actually Means */}
      <section className="w-full bg-[#F4F2EE] py-20">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-[#4B858E] text-xs font-semibold tracking-[0.2em] uppercase mb-5">
            What this actually means
          </p>
          <h2
            className="text-3xl sm:text-4xl font-bold text-[#080C14] leading-[1.2] mb-14 max-w-xl"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            Fractional COO. ClickUp as the engine.
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Left column */}
            <div>
              <p className="text-[#080C14] font-semibold text-sm tracking-wide uppercase mb-6">
                What I bring
              </p>
              <ul className="space-y-4">
                {[
                  "Operational systems design",
                  "Process documentation and SOPs",
                  "Team accountability structures",
                  "KPI tracking and reporting",
                  "Project and delivery management",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="text-[#4B858E] font-bold mt-0.5 leading-none">+</span>
                    <span className="text-[#080C14]/80 text-base leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            {/* Right column */}
            <div>
              <p className="text-[#080C14] font-semibold text-sm tracking-wide uppercase mb-6">
                How ClickUp enables it
              </p>
              <ul className="space-y-4">
                {[
                  "Custom workspace builds tailored to your workflows",
                  "Automations that eliminate manual status updates",
                  "Dashboards that surface what matters in real time",
                  "AI agents that handle routing, triage, and follow-up",
                  "Integrations with your existing tools",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="text-[#4B858E] font-bold mt-0.5 leading-none">+</span>
                    <span className="text-[#080C14]/80 text-base leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* The Agent-First Difference */}
      <section className="w-full bg-[#00205C] py-20">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-[#4B858E] text-xs font-semibold tracking-[0.2em] uppercase mb-6">
            What most ClickUp consultants don&apos;t do
          </p>
          <h2
            className="text-3xl sm:text-4xl font-bold text-[#F4F2EE] leading-[1.2] mb-7 max-w-2xl"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            I don&apos;t just build your ClickUp. I build agents that run it.
          </h2>
          <p className="text-[#F4F2EE]/70 text-lg leading-relaxed max-w-2xl mb-14">
            Most ClickUp builds hand you a better to-do list. I build systems where ClickUp actively
            works, routing incoming requests, extracting action items from meeting notes, updating
            project status without anyone touching a thing. That&apos;s the difference between a tool
            and an operator.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "Meeting Notes to Tasks",
                description:
                  "AI agent that extracts action items from transcripts and creates assigned tasks automatically.",
              },
              {
                title: "Intake to Routing",
                description:
                  "New requests come in, get categorized, assigned, and scheduled without manual triage.",
              },
              {
                title: "Status to Reporting",
                description:
                  "Project health surfaces automatically. No chasing updates, no manual dashboards.",
              },
            ].map((card) => (
              <div
                key={card.title}
                className="bg-[#080C14]/40 border-t-[3px] border-[#4B858E] rounded-xl px-6 py-6"
              >
                <p
                  className="text-[#F4F2EE] font-bold text-base mb-3"
                  style={{ fontFamily: "var(--font-playfair)" }}
                >
                  {card.title}
                </p>
                <p className="text-[#F4F2EE]/70 text-sm leading-relaxed">{card.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who This Is For */}
      <section className="max-w-6xl mx-auto w-full px-6 py-20">
        <p className="text-[#4B858E] text-xs font-semibold tracking-[0.2em] uppercase mb-6">
          Is this you?
        </p>
        <h2
          className="text-3xl sm:text-4xl font-bold text-[#F4F2EE] leading-[1.2] mb-12 max-w-lg"
          style={{ fontFamily: "var(--font-playfair)" }}
        >
          You&apos;re in the right place if...
        </h2>
        <ul className="space-y-5 max-w-2xl">
          {[
            "You're running a growing team on ClickUp but it's not really working",
            "You need an operator, not just a setup guide",
            "You want automation that actually reduces your team's workload",
            "You've outgrown your current system but don't know how to rebuild it",
            "You want AI in your operations but don't know where to start",
          ].map((item) => (
            <li key={item} className="flex items-start gap-4">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#4B858E]/20 border border-[#4B858E]/50 flex items-center justify-center mt-0.5">
                <span className="text-[#4B858E] text-xs font-bold leading-none">&#10003;</span>
              </span>
              <span className="text-[#767B7A] text-base leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* CTA Section */}
      <section className="w-full bg-[#00205C]/40 border-t border-white/[0.06] py-24">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2
            className="text-3xl sm:text-4xl font-bold text-[#F4F2EE] leading-[1.25] mb-5 max-w-xl mx-auto"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            Let&apos;s look at what&apos;s possible.
          </h2>
          <p className="text-[#767B7A] text-base leading-relaxed max-w-md mx-auto mb-10">
            30 minutes. We look at your current setup and I tell you exactly what I&apos;d build.
          </p>
          <a
            href={CALENDLY}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-[#4B858E] text-[#080C14] text-base font-bold px-10 py-4 rounded-full hover:bg-[#3a6b73] transition-colors duration-200 shadow-lg shadow-[#4B858E]/20"
          >
            Book Your Strategy Call &rarr;
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-[#767B7A] text-sm">
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

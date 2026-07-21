import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "ClickUp Architecture and AI Agents — World Shift Technologies",
  description:
    "I architect simple and efficient ClickUp solutions and AI agents tailored to your organization's needs.",
};

const CALENDLY = "https://calendly.com/fractionalbusinesscompanion/wst";

export default function ClickUpPage() {
  return (
    <div className="min-h-screen flex flex-col">

      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-6 max-w-6xl mx-auto w-full">
        <Link href="/">
          <Image
            src="/World_shift_tech_LOGO_PRIMARY.png"
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
          className="text-sm font-bold text-white bg-[#4B858E] px-5 py-2 rounded-full hover:bg-[#3a6b73] transition-colors duration-200"
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
          className="text-4xl sm:text-5xl xl:text-[3.5rem] font-light leading-[1.15] tracking-tight text-[#00205C] mb-7 max-w-3xl"
        >
          ClickUp Architecture{" "}
          <span className="text-[#4B858E]">and AI Agents.</span>
        </h1>
        <p className="text-gray text-lg leading-relaxed max-w-2xl mb-10">
          I architect simple and efficient ClickUp solutions and AI agents tailored to your
          organization&apos;s needs.
        </p>
        <a
          href={CALENDLY}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-[#4B858E] text-white text-base font-bold px-8 py-4 rounded-full hover:bg-[#3a6b73] transition-colors duration-200 shadow-lg shadow-[#4B858E]/20"
        >
          Book a Strategy Call &rarr;
        </a>
      </section>

      {/* Credential Strip */}
      <section className="w-full border-y border-[#00205C]/[0.12] bg-[#00205C]/[0.04] py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-0">
            <div className="px-8 py-3 text-center">
              <p className="text-[#4B858E] text-xs font-semibold tracking-[0.15em] uppercase mb-1">Certified</p>
              <p className="text-[#00205C] font-semibold text-sm">ClickUp Verified Consultant</p>
            </div>
            <div className="hidden sm:block h-10 w-px bg-[#4B858E]/30" />
            <div className="px-8 py-3 text-center">
              <p className="text-[#4B858E] text-xs font-semibold tracking-[0.15em] uppercase mb-1">Certified</p>
              <p className="text-[#00205C] font-semibold text-sm">ClickUp Power User</p>
            </div>
            <div className="hidden sm:block h-10 w-px bg-[#4B858E]/30" />
            <div className="px-8 py-3 text-center">
              <p className="text-[#4B858E] text-xs font-semibold tracking-[0.15em] uppercase mb-1">Certified</p>
              <p className="text-[#00205C] font-semibold text-sm">ClickUp AI Power User</p>
            </div>
          </div>
          <p className="text-center text-gray text-sm mt-8">
            One of a small number of consultants holding all three ClickUp certifications.
          </p>
        </div>
      </section>

      {/* What I Offer */}
      <section className="w-full bg-[#F4F2EE] py-20">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-[#4B858E] text-xs font-semibold tracking-[0.2em] uppercase mb-5">
            What I offer
          </p>
          <h2
            className="text-3xl sm:text-4xl font-light text-[#00205C] leading-[1.2] mb-14 max-w-xl"
          >
            Fractional Operations Architect for ClickUp
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Left column */}
            <div>
              <p className="text-[#00205C] font-semibold text-sm tracking-wide uppercase mb-6">
                What I bring
              </p>
              <ul className="space-y-4">
                {[
                  "ClickUp audits and simplification",
                  "ClickUp architecting for departments and processes",
                  "Process documentation and SOPs",
                  "AI agents and automation",
                  "KPI tracking and reporting",
                  "Project and delivery management",
                  "Change management consulting",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="text-[#4B858E] font-bold mt-0.5 leading-none">+</span>
                    <span className="text-[#00205C]/80 text-base leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            {/* Right column */}
            <div>
              <p className="text-[#00205C] font-semibold text-sm tracking-wide uppercase mb-6">
                Specialties I bring along with ClickUp
              </p>
              <ul className="space-y-4">
                {[
                  "Zapier/Make automations",
                  "Integration support",
                  "Custom tools and add-ons",
                  "Team training and accountability",
                  "Fractional COO and project management support",
                  "Business strategy and scalable solutions",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="text-[#4B858E] font-bold mt-0.5 leading-none">+</span>
                    <span className="text-[#00205C]/80 text-base leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Simplicity and Scalability */}
      <section className="w-full bg-white py-20">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-[#4B858E] text-xs font-semibold tracking-[0.2em] uppercase mb-6">
            How I build
          </p>
          <h2
            className="text-3xl sm:text-4xl font-light text-[#00205C] leading-[1.2] mb-7 max-w-2xl"
          >
            I build your ClickUp with simplicity and scalability in mind.
          </h2>
          <p className="text-[#00205C]/70 text-lg leading-relaxed max-w-2xl mb-10">
            Most ClickUp builds are over-engineered, complicated, and create more work than they
            eliminate. I build ClickUp systems that are simple, built to scale with growth, and
            enhanced with lightweight AI and automations that actually assist your workflow.
          </p>
          <p className="text-[#4B858E] text-sm font-semibold tracking-[0.15em] uppercase mb-8">
            Examples of AI agents I&apos;ve built to simplify processes
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "Meeting Notes to Tasks",
                description:
                  "AI agents that extract action items from meeting transcripts and turn them into designated tasks for specific team members based on curated information about each person's role.",
              },
              {
                title: "Intake Processes",
                description:
                  "New client or project requests that require specific triaging, role designation, and information briefs to get accomplished according to your organization's processes.",
              },
              {
                title: "KPIs and Reporting",
                description:
                  "Creating the infrastructure, automation, and data organization needed to report on the exact KPIs your team leads or founders need to see.",
              },
            ].map((card) => (
              <div
                key={card.title}
                className="bg-[#F4F2EE] border-t-[3px] border-[#4B858E] rounded-xl px-6 py-6"
              >
                <p
                  className="text-[#00205C] font-light text-base mb-3"
                >
                  {card.title}
                </p>
                <p className="text-[#00205C]/70 text-sm leading-relaxed">{card.description}</p>
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
          className="text-3xl sm:text-4xl font-light text-[#00205C] leading-[1.2] mb-12 max-w-lg"
        >
          You&apos;re in the right place if...
        </h2>
        <ul className="space-y-5 max-w-2xl">
          {[
            "Your ClickUp is too much",
            "You are spending more time on admin than doing the work that matters most",
            "You want automation that actually reduces your team's workload",
            "You've outgrown your current system but are afraid to change or rebuild it",
            "You want AI in your operations but don't know where to start",
          ].map((item) => (
            <li key={item} className="flex items-start gap-4">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#4B858E]/20 border border-[#4B858E]/50 flex items-center justify-center mt-0.5">
                <span className="text-[#4B858E] text-xs font-bold leading-none">&#10003;</span>
              </span>
              <span className="text-gray text-base leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* CTA Section */}
      <section className="w-full bg-[#00205C]/[0.04] border-t border-[#00205C]/[0.12] py-24">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2
            className="text-3xl sm:text-4xl font-light text-[#00205C] leading-[1.25] mb-5 max-w-xl mx-auto"
          >
            Let&apos;s Get Your ClickUp Optimized.
          </h2>
          <p className="text-gray text-base leading-relaxed max-w-md mx-auto mb-10">
            Let&apos;s hop on a call to get to know each other and for me to understand your
            system.
          </p>
          <a
            href={CALENDLY}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-[#4B858E] text-white text-base font-bold px-10 py-4 rounded-full hover:bg-[#3a6b73] transition-colors duration-200 shadow-lg shadow-[#4B858E]/20"
          >
            Book Your Strategy Call &rarr;
          </a>
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

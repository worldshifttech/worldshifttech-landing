import Image from "next/image";
import Link from "next/link";
import Reveal from "@/app/components/Reveal";

export const metadata = {
  title: "Custom Operational Tools — World Shift Technologies",
  description:
    "System integrations, quality control agents, client data handling, and branded client-facing dashboards. I build the tools your operations need when off-the-shelf doesn't fit.",
};

const CALENDLY = "https://calendly.com/fractionalbusinesscompanion/wst";
const EXAMPLE_PATH = "/operational-tools/example";

const WHAT_I_BUILD = [
  {
    title: "Team Training Infrastructure",
    description:
      "Custom training built around how your team actually sells and works, instead of a slide deck nobody finishes.",
  },
  {
    title: "System & Data Integration",
    description:
      "Bridges between the tools you already run. Invoicing to project management, tracking spreadsheets to live dashboards, CSV exports reshaped into the format the next system needs.",
  },
  {
    title: "Quality Control & Process Gaps",
    description:
      "Agents that catch what a manual step forgets. Incoming requests classified and routed correctly, structured fields instead of free text, edge cases flagged before they become problems.",
  },
  {
    title: "Brand & Voice Tools",
    description:
      "Client-facing work that looks and sounds like you, from written communication to the dashboards clients actually log into.",
  },
  {
    title: "Client Data Handling",
    description:
      "One structured record as the source of truth for a client, captured once and pushed everywhere it's needed instead of retyped into five tools.",
  },
];

const IS_THIS_YOU = [
  "New hires take weeks to ramp because training is tribal knowledge, not a system",
  "Your invoicing, project management, and reporting tools don't talk to each other",
  "Quality slips through because there's no consistent check before things ship",
  "Your client dashboards and reports look like generic software, not like your company",
  "You're retyping the same client information into multiple tools because nothing shares data",
  "You've looked for a tool that does exactly what you need, and it doesn't exist",
];

export default function OperationalToolsPage() {
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
          <a
            href={CALENDLY}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-bold text-white bg-[#4B858E] px-5 py-2 rounded-full hover:bg-[#3a6b73] transition-colors duration-200"
          >
            Book a Call
          </a>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto w-full px-6 pt-16 pb-20">
        <Reveal>
          <p className="text-[#4B858E] text-xs font-semibold tracking-[0.2em] uppercase mb-6">
            Custom Operational Tools
          </p>
          <h1 className="text-4xl sm:text-5xl xl:text-[3.5rem] font-light leading-[1.15] tracking-tight text-[#00205C] mb-7 max-w-3xl">
            If The Right Tool Doesn&apos;t Exist,
            <br />
            <span className="text-[#4B858E]">I Build It.</span>
          </h1>
          <p className="text-gray text-lg leading-relaxed max-w-2xl mb-10">
            Most operational problems don&apos;t get solved by another subscription. Have a
            custom tool built for the exact gap you have, whether that&apos;s integrations,
            quality checks, client data, or the branded dashboards your clients actually see.
            Built to fit how your team works, not how a platform decided teams should work.
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
      </section>

      {/* What I Build — 5 card grid */}
      <section className="w-full bg-[#F4F2EE] py-20">
        <div className="max-w-6xl mx-auto px-6">
          <Reveal>
            <p className="text-[#4B858E] text-xs font-semibold tracking-[0.2em] uppercase mb-5">
              What I Build
            </p>
            <h2 className="text-3xl sm:text-4xl font-light text-[#00205C] leading-[1.2] mb-14 max-w-xl">
              Gaps I help close within operations
            </h2>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {WHAT_I_BUILD.map((card, i) => (
              <Reveal
                key={card.title}
                delay={i * 80}
                className="bg-white border-t-[3px] border-[#4B858E] rounded-xl px-6 py-6"
              >
                <p className="text-[#00205C] font-light text-lg mb-3">{card.title}</p>
                <p className="text-[#00205C]/70 text-sm leading-relaxed">{card.description}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Deep dive 1 — System & Data Integration */}
      <section className="w-full bg-white py-20">
        <div className="max-w-6xl mx-auto px-6">
          <Reveal>
            <p className="text-[#4B858E] text-xs font-semibold tracking-[0.2em] uppercase mb-6">
              Systems That Don&apos;t Talk To Each Other
            </p>
            <h2 className="text-2xl sm:text-3xl font-light text-[#00205C] mb-8 max-w-2xl">
              I build the bridge between the tools you already have.
            </h2>
            <p className="max-w-3xl text-[#00205C]/80 text-base leading-relaxed mb-10">
              When your invoicing tool doesn&apos;t talk to your project management tool, or a
              spreadsheet is the only thing tracking something that should update itself, the fix
              usually isn&apos;t a new platform. It&apos;s connecting the ones you already run.
            </p>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Reveal delay={0}>
              <Link
                href="/case-studies/operations-business-automation-suite"
                className="group block bg-[#F4F2EE] rounded-xl px-6 py-6 hover:bg-[#4B858E]/10 transition-colors duration-200"
              >
                <p className="text-[#4B858E] text-xs font-semibold tracking-[0.15em] uppercase mb-2">
                  Family-owned logistics operation
                </p>
                <p className="text-[#00205C]/70 text-sm leading-relaxed mb-4">
                  Finance, project management, and container tracking connected into one system.
                  12 to 24 hours saved per month.
                </p>
                <span className="text-[#4B858E] text-sm font-semibold group-hover:underline">
                  Read the case study &rarr;
                </span>
              </Link>
            </Reveal>
            <Reveal delay={120}>
              <Link
                href="/case-studies/nonprofit-donor-retention-automation"
                className="group block bg-[#F4F2EE] rounded-xl px-6 py-6 hover:bg-[#4B858E]/10 transition-colors duration-200"
              >
                <p className="text-[#4B858E] text-xs font-semibold tracking-[0.15em] uppercase mb-2">
                  Nonprofit donor operations
                </p>
                <p className="text-[#00205C]/70 text-sm leading-relaxed mb-4">
                  Donation platform connected to email marketing so cancellations trigger recovery
                  automatically. 3 to 5 hours saved per week.
                </p>
                <span className="text-[#4B858E] text-sm font-semibold group-hover:underline">
                  Read the case study &rarr;
                </span>
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Deep dive 2 — Quality Control & Process Gaps */}
      <section className="max-w-6xl mx-auto w-full px-6 py-20">
        <Reveal>
          <p className="text-[#4B858E] text-xs font-semibold tracking-[0.2em] uppercase mb-6">
            Catching What Slips Through
          </p>
          <h2 className="text-2xl sm:text-3xl font-light text-[#00205C] mb-8 max-w-2xl">
            Quality control that runs in the background, not a step someone forgets.
          </h2>
          <p className="max-w-3xl text-[#00205C]/80 text-base leading-relaxed mb-10">
            When every incoming request lands in the same queue and a person has to sort it by
            hand, that sorting becomes the bottleneck the moment volume picks up. A classification
            layer that reads each request and routes it correctly the first time turns that daily
            task into a background process.
          </p>
        </Reveal>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Reveal delay={0}>
            <Link
              href="/case-studies/creative-studio-triage-agent"
              className="group block bg-white border-t-[3px] border-[#4B858E] rounded-xl px-6 py-6 hover:bg-[#4B858E]/[0.06] transition-colors duration-200"
            >
              <p className="text-[#4B858E] text-xs font-semibold tracking-[0.15em] uppercase mb-2">
                Creative studio triage
              </p>
              <p className="text-[#00205C]/70 text-sm leading-relaxed mb-4">
                2 to 4 hours saved per week, manual PM sorting eliminated on 40 to 60 weekly
                submissions.
              </p>
              <span className="text-[#4B858E] text-sm font-semibold group-hover:underline">
                Read the case study &rarr;
              </span>
            </Link>
          </Reveal>
          <Reveal delay={120}>
            <Link
              href="/case-studies/creative-ops-intake-automation"
              className="group block bg-white border-t-[3px] border-[#4B858E] rounded-xl px-6 py-6 hover:bg-[#4B858E]/[0.06] transition-colors duration-200"
            >
              <p className="text-[#4B858E] text-xs font-semibold tracking-[0.15em] uppercase mb-2">
                Creative ops intake rebuild
              </p>
              <p className="text-[#00205C]/70 text-sm leading-relaxed mb-4">
                3 to 5 hours saved per week, routing errors eliminated across up to 60 submissions
                per week.
              </p>
              <span className="text-[#4B858E] text-sm font-semibold group-hover:underline">
                Read the case study &rarr;
              </span>
            </Link>
          </Reveal>
        </div>
      </section>

      {/* Deep dive 3 — Brand & Voice Tools */}
      <section className="w-full bg-[#00205C] py-20">
        <div className="max-w-6xl mx-auto px-6">
          <Reveal>
            <p className="text-[#91B6BB] text-xs font-semibold tracking-[0.2em] uppercase mb-6">
              Brand & Voice Tools
            </p>
            <h2 className="text-2xl sm:text-3xl font-light text-white mb-8 max-w-2xl">
              Brand isn&apos;t just what you write. It&apos;s what they see.
            </h2>
            <div className="max-w-3xl space-y-4 text-white/80 text-base leading-relaxed mb-10">
              <p>
                The bigger a team gets, the more client-facing work happens without the founder
                in the room. Proposals, support replies, onboarding emails. Every one of them is
                a chance to sound like a different company depending on who wrote it. I build
                tools that hold the line on that: an agent that drafts a first pass of client
                communication in your documented tone so the team edits instead of starting
                blank, and a review step that checks outbound copy against your voice guide
                before it goes out.
              </p>
              <p>
                Brand also shows up in what a client sees when they check on their project. A
                generic dashboard bolted onto someone else&apos;s software says something about
                your company whether you meant it to or not. I build the client-facing side of
                that separately, skinned to look like you: project management dashboards, KPI
                dashboards, progress maps, and development trackers that pull from the systems
                you already run and present it as your own branded experience instead of a
                third-party tool with your logo pasted on top.
              </p>
            </div>
          </Reveal>
          <Reveal
            delay={100}
            className="bg-white/[0.06] border border-white/15 rounded-xl px-6 py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-5 max-w-3xl"
          >
            <div>
              <p className="text-white font-light text-lg mb-1">
                See what a client would actually see.
              </p>
              <p className="text-white/70 text-sm leading-relaxed">
                A sample dashboard built from representative data, the kind of KPI and progress
                view I build on top of your existing tools.
              </p>
            </div>
            <Link
              href={EXAMPLE_PATH}
              className="flex-shrink-0 inline-block bg-[#4B858E] text-white text-sm font-bold px-6 py-3 rounded-full hover:bg-[#5a9aa4] transition-colors duration-200 text-center"
            >
              View the example &rarr;
            </Link>
          </Reveal>
        </div>
      </section>

      {/* Deep dive 4 — Client Data Handling */}
      <section className="max-w-6xl mx-auto w-full px-6 py-20">
        <Reveal>
          <p className="text-[#4B858E] text-xs font-semibold tracking-[0.2em] uppercase mb-6">
            Client Data Handling
          </p>
          <h2 className="text-2xl sm:text-3xl font-light text-[#00205C] mb-8 max-w-2xl">
            One record for a client, not five copies of the truth.
          </h2>
          <p className="max-w-3xl text-[#00205C]/80 text-base leading-relaxed mb-10">
            When client information gets typed into five different tools by five different
            people, something eventually stops matching. A single structured record, populated
            once and read by everything downstream, ends that.
          </p>
        </Reveal>
        <Reveal delay={0} className="max-w-3xl">
          <Link
            href="/case-studies/agency-onboarding-automation"
            className="group block bg-white border-t-[3px] border-[#4B858E] rounded-xl px-6 py-6 hover:bg-[#4B858E]/[0.06] transition-colors duration-200"
          >
            <p className="text-[#4B858E] text-xs font-semibold tracking-[0.15em] uppercase mb-2">
              Digital marketing agency onboarding
            </p>
            <p className="text-[#00205C]/70 text-sm leading-relaxed mb-4">
              6 to 10 hours saved per new client onboarded, manual data entry eliminated across 4
              onboarding workflows.
            </p>
            <span className="text-[#4B858E] text-sm font-semibold group-hover:underline">
              Read the case study &rarr;
            </span>
          </Link>
        </Reveal>
      </section>

      {/* Is this you? */}
      <section className="max-w-6xl mx-auto w-full px-6 py-20">
        <Reveal>
          <p className="text-[#4B858E] text-xs font-semibold tracking-[0.2em] uppercase mb-6">
            Is this you?
          </p>
          <h2 className="text-3xl sm:text-4xl font-light text-[#00205C] leading-[1.2] mb-12 max-w-lg">
            You&apos;re in the right place if...
          </h2>
          <ul className="space-y-5 max-w-2xl">
            {IS_THIS_YOU.map((item) => (
              <li key={item} className="flex items-start gap-4">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#4B858E]/20 border border-[#4B858E]/50 flex items-center justify-center mt-0.5">
                  <span className="text-[#4B858E] text-xs font-bold leading-none">&#10003;</span>
                </span>
                <span className="text-gray text-base leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </Reveal>
      </section>

      {/* CTA Section */}
      <section className="w-full py-24">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <Reveal>
            <h2 className="text-3xl sm:text-4xl font-light text-[#00205C] leading-[1.25] mb-5 max-w-xl mx-auto">
              Let&apos;s find the gap worth closing.
            </h2>
            <p className="text-gray text-base leading-relaxed max-w-md mx-auto mb-10">
              Tell me what your team is duct-taping together right now. We&apos;ll figure out
              whether it needs a tool or just a better process.
            </p>
            <a
              href={CALENDLY}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-[#4B858E] text-white text-base font-bold px-10 py-4 rounded-full hover:bg-[#3a6b73] transition-colors duration-200 shadow-lg shadow-[#4B858E]/20"
            >
              Book Your Strategy Call &rarr;
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

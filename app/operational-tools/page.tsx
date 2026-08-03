import Image from "next/image";
import Link from "next/link";
import Reveal from "@/app/components/Reveal";

export const metadata = {
  title: "Custom Operational Tools — World Shift Technologies",
  description:
    "Training academies, system integrations, quality control agents, and brand voice tools. I build the software your operations need when off-the-shelf doesn't fit.",
};

const CALENDLY = "https://calendly.com/fractionalbusinesscompanion/wst";

const WHAT_I_BUILD = [
  {
    title: "Team Training Infrastructure",
    description:
      "Custom training academies built around how your team actually sells and works. Diagnostic placement, spaced-repetition review, and branching practice scenarios instead of a slide deck nobody finishes.",
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
      "Tools that keep client-facing work sounding like you. Draft communications and review copy against a documented voice guide before anything goes out.",
  },
];

const IS_THIS_YOU = [
  "New hires take weeks to ramp because training is tribal knowledge, not a system",
  "Your invoicing, project management, and reporting tools don't talk to each other",
  "Quality slips through because there's no consistent check before things ship",
  "Client-facing communication sounds different depending on who wrote it",
  "You've looked for a tool that does exactly what you need, and it doesn't exist",
];

const PRICING = [
  {
    tier: "Starter",
    range: "$500–$997/mo",
    detail: "One tool, one gap. Solo professionals and lean teams.",
  },
  {
    tier: "Growth",
    range: "$1,500–$2,497/mo",
    detail: "Multiple tools working together. Most popular for growing teams.",
  },
  {
    tier: "Agency Scale",
    range: "$2,500–$5,000/mo",
    detail: "Full operational systems across departments and clients.",
  },
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
            If The Right Tool Doesn&apos;t Exist,{" "}
            <span className="text-[#4B858E]">I Build It.</span>
          </h1>
          <p className="text-gray text-lg leading-relaxed max-w-2xl mb-10">
            Most operational problems don&apos;t get solved by another subscription. They get
            solved by a tool built for the exact gap you have. I build training systems,
            integrations, quality checks, and brand tools that fit how your team actually
            works, not how a platform decided teams should work.
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

      {/* What I Build — 4 card grid */}
      <section className="w-full bg-[#F4F2EE] py-20">
        <div className="max-w-6xl mx-auto px-6">
          <Reveal>
            <p className="text-[#4B858E] text-xs font-semibold tracking-[0.2em] uppercase mb-5">
              What I Build
            </p>
            <h2 className="text-3xl sm:text-4xl font-light text-[#00205C] leading-[1.2] mb-14 max-w-xl">
              Four kinds of gaps I close for operations teams
            </h2>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {WHAT_I_BUILD.map((card, i) => (
              <Reveal
                key={card.title}
                delay={i * 100}
                className="bg-white border-t-[3px] border-[#4B858E] rounded-xl px-6 py-6"
              >
                <p className="text-[#00205C] font-light text-lg mb-3">{card.title}</p>
                <p className="text-[#00205C]/70 text-sm leading-relaxed">{card.description}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Deep dive 1 — Team Training Infrastructure */}
      <section className="max-w-6xl mx-auto w-full px-6 py-20">
        <Reveal>
          <p className="text-[#4B858E] text-xs font-semibold tracking-[0.2em] uppercase mb-6">
            Team Training Infrastructure
          </p>
          <h2 className="text-2xl sm:text-3xl font-light text-[#00205C] mb-8 max-w-2xl">
            Training that actually sticks, built around how your team sells and works.
          </h2>
          <div className="max-w-3xl space-y-4 text-[#00205C]/80 text-base leading-relaxed">
            <p>
              Most training lives in a slide deck or a shared doc that gets skimmed once and
              never opened again. For a manufacturer selling complex technical equipment, I
              built a full training academy for their sales team instead: a diagnostic
              placement that routes new hires and experienced reps onto different tracks,
              lessons built around the actual sales method the team uses (not generic theory),
              and spaced-repetition review that resurfaces material right before it would
              otherwise be forgotten.
            </p>
            <p>
              The centerpiece is a branching practice arena where reps rehearse real
              conversations and get scored against the specific behaviors that close deals for
              that product, not a canned script. It lives wherever the team already works and
              updates as the product line or messaging changes, so onboarding a new rep stops
              depending on whoever has an hour free to walk them through it.
            </p>
          </div>
        </Reveal>
      </section>

      {/* Deep dive 2 — System & Data Integration */}
      <section className="w-full bg-white py-20">
        <div className="max-w-6xl mx-auto px-6">
          <Reveal>
            <p className="text-[#4B858E] text-xs font-semibold tracking-[0.2em] uppercase mb-6">
              Systems That Don&apos;t Talk To Each Other
            </p>
            <h2 className="text-2xl sm:text-3xl font-light text-[#00205C] mb-8 max-w-2xl">
              I build the bridge between the tools you already have.
            </h2>
            <div className="max-w-3xl space-y-4 text-[#00205C]/80 text-base leading-relaxed mb-10">
              <p>
                A family-owned operations business was tracking shipping containers by logging
                into an outside system and updating a spreadsheet by hand. Their invoicing tool
                and their project management tool had never been connected, so finance and
                delivery were always a step behind each other. A nonprofit was losing recurring
                donors because a cancelled payment sat unnoticed until someone happened to check.
              </p>
              <p>
                In each case the fix wasn&apos;t a new platform. It was connecting the ones
                already in use: live tracking data posted automatically into the right task,
                invoices syncing to project records the moment they&apos;re created, a failed
                payment triggering a recovery sequence instead of waiting for someone to catch
                it. Spreadsheets and CSV exports get reshaped into whatever format the next
                system actually needs, on a schedule, without anyone doing it by hand.
              </p>
            </div>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Reveal className="bg-[#F4F2EE] rounded-xl px-6 py-6" delay={0}>
              <p className="text-[#4B858E] text-xs font-semibold tracking-[0.15em] uppercase mb-2">
                Family-owned logistics operation
              </p>
              <p className="text-[#00205C]/70 text-sm leading-relaxed">
                Finance, project management, and container tracking connected into one system.
                8 to 12 hours saved per month, manual data entry eliminated across 3 disconnected
                tools.
              </p>
            </Reveal>
            <Reveal className="bg-[#F4F2EE] rounded-xl px-6 py-6" delay={120}>
              <p className="text-[#4B858E] text-xs font-semibold tracking-[0.15em] uppercase mb-2">
                Nonprofit donor operations
              </p>
              <p className="text-[#00205C]/70 text-sm leading-relaxed">
                Donation platform connected to email marketing so cancellations and failed
                payments trigger recovery automatically. 3 to 5 hours saved per week, live within
                the first month.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Deep dive 3 — Quality Control & Process Gaps */}
      <section className="max-w-6xl mx-auto w-full px-6 py-20">
        <Reveal>
          <p className="text-[#4B858E] text-xs font-semibold tracking-[0.2em] uppercase mb-6">
            Catching What Slips Through
          </p>
          <h2 className="text-2xl sm:text-3xl font-light text-[#00205C] mb-8 max-w-2xl">
            Quality control that runs in the background, not a step someone forgets.
          </h2>
          <div className="max-w-3xl space-y-4 text-[#00205C]/80 text-base leading-relaxed mb-10">
            <p>
              A high-volume creative studio had every incoming request landing in the same
              queue, and a project manager had to read each one and manually sort it before
              anyone could start work. On a busy week that sorting became the bottleneck. A
              sister studio inside a larger organization had the opposite problem: an intake
              form built by a contractor who was long gone, stale dropdowns, and project managers
              copy-pasting the same ID prefix into 60 tasks a week by hand.
            </p>
            <p>
              The fix in both cases was a classification layer that reads each request as it
              arrives and routes it correctly the first time, applying the right labels,
              assignments, and priority based on rules specific to that request type. Structured
              fields replace free text so bad data can&apos;t get through. Only genuine edge
              cases surface for a human to look at. What used to be a daily sorting task became a
              background process.
            </p>
          </div>
        </Reveal>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Reveal className="bg-white border-t-[3px] border-[#4B858E] rounded-xl px-6 py-6" delay={0}>
            <p className="text-[#4B858E] text-xs font-semibold tracking-[0.15em] uppercase mb-2">
              Creative studio triage
            </p>
            <p className="text-[#00205C]/70 text-sm leading-relaxed">
              2 to 4 hours saved per week, manual PM sorting eliminated on 40 to 60 weekly
              submissions.
            </p>
          </Reveal>
          <Reveal className="bg-white border-t-[3px] border-[#4B858E] rounded-xl px-6 py-6" delay={120}>
            <p className="text-[#4B858E] text-xs font-semibold tracking-[0.15em] uppercase mb-2">
              Creative ops intake rebuild
            </p>
            <p className="text-[#00205C]/70 text-sm leading-relaxed">
              3 to 5 hours saved per week, routing errors eliminated across up to 60 submissions
              per week.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Deep dive 4 — Brand & Voice Tools */}
      <section className="w-full bg-[#00205C] py-20">
        <div className="max-w-6xl mx-auto px-6">
          <Reveal>
            <p className="text-[#91B6BB] text-xs font-semibold tracking-[0.2em] uppercase mb-6">
              Sounding Like You At Scale
            </p>
            <h2 className="text-2xl sm:text-3xl font-light text-white mb-8 max-w-2xl">
              Keep your voice consistent even when you&apos;re not the one writing.
            </h2>
            <div className="max-w-3xl space-y-4 text-white/80 text-base leading-relaxed">
              <p>
                The bigger a team gets, the more client-facing writing happens without the
                founder in the room. Proposals, support replies, onboarding emails, social copy.
                Every one of them is a chance to sound like a different company depending on who
                typed it.
              </p>
              <p>
                I build tools that hold the line on that: an agent that drafts a first pass of
                client communication in your documented tone so the team edits instead of
                starting blank, and a review step that checks outbound copy against your voice
                guide before it goes out. The goal isn&apos;t to automate the writing away. It&apos;s
                to make sure the work still sounds like the person who started the company, even
                on the days you didn&apos;t write it.
              </p>
            </div>
          </Reveal>
        </div>
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

      {/* Pricing strip */}
      <section className="w-full bg-[#F4F2EE] border-y border-[#00205C]/[0.12] py-20">
        <div className="max-w-6xl mx-auto px-6">
          <Reveal>
            <p className="text-[#4B858E] text-xs font-semibold tracking-[0.2em] uppercase mb-5">
              Investment
            </p>
            <h2 className="text-3xl sm:text-4xl font-light text-[#00205C] leading-[1.2] mb-14 max-w-xl">
              Every tool is scoped and priced to the problem it solves.
            </h2>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {PRICING.map((tier, i) => (
              <Reveal
                key={tier.tier}
                delay={i * 100}
                className="bg-white rounded-xl px-6 py-7 border border-[#00205C]/[0.1]"
              >
                <p className="text-[#00205C] font-light text-lg mb-1">{tier.tier}</p>
                <p className="text-[#4B858E] font-semibold text-xl mb-4">{tier.range}</p>
                <p className="text-[#00205C]/70 text-sm leading-relaxed">{tier.detail}</p>
              </Reveal>
            ))}
          </div>
        </div>
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

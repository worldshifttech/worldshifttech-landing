import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import AuthModal from "@/app/components/AuthModal";
import CurriculumNavLink from "@/app/components/CurriculumNavLink";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-6 max-w-6xl mx-auto w-full">
        <Image
          src="/World_shift_tech_LOGO_PRIMARY.png"
          alt="World Shift Technologies"
          width={180}
          height={45}
          className="object-contain"
          priority
        />
        <div className="flex items-center gap-3">
          <a
            href="https://calendly.com/fractionalbusinesscompanion/wst"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-[#4B858E] border border-[#4B858E]/60 px-5 py-2 rounded-full hover:bg-[#4B858E] hover:text-white hover:border-[#4B858E] transition-all duration-200"
          >
            Book a Call
          </a>
          <Link
            href="/your-team-and-ai"
            className="text-sm font-medium text-[#4B858E] border border-[#4B858E]/60 px-5 py-2 rounded-full hover:bg-[#4B858E] hover:text-white hover:border-[#4B858E] transition-all duration-200"
          >
            Your Team &amp; AI
          </Link>
          <Link
            href="/impact"
            className="text-sm font-medium text-[#4B858E] border border-[#4B858E]/60 px-5 py-2 rounded-full hover:bg-[#4B858E] hover:text-white hover:border-[#4B858E] transition-all duration-200"
          >
            Impact
          </Link>
          <Suspense fallback={null}>
            <CurriculumNavLink />
          </Suspense>
          <Suspense fallback={null}>
            <AuthModal />
          </Suspense>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-6 pt-12 pb-24">
        <div className="flex flex-col-reverse lg:flex-row items-center gap-12 lg:gap-20">

          {/* Left: Text content */}
          <div className="flex-1 text-center lg:text-left">
            <p className="text-[#4B858E] text-xs font-semibold tracking-[0.2em] uppercase mb-7">
              BUILT LEAN. BUILT GREEN.
            </p>

            <h1
              className="text-4xl sm:text-5xl xl:text-[3.5rem] font-bold leading-[1.15] tracking-tight text-[#F4F2EE] mb-7"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              AI is not going anywhere.
              <br />
              <span className="text-[#4B858E]">That doesn&apos;t mean you need it everywhere.</span>
            </h1>

            <p className="text-[#767B7A] text-lg leading-relaxed max-w-lg mx-auto lg:mx-0 mb-10">
              I audit how SMBs use AI, their tech stack, and their teams. I build the leaner version that works and protects the people doing the work.
            </p>

            <Link
              href="/audit"
              className="inline-block bg-[#4B858E] text-white text-base font-semibold px-8 py-4 rounded-full hover:bg-[#3a6b73] transition-colors duration-200 shadow-lg shadow-[#4B858E]/20"
            >
              Start with the audit
            </Link>

            <p className="mt-4 text-[#767B7A] text-sm">
              See how it works
            </p>
          </div>

          {/* Right: Headshot */}
          <div className="flex-shrink-0 relative">
            <div className="absolute inset-0 rounded-2xl bg-[#4B858E]/10 blur-2xl scale-110" />
            <div className="relative w-64 h-80 sm:w-72 sm:h-96 lg:w-80 lg:h-[420px] rounded-2xl overflow-hidden border border-[#4B858E]/25 shadow-2xl">
              <Image
                src="/Drew_Headshot.jpg"
                alt="Drew Griffiths"
                fill
                className="object-cover object-top"
                priority
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#080C14]/90 via-[#080C14]/40 to-transparent px-5 py-4">
                <p className="text-[#F4F2EE] font-semibold text-sm">Drew Griffiths</p>
                <p className="text-[#4B858E] text-xs">Founder, World Shift Technologies</p>
              </div>
            </div>
          </div>
        </div>

        {/* Problem Section */}
        <div className="mt-20 pt-12 border-t border-white/[0.08]">
          <div className="max-w-3xl space-y-4 text-[#767B7A] text-base leading-relaxed">
            <p>
              Most businesses said yes to AI because that is where things were going. Now you have a ChatGPT subscription. Your CRM has AI features you did not ask for. Your project manager added an AI notetaker. Someone set up an automation that nobody fully understands anymore.
            </p>
            <p>Some of it helps. A lot of it just runs.</p>
            <p>
              Every tool running is using compute. Every automation firing is using energy. Every AI credit spent is costing something, in money, in carbon, in the attention of people on your team who were hired to do work that is quietly shifting under them.
            </p>
            <p>
              You have agents doing jobs a simpler script could handle for a tenth of the cost. Overlapping subscriptions nobody has looked at. And nobody tracking what any of it is doing to your footprint, or to the people who showed up for a vision that is now running on autopilot.
            </p>
            <p>The fix is not ditching AI. It is running only what is necessary.</p>
          </div>
        </div>

        {/* What I Do Strip */}
        <div className="mt-20 pt-12 border-t border-white/[0.08]">
          <p className="text-center text-[#767B7A] text-xs tracking-widest uppercase mb-10">
            What I Do
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div className="bg-[#00205C]/20 border border-white/[0.06] rounded-xl px-6 py-6">
              <h3
                className="text-xl font-bold text-[#F4F2EE] mb-3"
                style={{ fontFamily: "var(--font-playfair)" }}
              >
                The Audit
              </h3>
              <p className="text-[#767B7A] text-sm leading-relaxed">
                A structured look across people, processes, and technology. I map who is doing what and whether the work still matches what they were hired for. I trace how work actually flows. I document every tool you are running, what it costs, what it produces, and what it is taking from your team. You get a plain-language report.
              </p>
            </div>
            <div className="bg-[#00205C]/20 border border-white/[0.06] rounded-xl px-6 py-6">
              <h3
                className="text-xl font-bold text-[#F4F2EE] mb-3"
                style={{ fontFamily: "var(--font-playfair)" }}
              >
                The Build
              </h3>
              <p className="text-[#767B7A] text-sm leading-relaxed">
                After the audit, I design the system that fits: people, processes, and technology working together with as little AI as it takes to get the result. Sometimes that is one agent replacing three subscriptions. Sometimes it is cutting five things and building nothing. Whatever the audit says you actually need. Built lean. Owned by you. No monthly fee to me.
              </p>
            </div>
            <div className="bg-[#00205C]/20 border border-white/[0.06] rounded-xl px-6 py-6">
              <h3
                className="text-xl font-bold text-[#F4F2EE] mb-3"
                style={{ fontFamily: "var(--font-playfair)" }}
              >
                The Impact
              </h3>
              <p className="text-[#767B7A] text-sm leading-relaxed">
                AI has a real energy cost. Every model inference, every automation running, every tool idling adds up. A fixed portion of every project goes into verified programs doing real work on that problem. Reforestation. Ocean cleanup. Renewable infrastructure in underserved areas. Not offset schemes. Programs chosen for transparency and accountability. Every invoice shows the line item and a link to the program.
              </p>
            </div>
          </div>
        </div>

        {/* Audience Mirrors */}
        <div className="mt-20 pt-12 border-t border-white/[0.08]">
          <h2
            className="text-2xl sm:text-3xl font-bold text-[#F4F2EE] mb-10"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            Who this is for
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div>
              <h3
                className="text-lg font-bold text-[#4B858E] mb-3"
                style={{ fontFamily: "var(--font-playfair)" }}
              >
                Ops and systems leads
              </h3>
              <p className="text-[#767B7A] text-sm leading-relaxed">
                You know the stack is a mess. You have watched tools get adopted without a plan, automations get built and never cleaned up, and the same data entered in three places. You do not need someone to tell you that. You need someone to map it and fix it.
              </p>
            </div>
            <div>
              <h3
                className="text-lg font-bold text-[#4B858E] mb-3"
                style={{ fontFamily: "var(--font-playfair)" }}
              >
                Founders
              </h3>
              <p className="text-[#767B7A] text-sm leading-relaxed">
                You said yes to AI tools because everyone was saying yes. Some of them helped. Most just added overhead. You want to know what is worth keeping, and what it is doing to the people you hired.
              </p>
            </div>
            <div>
              <h3
                className="text-lg font-bold text-[#4B858E] mb-3"
                style={{ fontFamily: "var(--font-playfair)" }}
              >
                Agencies and consultants
              </h3>
              <p className="text-[#767B7A] text-sm leading-relaxed">
                Your clients are asking about AI. You want to give them a real answer, not a sales pitch. The audit is something you can offer as a standalone service, with a builder behind it who will be honest about what they actually need.
              </p>
            </div>
          </div>
        </div>

        {/* Green By Design */}
        <div className="mt-20 pt-12 border-t border-white/[0.08]">
          <p className="text-[#4B858E] text-xs font-semibold tracking-[0.2em] uppercase mb-6">
            BUILT LEAN. BUILT GREEN.
          </p>
          <div className="max-w-3xl space-y-4 text-[#767B7A] text-base leading-relaxed">
            <p>
              My goal is simple: help organizations understand the real cost of the systems they are running and make sure they are using as little AI as it takes to do the most good for their team.
            </p>
            <p>
              That means operations running on infrastructure committed to renewable energy. Lean code by default. No idle processes, no bloated workflows, no systems running just because nobody turned them off.
            </p>
            <p>AI is not going away. That does not mean it has to cost more than it should.</p>
          </div>
        </div>

        {/* Drew Section */}
        <div className="mt-20 pt-12 border-t border-white/[0.08]">
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-start">
            <div className="flex-shrink-0 relative">
              <div className="absolute inset-0 rounded-2xl bg-[#4B858E]/10 blur-2xl scale-110" />
              <div className="relative w-48 h-60 sm:w-56 sm:h-72 rounded-2xl overflow-hidden border border-[#4B858E]/25 shadow-2xl">
                <Image
                  src="/Drew_Headshot.jpg"
                  alt="Drew Griffiths"
                  fill
                  className="object-cover object-top"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#080C14]/90 via-[#080C14]/40 to-transparent px-4 py-3">
                  <p className="text-[#F4F2EE] font-semibold text-sm">Drew Griffiths</p>
                  <p className="text-[#4B858E] text-xs">Founder, World Shift Technologies</p>
                </div>
              </div>
            </div>
            <div className="flex-1">
              <h2
                className="text-2xl sm:text-3xl font-bold text-[#F4F2EE] mb-6"
                style={{ fontFamily: "var(--font-playfair)" }}
              >
                Hi, I&apos;m Drew.
              </h2>
              <div className="space-y-4 text-[#767B7A] text-base leading-relaxed max-w-2xl">
                <p>
                  I have been consulting in operations for over nine years. I have been part of many teams, seen many systems built, helped set up automations and documentation, defined roles, and trained people across organizations of all sizes.
                </p>
                <p>
                  Most of the time, what I find is the same across all of them: underdocumented operations, overautomated systems, overcomplicated processes, and team members whose roles have never been fully scoped or talked through. When something changes, the change management piece is where teams fall apart. It always has been.
                </p>
                <p>
                  AI has not fixed that. It has sped it up. It moves fast enough now that most organizations have no time to make sure anything is actually being handled before the next thing arrives.
                </p>
                <p>
                  I have been working in and around AI for four years. I am not anti-AI. I understand there are real use cases that actually help. What I am against is waste: tools running that earn nothing, automations firing on bad data, and teams being reshaped around technology before anyone asked whether they should be.
                </p>
                <p>
                  My job is to help organizations understand where AI actually earns its place, and to make sure they do not fall into the trap of thinking AI will fix what was already broken before it arrived.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Final CTA */}
        <div className="mt-20 pt-12 border-t border-white/[0.08] text-center">
          <h2
            className="text-2xl sm:text-3xl font-bold text-[#F4F2EE] mb-4"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            Tell me what you&apos;re running.
          </h2>
          <p className="text-[#767B7A] text-base mb-8 max-w-lg mx-auto">
            The initial audit is free. Start there.
          </p>
          <Link
            href="/audit"
            className="inline-block bg-[#4B858E] text-white text-base font-semibold px-8 py-4 rounded-full hover:bg-[#3a6b73] transition-colors duration-200 shadow-lg shadow-[#4B858E]/20"
          >
            Start with the audit
          </Link>
        </div>
      </main>

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

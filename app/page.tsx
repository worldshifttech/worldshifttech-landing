import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import AuthModal from "@/app/components/AuthModal";

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
              Your AI stack is probably
              <br className="hidden sm:block" /> 60% waste.
              <br />
              <span className="text-[#4B858E]">I can show you which 60%.</span>
            </h1>

            <p className="text-[#767B7A] text-lg leading-relaxed max-w-lg mx-auto lg:mx-0 mb-10">
              I audit how SMBs use AI, design the leanest version that works, and build what needs to be built. A portion of every project goes into verified environmental programs. Not offsets. Real work.
            </p>

            <Link
              href="/projects/new"
              className="inline-block bg-[#4B858E] text-white text-base font-semibold px-8 py-4 rounded-full hover:bg-[#3a6b73] transition-colors duration-200 shadow-lg shadow-[#4B858E]/20"
            >
              Start with the audit
            </Link>

            <p className="mt-4 text-[#767B7A] text-sm">
              See how the audit works
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
          <h2
            className="text-2xl sm:text-3xl font-bold text-[#F4F2EE] mb-8 max-w-3xl"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            Two years into the AI wave, most SMBs are in the same place.
          </h2>
          <div className="max-w-3xl space-y-4 text-[#767B7A] text-base leading-relaxed">
            <p>
              You adopted tools fast because you were supposed to. You have a ChatGPT subscription, a Make account, maybe Zapier, possibly something your last consultant set up that nobody fully understands. Some of it works. A lot of it runs in the background and nobody is sure why. You are paying for things that overlap. You have automations firing on bad data. You have agents doing jobs that a simpler script could handle for a tenth of the cost.
            </p>
            <p>Nobody audited any of it. There was no time.</p>
            <p>
              Meanwhile, every one of those tools is running on infrastructure that costs something. In compute, in energy, in actual planetary impact. The waste is not just a line item on your P&amp;L. It adds up.
            </p>
            <p>The fix is not ditching AI. It is using it precisely.</p>
          </div>
        </div>

        {/* What I Build Strip */}
        <div className="mt-20 pt-12 border-t border-white/[0.08]">
          <p className="text-center text-[#767B7A] text-xs tracking-widest uppercase mb-10">
            What I Build
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
                A 2 to 3 week diagnostic of your entire AI and automation stack. What you are running, what it costs, what it is actually doing, and what is waste. You get a plain-language report. Most clients find 30 to 60 percent of their stack is redundant or running badly.
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
                After the audit, I design the leaner replacement and build what needs replacing. Custom integrations, AI agents, internal tools. Built once, owned by you, no monthly fee to me.
              </p>
            </div>
            <div className="bg-[#00205C]/20 border border-white/[0.06] rounded-xl px-6 py-6">
              <h3
                className="text-xl font-bold text-[#F4F2EE] mb-3"
                style={{ fontFamily: "var(--font-playfair)" }}
              >
                The Redirect
              </h3>
              <p className="text-[#767B7A] text-sm leading-relaxed">
                A fixed portion of every project goes into verified environmental programs. Not offset schemes. Reforestation, ocean cleanup, renewable infrastructure. Every invoice shows exactly where it went.
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
                You are the one who knows the stack is a mess. You have watched tools get adopted without a plan, automations get built and never cleaned up, and the same data get entered in three places. You do not need a consultant to tell you that. You need someone to map it and fix it.
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
                You said yes to AI tools because everyone was saying yes. Some of them helped. Most of them just added to the overhead. You would like to know what is actually worth keeping before you add anything else.
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
                Your clients are asking about AI. You want to give them a real answer, not a sales pitch. An AI audit is something you can offer as a standalone service, with a builder behind it who will be honest about what they actually need.
              </p>
            </div>
          </div>
        </div>

        {/* Green By Design */}
        <div className="mt-20 pt-12 border-t border-white/[0.08]">
          <p className="text-[#4B858E] text-xs font-semibold tracking-[0.2em] uppercase mb-6">
            GREEN BY DESIGN
          </p>
          <h2
            className="text-2xl sm:text-3xl font-bold text-[#F4F2EE] mb-8 max-w-2xl"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            Built Lean. Built Green.
          </h2>
          <div className="max-w-3xl space-y-4 text-[#767B7A] text-base leading-relaxed">
            <p>
              AI has an energy cost. Every tool running, every model inference, every automation firing adds up. I am not going to pretend otherwise.
            </p>
            <p>
              What I can do is design solutions that use as little as they need to, and direct a fixed portion of every project into programs that are actually doing something about the larger problem. It is not a fix. It is a commitment to doing this work honestly.
            </p>
            <p>
              Hosted on infrastructure committed to renewable energy. Lean code by default. No idle infrastructure. No bloat.
            </p>
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
                <p>I build the tools. I write the code. I deliver it. That is the whole company.</p>
                <p>
                  Before WST, I spent years as a fractional COO and ClickUp consultant. I learned what is broken in SMB operations from the inside before I started building things to fix it. When I say your stack is probably over-built, I am not guessing. I have been in the systems.
                </p>
                <p>I use AI in my own builds. I am not anti-AI. I am anti-waste. There is a difference.</p>
                <p>
                  If the audit says you are mostly fine, I will tell you that. I would rather lose the build than recommend work that does not need to happen.
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
            The audit is the starting point. $500 to $1,500 depending on stack size. Standalone, no commitment to a build.
          </p>
          <Link
            href="/projects/new"
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

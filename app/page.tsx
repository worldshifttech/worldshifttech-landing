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
              BUILT WITH PEOPLE IN MIND.
            </p>

            <h1
              className="text-4xl sm:text-5xl xl:text-[3.5rem] font-light leading-[1.15] tracking-tight text-[#00205C] mb-7"
            >
              Building Systems & AI Responsibly.
              <br />
              <span className="text-[#4B858E]">Putting people first in operations.</span>
            </h1>

            <p className="text-gray text-lg leading-relaxed max-w-lg mx-auto lg:mx-0 mb-10">
              I audit how SMBs use AI and technology, ensuring team members feel seen and understood in their operations. Focused on lean software and responsible AI solutions.
            </p>

            <a
              href="https://calendly.com/fractionalbusinesscompanion/wst"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-[#4B858E] text-white text-base font-semibold px-8 py-4 rounded-full hover:bg-[#3a6b73] transition-colors duration-200 shadow-lg shadow-[#4B858E]/20"
            >
              Start with the audit
            </a>

            <p className="mt-4 text-navy/70 text-sm">
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

        {/* Founder Intro */}
        <div className="mt-20 pt-12 border-t border-[#00205C]/[0.16]">
          <div className="max-w-3xl space-y-4 text-gray text-base leading-relaxed">
            <p>
              I have been an operations consultant since 2018. I saw the rise and potential threat of AI from a mile away. Most businesses said yes to AI because that is where things were going. Now all your tools are using AI, hardly any of it is helpful, and in most cases it is costing more time and energy than before. Now we are experiencing the harm to our environment when no guardrails are in place.
            </p>
            <p>Teams are in tool burnout. Your operations are a combination of five or more systems that are barely working together. Add in AI and now you cannot tell if things are better or worse.</p>
            <p>The fix is not ditching AI, because there are places it can help. It is creating a system that uses only what is necessary and supports the people involved.</p>
          </div>
        </div>

        {/* What I Do Strip */}
        <div className="mt-20 pt-12 border-t border-[#00205C]/[0.16]">
          <p className="text-center text-navy/70 text-xs tracking-widest uppercase mb-10">
            What I Do
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div className="bg-white border border-[#00205C]/10 rounded-xl px-6 py-6">
              <h3
                className="text-xl font-light text-[#00205C] mb-3"
              >
                Audit the Operations
              </h3>
              <p className="text-navy/70 text-sm leading-relaxed">
                A structured look across people, processes, and technology. I map who is doing what and whether the work still matches what they were hired for. I trace how work actually flows. I document every tool you are running, what it costs, what it produces, and what it is taking from your team. We then evaluate where AI and automation will be effective and shift roles to keep team members doing what they do best.
              </p>
            </div>
            <div className="bg-white border border-[#00205C]/10 rounded-xl px-6 py-6">
              <h3
                className="text-xl font-light text-[#00205C] mb-3"
              >
                The Build
              </h3>
              <p className="text-navy/70 text-sm leading-relaxed">
                After the audit, I design a system that takes into account the people, processes, and technology working together with as little AI as it takes to get the result. Sometimes that is one agent replacing three subscriptions. Sometimes it is cutting five processes and building a precision tool to replace them.
              </p>
            </div>
            <div className="bg-white border border-[#00205C]/10 rounded-xl px-6 py-6">
              <h3
                className="text-xl font-light text-[#00205C] mb-3"
              >
                The Impact
              </h3>
              <p className="text-navy/70 text-sm leading-relaxed">
                AI and automation have a real environmental cost. Every model inference, every automation running, every tool idling adds up. A fixed portion of every project goes into verified programs doing real work on that problem. Reforestation. Ocean cleanup. Renewable infrastructure in underserved areas. Programs specifically chosen for transparency and accountability.
              </p>
            </div>
          </div>
        </div>

        {/* Audience Mirrors */}
        <div className="mt-20 pt-12 border-t border-[#00205C]/[0.16]">
          <h2
            className="text-2xl sm:text-3xl font-light text-[#00205C] mb-10"
          >
            Who this is for
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div>
              <h3
                className="text-lg font-light text-[#4B858E] mb-3"
              >
                Ops and systems leads
              </h3>
              <p className="text-navy/70 text-sm leading-relaxed">
                Chief operators and team leads who want to help their team be more efficient in their tools and processes, but do not want to overcomplicate things with additional tools and AI.
              </p>
            </div>
            <div>
              <h3
                className="text-lg font-light text-[#4B858E] mb-3"
              >
                Founders
              </h3>
              <p className="text-navy/70 text-sm leading-relaxed">
                AI and automation promise better visibility into reporting, efficiency, and understanding what is happening across your organization. Oftentimes that visibility is just noise, and you are not seeing the results you want.
              </p>
            </div>
            <div>
              <h3
                className="text-lg font-light text-[#4B858E] mb-3"
              >
                Agencies and consultants
              </h3>
              <p className="text-navy/70 text-sm leading-relaxed">
                You take calls, gather information, and collect data about your clients that needs to be aggregated in a way that makes sense to you. Precise AI and the right set of tools can help you provide better services to your clients and teams.
              </p>
            </div>
          </div>
        </div>

        {/* Sustainability Statement */}
        <div className="mt-20 pt-12 border-t border-[#00205C]/[0.16]">
          <p className="text-[#4B858E] text-xs font-semibold tracking-[0.2em] uppercase mb-6">
            BUILT WITH PEOPLE IN MIND.
          </p>
          <div className="max-w-3xl space-y-4 text-gray text-base leading-relaxed">
            <p>
              My goal is simple: help organizations understand the real cost of the systems they are running and make sure they are using as little AI as it takes to do the most good for their team.
            </p>
            <p>
              That means consolidating tools, subscriptions, and AI use. Optimizing processes and change management across departments to make sure teams are running efficiently and smoothly. Building lightweight solutions that scale with growth and change within the team.
            </p>
            <p>Let&apos;s face it, AI is not going away. That does not mean you are not accountable for the costs it takes to use AI.</p>
          </div>
        </div>

        {/* Drew Section */}
        <div className="mt-20 pt-12 border-t border-[#00205C]/[0.16]">
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
                className="text-2xl sm:text-3xl font-light text-[#00205C] mb-6"
              >
                Hi, I&apos;m Drew.
              </h2>
              <div className="space-y-4 text-gray text-base leading-relaxed max-w-2xl">
                <p>
                  I have been consulting in operations for over nine years. I have been part of many teams, seen many systems built, helped set up automations and documentation, defined roles, and trained people across organizations of all sizes.
                </p>
                <p>
                  Most of the time, what I find is the same across all of them: underdocumented operations, overautomated systems, overcomplicated processes, and team members whose roles have never been fully scoped or talked through. When something changes, the change management piece is where teams fall apart. This has gotten even worse thanks to AI.
                </p>
                <p>
                  AI moves fast enough now that most organizations have no time to make sure anything is actually being handled before the next thing arrives.
                </p>
                <p>
                  I have been working in and around AI for four years with all of my clients. I am not anti-AI. I understand there are real use cases that actually help. What I am against is the wasteful use of AI and organizations not being accountable for their use and impact on their own teams.
                </p>
                <p>
                  I am passionate about technology and where AI can be used for good within organizations, and I want to help others be aware of their implementations.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Final CTA */}
        <div className="mt-20 pt-12 border-t border-[#00205C]/[0.16] text-center">
          <h2
            className="text-2xl sm:text-3xl font-light text-[#00205C] mb-4"
          >
            Chat with me.
          </h2>
          <p className="text-gray text-base mb-8 max-w-lg mx-auto">
            The initial audit is free. Start there.
          </p>
          <a
            href="https://calendly.com/fractionalbusinesscompanion/wst"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-[#4B858E] text-white text-base font-semibold px-8 py-4 rounded-full hover:bg-[#3a6b73] transition-colors duration-200 shadow-lg shadow-[#4B858E]/20"
          >
            Get to Know Me
          </a>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#00205C]/[0.12] py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-navy/70 text-sm">
          <p>
            &copy; {new Date().getFullYear()} World Shift Technologies
            <span className="mx-2 opacity-40">·</span>
            <Link href="/privacy" className="hover:text-[#4B858E] transition-colors">
              Privacy Policy
            </Link>
            <span className="mx-2 opacity-40">·</span>
            <Link href="/terms" className="hover:text-[#4B858E] transition-colors">
              Terms
            </Link>
          </p>
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

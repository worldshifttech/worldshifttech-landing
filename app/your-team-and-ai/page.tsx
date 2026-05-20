import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import AuthModal from "@/app/components/AuthModal";

export const metadata = {
  title: "Your Team & AI — World Shift Technologies",
  description:
    "A good team and a small amount of AI will outperform a thin team and a maximalist AI stack every time. I help businesses figure out how little AI they actually need to get the work done.",
};

export default function YourTeamAndAIPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-6 max-w-6xl mx-auto w-full">
        <Link href="/">
          <Image
            src="/World_shift_tech_LOGO_WHITE.png"
            alt="World Shift Technologies"
            width={180}
            height={45}
            className="object-contain"
            priority
          />
        </Link>
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
            className="text-sm font-medium text-[#4B858E] border-b border-[#4B858E] px-3 py-2"
          >
            Your Team &amp; AI
          </Link>
          <Suspense fallback={null}>
            <AuthModal />
          </Suspense>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-6 pt-16 pb-24">
        <p className="text-[#4B858E] text-xs font-semibold tracking-[0.2em] uppercase mb-6">
          YOUR TEAM &amp; AI
        </p>
        <h1
          className="text-4xl sm:text-5xl xl:text-[3.5rem] font-bold leading-[1.15] tracking-tight text-[#F4F2EE] mb-7 max-w-3xl"
          style={{ fontFamily: "var(--font-playfair)" }}
        >
          Don&apos;t replace your team with AI.
        </h1>
        <p className="text-[#F4F2EE] text-lg leading-relaxed max-w-2xl">
          A good team and a small amount of AI will outperform a thin team and a maximalist AI stack every time. Your team built what you have. The right question isn&apos;t who AI replaces. It&apos;s how little AI you actually need to get the work done.
        </p>

        {/* Section 1 — The Framing Most Companies Get Wrong */}
        <div className="mt-20 pt-12 border-t border-white/[0.08]">
          <p className="text-[#4B858E] text-xs font-semibold tracking-[0.2em] uppercase mb-6">
            THE FRAMING MOST COMPANIES GET WRONG
          </p>
          <h2
            className="text-2xl sm:text-3xl font-bold text-[#F4F2EE] mb-8"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            Two mistakes. Same source.
          </h2>
          <div className="max-w-3xl space-y-4 text-[#F4F2EE] text-base leading-relaxed">
            <p>
              Most businesses approach AI as a cost-cutting tool. The pitch sounds the same in every industry: find where you can save money, automate what&apos;s slow, reduce overhead. Then the team starts wondering why. And what comes next isn&apos;t irrational. It&apos;s resistance. Your team feels like it&apos;s being replaced, and now you&apos;re trying to layer AI on top of a workforce that&apos;s bracing against it. Nothing works on that foundation.
            </p>
            <p>
              The second mistake compounds the first. Companies are told more AI fixes whatever&apos;s slow. More tools. More agents. More automations across more processes. The stack grows. The bill grows. The compute behind it grows. And in most cases, the actual work gets marginally faster while resources drain and team relationships fray because of AI, not in spite of it.
            </p>
            <p>
              The correction is the same in both cases. Start with the team. Use the smallest amount of AI that does the job.
            </p>
          </div>
        </div>

        {/* Section 2 — What Your Team Has That AI Doesn't */}
        <div className="mt-20 pt-12 border-t border-white/[0.08]">
          <p className="text-[#4B858E] text-xs font-semibold tracking-[0.2em] uppercase mb-6">
            WHAT YOUR TEAM HAS THAT AI DOESN&apos;T
          </p>
          <h2
            className="text-2xl sm:text-3xl font-bold text-[#F4F2EE] mb-8"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            Four things that don&apos;t get replaced.
          </h2>
          <div className="max-w-3xl">
            <p className="text-[#F4F2EE] text-base leading-relaxed mb-8">
              Your team has been with you. They watched the business become what it is. They know which clients pay late and why, which products get returned and what gets said when they do, and the full vision underneath the day-to-day. Vision doesn&apos;t come from a system. It comes from people.
            </p>
            <div className="space-y-6">
              <div>
                <strong className="block text-[#F4F2EE] text-base mb-1">Sales.</strong>
                <p className="text-[#F4F2EE] text-base leading-relaxed">Your team knows your customers&apos; names, what they bought last year, what&apos;s been going on in their life, and the emotional cues they carry into conversations and meetings. AI can&apos;t pick that up. Only human interaction can.</p>
              </div>
              <div>
                <strong className="block text-[#F4F2EE] text-base mb-1">Creativity.</strong>
                <p className="text-[#F4F2EE] text-base leading-relaxed">AI doesn&apos;t do well with creativity. It can take direction and surface suggestions, but true creativity comes from people with creative skills built through emotion and years spent learning their craft. The emotional and psychological understanding of what needs to be created will only ever be done properly by humans.</p>
              </div>
              <div>
                <strong className="block text-[#F4F2EE] text-base mb-1">Relationships.</strong>
                <p className="text-[#F4F2EE] text-base leading-relaxed">Vendors. Partners. Long-term clients. What keeps these people wanting to be a part of your business? Your vision is usually the people and processes they&apos;re interacting with. Most of that is led by humans, not bots.</p>
              </div>
              <div>
                <strong className="block text-[#F4F2EE] text-base mb-1">Critical thinking.</strong>
                <p className="text-[#F4F2EE] text-base leading-relaxed">Reading why a customer is upset before they say it. Understanding why a deal stalled when the surface reason doesn&apos;t add up. Knowing when a partner needs space and figuring out how to pivot. AI doesn&apos;t do this. People do.</p>
              </div>
            </div>
            <p className="text-[#F4F2EE] text-base leading-relaxed mt-8">
              These aren&apos;t soft skills. They&apos;re the operational bedrock of your business. AI doesn&apos;t extend them. It frees up time so the people who carry these skills can actually use them.
            </p>
          </div>
        </div>

        {/* Section 3 — Less AI, Used Precisely */}
        <div className="mt-20 pt-12 border-t border-white/[0.08]">
          <p className="text-[#4B858E] text-xs font-semibold tracking-[0.2em] uppercase mb-6">
            LESS AI, USED PRECISELY
          </p>
          <h2
            className="text-2xl sm:text-3xl font-bold text-[#F4F2EE] mb-8"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            More AI isn&apos;t the answer.
          </h2>
          <div className="max-w-3xl space-y-4 text-[#F4F2EE] text-base leading-relaxed">
            <p>
              This is the part most consultants won&apos;t tell you. You probably don&apos;t need a lot of AI to accomplish what you&apos;re after. You need the right AI in the right places, and not much else.
            </p>
            <p>
              A general-purpose AI tool deployed across every team, every workflow, every process runs constantly. Most of what it produces is busywork. Some of it is actively wasteful: reports nobody reads, automations firing on operations that aren&apos;t relevant anymore.
            </p>
            <p>
              A precise deployment looks different. It&apos;s identifying specific, acute processes and connecting a lean system to each one. The smallest model. The smallest tool. The exact right output. And then it stops when the job is done.
            </p>
            <p>
              I stay genuinely informed about what AI can do, where it&apos;s heading, and where it causes harm. Finding narrower solutions, leaner builds, tools that earn their keep. That&apos;s the work. Not running things in the background that nobody asked for.
            </p>
          </div>
        </div>

        {/* Section 4 — How to Take the Right Steps */}
        <div className="mt-20 pt-12 border-t border-white/[0.08]">
          <p className="text-[#4B858E] text-xs font-semibold tracking-[0.2em] uppercase mb-6">
            HOW TO TAKE THE RIGHT STEPS
          </p>
          <h2
            className="text-2xl sm:text-3xl font-bold text-[#F4F2EE] mb-8"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            Start with full accountability for your operations.
          </h2>
          <div className="max-w-3xl space-y-6">
            <p className="text-[#F4F2EE] text-base leading-relaxed">
              <strong>Inventory everything you&apos;re running.</strong> Every tool, every automation, every subscription. Who runs it, what it costs, what it actually produces.
            </p>
            <p className="text-[#F4F2EE] text-base leading-relaxed">
              <strong>Document your team&apos;s real roles.</strong> Not just the formal ones. Where their strengths are, including outside their job descriptions. Personality assessments can back this up.
            </p>
            <p className="text-[#F4F2EE] text-base leading-relaxed">
              <strong>Name the new role before you remove the old one.</strong> If automation frees up 10 hours a week for someone, say what those 10 hours go toward. Customer relationships. Quality control. The strategic work that&apos;s been waiting. Make the upgrade explicit.
            </p>
            <p className="text-[#F4F2EE] text-base leading-relaxed">
              <strong>Keep the institutional knowledge anchored to a person.</strong> You can document it in a knowledge base. But someone still needs to champion it, know when it needs to change, and keep it aligned with where the business is going.
            </p>
            <p className="text-[#F4F2EE] text-base leading-relaxed">
              <strong>Cut what isn&apos;t pulling weight.</strong> Most companies keep adding AI because it feels cheap against the bottom line. But it&apos;s not about tokens or connected tools. It&apos;s about getting what you need done with the right amount.
            </p>
            <p className="text-[#F4F2EE] text-base leading-relaxed">
              <strong>Measure what the saved time produces.</strong> Hours saved is a vanity metric. Track what those hours generate: new revenue, better customer outcomes, fewer errors in places where errors cost real money. That&apos;s the number that justifies the investment.
            </p>
          </div>
        </div>

        {/* Section 5 — When You're Operating at Enterprise Scale */}
        <div className="mt-20 pt-12 border-t border-white/[0.08]">
          <p className="text-[#4B858E] text-xs font-semibold tracking-[0.2em] uppercase mb-6">
            WHEN YOU&apos;RE OPERATING AT ENTERPRISE SCALE
          </p>
          <h2
            className="text-2xl sm:text-3xl font-bold text-[#F4F2EE] mb-8"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            If you&apos;re enterprise.
          </h2>
          <div className="max-w-3xl space-y-4 text-[#F4F2EE] text-base leading-relaxed">
            <p>
              If you&apos;re operating at enterprise scale and the AI question is portfolio-wide, multiple initiatives, multiple departments, real money already deployed and unclear results, the work above scales but the visibility problem changes. At that size, the truth about what&apos;s working stops being something one person can see. You need a way for the people closest to the work to surface what&apos;s actually happening, and a way to turn that into decisions you can defend in the boardroom.
            </p>
            <p>
              That&apos;s what{" "}
              <a
                href="https://www.popinrescue.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#4B858E] hover:underline"
              >
                POPin
              </a>{" "}
              does. It&apos;s an enterprise tool I work with directly. POPin gives leaders a structured, anonymous channel for frontline truth, and a decision intelligence layer that tells them which AI initiatives to fund, which to kill, and which need to be reoriented. Same philosophical core as the work I do for smaller businesses. The people doing the work know what&apos;s broken, and the leaders need a way to see it without the politics in the way. Different scale.
            </p>
            <p>
              If that&apos;s where you are, start there.
            </p>
          </div>
        </div>

        {/* Section 6 — Closing */}
        <div className="mt-20 pt-12 border-t border-white/[0.08] text-center">
          <h2
            className="text-3xl sm:text-4xl font-bold text-[#F4F2EE] mb-6 max-w-2xl mx-auto"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            Your team helped build everything you have.
          </h2>
          <div className="max-w-2xl mx-auto space-y-4 text-[#F4F2EE] text-base leading-relaxed mb-12">
            <p>
              AI doesn&apos;t change that. It changes what they get to do next, and how much of it actually needs to be running in the background to get the work done.
            </p>
            <p>
              A good team and a small amount of AI is the answer. That&apos;s where I come in.
            </p>
          </div>
          <Link
            href="/audit"
            className="inline-block bg-[#4B858E] text-[#080C14] text-base font-semibold px-8 py-4 rounded-full hover:bg-[#3a6b73] hover:text-white transition-colors duration-200 shadow-lg shadow-[#4B858E]/20"
          >
            Let&apos;s see what your stack actually needs.
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] py-8 px-6">
        <div className="max-w-6xl mx-auto text-center text-[#767B7A] text-sm">
          &copy; {new Date().getFullYear()} World Shift Technologies
        </div>
      </footer>
    </div>
  );
}

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
            These are the two mistakes.
          </h2>
          <div className="max-w-3xl space-y-4 text-[#F4F2EE] text-base leading-relaxed">
            <p>
              Most businesses approach AI as a &ldquo;save money, make it easy&rdquo; tool. The pitch from the outside sounds the same in every industry: figure out where we can save money, figure out how we can automate things, figure out how we can reduce overhead. Then the team starts wondering why. And what comes next isn&apos;t irrational. It&apos;s resistance. Your team is feeling replaced, and now you&apos;re trying to implement automation and AI on top of a workforce that&apos;s bracing against it. That&apos;s not a foundation anything works on.
            </p>
            <p>
              There&apos;s a second mistake stacked on top of the first. Companies are told that more AI is the answer to whatever&apos;s slow. More tools. More agents. More automation across more processes. So the stack grows. The bill grows. The compute behind it grows. And in most cases, the actual work gets marginally faster while resources are being wasted and the relationships inside your team get strained because of AI, not helped by it.
            </p>
            <p>
              The correction is the same in both cases. Start with the team. Use the smallest amount of AI that does the job. Stop there.
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
            <p className="text-[#F4F2EE] text-base leading-relaxed mb-4">
              Your team has been with you. They watched the business become what it is. They know which clients pay late and why. They know which products get returned for specific reasons that might have been missed in the data, and what gets said when those returns happen. They understand how the business is growing, where it&apos;s headed, the full vision underneath the day-to-day. Vision doesn&apos;t come from a system. It comes from people.
            </p>
            <p className="text-[#F4F2EE] text-base leading-relaxed mb-8">
              Here are the four things AI doesn&apos;t replace.
            </p>
            <div className="space-y-6">
              <p className="text-[#F4F2EE] text-base leading-relaxed">
                <strong>Sales.</strong> Trust is built between people, not between a person and an interface. Your team knows your customers&apos; names, their kids&apos; names, what they bought last year, and what they wouldn&apos;t buy again. AI can draft the follow-up. The person sends it.
              </p>
              <p className="text-[#F4F2EE] text-base leading-relaxed">
                <strong>Creativity.</strong> AI generates. People decide what&apos;s worth generating. The strategic call about what your business should be making, saying, or building belongs to the people who understand where the business has been and where it should go.
              </p>
              <p className="text-[#F4F2EE] text-base leading-relaxed">
                <strong>Relationships.</strong> Vendors. Partners. Long-term clients. The people who picked up the phone for you in 2022 when something broke. Those relationships were built by human interaction, and they&apos;ll be maintained by it.
              </p>
              <p className="text-[#F4F2EE] text-base leading-relaxed">
                <strong>Critical thinking and emotion.</strong> This is the layer underneath everything else. Reading why a customer is upset before they have to say it. Understanding why a deal stalled when the surface reason doesn&apos;t add up. Knowing why a long-time partner is needing to take time off and figuring out how to pivot. Relationships work because people read each other and respond, human connection in real time. Business works because people develop trust with each other, and AI doesn&apos;t build that.
              </p>
            </div>
            <p className="text-[#F4F2EE] text-base leading-relaxed mt-8">
              These aren&apos;t soft skills. They&apos;re the operational bedrock of your business. AI doesn&apos;t extend them. It frees up the time that was being spent on everything else, so the people who carry these skills can actually use them.
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
              This is the part most consultants won&apos;t tell you. You probably don&apos;t need a lot of AI to do what you need to accomplish. You need the right AI in the right places, and not much else.
            </p>
            <p>
              Start with a general-purpose AI tool deployed across every team, every workflow, every process, running constantly. Most of what it does is busywork. Some of it is actively wasteful, generating information no one reads, reports no one uses, automations firing on operations that aren&apos;t even relevant anymore.
            </p>
            <p>
              A precise AI deployment looks different. It&apos;s identifying acute, specific processes and connecting a lean system to that process. The smallest model. The smallest tool. The exact right output. And then it stops when the job is done.
            </p>
            <p>
              The work I do requires being genuinely informed about the AI industry: what it can do, what it&apos;s good at, where it&apos;s heading. It also requires being honest about the harm in the AI industry, and finding alternatives. Narrower solutions. Leaner builds. Tools that earn their keep instead of running in the background draining money and compute on work nobody asked for.
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
            Take full accountability for your operations and processes.
          </h2>
          <div className="max-w-3xl space-y-6">
            <p className="text-[#F4F2EE] text-base leading-relaxed">
              <strong>Start with identifying all of your operations.</strong> What tools you&apos;re using, who runs them, what pricing and subscription models you&apos;re on, everything you&apos;re paying for.
            </p>
            <p className="text-[#F4F2EE] text-base leading-relaxed">
              <strong>Make sure you have role documentation for all your team members.</strong> Understand where their strengths are and what they&apos;re good at, including outside their formal roles. Personality assessments can back this up.
            </p>
            <p className="text-[#F4F2EE] text-base leading-relaxed">
              <strong>Define the new role before you remove the old one.</strong> If automation is going to free up 10 hours a week for someone, name what those 10 hours go toward. Customer relationships. Quality control. The strategic work that&apos;s been on the back burner for two years. Make the upgrade explicit.
            </p>
            <p className="text-[#F4F2EE] text-base leading-relaxed">
              <strong>Keep the institutional knowledge.</strong> Even though you can document this in a knowledge base, it&apos;s still important for a person to champion that knowledge, understand when it needs to change, and keep it aligned with where the business is going.
            </p>
            <p className="text-[#F4F2EE] text-base leading-relaxed">
              <strong>Cut what isn&apos;t pulling weight.</strong> Most companies just keep adding AI and never actually use it because it feels &ldquo;cheap&rdquo; against the bottom line. But it&apos;s not about using the most tokens or having the most connected tools. It&apos;s about getting what you need done with the right amount.
            </p>
            <p className="text-[#F4F2EE] text-base leading-relaxed">
              <strong>Measure the right thing.</strong> Hours saved is a vanity metric. Track what the saved time produces. New revenue. Better customer outcomes. Reduced error rate in places where errors used to cost real money. That&apos;s the number that justifies the investment.
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

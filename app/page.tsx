import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import AuthModal from "./components/AuthModal";

export default function Home() {
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
        <div className="flex items-center gap-4">
          <Link
            href="/audit"
            className="hidden sm:block text-sm font-medium text-[#4B858E] border border-[#4B858E]/60 px-5 py-2 rounded-full hover:bg-[#4B858E] hover:text-white hover:border-[#4B858E] transition-all duration-200"
          >
            Get an Audit
          </Link>
          <a
            href="https://calendly.com/fractionalbusinesscompanion/wst"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:block text-sm text-[#767B7A] hover:text-[#F4F2EE] transition-colors duration-200"
          >
            Book a Call
          </a>
          <Suspense
            fallback={
              <div className="flex items-center gap-3">
                <span className="text-sm text-[#F4F2EE]/70">Log In</span>
                <span className="text-sm font-bold text-[#080C14] bg-[#4B858E] px-5 py-2 rounded-full">
                  Get Started
                </span>
              </div>
            }
          >
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
              Built lean. Built green.
            </p>

            <h1
              className="text-4xl sm:text-5xl xl:text-[3.5rem] font-bold leading-[1.15] tracking-tight text-[#F4F2EE] mb-7"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              Finally — <span className="text-[#4B858E]">software that fits.</span>
            </h1>

            <p className="text-[#F4F2EE] text-lg leading-relaxed max-w-lg mx-auto lg:mx-0 mb-10">
              Custom integrations, internal apps, and AI agents built to do exactly what your business needs. You own what I build.
            </p>

            <Link
              href="/projects/new"
              className="inline-block bg-[#4B858E] text-[#080C14] text-base font-bold px-8 py-4 rounded-full hover:bg-[#3a6b73] transition-colors duration-200 shadow-lg shadow-[#4B858E]/20"
            >
              Let&apos;s Scope Out Your Solution
            </Link>

            <p className="mt-4 text-[#F4F2EE] text-sm">
              Get an estimated scope of work in under 5 minutes.
            </p>
          </div>

          {/* Right: Headshot */}
          <div className="flex-shrink-0 relative">
            {/* Subtle glow behind the image */}
            <div className="absolute inset-0 rounded-2xl bg-[#4B858E]/10 blur-2xl scale-110" />
            <div className="relative w-64 h-80 sm:w-72 sm:h-96 lg:w-80 lg:h-[420px] rounded-2xl overflow-hidden border border-[#4B858E]/25 shadow-2xl">
              <Image
                src="/Drew_Headshot.jpg"
                alt="Drew Griffiths"
                fill
                className="object-cover object-top"
                priority
              />
              {/* Name card overlay at bottom */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#080C14]/90 via-[#080C14]/40 to-transparent px-5 py-4">
                <p className="text-[#F4F2EE] font-semibold text-sm">Drew Griffiths</p>
                <p className="text-[#4B858E] text-xs">Founder, World Shift Technologies</p>
              </div>
            </div>
          </div>
        </div>

        {/* The Problem section */}
        <div className="mt-20 pt-12 border-t border-white/[0.08]">
          <h2
            className="text-3xl font-bold text-[#F4F2EE] mb-6"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            You&apos;ve been here before.
          </h2>
          <p className="text-[#F4F2EE] text-lg leading-relaxed max-w-2xl">
            The stack ballooned. Half the tools overlap. Two of them don&apos;t talk to each other. You tried to fix it with a no-code automation that worked for a month and then broke. You hired someone who delivered something that almost worked. You&apos;ve been quoted tens of thousands by a dev shop that wouldn&apos;t return calls. You&apos;re paying for subscriptions and still copy-pasting between three of them.
          </p>
        </div>

        {/* Proof strip */}
        <div className="mt-20 pt-12 border-t border-white/[0.08]">
          <p className="text-center text-[#4B858E] text-xs tracking-widest uppercase mb-10">
            What I Build
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center lg:text-left">
            <div className="bg-[#00205C]/20 border border-white/[0.06] rounded-xl px-6 py-6">
              <p
                className="text-3xl font-bold text-[#4B858E] mb-2"
                style={{ fontFamily: "var(--font-playfair)" }}
              >
                Integrations
              </p>
              <p className="text-[#F4F2EE] text-sm leading-relaxed">
                You&apos;re paying for tools that should work together but don&apos;t. I connect them so your business stops losing time to manual handoffs, re-entry, and workflows that break when someone&apos;s out sick.
              </p>
            </div>
            <div className="bg-[#00205C]/20 border border-white/[0.06] rounded-xl px-6 py-6">
              <p
                className="text-3xl font-bold text-[#4B858E] mb-2"
                style={{ fontFamily: "var(--font-playfair)" }}
              >
                Custom Apps
              </p>
              <p className="text-[#F4F2EE] text-sm leading-relaxed">
                When no off-the-shelf tool does exactly what you need, I build the one that does. Scoped to your problem, built around your workflow, and yours to own — not rent.
              </p>
            </div>
            <div className="bg-[#00205C]/20 border border-white/[0.06] rounded-xl px-6 py-6">
              <p
                className="text-3xl font-bold text-[#4B858E] mb-2"
                style={{ fontFamily: "var(--font-playfair)" }}
              >
                Precision Tools
              </p>
              <p className="text-[#F4F2EE] text-sm leading-relaxed">
                One focused tool that handles the thing costing you the most time. Not a platform. Not a suite. Just the right solution, built lean and deployed fast.
              </p>
            </div>
          </div>
        </div>

        {/* Lean/Green section */}
        <div className="mt-20 pt-12 border-t border-white/[0.08]">
          <p className="text-[#4B858E] text-xs font-semibold tracking-[0.2em] uppercase mb-5">
            Green by design
          </p>
          <h2
            className="text-3xl font-bold text-[#F4F2EE] mb-6"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            Built Lean. Built Green.
          </h2>
          <p className="text-[#F4F2EE] text-lg leading-relaxed max-w-2xl">
            I build on lean code — no bloat, no idle infrastructure. Every solution is built to run on what it needs and nothing more, so it doesn&apos;t consume unnecessary or wasted resources. The goal is a smaller footprint by default, and to be ready to build for a future where technology leaves little to no carbon footprint.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] py-8 px-6">
        <div className="max-w-6xl mx-auto text-center text-[#767B7A] text-sm">
          <p>&copy; {new Date().getFullYear()} World Shift Technologies</p>
        </div>
      </footer>
    </div>
  );
}

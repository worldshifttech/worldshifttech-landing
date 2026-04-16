import Image from "next/image";
import Link from "next/link";

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
        <a
          href="https://calendly.com/fractionalbusinesscompanion/wst"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-[#4B858E] border border-[#4B858E]/60 px-5 py-2 rounded-full hover:bg-[#4B858E] hover:text-white hover:border-[#4B858E] transition-all duration-200"
        >
          Book a Call
        </a>
      </nav>

      {/* Hero */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-6 pt-12 pb-24">
        <div className="flex flex-col-reverse lg:flex-row items-center gap-12 lg:gap-20">

          {/* Left: Text content */}
          <div className="flex-1 text-center lg:text-left">
            <p className="text-[#4B858E] text-xs font-semibold tracking-[0.2em] uppercase mb-7">
              Drew Griffiths &mdash; World Shift Technologies
            </p>

            <h1
              className="text-4xl sm:text-5xl xl:text-[3.5rem] font-bold leading-[1.15] tracking-tight text-[#F4F2EE] mb-7"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              Your Next Hire Shouldn&apos;t
              <br className="hidden sm:block" /> Be a Person.
              <br />
              <span className="text-[#4B858E]">It Should Be an AI Super Agent.</span>
            </h1>

            <p className="text-[#767B7A] text-lg leading-relaxed max-w-lg mx-auto lg:mx-0 mb-4">
              I build digital copies of you. AI automations that handle the operational
              grind so you can stop being the bottleneck in your own business.
            </p>

            <p className="text-[#767B7A] text-base leading-relaxed max-w-lg mx-auto lg:mx-0 mb-10">
              Not software you manage. Digital employees that actually do the work,
              built and optimized inside your ClickUp workspace.
            </p>

            <Link
              href="/meet"
              className="inline-block bg-[#4B858E] text-white text-base font-semibold px-8 py-4 rounded-full hover:bg-[#3a6b73] transition-colors duration-200 shadow-lg shadow-[#4B858E]/20"
            >
              See What I&apos;d Build For You
            </Link>

            <p className="mt-4 text-[#767B7A] text-sm">
              Takes 60 seconds. No pitch. Just your personalized use case.
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

        {/* Proof strip */}
        <div className="mt-20 pt-12 border-t border-white/[0.08]">
          <p className="text-center text-[#767B7A] text-xs tracking-widest uppercase mb-10">
            Documented results from real implementations
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center lg:text-left">
            <div className="bg-[#00205C]/20 border border-white/[0.06] rounded-xl px-6 py-6">
              <p
                className="text-3xl font-bold text-[#4B858E] mb-2"
                style={{ fontFamily: "var(--font-playfair)" }}
              >
                3.5&ndash;8x ROI
              </p>
              <p className="text-[#767B7A] text-sm leading-relaxed">
                Documented return on AI agent implementations
              </p>
            </div>
            <div className="bg-[#00205C]/20 border border-white/[0.06] rounded-xl px-6 py-6">
              <p
                className="text-3xl font-bold text-[#4B858E] mb-2"
                style={{ fontFamily: "var(--font-playfair)" }}
              >
                30&ndash;60 days
              </p>
              <p className="text-[#767B7A] text-sm leading-relaxed">
                Typical payback period after going live
              </p>
            </div>
            <div className="bg-[#00205C]/20 border border-white/[0.06] rounded-xl px-6 py-6">
              <p
                className="text-3xl font-bold text-[#4B858E] mb-2"
                style={{ fontFamily: "var(--font-playfair)" }}
              >
                $500&ndash;$5K/mo
              </p>
              <p className="text-[#767B7A] text-sm leading-relaxed">
                Fractional COO leverage at 10&ndash;30% of the cost
              </p>
            </div>
          </div>
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

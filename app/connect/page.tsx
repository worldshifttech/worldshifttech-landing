import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "Great Meeting You — Drew Griffiths | World Shift Technologies",
  description:
    "Save Drew's contact info and grab time on his calendar to talk through your next project.",
};

export default function ConnectPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav */}
      <nav className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-sm border-b border-[#00205C]/10 shadow-sm">
        <div className="flex items-center justify-between px-6 py-5 max-w-3xl mx-auto w-full">
          <Link href="/">
            <Image
              src="/World_shift_tech_LOGO_PRIMARY.png"
              alt="World Shift Technologies"
              width={160}
              height={40}
              className="object-contain"
              priority
            />
          </Link>
          <a
            href="/drew-griffiths.vcf"
            download
            className="inline-block bg-[#4B858E] text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-[#3a6b73] transition-colors duration-200 shadow-md shadow-[#4B858E]/20"
          >
            Save My Contact
          </a>
        </div>
      </nav>

      {/* Content */}
      <main className="flex-1 w-full">
        <div className="max-w-2xl mx-auto w-full px-6 pt-16 pb-24 text-center">
          <div className="relative w-28 h-28 mx-auto mb-8 rounded-full overflow-hidden border-4 border-white shadow-xl">
            <Image
              src="/Drew_Headshot.jpg"
              alt="Drew Griffiths"
              fill
              className="object-cover object-top"
              priority
            />
          </div>

          <p className="text-[#4B858E] text-xs font-semibold tracking-[0.2em] uppercase mb-5">
            Good to connect
          </p>

          <h1 className="text-3xl sm:text-4xl font-light text-[#00205C] leading-[1.2] mb-6">
            It was great meeting you.
          </h1>

          <p className="text-gray text-lg leading-relaxed mb-10 max-w-xl mx-auto">
            I&apos;m Drew, founder of World Shift Technologies. I build AI Super Agents and
            workflow automations that take repetitive work off your plate, so your team spends
            less time on admin and more time on the work that actually grows the business.
          </p>

          <a
            href="https://calendly.com/fractionalbusinesscompanion/wst"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-[#4B858E] text-white text-base font-semibold px-8 py-4 rounded-full hover:bg-[#3a6b73] transition-colors duration-200 shadow-lg shadow-[#4B858E]/20"
          >
            Book a Call
          </a>

          <p className="mt-8 text-navy/60 text-sm">
            drew@worldshifttech.com &middot; 720-808-1315
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#00205C]/[0.12] py-8 px-6">
        <div className="max-w-2xl mx-auto text-center text-navy/70 text-sm">
          &copy; {new Date().getFullYear()} World Shift Technologies
        </div>
      </footer>
    </div>
  );
}

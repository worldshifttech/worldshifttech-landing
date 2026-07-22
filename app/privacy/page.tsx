import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "Privacy Policy — World Shift Technologies",
  description:
    "How World Shift Technologies collects, uses, and protects your information.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col">

      {/* Nav */}
      <nav className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-sm border-b border-[#00205C]/10 shadow-sm">
        <div className="px-6 py-5 max-w-3xl mx-auto w-full">
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
        </div>
      </nav>

      {/* Content */}
      <main className="flex-1 max-w-3xl mx-auto w-full px-6 pb-20">
        <h1
          className="text-4xl font-light text-[#00205C] mb-3"
        >
          Privacy Policy
        </h1>
        <p className="text-navy/70 text-sm mb-14">Last updated: June 8, 2026</p>

        <div className="space-y-10 text-[#00205C] text-base leading-[1.75]">

          <section>
            <h2 className="text-xs font-bold tracking-[0.2em] uppercase text-[#4B858E] mb-4">
              Information We Collect
            </h2>
            <p>
              We collect information you provide directly: your email address when you create an
              account or sign in with Google, your name and Google profile photo when you use Google
              OAuth, and the answers you submit through our project scoping wizard and AI waste audit
              tool (including business description, industry, team size, tools you use, and estimated
              monthly software spend). We also collect information automatically through Cloudflare,
              our infrastructure provider, including your IP address, browser type, and general
              location. We use session cookies to keep you signed in and to temporarily store your
              wizard answers between pages.
            </p>
          </section>

          <section>
            <h2 className="text-xs font-bold tracking-[0.2em] uppercase text-[#4B858E] mb-4">
              How We Use Your Information
            </h2>
            <p>
              We use the information you provide to generate personalized content using AI (see
              Third-Party Services below), to scope your project and estimate investment ranges, to
              send you transactional emails about your project status, and to protect the site against
              automated abuse. We do not use your information for advertising, and we do not sell it
              to third parties.
            </p>
          </section>

          <section>
            <h2 className="text-xs font-bold tracking-[0.2em] uppercase text-[#4B858E] mb-4">
              Third-Party Services
            </h2>
            <p className="mb-5">
              The following third-party services receive your data as part of how this site operates.
              Each is governed by its own privacy policy.
            </p>
            <ul className="space-y-4">
              {[
                {
                  name: "Anthropic",
                  detail:
                    "When you complete the project scoping wizard or AI waste audit, your answers are sent to Anthropic's Claude API to generate personalized content. Anthropic processes this data under their own privacy policy.",
                },
                {
                  name: "Supabase",
                  detail:
                    "Your account information, project data, and audit submissions are stored in a PostgreSQL database hosted by Supabase on AWS infrastructure.",
                },
                {
                  name: "Vercel",
                  detail:
                    "This site is hosted on Vercel. All web traffic passes through their servers.",
                },
                {
                  name: "Cloudflare",
                  detail:
                    "We use Cloudflare for content delivery and bot protection. Cloudflare's Turnstile service processes your IP address and browser fingerprint to verify you are human before form submissions.",
                },
                {
                  name: "Resend",
                  detail:
                    "When your project status changes, we send you a notification email through Resend, a transactional email provider. Your email address is transmitted to Resend for this purpose.",
                },
                {
                  name: "Twilio",
                  detail:
                    "If you provide a mobile phone number, we may send you SMS notifications about your project or account through Twilio. Your phone number is transmitted to Twilio solely for message delivery and is not used for any other purpose.",
                },
                {
                  name: "Google",
                  detail:
                    "If you sign in with Google, Google shares your email address, name, and profile photo with us under Google's authentication service terms.",
                },
              ].map(({ name, detail }) => (
                <li key={name} className="flex gap-3">
                  <span className="text-[#4B858E] font-bold flex-shrink-0 pt-0.5">+</span>
                  <p>
                    <span className="font-semibold text-[#00205C]">{name}</span>
                    {" — "}
                    {detail}
                  </p>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-xs font-bold tracking-[0.2em] uppercase text-[#4B858E] mb-4">
              Cookies
            </h2>
            <p>
              We use two types of cookies: an authentication session cookie that keeps you signed in,
              and a Cloudflare Turnstile cookie used for bot protection on form submissions. We do not
              use advertising cookies, tracking pixels, or analytics cookies.
            </p>
          </section>

          <section>
            <h2 className="text-xs font-bold tracking-[0.2em] uppercase text-[#4B858E] mb-4">
              Text Messaging (SMS)
            </h2>
            <p className="mb-4">
              If you provide a mobile phone number and consent to receive text messages, we may send
              you SMS notifications related to your project or account activity. Message frequency
              varies based on your account activity. Message and data rates may apply.
            </p>
            <p>
              We will not share your mobile phone number with third parties for their marketing
              purposes. Your number is transmitted only to Twilio for message delivery as described
              above. To opt out of text messages at any time, reply STOP to any message we send or
              contact us at{" "}
              <a
                href="mailto:drew@worldshifttech.com"
                className="text-[#4B858E] hover:underline"
              >
                drew@worldshifttech.com
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-xs font-bold tracking-[0.2em] uppercase text-[#4B858E] mb-4">
              Guest Submissions
            </h2>
            <p>
              If you complete the project wizard or audit tool without creating an account, your
              submission is stored as a guest record for up to 90 days. After 90 days, guest records
              with no associated account are deleted. You can claim a guest submission by creating an
              account within that window.
            </p>
          </section>

          <section>
            <h2 className="text-xs font-bold tracking-[0.2em] uppercase text-[#4B858E] mb-4">
              Data Retention
            </h2>
            <p>
              Account information and associated project or audit data is retained for as long as your
              account exists. You can request deletion at any time by contacting us. Guest records are
              deleted after 90 days as described above.
            </p>
          </section>

          <section>
            <h2 className="text-xs font-bold tracking-[0.2em] uppercase text-[#4B858E] mb-4">
              Your Rights
            </h2>
            <p>
              You have the right to access, correct, or delete the personal information we hold about
              you. To exercise any of these rights, email{" "}
              <a
                href="mailto:drew@worldshifttech.com"
                className="text-[#4B858E] hover:underline"
              >
                drew@worldshifttech.com
              </a>
              . We will respond within 30 days.
            </p>
          </section>

          <section>
            <h2 className="text-xs font-bold tracking-[0.2em] uppercase text-[#4B858E] mb-4">
              Children
            </h2>
            <p>
              This site is not directed at children under the age of 13. We do not knowingly collect
              personal information from children.
            </p>
          </section>

          <section>
            <h2 className="text-xs font-bold tracking-[0.2em] uppercase text-[#4B858E] mb-4">
              Changes to This Policy
            </h2>
            <p>
              We may update this policy from time to time. The &ldquo;Last updated&rdquo; date at
              the top of this page reflects the most recent revision. Continued use of the site after
              changes are posted constitutes acceptance of the revised policy.
            </p>
          </section>

          <section>
            <h2 className="text-xs font-bold tracking-[0.2em] uppercase text-[#4B858E] mb-4">
              Contact
            </h2>
            <p>
              World Shift Technologies —{" "}
              <a
                href="mailto:drew@worldshifttech.com"
                className="text-[#4B858E] hover:underline"
              >
                drew@worldshifttech.com
              </a>
            </p>
          </section>

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#00205C]/[0.12] py-8 px-6">
        <div className="max-w-3xl mx-auto text-navy/70 text-sm">
          <p>&copy; {new Date().getFullYear()} World Shift Technologies</p>
        </div>
      </footer>

    </div>
  );
}

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/auth-helpers-nextjs";
import AdminNav from "../AdminNav";
import InfoTooltip from "../InfoTooltip";

const ADMIN_EMAIL = "drew@worldshifttech.com";

// Permanent reference for how the planning-to-build workflow operates (Session 69) —
// static content, no data fetching. Linked from AdminNav on every /admin/* page so it's
// never more than one click away. Not a dismissible first-visit tour — this is meant to
// be re-read whenever a step is forgotten, same reasoning as keeping it a real page
// rather than a one-time overlay.
export default async function AdminGuidePage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => {},
      },
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session || session.user.email !== ADMIN_EMAIL) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen flex flex-col">
      <AdminNav active="guide" />

      <main className="flex-1 px-6 py-12">
        <div className="w-full max-w-3xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-[#00205C] mb-2">Guide</h1>
            <p className="text-[#76777A] text-sm">
              How a planning session becomes a live deploy, and what a client sees on their
              side. Come back here whenever a step is fuzzy.
            </p>
          </div>

          {/* The two session types */}
          <section className="bg-white border border-[#00205C]/10 rounded-2xl p-6 space-y-4">
            <h2 className="text-xs font-bold tracking-widest uppercase text-[#4B858E]">
              The two session types
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-[#00205C] text-sm font-semibold">Planning</p>
                <p className="text-[#00205C]/70 text-sm leading-relaxed">
                  Read-only exploration of a repo against a brief. Ends in one consolidated
                  review card: what it decided on its own, any open questions it genuinely
                  couldn&apos;t resolve, and, if fully specified, a build prompt ready to run.
                  Never writes or commits anything.
                </p>
              </div>
              <div>
                <p className="text-[#00205C] text-sm font-semibold">Build</p>
                <p className="text-[#00205C]/70 text-sm leading-relaxed">
                  Executes a build prompt exactly as written and opens a pull request. Never
                  pushes straight to a repo&apos;s main branch. Nothing reaches production
                  until that PR is merged.
                </p>
              </div>
            </div>
          </section>

          {/* The full flow */}
          <section className="bg-white border border-[#00205C]/10 rounded-2xl p-6 space-y-4">
            <h2 className="text-xs font-bold tracking-widest uppercase text-[#4B858E]">
              The full flow
            </h2>
            <ol className="space-y-3 list-decimal list-inside">
              <li className="text-[#00205C] text-sm leading-relaxed">
                <span className="font-semibold">Dispatch a planning session</span> — from a
                repo&apos;s own Settings tab, or automatically on schedule if that repo has
                automation enabled.
              </li>
              <li className="text-[#00205C] text-sm leading-relaxed">
                <span className="font-semibold">A consolidated review card appears</span> in
                the Reviews inbox&apos;s Pending tab once the session finishes.
              </li>
              <li className="text-[#00205C] text-sm leading-relaxed">
                <span className="font-semibold">Answer its open questions</span> (or just add
                notes if it had none) and submit — the card moves to Answered.
              </li>
              <li className="text-[#00205C] text-sm leading-relaxed">
                <span className="font-semibold">Run Build Session</span> on that answered
                card, or hand-split the prompt into Run Custom Build Session on the repo&apos;s
                own page.
              </li>
              <li className="text-[#00205C] text-sm leading-relaxed">
                <span className="font-semibold">A build result card appears</span> with a PR
                link, a Vercel preview link, and any SQL the build pulled out of its own PR
                description, ready to copy into Supabase.
              </li>
              <li className="text-[#00205C] text-sm leading-relaxed">
                <span className="font-semibold">Merge to Production, or Discard.</span>{" "}
                Merging squash-merges the PR to main and triggers Vercel&apos;s normal
                auto-deploy. This is the one irreversible click in the whole flow.
              </li>
              <li className="text-[#00205C] text-sm leading-relaxed">
                <span className="font-semibold">Archive once you&apos;ve actually checked</span>{" "}
                the live site and confirmed it works — not automatic on merge.
              </li>
            </ol>
          </section>

          {/* Review card kinds */}
          <section className="bg-white border border-[#00205C]/10 rounded-2xl p-6 space-y-4">
            <h2 className="text-xs font-bold tracking-widest uppercase text-[#4B858E]">
              What each review card means
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-[#00205C] text-sm font-semibold">Consolidated Review</p>
                <p className="text-[#00205C]/70 text-sm leading-relaxed">
                  A planning session&apos;s output. Summary of what it decided, open questions
                  if any, and a build prompt once fully specified.
                </p>
              </div>
              <div>
                <p className="text-[#00205C] text-sm font-semibold">Production Risk</p>
                <p className="text-[#00205C]/70 text-sm leading-relaxed">
                  Something the session flagged as risky before proceeding. Needs a decision,
                  not open-ended answers: Acknowledge &amp; Proceed, or Stop / Needs Changes.
                </p>
              </div>
              <div>
                <p className="text-[#00205C] text-sm font-semibold">KB Entry Draft</p>
                <p className="text-[#00205C]/70 text-sm leading-relaxed">
                  A build session judged something it built as reusable and drafted a
                  knowledge base entry. Review and edit the fields, then Approve to actually
                  add it (nothing is written until you do), or Discard.
                </p>
              </div>
              <div>
                <p className="text-[#00205C] text-sm font-semibold">Build Result</p>
                <p className="text-[#00205C]/70 text-sm leading-relaxed">
                  A build session finished and opened a PR. Merge to Production or Discard —
                  see the full flow above.
                </p>
              </div>
            </div>
          </section>

          {/* Tabs / archive */}
          <section className="bg-white border border-[#00205C]/10 rounded-2xl p-6 space-y-3">
            <h2 className="text-xs font-bold tracking-widest uppercase text-[#4B858E] flex items-center gap-2">
              Pending, Answered, Archived
              <InfoTooltip text="Archive is a manual, deliberate action, never automatic on merge or deploy. A deploy succeeding is not proof the actual feature works." />
            </h2>
            <p className="text-[#00205C]/70 text-sm leading-relaxed">
              Pending needs a decision from you. Answered means you&apos;ve responded, but
              stays there until you personally confirm the real thing behind it is actually
              live and working, then Archive it. This is deliberately not automatic: a deploy
              can succeed cleanly while the feature it shipped is still broken, so a
              deploy-succeeded signal alone was never trustworthy enough to archive on its
              own.
            </p>
          </section>

          {/* Automation */}
          <section className="bg-white border border-[#00205C]/10 rounded-2xl p-6 space-y-3">
            <h2 className="text-xs font-bold tracking-widest uppercase text-[#4B858E]">
              Automation
            </h2>
            <p className="text-[#00205C]/70 text-sm leading-relaxed">
              Each repo can have automation enabled with a planning interval in hours — an
              hourly scheduler dispatches a planning session for that repo once the interval
              elapses, as long as no session is already open for it. A global &quot;Pause All
              Automation&quot; switch on the Repos fleet list overrides every repo&apos;s own
              setting at once. The scheduler also self-heals: any session stuck non-terminal
              for more than 3 hours (a crashed run, a dispatch that never landed) gets
              automatically marked failed on the next tick, so it can never block that repo&apos;s
              automation forever.
            </p>
          </section>

          {/* Client side */}
          <section className="bg-white border border-[#00205C]/10 rounded-2xl p-6 space-y-3">
            <h2 className="text-xs font-bold tracking-widest uppercase text-[#4B858E]">
              What your client sees
            </h2>
            <p className="text-[#00205C]/70 text-sm leading-relaxed">
              No login, no account. You send them one link:
              worldshifttech.com/projects/[their project&apos;s slug], found on that
              project&apos;s own admin page. If it&apos;s password protected, they enter it once and
              a signed cookie remembers them for 30 days. The page itself is a read-only
              roadmap: progress bar, next update, milestone list. A milestone only shows an
              &quot;Action needed&quot; panel when you&apos;ve assigned it to them — collapsed by
              default, opens to a text answer and/or a file upload. Every submission pings
              your Slack and lands in that project&apos;s Client Feedback inbox for you to
              resolve.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/auth-helpers-nextjs";
import { getSupabase } from "@/lib/supabase";
import AdminNav from "../AdminNav";

const ADMIN_EMAIL = "drew@worldshifttech.com";

type SessionRow = {
  id: string;
  repo_id: string | null;
  session_type: string;
  status: string;
  cost_usd: number | null;
  created_at: string;
  pr_url: string | null;
  repos: { name: string } | null;
};

function formatUsd(n: number): string {
  return `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function relativeDate(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

// Session 72 — cost visibility didn't exist anywhere in this dashboard until now. Built
// directly in response to a real, confirmed gap: a build session on entos-group-website
// burned $8.97 over 34.6 minutes and produced nothing, invisible until manually queried.
// Data source is agent_sessions.cost_usd, populated by wst-orchestrator-runner's own
// Session 10 (summed from Claude Code's own JSON result, per session, sent regardless of
// status) — not the pre-existing wst_usage_snapshots/Anthropic Admin API mechanism, which
// is account-wide across every feature this app makes Claude/OpenAI/Voyage calls from and
// has no way to isolate orchestrator spend specifically. See ORCHESTRATOR_DESIGN.md §11.
export default async function AdminSpendPage() {
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

  const serviceClient = getSupabase();

  const { data: rawSessions, error } = await serviceClient
    .from("agent_sessions")
    .select("id, repo_id, session_type, status, cost_usd, created_at, pr_url, repos(name)")
    .not("cost_usd", "is", null)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[admin/spend] agent_sessions query failed:", error.message);
  }

  const sessions = (rawSessions ?? []) as unknown as SessionRow[];

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  let totalThisMonth = 0;
  let totalAllTime = 0;
  let wastedAllTime = 0;
  let productiveAllTime = 0;

  const byRepo = new Map<string, { name: string; total: number; count: number; failedTotal: number }>();

  for (const s of sessions) {
    const cost = s.cost_usd ?? 0;
    totalAllTime += cost;
    if (new Date(s.created_at) >= monthStart) totalThisMonth += cost;
    if (s.status === "failed") wastedAllTime += cost;
    if (s.status === "done") productiveAllTime += cost;

    const repoKey = s.repo_id ?? "unknown";
    const repoName = s.repos?.name ?? "Unknown repo";
    const entry = byRepo.get(repoKey) ?? { name: repoName, total: 0, count: 0, failedTotal: 0 };
    entry.total += cost;
    entry.count += 1;
    if (s.status === "failed") entry.failedTotal += cost;
    byRepo.set(repoKey, entry);
  }

  const repoBreakdown = Array.from(byRepo.values()).sort((a, b) => b.total - a.total);
  const maxRepoTotal = Math.max(...repoBreakdown.map((r) => r.total), 0.01);

  const topSessions = [...sessions].sort((a, b) => (b.cost_usd ?? 0) - (a.cost_usd ?? 0)).slice(0, 10);

  return (
    <div className="min-h-screen flex flex-col">
      <AdminNav active="spend" />

      <main className="flex-1 px-6 py-12">
        <div className="w-full max-w-3xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-[#00205C] mb-2">Spend</h1>
            <p className="text-[#76777A] text-sm">
              What the orchestrator is actually costing, broken down by repo and by whether
              the session produced anything. Only counts sessions dispatched since cost
              capture landed — nothing before that is recoverable.
            </p>
          </div>

          {sessions.length === 0 ? (
            <div className="bg-white border border-[#00205C]/10 rounded-2xl p-6">
              <p className="text-[#00205C] text-sm">
                No spend data yet — cost tracking started August 9, 2026 (Session 72). It'll
                fill in as new planning and build sessions dispatch.
              </p>
            </div>
          ) : (
            <>
              {/* Stat tiles */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white border border-[#00205C]/10 rounded-2xl p-6">
                  <p className="text-[#76777A] text-xs uppercase tracking-widest mb-1">This month</p>
                  <p className="text-[#00205C] text-3xl font-bold">{formatUsd(totalThisMonth)}</p>
                </div>
                <div className="bg-white border border-[#00205C]/10 rounded-2xl p-6">
                  <p className="text-[#76777A] text-xs uppercase tracking-widest mb-1">All time</p>
                  <p className="text-[#00205C] text-3xl font-bold">{formatUsd(totalAllTime)}</p>
                </div>
                <div className="bg-white border border-red-300 rounded-2xl p-6">
                  <p className="text-red-500 text-xs uppercase tracking-widest mb-1 font-semibold">
                    Spent on failed sessions
                  </p>
                  <p className="text-red-500 text-3xl font-bold">{formatUsd(wastedAllTime)}</p>
                  <p className="text-[#76777A] text-xs mt-1">
                    {formatUsd(productiveAllTime)} spent on completed sessions
                  </p>
                </div>
              </div>

              {/* By repo */}
              <div className="bg-white border border-[#00205C]/10 rounded-2xl p-6">
                <span className="text-xs font-bold tracking-widest uppercase text-[#4B858E] block mb-4">
                  By Repo
                </span>
                <div className="space-y-4">
                  {repoBreakdown.map((r) => (
                    <div key={r.name}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[#00205C] text-sm font-medium">{r.name}</span>
                        <span className="text-[#76777A] text-xs flex-shrink-0 ml-2">
                          {formatUsd(r.total)} &middot; {r.count} session{r.count !== 1 ? "s" : ""}
                          {r.failedTotal > 0 && (
                            <span className="text-red-500"> &middot; {formatUsd(r.failedTotal)} wasted</span>
                          )}
                        </span>
                      </div>
                      <div className="h-1.5 bg-[#00205C]/[0.08] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#4B858E] rounded-full"
                          style={{ width: `${Math.max((r.total / maxRepoTotal) * 100, 2)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Most expensive sessions */}
              <div className="bg-white border border-[#00205C]/10 rounded-2xl p-6">
                <span className="text-xs font-bold tracking-widest uppercase text-[#4B858E] block mb-4">
                  Most Expensive Sessions
                </span>
                <div className="space-y-3">
                  {topSessions.map((s) => (
                    <div key={s.id} className="flex items-center justify-between gap-3 border-t border-[#00205C]/[0.06] pt-3 first:border-t-0 first:pt-0">
                      <div className="min-w-0">
                        <p className="text-[#00205C] text-sm font-medium truncate">
                          {s.repos?.name ?? "Unknown repo"}{" "}
                          <span className="text-[#76777A] text-xs font-normal">{s.session_type}</span>
                        </p>
                        <p className="text-[#76777A] text-xs mt-0.5">
                          {s.status === "failed" ? (
                            <span className="text-red-500 font-semibold">failed</span>
                          ) : (
                            s.status
                          )}{" "}
                          &middot; {relativeDate(s.created_at)}
                          {s.pr_url && (
                            <>
                              {" "}
                              &middot;{" "}
                              <a href={s.pr_url} target="_blank" rel="noreferrer" className="text-[#4B858E] hover:underline">
                                PR &rarr;
                              </a>
                            </>
                          )}
                        </p>
                      </div>
                      <span
                        className={`text-sm font-bold flex-shrink-0 ${s.status === "failed" ? "text-red-500" : "text-[#00205C]"}`}
                      >
                        {formatUsd(s.cost_usd ?? 0)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

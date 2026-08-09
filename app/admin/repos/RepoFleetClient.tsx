"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AdminNav from "../AdminNav";
import InfoTooltip from "../InfoTooltip";
import { getSupabaseBrowser } from "@/lib/supabase";

// ─── Types ────────────────────────────────────────────────────────────────────

export type Repo = {
  id: string;
  name: string;
  local_path: string;
  github_owner: string;
  github_repo: string;
  vercel_project_id: string | null;
  framework_type: string;
  auth_convention: string;
  client_project_id: string | null;
  automation_enabled: boolean;
  planning_interval_hours: number | null;
  last_planning_session_at: string | null;
  open_review_count: number;
  deployed_sha: string | null;
  github_head_sha: string | null;
  drift_checked_at: string | null;
  system_group: string | null;
};

// slug/access_mode/has_password added for the repo detail page's Client Portal section —
// access_password_hash itself is never sent to the client, only the derived boolean, same
// write-only-credential convention as repos.has_target_supabase_service_role_key.
export type ProjectOption = {
  id: string;
  title: string;
  slug: string;
  access_mode: string;
  has_password: boolean;
};

export const FRAMEWORK_OPTIONS = [
  { value: "nextjs", label: "Next.js" },
  { value: "vite", label: "Vite" },
  { value: "other", label: "Other" },
];

export const AUTH_OPTIONS = [
  { value: "supabase_auth", label: "Supabase Auth" },
  { value: "shared_secret", label: "Shared secret" },
  { value: "none", label: "None" },
  { value: "other", label: "Other" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function relativeDate(dateStr: string | null): string {
  if (!dateStr) return "Never";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

function frameworkLabel(value: string): string {
  return FRAMEWORK_OPTIONS.find((f) => f.value === value)?.label ?? value;
}

function authLabel(value: string): string {
  return AUTH_OPTIONS.find((a) => a.value === value)?.label ?? value;
}

// "Drifted" is computed here, not stored as its own column — avoids a boolean that
// could get out of sync with the two SHAs it's derived from. Only meaningful once both
// SHAs have actually been checked at least once.
function isDrifted(repo: Repo): boolean {
  return Boolean(repo.deployed_sha && repo.github_head_sha && repo.deployed_sha !== repo.github_head_sha);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function RepoFleetClient({
  initialRepos,
  initialAutomationPaused,
}: {
  initialRepos: Repo[];
  projects: ProjectOption[];
  initialAutomationPaused: boolean;
}) {
  const router = useRouter();
  const [repos] = useState<Repo[]>(initialRepos);
  const [automationPaused, setAutomationPaused] = useState(initialAutomationPaused);
  const [pauseSaving, setPauseSaving] = useState(false);
  const [pauseError, setPauseError] = useState("");
  const [showNewForm, setShowNewForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newLocalPath, setNewLocalPath] = useState("");
  const [newGithubOwner, setNewGithubOwner] = useState("worldshifttech");
  const [newGithubRepo, setNewGithubRepo] = useState("");
  const [newFramework, setNewFramework] = useState("nextjs");
  const [newAuth, setNewAuth] = useState("supabase_auth");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setCreateError("");

    const supabase = getSupabaseBrowser();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const token = session?.access_token;

    try {
      const res = await fetch("/api/admin-repos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          name: newName,
          local_path: newLocalPath,
          github_owner: newGithubOwner,
          github_repo: newGithubRepo,
          framework_type: newFramework,
          auth_convention: newAuth,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setCreateError(data.error ?? "Failed to create repo");
        return;
      }

      router.push(`/admin/repos/${data.id}`);
    } catch {
      setCreateError("Something went wrong. Please try again.");
    } finally {
      setCreating(false);
    }
  }

  // Global kill switch, checked before every scheduler tick — independent of each repo's
  // own automation_enabled, which is the per-repo pause. See NOTES.md Session 52.
  async function handleTogglePause() {
    const next = !automationPaused;
    setPauseSaving(true);
    setPauseError("");

    const supabase = getSupabaseBrowser();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const token = session?.access_token;

    try {
      const res = await fetch("/api/admin-orchestrator-settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ automation_paused: next }),
      });

      const data = await res.json();
      if (!res.ok) {
        setPauseError(data.error ?? "Failed to save");
        return;
      }

      setAutomationPaused(next);
    } catch {
      setPauseError("Something went wrong. Please try again.");
    } finally {
      setPauseSaving(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav */}
      <AdminNav active="repos" />

      {/* Main */}
      <main className="flex-1 px-6 py-16">
        <div className="w-full max-w-5xl mx-auto">
          <h1
            className="text-4xl sm:text-5xl font-bold text-[#00205C] mb-6"
            style={{ fontFamily: "var(--font-poppins)" }}
          >
            Repo Fleet
          </h1>

          {/* Global automation kill switch — checked before every scheduler tick,
              independent of each repo's own automation_enabled toggle */}
          <div
            className={`flex items-center justify-between gap-4 mb-6 px-5 py-4 rounded-2xl border ${
              automationPaused
                ? "bg-orange-500/10 border-orange-500/30"
                : "bg-white border-[#00205C]/10"
            }`}
          >
            <div>
              <p
                className="text-sm font-semibold text-[#00205C] flex items-center gap-1.5"
                style={{ fontFamily: "var(--font-poppins)" }}
              >
                {automationPaused ? "Automation paused sitewide" : "Automation running"}
                <InfoTooltip text="This is the global kill switch — it overrides every repo's own Automation enabled toggle at once. A repo also needs its own toggle on and a Planning Interval set before the scheduler will touch it." />
              </p>
              <p className="text-[#76777A] text-xs mt-0.5" style={{ fontFamily: "var(--font-poppins)" }}>
                {automationPaused
                  ? "The scheduler skips every repo, regardless of each repo's own setting, until unpaused."
                  : "The scheduler dispatches planning sessions on schedule for any repo with automation enabled."}
              </p>
              {pauseError && <p className="text-red-400 text-xs mt-1">{pauseError}</p>}
            </div>
            <button
              onClick={handleTogglePause}
              disabled={pauseSaving}
              className={`text-xs font-bold px-4 py-2.5 rounded-full flex-shrink-0 transition-colors disabled:opacity-50 ${
                automationPaused
                  ? "bg-[#4B858E] text-white hover:bg-[#5a9aa4]"
                  : "border border-orange-400 text-orange-500 hover:bg-orange-50"
              }`}
              style={{ fontFamily: "var(--font-poppins)" }}
            >
              {pauseSaving ? "Saving..." : automationPaused ? "Resume Automation" : "Pause All Automation"}
            </button>
          </div>

          <div className="flex items-center justify-between mb-8">
            <p className="text-[#76777A] text-sm" style={{ fontFamily: "var(--font-poppins)" }}>
              {repos.length} repo{repos.length !== 1 ? "s" : ""}
            </p>
            <button
              onClick={() => setShowNewForm((v) => !v)}
              className="text-xs font-semibold px-4 py-2.5 rounded-full bg-[#4B858E] text-white hover:bg-[#5a9aa4] transition-colors"
              style={{ fontFamily: "var(--font-poppins)" }}
            >
              {showNewForm ? "Cancel" : "+ New Repo"}
            </button>
          </div>

          {showNewForm && (
            <form
              onSubmit={handleCreate}
              className="border border-[#00205C]/[0.12] rounded-2xl bg-white p-6 mb-6 space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#76777A] mb-1.5">Name</label>
                  <input
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full bg-[#F4F2EE] border border-[#00205C]/[0.1] rounded-lg px-3 py-2 text-sm text-[#00205C] focus:outline-none focus:border-[#4B858E]/60"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#76777A] mb-1.5">Local Path</label>
                  <input
                    required
                    value={newLocalPath}
                    onChange={(e) => setNewLocalPath(e.target.value)}
                    placeholder="C:\Users\drewg\..."
                    className="w-full bg-[#F4F2EE] border border-[#00205C]/[0.1] rounded-lg px-3 py-2 text-sm text-[#00205C] focus:outline-none focus:border-[#4B858E]/60"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#76777A] mb-1.5">GitHub Owner</label>
                  <input
                    required
                    value={newGithubOwner}
                    onChange={(e) => setNewGithubOwner(e.target.value)}
                    className="w-full bg-[#F4F2EE] border border-[#00205C]/[0.1] rounded-lg px-3 py-2 text-sm text-[#00205C] focus:outline-none focus:border-[#4B858E]/60"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#76777A] mb-1.5">GitHub Repo</label>
                  <input
                    required
                    value={newGithubRepo}
                    onChange={(e) => setNewGithubRepo(e.target.value)}
                    className="w-full bg-[#F4F2EE] border border-[#00205C]/[0.1] rounded-lg px-3 py-2 text-sm text-[#00205C] focus:outline-none focus:border-[#4B858E]/60"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#76777A] mb-1.5">Framework</label>
                  <select
                    value={newFramework}
                    onChange={(e) => setNewFramework(e.target.value)}
                    className="w-full bg-[#F4F2EE] border border-[#00205C]/[0.1] rounded-lg px-3 py-2 text-sm text-[#00205C] focus:outline-none focus:border-[#4B858E]/60"
                  >
                    {FRAMEWORK_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#76777A] mb-1.5">Auth Convention</label>
                  <select
                    value={newAuth}
                    onChange={(e) => setNewAuth(e.target.value)}
                    className="w-full bg-[#F4F2EE] border border-[#00205C]/[0.1] rounded-lg px-3 py-2 text-sm text-[#00205C] focus:outline-none focus:border-[#4B858E]/60"
                  >
                    {AUTH_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {createError && (
                <p className="text-red-400 text-xs" style={{ fontFamily: "var(--font-poppins)" }}>
                  {createError}
                </p>
              )}

              <button
                type="submit"
                disabled={creating}
                className="text-sm font-bold px-6 py-2.5 rounded-full bg-[#4B858E] text-white hover:bg-[#5a9aa4] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                style={{ fontFamily: "var(--font-poppins)" }}
              >
                {creating ? "Creating..." : "Create Repo"}
              </button>
            </form>
          )}

          {repos.length === 0 ? (
            <p className="text-[#00205C] text-sm" style={{ fontFamily: "var(--font-poppins)" }}>
              No repos yet.
            </p>
          ) : (
            <div className="space-y-3">
              {repos.map((repo) => (
                <Link
                  key={repo.id}
                  href={`/admin/repos/${repo.id}`}
                  className="flex flex-wrap sm:flex-nowrap items-center gap-4 px-6 py-5 border border-[#00205C]/[0.12] rounded-2xl bg-white hover:border-[#4B858E]/40 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-[#00205C] font-medium truncate" style={{ fontFamily: "var(--font-poppins)" }}>
                        {repo.name}
                      </p>
                      {repo.system_group && (
                        <span
                          className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#91B6BB]/20 text-[#00205C] border border-[#91B6BB]/40 flex-shrink-0"
                          style={{ fontFamily: "var(--font-poppins)" }}
                          title={`Part of the ${repo.system_group} system, alongside other repos sharing this tag`}
                        >
                          {repo.system_group}
                        </span>
                      )}
                      {repo.open_review_count > 0 && (
                        <span
                          className="text-xs font-bold px-2 py-0.5 rounded-full bg-orange-500/15 text-orange-500 border border-orange-500/30 flex-shrink-0"
                          style={{ fontFamily: "var(--font-poppins)" }}
                        >
                          {repo.open_review_count} open review{repo.open_review_count !== 1 ? "s" : ""}
                        </span>
                      )}
                      {isDrifted(repo) && (
                        <span
                          className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-500/15 text-red-500 border border-red-500/30 flex-shrink-0"
                          style={{ fontFamily: "var(--font-poppins)" }}
                          title={`Production: ${repo.deployed_sha?.slice(0, 7)} · GitHub main: ${repo.github_head_sha?.slice(0, 7)}`}
                        >
                          Drift
                        </span>
                      )}
                    </div>
                    <p className="text-[#76777A] text-xs mt-0.5" style={{ fontFamily: "var(--font-poppins)" }}>
                      {repo.github_owner}/{repo.github_repo}
                    </p>
                  </div>

                  <span
                    className="hidden sm:block text-[#76777A] text-xs flex-shrink-0"
                    style={{ fontFamily: "var(--font-poppins)" }}
                  >
                    {frameworkLabel(repo.framework_type)}
                  </span>

                  <span
                    className="hidden md:block text-[#76777A] text-xs flex-shrink-0"
                    style={{ fontFamily: "var(--font-poppins)" }}
                  >
                    {authLabel(repo.auth_convention)}
                  </span>

                  <span
                    className="hidden md:block text-[#76777A] text-xs flex-shrink-0"
                    style={{ fontFamily: "var(--font-poppins)" }}
                  >
                    Last run: {relativeDate(repo.last_planning_session_at)}
                  </span>

                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${
                      repo.automation_enabled
                        ? "border border-[#4B858E] text-[#4B858E]"
                        : "bg-[#00205C]/[0.05] text-[#76777A] border border-[#00205C]/15"
                    }`}
                    style={{ fontFamily: "var(--font-poppins)" }}
                  >
                    {repo.automation_enabled ? "Automation on" : "Paused"}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      <footer className="border-t border-[#00205C]/[0.10] py-6 px-6">
        <div className="max-w-5xl mx-auto text-center text-[#76777A] text-xs">
          &copy; {new Date().getFullYear()} World Shift Technologies
        </div>
      </footer>
    </div>
  );
}

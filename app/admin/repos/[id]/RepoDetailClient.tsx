"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getSupabaseBrowser } from "@/lib/supabase";
import SignOutButton from "@/app/components/SignOutButton";
import { FRAMEWORK_OPTIONS, AUTH_OPTIONS, type ProjectOption } from "../RepoFleetClient";
import { ReviewList, type ReviewItem } from "../../reviews/ReviewInboxClient";

// ─── Types ────────────────────────────────────────────────────────────────────

type RepoFields = {
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
  github_app_installation_id: number | null;
  target_supabase_url: string | null;
  has_target_supabase_service_role_key: boolean;
  deployed_sha: string | null;
  github_head_sha: string | null;
  drift_checked_at: string | null;
};

type FeedbackItem = {
  id: string;
  title: string;
  body: string | null;
  status: string;
  created_at: string;
};

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function RepoDetailClient({
  repo,
  projects,
  reviewItems,
}: {
  repo: RepoFields;
  projects: ProjectOption[];
  reviewItems: ReviewItem[];
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"settings" | "feedback" | "reviews">("settings");
  const [name, setName] = useState(repo.name);
  const [localPath, setLocalPath] = useState(repo.local_path);
  const [githubOwner, setGithubOwner] = useState(repo.github_owner);
  const [githubRepo, setGithubRepo] = useState(repo.github_repo);
  const [vercelProjectId, setVercelProjectId] = useState(repo.vercel_project_id ?? "");
  const [frameworkType, setFrameworkType] = useState(repo.framework_type);
  const [authConvention, setAuthConvention] = useState(repo.auth_convention);
  const [clientProjectId, setClientProjectId] = useState(repo.client_project_id ?? "");
  const [automationEnabled, setAutomationEnabled] = useState(repo.automation_enabled);
  const [planningIntervalHours, setPlanningIntervalHours] = useState(
    repo.planning_interval_hours != null ? String(repo.planning_interval_hours) : ""
  );
  const [installationId, setInstallationId] = useState(
    repo.github_app_installation_id != null ? String(repo.github_app_installation_id) : ""
  );

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saved, setSaved] = useState(false);

  const [planningBrief, setPlanningBrief] = useState("");
  const [dispatching, setDispatching] = useState(false);
  const [dispatchError, setDispatchError] = useState("");

  // Target Supabase credentials — deliberately separate save action, separate route, and
  // the key field is never pre-filled with the stored value (only a "set/not set"
  // indicator is). See NOTES.md Session 51 for why.
  const [targetSupabaseUrl, setTargetSupabaseUrl] = useState(repo.target_supabase_url ?? "");
  const [targetSupabaseKey, setTargetSupabaseKey] = useState("");
  const [hasTargetKey, setHasTargetKey] = useState(repo.has_target_supabase_service_role_key);
  const [credsSaving, setCredsSaving] = useState(false);
  const [credsError, setCredsError] = useState("");
  const [credsSaved, setCredsSaved] = useState(false);

  // Feedback — only ever populated when this repo has both credentials and a matching
  // adapter (see lib/feedback-adapters.ts); the route returns configured: false otherwise
  // and this section just doesn't render.
  const [feedbackItems, setFeedbackItems] = useState<FeedbackItem[]>([]);
  const [feedbackConfigured, setFeedbackConfigured] = useState(false);
  const [feedbackLoading, setFeedbackLoading] = useState(true);
  const [feedbackError, setFeedbackError] = useState("");
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  // Client Portal — the linked project's own client-facing URL + password. Keyed off
  // the dropdown's current value, not a separate "is this saved yet" check: the
  // /projects/[slug] link works regardless of whether repos.client_project_id itself has
  // been saved, so there's no reason to hide it behind an extra click. generatedPassword
  // is React state only, shown once — the API route never returns it a second time and
  // nothing persists it beyond this component's lifetime. See NOTES.md.
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);
  const [generatingPassword, setGeneratingPassword] = useState(false);
  const [genPasswordError, setGenPasswordError] = useState("");
  const [linkCopied, setLinkCopied] = useState(false);
  const [passwordCopied, setPasswordCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadFeedback() {
      const supabase = getSupabaseBrowser();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;

      try {
        const res = await fetch(`/api/admin-repos/${repo.id}/feedback`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          setFeedbackError(data.error ?? "Failed to load feedback");
          return;
        }
        setFeedbackItems(data.items ?? []);
        setFeedbackConfigured(Boolean(data.configured));
      } catch {
        if (!cancelled) setFeedbackError("Something went wrong loading feedback.");
      } finally {
        if (!cancelled) setFeedbackLoading(false);
      }
    }

    loadFeedback();
    return () => {
      cancelled = true;
    };
  }, [repo.id]);

  const linkedProject = projects.find((p) => p.id === clientProjectId) ?? null;
  const clientPortalUrl = linkedProject
    ? `https://worldshifttech.com/projects/${linkedProject.slug}`
    : null;

  async function handleSaveCredentials() {
    setCredsSaving(true);
    setCredsError("");
    setCredsSaved(false);

    const supabase = getSupabaseBrowser();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const token = session?.access_token;

    try {
      const res = await fetch(`/api/admin-repos/${repo.id}/target-credentials`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          target_supabase_url: targetSupabaseUrl,
          ...(targetSupabaseKey.trim() ? { target_supabase_service_role_key: targetSupabaseKey } : {}),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setCredsError(data.error ?? "Save failed");
        return;
      }

      if (targetSupabaseKey.trim()) {
        setHasTargetKey(true);
        setTargetSupabaseKey("");
      }
      setCredsSaved(true);
      setTimeout(() => setCredsSaved(false), 2500);
    } catch {
      setCredsError("Something went wrong. Please try again.");
    } finally {
      setCredsSaving(false);
    }
  }

  async function handleGeneratePassword() {
    if (!linkedProject) return;
    setGeneratingPassword(true);
    setGenPasswordError("");
    setPasswordCopied(false);

    const supabase = getSupabaseBrowser();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const token = session?.access_token;

    try {
      const res = await fetch(`/api/admin-projects/${linkedProject.id}/generate-password`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      const data = await res.json();
      if (!res.ok) {
        setGenPasswordError(data.error ?? "Failed to generate password");
        return;
      }

      setGeneratedPassword(data.password);
    } catch {
      setGenPasswordError("Something went wrong. Please try again.");
    } finally {
      setGeneratingPassword(false);
    }
  }

  async function handleCopy(text: string, onCopied: (v: boolean) => void) {
    try {
      await navigator.clipboard.writeText(text);
      onCopied(true);
      setTimeout(() => onCopied(false), 2000);
    } catch {
      // Clipboard API can be denied/unavailable — the value is still visible on screen
      // to copy by hand, so this fails silently rather than showing an error.
    }
  }

  async function handleResolveFeedback(ticketId: string) {
    setResolvingId(ticketId);
    setFeedbackError("");

    const supabase = getSupabaseBrowser();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const token = session?.access_token;

    try {
      const res = await fetch(`/api/admin-repos/${repo.id}/feedback/${ticketId}`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!res.ok) {
        const data = await res.json();
        setFeedbackError(data.error ?? "Failed to resolve");
        return;
      }

      setFeedbackItems((prev) => prev.filter((i) => i.id !== ticketId));
    } catch {
      setFeedbackError("Something went wrong. Please try again.");
    } finally {
      setResolvingId(null);
    }
  }

  async function handleRunPlanningSession() {
    setDispatching(true);
    setDispatchError("");

    const supabase = getSupabaseBrowser();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const token = session?.access_token;

    try {
      const res = await fetch("/api/orchestrator/dispatch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          repo_id: repo.id,
          session_type: "planning",
          brief: planningBrief,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setDispatchError(data.error ?? "Failed to dispatch");
        return;
      }

      router.push("/admin/reviews");
    } catch {
      setDispatchError("Something went wrong. Please try again.");
    } finally {
      setDispatching(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    setSaveError("");
    setSaved(false);

    const supabase = getSupabaseBrowser();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const token = session?.access_token;

    try {
      const res = await fetch(`/api/admin-repos/${repo.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          name,
          local_path: localPath,
          github_owner: githubOwner,
          github_repo: githubRepo,
          vercel_project_id: vercelProjectId || null,
          framework_type: frameworkType,
          auth_convention: authConvention,
          client_project_id: clientProjectId || null,
          automation_enabled: automationEnabled,
          planning_interval_hours: planningIntervalHours ? Number(planningIntervalHours) : null,
          github_app_installation_id: installationId ? Number(installationId) : null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setSaveError(data.error ?? "Save failed");
        return;
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      setSaveError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  const pendingReviewCount = reviewItems.filter((r) => r.status === "pending").length;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav */}
      <nav className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-sm border-b border-[#00205C]/10 shadow-sm">
        <div className="flex items-center justify-between px-6 py-5">
          <Link href="/">
            <Image
              src="/World_shift_tech_LOGO_PRIMARY.png"
              alt="World Shift Technologies"
              width={160}
              height={38}
              className="object-contain"
              priority
            />
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/admin/repos" className="text-sm text-[#4B858E] hover:text-[#00205C] transition-colors">
              &larr; All Repos
            </Link>
            <SignOutButton />
          </div>
        </div>
      </nav>

      <main className="flex-1 px-6 py-12">
        <div className="w-full max-w-3xl mx-auto space-y-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-[#00205C]">{name || "Untitled Repo"}</h1>

          {/* Tabs */}
          <div className="flex items-center gap-1 border-b border-[#00205C]/[0.10]">
            {(
              [
                { key: "settings" as const, label: "Settings" },
                { key: "feedback" as const, label: `Feedback${feedbackConfigured ? ` (${feedbackItems.length})` : ""}` },
                { key: "reviews" as const, label: `Reviews${pendingReviewCount > 0 ? ` (${pendingReviewCount})` : ""}` },
              ]
            ).map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`text-sm font-semibold px-4 py-3 border-b-2 -mb-px transition-colors ${
                    isActive
                      ? "text-[#00205C] border-[#4B858E]"
                      : "text-[#76777A] border-transparent hover:text-[#00205C]"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {activeTab === "settings" && (
          <>
          {/* Core fields */}
          <div className="bg-white border border-[#00205C]/10 rounded-2xl p-6 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#76777A] mb-1.5">Name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#F4F2EE] border border-[#00205C]/[0.1] rounded-lg px-3 py-2 text-sm text-[#00205C] focus:outline-none focus:border-[#4B858E]/60"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#76777A] mb-1.5">Local Path</label>
                <input
                  value={localPath}
                  onChange={(e) => setLocalPath(e.target.value)}
                  className="w-full bg-[#F4F2EE] border border-[#00205C]/[0.1] rounded-lg px-3 py-2 text-sm text-[#00205C] focus:outline-none focus:border-[#4B858E]/60"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#76777A] mb-1.5">GitHub Owner</label>
                <input
                  value={githubOwner}
                  onChange={(e) => setGithubOwner(e.target.value)}
                  className="w-full bg-[#F4F2EE] border border-[#00205C]/[0.1] rounded-lg px-3 py-2 text-sm text-[#00205C] focus:outline-none focus:border-[#4B858E]/60"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#76777A] mb-1.5">GitHub Repo</label>
                <input
                  value={githubRepo}
                  onChange={(e) => setGithubRepo(e.target.value)}
                  className="w-full bg-[#F4F2EE] border border-[#00205C]/[0.1] rounded-lg px-3 py-2 text-sm text-[#00205C] focus:outline-none focus:border-[#4B858E]/60"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#76777A] mb-1.5">Framework</label>
                <select
                  value={frameworkType}
                  onChange={(e) => setFrameworkType(e.target.value)}
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
                  value={authConvention}
                  onChange={(e) => setAuthConvention(e.target.value)}
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

            <div>
              <label className="block text-xs font-medium text-[#76777A] mb-1.5">Linked Client Project</label>
              <select
                value={clientProjectId}
                onChange={(e) => setClientProjectId(e.target.value)}
                className="w-full bg-[#F4F2EE] border border-[#00205C]/[0.1] rounded-lg px-3 py-2 text-sm text-[#00205C] focus:outline-none focus:border-[#4B858E]/60"
              >
                <option value="">None</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#76777A] mb-1.5">Vercel Project ID</label>
              <input
                value={vercelProjectId}
                onChange={(e) => setVercelProjectId(e.target.value)}
                className="w-full bg-[#F4F2EE] border border-[#00205C]/[0.1] rounded-lg px-3 py-2 text-sm text-[#00205C] focus:outline-none focus:border-[#4B858E]/60"
              />
            </div>

            <div className="border-t border-[#00205C]/[0.08] pt-5">
              <label className="block text-xs font-medium text-[#76777A] mb-2">Automation</label>
              <label className="flex items-center gap-2 text-sm text-[#00205C] mb-3">
                <input
                  type="checkbox"
                  checked={automationEnabled}
                  onChange={(e) => setAutomationEnabled(e.target.checked)}
                />
                Automation enabled (per-repo pause switch — the scheduler skips this repo when off)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#76777A] mb-1.5">
                    Planning Interval (hours)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={planningIntervalHours}
                    onChange={(e) => setPlanningIntervalHours(e.target.value)}
                    placeholder="Blank = never"
                    className="w-full bg-[#F4F2EE] border border-[#00205C]/[0.1] rounded-lg px-3 py-2 text-sm text-[#00205C] focus:outline-none focus:border-[#4B858E]/60"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#76777A] mb-1.5">
                    GitHub App Installation ID
                  </label>
                  <input
                    value={installationId}
                    onChange={(e) => setInstallationId(e.target.value)}
                    className="w-full bg-[#F4F2EE] border border-[#00205C]/[0.1] rounded-lg px-3 py-2 text-sm text-[#00205C] focus:outline-none focus:border-[#4B858E]/60"
                  />
                </div>
              </div>
            </div>

            {/* Deployment drift — populated by /api/orchestrator/drift-check, on its own
                6-hourly cron. Read-only, nothing to save here. */}
            <div className="border-t border-[#00205C]/[0.08] pt-5">
              <label className="block text-xs font-medium text-[#76777A] mb-2">Deployment</label>
              {repo.drift_checked_at ? (
                <p
                  className={`text-sm ${
                    repo.deployed_sha && repo.github_head_sha && repo.deployed_sha !== repo.github_head_sha
                      ? "text-red-500"
                      : "text-[#00205C]"
                  }`}
                >
                  Production: <span className="font-mono">{repo.deployed_sha?.slice(0, 7) ?? "—"}</span> · GitHub
                  main: <span className="font-mono">{repo.github_head_sha?.slice(0, 7) ?? "—"}</span>
                  {repo.deployed_sha && repo.github_head_sha && repo.deployed_sha !== repo.github_head_sha
                    ? " — drifted"
                    : " — in sync"}
                </p>
              ) : (
                <p className="text-[#76777A] text-sm">
                  Not checked yet — needs `vercel_project_id` set above and the drift-check cron to run.
                </p>
              )}
            </div>
          </div>

          {/* Client Portal — the linked project's own client-facing link + password.
              Renders whenever the "Linked Client Project" dropdown above resolves to a
              real project, saved or not — the link itself works either way. */}
          {linkedProject && clientPortalUrl && (
            <div className="bg-white border border-[#00205C]/10 rounded-2xl p-6 space-y-4">
              <span className="text-xs font-bold tracking-widest uppercase text-[#4B858E] block">
                Client Portal
              </span>
              <p className="text-[#76777A] text-xs">
                Send this link to {linkedProject.title} to bookmark. They enter the password once;
                a signed cookie remembers them after that.
              </p>

              <div>
                <label className="block text-xs font-medium text-[#76777A] mb-1.5">Client Link</label>
                <div className="flex items-center gap-2">
                  <input
                    readOnly
                    value={clientPortalUrl}
                    onClick={(e) => e.currentTarget.select()}
                    className="flex-1 bg-[#F4F2EE] border border-[#00205C]/[0.1] rounded-lg px-3 py-2 text-sm text-[#00205C] font-mono focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleCopy(clientPortalUrl, setLinkCopied)}
                    className="text-xs font-semibold px-4 py-2 rounded-full border border-[#4B858E] text-[#4B858E] hover:bg-[#4B858E]/10 transition-colors flex-shrink-0"
                  >
                    {linkCopied ? "Copied ✓" : "Copy Link"}
                  </button>
                </div>
              </div>

              <p className="text-xs text-[#76777A]">
                {linkedProject.access_mode === "password"
                  ? linkedProject.has_password
                    ? "Password protected."
                    : "Set to password-protected, but no password generated yet — the link won't work until you generate one."
                  : "Currently public — no password required. Generating one below switches it to password-protected."}
              </p>

              {genPasswordError && <p className="text-red-400 text-xs">{genPasswordError}</p>}

              {generatedPassword ? (
                <div className="border-t border-[#00205C]/[0.08] pt-4">
                  <label className="block text-xs font-medium text-[#76777A] mb-1.5">
                    New Password — copy it now, it won&apos;t be shown again
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      readOnly
                      value={generatedPassword}
                      onClick={(e) => e.currentTarget.select()}
                      className="flex-1 bg-[#F4F2EE] border border-[#00205C]/[0.1] rounded-lg px-3 py-2 text-sm text-[#00205C] font-mono focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleCopy(generatedPassword, setPasswordCopied)}
                      className="text-xs font-semibold px-4 py-2 rounded-full bg-[#4B858E] text-white hover:bg-[#5a9aa4] transition-colors flex-shrink-0"
                    >
                      {passwordCopied ? "Copied ✓" : "Copy Password"}
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={handleGeneratePassword}
                  disabled={generatingPassword}
                  className="text-sm font-semibold px-6 py-2.5 rounded-full border border-[#4B858E] text-[#4B858E] hover:bg-[#4B858E]/10 disabled:opacity-50 transition-colors"
                >
                  {generatingPassword ? "Generating..." : linkedProject.has_password ? "Generate New Password" : "Generate Password"}
                </button>
              )}
            </div>
          )}

          {/* Target Supabase Credentials */}
          <div className="bg-white border border-[#00205C]/10 rounded-2xl p-6 space-y-4">
            <span className="text-xs font-bold tracking-widest uppercase text-[#4B858E] block">
              Target Supabase Credentials
            </span>
            <p className="text-[#76777A] text-xs">
              For repos with their own feedback backlog (see lib/feedback-adapters.ts) — lets this
              dashboard read and resolve that repo&apos;s own tickets directly.
            </p>
            <div>
              <label className="block text-xs font-medium text-[#76777A] mb-1.5">Supabase URL</label>
              <input
                value={targetSupabaseUrl}
                onChange={(e) => setTargetSupabaseUrl(e.target.value)}
                placeholder="https://xxxx.supabase.co"
                className="w-full bg-[#F4F2EE] border border-[#00205C]/[0.1] rounded-lg px-3 py-2 text-sm text-[#00205C] focus:outline-none focus:border-[#4B858E]/60"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#76777A] mb-1.5">
                Service Role Key {hasTargetKey ? "(set — enter a new value to replace)" : "(not set)"}
              </label>
              <input
                type="password"
                value={targetSupabaseKey}
                onChange={(e) => setTargetSupabaseKey(e.target.value)}
                placeholder={hasTargetKey ? "••••••••••••" : "Not set"}
                autoComplete="off"
                className="w-full bg-[#F4F2EE] border border-[#00205C]/[0.1] rounded-lg px-3 py-2 text-sm text-[#00205C] focus:outline-none focus:border-[#4B858E]/60"
              />
            </div>
            {credsError && <p className="text-red-400 text-xs">{credsError}</p>}
            <button
              onClick={handleSaveCredentials}
              disabled={credsSaving}
              className="text-sm font-bold px-6 py-2.5 rounded-full bg-[#4B858E] text-white hover:bg-[#5a9aa4] disabled:opacity-50 transition-colors"
            >
              {credsSaving ? "Saving..." : credsSaved ? "Saved ✓" : "Save Credentials"}
            </button>
          </div>

          {/* Run Planning Session */}
          <div className="bg-white border border-[#00205C]/10 rounded-2xl p-6 space-y-4">
            <span className="text-xs font-bold tracking-widest uppercase text-[#4B858E] block">
              Run Planning Session
            </span>
            <div>
              <label className="block text-xs font-medium text-[#76777A] mb-1.5">Brief</label>
              <textarea
                value={planningBrief}
                onChange={(e) => setPlanningBrief(e.target.value)}
                placeholder="What should this planning session focus on?"
                rows={3}
                className="w-full bg-[#F4F2EE] border border-[#00205C]/[0.1] rounded-lg px-3 py-2 text-sm text-[#00205C] focus:outline-none focus:border-[#4B858E]/60 resize-none"
              />
            </div>
            {dispatchError && <p className="text-red-400 text-xs">{dispatchError}</p>}
            <button
              onClick={handleRunPlanningSession}
              disabled={dispatching || !planningBrief.trim() || !repo.github_app_installation_id}
              className="text-sm font-bold px-6 py-2.5 rounded-full bg-[#4B858E] text-white hover:bg-[#5a9aa4] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {dispatching ? "Dispatching..." : "Run Planning Session"}
            </button>
            {!repo.github_app_installation_id && (
              <p className="text-[#76777A] text-xs">Set a GitHub App Installation ID above first.</p>
            )}
          </div>

          {/* Save */}
          <div className="flex items-center gap-4 pb-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="text-sm font-bold px-7 py-3 rounded-full bg-[#4B858E] text-white hover:bg-[#5a9aa4] disabled:opacity-50 transition-colors"
            >
              {saving ? "Saving..." : saved ? "Saved ✓" : "Save Changes"}
            </button>
            {saveError && <span className="text-red-400 text-sm">{saveError}</span>}
          </div>
          </>
          )}

          {/* Feedback tab */}
          {activeTab === "feedback" && (
            <div className="bg-white border border-[#00205C]/10 rounded-2xl p-6 space-y-4 mb-12">
              {feedbackLoading ? (
                <p className="text-[#76777A] text-sm">Loading...</p>
              ) : !feedbackConfigured ? (
                <p className="text-[#76777A] text-sm">
                  No feedback source configured for this repo yet — add Target Supabase Credentials
                  on the Settings tab first.
                </p>
              ) : (
                <>
                  {feedbackError && <p className="text-red-400 text-xs">{feedbackError}</p>}
                  {feedbackItems.length === 0 ? (
                    <p className="text-[#00205C] text-sm">No open feedback tickets.</p>
                  ) : (
                    <div className="space-y-3">
                      {feedbackItems.map((item) => (
                        <div
                          key={item.id}
                          className="border border-[#00205C]/[0.1] rounded-xl p-4 flex items-start justify-between gap-4"
                        >
                          <div className="min-w-0">
                            <p className="text-[#00205C] text-sm font-medium">{item.title}</p>
                            {item.body && <p className="text-[#76777A] text-xs mt-1">{item.body}</p>}
                            <p className="text-[#76777A] text-xs mt-1 uppercase tracking-wide">{item.status}</p>
                          </div>
                          <button
                            onClick={() => handleResolveFeedback(item.id)}
                            disabled={resolvingId === item.id}
                            className="text-xs font-semibold px-4 py-2 rounded-full border border-[#4B858E] text-[#4B858E] hover:bg-[#4B858E]/10 disabled:opacity-50 transition-colors flex-shrink-0"
                          >
                            {resolvingId === item.id ? "Resolving..." : "Resolve"}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Reviews tab — this repo's own scoped Pending/Answered list */}
          {activeTab === "reviews" && (
            <div className="bg-white border border-[#00205C]/10 rounded-2xl p-6 mb-12">
              <ReviewList
                initialItems={reviewItems}
                emptyPendingLabel="Nothing to review for this repo."
                emptyAnsweredLabel="No answered items yet for this repo."
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

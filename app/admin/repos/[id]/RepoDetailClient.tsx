"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getSupabaseBrowser } from "@/lib/supabase";
import SignOutButton from "@/app/components/SignOutButton";
import { FRAMEWORK_OPTIONS, AUTH_OPTIONS, type ProjectOption } from "../RepoFleetClient";

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
};

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function RepoDetailClient({
  repo,
  projects,
}: {
  repo: RepoFields;
  projects: ProjectOption[];
}) {
  const router = useRouter();
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
                Automation enabled (per-repo pause switch — nothing reads this until Phase 4's scheduler)
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
          <div className="flex items-center gap-4 pb-12">
            <button
              onClick={handleSave}
              disabled={saving}
              className="text-sm font-bold px-7 py-3 rounded-full bg-[#4B858E] text-white hover:bg-[#5a9aa4] disabled:opacity-50 transition-colors"
            >
              {saving ? "Saving..." : saved ? "Saved ✓" : "Save Changes"}
            </button>
            {saveError && <span className="text-red-400 text-sm">{saveError}</span>}
          </div>
        </div>
      </main>
    </div>
  );
}

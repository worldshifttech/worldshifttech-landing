"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { getSupabaseBrowser } from "@/lib/supabase";

// ─── Types ────────────────────────────────────────────────────────────────────

type PricingTier = {
  low: number;
  high: number;
  description: string;
};

export type ScopeData = {
  title: string;
  the_problem: string;
  without_it: string;
  with_it: string;
  price_low: number;
  price_high: number;
  price_rationale: string;
  green_score: "Light" | "Moderate" | "Heavy";
  pricing?: {
    mvp: PricingTier;
    polished: PricingTier;
    perfected: PricingTier;
    value_rationale: string;
  };
};

export type AdminProject = {
  id: string;
  title: string | null;
  status: string;
  created_at: string;
  scope: ScopeData | null;
  answers: Record<string, unknown> | null;
  user_id: string | null;
  userEmail: string;
  claude_code_prompt: string | null;
  demo_url: string | null;
  project_readme: string | null;
  guest: boolean;
};

type AuditFinding = {
  tool: string;
  department: string;
  issue: string;
  impact: "low" | "medium" | "high";
  recommendation: string;
};

type AuditReportData = {
  headline: string;
  waste_score: "low" | "medium" | "high" | "critical";
  estimated_monthly_waste_low: number;
  estimated_monthly_waste_high: number;
  estimated_hours_wasted_per_month: number;
  summary: string;
  findings: AuditFinding[];
  quick_wins: string[];
  environmental_note: string;
  redirect_estimate_usd: number;
};

export type AuditEstimate = {
  id: string;
  created_at: string;
  business_name: string | null;
  business_type: string;
  team_size: string;
  departments: string[];
  tools_by_department: Record<string, string[]>;
  ai_usage: Record<string, boolean>;
  monthly_spend_range: string;
  report: AuditReportData | null;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function relativeDate(dateStr: string): string {
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

const STATUS_BADGE: Record<string, string> = {
  draft: "bg-[#767B7A]/20 text-[#767B7A] border border-[#767B7A]/30",
  scoped: "border border-[#4B858E] text-[#4B858E]",
  submitted: "bg-[#4B858E] text-[#080C14]",
  reviewed: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
  approved: "bg-green-600/20 text-green-400 border border-green-600/30",
  building: "bg-orange-500/20 text-orange-400 border border-orange-500/30",
  live: "bg-green-400/20 text-green-300 border border-green-400/30",
  resubmitted: "bg-purple-500/20 text-purple-400 border border-purple-500/30",
};

const STATUS_TRANSITIONS: Record<string, { label: string; next: string } | undefined> = {
  submitted: { label: "Mark Reviewed", next: "reviewed" },
  reviewed: { label: "Approve", next: "approved" },
  approved: { label: "Mark Building", next: "building" },
  building: { label: "Mark Live", next: "live" },
  resubmitted: { label: "Mark Reviewed", next: "reviewed" },
};

const GREEN_SCORE_STYLES: Record<
  ScopeData["green_score"],
  { label: string; border: string; text: string }
> = {
  Light: { label: "Energy Footprint: Light", border: "border-green-500/40", text: "text-green-400" },
  Moderate: { label: "Energy Footprint: Moderate", border: "border-yellow-500/40", text: "text-yellow-400" },
  Heavy: { label: "Energy Footprint: Heavy", border: "border-orange-500/40", text: "text-orange-400" },
};

const WASTE_SCORE_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  low: { bg: "bg-green-500/15", text: "text-green-400", border: "border-green-500/30" },
  medium: { bg: "bg-yellow-500/15", text: "text-yellow-400", border: "border-yellow-500/30" },
  high: { bg: "bg-orange-500/15", text: "text-orange-400", border: "border-orange-500/30" },
  critical: { bg: "bg-red-500/15", text: "text-red-400", border: "border-red-500/30" },
};

const IMPACT_TEXT: Record<string, string> = {
  low: "text-green-400",
  medium: "text-yellow-400",
  high: "text-orange-400",
};

const Q_LABELS: Record<string, string> = {
  q1: "What kind of tool",
  q2: "Who it's for",
  q3: "The problem",
  q4: "What it costs",
  value_signals: "Value if it worked perfectly",
  q6: "What would change",
  q7: "Needs AI?",
  q8: "Who else uses it",
  q9: "Success in 90 days",
  q10: "Existing integrations",
  q10_other: "Other integration",
  q11: "Technical level",
  q12: "Anything else",
};

function buildClaudePrompt(scope: ScopeData): string {
  return `---

Read the README first, then build this project:

**Project:** ${scope.title}

**The Problem**
${scope.the_problem}

**Without It**
${scope.without_it}

**With It**
${scope.with_it}

**Investment Range:** $${scope.price_low.toLocaleString()} – $${scope.price_high.toLocaleString()}

**What to Build**
Based on the scope above, implement the full solution. Start with the core data model and API layer, then build the UI. Deploy to Vercel when complete and return the live URL.

---`;
}

function formatAnswer(value: unknown): string {
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "string") return value;
  return String(value ?? "");
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function AdminDashboard({
  initialProjects,
  auditEstimates,
}: {
  initialProjects: AdminProject[];
  auditEstimates: AuditEstimate[];
}) {
  const [projects, setProjects] = useState<AdminProject[]>(initialProjects);
  const [activeTab, setActiveTab] = useState<"projects" | "audits">("projects");
  const [openId, setOpenId] = useState<string | null>(null);
  const [openAuditId, setOpenAuditId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [backToReviewError, setBackToReviewError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedReadmeId, setCopiedReadmeId] = useState<string | null>(null);
  const [promptLoadingIds, setPromptLoadingIds] = useState<Set<string>>(new Set());
  const [regeneratingIds, setRegeneratingIds] = useState<Set<string>>(new Set());
  const [regenerateErrors, setRegenerateErrors] = useState<Set<string>>(new Set());
  const [incompleteOpen, setIncompleteOpen] = useState(false);
  const [demoUrlDrafts, setDemoUrlDrafts] = useState<Record<string, string>>({});
  const [savingDemoUrlIds, setSavingDemoUrlIds] = useState<Set<string>>(new Set());
  const [savedDemoUrlIds, setSavedDemoUrlIds] = useState<Set<string>>(new Set());
  const [demoUrlSaveErrors, setDemoUrlSaveErrors] = useState<Record<string, string>>({});

  const activeProjects = projects.filter((p) => !p.guest);
  const incompleteProjects = projects.filter((p) => p.guest);
  const total = activeProjects.length;
  const submittedCount = activeProjects.filter((p) => p.status === "submitted").length;
  const inReviewCount = activeProjects.filter((p) => p.status === "reviewed").length;

  async function handleStatusUpdate(projectId: string, newStatus: string) {
    setUpdatingId(projectId);
    setUpdateError(null);

    const supabase = getSupabaseBrowser();
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;

    if (newStatus === "approved") {
      setProjects((prev) =>
        prev.map((p) => (p.id === projectId ? { ...p, status: "approved" } : p))
      );
      setPromptLoadingIds((prev) => new Set([...prev, projectId]));
    }

    try {
      const res = await fetch("/api/admin-update-status", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ projectId, status: newStatus }),
      });
      if (!res.ok) throw new Error("Update failed");

      const data = await res.json();

      setProjects((prev) =>
        prev.map((p) => {
          if (p.id !== projectId) return p;
          return {
            ...p,
            status: newStatus,
            ...(data.demo_url !== undefined ? { demo_url: data.demo_url } : {}),
            ...(data.claude_code_prompt !== undefined
              ? { claude_code_prompt: data.claude_code_prompt }
              : {}),
            ...(data.project_readme !== undefined
              ? { project_readme: data.project_readme }
              : {}),
          };
        })
      );

      if (newStatus === "live") {
        fetch("/api/notify-client", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ projectId }),
        }).catch(() => {});
      }
    } catch {
      if (newStatus === "approved") {
        setProjects((prev) =>
          prev.map((p) => (p.id === projectId ? { ...p, status: "reviewed" } : p))
        );
      }
      setUpdateError(projectId);
    } finally {
      setUpdatingId(null);
      setPromptLoadingIds((prev) => {
        const next = new Set(prev);
        next.delete(projectId);
        return next;
      });
    }
  }

  async function handleBackToReview(projectId: string) {
    setUpdatingId(projectId);
    setBackToReviewError(null);

    const supabase = getSupabaseBrowser();
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;

    try {
      const res = await fetch("/api/admin-update-status", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ projectId, status: "reviewed" }),
      });
      if (!res.ok) throw new Error("Update failed");
      setProjects((prev) =>
        prev.map((p) => (p.id === projectId ? { ...p, status: "reviewed" } : p))
      );
    } catch {
      setBackToReviewError(projectId);
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleRegeneratePrompt(projectId: string) {
    setRegeneratingIds((prev) => new Set([...prev, projectId]));
    setRegenerateErrors((prev) => { const next = new Set(prev); next.delete(projectId); return next; });

    const supabase = getSupabaseBrowser();
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;

    try {
      const res = await fetch("/api/admin-update-status", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ projectId, status: "approved" }),
      });
      if (!res.ok) throw new Error("Regeneration failed");
      const data = await res.json();
      setProjects((prev) =>
        prev.map((p) => {
          if (p.id !== projectId) return p;
          return {
            ...p,
            ...(data.claude_code_prompt !== undefined
              ? { claude_code_prompt: data.claude_code_prompt }
              : {}),
            ...(data.project_readme !== undefined
              ? { project_readme: data.project_readme }
              : {}),
          };
        })
      );
    } catch {
      setRegenerateErrors((prev) => new Set([...prev, projectId]));
    } finally {
      setRegeneratingIds((prev) => { const next = new Set(prev); next.delete(projectId); return next; });
    }
  }

  async function handleCopy(projectId: string, text: string) {
    await navigator.clipboard.writeText(text);
    setCopiedId(projectId);
    setTimeout(() => setCopiedId((prev) => (prev === projectId ? null : prev)), 2000);
  }

  async function handleSaveDemoUrl(projectId: string, url: string) {
    setSavingDemoUrlIds((prev) => new Set([...prev, projectId]));
    setDemoUrlSaveErrors((prev) => { const next = { ...prev }; delete next[projectId]; return next; });

    const supabase = getSupabaseBrowser();
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;

    console.log("[DEMO URL SAVE]", projectId, url);

    try {
      const res = await fetch("/api/admin-update-demo-url", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ projectId, demo_url: url }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const msg = data.error ?? `Save failed (${res.status})`;
        console.log("[DEMO URL SAVE ERROR]", msg);
        setDemoUrlSaveErrors((prev) => ({ ...prev, [projectId]: msg }));
        return;
      }

      setProjects((prev) =>
        prev.map((p) => (p.id === projectId ? { ...p, demo_url: url } : p))
      );
      setSavedDemoUrlIds((prev) => new Set([...prev, projectId]));
      setTimeout(() => {
        setSavedDemoUrlIds((prev) => {
          const next = new Set(prev);
          next.delete(projectId);
          return next;
        });
      }, 2000);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Save failed";
      console.log("[DEMO URL SAVE ERROR]", msg);
      setDemoUrlSaveErrors((prev) => ({ ...prev, [projectId]: msg }));
    } finally {
      setSavingDemoUrlIds((prev) => {
        const next = new Set(prev);
        next.delete(projectId);
        return next;
      });
    }
  }

  async function handleCopyReadme(projectId: string, text: string) {
    await navigator.clipboard.writeText(text);
    setCopiedReadmeId(projectId);
    setTimeout(() => setCopiedReadmeId((prev) => (prev === projectId ? null : prev)), 2000);
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-5 border-b border-white/[0.06]">
        <Link href="/">
          <Image
            src="/World_shift_tech_LOGO_WHITE.png"
            alt="World Shift Technologies"
            width={160}
            height={38}
            className="object-contain"
            priority
          />
        </Link>
        <Link
          href="/"
          className="text-sm text-[#767B7A] hover:text-[#F4F2EE] transition-colors"
          style={{ fontFamily: "var(--font-dm-sans)" }}
        >
          &larr; Back to Site
        </Link>
      </nav>

      {/* Main */}
      <main className="flex-1 px-6 py-16">
        <div className="w-full max-w-5xl mx-auto">
          <h1
            className="text-4xl sm:text-5xl font-bold text-[#F4F2EE] mb-6"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            Admin
          </h1>

          {/* Tabs */}
          <div className="flex items-center gap-1 border-b border-white/[0.06] mb-10">
            {(["projects", "audits"] as const).map((tab) => {
              const label =
                tab === "projects"
                  ? `Projects (${total})`
                  : `Audits (${auditEstimates.length})`;
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`text-sm font-semibold px-4 py-3 border-b-2 -mb-px transition-colors ${
                    isActive
                      ? "text-[#F4F2EE] border-[#4B858E]"
                      : "text-[#767B7A] border-transparent hover:text-[#F4F2EE]"
                  }`}
                  style={{ fontFamily: "var(--font-dm-sans)" }}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* ─── Projects tab ──────────────────────────────────────────────── */}
          {activeTab === "projects" && (
            <>
              <p
                className="text-[#767B7A] text-sm mb-8"
                style={{ fontFamily: "var(--font-dm-sans)" }}
              >
                {total} project{total !== 1 ? "s" : ""} &mdash; {submittedCount} submitted, {inReviewCount} in review
              </p>

              {total === 0 ? (
                <p className="text-[#F4F2EE] text-sm" style={{ fontFamily: "var(--font-dm-sans)" }}>
                  No projects yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {activeProjects.map((project) => {
                    const isOpen = openId === project.id;
                    const transition = STATUS_TRANSITIONS[project.status];
                    const badgeClass = STATUS_BADGE[project.status] ?? "border border-white/20 text-[#767B7A]";
                    const isPromptLoading = promptLoadingIds.has(project.id);
                    const promptText =
                      project.claude_code_prompt ??
                      (project.scope ? buildClaudePrompt(project.scope) : null);

                    return (
                      <div key={project.id} className="border border-white/[0.08] rounded-2xl overflow-hidden">
                        {/* Row */}
                        <div className="flex items-center gap-4 px-6 py-5">
                          <div className="flex-1 min-w-0">
                            <p
                              className="text-[#F4F2EE] font-medium truncate"
                              style={{ fontFamily: "var(--font-dm-sans)" }}
                            >
                              {project.title ?? "Untitled Project"}
                            </p>
                            <p
                              className="text-[#767B7A] text-xs mt-0.5"
                              style={{ fontFamily: "var(--font-dm-sans)" }}
                            >
                              {project.userEmail}
                            </p>
                          </div>

                          <span
                            className={`text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${badgeClass}`}
                            style={{ fontFamily: "var(--font-dm-sans)" }}
                          >
                            {project.status}
                          </span>

                          <span
                            className="hidden sm:block text-[#767B7A] text-xs flex-shrink-0"
                            style={{ fontFamily: "var(--font-dm-sans)" }}
                          >
                            {relativeDate(project.created_at)}
                          </span>

                          <button
                            onClick={() => setOpenId(isOpen ? null : project.id)}
                            className="flex-shrink-0 text-xs font-semibold px-4 py-2 rounded-full border border-[#4B858E] text-[#4B858E] hover:bg-[#4B858E]/10 transition-colors"
                            style={{ fontFamily: "var(--font-dm-sans)" }}
                          >
                            {isOpen ? "Close" : "View"}
                          </button>
                        </div>

                        {/* Inline detail panel */}
                        {isOpen && (
                          <div className="border-t border-white/[0.06] bg-[#080C14]/40 px-6 py-8">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                              {/* Left — Scope Doc */}
                              <div>
                                {project.scope ? (
                                  <>
                                    <div className="flex flex-wrap items-start justify-between gap-3 mb-1">
                                      <h2
                                        className="text-2xl font-bold text-[#F4F2EE] leading-snug"
                                        style={{ fontFamily: "var(--font-playfair)" }}
                                      >
                                        {project.scope.title}
                                      </h2>
                                      <span
                                        className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${
                                          GREEN_SCORE_STYLES[project.scope.green_score].border
                                        } ${GREEN_SCORE_STYLES[project.scope.green_score].text}`}
                                        style={{ fontFamily: "var(--font-dm-sans)" }}
                                      >
                                        {GREEN_SCORE_STYLES[project.scope.green_score].label}
                                      </span>
                                    </div>
                                    <div className="h-px bg-[#4B858E]/30 my-5" />
                                    <div className="space-y-5">
                                      {[
                                        { label: "The Problem", value: project.scope.the_problem },
                                        { label: "Without It", value: project.scope.without_it },
                                        { label: "With It", value: project.scope.with_it },
                                      ].map(({ label, value }) => (
                                        <div key={label}>
                                          <span
                                            className="text-xs font-bold tracking-widest uppercase text-[#4B858E]"
                                            style={{ fontFamily: "var(--font-dm-sans)" }}
                                          >
                                            {label}
                                          </span>
                                          <p
                                            className="mt-1.5 text-[#F4F2EE]/70 text-sm leading-relaxed"
                                            style={{ fontFamily: "var(--font-dm-sans)" }}
                                          >
                                            {value}
                                          </p>
                                        </div>
                                      ))}
                                      <div>
                                        <span
                                          className="text-xs font-bold tracking-widest uppercase text-[#4B858E]"
                                          style={{ fontFamily: "var(--font-dm-sans)" }}
                                        >
                                          Investment Estimate
                                        </span>
                                        {project.scope.pricing ? (
                                          <div className="mt-3 space-y-3">
                                            {(["mvp", "polished", "perfected"] as const).map((tier) => {
                                              const tierData = project.scope!.pricing![tier];
                                              const tierLabel = { mvp: "MVP", polished: "Polished", perfected: "Perfected" }[tier];
                                              return (
                                                <div key={tier}>
                                                  <div className="flex items-baseline gap-2">
                                                    <span
                                                      className="text-[#F4F2EE] text-sm font-semibold"
                                                      style={{ fontFamily: "var(--font-dm-sans)" }}
                                                    >
                                                      {tierLabel}
                                                    </span>
                                                    <span
                                                      className="text-[#F4F2EE]/80 text-sm font-medium"
                                                      style={{ fontFamily: "var(--font-dm-sans)" }}
                                                    >
                                                      ${tierData.low.toLocaleString()} &ndash; ${tierData.high.toLocaleString()}
                                                    </span>
                                                  </div>
                                                  <p
                                                    className="text-[#F4F2EE] text-xs leading-relaxed mt-0.5"
                                                    style={{ fontFamily: "var(--font-dm-sans)" }}
                                                  >
                                                    {tierData.description}
                                                  </p>
                                                </div>
                                              );
                                            })}
                                            <p
                                              className="text-[#F4F2EE] text-xs italic leading-relaxed mt-2"
                                              style={{ fontFamily: "var(--font-dm-sans)" }}
                                            >
                                              {project.scope.pricing.value_rationale}
                                            </p>
                                          </div>
                                        ) : (
                                          <>
                                            <p
                                              className="mt-1.5 text-[#F4F2EE] text-base font-semibold"
                                              style={{ fontFamily: "var(--font-dm-sans)" }}
                                            >
                                              ${project.scope.price_low.toLocaleString()} &ndash; ${project.scope.price_high.toLocaleString()}
                                            </p>
                                            <p
                                              className="mt-1 text-[#F4F2EE] text-xs leading-relaxed"
                                              style={{ fontFamily: "var(--font-dm-sans)" }}
                                            >
                                              {project.scope.price_rationale}
                                            </p>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                  </>
                                ) : (
                                  <p className="text-[#F4F2EE] text-sm" style={{ fontFamily: "var(--font-dm-sans)" }}>
                                    No scope generated yet.
                                  </p>
                                )}
                              </div>

                              {/* Right — Raw Answers */}
                              <div>
                                <h3
                                  className="text-xs font-bold tracking-widest uppercase text-[#4B858E] mb-4"
                                  style={{ fontFamily: "var(--font-dm-sans)" }}
                                >
                                  Raw Answers
                                </h3>
                                <div className="space-y-3">
                                  {Object.entries(Q_LABELS).map(([key, label]) => {
                                    const value = project.answers?.[key];
                                    if (!value || (Array.isArray(value) && value.length === 0)) return null;
                                    const text = formatAnswer(value);
                                    if (!text.trim()) return null;
                                    return (
                                      <div key={key}>
                                        <span
                                          className="text-[#767B7A] text-xs"
                                          style={{ fontFamily: "var(--font-dm-sans)" }}
                                        >
                                          {label}
                                        </span>
                                        <p
                                          className="text-[#F4F2EE] text-sm mt-0.5 leading-relaxed"
                                          style={{ fontFamily: "var(--font-dm-sans)" }}
                                        >
                                          {text}
                                        </p>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>

                            {/* Status Controls */}
                            <div className="border-t border-white/[0.06] pt-6">
                              <div className="flex flex-wrap items-center gap-4">
                                <span
                                  className="text-[#767B7A] text-sm"
                                  style={{ fontFamily: "var(--font-dm-sans)" }}
                                >
                                  Status: <span className="text-[#F4F2EE] font-medium">{project.status}</span>
                                </span>

                                {transition && (
                                  <button
                                    onClick={() => handleStatusUpdate(project.id, transition.next)}
                                    disabled={updatingId === project.id}
                                    className={`text-xs font-semibold px-4 py-2 rounded-full transition-colors ${
                                      updatingId === project.id
                                        ? "bg-white/[0.06] text-[#767B7A] cursor-not-allowed"
                                        : "bg-[#4B858E] text-[#080C14] hover:bg-[#5a9aa4] cursor-pointer"
                                    }`}
                                    style={{ fontFamily: "var(--font-dm-sans)" }}
                                  >
                                    {updatingId === project.id ? "Updating..." : transition.label}
                                  </button>
                                )}

                                {project.status === "approved" && (
                                  <button
                                    onClick={() => handleBackToReview(project.id)}
                                    disabled={updatingId === project.id}
                                    className={`text-xs font-semibold px-4 py-2 rounded-full border border-white/20 text-[#767B7A] transition-colors ${
                                      updatingId === project.id
                                        ? "cursor-not-allowed opacity-50"
                                        : "hover:border-white/40 hover:text-[#F4F2EE] cursor-pointer"
                                    }`}
                                    style={{ fontFamily: "var(--font-dm-sans)" }}
                                  >
                                    {updatingId === project.id ? "Updating..." : "← Back to Review"}
                                  </button>
                                )}

                                {updateError === project.id && (
                                  <span
                                    className="text-red-400 text-xs"
                                    style={{ fontFamily: "var(--font-dm-sans)" }}
                                  >
                                    Update failed. Try again.
                                  </span>
                                )}

                                {backToReviewError === project.id && (
                                  <span
                                    className="text-red-400 text-xs"
                                    style={{ fontFamily: "var(--font-dm-sans)" }}
                                  >
                                    Status update failed — try again
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Claude Code Prompt */}
                            {(project.status === "approved" || project.status === "live") && (
                              <div className="border-t border-white/[0.06] pt-6 mt-6">
                                <span
                                  className="text-xs font-bold tracking-widest uppercase text-[#4B858E] block mb-3"
                                  style={{ fontFamily: "var(--font-dm-sans)" }}
                                >
                                  Claude Code Build Prompt
                                </span>

                                {isPromptLoading ? (
                                  <div className="space-y-2 animate-pulse">
                                    <div className="h-3 bg-white/[0.06] rounded w-3/4" />
                                    <div className="h-3 bg-white/[0.06] rounded w-full" />
                                    <div className="h-3 bg-white/[0.06] rounded w-5/6" />
                                    <div className="h-3 bg-white/[0.06] rounded w-2/3" />
                                    <div className="h-3 bg-white/[0.06] rounded w-full" />
                                    <div className="h-3 bg-white/[0.06] rounded w-4/5" />
                                  </div>
                                ) : promptText ? (
                                  <>
                                    <div className="flex items-center justify-between mb-3">
                                      <span />
                                      <button
                                        onClick={() => handleCopy(project.id, promptText)}
                                        className="text-xs font-semibold px-4 py-1.5 rounded-full border border-[#4B858E] text-[#4B858E] hover:bg-[#4B858E]/10 transition-colors"
                                        style={{ fontFamily: "var(--font-dm-sans)" }}
                                      >
                                        {copiedId === project.id ? "Copied ✓" : "Copy Prompt"}
                                      </button>
                                    </div>
                                    <pre
                                      className="bg-[#080C14] border border-white/[0.06] rounded-xl p-5 text-[#F4F2EE]/80 text-xs leading-relaxed overflow-auto whitespace-pre-wrap"
                                      style={{ fontFamily: "monospace", maxHeight: "400px" }}
                                    >
                                      {promptText}
                                    </pre>
                                    <div className="mt-3">
                                      <span
                                        className="text-[#767B7A] text-xs block mb-1.5"
                                        style={{ fontFamily: "var(--font-dm-sans)" }}
                                      >
                                        Demo URL
                                      </span>
                                      <div className="flex items-center gap-2">
                                        <input
                                          type="url"
                                          value={demoUrlDrafts[project.id] ?? project.demo_url ?? ""}
                                          onChange={(e) =>
                                            setDemoUrlDrafts((prev) => ({ ...prev, [project.id]: e.target.value }))
                                          }
                                          placeholder="https://your-vercel-url.vercel.app"
                                          className="flex-1 min-w-0 bg-[#080C14] border border-white/[0.08] rounded-lg px-3 py-1.5 text-[#F4F2EE] text-xs placeholder-[#767B7A] focus:outline-none focus:border-[#4B858E]/50"
                                          style={{ fontFamily: "var(--font-dm-sans)" }}
                                        />
                                        <button
                                          onClick={() =>
                                            handleSaveDemoUrl(
                                              project.id,
                                              demoUrlDrafts[project.id] ?? project.demo_url ?? ""
                                            )
                                          }
                                          disabled={savingDemoUrlIds.has(project.id)}
                                          className="flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#4B858E] text-[#080C14] hover:bg-[#5a9aa4] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                          style={{ fontFamily: "var(--font-dm-sans)" }}
                                        >
                                          {savedDemoUrlIds.has(project.id)
                                            ? "Saved ✓"
                                            : savingDemoUrlIds.has(project.id)
                                            ? "Saving..."
                                            : "Save"}
                                        </button>
                                      </div>
                                      {demoUrlSaveErrors[project.id] && (
                                        <p
                                          className="text-red-400 text-xs mt-1.5"
                                          style={{ fontFamily: "var(--font-dm-sans)" }}
                                        >
                                          {demoUrlSaveErrors[project.id]}
                                        </p>
                                      )}
                                    </div>
                                    {project.status === "approved" && (
                                      <div className="mt-3">
                                        <button
                                          onClick={() => handleRegeneratePrompt(project.id)}
                                          disabled={regeneratingIds.has(project.id)}
                                          className={`text-xs font-semibold px-4 py-1.5 rounded-full border transition-colors ${
                                            regeneratingIds.has(project.id)
                                              ? "border-white/10 text-[#767B7A] cursor-not-allowed"
                                              : "border-white/20 text-[#767B7A] hover:border-white/40 hover:text-[#F4F2EE] cursor-pointer"
                                          }`}
                                          style={{ fontFamily: "var(--font-dm-sans)" }}
                                        >
                                          {regeneratingIds.has(project.id) ? "Regenerating..." : "Regenerate Prompt"}
                                        </button>
                                        {regenerateErrors.has(project.id) && (
                                          <span
                                            className="text-red-400 text-xs ml-3"
                                            style={{ fontFamily: "var(--font-dm-sans)" }}
                                          >
                                            Regeneration failed — try again
                                          </span>
                                        )}
                                      </div>
                                    )}
                                  </>
                                ) : null}

                                {/* Project README */}
                                <div className="mt-8">
                                  <span
                                    className="text-xs font-bold tracking-widest uppercase text-[#4B858E] block mb-3"
                                    style={{ fontFamily: "var(--font-dm-sans)" }}
                                  >
                                    Project README
                                  </span>
                                  {isPromptLoading ? (
                                    <div className="space-y-2 animate-pulse">
                                      <div className="h-3 bg-white/[0.06] rounded w-3/4" />
                                      <div className="h-3 bg-white/[0.06] rounded w-full" />
                                      <div className="h-3 bg-white/[0.06] rounded w-5/6" />
                                      <div className="h-3 bg-white/[0.06] rounded w-2/3" />
                                    </div>
                                  ) : project.project_readme ? (
                                    <>
                                      <div className="flex items-center justify-between mb-3">
                                        <span />
                                        <button
                                          onClick={() => handleCopyReadme(project.id, project.project_readme!)}
                                          className="text-xs font-semibold px-4 py-1.5 rounded-full border border-[#4B858E] text-[#4B858E] hover:bg-[#4B858E]/10 transition-colors"
                                          style={{ fontFamily: "var(--font-dm-sans)" }}
                                        >
                                          {copiedReadmeId === project.id ? "Copied ✓" : "Copy README"}
                                        </button>
                                      </div>
                                      <pre
                                        className="bg-[#080C14] border border-white/[0.06] rounded-xl p-5 text-[#F4F2EE]/80 text-xs leading-relaxed overflow-auto whitespace-pre-wrap"
                                        style={{ fontFamily: "monospace", maxHeight: "400px" }}
                                      >
                                        {project.project_readme}
                                      </pre>
                                    </>
                                  ) : (
                                    <p
                                      className="text-[#767B7A] text-xs"
                                      style={{ fontFamily: "var(--font-dm-sans)" }}
                                    >
                                      README not generated — regenerate the prompt to produce one
                                    </p>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* ─── Incomplete (guest) projects ─────────────────────────── */}
              {incompleteProjects.length > 0 && (
                <div className="mt-10">
                  <button
                    onClick={() => setIncompleteOpen((v) => !v)}
                    className="flex items-center gap-2 text-sm text-[#767B7A] hover:text-[#F4F2EE] transition-colors mb-4"
                    style={{ fontFamily: "var(--font-dm-sans)" }}
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 12 12"
                      fill="none"
                      className={`transition-transform ${incompleteOpen ? "rotate-90" : ""}`}
                    >
                      <path d="M4 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Incomplete ({incompleteProjects.length})
                  </button>

                  {incompleteOpen && (
                    <div className="space-y-3">
                      {incompleteProjects.map((project) => {
                        const isOpen = openId === project.id;
                        return (
                          <div key={project.id} className="border border-white/[0.06] rounded-2xl overflow-hidden opacity-70">
                            {/* Row */}
                            <div className="flex items-center gap-4 px-6 py-5">
                              <div className="flex-1 min-w-0">
                                <p
                                  className="text-[#F4F2EE]/80 font-medium truncate"
                                  style={{ fontFamily: "var(--font-dm-sans)" }}
                                >
                                  {project.title ?? "Untitled"}
                                </p>
                                <p
                                  className="text-[#F4F2EE] text-xs mt-0.5"
                                  style={{ fontFamily: "var(--font-dm-sans)" }}
                                >
                                  No account created
                                </p>
                              </div>

                              <span
                                className="text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 bg-white/[0.04] text-[#767B7A] border border-white/10"
                                style={{ fontFamily: "var(--font-dm-sans)" }}
                              >
                                incomplete
                              </span>

                              <span
                                className="hidden sm:block text-[#767B7A] text-xs flex-shrink-0"
                                style={{ fontFamily: "var(--font-dm-sans)" }}
                              >
                                {relativeDate(project.created_at)}
                              </span>

                              <button
                                onClick={() => setOpenId(isOpen ? null : project.id)}
                                className="flex-shrink-0 text-xs font-semibold px-4 py-2 rounded-full border border-[#4B858E] text-[#4B858E] hover:bg-[#4B858E]/10 transition-colors"
                                style={{ fontFamily: "var(--font-dm-sans)" }}
                              >
                                {isOpen ? "Close" : "View"}
                              </button>
                            </div>

                            {/* Inline detail panel */}
                            {isOpen && (
                              <div className="border-t border-white/[0.06] bg-[#080C14]/40 px-6 py-8">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                  {/* Left — Scope Doc */}
                                  <div>
                                    {project.scope ? (
                                      <>
                                        <div className="flex flex-wrap items-start justify-between gap-3 mb-1">
                                          <h2
                                            className="text-2xl font-bold text-[#F4F2EE] leading-snug"
                                            style={{ fontFamily: "var(--font-playfair)" }}
                                          >
                                            {project.scope.title}
                                          </h2>
                                          {project.scope.green_score && GREEN_SCORE_STYLES[project.scope.green_score] && (
                                            <span
                                              className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${GREEN_SCORE_STYLES[project.scope.green_score].border} ${GREEN_SCORE_STYLES[project.scope.green_score].text}`}
                                              style={{ fontFamily: "var(--font-dm-sans)" }}
                                            >
                                              {GREEN_SCORE_STYLES[project.scope.green_score].label}
                                            </span>
                                          )}
                                        </div>
                                        <div className="h-px bg-[#4B858E]/30 my-5" />
                                        <div className="space-y-5">
                                          {[
                                            { label: "The Problem", value: project.scope.the_problem },
                                            { label: "Without It", value: project.scope.without_it },
                                            { label: "With It", value: project.scope.with_it },
                                          ].map(({ label, value }) => (
                                            <div key={label}>
                                              <span
                                                className="text-xs font-bold tracking-widest uppercase text-[#4B858E]"
                                                style={{ fontFamily: "var(--font-dm-sans)" }}
                                              >
                                                {label}
                                              </span>
                                              <p
                                                className="mt-1.5 text-[#F4F2EE]/70 text-sm leading-relaxed"
                                                style={{ fontFamily: "var(--font-dm-sans)" }}
                                              >
                                                {value}
                                              </p>
                                            </div>
                                          ))}
                                          <div>
                                            <span
                                              className="text-xs font-bold tracking-widest uppercase text-[#4B858E]"
                                              style={{ fontFamily: "var(--font-dm-sans)" }}
                                            >
                                              Investment Estimate
                                            </span>
                                            {project.scope.pricing ? (
                                              <div className="mt-3 space-y-3">
                                                {(["mvp", "polished", "perfected"] as const).map((tier) => {
                                                  const tierData = project.scope!.pricing![tier];
                                                  const tierLabel = { mvp: "MVP", polished: "Polished", perfected: "Perfected" }[tier];
                                                  return (
                                                    <div key={tier}>
                                                      <div className="flex items-baseline gap-2">
                                                        <span className="text-[#F4F2EE] text-sm font-semibold" style={{ fontFamily: "var(--font-dm-sans)" }}>{tierLabel}</span>
                                                        <span className="text-[#F4F2EE]/80 text-sm font-medium" style={{ fontFamily: "var(--font-dm-sans)" }}>${tierData.low.toLocaleString()} &ndash; ${tierData.high.toLocaleString()}</span>
                                                      </div>
                                                      <p className="text-[#F4F2EE] text-xs leading-relaxed mt-0.5" style={{ fontFamily: "var(--font-dm-sans)" }}>{tierData.description}</p>
                                                    </div>
                                                  );
                                                })}
                                                <p className="text-[#F4F2EE] text-xs italic leading-relaxed mt-2" style={{ fontFamily: "var(--font-dm-sans)" }}>{project.scope.pricing.value_rationale}</p>
                                              </div>
                                            ) : (
                                              <p className="mt-1.5 text-[#F4F2EE] text-base font-semibold" style={{ fontFamily: "var(--font-dm-sans)" }}>
                                                ${project.scope.price_low.toLocaleString()} &ndash; ${project.scope.price_high.toLocaleString()}
                                              </p>
                                            )}
                                          </div>
                                        </div>
                                      </>
                                    ) : (
                                      <p className="text-[#767B7A] text-sm" style={{ fontFamily: "var(--font-dm-sans)" }}>No scope generated yet.</p>
                                    )}
                                  </div>

                                  {/* Right — Raw Answers */}
                                  <div>
                                    <h3
                                      className="text-xs font-bold tracking-widest uppercase text-[#4B858E] mb-4"
                                      style={{ fontFamily: "var(--font-dm-sans)" }}
                                    >
                                      Raw Answers
                                    </h3>
                                    <div className="space-y-3">
                                      {Object.entries(Q_LABELS).map(([key, label]) => {
                                        const value = project.answers?.[key];
                                        if (!value || (Array.isArray(value) && value.length === 0)) return null;
                                        const text = formatAnswer(value);
                                        if (!text.trim()) return null;
                                        return (
                                          <div key={key}>
                                            <span className="text-[#767B7A] text-xs" style={{ fontFamily: "var(--font-dm-sans)" }}>{label}</span>
                                            <p className="text-[#F4F2EE] text-sm mt-0.5 leading-relaxed" style={{ fontFamily: "var(--font-dm-sans)" }}>{text}</p>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* ─── Audits tab ────────────────────────────────────────────────── */}
          {activeTab === "audits" && (
            <>
              {auditEstimates.length === 0 ? (
                <p className="text-[#F4F2EE] text-sm" style={{ fontFamily: "var(--font-dm-sans)" }}>
                  No audits yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {auditEstimates.map((audit) => {
                    const isOpen = openAuditId === audit.id;
                    const score = audit.report?.waste_score ?? null;
                    const scoreStyle = score ? (WASTE_SCORE_STYLES[score] ?? WASTE_SCORE_STYLES.low) : null;
                    const aiTools = Object.entries(audit.ai_usage ?? {})
                      .filter(([, v]) => v)
                      .map(([k]) => k);

                    return (
                      <div key={audit.id} className="border border-white/[0.08] rounded-2xl overflow-hidden">
                        {/* Row */}
                        <div className="flex items-center gap-4 px-6 py-5">
                          <div className="flex-1 min-w-0">
                            <p
                              className="text-[#F4F2EE] font-medium truncate"
                              style={{ fontFamily: "var(--font-dm-sans)" }}
                            >
                              {audit.business_name ?? "Anonymous"}
                            </p>
                            <p
                              className="text-[#767B7A] text-xs mt-0.5"
                              style={{ fontFamily: "var(--font-dm-sans)" }}
                            >
                              {audit.business_type} &middot; {audit.team_size}
                            </p>
                          </div>

                          {scoreStyle && score ? (
                            <span
                              className={`text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0 border uppercase tracking-wide ${scoreStyle.bg} ${scoreStyle.text} ${scoreStyle.border}`}
                              style={{ fontFamily: "var(--font-dm-sans)" }}
                            >
                              {score}
                            </span>
                          ) : (
                            <span
                              className="text-xs px-2.5 py-1 rounded-full flex-shrink-0 border border-white/10 text-[#767B7A]"
                              style={{ fontFamily: "var(--font-dm-sans)" }}
                            >
                              pending
                            </span>
                          )}

                          {audit.report ? (
                            <span
                              className="hidden sm:block text-[#F4F2EE] text-xs flex-shrink-0 font-medium"
                              style={{ fontFamily: "var(--font-dm-sans)" }}
                            >
                              ${audit.report.estimated_monthly_waste_low.toLocaleString()}–${audit.report.estimated_monthly_waste_high.toLocaleString()}/mo
                            </span>
                          ) : null}

                          <span
                            className="hidden sm:block text-[#767B7A] text-xs flex-shrink-0"
                            style={{ fontFamily: "var(--font-dm-sans)" }}
                          >
                            {audit.monthly_spend_range}
                          </span>

                          <span
                            className="hidden sm:block text-[#767B7A] text-xs flex-shrink-0"
                            style={{ fontFamily: "var(--font-dm-sans)" }}
                          >
                            {relativeDate(audit.created_at)}
                          </span>

                          <button
                            onClick={() => setOpenAuditId(isOpen ? null : audit.id)}
                            className="flex-shrink-0 text-xs font-semibold px-4 py-2 rounded-full border border-[#4B858E] text-[#4B858E] hover:bg-[#4B858E]/10 transition-colors"
                            style={{ fontFamily: "var(--font-dm-sans)" }}
                          >
                            {isOpen ? "Close" : "View"}
                          </button>
                        </div>

                        {/* Detail panel */}
                        {isOpen && (
                          <div className="border-t border-white/[0.06] bg-[#080C14]/40 px-6 py-8">
                            {!audit.report ? (
                              <p
                                className="text-[#767B7A] text-sm text-center"
                                style={{ fontFamily: "var(--font-dm-sans)" }}
                              >
                                Report not yet generated.
                              </p>
                            ) : (
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Left — Audit Summary */}
                                <div>
                                  <div className="flex flex-wrap items-start gap-3 mb-4">
                                    <h2
                                      className="text-2xl font-bold text-[#F4F2EE] leading-snug"
                                      style={{ fontFamily: "var(--font-playfair)" }}
                                    >
                                      {audit.business_name ?? "Anonymous"}
                                    </h2>
                                    {scoreStyle && score && (
                                      <span
                                        className={`text-xs font-bold px-3 py-1.5 rounded-full border uppercase tracking-wide ${scoreStyle.bg} ${scoreStyle.text} ${scoreStyle.border}`}
                                        style={{ fontFamily: "var(--font-dm-sans)" }}
                                      >
                                        {score} waste
                                      </span>
                                    )}
                                  </div>

                                  <p
                                    className="text-[#F4F2EE] text-base leading-relaxed mb-5"
                                    style={{ fontFamily: "var(--font-playfair)" }}
                                  >
                                    {audit.report.headline}
                                  </p>

                                  {/* Waste estimate card */}
                                  <div className="border border-[#4B858E]/40 rounded-xl p-4 mb-5 bg-[#4B858E]/05">
                                    <p
                                      className="text-[#767B7A] text-xs uppercase tracking-widest mb-1"
                                      style={{ fontFamily: "var(--font-dm-sans)" }}
                                    >
                                      Estimated monthly waste
                                    </p>
                                    <p
                                      className="text-[#4B858E] text-2xl font-bold mb-1"
                                      style={{ fontFamily: "var(--font-playfair)" }}
                                    >
                                      ${audit.report.estimated_monthly_waste_low.toLocaleString()} – ${audit.report.estimated_monthly_waste_high.toLocaleString()}
                                    </p>
                                    <p
                                      className="text-[#767B7A] text-xs"
                                      style={{ fontFamily: "var(--font-dm-sans)" }}
                                    >
                                      {audit.report.estimated_hours_wasted_per_month} hours wasted per month
                                    </p>
                                  </div>

                                  <p
                                    className="text-[#F4F2EE]/70 text-sm leading-relaxed mb-5"
                                    style={{ fontFamily: "var(--font-dm-sans)" }}
                                  >
                                    {audit.report.summary}
                                  </p>

                                  {/* Findings */}
                                  {audit.report.findings?.length > 0 && (
                                    <div className="mb-5">
                                      <span
                                        className="text-xs font-bold tracking-widest uppercase text-[#4B858E] block mb-3"
                                        style={{ fontFamily: "var(--font-dm-sans)" }}
                                      >
                                        Findings
                                      </span>
                                      <div className="space-y-2">
                                        {audit.report.findings
                                          .sort((a, b) => {
                                            const order = { high: 0, medium: 1, low: 2 };
                                            return order[a.impact] - order[b.impact];
                                          })
                                          .map((f, i) => (
                                            <div
                                              key={i}
                                              className="bg-white/[0.02] border border-white/[0.06] rounded-lg p-3"
                                            >
                                              <div className="flex flex-wrap gap-2 items-center mb-1.5">
                                                <span
                                                  className="text-[#F4F2EE] text-xs font-semibold"
                                                  style={{ fontFamily: "var(--font-dm-sans)" }}
                                                >
                                                  {f.tool}
                                                </span>
                                                <span
                                                  className="text-[#767B7A] text-xs bg-white/[0.06] px-2 py-0.5 rounded-full"
                                                  style={{ fontFamily: "var(--font-dm-sans)" }}
                                                >
                                                  {f.department}
                                                </span>
                                                <span
                                                  className={`text-xs font-bold uppercase tracking-wide ${IMPACT_TEXT[f.impact] ?? "text-[#767B7A]"}`}
                                                  style={{ fontFamily: "var(--font-dm-sans)" }}
                                                >
                                                  {f.impact} impact
                                                </span>
                                              </div>
                                              <p
                                                className="text-[#767B7A] text-xs leading-relaxed mb-1"
                                                style={{ fontFamily: "var(--font-dm-sans)" }}
                                              >
                                                {f.issue}
                                              </p>
                                              <p
                                                className="text-[#4B858E] text-xs leading-relaxed"
                                                style={{ fontFamily: "var(--font-dm-sans)" }}
                                              >
                                                {f.recommendation}
                                              </p>
                                            </div>
                                          ))}
                                      </div>
                                    </div>
                                  )}

                                  {/* Quick wins */}
                                  {audit.report.quick_wins?.length > 0 && (
                                    <div className="mb-5">
                                      <span
                                        className="text-xs font-bold tracking-widest uppercase text-[#4B858E] block mb-3"
                                        style={{ fontFamily: "var(--font-dm-sans)" }}
                                      >
                                        Quick Wins
                                      </span>
                                      <ul className="space-y-1.5">
                                        {audit.report.quick_wins.map((win, i) => (
                                          <li
                                            key={i}
                                            className="flex gap-2 text-[#F4F2EE]/70 text-xs leading-relaxed"
                                            style={{ fontFamily: "var(--font-dm-sans)" }}
                                          >
                                            <span className="text-[#4B858E] flex-shrink-0">&rarr;</span>
                                            {win}
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}

                                  {/* Environmental note */}
                                  {audit.report.environmental_note && (
                                    <div className="border-l-2 border-[#4B858E]/50 pl-4 mb-4">
                                      <p
                                        className="text-[#767B7A] text-xs leading-relaxed mb-1"
                                        style={{ fontFamily: "var(--font-dm-sans)" }}
                                      >
                                        {audit.report.environmental_note}
                                      </p>
                                      <p
                                        className="text-[#4B858E] text-xs font-semibold"
                                        style={{ fontFamily: "var(--font-dm-sans)" }}
                                      >
                                        Redirect estimate: ${audit.report.redirect_estimate_usd?.toLocaleString()}/month
                                      </p>
                                    </div>
                                  )}
                                </div>

                                {/* Right — Stack Details */}
                                <div>
                                  <h3
                                    className="text-xs font-bold tracking-widest uppercase text-[#4B858E] mb-4"
                                    style={{ fontFamily: "var(--font-dm-sans)" }}
                                  >
                                    Stack Details
                                  </h3>

                                  <div className="space-y-4">
                                    {/* Departments */}
                                    <div>
                                      <span
                                        className="text-[#767B7A] text-xs block mb-1"
                                        style={{ fontFamily: "var(--font-dm-sans)" }}
                                      >
                                        Departments
                                      </span>
                                      <p
                                        className="text-[#F4F2EE] text-sm"
                                        style={{ fontFamily: "var(--font-dm-sans)" }}
                                      >
                                        {(audit.departments ?? []).join(", ")}
                                      </p>
                                    </div>

                                    {/* Tools by department */}
                                    {Object.entries(audit.tools_by_department ?? {}).map(([dept, tools]) => (
                                      <div key={dept}>
                                        <span
                                          className="text-[#767B7A] text-xs block mb-1"
                                          style={{ fontFamily: "var(--font-dm-sans)" }}
                                        >
                                          {dept}
                                        </span>
                                        <p
                                          className="text-[#F4F2EE] text-sm leading-relaxed"
                                          style={{ fontFamily: "var(--font-dm-sans)" }}
                                        >
                                          {(tools as string[]).join(", ")}
                                        </p>
                                      </div>
                                    ))}

                                    {/* AI usage */}
                                    {aiTools.length > 0 && (
                                      <div>
                                        <span
                                          className="text-[#767B7A] text-xs block mb-1"
                                          style={{ fontFamily: "var(--font-dm-sans)" }}
                                        >
                                          Using AI features
                                        </span>
                                        <p
                                          className="text-[#F4F2EE] text-sm"
                                          style={{ fontFamily: "var(--font-dm-sans)" }}
                                        >
                                          {aiTools.join(", ")}
                                        </p>
                                      </div>
                                    )}

                                    {/* Monthly spend */}
                                    <div>
                                      <span
                                        className="text-[#767B7A] text-xs block mb-1"
                                        style={{ fontFamily: "var(--font-dm-sans)" }}
                                      >
                                        Monthly spend range
                                      </span>
                                      <p
                                        className="text-[#F4F2EE] text-sm"
                                        style={{ fontFamily: "var(--font-dm-sans)" }}
                                      >
                                        {audit.monthly_spend_range}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <footer className="border-t border-white/[0.06] py-6 px-6">
        <div className="max-w-5xl mx-auto text-center text-[#767B7A] text-xs">
          &copy; {new Date().getFullYear()} World Shift Technologies
        </div>
      </footer>
    </div>
  );
}

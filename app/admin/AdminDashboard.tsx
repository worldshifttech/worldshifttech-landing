"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ImpactTab from "./ImpactTab";
import AdminNav from "./AdminNav";
import { getSupabaseBrowser } from "@/lib/supabase";

// ─── Types ────────────────────────────────────────────────────────────────────

export type AdminProject = {
  id: string;
  slug: string;
  client_name: string | null;
  title: string;
  percent_complete: number;
  next_update_note: string | null;
  next_due_date: string | null;
  access_mode: "public" | "password";
  budget_type: "none" | "hourly";
  budget_hours_cap: number | null;
  hourly_rate: number | null;
  created_at: string;
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

function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const ACCESS_BADGE: Record<string, string> = {
  public: "border border-[#4B858E] text-[#4B858E]",
  password: "bg-[#00205C]/[0.05] text-[#76777A] border border-[#00205C]/15",
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

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function AdminDashboard({
  initialProjects,
  auditEstimates,
}: {
  initialProjects: AdminProject[];
  auditEstimates: AuditEstimate[];
}) {
  const router = useRouter();
  const [projects] = useState<AdminProject[]>(initialProjects);
  const [activeTab, setActiveTab] = useState<"projects" | "audits" | "impact">("projects");
  const [openAuditId, setOpenAuditId] = useState<string | null>(null);

  // New project form
  const [showNewForm, setShowNewForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newClientName, setNewClientName] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [newAccessMode, setNewAccessMode] = useState<"public" | "password">("password");
  const [newPassword, setNewPassword] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  const total = projects.length;

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
      const res = await fetch("/api/admin-projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          title: newTitle,
          client_name: newClientName,
          slug: newSlug || slugify(newTitle),
          access_mode: newAccessMode,
          password: newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setCreateError(data.error ?? "Failed to create project");
        return;
      }

      router.push(`/admin/projects/${data.id}`);
    } catch {
      setCreateError("Something went wrong. Please try again.");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav */}
      <AdminNav active="dashboard" />

      {/* Main */}
      <main className="flex-1 px-6 py-16">
        <div className="w-full max-w-5xl mx-auto">
          <h1
            className="text-4xl sm:text-5xl font-bold text-[#00205C] mb-6"
            style={{ fontFamily: "var(--font-poppins)" }}
          >
            Admin
          </h1>

          {/* Tabs */}
          <div className="flex items-center gap-1 border-b border-[#00205C]/[0.10] mb-10">
            {(["projects", "audits", "impact"] as const).map((tab) => {
              const label =
                tab === "projects"
                  ? `Projects (${total})`
                  : tab === "audits"
                  ? `Audits (${auditEstimates.length})`
                  : "Impact";
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`text-sm font-semibold px-4 py-3 border-b-2 -mb-px transition-colors ${
                    isActive
                      ? "text-[#00205C] border-[#4B858E]"
                      : "text-[#76777A] border-transparent hover:text-[#00205C]"
                  }`}
                  style={{ fontFamily: "var(--font-poppins)" }}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* ─── Projects tab ──────────────────────────────────────────────── */}
          {activeTab === "projects" && (
            <>
              <div className="flex items-center justify-between mb-8">
                <p className="text-[#76777A] text-sm" style={{ fontFamily: "var(--font-poppins)" }}>
                  {total} project{total !== 1 ? "s" : ""}
                </p>
                <button
                  onClick={() => setShowNewForm((v) => !v)}
                  className="text-xs font-semibold px-4 py-2.5 rounded-full bg-[#4B858E] text-white hover:bg-[#5a9aa4] transition-colors"
                  style={{ fontFamily: "var(--font-poppins)" }}
                >
                  {showNewForm ? "Cancel" : "+ New Project"}
                </button>
              </div>

              {showNewForm && (
                <form
                  onSubmit={handleCreate}
                  className="border border-[#00205C]/[0.12] rounded-2xl bg-white p-6 mb-6 space-y-4"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-[#76777A] mb-1.5">
                        Project Title
                      </label>
                      <input
                        required
                        value={newTitle}
                        onChange={(e) => {
                          setNewTitle(e.target.value);
                          if (!slugTouched) setNewSlug(slugify(e.target.value));
                        }}
                        className="w-full bg-[#F4F2EE] border border-[#00205C]/[0.1] rounded-lg px-3 py-2 text-sm text-[#00205C] focus:outline-none focus:border-[#4B858E]/60"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#76777A] mb-1.5">
                        Client Name
                      </label>
                      <input
                        value={newClientName}
                        onChange={(e) => setNewClientName(e.target.value)}
                        className="w-full bg-[#F4F2EE] border border-[#00205C]/[0.1] rounded-lg px-3 py-2 text-sm text-[#00205C] focus:outline-none focus:border-[#4B858E]/60"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#76777A] mb-1.5">URL slug</label>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[#76777A] whitespace-nowrap">
                        worldshifttech.com/projects/
                      </span>
                      <input
                        required
                        value={newSlug}
                        onChange={(e) => {
                          setSlugTouched(true);
                          setNewSlug(slugify(e.target.value));
                        }}
                        className="flex-1 bg-[#F4F2EE] border border-[#00205C]/[0.1] rounded-lg px-3 py-2 text-sm text-[#00205C] focus:outline-none focus:border-[#4B858E]/60"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2 text-sm text-[#00205C]">
                      <input
                        type="radio"
                        checked={newAccessMode === "password"}
                        onChange={() => setNewAccessMode("password")}
                      />
                      Password protected
                    </label>
                    <label className="flex items-center gap-2 text-sm text-[#00205C]">
                      <input
                        type="radio"
                        checked={newAccessMode === "public"}
                        onChange={() => setNewAccessMode("public")}
                      />
                      Public
                    </label>
                  </div>

                  {newAccessMode === "password" && (
                    <div>
                      <label className="block text-xs font-medium text-[#76777A] mb-1.5">
                        Password
                      </label>
                      <input
                        required
                        type="text"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full bg-[#F4F2EE] border border-[#00205C]/[0.1] rounded-lg px-3 py-2 text-sm text-[#00205C] focus:outline-none focus:border-[#4B858E]/60"
                      />
                    </div>
                  )}

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
                    {creating ? "Creating..." : "Create Project"}
                  </button>
                </form>
              )}

              {total === 0 ? (
                <p className="text-[#00205C] text-sm" style={{ fontFamily: "var(--font-poppins)" }}>
                  No projects yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {projects.map((project) => (
                    <Link
                      key={project.id}
                      href={`/admin/projects/${project.id}`}
                      className="flex flex-wrap sm:flex-nowrap items-center gap-4 px-6 py-5 border border-[#00205C]/[0.12] rounded-2xl bg-white hover:border-[#4B858E]/40 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-[#00205C] font-medium truncate"
                          style={{ fontFamily: "var(--font-poppins)" }}
                        >
                          {project.title}
                        </p>
                        <p
                          className="text-[#76777A] text-xs mt-0.5"
                          style={{ fontFamily: "var(--font-poppins)" }}
                        >
                          {project.client_name ?? "No client name set"}
                        </p>
                      </div>

                      <div className="hidden sm:block w-32 flex-shrink-0">
                        <div className="h-1.5 bg-[#00205C]/[0.08] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#4B858E] rounded-full"
                            style={{ width: `${project.percent_complete}%` }}
                          />
                        </div>
                        <p
                          className="text-[#76777A] text-xs mt-1"
                          style={{ fontFamily: "var(--font-poppins)" }}
                        >
                          {project.percent_complete}% complete
                        </p>
                      </div>

                      <span
                        className="hidden md:block text-[#76777A] text-xs flex-shrink-0 max-w-[220px] truncate"
                        style={{ fontFamily: "var(--font-poppins)" }}
                      >
                        {project.next_update_note ?? "No update set"}
                      </span>

                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${ACCESS_BADGE[project.access_mode]}`}
                        style={{ fontFamily: "var(--font-poppins)" }}
                      >
                        {project.access_mode === "public" ? "Public" : "Password"}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </>
          )}

          {/* ─── Impact tab ────────────────────────────────────────────────── */}
          {activeTab === "impact" && <ImpactTab />}

          {/* ─── Audits tab ────────────────────────────────────────────────── */}
          {activeTab === "audits" && (
            <>
              {auditEstimates.length === 0 ? (
                <p className="text-[#00205C] text-sm" style={{ fontFamily: "var(--font-poppins)" }}>
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
                      <div key={audit.id} className="border border-[#00205C]/[0.12] rounded-2xl overflow-hidden bg-white">
                        {/* Row */}
                        <div className="flex items-center gap-4 px-6 py-5">
                          <div className="flex-1 min-w-0">
                            <p
                              className="text-[#00205C] font-medium truncate"
                              style={{ fontFamily: "var(--font-poppins)" }}
                            >
                              {audit.business_name ?? "Anonymous"}
                            </p>
                            <p
                              className="text-[#76777A] text-xs mt-0.5"
                              style={{ fontFamily: "var(--font-poppins)" }}
                            >
                              {audit.business_type} &middot; {audit.team_size}
                            </p>
                          </div>

                          {scoreStyle && score ? (
                            <span
                              className={`text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0 border uppercase tracking-wide ${scoreStyle.bg} ${scoreStyle.text} ${scoreStyle.border}`}
                              style={{ fontFamily: "var(--font-poppins)" }}
                            >
                              {score}
                            </span>
                          ) : (
                            <span
                              className="text-xs px-2.5 py-1 rounded-full flex-shrink-0 border border-[#00205C]/15 text-[#76777A]"
                              style={{ fontFamily: "var(--font-poppins)" }}
                            >
                              pending
                            </span>
                          )}

                          {audit.report ? (
                            <span
                              className="hidden sm:block text-[#00205C] text-xs flex-shrink-0 font-medium"
                              style={{ fontFamily: "var(--font-poppins)" }}
                            >
                              ${audit.report.estimated_monthly_waste_low.toLocaleString()}–${audit.report.estimated_monthly_waste_high.toLocaleString()}/mo
                            </span>
                          ) : null}

                          <span
                            className="hidden sm:block text-[#76777A] text-xs flex-shrink-0"
                            style={{ fontFamily: "var(--font-poppins)" }}
                          >
                            {audit.monthly_spend_range}
                          </span>

                          <span
                            className="hidden sm:block text-[#76777A] text-xs flex-shrink-0"
                            style={{ fontFamily: "var(--font-poppins)" }}
                          >
                            {relativeDate(audit.created_at)}
                          </span>

                          <button
                            onClick={() => setOpenAuditId(isOpen ? null : audit.id)}
                            className="flex-shrink-0 text-xs font-semibold px-4 py-2 rounded-full border border-[#4B858E] text-[#4B858E] hover:bg-[#4B858E]/10 transition-colors"
                            style={{ fontFamily: "var(--font-poppins)" }}
                          >
                            {isOpen ? "Close" : "View"}
                          </button>
                        </div>

                        {/* Detail panel */}
                        {isOpen && (
                          <div className="border-t border-[#00205C]/[0.10] bg-white px-6 py-8">
                            {!audit.report ? (
                              <p
                                className="text-[#76777A] text-sm text-center"
                                style={{ fontFamily: "var(--font-poppins)" }}
                              >
                                Report not yet generated.
                              </p>
                            ) : (
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Left — Audit Summary */}
                                <div>
                                  <div className="flex flex-wrap items-start gap-3 mb-4">
                                    <h2
                                      className="text-2xl font-bold text-[#00205C] leading-snug"
                                      style={{ fontFamily: "var(--font-poppins)" }}
                                    >
                                      {audit.business_name ?? "Anonymous"}
                                    </h2>
                                    {scoreStyle && score && (
                                      <span
                                        className={`text-xs font-bold px-3 py-1.5 rounded-full border uppercase tracking-wide ${scoreStyle.bg} ${scoreStyle.text} ${scoreStyle.border}`}
                                        style={{ fontFamily: "var(--font-poppins)" }}
                                      >
                                        {score} waste
                                      </span>
                                    )}
                                  </div>

                                  <p
                                    className="text-[#00205C] text-base leading-relaxed mb-5"
                                    style={{ fontFamily: "var(--font-poppins)" }}
                                  >
                                    {audit.report.headline}
                                  </p>

                                  {/* Waste estimate card */}
                                  <div className="border border-[#4B858E]/40 rounded-xl p-4 mb-5 bg-[#4B858E]/10">
                                    <p
                                      className="text-[#76777A] text-xs uppercase tracking-widest mb-1"
                                      style={{ fontFamily: "var(--font-poppins)" }}
                                    >
                                      Estimated monthly waste
                                    </p>
                                    <p
                                      className="text-[#4B858E] text-2xl font-bold mb-1"
                                      style={{ fontFamily: "var(--font-poppins)" }}
                                    >
                                      ${audit.report.estimated_monthly_waste_low.toLocaleString()} – ${audit.report.estimated_monthly_waste_high.toLocaleString()}
                                    </p>
                                    <p
                                      className="text-[#76777A] text-xs"
                                      style={{ fontFamily: "var(--font-poppins)" }}
                                    >
                                      {audit.report.estimated_hours_wasted_per_month} hours wasted per month
                                    </p>
                                  </div>

                                  <p
                                    className="text-[#00205C]/70 text-sm leading-relaxed mb-5"
                                    style={{ fontFamily: "var(--font-poppins)" }}
                                  >
                                    {audit.report.summary}
                                  </p>

                                  {/* Findings */}
                                  {audit.report.findings?.length > 0 && (
                                    <div className="mb-5">
                                      <span
                                        className="text-xs font-bold tracking-widest uppercase text-[#4B858E] block mb-3"
                                        style={{ fontFamily: "var(--font-poppins)" }}
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
                                              className="bg-[#00205C]/[0.03] border border-[#00205C]/[0.10] rounded-lg p-3"
                                            >
                                              <div className="flex flex-wrap gap-2 items-center mb-1.5">
                                                <span
                                                  className="text-[#00205C] text-xs font-semibold"
                                                  style={{ fontFamily: "var(--font-poppins)" }}
                                                >
                                                  {f.tool}
                                                </span>
                                                <span
                                                  className="text-[#76777A] text-xs bg-[#00205C]/[0.08] px-2 py-0.5 rounded-full"
                                                  style={{ fontFamily: "var(--font-poppins)" }}
                                                >
                                                  {f.department}
                                                </span>
                                                <span
                                                  className={`text-xs font-bold uppercase tracking-wide ${IMPACT_TEXT[f.impact] ?? "text-[#76777A]"}`}
                                                  style={{ fontFamily: "var(--font-poppins)" }}
                                                >
                                                  {f.impact} impact
                                                </span>
                                              </div>
                                              <p
                                                className="text-[#00205C]/70 text-xs leading-relaxed mb-1"
                                                style={{ fontFamily: "var(--font-poppins)" }}
                                              >
                                                {f.issue}
                                              </p>
                                              <p
                                                className="text-[#4B858E] text-xs leading-relaxed"
                                                style={{ fontFamily: "var(--font-poppins)" }}
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
                                        style={{ fontFamily: "var(--font-poppins)" }}
                                      >
                                        Quick Wins
                                      </span>
                                      <ul className="space-y-1.5">
                                        {audit.report.quick_wins.map((win, i) => (
                                          <li
                                            key={i}
                                            className="flex gap-2 text-[#00205C]/70 text-xs leading-relaxed"
                                            style={{ fontFamily: "var(--font-poppins)" }}
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
                                        className="text-[#00205C]/70 text-xs leading-relaxed mb-1"
                                        style={{ fontFamily: "var(--font-poppins)" }}
                                      >
                                        {audit.report.environmental_note}
                                      </p>
                                      <p
                                        className="text-[#4B858E] text-xs font-semibold"
                                        style={{ fontFamily: "var(--font-poppins)" }}
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
                                    style={{ fontFamily: "var(--font-poppins)" }}
                                  >
                                    Stack Details
                                  </h3>

                                  <div className="space-y-4">
                                    {/* Departments */}
                                    <div>
                                      <span
                                        className="text-[#76777A] text-xs block mb-1"
                                        style={{ fontFamily: "var(--font-poppins)" }}
                                      >
                                        Departments
                                      </span>
                                      <p
                                        className="text-[#00205C] text-sm"
                                        style={{ fontFamily: "var(--font-poppins)" }}
                                      >
                                        {(audit.departments ?? []).join(", ")}
                                      </p>
                                    </div>

                                    {/* Tools by department */}
                                    {Object.entries(audit.tools_by_department ?? {}).map(([dept, tools]) => (
                                      <div key={dept}>
                                        <span
                                          className="text-[#76777A] text-xs block mb-1"
                                          style={{ fontFamily: "var(--font-poppins)" }}
                                        >
                                          {dept}
                                        </span>
                                        <p
                                          className="text-[#00205C] text-sm leading-relaxed"
                                          style={{ fontFamily: "var(--font-poppins)" }}
                                        >
                                          {(tools as string[]).join(", ")}
                                        </p>
                                      </div>
                                    ))}

                                    {/* AI usage */}
                                    {aiTools.length > 0 && (
                                      <div>
                                        <span
                                          className="text-[#76777A] text-xs block mb-1"
                                          style={{ fontFamily: "var(--font-poppins)" }}
                                        >
                                          Using AI features
                                        </span>
                                        <p
                                          className="text-[#00205C] text-sm"
                                          style={{ fontFamily: "var(--font-poppins)" }}
                                        >
                                          {aiTools.join(", ")}
                                        </p>
                                      </div>
                                    )}

                                    {/* Monthly spend */}
                                    <div>
                                      <span
                                        className="text-[#76777A] text-xs block mb-1"
                                        style={{ fontFamily: "var(--font-poppins)" }}
                                      >
                                        Monthly spend range
                                      </span>
                                      <p
                                        className="text-[#00205C] text-sm"
                                        style={{ fontFamily: "var(--font-poppins)" }}
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

      <footer className="border-t border-[#00205C]/[0.10] py-6 px-6">
        <div className="max-w-5xl mx-auto text-center text-[#76777A] text-xs">
          &copy; {new Date().getFullYear()} World Shift Technologies
        </div>
      </footer>
    </div>
  );
}

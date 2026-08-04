"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { getSupabaseBrowser } from "@/lib/supabase";
import SignOutButton from "@/app/components/SignOutButton";

// ─── Types ────────────────────────────────────────────────────────────────────

type ProjectFields = {
  id: string;
  slug: string;
  title: string;
  client_name: string | null;
  percent_complete: number;
  next_update_note: string | null;
  next_due_date: string | null;
  access_mode: "public" | "password";
  budget_type: "none" | "hourly";
  budget_hours_cap: number | null;
  hourly_rate: number | null;
};

type Milestone = {
  title: string;
  description: string | null;
  status: "not_started" | "in_progress" | "done";
  target_date: string | null;
};

const STATUS_OPTIONS: { value: Milestone["status"]; label: string }[] = [
  { value: "not_started", label: "Not started" },
  { value: "in_progress", label: "In progress" },
  { value: "done", label: "Done" },
];

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function ProjectDetailClient({
  project,
  initialMilestones,
  hoursLogged,
  costLogged,
}: {
  project: ProjectFields;
  initialMilestones: Milestone[];
  hoursLogged: number;
  costLogged: number;
}) {
  const [title, setTitle] = useState(project.title);
  const [clientName, setClientName] = useState(project.client_name ?? "");
  const [percentComplete, setPercentComplete] = useState(project.percent_complete);
  const [nextUpdateNote, setNextUpdateNote] = useState(project.next_update_note ?? "");
  const [nextDueDate, setNextDueDate] = useState(project.next_due_date ?? "");
  const [accessMode, setAccessMode] = useState<"public" | "password">(project.access_mode);
  const [password, setPassword] = useState("");
  const [budgetType, setBudgetType] = useState<"none" | "hourly">(project.budget_type);
  const [budgetHoursCap, setBudgetHoursCap] = useState(
    project.budget_hours_cap != null ? String(project.budget_hours_cap) : ""
  );
  const [hourlyRate, setHourlyRate] = useState(project.hourly_rate != null ? String(project.hourly_rate) : "");
  const [milestones, setMilestones] = useState<Milestone[]>(initialMilestones);

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  const clientUrl = `https://worldshifttech.com/projects/${project.slug}`;

  function addMilestone() {
    setMilestones((prev) => [...prev, { title: "", description: "", status: "not_started", target_date: null }]);
  }

  function updateMilestone(index: number, patch: Partial<Milestone>) {
    setMilestones((prev) => prev.map((m, i) => (i === index ? { ...m, ...patch } : m)));
  }

  function removeMilestone(index: number) {
    setMilestones((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleCopyLink() {
    await navigator.clipboard.writeText(clientUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
      const res = await fetch(`/api/admin-projects/${project.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          project: {
            title,
            client_name: clientName,
            percent_complete: Number(percentComplete) || 0,
            next_update_note: nextUpdateNote,
            next_due_date: nextDueDate || null,
            access_mode: accessMode,
            password: password || undefined,
            budget_type: budgetType,
            budget_hours_cap: budgetHoursCap ? Number(budgetHoursCap) : null,
            hourly_rate: hourlyRate ? Number(hourlyRate) : null,
          },
          milestones: milestones.filter((m) => m.title.trim()),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setSaveError(data.error ?? "Save failed");
        return;
      }

      setPassword("");
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
            <Link href="/admin" className="text-sm text-[#4B858E] hover:text-[#00205C] transition-colors">
              &larr; All Projects
            </Link>
            <SignOutButton />
          </div>
        </div>
      </nav>

      <main className="flex-1 px-6 py-12">
        <div className="w-full max-w-3xl mx-auto space-y-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-3xl sm:text-4xl font-bold text-[#00205C]">{title || "Untitled Project"}</h1>
            <div className="flex items-center gap-3">
              <a
                href={clientUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold px-4 py-2 rounded-full border border-[#4B858E] text-[#4B858E] hover:bg-[#4B858E]/10 transition-colors"
              >
                View Client Page &rarr;
              </a>
              <button
                onClick={handleCopyLink}
                className="text-xs font-semibold px-4 py-2 rounded-full border border-[#00205C]/20 text-[#76777A] hover:border-[#00205C]/40 hover:text-[#00205C] transition-colors"
              >
                {copied ? "Copied ✓" : "Copy Link"}
              </button>
            </div>
          </div>

          {/* Core fields */}
          <div className="bg-white border border-[#00205C]/10 rounded-2xl p-6 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#76777A] mb-1.5">Title</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#F4F2EE] border border-[#00205C]/[0.1] rounded-lg px-3 py-2 text-sm text-[#00205C] focus:outline-none focus:border-[#4B858E]/60"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#76777A] mb-1.5">Client Name</label>
                <input
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full bg-[#F4F2EE] border border-[#00205C]/[0.1] rounded-lg px-3 py-2 text-sm text-[#00205C] focus:outline-none focus:border-[#4B858E]/60"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#76777A] mb-1.5">
                  Percent Complete ({percentComplete}%)
                </label>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={percentComplete}
                  onChange={(e) => setPercentComplete(Number(e.target.value))}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#76777A] mb-1.5">Next Due Date</label>
                <input
                  type="date"
                  value={nextDueDate}
                  onChange={(e) => setNextDueDate(e.target.value)}
                  className="w-full bg-[#F4F2EE] border border-[#00205C]/[0.1] rounded-lg px-3 py-2 text-sm text-[#00205C] focus:outline-none focus:border-[#4B858E]/60"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#76777A] mb-1.5">Next Update Note</label>
              <input
                value={nextUpdateNote}
                onChange={(e) => setNextUpdateNote(e.target.value)}
                placeholder="e.g. Reviewing homepage copy, demo Thursday"
                className="w-full bg-[#F4F2EE] border border-[#00205C]/[0.1] rounded-lg px-3 py-2 text-sm text-[#00205C] focus:outline-none focus:border-[#4B858E]/60"
              />
            </div>

            <div className="border-t border-[#00205C]/[0.08] pt-5">
              <label className="block text-xs font-medium text-[#76777A] mb-2">Client Page Access</label>
              <div className="flex items-center gap-6 mb-3">
                <label className="flex items-center gap-2 text-sm text-[#00205C]">
                  <input
                    type="radio"
                    checked={accessMode === "password"}
                    onChange={() => setAccessMode("password")}
                  />
                  Password protected
                </label>
                <label className="flex items-center gap-2 text-sm text-[#00205C]">
                  <input type="radio" checked={accessMode === "public"} onChange={() => setAccessMode("public")} />
                  Public
                </label>
              </div>
              {accessMode === "password" && (
                <input
                  type="text"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Leave blank to keep the current password"
                  className="w-full bg-[#F4F2EE] border border-[#00205C]/[0.1] rounded-lg px-3 py-2 text-sm text-[#00205C] focus:outline-none focus:border-[#4B858E]/60"
                />
              )}
            </div>

            <div className="border-t border-[#00205C]/[0.08] pt-5">
              <label className="block text-xs font-medium text-[#76777A] mb-2">Budget</label>
              <div className="flex items-center gap-6 mb-3">
                <label className="flex items-center gap-2 text-sm text-[#00205C]">
                  <input type="radio" checked={budgetType === "none"} onChange={() => setBudgetType("none")} />
                  No budget tracking
                </label>
                <label className="flex items-center gap-2 text-sm text-[#00205C]">
                  <input type="radio" checked={budgetType === "hourly"} onChange={() => setBudgetType("hourly")} />
                  Hourly cap
                </label>
              </div>
              {budgetType === "hourly" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#76777A] mb-1.5">Hours Cap</label>
                    <input
                      type="number"
                      min={0}
                      value={budgetHoursCap}
                      onChange={(e) => setBudgetHoursCap(e.target.value)}
                      className="w-full bg-[#F4F2EE] border border-[#00205C]/[0.1] rounded-lg px-3 py-2 text-sm text-[#00205C] focus:outline-none focus:border-[#4B858E]/60"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#76777A] mb-1.5">Hourly Rate ($)</label>
                    <input
                      type="number"
                      min={0}
                      value={hourlyRate}
                      onChange={(e) => setHourlyRate(e.target.value)}
                      className="w-full bg-[#F4F2EE] border border-[#00205C]/[0.1] rounded-lg px-3 py-2 text-sm text-[#00205C] focus:outline-none focus:border-[#4B858E]/60"
                    />
                  </div>
                  <p className="sm:col-span-2 text-[#76777A] text-xs">
                    Logged so far (from build-cost telemetry): {hoursLogged.toFixed(1)} hrs &middot; $
                    {costLogged.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Milestones */}
          <div className="bg-white border border-[#00205C]/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold tracking-widest uppercase text-[#4B858E]">Milestones</span>
              <button
                onClick={addMilestone}
                className="text-xs font-semibold px-3 py-1.5 rounded-full border border-[#4B858E] text-[#4B858E] hover:bg-[#4B858E]/10 transition-colors"
              >
                + Add Milestone
              </button>
            </div>

            {milestones.length === 0 ? (
              <p className="text-[#76777A] text-sm">No milestones yet.</p>
            ) : (
              <div className="space-y-4">
                {milestones.map((m, i) => (
                  <div key={i} className="border border-[#00205C]/[0.1] rounded-xl p-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <input
                        value={m.title}
                        onChange={(e) => updateMilestone(i, { title: e.target.value })}
                        placeholder="Milestone title"
                        className="flex-1 bg-[#F4F2EE] border border-[#00205C]/[0.1] rounded-lg px-3 py-2 text-sm text-[#00205C] focus:outline-none focus:border-[#4B858E]/60"
                      />
                      <button
                        onClick={() => removeMilestone(i)}
                        className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-lg text-[#76777A] hover:text-red-400 hover:bg-red-400/10 transition-colors"
                        aria-label="Remove milestone"
                      >
                        &times;
                      </button>
                    </div>
                    <textarea
                      value={m.description ?? ""}
                      onChange={(e) => updateMilestone(i, { description: e.target.value })}
                      placeholder="What's being done and how it's tracking"
                      rows={2}
                      className="w-full bg-[#F4F2EE] border border-[#00205C]/[0.1] rounded-lg px-3 py-2 text-sm text-[#00205C] focus:outline-none focus:border-[#4B858E]/60 resize-none"
                    />
                    <div className="flex flex-wrap items-center gap-3">
                      <select
                        value={m.status}
                        onChange={(e) => updateMilestone(i, { status: e.target.value as Milestone["status"] })}
                        className="bg-[#F4F2EE] border border-[#00205C]/[0.1] rounded-lg px-3 py-2 text-sm text-[#00205C] focus:outline-none focus:border-[#4B858E]/60"
                      >
                        {STATUS_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      <input
                        type="date"
                        value={m.target_date ?? ""}
                        onChange={(e) => updateMilestone(i, { target_date: e.target.value || null })}
                        className="bg-[#F4F2EE] border border-[#00205C]/[0.1] rounded-lg px-3 py-2 text-sm text-[#00205C] focus:outline-none focus:border-[#4B858E]/60"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Placeholders — Sessions 47–48 */}
          <div className="bg-white border border-dashed border-[#00205C]/20 rounded-2xl p-6 text-center text-[#76777A] text-sm">
            File uploads — coming in a future session
          </div>
          <div className="bg-white border border-dashed border-[#00205C]/20 rounded-2xl p-6 text-center text-[#76777A] text-sm">
            Client feedback — coming in a future session
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

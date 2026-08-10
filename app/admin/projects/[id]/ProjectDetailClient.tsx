"use client";

import { useState } from "react";
import Link from "next/link";
import { getSupabaseBrowser } from "@/lib/supabase";
import {
  ACCEPTED_CONTEXT_FILE_ACCEPT_ATTR,
  ACCEPTED_CONTEXT_FILE_HELP_TEXT,
  isAcceptedContextFileType,
} from "@/lib/accepted-context-file-types";
import AdminNav from "../../AdminNav";
import FileUploads from "./FileUploads";

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
  id: string | null;
  title: string;
  description: string | null;
  status: "not_started" | "in_progress" | "done";
  target_date: string | null;
  action_owner: "drew" | "client";
  action_note: string | null;
};

type ProjectFile = {
  id: string;
  file_name: string;
  uploaded_by: "client" | "drew";
  note: string | null;
  created_at: string;
  downloadUrl: string | null;
  milestoneTitle: string | null;
};

type FeedbackItem = {
  id: string;
  message: string;
  status: "new" | "read" | "resolved";
  created_at: string;
  milestoneTitle: string | null;
  attachedFile: { file_name: string; downloadUrl: string | null; storagePath: string } | null;
};

type LinkedRepo = {
  id: string;
  name: string;
  hasInstallation: boolean;
} | null;

type PlanningContextFile = { fileName: string; storagePath: string; contentType: string };

const STATUS_OPTIONS: { value: Milestone["status"]; label: string }[] = [
  { value: "not_started", label: "Not started" },
  { value: "in_progress", label: "In progress" },
  { value: "done", label: "Done" },
];

const ACTION_OWNER_OPTIONS: { value: Milestone["action_owner"]; label: string }[] = [
  { value: "drew", label: "Drew" },
  { value: "client", label: "Client" },
];

function relativeDate(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days < 1) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function ProjectDetailClient({
  project,
  initialMilestones,
  hoursLogged,
  costLogged,
  files,
  feedback,
  linkedRepo,
}: {
  project: ProjectFields;
  initialMilestones: Milestone[];
  hoursLogged: number;
  costLogged: number;
  files: ProjectFile[];
  feedback: FeedbackItem[];
  linkedRepo: LinkedRepo;
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
  const [feedbackItems, setFeedbackItems] = useState<FeedbackItem[]>(feedback);
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  // Run a planning session directly from an Open Item/feedback row — the feedback message
  // (and a note that a file was attached, if any) becomes the dispatch brief, with room for
  // Drew to add more context and extra files before it actually fires. Reuses the exact
  // same session-context-files upload flow and /api/orchestrator/dispatch endpoint the
  // repo's own "Run Planning Session" box uses — see RepoDetailClient.tsx.
  const [openPlanningId, setOpenPlanningId] = useState<string | null>(null);
  const [planningNote, setPlanningNote] = useState("");
  const [planningPendingKey, setPlanningPendingKey] = useState<string | null>(null);
  const [planningContextFiles, setPlanningContextFiles] = useState<PlanningContextFile[]>([]);
  const [attachingPlanningFile, setAttachingPlanningFile] = useState(false);
  const [planningAttachError, setPlanningAttachError] = useState("");
  const [dispatchingPlanningId, setDispatchingPlanningId] = useState<string | null>(null);
  const [planningDispatchError, setPlanningDispatchError] = useState("");
  const [planningSentId, setPlanningSentId] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  const clientUrl = `https://worldshifttech.com/projects/${project.slug}`;

  function addMilestone() {
    setMilestones((prev) => [
      ...prev,
      {
        id: null,
        title: "",
        description: "",
        status: "not_started",
        target_date: null,
        action_owner: "drew",
        action_note: null,
      },
    ]);
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

  async function handleResolveFeedback(id: string) {
    setResolvingId(id);
    try {
      const supabase = getSupabaseBrowser();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;

      const res = await fetch(`/api/admin-project-feedback/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (res.ok) {
        setFeedbackItems((prev) => prev.map((f) => (f.id === id ? { ...f, status: "resolved" } : f)));
      }
    } finally {
      setResolvingId(null);
    }
  }

  function togglePlanningPanel(id: string) {
    if (openPlanningId === id) {
      setOpenPlanningId(null);
      return;
    }
    setOpenPlanningId(id);
    setPlanningNote("");
    setPlanningPendingKey(null);
    setPlanningContextFiles([]);
    setPlanningAttachError("");
    setPlanningDispatchError("");
  }

  async function handleAttachPlanningFile(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    setPlanningAttachError("");
    setAttachingPlanningFile(true);

    let key = planningPendingKey;
    if (!key) {
      key = crypto.randomUUID();
      setPlanningPendingKey(key);
    }

    const supabase = getSupabaseBrowser();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const token = session?.access_token;

    try {
      for (const file of Array.from(fileList)) {
        if (file.size > 25 * 1024 * 1024) {
          setPlanningAttachError(`${file.name} is over 25MB and was skipped.`);
          continue;
        }
        if (!isAcceptedContextFileType(file)) {
          setPlanningAttachError(`${file.name} isn't a supported file type and was skipped.`);
          continue;
        }

        const urlRes = await fetch("/api/admin-repos/context-files/upload-url", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ pendingKey: key, fileName: file.name, fileSize: file.size }),
        });
        const urlData = await urlRes.json();
        if (!urlRes.ok) {
          setPlanningAttachError(urlData.error ?? `Could not start upload for ${file.name}`);
          continue;
        }

        const { error: uploadError } = await supabase.storage
          .from("session-context-files")
          .uploadToSignedUrl(urlData.path, urlData.token, file);
        if (uploadError) {
          setPlanningAttachError(uploadError.message);
          continue;
        }

        setPlanningContextFiles((prev) => [
          ...prev,
          { fileName: file.name, storagePath: urlData.path, contentType: file.type || "application/octet-stream" },
        ]);
      }
    } finally {
      setAttachingPlanningFile(false);
    }
  }

  function handleRemovePlanningFile(storagePath: string) {
    setPlanningContextFiles((prev) => prev.filter((f) => f.storagePath !== storagePath));
  }

  async function handleDispatchPlanningFromFeedback(item: FeedbackItem) {
    if (!linkedRepo) return;
    setDispatchingPlanningId(item.id);
    setPlanningDispatchError("");

    const briefParts = [`Client feedback: "${item.message}"`];
    if (item.attachedFile) {
      briefParts.push(`The client attached a file with this feedback: ${item.attachedFile.file_name}`);
    }
    if (planningNote.trim()) {
      briefParts.push(`Additional context from Drew: ${planningNote.trim()}`);
    }
    const brief = briefParts.join("\n\n");

    // The feedback's own attachment (project-files bucket) plus anything Drew adds in this
    // panel (session-context-files bucket) — dispatchOrchestratorSession signs each against
    // its own bucket rather than assuming one, see lib/orchestrator-dispatch.ts.
    const contextFilesPayload = [
      ...(item.attachedFile
        ? [
            {
              file_name: item.attachedFile.file_name,
              storage_path: item.attachedFile.storagePath,
              bucket: "project-files",
            },
          ]
        : []),
      ...planningContextFiles.map((f) => ({
        file_name: f.fileName,
        storage_path: f.storagePath,
        content_type: f.contentType,
        bucket: "session-context-files",
      })),
    ];

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
          repo_id: linkedRepo.id,
          session_type: "planning",
          brief,
          ...(contextFilesPayload.length > 0 ? { context_files: contextFilesPayload } : {}),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setPlanningDispatchError(data.error ?? "Failed to dispatch");
        return;
      }

      setOpenPlanningId(null);
      setPlanningNote("");
      setPlanningPendingKey(null);
      setPlanningContextFiles([]);
      setPlanningSentId(item.id);
      setTimeout(() => setPlanningSentId((prev) => (prev === item.id ? null : prev)), 4000);
    } catch {
      setPlanningDispatchError("Something went wrong. Please try again.");
    } finally {
      setDispatchingPlanningId(null);
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
      <AdminNav active="dashboard" />

      <main className="flex-1 px-6 py-12">
        <div className="w-full max-w-3xl mx-auto space-y-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <Link href="/admin" className="text-sm text-[#4B858E] hover:text-[#00205C] transition-colors">
                &larr; All Projects
              </Link>
              <h1 className="text-3xl sm:text-4xl font-bold text-[#00205C] mt-1">{title || "Untitled Project"}</h1>
            </div>
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
                      <select
                        value={m.action_owner}
                        onChange={(e) =>
                          updateMilestone(i, { action_owner: e.target.value as Milestone["action_owner"] })
                        }
                        className="bg-[#F4F2EE] border border-[#00205C]/[0.1] rounded-lg px-3 py-2 text-sm text-[#00205C] focus:outline-none focus:border-[#4B858E]/60"
                      >
                        {ACTION_OWNER_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            Who owns this: {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    {m.action_owner === "client" && (
                      <input
                        value={m.action_note ?? ""}
                        onChange={(e) => updateMilestone(i, { action_note: e.target.value || null })}
                        placeholder="What do you need from the client? e.g. Upload your logo files"
                        className="w-full bg-[#F4F2EE] border border-[#00205C]/[0.1] rounded-lg px-3 py-2 text-sm text-[#00205C] focus:outline-none focus:border-[#4B858E]/60"
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <FileUploads projectId={project.id} slug={project.slug} files={files} />

          {/* Client feedback inbox */}
          <div className="bg-white border border-[#00205C]/10 rounded-2xl p-6">
            <span className="text-xs font-bold tracking-widest uppercase text-[#4B858E] block mb-4">
              Client Feedback
            </span>
            {feedbackItems.length === 0 ? (
              <p className="text-[#76777A] text-sm">No feedback yet.</p>
            ) : (
              <div className="space-y-3">
                {feedbackItems.map((f) => (
                  <div key={f.id} className="border border-[#00205C]/[0.08] rounded-xl px-4 py-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[#00205C] text-sm">{f.message}</p>
                        {f.attachedFile && f.attachedFile.downloadUrl && (
                          <a
                            href={f.attachedFile.downloadUrl}
                            className="inline-block mt-1.5 text-xs font-semibold px-3 py-1 rounded-full border border-[#4B858E] text-[#4B858E] hover:bg-[#4B858E]/10 transition-colors"
                          >
                            {f.attachedFile.file_name}
                          </a>
                        )}
                        <p className="text-[#76777A] text-xs mt-1">
                          {f.milestoneTitle ?? "General"} &middot; {relativeDate(f.created_at)} &middot;{" "}
                          {f.status === "resolved" ? "Resolved" : "New"}
                        </p>
                      </div>
                      <div className="flex-shrink-0 flex items-center gap-2">
                        {f.status !== "resolved" && (
                          <button
                            onClick={() => handleResolveFeedback(f.id)}
                            disabled={resolvingId === f.id}
                            className="text-xs font-semibold px-3 py-1.5 rounded-full border border-[#4B858E] text-[#4B858E] hover:bg-[#4B858E]/10 disabled:opacity-50 transition-colors"
                          >
                            {resolvingId === f.id ? "..." : "Mark Resolved"}
                          </button>
                        )}
                        <button
                          onClick={() => togglePlanningPanel(f.id)}
                          disabled={!linkedRepo}
                          className="text-xs font-semibold px-3 py-1.5 rounded-full border border-[#00205C]/20 text-[#76777A] hover:border-[#00205C]/40 hover:text-[#00205C] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                          {openPlanningId === f.id ? "Close" : "Run Planning Session"}
                        </button>
                      </div>
                    </div>

                    {openPlanningId === f.id && (
                      <div className="mt-3 pt-3 border-t border-[#00205C]/[0.08] space-y-3">
                        <div>
                          <label className="block text-xs font-medium text-[#76777A] mb-1.5">
                            Additional context for the planning session (optional)
                          </label>
                          <textarea
                            value={planningNote}
                            onChange={(e) => setPlanningNote(e.target.value)}
                            placeholder="Anything else the planning session should know..."
                            rows={3}
                            className="w-full bg-[#F4F2EE] border border-[#00205C]/[0.1] rounded-lg px-3 py-2 text-sm text-[#00205C] focus:outline-none focus:border-[#4B858E]/60 resize-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-[#76777A] mb-1.5">
                            Attach additional files (optional)
                          </label>
                          <input
                            type="file"
                            multiple
                            accept={ACCEPTED_CONTEXT_FILE_ACCEPT_ATTR}
                            disabled={attachingPlanningFile}
                            onChange={(e) => {
                              handleAttachPlanningFile(e.target.files);
                              e.target.value = "";
                            }}
                            className="block w-full text-sm text-[#00205C] cursor-pointer file:cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-[#4B858E] file:text-white hover:file:bg-[#5a9aa4] file:transition-colors disabled:opacity-50"
                          />
                          <p className="text-[#76777A] text-xs mt-1.5">{ACCEPTED_CONTEXT_FILE_HELP_TEXT}</p>
                          {planningContextFiles.length > 0 && (
                            <ul className="flex flex-wrap gap-2 mt-2">
                              {planningContextFiles.map((cf) => (
                                <li
                                  key={cf.storagePath}
                                  className="flex items-center gap-2 bg-[#F4F2EE] rounded-full pl-3 pr-2 py-1 text-xs text-[#00205C]"
                                >
                                  <span className="truncate max-w-[160px]">{cf.fileName}</span>
                                  <button
                                    type="button"
                                    onClick={() => handleRemovePlanningFile(cf.storagePath)}
                                    className="text-[#76777A] hover:text-red-500 font-bold leading-none"
                                    aria-label={`Remove ${cf.fileName}`}
                                  >
                                    &times;
                                  </button>
                                </li>
                              ))}
                            </ul>
                          )}
                          {planningAttachError && <p className="text-red-400 text-xs mt-2">{planningAttachError}</p>}
                        </div>
                        {planningDispatchError && <p className="text-red-400 text-xs">{planningDispatchError}</p>}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleDispatchPlanningFromFeedback(f)}
                            disabled={
                              dispatchingPlanningId === f.id || attachingPlanningFile || !linkedRepo?.hasInstallation
                            }
                            className="text-sm font-bold px-5 py-2 rounded-full bg-[#4B858E] text-white hover:bg-[#5a9aa4] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            {dispatchingPlanningId === f.id ? "Dispatching..." : "Start Planning Session"}
                          </button>
                          <button
                            type="button"
                            onClick={() => setOpenPlanningId(null)}
                            className="text-sm font-semibold px-4 py-2 rounded-full border border-[#00205C]/20 text-[#76777A] hover:border-[#00205C]/40 hover:text-[#00205C] transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                        {linkedRepo && !linkedRepo.hasInstallation && (
                          <p className="text-[#76777A] text-xs">
                            {linkedRepo.name} has no GitHub App Installation ID set yet — add one on its{" "}
                            <Link href={`/admin/repos/${linkedRepo.id}`} className="text-[#4B858E] hover:underline">
                              admin page
                            </Link>{" "}
                            first.
                          </p>
                        )}
                      </div>
                    )}

                    {planningSentId === f.id && (
                      <p className="mt-2 text-[#4B858E] text-xs font-medium">
                        Dispatched — check the{" "}
                        <Link href="/admin/reviews" className="underline hover:text-[#3a6b73]">
                          Reviews inbox
                        </Link>
                        .
                      </p>
                    )}
                  </div>
                ))}
              </div>
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

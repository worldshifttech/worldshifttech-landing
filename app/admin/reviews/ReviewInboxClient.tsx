"use client";

import { useState } from "react";
import AdminNav from "../AdminNav";
import InfoTooltip from "../InfoTooltip";
import { getSupabaseBrowser } from "@/lib/supabase";

// ─── Types ────────────────────────────────────────────────────────────────────

export type OpenQuestion = {
  question: string;
  suggested_options: string[];
  answer: string;
};

export type KbDraft = {
  title?: string;
  problem_solved?: string;
  tags?: string[];
  tech_stack?: string[];
  artifact_location?: string;
};

export type ReviewItem = {
  id: string;
  kind: "consolidated_review" | "production_risk_flag" | "kb_entry_draft" | "build_result";
  summary: string;
  open_questions: OpenQuestion[];
  proposed_content: string | null;
  kb_draft: KbDraft | null;
  drew_response: string | null;
  status: "pending" | "answered" | "archived";
  created_at: string;
  archived_at: string | null;
  repo_id: string | null;
  repo_name: string;
  session_type: string;
  pr_url: string | null;
  pr_preview_url: string | null;
  linked_build: {
    id: string;
    status: string;
    pr_url: string | null;
    pr_preview_url: string | null;
    // Session 68 — the build's own last self-reported checkpoint (null until
    // wst-orchestrator-runner's Session 9 starts writing one) and how many times in a row
    // it's failed while reporting "stuck"/"blocked", so a retry click can be an informed
    // decision rather than a blind third attempt. See NOTES.md.
    checkpoint_progress_status: string | null;
    consecutive_stuck_count: number;
  } | null;
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

const KIND_BADGE: Record<ReviewItem["kind"], { label: string; bg: string; text: string; border: string }> = {
  consolidated_review: {
    label: "Consolidated Review",
    bg: "bg-[#4B858E]/10",
    text: "text-[#4B858E]",
    border: "border-[#4B858E]/30",
  },
  production_risk_flag: {
    label: "Production Risk",
    bg: "bg-orange-500/15",
    text: "text-orange-500",
    border: "border-orange-500/30",
  },
  kb_entry_draft: {
    label: "KB Entry Draft",
    bg: "bg-[#91B6BB]/15",
    text: "text-[#00205C]",
    border: "border-[#91B6BB]/40",
  },
  build_result: {
    label: "Build Result",
    bg: "bg-[#4B858E]/10",
    text: "text-[#4B858E]",
    border: "border-[#4B858E]/30",
  },
};

// ─── Decision buttons (production_risk_flag) ──────────────────────────────────
// This kind has no open_questions to answer — it needs a decision, not a freeform
// blob. consolidated_review keeps the plain textarea fallback for the (rare) case it
// has zero open_questions too. kb_entry_draft and build_result both got their own early
// return branches instead (see below) — a promoted KB entry needs several structured
// fields, not a single decision + freeform notes.

type DecisionOption = { value: string; label: string; style: "primary" | "neutral" | "danger" };

const DECISION_OPTIONS: Partial<Record<ReviewItem["kind"], DecisionOption[]>> = {
  production_risk_flag: [
    { value: "Acknowledged & Proceed", label: "Acknowledge & Proceed", style: "primary" },
    { value: "Stop / Needs Changes", label: "Stop / Needs Changes", style: "danger" },
  ],
};

const DECISION_BUTTON_STYLE: Record<DecisionOption["style"], string> = {
  primary: "bg-[#4B858E] text-white border border-[#4B858E]",
  neutral: "border border-[#00205C]/25 text-[#00205C]",
  danger: "border border-red-400 text-red-500",
};

const DECISION_BUTTON_STYLE_UNSELECTED: Record<DecisionOption["style"], string> = {
  primary: "border border-[#4B858E] text-[#4B858E] hover:bg-[#4B858E]/10",
  neutral: "border border-[#00205C]/20 text-[#76777A] hover:border-[#00205C]/40 hover:text-[#00205C]",
  danger: "border border-red-300 text-red-400 hover:bg-red-50",
};

// ─── Card ─────────────────────────────────────────────────────────────────────

export function ReviewCard({
  item,
  onAnswered,
  onDeleted,
}: {
  item: ReviewItem;
  onAnswered: (id: string, updated: Partial<ReviewItem>) => void;
  onDeleted: (id: string) => void;
}) {
  const badge = KIND_BADGE[item.kind] ?? KIND_BADGE.consolidated_review;
  const [answers, setAnswers] = useState<string[]>(item.open_questions.map((q) => q.answer || ""));
  const [drewResponse, setDrewResponse] = useState(item.drew_response ?? "");
  const [decision, setDecision] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [buildDispatching, setBuildDispatching] = useState(false);
  const [buildDispatchError, setBuildDispatchError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [sqlCopied, setSqlCopied] = useState(false);
  const [merging, setMerging] = useState(false);
  const [mergeError, setMergeError] = useState("");
  const [discarding, setDiscarding] = useState(false);
  const [discardError, setDiscardError] = useState("");
  const [archiving, setArchiving] = useState(false);
  const [archiveError, setArchiveError] = useState("");
  const [kbTitle, setKbTitle] = useState(item.kb_draft?.title ?? "");
  const [kbProblemSolved, setKbProblemSolved] = useState(item.kb_draft?.problem_solved ?? "");
  const [kbDescription, setKbDescription] = useState(item.proposed_content ?? "");
  const [kbTags, setKbTags] = useState((item.kb_draft?.tags ?? []).join(", "));
  const [kbTechStack, setKbTechStack] = useState((item.kb_draft?.tech_stack ?? []).join(", "));
  const [kbArtifactLocation, setKbArtifactLocation] = useState(item.kb_draft?.artifact_location ?? "");
  const [kbApproving, setKbApproving] = useState(false);
  const [kbApproveError, setKbApproveError] = useState("");

  const hasQuestions = item.open_questions.length > 0;
  const decisionOptions = hasQuestions ? undefined : DECISION_OPTIONS[item.kind];

  const allQuestionsAnswered = answers.every((a) => a.trim().length > 0);
  const canSubmit = hasQuestions
    ? allQuestionsAnswered
    : decisionOptions
    ? decision !== null
    : drewResponse.trim().length > 0;

  function setAnswer(i: number, value: string) {
    setAnswers((prev) => prev.map((a, idx) => (idx === i ? value : a)));
  }

  function appendOption(i: number, option: string) {
    setAnswers((prev) => prev.map((a, idx) => (idx === i ? (a ? `${a} ${option}` : option) : a)));
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError("");

    const supabase = getSupabaseBrowser();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const token = session?.access_token;

    const updatedQuestions = item.open_questions.map((q, i) => ({
      question: q.question,
      suggested_options: q.suggested_options,
      answer: answers[i],
    }));

    const finalResponse = decisionOptions
      ? `${decision}${drewResponse ? `\n\n${drewResponse}` : ""}`
      : drewResponse;

    try {
      const res = await fetch(`/api/admin-reviews/${item.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          open_questions: hasQuestions ? updatedQuestions : undefined,
          drew_response: finalResponse || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to submit");
        return;
      }

      onAnswered(item.id, {
        status: "answered",
        open_questions: hasQuestions ? updatedQuestions : item.open_questions,
        drew_response: finalResponse || null,
      });
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  // Fires a real "build" dispatch using this card's own proposed_content as the brief —
  // the first UI path that can reach session_type: "build" at all. Confirmation state is
  // local only (not persisted), so a page refresh re-shows the button; no double-dispatch
  // guard, this is a manual click Drew controls. See NOTES.md Session 50.
  //
  // Also the "Retry Build Session" handler (same function, see the failed-status render
  // branch below) — when retrying a failed linked build, auto-resume is transparent: no
  // separate button, no confirmation dialog. dispatchOrchestratorSession() itself decides
  // whether there's anything to actually resume from (the prior session may have failed
  // before ever writing a checkpoint), so this always just points at it when retrying.
  // See NOTES.md Session 68.
  async function handleRunBuildSession() {
    if (!item.repo_id || !item.proposed_content) return;

    const isRetry = item.linked_build?.status === "failed";

    setBuildDispatching(true);
    setBuildDispatchError("");

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
          repo_id: item.repo_id,
          session_type: "build",
          brief: item.proposed_content,
          source_review_item_id: item.id,
          ...(isRetry ? { resume_from_session_id: item.linked_build!.id } : {}),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setBuildDispatchError(data.error ?? "Failed to dispatch");
        return;
      }

      onAnswered(item.id, {
        linked_build: {
          id: data.session_id,
          status: "running",
          pr_url: null,
          pr_preview_url: null,
          checkpoint_progress_status: null,
          consecutive_stuck_count: 0,
        },
      });
    } catch {
      setBuildDispatchError("Something went wrong. Please try again.");
    } finally {
      setBuildDispatching(false);
    }
  }

  async function handleCopySql(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setSqlCopied(true);
      setTimeout(() => setSqlCopied(false), 2000);
    } catch {
      // Clipboard API can be denied/unavailable — the SQL is still visible on screen to
      // copy by hand, so this fails silently rather than showing an error.
    }
  }

  // Removes the card outright, for stray/test dispatches that never should have been
  // real inbox items. Only pending cards get this control (see render below) — an
  // answered card is a real decision on record, not something to casually erase.
  async function handleDelete() {
    if (!window.confirm("Delete this review card? This can't be undone.")) return;

    setDeleting(true);
    setDeleteError("");

    const supabase = getSupabaseBrowser();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const token = session?.access_token;

    try {
      const res = await fetch(`/api/admin-reviews/${item.id}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!res.ok) {
        const data = await res.json();
        setDeleteError(data.error ?? "Failed to delete");
        return;
      }

      onDeleted(item.id);
    } catch {
      setDeleteError("Something went wrong. Please try again.");
    } finally {
      setDeleting(false);
    }
  }

  // The one genuinely irreversible action anywhere in this inbox — squash-merges the
  // build session's PR straight to the target repo's default branch, which triggers
  // Vercel's normal auto-deploy. Same admin-auth gate as everything else, no extra
  // confirmation dialog beyond the button's own label — the whole point of this card
  // existing is that Drew already reviewed the preview before clicking it.
  async function handleMerge() {
    setMerging(true);
    setMergeError("");

    const supabase = getSupabaseBrowser();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const token = session?.access_token;

    try {
      const res = await fetch(`/api/admin-reviews/${item.id}/merge`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      const data = await res.json();
      if (!res.ok) {
        setMergeError(data.error ?? "Merge failed");
        return;
      }

      onAnswered(item.id, { status: "answered", drew_response: "Merged to production" });
    } catch {
      setMergeError("Something went wrong. Please try again.");
    } finally {
      setMerging(false);
    }
  }

  // Marks a card reviewed-and-not-acted-on via the generic PATCH — no GitHub or KB side
  // effect either way. Shared by build_result ("Discard") and kb_entry_draft ("Discard"),
  // each passing its own drew_response wording.
  async function handleDiscard(message: string) {
    setDiscarding(true);
    setDiscardError("");

    const supabase = getSupabaseBrowser();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const token = session?.access_token;

    try {
      const res = await fetch(`/api/admin-reviews/${item.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ drew_response: message }),
      });

      const data = await res.json();
      if (!res.ok) {
        setDiscardError(data.error ?? "Failed to discard");
        return;
      }

      onAnswered(item.id, { status: "answered", drew_response: message });
    } catch {
      setDiscardError("Something went wrong. Please try again.");
    } finally {
      setDiscarding(false);
    }
  }

  // Manual archive/unarchive — Drew's own confirmation that whatever an answered card
  // represents is actually live and working (or a reversal of that). Deliberately not tied
  // to any deploy-succeeded signal; see NOTES.md Session 68 for why. Shared by every kind
  // via the header row below rather than duplicated per render branch.
  async function handleArchive() {
    setArchiving(true);
    setArchiveError("");

    const supabase = getSupabaseBrowser();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const token = session?.access_token;

    try {
      const res = await fetch(`/api/admin-reviews/${item.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ status: "archived" }),
      });

      const data = await res.json();
      if (!res.ok) {
        setArchiveError(data.error ?? "Failed to archive");
        return;
      }

      onAnswered(item.id, { status: "archived", archived_at: new Date().toISOString() });
    } catch {
      setArchiveError("Something went wrong. Please try again.");
    } finally {
      setArchiving(false);
    }
  }

  async function handleUnarchive() {
    setArchiving(true);
    setArchiveError("");

    const supabase = getSupabaseBrowser();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const token = session?.access_token;

    try {
      const res = await fetch(`/api/admin-reviews/${item.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ status: "answered" }),
      });

      const data = await res.json();
      if (!res.ok) {
        setArchiveError(data.error ?? "Failed to unarchive");
        return;
      }

      onAnswered(item.id, { status: "answered" });
    } catch {
      setArchiveError("Something went wrong. Please try again.");
    } finally {
      setArchiving(false);
    }
  }

  // Small shared control rendered in every card's header row (see the three spots below).
  // Only relevant once a card has left "pending" — archiving a still-open question makes no
  // sense.
  function ArchiveControl() {
    if (item.status === "pending") return null;
    return (
      <span className="inline-flex items-center gap-1">
        <button
          type="button"
          onClick={item.status === "archived" ? handleUnarchive : handleArchive}
          disabled={archiving}
          className="text-xs font-medium text-[#76777A] hover:text-[#00205C] disabled:opacity-50 transition-colors"
        >
          {archiving ? "..." : item.status === "archived" ? "Unarchive" : "Archive"}
        </button>
        <InfoTooltip text="Archive is manual and deliberate — mark this once you've actually confirmed the real thing behind it is live and working, not automatically on merge or deploy." />
      </span>
    );
  }

  // Promotes this draft into a real, permanent, embedded knowledge_base_entries row.
  // Sends whatever's currently in the (always-editable) fields below, not a re-read of
  // the original agent-drafted values — Drew's last edit wins. See NOTES.md Session 55.
  async function handleApproveKbEntry() {
    setKbApproving(true);
    setKbApproveError("");

    const supabase = getSupabaseBrowser();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const token = session?.access_token;

    try {
      const res = await fetch(`/api/admin-reviews/${item.id}/approve-kb-entry`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          title: kbTitle,
          problem_solved: kbProblemSolved || null,
          tags: kbTags.split(",").map((t) => t.trim()).filter(Boolean),
          tech_stack: kbTechStack.split(",").map((t) => t.trim()).filter(Boolean),
          artifact_location: kbArtifactLocation || null,
          artifact_description: kbDescription,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setKbApproveError(data.error ?? "Failed to add to knowledge base");
        return;
      }

      onAnswered(item.id, { status: "answered", drew_response: "Added to knowledge base" });
    } catch {
      setKbApproveError("Something went wrong. Please try again.");
    } finally {
      setKbApproving(false);
    }
  }

  // kb_entry_draft cards need several structured fields (title, tags, tech stack, ...)
  // reviewed and adjustable before Approve, not a single decision + freeform notes — own
  // early return, same reasoning as build_result just below. See NOTES.md Session 55.
  if (item.kind === "kb_entry_draft") {
    return (
      <div className="border border-[#00205C]/[0.12] rounded-2xl bg-white p-6 space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <span
            className={`text-xs font-bold px-2.5 py-1 rounded-full border uppercase tracking-wide ${badge.bg} ${badge.text} ${badge.border}`}
          >
            {badge.label}
          </span>
          <InfoTooltip text="A build session judged something it built as reusable and drafted this entry. Review and edit the fields, then Approve to actually add it to the knowledge base — nothing is written until you do." />
          <span className="text-[#00205C] text-sm font-medium">{item.repo_name}</span>
          <span className="text-[#76777A] text-xs ml-auto">{relativeDate(item.created_at)}</span>
          <ArchiveControl />
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="text-xs font-medium text-red-400 hover:text-red-500 disabled:opacity-50 transition-colors"
          >
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>

        {deleteError && <p className="text-red-400 text-xs">{deleteError}</p>}
        {archiveError && <p className="text-red-400 text-xs">{archiveError}</p>}

        <p className="text-[#00205C]/80 text-sm leading-relaxed">{item.summary}</p>

        {item.status === "pending" ? (
          <div className="border-t border-[#00205C]/[0.08] pt-4 space-y-3">
            <div>
              <label className="block text-xs font-medium text-[#76777A] mb-1.5">Title</label>
              <input
                value={kbTitle}
                onChange={(e) => setKbTitle(e.target.value)}
                className="w-full bg-[#F4F2EE] border border-[#00205C]/[0.1] rounded-lg px-3 py-2 text-sm text-[#00205C] focus:outline-none focus:border-[#4B858E]/60"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#76777A] mb-1.5">Problem solved</label>
              <input
                value={kbProblemSolved}
                onChange={(e) => setKbProblemSolved(e.target.value)}
                className="w-full bg-[#F4F2EE] border border-[#00205C]/[0.1] rounded-lg px-3 py-2 text-sm text-[#00205C] focus:outline-none focus:border-[#4B858E]/60"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#76777A] mb-1.5">Description</label>
              <textarea
                value={kbDescription}
                onChange={(e) => setKbDescription(e.target.value)}
                rows={6}
                className="w-full bg-[#F4F2EE] border border-[#00205C]/[0.1] rounded-lg px-3 py-2 text-xs text-[#00205C] font-mono focus:outline-none focus:border-[#4B858E]/60"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[#76777A] mb-1.5">Tags (comma-separated)</label>
                <input
                  value={kbTags}
                  onChange={(e) => setKbTags(e.target.value)}
                  className="w-full bg-[#F4F2EE] border border-[#00205C]/[0.1] rounded-lg px-3 py-2 text-sm text-[#00205C] focus:outline-none focus:border-[#4B858E]/60"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#76777A] mb-1.5">
                  Tech stack (comma-separated)
                </label>
                <input
                  value={kbTechStack}
                  onChange={(e) => setKbTechStack(e.target.value)}
                  className="w-full bg-[#F4F2EE] border border-[#00205C]/[0.1] rounded-lg px-3 py-2 text-sm text-[#00205C] focus:outline-none focus:border-[#4B858E]/60"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#76777A] mb-1.5">Artifact location (optional)</label>
              <input
                value={kbArtifactLocation}
                onChange={(e) => setKbArtifactLocation(e.target.value)}
                placeholder="e.g. lib/project-files.ts"
                className="w-full bg-[#F4F2EE] border border-[#00205C]/[0.1] rounded-lg px-3 py-2 text-sm text-[#00205C] focus:outline-none focus:border-[#4B858E]/60"
              />
            </div>

            {kbApproveError && <p className="text-red-400 text-xs">{kbApproveError}</p>}
            {discardError && <p className="text-red-400 text-xs">{discardError}</p>}

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleApproveKbEntry}
                disabled={kbApproving || discarding || !kbTitle.trim() || !kbDescription.trim()}
                className="text-sm font-bold px-6 py-2.5 rounded-full bg-[#4B858E] text-white hover:bg-[#5a9aa4] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {kbApproving ? "Adding..." : "Approve & Add to Knowledge Base"}
              </button>
              <InfoTooltip text="Writes this as a real, permanent knowledge_base_entries row using whatever is currently in the fields above — your last edit wins, not the agent's original draft." />
              <button
                onClick={() => handleDiscard("Discarded")}
                disabled={kbApproving || discarding}
                className="text-sm font-semibold px-6 py-2.5 rounded-full border border-red-300 text-red-400 hover:bg-red-50 disabled:opacity-50 transition-colors"
              >
                {discarding ? "Discarding..." : "Discard"}
              </button>
              <InfoTooltip text="Marks this card reviewed without adding anything to the knowledge base." />
            </div>
          </div>
        ) : (
          <div className="border-t border-[#00205C]/[0.08] pt-4">
            <p className="text-[#4B858E] text-sm font-medium">{item.drew_response}</p>
          </div>
        )}
      </div>
    );
  }

  // build_result cards don't fit the open-questions/decision-buttons/textarea shape at
  // all — a real PR either gets merged or it doesn't. Kept as its own early return
  // rather than threading a third conditional shape through the render below.
  if (item.kind === "build_result") {
    return (
      <div className="border border-[#00205C]/[0.12] rounded-2xl bg-white p-6 space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <span
            className={`text-xs font-bold px-2.5 py-1 rounded-full border uppercase tracking-wide ${badge.bg} ${badge.text} ${badge.border}`}
          >
            {badge.label}
          </span>
          <InfoTooltip text="A build session finished and opened a PR. Merge to Production squash-merges it to the target repo's main branch and triggers Vercel's auto-deploy — the one irreversible action in this whole flow." />
          <span className="text-[#00205C] text-sm font-medium">{item.repo_name}</span>
          <span className="text-[#76777A] text-xs ml-auto">{relativeDate(item.created_at)}</span>
          <ArchiveControl />
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="text-xs font-medium text-red-400 hover:text-red-500 disabled:opacity-50 transition-colors"
          >
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>

        {deleteError && <p className="text-red-400 text-xs">{deleteError}</p>}
        {archiveError && <p className="text-red-400 text-xs">{archiveError}</p>}

        <p className="text-[#00205C]/80 text-sm leading-relaxed">{item.summary}</p>

        <div className="flex flex-wrap gap-3">
          {item.pr_url && (
            <a
              href={item.pr_url}
              target="_blank"
              rel="noreferrer"
              className="text-sm font-semibold text-[#4B858E] hover:underline"
            >
              View PR &rarr;
            </a>
          )}
          {item.pr_preview_url && (
            <a
              href={item.pr_preview_url}
              target="_blank"
              rel="noreferrer"
              className="text-sm font-semibold text-[#4B858E] hover:underline"
            >
              View Preview &rarr;
            </a>
          )}
        </div>

        {/* proposed_content is unused by every other build_result field — repurposed
            here to carry SQL the build session extracted from its own PR description
            (under a `## SQL to run` heading, per wst-orchestrator-runner's build
            prompt), rather than adding a new column for a single kind's one-off need. */}
        {item.proposed_content && (
          <div className="border-t border-[#00205C]/[0.08] pt-4 space-y-2">
            <span className="text-xs font-bold tracking-widest uppercase text-[#4B858E] block">
              SQL to Run
            </span>
            <pre className="max-h-72 overflow-y-auto bg-[#F4F2EE] border border-[#00205C]/[0.08] rounded-xl p-4 text-xs text-[#00205C] whitespace-pre-wrap font-mono">
              {item.proposed_content}
            </pre>
            <button
              type="button"
              onClick={() => handleCopySql(item.proposed_content!)}
              className="text-xs font-semibold px-4 py-2 rounded-full border border-[#4B858E] text-[#4B858E] hover:bg-[#4B858E]/10 transition-colors"
            >
              {sqlCopied ? "Copied ✓" : "Copy SQL"}
            </button>
          </div>
        )}

        {item.status === "pending" ? (
          <div className="border-t border-[#00205C]/[0.08] pt-4 space-y-3">
            {mergeError && <p className="text-red-400 text-xs">{mergeError}</p>}
            {discardError && <p className="text-red-400 text-xs">{discardError}</p>}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleMerge}
                disabled={merging || discarding || !item.pr_url}
                className="text-sm font-bold px-6 py-2.5 rounded-full bg-[#4B858E] text-white hover:bg-[#5a9aa4] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {merging ? "Merging..." : "Merge to Production"}
              </button>
              <InfoTooltip text="Squash-merges this PR to the target repo's main branch and triggers Vercel's normal auto-deploy. This is the one irreversible action anywhere in this inbox." />
              <button
                onClick={() => handleDiscard("Discarded — not merged")}
                disabled={merging || discarding}
                className="text-sm font-semibold px-6 py-2.5 rounded-full border border-red-300 text-red-400 hover:bg-red-50 disabled:opacity-50 transition-colors"
              >
                {discarding ? "Discarding..." : "Discard"}
              </button>
              <InfoTooltip text="Marks this card reviewed without touching GitHub — the PR stays open, unmerged, for you to deal with by hand later if needed." />
            </div>
          </div>
        ) : (
          <div className="border-t border-[#00205C]/[0.08] pt-4">
            <p className="text-[#4B858E] text-sm font-medium">{item.drew_response}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="border border-[#00205C]/[0.12] rounded-2xl bg-white p-6 space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <span
          className={`text-xs font-bold px-2.5 py-1 rounded-full border uppercase tracking-wide ${badge.bg} ${badge.text} ${badge.border}`}
        >
          {badge.label}
        </span>
        <InfoTooltip
          text={
            item.kind === "production_risk_flag"
              ? "The session flagged something risky before proceeding. Needs a decision, not open-ended answers."
              : "A planning session's output — its summary, any open questions, and a build prompt once fully specified."
          }
        />
        <span className="text-[#00205C] text-sm font-medium">{item.repo_name}</span>
        <span className="text-[#76777A] text-xs">{item.session_type}</span>
        <span className="text-[#76777A] text-xs ml-auto">{relativeDate(item.created_at)}</span>
        <ArchiveControl />
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          className="text-xs font-medium text-red-400 hover:text-red-500 disabled:opacity-50 transition-colors"
        >
          {deleting ? "Deleting..." : "Delete"}
        </button>
      </div>

      {deleteError && <p className="text-red-400 text-xs">{deleteError}</p>}
      {archiveError && <p className="text-red-400 text-xs">{archiveError}</p>}

      <p className="text-[#00205C]/80 text-sm leading-relaxed">{item.summary}</p>

      {item.proposed_content && (
        <pre className="max-h-96 overflow-y-auto bg-[#F4F2EE] border border-[#00205C]/[0.08] rounded-xl p-4 text-xs text-[#00205C] whitespace-pre-wrap font-mono">
          {item.proposed_content}
        </pre>
      )}

      {item.status === "pending" ? (
        <>
          {hasQuestions && (
            <div className="space-y-4">
              {item.open_questions.map((q, i) => (
                <div key={i} className="border-t border-[#00205C]/[0.08] pt-4">
                  <p className="text-[#00205C] text-sm font-medium mb-2">{q.question}</p>
                  {q.suggested_options.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {q.suggested_options.map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => appendOption(i, opt)}
                          className="text-xs font-semibold px-3 py-1.5 rounded-full border border-[#4B858E] text-[#4B858E] hover:bg-[#4B858E]/10 transition-colors"
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}
                  <input
                    value={answers[i]}
                    onChange={(e) => setAnswer(i, e.target.value)}
                    placeholder="Your answer"
                    className="w-full bg-[#F4F2EE] border border-[#00205C]/[0.1] rounded-lg px-3 py-2 text-sm text-[#00205C] focus:outline-none focus:border-[#4B858E]/60"
                  />
                </div>
              ))}
            </div>
          )}

          {decisionOptions && (
            <div className="border-t border-[#00205C]/[0.08] pt-4 space-y-3">
              <div className="flex flex-wrap gap-2">
                {decisionOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setDecision(opt.value)}
                    className={`text-xs font-semibold px-4 py-2 rounded-full transition-colors ${
                      decision === opt.value
                        ? DECISION_BUTTON_STYLE[opt.style]
                        : DECISION_BUTTON_STYLE_UNSELECTED[opt.style]
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="border-t border-[#00205C]/[0.08] pt-4">
            <label className="block text-xs font-medium text-[#76777A] mb-1.5">
              {hasQuestions ? "Anything else (optional)" : decisionOptions ? "Notes (optional)" : "Your response"}
            </label>
            <textarea
              value={drewResponse}
              onChange={(e) => setDrewResponse(e.target.value)}
              rows={3}
              className="w-full bg-[#F4F2EE] border border-[#00205C]/[0.1] rounded-lg px-3 py-2 text-sm text-[#00205C] focus:outline-none focus:border-[#4B858E]/60 resize-none"
            />
          </div>

          {error && <p className="text-red-400 text-xs">{error}</p>}

          <button
            onClick={handleSubmit}
            disabled={!canSubmit || submitting}
            className="text-sm font-bold px-6 py-2.5 rounded-full bg-[#4B858E] text-white hover:bg-[#5a9aa4] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? "Submitting..." : "Submit Answers"}
          </button>
        </>
      ) : (
        <>
          <div className="border-t border-[#00205C]/[0.08] pt-4 space-y-3">
            {item.open_questions.map((q, i) => (
              <div key={i}>
                <p className="text-[#00205C] text-sm font-medium">{q.question}</p>
                <p className="text-[#4B858E] text-sm mt-1">{q.answer || "—"}</p>
              </div>
            ))}
            {item.drew_response && (
              <div>
                <p className="text-[#76777A] text-xs uppercase tracking-wide mb-1">Response</p>
                <p className="text-[#00205C]/80 text-sm">{item.drew_response}</p>
              </div>
            )}
          </div>

          {item.kind === "consolidated_review" && item.proposed_content && item.repo_id && (
            <div className="border-t border-[#00205C]/[0.08] pt-4 space-y-2">
              <span className="text-xs font-bold tracking-widest uppercase text-[#4B858E] flex items-center gap-1.5">
                Build
                <InfoTooltip text="Dispatches this card's own build prompt exactly as written and opens a pull request. Retry (after a failure) resumes from that session's last checkpoint automatically, when one exists." />
              </span>
              {buildDispatchError && <p className="text-red-400 text-xs">{buildDispatchError}</p>}
              {!item.linked_build ? (
                <button
                  onClick={handleRunBuildSession}
                  disabled={buildDispatching}
                  className="text-sm font-bold px-6 py-2.5 rounded-full bg-[#4B858E] text-white hover:bg-[#5a9aa4] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {buildDispatching ? "Dispatching..." : "Run Build Session"}
                </button>
              ) : item.linked_build.status === "failed" ? (
                <>
                  <p className="text-red-400 text-sm">
                    Build session failed. Check this repo&apos;s Actions tab for details.
                    {item.linked_build.checkpoint_progress_status &&
                      ` Last attempt reported: ${item.linked_build.checkpoint_progress_status}.`}
                  </p>
                  {item.linked_build.consecutive_stuck_count >= 2 && (
                    <p className="text-orange-500 text-sm">
                      This session has failed and reported being stuck {item.linked_build.consecutive_stuck_count}{" "}
                      times in a row. Consider rewriting the brief before retrying.
                    </p>
                  )}
                  <button
                    onClick={handleRunBuildSession}
                    disabled={buildDispatching}
                    className="text-sm font-bold px-6 py-2.5 rounded-full bg-[#4B858E] text-white hover:bg-[#5a9aa4] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {buildDispatching ? "Dispatching..." : "Retry Build Session"}
                  </button>
                </>
              ) : (
                <div className="space-y-2">
                  <p className="text-[#4B858E] text-sm">
                    Build session dispatched (status: {item.linked_build.status}). Check the Build Result
                    card in this inbox for status.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {item.linked_build.pr_url && (
                      <a
                        href={item.linked_build.pr_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm font-semibold text-[#4B858E] hover:underline"
                      >
                        View PR &rarr;
                      </a>
                    )}
                    {item.linked_build.pr_preview_url && (
                      <a
                        href={item.linked_build.pr_preview_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm font-semibold text-[#4B858E] hover:underline"
                      >
                        View Preview &rarr;
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── List (tabbed Pending/Answered) ────────────────────────────────────────────
// Extracted so both the global /admin/reviews inbox and a single repo's own scoped
// section on /admin/repos/[id] can render the same tabs + cards against different item
// sets, without duplicating the tab/local-state logic. See NOTES.md Session 51.

export function ReviewList({
  initialItems,
  emptyPendingLabel = "Nothing to review.",
  emptyAnsweredLabel = "No answered items yet.",
}: {
  initialItems: ReviewItem[];
  emptyPendingLabel?: string;
  emptyAnsweredLabel?: string;
}) {
  const [items, setItems] = useState<ReviewItem[]>(initialItems);
  const [activeTab, setActiveTab] = useState<"pending" | "answered" | "archived">("pending");

  function handleAnswered(id: string, updated: Partial<ReviewItem>) {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...updated } : it)));
  }

  function handleDeleted(id: string) {
    setItems((prev) => prev.filter((it) => it.id !== id));
  }

  const pending = items.filter((i) => i.status === "pending");
  const answered = items.filter((i) => i.status === "answered");
  // Session 68 — a manual, third status. Answered no longer accumulates everything ever
  // answered forever; Drew archives a card once he's personally confirmed the real thing
  // behind it is actually live and working. See NOTES.md.
  const archived = items.filter((i) => i.status === "archived");
  const visible = activeTab === "pending" ? pending : activeTab === "answered" ? answered : archived;

  return (
    <div>
      <div className="flex items-center gap-1 border-b border-[#00205C]/[0.10] mb-6">
        {(["pending", "answered", "archived"] as const).map((tab) => {
          const count = tab === "pending" ? pending.length : tab === "answered" ? answered.length : archived.length;
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-sm font-semibold px-4 py-3 border-b-2 -mb-px transition-colors capitalize ${
                isActive
                  ? "text-[#00205C] border-[#4B858E]"
                  : "text-[#76777A] border-transparent hover:text-[#00205C]"
              }`}
            >
              {tab} ({count})
            </button>
          );
        })}
      </div>

      {visible.length === 0 ? (
        <p className="text-[#00205C] text-sm">
          {activeTab === "pending" ? emptyPendingLabel : activeTab === "answered" ? emptyAnsweredLabel : "Nothing archived yet."}
        </p>
      ) : (
        <div className="space-y-4">
          {visible.map((item) => (
            <ReviewCard key={item.id} item={item} onAnswered={handleAnswered} onDeleted={handleDeleted} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main (full-page inbox, all repos) ─────────────────────────────────────────

export default function ReviewInboxClient({ initialItems }: { initialItems: ReviewItem[] }) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav */}
      <AdminNav active="reviews" />

      <main className="flex-1 px-6 py-16">
        <div className="w-full max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-bold text-[#00205C] mb-6">Reviews</h1>
          <ReviewList initialItems={initialItems} />
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

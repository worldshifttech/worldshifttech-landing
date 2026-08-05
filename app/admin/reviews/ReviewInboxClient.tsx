"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import SignOutButton from "@/app/components/SignOutButton";
import { getSupabaseBrowser } from "@/lib/supabase";

// ─── Types ────────────────────────────────────────────────────────────────────

export type OpenQuestion = {
  question: string;
  suggested_options: string[];
  answer: string;
};

export type ReviewItem = {
  id: string;
  kind: "consolidated_review" | "production_risk_flag" | "kb_entry_draft";
  summary: string;
  open_questions: OpenQuestion[];
  proposed_content: string | null;
  drew_response: string | null;
  status: "pending" | "answered";
  created_at: string;
  repo_name: string;
  session_type: string;
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
};

// ─── Card ─────────────────────────────────────────────────────────────────────

function ReviewCard({ item, onAnswered }: { item: ReviewItem; onAnswered: (id: string, updated: Partial<ReviewItem>) => void }) {
  const badge = KIND_BADGE[item.kind] ?? KIND_BADGE.consolidated_review;
  const [answers, setAnswers] = useState<string[]>(item.open_questions.map((q) => q.answer || ""));
  const [drewResponse, setDrewResponse] = useState(item.drew_response ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const hasQuestions = item.open_questions.length > 0;
  const allQuestionsAnswered = answers.every((a) => a.trim().length > 0);
  const canSubmit = hasQuestions ? allQuestionsAnswered : drewResponse.trim().length > 0;

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

    try {
      const res = await fetch(`/api/admin-reviews/${item.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          open_questions: hasQuestions ? updatedQuestions : undefined,
          drew_response: drewResponse || undefined,
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
        drew_response: drewResponse || null,
      });
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="border border-[#00205C]/[0.12] rounded-2xl bg-white p-6 space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <span
          className={`text-xs font-bold px-2.5 py-1 rounded-full border uppercase tracking-wide ${badge.bg} ${badge.text} ${badge.border}`}
        >
          {badge.label}
        </span>
        <span className="text-[#00205C] text-sm font-medium">{item.repo_name}</span>
        <span className="text-[#76777A] text-xs">{item.session_type}</span>
        <span className="text-[#76777A] text-xs ml-auto">{relativeDate(item.created_at)}</span>
      </div>

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

          <div className="border-t border-[#00205C]/[0.08] pt-4">
            <label className="block text-xs font-medium text-[#76777A] mb-1.5">
              {hasQuestions ? "Anything else (optional)" : "Your response"}
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
      )}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function ReviewInboxClient({ initialItems }: { initialItems: ReviewItem[] }) {
  const [items, setItems] = useState<ReviewItem[]>(initialItems);
  const [activeTab, setActiveTab] = useState<"pending" | "answered">("pending");

  function handleAnswered(id: string, updated: Partial<ReviewItem>) {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...updated } : it)));
  }

  const pending = items.filter((i) => i.status === "pending");
  const answered = items.filter((i) => i.status === "answered");
  const visible = activeTab === "pending" ? pending : answered;

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
              &larr; Dashboard
            </Link>
            <Link href="/" className="text-sm text-[#76777A] hover:text-[#00205C] transition-colors">
              Back to Site
            </Link>
            <SignOutButton />
          </div>
        </div>
      </nav>

      <main className="flex-1 px-6 py-16">
        <div className="w-full max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-bold text-[#00205C] mb-6">Reviews</h1>

          <div className="flex items-center gap-1 border-b border-[#00205C]/[0.10] mb-8">
            {(["pending", "answered"] as const).map((tab) => {
              const count = tab === "pending" ? pending.length : answered.length;
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
              {activeTab === "pending" ? "Nothing to review." : "No answered items yet."}
            </p>
          ) : (
            <div className="space-y-4">
              {visible.map((item) => (
                <ReviewCard key={item.id} item={item} onAnswered={handleAnswered} />
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

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getSupabaseBrowser } from "@/lib/supabase";
import AuthModal from "@/app/components/AuthModal";

const CALENDLY_URL = "https://calendly.com/fractionalbusinesscompanion/wst";

// ─── Types ────────────────────────────────────────────────────────────────────

type Answers = {
  q1: string;
  custom_build_description: string;
  q2: string;
  q3: string;
  q4: string[];
  value_signals: string[];
  q6: string;
  q7: string;
  q8: string;
  q9: string;
  q10: string[];
  q10Other: string;
  q11: string;
  q12: string;
};

type PricingTier = {
  low: number;
  high: number;
  description: string;
};

type ScopeData = {
  title: string;
  the_problem: string;
  without_it: string;
  with_it: string;
  price_low: number;
  price_high: number;
  price_rationale: string;
  green_score: "Light" | "Moderate" | "Heavy";
  green_score_reason?: string;
  green_offset_estimate?: string;
  pricing?: {
    mvp: PricingTier;
    polished: PricingTier;
    perfected: PricingTier;
    value_rationale: string;
  };
};

const INIT: Answers = {
  q1: "",
  custom_build_description: "",
  q2: "",
  q3: "",
  q4: [],
  value_signals: [],
  q6: "",
  q7: "",
  q8: "",
  q9: "",
  q10: [],
  q10Other: "",
  q11: "",
  q12: "",
};

// ─── Chapter config ───────────────────────────────────────────────────────────

const CHAPTERS = [
  { id: 1, label: "The Problem", qs: [1] },
  { id: 2, label: "The Vision", qs: [2, 3] },
  { id: 3, label: "The Build", qs: [4, 5, 6] },
];

function chapterForQ(q: number) {
  return CHAPTERS.find((c) => c.qs.includes(q))!;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function ProjectWizard({
  userEmail,
  userId,
  isGuest,
}: {
  userEmail: string;
  userId: string;
  isGuest: boolean;
}) {
  const [q, setQ] = useState(1);
  const [answers, setAnswers] = useState<Answers>(INIT);
  const [showReveal, setShowReveal] = useState(false);
  const [revealDone, setRevealDone] = useState(false);
  const [scope, setScope] = useState<ScopeData | null>(null);
  const [scopeError, setScopeError] = useState(false);
  const [projectId, setProjectId] = useState<string>("");

  const chapter = chapterForQ(q);

  useEffect(() => {
    if (showReveal) {
      const t = setTimeout(() => setRevealDone(true), 3000);
      return () => clearTimeout(t);
    }
  }, [showReveal]);

  async function handleReveal() {
    const pid = crypto.randomUUID();
    setProjectId(pid);
    setShowReveal(true);

    const supabase = getSupabaseBrowser();
    await supabase.from("projects").insert({
      id: pid,
      user_id: isGuest ? null : userId,
      guest: isGuest,
      answers: {
        q1: answers.q1,
        custom_build_description: answers.custom_build_description,
        q2: answers.q2,
        q3: answers.q3,
        q4: answers.q4,
        value_signals: answers.value_signals,
        q6: answers.q6,
        q7: answers.q7,
        q8: answers.q8,
        q9: answers.q9,
        q10: answers.q10,
        q10_other: answers.q10Other,
        q11: answers.q11,
        q12: answers.q12,
      },
      status: "draft",
    });

    try {
      const res = await fetch("/api/generate-scope", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: pid,
          answers: {
            q1: answers.q1,
            custom_build_description: answers.custom_build_description,
            q2: answers.q2,
            q3: answers.q3,
            q4: answers.q4,
            value_signals: answers.value_signals,
            q6: answers.q6,
            q7: answers.q7,
            q8: answers.q8,
            q9: answers.q9,
            q10: answers.q10,
            q10_other: answers.q10Other,
            q11: answers.q11,
            q12: answers.q12,
          },
        }),
      });
      if (!res.ok) throw new Error("API error");
      const data: ScopeData = await res.json();
      setScope(data);
    } catch {
      setScopeError(true);
    }
  }

  function next() {
    if (q === 6) {
      handleReveal();
    } else {
      setQ((n) => n + 1);
    }
  }

  function back() {
    if (q > 1) setQ((n) => n - 1);
  }

  function nextEnabled(): boolean {
    switch (q) {
      case 1:
        return answers.q3.trim().length >= 10;
      case 2:
        return answers.q6.trim().length >= 10;
      case 3:
        return !!answers.q8;
      case 4:
        return answers.q10.length > 0;
      case 5:
        return !!answers.q11;
      case 6:
        return true;
      default:
        return false;
    }
  }

  if (showReveal) {
    return (
      <RevealScreen
        done={revealDone}
        scope={scope}
        scopeError={scopeError}
        projectId={projectId}
        userEmail={userEmail}
        isGuest={isGuest}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav */}
      <nav className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-sm border-b border-[#00205C]/10 shadow-sm">
        <div className="flex items-center justify-between px-6 py-5">
          <Link href="/projects">
            <Image
              src="/World_shift_tech_LOGO_PRIMARY.png"
              alt="World Shift Technologies"
              width={140}
              height={34}
              className="object-contain"
              priority
            />
          </Link>
          <span className="text-sm text-[#76777A] hidden sm:block font-normal">
            {userEmail}
          </span>
        </div>
      </nav>

      {/* Chapter progress */}
      <ChapterProgress activeChapterId={chapter.id} />

      {/* Question */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-2xl">
          <QuestionView
            q={q}
            answers={answers}
            setAnswers={setAnswers}
            onAutoAdvance={next}
          />
        </div>
      </main>

      {/* Footer nav */}
      <div className="border-t border-[#00205C]/[0.08] px-6 py-5">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <button
            onClick={back}
            className="text-sm text-[#76777A] hover:text-[#00205C] transition-colors px-4 py-3 rounded-lg font-normal"
          >
            Back
          </button>
          <button
            onClick={next}
            disabled={!nextEnabled()}
            className={`text-sm font-bold px-8 py-3 rounded-full transition-all ${
              nextEnabled()
                ? "bg-[#4B858E] text-white hover:bg-[#5a9aa4] cursor-pointer"
                : "bg-[#00205C]/[0.06] text-[#76777A] cursor-not-allowed"
            }`}
          >
            {q === 6 ? "See Your Scope" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Chapter progress bar ─────────────────────────────────────────────────────

function ChapterProgress({ activeChapterId }: { activeChapterId: number }) {
  return (
    <div className="border-b border-[#00205C]/[0.08] px-6 py-4">
      <div className="max-w-2xl mx-auto flex gap-2 sm:gap-4">
        {CHAPTERS.map((chapter) => {
          const isActive = chapter.id === activeChapterId;
          const isCompleted = chapter.id < activeChapterId;
          return (
            <div key={chapter.id} className="flex-1 min-w-0">
              <div
                className={`text-xs font-semibold tracking-wide mb-2 truncate transition-colors ${
                  isActive
                    ? "text-[#4B858E]"
                    : isCompleted
                    ? "text-[#4B858E]/50"
                    : "text-[#76777A]/60"
                }`}
              >
                {chapter.label}
              </div>
              <div
                className={`h-0.5 rounded-full transition-colors ${
                  isActive
                    ? "bg-[#4B858E]"
                    : isCompleted
                    ? "bg-[#4B858E]/40"
                    : "bg-[#00205C]/[0.08]"
                }`}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Question renderer ────────────────────────────────────────────────────────

type QProps = {
  q: number;
  answers: Answers;
  setAnswers: React.Dispatch<React.SetStateAction<Answers>>;
  onAutoAdvance: () => void;
};

function QuestionView({ q, answers, setAnswers, onAutoAdvance }: QProps) {
  // Q1 — free text problem (maps to q3)
  if (q === 1) {
    return (
      <QuestionWrapper text="If you could change one thing in your business that would move you to the next stage of growth, what would it look like?">
        <TextArea
          value={answers.q3}
          onChange={(v) => setAnswers((a) => ({ ...a, q3: v }))}
          placeholder="Describe the problem or bottleneck as clearly as you can."
        />
      </QuestionWrapper>
    );
  }

  // Q2 — free text vision (maps to q6)
  if (q === 2) {
    return (
      <QuestionWrapper text="With that problem solved, what does your day-to-day or operations look like now?">
        <TextArea
          value={answers.q6}
          onChange={(v) => setAnswers((a) => ({ ...a, q6: v }))}
          placeholder="Describe what changes — for you, your team, your business."
        />
      </QuestionWrapper>
    );
  }

  // Q3 — single-select team (maps to q8), click to advance
  if (q === 3) {
    const options = [
      "Just me",
      "Me and a small team (2–5 people)",
      "A larger team or department",
      "My clients or customers",
    ];
    return (
      <QuestionWrapper text="Who else needs to use this?">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-8">
          {options.map((opt) => (
            <SelectOption
              key={opt}
              label={opt}
              selected={answers.q8 === opt}
              onClick={() => {
                setAnswers((a) => ({ ...a, q8: opt }));
                onAutoAdvance();
              }}
            />
          ))}
        </div>
      </QuestionWrapper>
    );
  }

  // Q4 — multi-select integrations (maps to q10 + q10Other)
  if (q === 4) {
    const options = [
      "CRM (e.g. HubSpot, Salesforce)",
      "Email or marketing automation (e.g. Mailchimp, ActiveCampaign)",
      "Project management (e.g. ClickUp, Asana, Monday)",
      "Database or spreadsheet (e.g. Airtable, Excel, Google Sheets)",
      "Communication tools (e.g. Slack, Teams)",
      "E-commerce or payments (e.g. Shopify, Stripe)",
      "Accounting or finance (e.g. QuickBooks, Xero)",
      "No existing tools / starting fresh",
      "Other",
    ];
    const showOther = answers.q10.includes("Other");
    return (
      <QuestionWrapper
        text="Do you have existing tools this needs to connect to?"
        subtitle="Pick all that apply."
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-8">
          {options.map((opt) => (
            <MultiOption
              key={opt}
              label={opt}
              selected={answers.q10.includes(opt)}
              onClick={() =>
                setAnswers((a) => ({
                  ...a,
                  q10: a.q10.includes(opt)
                    ? a.q10.filter((x) => x !== opt)
                    : [...a.q10, opt],
                }))
              }
            />
          ))}
        </div>
        {showOther && (
          <input
            type="text"
            value={answers.q10Other}
            onChange={(e) =>
              setAnswers((a) => ({ ...a, q10Other: e.target.value }))
            }
            placeholder="Which other tool?"
            className="mt-4 w-full bg-white border border-[#00205C]/[0.15] rounded-xl px-4 py-3 text-[#00205C] text-sm font-normal placeholder:text-[#76777A]/70 focus:outline-none focus:border-[#4B858E]/60"
          />
        )}
      </QuestionWrapper>
    );
  }

  // Q5 — single-select technical (maps to q11), click to advance
  if (q === 5) {
    const options = [
      "Not at all. I need this to just work.",
      "Somewhat. I can follow instructions.",
      "Pretty technical. I can handle setup and configuration.",
    ];
    return (
      <QuestionWrapper text="How technical are you?">
        <div className="grid grid-cols-1 gap-3 mt-8">
          {options.map((opt) => (
            <SelectOption
              key={opt}
              label={opt}
              selected={answers.q11 === opt}
              onClick={() => {
                setAnswers((a) => ({ ...a, q11: opt }));
                onAutoAdvance();
              }}
            />
          ))}
        </div>
      </QuestionWrapper>
    );
  }

  // Q6 — anything else (optional, maps to q12)
  if (q === 6) {
    return (
      <QuestionWrapper
        text="Anything else I should know?"
        subtitle="Optional."
      >
        <TextArea
          value={answers.q12}
          onChange={(v) => setAnswers((a) => ({ ...a, q12: v }))}
          placeholder="Timeline, budget range, constraints, or context that would help."
        />
      </QuestionWrapper>
    );
  }

  return null;
}

// ─── Shared primitives ────────────────────────────────────────────────────────

function QuestionWrapper({
  text,
  subtitle,
  children,
}: {
  text: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h2 className="text-3xl sm:text-4xl font-bold text-[#00205C] leading-snug">
        {text}
      </h2>
      {subtitle && (
        <p className="mt-2 text-[#00205C] text-sm font-normal">
          {subtitle}
        </p>
      )}
      {children}
    </div>
  );
}

function SelectOption({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`text-left px-5 py-4 rounded-xl border text-sm font-normal transition-all ${
        selected
          ? "border-[#4B858E] bg-[#4B858E]/10 text-[#00205C]"
          : "border-[#00205C]/[0.12] bg-white text-[#00205C]/80 hover:border-[#4B858E]/50 hover:bg-[#4B858E]/[0.04]"
      }`}
    >
      {label}
    </button>
  );
}

function MultiOption({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 text-left px-5 py-4 rounded-xl border text-sm font-normal transition-all ${
        selected
          ? "border-[#4B858E] bg-[#4B858E]/10 text-[#00205C]"
          : "border-[#00205C]/[0.12] bg-white text-[#00205C]/80 hover:border-[#4B858E]/50 hover:bg-[#4B858E]/[0.04]"
      }`}
    >
      <span
        className={`flex-shrink-0 w-4 h-4 rounded border flex items-center justify-center transition-colors ${
          selected ? "border-[#4B858E] bg-[#4B858E]" : "border-[#00205C]/20"
        }`}
      >
        {selected && (
          <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
            <path
              d="M1 3l2 2 4-4"
              stroke="#080C14"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </span>
      {label}
    </button>
  );
}

function TextArea({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={5}
      className="mt-8 w-full bg-white border border-[#00205C]/[0.15] rounded-xl px-5 py-4 text-[#00205C] text-sm font-normal placeholder:text-[#76777A]/70 focus:outline-none focus:border-[#4B858E]/60 resize-none leading-relaxed"
    />
  );
}

// ─── Reveal screen ────────────────────────────────────────────────────────────

function formatPrice(n: number): string {
  return "$" + n.toLocaleString("en-US");
}

const GREEN_SCORE_STYLES: Record<
  ScopeData["green_score"],
  { label: string; border: string; text: string }
> = {
  Light: {
    label: "Energy Footprint: Light",
    border: "border-green-500/40",
    text: "text-green-400",
  },
  Moderate: {
    label: "Energy Footprint: Moderate",
    border: "border-yellow-500/40",
    text: "text-yellow-400",
  },
  Heavy: {
    label: "Energy Footprint: Heavy",
    border: "border-orange-500/40",
    text: "text-orange-400",
  },
};

const TIER_LABELS = { mvp: "MVP", polished: "Polished", perfected: "Perfected" } as const;

function ThreeTierPricing({ pricing }: { pricing: NonNullable<ScopeData["pricing"]> }) {
  return (
    <div className="mt-3 space-y-3">
      {(["mvp", "polished", "perfected"] as const).map((tier) => {
        const tierData = pricing[tier];
        return (
          <div key={tier}>
            <div className="flex items-baseline gap-2">
              <span className="text-[#00205C] text-sm font-semibold">
                {TIER_LABELS[tier]}
              </span>
              <span className="text-[#00205C]/80 text-sm font-medium">
                {formatPrice(tierData.low)} &ndash; {formatPrice(tierData.high)}
              </span>
            </div>
            <p className="text-[#00205C]/70 text-xs leading-relaxed mt-0.5 font-normal">
              {tierData.description}
            </p>
          </div>
        );
      })}
      <p className="text-[#00205C]/70 text-xs italic leading-relaxed mt-2 font-normal">
        {pricing.value_rationale}
      </p>
    </div>
  );
}

function RevealScreen({
  done,
  scope,
  scopeError,
  projectId,
  userEmail,
  isGuest,
}: {
  done: boolean;
  scope: ScopeData | null;
  scopeError: boolean;
  projectId: string;
  userEmail: string;
  isGuest: boolean;
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState(false);
  const [greenOffsetIntent, setGreenOffsetIntent] = useState(false);
  const [guestModalOpen, setGuestModalOpen] = useState(false);
  const [guestAttached, setGuestAttached] = useState(false);

  function handleGreenOffsetToggle(checked: boolean) {
    setGreenOffsetIntent(checked);
    const supabase = getSupabaseBrowser();
    supabase
      .from("projects")
      .update({ green_offset_intent: checked })
      .eq("id", projectId);
  }

  async function handleSubmit() {
    setSubmitting(true);
    setSubmitError(false);
    const supabase = getSupabaseBrowser();
    const { error } = await supabase
      .from("projects")
      .update({ status: "submitted", updated_at: new Date().toISOString() })
      .eq("id", projectId);
    if (error) {
      setSubmitting(false);
      setSubmitError(true);
      return;
    }
    try {
      fetch("/api/notify-slack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectTitle: scope?.title ?? "Untitled Project",
          userEmail,
        }),
      });
    } catch {}
    setSubmitted(true);
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
      {!done ? (
        // Loading state — progress bar
        <div className="text-center max-w-sm w-full">
          <h1 className="text-3xl font-bold text-[#00205C] mb-3 leading-snug">
            Your project scope is being assembled.
          </h1>
          <p className="text-[#00205C] mb-10 font-normal">
            This will only take a moment.
          </p>
          <div className="w-full h-0.5 bg-[#00205C]/[0.08] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#4B858E] rounded-full"
              style={{ animation: "wst-progress 3s ease-in-out forwards" }}
            />
          </div>
        </div>
      ) : scopeError ? (
        // Error state
        <div className="text-center max-w-sm w-full">
          <p className="text-[#00205C]/70 text-sm font-normal">
            Something went wrong generating your scope. Please refresh and try
            again.
          </p>
        </div>
      ) : submitted ? (
        // Confirmation state
        <div className="w-full max-w-xl">
          <div className="bg-white border border-[#00205C]/10 rounded-2xl p-8 text-center">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-[#4B858E]/10 border border-[#4B858E]/20 mx-auto mb-6">
              <svg width="28" height="22" viewBox="0 0 28 22" fill="none">
                <path
                  d="M2 11l8 8L26 2"
                  stroke="#4B858E"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-[#00205C] mb-3 leading-snug">
              You&apos;re in the queue.
            </h2>
            <p className="text-[#00205C] text-sm mb-8 font-normal">
              Drew will review your scope and be in touch within 1 business day.
            </p>
            <button
              onClick={() => router.push("/projects")}
              className="bg-[#4B858E] text-white text-sm font-bold px-7 py-3 rounded-full hover:bg-[#5a9aa4] transition-colors"
            >
              Back to Your Projects
            </button>
          </div>
        </div>
      ) : scope ? (
        // Real scope card
        <div className="w-full max-w-xl">
          <div className="bg-white border border-[#00205C]/10 rounded-2xl p-8">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-2">
              <h2 className="text-2xl font-bold text-[#00205C]">
                {scope.title}
              </h2>
              <span
                className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${
                  GREEN_SCORE_STYLES[scope.green_score].border
                } ${GREEN_SCORE_STYLES[scope.green_score].text}`}
              >
                {GREEN_SCORE_STYLES[scope.green_score].label}
              </span>
            </div>

            {scope.green_score_reason && (
              <p className="text-[#00205C]/70 text-xs mb-4 leading-relaxed font-normal">
                {scope.green_score_reason}
              </p>
            )}

            <div className="mb-4 rounded-xl border border-[#4B858E]/40 bg-[#4B858E]/[0.06] px-4 py-3">
              <p className="text-[#00205C]/80 text-xs leading-relaxed font-normal">
                This project runs on Vercel, which is powered by renewable energy. Carbon offsets for AI usage are coming soon.
              </p>
            </div>

            <label className="flex items-start gap-3 mb-6 cursor-pointer group">
              <span
                className={`flex-shrink-0 mt-0.5 w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                  greenOffsetIntent
                    ? "border-[#4B858E] bg-[#4B858E]"
                    : "border-[#00205C]/20 group-hover:border-[#4B858E]/50"
                }`}
              >
                {greenOffsetIntent && (
                  <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                    <path
                      d="M1 3l2 2 4-4"
                      stroke="#080C14"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </span>
              <input
                type="checkbox"
                className="sr-only"
                checked={greenOffsetIntent}
                onChange={(e) => handleGreenOffsetToggle(e.target.checked)}
              />
              <span className="text-xs text-[#00205C]/70 leading-relaxed font-normal">
                I&apos;d like to offset this project&apos;s carbon footprint when that option becomes available.
              </span>
            </label>

            <div className="h-px bg-[#4B858E]/30 mb-8" />

            <div className="space-y-6">
              <div>
                <span className="text-xs font-bold tracking-widest uppercase text-[#4B858E]">
                  The Problem
                </span>
                <p className="mt-1.5 text-[#00205C]/70 text-sm leading-relaxed font-normal">
                  {scope.the_problem}
                </p>
              </div>

              <div>
                <span className="text-xs font-bold tracking-widest uppercase text-[#4B858E]">
                  Without It
                </span>
                <p className="mt-1.5 text-[#00205C]/70 text-sm leading-relaxed font-normal">
                  {scope.without_it}
                </p>
              </div>

              <div>
                <span className="text-xs font-bold tracking-widest uppercase text-[#4B858E]">
                  With It
                </span>
                <p className="mt-1.5 text-[#00205C]/70 text-sm leading-relaxed font-normal">
                  {scope.with_it}
                </p>
              </div>

              <div>
                <span className="text-xs font-bold tracking-widest uppercase text-[#4B858E]">
                  Investment Estimate
                </span>
                {scope.pricing ? (
                  <ThreeTierPricing pricing={scope.pricing} />
                ) : (
                  <>
                    <p className="mt-1.5 text-[#00205C] text-base font-semibold">
                      {formatPrice(scope.price_low)} &ndash;{" "}
                      {formatPrice(scope.price_high)}
                    </p>
                    <p className="mt-1 text-[#00205C]/70 text-xs leading-relaxed font-normal">
                      {scope.price_rationale}
                    </p>
                  </>
                )}
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-[#00205C]/[0.08]">
              {isGuest ? (
                guestAttached ? (
                  // Guest confirmation after account created
                  <div className="text-center">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[#4B858E]/10 border border-[#4B858E]/20 mx-auto mb-4">
                      <svg width="22" height="18" viewBox="0 0 22 18" fill="none">
                        <path d="M1 9l7 7L21 1" stroke="#4B858E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <p className="text-[#00205C] font-semibold mb-1">
                      Your scope is saved.
                    </p>
                    <p className="text-[#00205C]/70 text-xs leading-relaxed mb-5 font-normal">
                      Check your email to verify your account, then sign in to view it.
                    </p>
                    <a
                      href={CALENDLY_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block text-sm font-bold px-7 py-3 rounded-full border border-[#4B858E] text-[#4B858E] hover:bg-[#4B858E]/10 transition-colors"
                    >
                      Book a Call
                    </a>
                  </div>
                ) : (
                  // Guest CTA — create account or book call
                  <div>
                    <p className="text-[#00205C]/80 text-sm text-center mb-5 leading-relaxed font-normal">
                      Your scope is ready. Create an account to save it, or book a call to talk it through.
                    </p>
                    <div className="flex flex-col gap-3">
                      <button
                        onClick={() => setGuestModalOpen(true)}
                        className="w-full bg-[#4B858E] text-white font-bold py-3.5 rounded-full text-sm hover:bg-[#5a9aa4] transition-colors cursor-pointer"
                      >
                        Create an Account to Save Your Scope
                      </button>
                      <a
                        href={CALENDLY_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full text-center font-bold py-3.5 rounded-full text-sm border border-[#4B858E] text-[#4B858E] hover:bg-[#4B858E]/10 transition-colors"
                      >
                        Book a Call Instead
                      </a>
                      <p className="text-[#00205C]/70 text-xs text-center font-normal">
                        No account needed — just pick a time.
                      </p>
                    </div>
                  </div>
                )
              ) : (
                // Auth'd user submit flow
                <>
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className={`w-full font-bold py-3.5 rounded-full text-sm transition-colors ${
                      submitting
                        ? "bg-[#00205C]/[0.06] text-[#76777A] cursor-not-allowed"
                        : "bg-[#4B858E] text-white hover:bg-[#5a9aa4] cursor-pointer"
                    }`}
                  >
                    {submitting ? "Submitting..." : "Submit Your Project"}
                  </button>
                  {submitError && (
                    <p className="mt-3 text-red-400 text-xs text-center">
                      Something went wrong. Please try again.
                    </p>
                  )}
                </>
              )}
            </div>

            {/* Guest auth modal — rendered outside the card so it overlays the full screen */}
            {guestModalOpen && (
              <AuthModal
                hideTriggers
                openSignupOnMount
                guestProjectId={projectId}
                onSignupSuccess={async (newUserId) => {
                  setGuestModalOpen(false);
                  try {
                    const attachRes = await fetch("/api/attach-guest-project", {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ projectId, userId: newUserId }),
                    });
                    if (attachRes.ok) {
                      await getSupabaseBrowser()
                        .from("projects")
                        .update({ status: "submitted" })
                        .eq("id", projectId);
                      fetch("/api/notify-slack", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ projectId, type: "submission" }),
                      });
                    }
                  } catch (err) {
                    console.error("Failed to attach guest project:", err);
                  }
                  setGuestAttached(true);
                }}
              />
            )}
          </div>
        </div>
      ) : (
        // Dummy card — loading state after bar completes, scope still pending
        <div className="w-full max-w-xl">
          <div className="bg-white border border-[#00205C]/10 rounded-2xl p-8">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
              <h2 className="text-2xl font-bold text-[#00205C]">
                Project Scope
              </h2>
              <span className="text-xs font-semibold px-3 py-1.5 rounded-full border border-[#4B858E]/40 text-[#4B858E]">
                Energy Footprint: Light
              </span>
            </div>

            <div className="space-y-6">
              {[
                { label: "The Problem" },
                { label: "Without It" },
                { label: "With It" },
                { label: "Investment Estimate" },
              ].map((section) => (
                <div key={section.label}>
                  <span className="text-xs font-bold tracking-widest uppercase text-[#4B858E]">
                    {section.label}
                  </span>
                  <div className="mt-2 space-y-1.5">
                    <div className="h-3 bg-[#00205C]/[0.08] rounded-full w-full animate-pulse" />
                    <div className="h-3 bg-[#00205C]/[0.08] rounded-full w-4/5 animate-pulse" />
                    <div className="h-3 bg-[#00205C]/[0.08] rounded-full w-3/5 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-[#00205C]/[0.08]">
              <button
                disabled
                className="w-full bg-[#00205C]/[0.06] text-[#76777A] font-bold py-3.5 rounded-full text-sm cursor-not-allowed"
              >
                Assembling your scope...
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

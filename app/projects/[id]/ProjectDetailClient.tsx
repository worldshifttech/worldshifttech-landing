"use client";

import { useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabase";

// ─── Types ────────────────────────────────────────────────────────────────────

type PricingTier = { low: number; high: number; description: string };

type Scope = {
  the_problem?: string;
  without_it?: string;
  with_it?: string;
  price_low?: number;
  price_high?: number;
  price_rationale?: string;
  green_score?: "Light" | "Moderate" | "Heavy";
  green_score_reason?: string;
  pricing?: {
    mvp: PricingTier;
    polished: PricingTier;
    perfected: PricingTier;
    value_rationale: string;
  };
};

type EditAnswers = {
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
  q10_other: string;
  q11: string;
  q12: string;
};

type ProjectProps = {
  id: string;
  title: string | null;
  status: string;
  scope: Scope | null;
  answers: Record<string, unknown> | null;
  userEmail: string;
  demo_url: string | null;
};

// ─── Question data ────────────────────────────────────────────────────────────

const CUSTOM_BUILD_OPTION = "I already know what I want to build.";

const Q1_OPTIONS = [
  "Something that saves me time on repetitive tasks",
  "Something that helps me track or organize information",
  "Something that communicates with my customers or team",
  "Something that analyzes data and gives me insight",
  "Something powered by AI that thinks or decides for me",
  "I am not sure yet. Help me figure it out.",
  CUSTOM_BUILD_OPTION,
];

const Q2_OPTIONS = [
  "Just me. I run this solo.",
  "My internal team",
  "My customers or clients",
  "Both my team and my customers",
];

const Q4_OPTIONS = [
  "Hours of manual work every week",
  "Missed revenue or lost clients",
  "Errors, dropped balls, or team frustration",
  "A tool that almost works but does not really fit",
  "It falls through the cracks entirely",
];

const Q5_OPTIONS = [
  "I'd have time back to focus on higher-value work",
  "I could offer this as a service or product to my own clients",
  "I'd stop paying for something I currently pay for",
  "I'd make fewer mistakes in an area that costs me when I get it wrong",
  "I could take on more clients or projects without adding headcount",
  "My team would spend less time on repetitive work",
  "I'm not sure yet",
];

const Q7_OPTIONS = [
  "Yes. It needs to think, write, analyze, or decide.",
  "Maybe. I am open to it if it adds value.",
  "No. I just need something that stores, moves, or displays data.",
];

const Q8_OPTIONS = [
  "Just me",
  "A small team (2 to 10 people)",
  "A larger team or external users (10 plus)",
  "My customers directly",
];

const Q10_OPTIONS = [
  "ClickUp",
  "Zapier or Make",
  "Google Workspace",
  "Slack",
  "A CRM (HubSpot, Salesforce, etc.)",
  "An existing database or spreadsheet",
  "No integrations needed",
  "Other",
];

const Q11_OPTIONS = [
  "Not at all. I need this to just work.",
  "Somewhat. I can follow instructions.",
  "Pretty technical. I can handle setup and configuration.",
];

// ─── Style maps ───────────────────────────────────────────────────────────────

const GREEN_SCORE_STYLES: Record<string, { label: string; border: string; text: string }> = {
  Light: { label: "Energy Footprint: Light", border: "border-green-500/40", text: "text-green-400" },
  Moderate: { label: "Energy Footprint: Moderate", border: "border-yellow-500/40", text: "text-yellow-400" },
  Heavy: { label: "Energy Footprint: Heavy", border: "border-orange-500/40", text: "text-orange-400" },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatPrice(n: number) {
  return "$" + n.toLocaleString("en-US");
}

function answersToEdit(raw: Record<string, unknown> | null): EditAnswers {
  return {
    q1: (raw?.q1 as string) ?? "",
    custom_build_description: (raw?.custom_build_description as string) ?? "",
    q2: (raw?.q2 as string) ?? "",
    q3: (raw?.q3 as string) ?? "",
    q4: (raw?.q4 as string[]) ?? [],
    value_signals: (raw?.value_signals as string[]) ?? [],
    q6: (raw?.q6 as string) ?? "",
    q7: (raw?.q7 as string) ?? "",
    q8: (raw?.q8 as string) ?? "",
    q9: (raw?.q9 as string) ?? "",
    q10: (raw?.q10 as string[]) ?? [],
    q10_other: (raw?.q10_other as string) ?? "",
    q11: (raw?.q11 as string) ?? "",
    q12: (raw?.q12 as string) ?? "",
  };
}

// ─── Form primitives ──────────────────────────────────────────────────────────

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-bold tracking-widest uppercase text-[#4B858E] mb-3">
      {children}
    </p>
  );
}

function RadioGroup({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={`text-left px-4 py-3 rounded-xl border text-sm transition-all ${
            value === opt
              ? "border-[#4B858E] bg-[#4B858E]/10 text-[#00205C]"
              : "border-[#00205C]/[0.1] bg-white text-[#00205C]/80 hover:border-[#4B858E]/50 hover:bg-[#4B858E]/[0.04]"
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

function CheckboxGroup({
  options,
  values,
  onChange,
}: {
  options: string[];
  values: string[];
  onChange: (v: string[]) => void;
}) {
  function toggle(opt: string) {
    onChange(values.includes(opt) ? values.filter((x) => x !== opt) : [...values, opt]);
  }
  return (
    <div className="grid grid-cols-1 gap-2">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => toggle(opt)}
          className={`flex items-center gap-3 text-left px-4 py-3 rounded-xl border text-sm transition-all ${
            values.includes(opt)
              ? "border-[#4B858E] bg-[#4B858E]/10 text-[#00205C]"
              : "border-[#00205C]/[0.1] bg-white text-[#00205C]/80 hover:border-[#4B858E]/50 hover:bg-[#4B858E]/[0.04]"
          }`}
        >
          <span
            className={`flex-shrink-0 w-4 h-4 rounded border flex items-center justify-center transition-colors ${
              values.includes(opt) ? "border-[#4B858E] bg-[#4B858E]" : "border-[#00205C]/20"
            }`}
          >
            {values.includes(opt) && (
              <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                <path d="M1 3l2 2 4-4" stroke="#080C14" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </span>
          {opt}
        </button>
      ))}
    </div>
  );
}

// ─── Scope card ───────────────────────────────────────────────────────────────

function ScopeCard({ scope }: { scope: Scope }) {
  const gs = scope.green_score;
  const greenStyle = gs ? GREEN_SCORE_STYLES[gs] : null;

  return (
    <div className="bg-white border border-[#00205C]/10 rounded-2xl p-8 space-y-6">
      <div>
        <span className="text-xs font-bold tracking-widest uppercase text-[#4B858E]">
          The Problem
        </span>
        <p className="mt-1.5 text-[#00205C]/70 text-sm leading-relaxed">
          {scope.the_problem}
        </p>
      </div>

      <div>
        <span className="text-xs font-bold tracking-widest uppercase text-[#4B858E]">
          Without It
        </span>
        <p className="mt-1.5 text-[#00205C]/70 text-sm leading-relaxed">
          {scope.without_it}
        </p>
      </div>

      <div>
        <span className="text-xs font-bold tracking-widest uppercase text-[#4B858E]">
          With It
        </span>
        <p className="mt-1.5 text-[#00205C]/70 text-sm leading-relaxed">
          {scope.with_it}
        </p>
      </div>

      <div>
        <span className="text-xs font-bold tracking-widest uppercase text-[#4B858E]">
          Investment Estimate
        </span>
        {scope.pricing ? (
          <div className="mt-3 space-y-3">
            {(
              [
                ["MVP", scope.pricing.mvp],
                ["Polished", scope.pricing.polished],
                ["Perfected", scope.pricing.perfected],
              ] as [string, PricingTier][]
            ).map(([label, tier]) => (
              <div key={label}>
                <div className="flex items-baseline gap-2">
                  <span className="text-[#00205C] text-sm font-semibold">
                    {label}
                  </span>
                  <span className="text-[#00205C]/80 text-sm font-medium">
                    {formatPrice(tier.low)} &ndash; {formatPrice(tier.high)}
                  </span>
                </div>
                <p className="text-[#00205C]/70 text-xs leading-relaxed mt-0.5">
                  {tier.description}
                </p>
              </div>
            ))}
            <p className="text-[#00205C]/70 text-xs italic leading-relaxed mt-2">
              {scope.pricing.value_rationale}
            </p>
          </div>
        ) : (
          <p className="mt-1.5 text-[#00205C] text-base font-semibold">
            {formatPrice(scope.price_low ?? 0)} &ndash; {formatPrice(scope.price_high ?? 0)}
          </p>
        )}
      </div>

      {greenStyle && (
        <div className="pt-2 border-t border-[#00205C]/[0.08]">
          <span
            className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${greenStyle.border} ${greenStyle.text}`}
          >
            {greenStyle.label}
          </span>
          {scope.green_score_reason && (
            <p className="mt-2 text-[#00205C]/70 text-xs leading-relaxed">
              {scope.green_score_reason}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function ScopeSkeleton() {
  return (
    <div className="bg-white border border-[#00205C]/10 rounded-2xl p-8 space-y-6 animate-pulse">
      <div className="space-y-2">
        <div className="h-2.5 bg-[#00205C]/[0.08] rounded w-1/4" />
        <div className="h-3 bg-[#00205C]/[0.08] rounded w-full" />
        <div className="h-3 bg-[#00205C]/[0.08] rounded w-5/6" />
      </div>
      <div className="space-y-2">
        <div className="h-2.5 bg-[#00205C]/[0.08] rounded w-1/4" />
        <div className="h-3 bg-[#00205C]/[0.08] rounded w-full" />
        <div className="h-3 bg-[#00205C]/[0.08] rounded w-4/5" />
        <div className="h-3 bg-[#00205C]/[0.08] rounded w-3/4" />
      </div>
      <div className="space-y-2">
        <div className="h-2.5 bg-[#00205C]/[0.08] rounded w-1/4" />
        <div className="h-3 bg-[#00205C]/[0.08] rounded w-full" />
        <div className="h-3 bg-[#00205C]/[0.08] rounded w-2/3" />
      </div>
      <div className="space-y-2">
        <div className="h-2.5 bg-[#00205C]/[0.08] rounded w-1/3" />
        <div className="h-3 bg-[#00205C]/[0.08] rounded w-1/2" />
        <div className="h-3 bg-[#00205C]/[0.08] rounded w-1/2" />
        <div className="h-3 bg-[#00205C]/[0.08] rounded w-1/2" />
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ProjectDetailClient({ id, title, status, scope: initialScope, answers: initialAnswers, userEmail, demo_url }: ProjectProps) {
  const [editMode, setEditMode] = useState(false);
  const [editAnswers, setEditAnswers] = useState<EditAnswers>(() => answersToEdit(initialAnswers));
  const [currentScope, setCurrentScope] = useState<Scope | null>(initialScope);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [resubmitted, setResubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasScope = !!(currentScope && currentScope.the_problem);
  const canEdit = status !== "building" && status !== "live";

  async function handleRegenerate() {
    setIsRegenerating(true);
    setError(null);

    const supabase = getSupabaseBrowser();

    try {
      // 1. Save updated answers to Supabase
      const { error: patchErr } = await supabase
        .from("projects")
        .update({ answers: editAnswers })
        .eq("id", id);
      if (patchErr) throw new Error("Failed to save answers");

      // 2. Regenerate scope
      const res = await fetch("/api/generate-scope", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: id, answers: editAnswers }),
      });
      if (!res.ok) throw new Error("Scope generation failed");
      const newScope: Scope = await res.json();

      // 3. Set status to resubmitted
      await supabase
        .from("projects")
        .update({ status: "resubmitted" })
        .eq("id", id);

      // 4. Notify Slack (fire and forget)
      fetch("/api/notify-slack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "resubmission", projectTitle: title, userEmail }),
      }).catch(() => {});

      // 5. Update UI
      setCurrentScope(newScope);
      setEditMode(false);
      setResubmitted(true);
    } catch (err) {
      console.error("[RESUBMIT ERROR]", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsRegenerating(false);
    }
  }

  function handleCancel() {
    setEditAnswers(answersToEdit(initialAnswers));
    setEditMode(false);
    setError(null);
  }

  // Edit form mode
  if (editMode) {
    const showCustomBuild = editAnswers.q1 === CUSTOM_BUILD_OPTION;
    const showQ10Other = editAnswers.q10.includes("Other");

    return (
      <div className="mt-8">
        {isRegenerating ? (
          <ScopeSkeleton />
        ) : (
          <div className="bg-white border border-[#00205C]/10 rounded-2xl p-8 space-y-8">
            {error && (
              <p className="text-red-400 text-sm font-normal">
                {error}
              </p>
            )}

            {/* Q1 */}
            <div>
              <FieldLabel>What kind of tool are you looking to build?</FieldLabel>
              <RadioGroup
                options={Q1_OPTIONS}
                value={editAnswers.q1}
                onChange={(v) =>
                  setEditAnswers((a) => ({
                    ...a,
                    q1: v,
                    custom_build_description: v !== CUSTOM_BUILD_OPTION ? "" : a.custom_build_description,
                  }))
                }
              />
              {showCustomBuild && (
                <textarea
                  value={editAnswers.custom_build_description}
                  onChange={(e) => setEditAnswers((a) => ({ ...a, custom_build_description: e.target.value }))}
                  placeholder="Describe it in one to two sentences."
                  rows={3}
                  className="mt-3 w-full bg-white border border-[#00205C]/[0.12] rounded-xl px-5 py-4 text-[#00205C] text-sm placeholder:text-[#76777A] focus:outline-none focus:border-[#4B858E]/60 resize-none leading-relaxed"
                />
              )}
            </div>

            {/* Q2 */}
            <div>
              <FieldLabel>Who is this tool for?</FieldLabel>
              <RadioGroup
                options={Q2_OPTIONS}
                value={editAnswers.q2}
                onChange={(v) => setEditAnswers((a) => ({ ...a, q2: v }))}
              />
            </div>

            {/* Q3 */}
            <div>
              <FieldLabel>Describe the problem this tool needs to solve.</FieldLabel>
              <textarea
                value={editAnswers.q3}
                onChange={(e) => setEditAnswers((a) => ({ ...a, q3: e.target.value }))}
                placeholder="What is the thing that is eating your time, costing you money, or creating friction right now?"
                rows={4}
                className="w-full bg-white border border-[#00205C]/[0.12] rounded-xl px-5 py-4 text-[#00205C] text-sm placeholder:text-[#76777A] focus:outline-none focus:border-[#4B858E]/60 resize-none leading-relaxed"
              />
            </div>

            {/* Q4 */}
            <div>
              <FieldLabel>What does this problem cost you? (pick all that apply)</FieldLabel>
              <CheckboxGroup
                options={Q4_OPTIONS}
                values={editAnswers.q4}
                onChange={(v) => setEditAnswers((a) => ({ ...a, q4: v }))}
              />
            </div>

            {/* Q5 — value_signals */}
            <div>
              <FieldLabel>If this tool worked perfectly, what would it mean for your business? (pick all that apply)</FieldLabel>
              <CheckboxGroup
                options={Q5_OPTIONS}
                values={editAnswers.value_signals}
                onChange={(v) => setEditAnswers((a) => ({ ...a, value_signals: v }))}
              />
            </div>

            {/* Q6 */}
            <div>
              <FieldLabel>If this tool existed tomorrow, what would change?</FieldLabel>
              <textarea
                value={editAnswers.q6}
                onChange={(e) => setEditAnswers((a) => ({ ...a, q6: e.target.value }))}
                placeholder="Paint the picture. What does a good day look like when this is handled?"
                rows={4}
                className="w-full bg-white border border-[#00205C]/[0.12] rounded-xl px-5 py-4 text-[#00205C] text-sm placeholder:text-[#76777A] focus:outline-none focus:border-[#4B858E]/60 resize-none leading-relaxed"
              />
            </div>

            {/* Q7 */}
            <div>
              <FieldLabel>Does your tool need to use AI?</FieldLabel>
              <RadioGroup
                options={Q7_OPTIONS}
                value={editAnswers.q7}
                onChange={(v) => setEditAnswers((a) => ({ ...a, q7: v }))}
              />
            </div>

            {/* Q8 */}
            <div>
              <FieldLabel>Who else needs to use this?</FieldLabel>
              <RadioGroup
                options={Q8_OPTIONS}
                value={editAnswers.q8}
                onChange={(v) => setEditAnswers((a) => ({ ...a, q8: v }))}
              />
            </div>

            {/* Q9 */}
            <div>
              <FieldLabel>What does success look like in 90 days?</FieldLabel>
              <textarea
                value={editAnswers.q9}
                onChange={(e) => setEditAnswers((a) => ({ ...a, q9: e.target.value }))}
                placeholder="What would make you say this was worth it?"
                rows={4}
                className="w-full bg-white border border-[#00205C]/[0.12] rounded-xl px-5 py-4 text-[#00205C] text-sm placeholder:text-[#76777A] focus:outline-none focus:border-[#4B858E]/60 resize-none leading-relaxed"
              />
            </div>

            {/* Q10 */}
            <div>
              <FieldLabel>Do you have existing tools this needs to connect to? (pick all that apply)</FieldLabel>
              <CheckboxGroup
                options={Q10_OPTIONS}
                values={editAnswers.q10}
                onChange={(v) => setEditAnswers((a) => ({ ...a, q10: v }))}
              />
              {showQ10Other && (
                <input
                  type="text"
                  value={editAnswers.q10_other}
                  onChange={(e) => setEditAnswers((a) => ({ ...a, q10_other: e.target.value }))}
                  placeholder="Which other tool?"
                  className="mt-3 w-full bg-white border border-[#00205C]/[0.12] rounded-xl px-4 py-3 text-[#00205C] text-sm placeholder:text-[#76777A] focus:outline-none focus:border-[#4B858E]/60"
                />
              )}
            </div>

            {/* Q11 */}
            <div>
              <FieldLabel>How technical are you?</FieldLabel>
              <RadioGroup
                options={Q11_OPTIONS}
                value={editAnswers.q11}
                onChange={(v) => setEditAnswers((a) => ({ ...a, q11: v }))}
              />
            </div>

            {/* Q12 */}
            <div>
              <FieldLabel>Anything else Drew should know? (optional)</FieldLabel>
              <textarea
                value={editAnswers.q12}
                onChange={(e) => setEditAnswers((a) => ({ ...a, q12: e.target.value }))}
                placeholder="Constraints, timeline pressure, wild ideas. Anything goes."
                rows={3}
                className="w-full bg-white border border-[#00205C]/[0.12] rounded-xl px-5 py-4 text-[#00205C] text-sm placeholder:text-[#76777A] focus:outline-none focus:border-[#4B858E]/60 resize-none leading-relaxed"
              />
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-[#00205C]/[0.08]">
              <button
                onClick={handleRegenerate}
                className="text-sm font-bold px-7 py-3 rounded-full bg-[#4B858E] text-white hover:bg-[#5a9aa4] transition-colors"
              >
                Regenerate Scope
              </button>
              <button
                onClick={handleCancel}
                className="text-sm font-semibold px-7 py-3 rounded-full border border-[#00205C]/20 text-[#76777A] hover:border-[#00205C]/40 hover:text-[#00205C] transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Scope card view
  return (
    <div className="mt-8">
      {resubmitted && (
        <p className="mb-4 text-sm text-[#4B858E]">
          Scope updated and resubmitted.
        </p>
      )}

      {!hasScope ? (
        <div className="py-20 text-center text-[#00205C] text-sm font-normal">
          Your project scope is being prepared.
        </div>
      ) : (
        <ScopeCard scope={currentScope!} />
      )}

      {canEdit && hasScope && (
        <button
          onClick={() => setEditMode(true)}
          className="mt-6 text-sm font-semibold px-6 py-3 rounded-full border border-[#00205C]/20 text-[#76777A] hover:border-[#00205C]/40 hover:text-[#00205C] transition-colors"
        >
          Edit &amp; Resubmit
        </button>
      )}

      {status === "live" && (
        <div className="mt-6">
          {demo_url ? (
            <a
              href={demo_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-[#4B858E] text-white text-sm font-bold px-7 py-3 rounded-full hover:bg-[#5a9aa4] transition-colors"
            >
              View Your Demo &rarr;
            </a>
          ) : (
            <p className="text-[#76777A] text-sm font-normal">
              Demo coming soon
            </p>
          )}
        </div>
      )}
    </div>
  );
}

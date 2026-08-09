"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";

export type OpenItem = {
  id: string;
  message: string;
  status: string;
  created_at: string;
  milestone_title: string | null;
};

const STATUS_BADGE: Record<string, string> = {
  new: "bg-[#4B858E]/10 text-[#4B858E] border border-[#4B858E]/30",
  read: "bg-[#4B858E]/10 text-[#4B858E] border border-[#4B858E]/30",
  resolved: "bg-green-500/15 text-green-600 border border-green-500/30",
};

const STATUS_LABEL: Record<string, string> = {
  new: "Open",
  read: "Open",
  resolved: "Resolved",
};

function relativeDate(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days < 1) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

// General, always-available place to raise or track an open item that isn't tied to a
// specific milestone's "Action needed" panel — closes the gap that blocked this portal
// from replacing a client's own separate feedback/open-items site. See NOTES.md Session 73.
export default function OpenItems({
  projectId,
  slug,
  items,
}: {
  projectId: string;
  slug: string;
  items: OpenItem[];
}) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const widgetId = "cf-widget-open-items";

  // One-line change if Drew wants resolved items shown too: drop this filter.
  const openList = items.filter((i) => i.status !== "resolved");

  // Explicit Turnstile render, same pattern as FileUploads.tsx / MilestoneActionPanel.tsx —
  // its own widget id so it doesn't collide with either of those widgets on the same page.
  useEffect(() => {
    if (!scriptLoaded) return;
    const el = document.getElementById(widgetId);
    if (!el || el.childElementCount > 0 || !(window as any).turnstile) return;
    (window as any).turnstile.render(el, {
      sitekey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
      callback: (token: string) => setTurnstileToken(token),
    });
  }, [scriptLoaded, widgetId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!message.trim()) {
      setError("Type a message first.");
      return;
    }
    if (!turnstileToken) {
      setError("Please complete the verification widget.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/project-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          slug,
          milestoneId: null,
          message: message.trim(),
          turnstileToken,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Could not submit");

      setMessage("");
      setSent(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="bg-white border border-[#00205C]/10 rounded-2xl p-6">
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        strategy="afterInteractive"
        onLoad={() => setScriptLoaded(true)}
      />
      <span className="text-xs font-bold tracking-widest uppercase text-[#4B858E] block mb-4">Open Items</span>

      {openList.length === 0 ? (
        <p className="text-[#76777A] text-sm mb-6">No open items right now.</p>
      ) : (
        <div className="space-y-3 mb-6">
          {openList.map((item) => (
            <div
              key={item.id}
              className="border border-[#00205C]/[0.08] rounded-xl px-4 py-3"
            >
              <div className="flex items-start justify-between gap-3 mb-1">
                <p className="text-[#76777A] text-xs">{item.milestone_title ?? "General"}</p>
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${
                    STATUS_BADGE[item.status] ?? STATUS_BADGE.new
                  }`}
                >
                  {STATUS_LABEL[item.status] ?? item.status}
                </span>
              </div>
              <p className="text-[#00205C] text-sm">{item.message}</p>
              <p className="text-[#76777A] text-xs mt-1">{relativeDate(item.created_at)}</p>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="border-t border-[#00205C]/[0.08] pt-5 space-y-3">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Raise a new open item..."
          rows={3}
          className="w-full bg-[#F4F2EE] border border-[#00205C]/[0.1] rounded-lg px-3 py-2 text-sm text-[#00205C] focus:outline-none focus:border-[#4B858E]/60 resize-none"
        />
        {/* Turnstile widget — rendered explicitly via turnstile.render() in useEffect */}
        <div id={widgetId} />
        {error && <p className="text-red-400 text-xs">{error}</p>}
        <button
          type="submit"
          disabled={submitting || !turnstileToken}
          className="text-sm font-semibold px-6 py-2.5 rounded-full bg-[#4B858E] text-white hover:bg-[#5a9aa4] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {submitting ? "Sending..." : "Submit"}
        </button>
        {sent && <p className="text-[#4B858E] text-xs font-medium">Sent. Drew will follow up.</p>}
      </form>
    </div>
  );
}

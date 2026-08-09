"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { getSupabaseBrowser } from "@/lib/supabase";

export type OpenItem = {
  id: string;
  message: string;
  status: string;
  created_at: string;
  milestone_title: string | null;
  attached_file: { file_name: string; downloadUrl: string | null } | null;
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

const MAX_FILE_SIZE = 25 * 1024 * 1024;

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
//
// Session 78 — a ticket and an attachment used to be two disconnected actions (this form,
// and a completely separate Files section with no way to say "this file is about that
// message"). An open item can now carry one optional file, submitted together as a single
// action: uploads through the same signed-URL flow FileUploads.tsx already uses, then links
// the resulting project_files row to this feedback row via attached_file_id. The standalone
// Files section is unchanged and still exists — it's also where Drew sends files down to the
// client, not just where the client sends files up, so it isn't redundant with this.
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
  const fileInputRef = useRef<HTMLInputElement>(null);
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
    if (!el || el.childElementCount > 0 || !window.turnstile) return;
    window.turnstile.render(el, {
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

    const file = fileInputRef.current?.files?.[0];
    if (file && file.size > MAX_FILE_SIZE) {
      setError("Files are limited to 25MB.");
      return;
    }

    setSubmitting(true);
    try {
      let attachedFileId: string | undefined;

      if (file) {
        const urlRes = await fetch("/api/project-files/upload-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            projectId,
            slug,
            fileName: file.name,
            fileSize: file.size,
            uploadedBy: "client",
            turnstileToken,
          }),
        });
        const urlData = await urlRes.json();
        if (!urlRes.ok) throw new Error(urlData.error ?? "Could not start upload");

        const supabase = getSupabaseBrowser();
        const { error: uploadError } = await supabase.storage
          .from("project-files")
          .uploadToSignedUrl(urlData.path, urlData.token, file);
        if (uploadError) throw new Error(uploadError.message);

        const confirmRes = await fetch("/api/project-files", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            projectId,
            slug,
            storagePath: urlData.path,
            fileName: file.name,
            uploadedBy: "client",
          }),
        });
        const confirmData = await confirmRes.json().catch(() => ({}));
        if (!confirmRes.ok) throw new Error(confirmData.error ?? "Could not save the attached file");
        attachedFileId = confirmData.id;
      }

      const res = await fetch("/api/project-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          slug,
          milestoneId: null,
          message: message.trim(),
          turnstileToken,
          attachedFileId,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Could not submit");

      setMessage("");
      if (fileInputRef.current) fileInputRef.current.value = "";
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
              {item.attached_file && item.attached_file.downloadUrl && (
                <a
                  href={item.attached_file.downloadUrl}
                  className="inline-block mt-2 text-xs font-semibold px-3 py-1 rounded-full border border-[#4B858E] text-[#4B858E] hover:bg-[#4B858E]/10 transition-colors"
                >
                  {item.attached_file.file_name}
                </a>
              )}
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
        <div>
          <input ref={fileInputRef} type="file" className="block w-full text-sm text-[#00205C]" />
          <p className="text-[#76777A] text-xs mt-1">Attach a file if it&apos;s relevant — optional.</p>
        </div>
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

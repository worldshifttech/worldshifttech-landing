"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { getSupabaseBrowser } from "@/lib/supabase";
import {
  ACCEPTED_CONTEXT_FILE_ACCEPT_ATTR,
  ACCEPTED_CONTEXT_FILE_HELP_TEXT,
  isAcceptedContextFileType,
} from "@/lib/accepted-context-file-types";

const MAX_FILE_SIZE = 25 * 1024 * 1024;

// The one place a client submits anything on this page — a message, a file, or both, as a
// single action. Used to be two separate forms (OpenItems.tsx's ticket form and
// FileUploads.tsx's standalone upload form), each with its own Turnstile widget on the same
// page. Consolidating removes that duplication — an attachment only ever arrives through
// this submission now, so the Files list itself needs no upload UI or bot-check of its own.
export default function SubmitFeedback({
  projectId,
  slug,
}: {
  projectId: string;
  slug: string;
}) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const widgetId = "cf-widget-submit-feedback";

  // Explicit Turnstile render, same pattern as MilestoneActionPanel.tsx — its own widget id
  // so it doesn't collide with that one when both are on the page.
  useEffect(() => {
    if (!scriptLoaded) return;
    const el = document.getElementById(widgetId);
    if (!el || el.childElementCount > 0 || !window.turnstile) return;
    window.turnstile.render(el, {
      sitekey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
      callback: (token: string) => setTurnstileToken(token),
    });
  }, [scriptLoaded]);

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
    if (file && !isAcceptedContextFileType(file)) {
      setError(`That file type isn't supported. ${ACCEPTED_CONTEXT_FILE_HELP_TEXT}`);
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

      // /api/project-feedback skips re-verifying turnstileToken when a valid attachedFileId
      // is present — the upload-url call above already spent this token, and Turnstile
      // tokens are single-use. Still passed through for the text-only path, which does
      // verify it. See NOTES.md for the live bug this fixed.
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
      <span className="text-xs font-bold tracking-widest uppercase text-[#4B858E] block mb-4">
        Submit Feedback/Files
      </span>

      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Raise a new open item, ask a question, or leave feedback..."
          rows={3}
          className="w-full bg-[#F4F2EE] border border-[#00205C]/[0.1] rounded-lg px-3 py-2 text-sm text-[#00205C] focus:outline-none focus:border-[#4B858E]/60 resize-none"
        />
        <div>
          <label className="block text-[#76777A] text-xs mb-2">
            Attach a file if it&apos;s relevant — optional
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_CONTEXT_FILE_ACCEPT_ATTR}
            className="block w-full text-sm text-[#00205C] cursor-pointer file:cursor-pointer file:mr-4 file:py-2.5 file:px-5 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#4B858E] file:text-white hover:file:bg-[#5a9aa4] file:transition-colors"
          />
          <p className="text-[#76777A] text-xs mt-1.5">{ACCEPTED_CONTEXT_FILE_HELP_TEXT}</p>
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

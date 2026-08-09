"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { getSupabaseBrowser } from "@/lib/supabase";

type ProjectFile = {
  id: string;
  file_name: string;
  uploaded_by: "client" | "drew";
  note: string | null;
  created_at: string;
  downloadUrl: string | null;
  milestone_id: string | null;
};

const MAX_FILE_SIZE = 25 * 1024 * 1024;

// Collapsed-by-default panel for a milestone whose action_owner is "client" —
// lets the client answer with text and/or upload a file scoped to this
// milestone, without ever touching the milestone's own status/action_owner.
export default function MilestoneActionPanel({
  projectId,
  slug,
  milestoneId,
  actionNote,
  files,
}: {
  projectId: string;
  slug: string;
  milestoneId: string;
  actionNote: string | null;
  files: ProjectFile[];
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [note, setNote] = useState("");
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [submittingAnswer, setSubmittingAnswer] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [answerSent, setAnswerSent] = useState(false);
  const [uploadSent, setUploadSent] = useState(false);
  const [error, setError] = useState("");

  const widgetId = `cf-widget-milestone-${milestoneId}`;
  const scopedFiles = files.filter((f) => f.milestone_id === milestoneId);

  // Explicit Turnstile render, same pattern as FileUploads.tsx — only once the
  // panel is actually expanded, one widget shared by both submission paths.
  useEffect(() => {
    if (!open || !scriptLoaded) return;
    const el = document.getElementById(widgetId);
    if (!el || el.childElementCount > 0 || !window.turnstile) return;
    window.turnstile.render(el, {
      sitekey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
      callback: (token: string) => setTurnstileToken(token),
    });
  }, [open, scriptLoaded, widgetId]);

  async function handleSubmitAnswer(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!message.trim()) {
      setError("Type an answer first.");
      return;
    }
    if (!turnstileToken) {
      setError("Please complete the verification widget.");
      return;
    }

    setSubmittingAnswer(true);
    try {
      const res = await fetch("/api/project-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          slug,
          milestoneId,
          message: message.trim(),
          turnstileToken,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Could not submit answer");

      setMessage("");
      setAnswerSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmittingAnswer(false);
    }
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      setError("Choose a file first.");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError("Files are limited to 25MB.");
      return;
    }
    if (!turnstileToken) {
      setError("Please complete the verification widget.");
      return;
    }

    setUploading(true);
    try {
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
          milestoneId,
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
          note: note.trim() || undefined,
          milestoneId,
        }),
      });
      if (!confirmRes.ok) {
        const confirmData = await confirmRes.json().catch(() => ({}));
        throw new Error(confirmData.error ?? "Could not save file");
      }

      setNote("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      setUploadSent(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="mt-3 pt-3 border-t border-[#00205C]/[0.08]">
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        strategy="afterInteractive"
        onLoad={() => setScriptLoaded(true)}
      />
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="text-xs font-semibold px-3 py-1.5 rounded-full border border-[#4B858E] text-[#4B858E] hover:bg-[#4B858E]/10 transition-colors"
      >
        {open ? "Hide" : "Action needed"}
      </button>

      {open && (
        <div className="mt-3 space-y-4">
          {actionNote && <p className="text-[#00205C] text-sm">{actionNote}</p>}

          <form onSubmit={handleSubmitAnswer} className="space-y-2">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your answer"
              rows={3}
              className="w-full bg-[#F4F2EE] border border-[#00205C]/[0.1] rounded-lg px-3 py-2 text-sm text-[#00205C] focus:outline-none focus:border-[#4B858E]/60 resize-none"
            />
            <button
              type="submit"
              disabled={submittingAnswer || !turnstileToken}
              className="text-xs font-semibold px-4 py-2 rounded-full bg-[#4B858E] text-white hover:bg-[#5a9aa4] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {submittingAnswer ? "Sending..." : "Submit Answer"}
            </button>
            {answerSent && <p className="text-[#4B858E] text-xs font-medium">Sent. Drew will follow up.</p>}
          </form>

          <div className="pt-3 border-t border-[#00205C]/[0.08] space-y-2">
            {scopedFiles.length > 0 && (
              <div className="space-y-2 mb-1">
                {scopedFiles.map((f) => (
                  <div key={f.id} className="flex items-center justify-between gap-3 text-xs">
                    <span className="text-[#00205C] truncate">{f.file_name}</span>
                    {f.downloadUrl && (
                      <a href={f.downloadUrl} className="text-[#4B858E] font-semibold flex-shrink-0">
                        Download
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
            <form onSubmit={handleUpload} className="space-y-2">
              <input ref={fileInputRef} type="file" className="block w-full text-sm text-[#00205C]" />
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Optional note"
                className="w-full bg-[#F4F2EE] border border-[#00205C]/[0.1] rounded-lg px-3 py-2 text-sm text-[#00205C] focus:outline-none focus:border-[#4B858E]/60"
              />
              <button
                type="submit"
                disabled={uploading || !turnstileToken}
                className="text-xs font-semibold px-4 py-2 rounded-full border border-[#4B858E] text-[#4B858E] hover:bg-[#4B858E]/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {uploading ? "Uploading..." : "Upload File"}
              </button>
              {uploadSent && <p className="text-[#4B858E] text-xs font-medium">Sent. Drew will follow up.</p>}
            </form>
          </div>

          {/* Turnstile widget — rendered explicitly via turnstile.render() in useEffect, shared by both forms above */}
          <div id={widgetId} />
          {error && <p className="text-red-400 text-xs">{error}</p>}
        </div>
      )}
    </div>
  );
}

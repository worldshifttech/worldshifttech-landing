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

export default function FileUploads({
  projectId,
  slug,
  files,
}: {
  projectId: string;
  slug: string;
  files: ProjectFile[];
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [note, setNote] = useState("");
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  // Explicit Turnstile render, same pattern as app/meet/page.tsx.
  useEffect(() => {
    if (!scriptLoaded) return;
    const el = document.getElementById("cf-widget-files");
    if (!el || !(window as any).turnstile) return;
    (window as any).turnstile.render(el, {
      sitekey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
      callback: (token: string) => setTurnstileToken(token),
    });
  }, [scriptLoaded]);

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
        }),
      });
      if (!confirmRes.ok) {
        const confirmData = await confirmRes.json().catch(() => ({}));
        throw new Error(confirmData.error ?? "Could not save file");
      }

      setNote("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="bg-white border border-[#00205C]/10 rounded-2xl p-6">
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        strategy="afterInteractive"
        onLoad={() => setScriptLoaded(true)}
      />
      <span className="text-xs font-bold tracking-widest uppercase text-[#4B858E] block mb-4">Files</span>

      {files.length === 0 ? (
        <p className="text-[#76777A] text-sm mb-6">No files yet.</p>
      ) : (
        <div className="space-y-3 mb-6">
          {files.map((f) => (
            <div
              key={f.id}
              className="flex items-start justify-between gap-3 border border-[#00205C]/[0.08] rounded-xl px-4 py-3"
            >
              <div className="min-w-0">
                <p className="text-[#00205C] text-sm font-medium truncate">{f.file_name}</p>
                {f.note && <p className="text-[#76777A] text-xs mt-0.5">{f.note}</p>}
                <p className="text-[#76777A] text-xs mt-0.5">
                  {f.uploaded_by === "drew" ? "World Shift Technologies" : "You"} &middot; {relativeDate(f.created_at)}
                </p>
              </div>
              {f.downloadUrl && (
                <a
                  href={f.downloadUrl}
                  className="flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full border border-[#4B858E] text-[#4B858E] hover:bg-[#4B858E]/10 transition-colors"
                >
                  Download
                </a>
              )}
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleUpload} className="border-t border-[#00205C]/[0.08] pt-5 space-y-3">
        <input ref={fileInputRef} type="file" className="block w-full text-sm text-[#00205C]" />
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Optional note"
          className="w-full bg-[#F4F2EE] border border-[#00205C]/[0.1] rounded-lg px-3 py-2 text-sm text-[#00205C] focus:outline-none focus:border-[#4B858E]/60"
        />
        {/* Turnstile widget — rendered explicitly via turnstile.render() in useEffect */}
        <div id="cf-widget-files" />
        {error && <p className="text-red-400 text-xs">{error}</p>}
        <button
          type="submit"
          disabled={uploading || !turnstileToken}
          className="text-sm font-semibold px-6 py-2.5 rounded-full bg-[#4B858E] text-white hover:bg-[#5a9aa4] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {uploading ? "Uploading..." : "Upload File"}
        </button>
      </form>
    </div>
  );
}

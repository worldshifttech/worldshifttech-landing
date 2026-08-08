"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowser } from "@/lib/supabase";

type ProjectFile = {
  id: string;
  file_name: string;
  uploaded_by: "client" | "drew";
  note: string | null;
  created_at: string;
  downloadUrl: string | null;
  milestoneTitle: string | null;
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
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function getToken() {
    const supabase = getSupabaseBrowser();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session?.access_token;
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

    setUploading(true);
    try {
      const token = await getToken();
      const urlRes = await fetch("/api/project-files/upload-url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          projectId,
          slug,
          fileName: file.name,
          fileSize: file.size,
          uploadedBy: "drew",
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
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          projectId,
          slug,
          storagePath: urlData.path,
          fileName: file.name,
          uploadedBy: "drew",
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

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      const token = await getToken();
      await fetch(`/api/project-files/${id}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      router.refresh();
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="bg-white border border-[#00205C]/10 rounded-2xl p-6">
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
                {f.milestoneTitle && <p className="text-[#4B858E] text-xs mt-0.5">for: {f.milestoneTitle}</p>}
                <p className="text-[#76777A] text-xs mt-0.5">
                  {f.uploaded_by === "drew" ? "You" : "Client"} &middot; {relativeDate(f.created_at)}
                </p>
              </div>
              <div className="flex-shrink-0 flex items-center gap-2">
                {f.downloadUrl && (
                  <a
                    href={f.downloadUrl}
                    className="text-xs font-semibold px-3 py-1.5 rounded-full border border-[#4B858E] text-[#4B858E] hover:bg-[#4B858E]/10 transition-colors"
                  >
                    Download
                  </a>
                )}
                <button
                  onClick={() => handleDelete(f.id)}
                  disabled={deletingId === f.id}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-[#76777A] hover:text-red-400 hover:bg-red-400/10 transition-colors disabled:opacity-50"
                  aria-label="Delete file"
                >
                  &times;
                </button>
              </div>
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
        {error && <p className="text-red-400 text-xs">{error}</p>}
        <button
          type="submit"
          disabled={uploading}
          className="text-sm font-semibold px-6 py-2.5 rounded-full bg-[#4B858E] text-white hover:bg-[#5a9aa4] disabled:opacity-50 transition-colors"
        >
          {uploading ? "Uploading..." : "Upload File"}
        </button>
      </form>
    </div>
  );
}

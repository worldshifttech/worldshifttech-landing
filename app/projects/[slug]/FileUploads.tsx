"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type ProjectFile = {
  id: string;
  file_name: string;
  uploaded_by: "client" | "drew";
  note: string | null;
  created_at: string;
  downloadUrl: string | null;
};

function relativeDate(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days < 1) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

// Read-only list of files, plus deletion for the client's own uploads only — Drew's own
// uploads (deliverables sent down) aren't deletable from here, only from the admin side.
// The upload action itself moved to SubmitFeedback.tsx — a file only ever arrives here as
// part of a feedback submission now, not through a standalone upload widget on this page,
// so there's no Turnstile here anymore either.
export default function FileUploads({
  slug,
  files,
}: {
  slug: string;
  files: ProjectFile[];
}) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function handleDelete(id: string) {
    setError("");
    setDeletingId(id);
    try {
      const res = await fetch(`/api/project-files/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Could not delete file");
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="bg-white border border-[#00205C]/10 rounded-2xl p-6">
      <span className="text-xs font-bold tracking-widest uppercase text-[#4B858E] block mb-4">Files</span>

      {files.length === 0 ? (
        <p className="text-[#76777A] text-sm">No files yet.</p>
      ) : (
        <div className="space-y-3">
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
              <div className="flex-shrink-0 flex items-center gap-2">
                {f.downloadUrl && (
                  <a
                    href={f.downloadUrl}
                    className="text-xs font-semibold px-3 py-1.5 rounded-full border border-[#4B858E] text-[#4B858E] hover:bg-[#4B858E]/10 transition-colors"
                  >
                    Download
                  </a>
                )}
                {f.uploaded_by === "client" && (
                  <button
                    onClick={() => handleDelete(f.id)}
                    disabled={deletingId === f.id}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-[#76777A] hover:text-red-400 hover:bg-red-400/10 transition-colors disabled:opacity-50"
                    aria-label="Delete file"
                  >
                    &times;
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      {error && <p className="text-red-400 text-xs mt-3">{error}</p>}
    </div>
  );
}

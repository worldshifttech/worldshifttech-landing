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
  updated_at: string | null;
  milestone_title: string | null;
  attached_files: { file_name: string; downloadUrl: string | null }[];
};

const MAX_FILE_SIZE = 25 * 1024 * 1024;

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

// One row's inline edit/delete controls. A separate component so each item owns its own
// edit/submitting/Turnstile state, same reasoning as MilestoneActionPanel owning its own
// state per milestone rather than threading a map of per-id state through the parent list.
function OpenItemRow({
  item,
  projectId,
  slug,
}: {
  item: OpenItem;
  projectId: string;
  slug: string;
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editing, setEditing] = useState(false);
  const [editMessage, setEditMessage] = useState(item.message);
  const [hasFile, setHasFile] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const widgetId = `cf-widget-edit-${item.id}`;

  // Only rendered (and only required) once a file is actually chosen — a pure text edit
  // needs no token, since the new PATCH route itself never checks Turnstile.
  useEffect(() => {
    if (!editing || !hasFile || !scriptLoaded) return;
    const el = document.getElementById(widgetId);
    if (!el || el.childElementCount > 0 || !window.turnstile) return;
    window.turnstile.render(el, {
      sitekey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
      callback: (token: string) => setTurnstileToken(token),
    });
  }, [editing, hasFile, scriptLoaded, widgetId]);

  function startEdit() {
    setEditMessage(item.message);
    setHasFile(false);
    setTurnstileToken("");
    setError("");
    setEditing(true);
  }

  function cancelEdit() {
    setEditing(false);
    setHasFile(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!editMessage.trim()) {
      setError("Message cannot be empty.");
      return;
    }

    const file = fileInputRef.current?.files?.[0];
    if (file && file.size > MAX_FILE_SIZE) {
      setError("Files are limited to 25MB.");
      return;
    }
    if (file && !turnstileToken) {
      setError("Please complete the verification widget.");
      return;
    }

    setSaving(true);
    try {
      const patchRes = await fetch(`/api/project-feedback/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, message: editMessage.trim() }),
      });
      const patchData = await patchRes.json().catch(() => ({}));
      if (!patchRes.ok) throw new Error(patchData.error ?? "Could not save changes");

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
            feedbackId: item.id,
          }),
        });
        const confirmData = await confirmRes.json().catch(() => ({}));
        if (!confirmRes.ok) throw new Error(confirmData.error ?? "Could not save the attached file");
      }

      setEditing(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm("Delete this item? This can't be undone.")) return;
    setDeleting(true);
    setError("");
    try {
      const res = await fetch(`/api/project-feedback/${item.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Could not delete item");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setDeleting(false);
    }
  }

  return (
    <div className="border border-[#00205C]/[0.08] rounded-xl px-4 py-3">
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        strategy="afterInteractive"
        onLoad={() => setScriptLoaded(true)}
      />
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

      {editing ? (
        <form onSubmit={handleSaveEdit} className="space-y-2 mt-1">
          <textarea
            value={editMessage}
            onChange={(e) => setEditMessage(e.target.value)}
            rows={3}
            className="w-full bg-[#F4F2EE] border border-[#00205C]/[0.1] rounded-lg px-3 py-2 text-sm text-[#00205C] focus:outline-none focus:border-[#4B858E]/60 resize-none"
          />
          <input
            ref={fileInputRef}
            type="file"
            onChange={(e) => setHasFile(!!e.target.files?.[0])}
            className="block w-full text-sm text-[#00205C] cursor-pointer file:cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-[#4B858E] file:text-white hover:file:bg-[#5a9aa4] file:transition-colors"
          />
          {hasFile && <div id={widgetId} />}
          {error && <p className="text-red-400 text-xs">{error}</p>}
          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={saving || (hasFile && !turnstileToken)}
              className="text-xs font-semibold px-4 py-2 rounded-full bg-[#4B858E] text-white hover:bg-[#5a9aa4] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? "Saving..." : "Save"}
            </button>
            <button
              type="button"
              onClick={cancelEdit}
              disabled={saving}
              className="text-xs font-semibold px-4 py-2 rounded-full border border-[#00205C]/15 text-[#76777A] hover:bg-[#00205C]/[0.05] transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <>
          <p className="text-[#00205C] text-sm">{item.message}</p>
          {item.attached_files.map((file, i) =>
            file.downloadUrl ? (
              <a
                key={i}
                href={file.downloadUrl}
                className="inline-block mt-2 mr-2 text-xs font-semibold px-3 py-1 rounded-full border border-[#4B858E] text-[#4B858E] hover:bg-[#4B858E]/10 transition-colors"
              >
                {file.file_name}
              </a>
            ) : null
          )}
          <div className="flex items-center justify-between gap-3 mt-1">
            <p className="text-[#76777A] text-xs">
              {relativeDate(item.created_at)}
              {item.updated_at && " (edited)"}
            </p>
            {item.status !== "resolved" && (
              <div className="flex items-center gap-3 flex-shrink-0">
                <button
                  type="button"
                  onClick={startEdit}
                  className="text-xs font-semibold text-[#4B858E] hover:underline"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="text-xs font-semibold text-red-500 hover:underline disabled:opacity-50"
                >
                  {deleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            )}
          </div>
          {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
        </>
      )}
    </div>
  );
}

// List of open items, each with inline edit/delete for the client who submitted it (there's
// no client-account system, so "theirs" means "client-submitted," the same trust boundary
// the client-side file-delete route already uses). Client component now, was server-rendered
// markup before this session — needed for the inline edit/delete interactivity.
export default function OpenItems({
  items,
  projectId,
  slug,
}: {
  items: OpenItem[];
  projectId: string;
  slug: string;
}) {
  // One-line change if Drew wants resolved items shown too: drop this filter.
  const openList = items.filter((i) => i.status !== "resolved");

  return (
    <div className="bg-white border border-[#00205C]/10 rounded-2xl p-6">
      <span className="text-xs font-bold tracking-widest uppercase text-[#4B858E] block mb-4">Open Items</span>

      {openList.length === 0 ? (
        <p className="text-[#76777A] text-sm">No open items right now.</p>
      ) : (
        <div className="space-y-3">
          {openList.map((item) => (
            <OpenItemRow key={item.id} item={item} projectId={projectId} slug={slug} />
          ))}
        </div>
      )}
    </div>
  );
}

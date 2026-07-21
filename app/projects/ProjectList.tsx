"use client";

import { useState } from "react";
import Link from "next/link";
import { getSupabaseBrowser } from "@/lib/supabase";

export type Project = {
  id: string;
  title: string | null;
  status: string;
  created_at: string;
  scope?: { green_score?: string } | null;
  demo_url?: string | null;
};

function relativeDate(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  const days = Math.floor(diff / 86400);
  if (days === 1) return "1 day ago";
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  if (months === 1) return "1 month ago";
  return `${months} months ago`;
}

const GREEN_BADGE_STYLES: Record<string, string> = {
  Light: "text-green-400 border-green-500/40",
  Moderate: "text-yellow-400 border-yellow-500/40",
  Heavy: "text-orange-400 border-orange-500/40",
};

const STATUS_STYLES: Record<string, { label: string; classes: string }> = {
  draft: {
    label: "Draft",
    classes: "bg-white text-[#76777A] border border-[#00205C]/15",
  },
  scoped: {
    label: "Scoped",
    classes: "bg-[#4B858E]/10 text-[#4B858E] border border-[#4B858E]/30",
  },
  submitted: {
    label: "Submitted",
    classes: "bg-[#4B858E] text-white border border-[#4B858E]",
  },
  reviewed: {
    label: "In Review",
    classes: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
  },
  building: {
    label: "Building",
    classes: "bg-orange-500/20 text-orange-400 border border-orange-500/30",
  },
  approved: {
    label: "Approved",
    classes: "bg-green-600/20 text-green-400 border border-green-600/30",
  },
  live: {
    label: "Live",
    classes: "bg-green-400/20 text-green-300 border border-green-400/30",
  },
  resubmitted: {
    label: "Resubmitted",
    classes: "bg-purple-500/20 text-purple-400 border border-purple-500/30",
  },
};

export default function ProjectList({
  initialProjects,
}: {
  initialProjects: Project[];
}) {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [errorId, setErrorId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    setDeletingId(id);
    setErrorId(null);
    const supabase = getSupabaseBrowser();
    const { error } = await supabase.from("projects").delete().eq("id", id);
    if (error) {
      setDeletingId(null);
      setErrorId(id);
      return;
    }
    setProjects((prev) => prev.filter((p) => p.id !== id));
    setConfirmId(null);
    setDeletingId(null);
  }

  function cancelConfirm(id: string) {
    if (confirmId === id) setConfirmId(null);
    if (errorId === id) setErrorId(null);
  }

  if (projects.length === 0) {
    return (
      <div className="border border-dashed border-[#00205C]/15 rounded-2xl px-8 py-16 text-center bg-white">
        <div className="w-12 h-12 rounded-full bg-[#4B858E]/10 border border-[#4B858E]/20 flex items-center justify-center mx-auto mb-6">
          <svg
            width="22"
            height="22"
            viewBox="0 0 22 22"
            fill="none"
            className="text-[#4B858E]"
          >
            <path
              d="M11 4v14M4 11h14"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <p className="text-[#00205C] text-sm mb-6 font-normal">
          No projects yet
        </p>
        <Link
          href="/projects/new"
          className="inline-block bg-[#4B858E] text-white text-sm font-bold px-7 py-3 rounded-full hover:bg-[#5a9aa4] transition-colors"
        >
          Start a New Project
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {projects.map((project) => {
        const isConfirming = confirmId === project.id;
        const isDeleting = deletingId === project.id;
        const hasError = errorId === project.id;
        const statusKey = project.status ?? "draft";
        const statusStyle = STATUS_STYLES[statusKey] ?? STATUS_STYLES.draft;

        return (
          <Link
            key={project.id}
            href={`/projects/${project.id}`}
            className="block bg-white border border-[#00205C]/[0.08] rounded-xl px-6 py-5 hover:border-[#00205C]/[0.15] hover:bg-[#F4F2EE] transition-all"
          >
            {isConfirming ? (
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <span className="text-[#00205C]/80 text-sm font-normal">
                  Delete this project?
                </span>
                <button
                  onClick={(e) => { e.preventDefault(); handleDelete(project.id); }}
                  disabled={isDeleting}
                  className={`text-xs font-bold px-4 py-2.5 rounded-full transition-colors ${
                    isDeleting
                      ? "bg-[#00205C]/[0.08] text-[#76777A] cursor-not-allowed"
                      : "bg-red-500/80 text-white hover:bg-red-500 cursor-pointer"
                  }`}
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </button>
                <button
                  onClick={(e) => { e.preventDefault(); cancelConfirm(project.id); }}
                  disabled={isDeleting}
                  className="text-xs text-[#76777A] hover:text-[#00205C] transition-colors px-2 py-2.5"
                >
                  Cancel
                </button>
              </div>
            ) : (() => {
                const gs = project.scope?.green_score;
                const greenBadgeStyle = gs ? GREEN_BADGE_STYLES[gs] : null;
                return (
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                    {/* Title row — no truncate on mobile, truncate on desktop */}
                    <div className="min-w-0">
                      <p className="text-[#00205C] font-semibold text-sm sm:truncate">
                        {project.title ?? "Untitled Project"}
                      </p>
                      {/* Demo link desktop only (mobile version below) */}
                      {project.status === "live" && (
                        project.demo_url ? (
                          <a
                            href={project.demo_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="hidden sm:inline-block text-[#4B858E] text-xs hover:underline mt-0.5"
                          >
                            View Demo &rarr;
                          </a>
                        ) : (
                          <span className="hidden sm:block text-[#76777A] text-xs mt-0.5 font-normal">
                            Demo coming soon
                          </span>
                        )
                      )}
                      {/* Date desktop only (mobile version below) */}
                      <p className="hidden sm:block text-[#76777A] text-xs mt-0.5 font-normal">
                        {relativeDate(project.created_at)}
                      </p>
                      {hasError && (
                        <p className="text-red-400 text-xs mt-1 font-normal">
                          Delete failed. Try again.
                        </p>
                      )}
                    </div>

                    {/* Mobile-only stacked section */}
                    <div className="flex flex-col gap-2 sm:hidden">
                      <span
                        className={`text-xs font-semibold px-3 py-1 rounded-full self-start ${statusStyle.classes}`}
                      >
                        {statusStyle.label}
                      </span>
                      {greenBadgeStyle && (
                        <span
                          className={`text-xs font-semibold px-3 py-1 rounded-full border self-start ${greenBadgeStyle}`}
                        >
                          {gs}
                        </span>
                      )}
                      <p className="text-[#76777A] text-xs font-normal">
                        {relativeDate(project.created_at)}
                      </p>
                      {project.status === "live" && (
                        project.demo_url ? (
                          <a
                            href={project.demo_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-[#4B858E] text-xs hover:underline min-h-[44px] flex items-center self-start"
                          >
                            View Demo &rarr;
                          </a>
                        ) : (
                          <span className="text-[#76777A] text-xs font-normal">
                            Demo coming soon
                          </span>
                        )
                      )}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          setConfirmId(project.id);
                          setErrorId(null);
                        }}
                        className="w-11 h-11 flex items-center justify-center rounded-full text-[#76777A] hover:text-[#00205C] hover:bg-[#00205C]/[0.08] transition-all text-base leading-none self-start"
                        aria-label="Delete project"
                      >
                        ×
                      </button>
                    </div>

                    {/* Desktop-only right column */}
                    <div className="hidden sm:flex items-center gap-3 flex-shrink-0">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          setConfirmId(project.id);
                          setErrorId(null);
                        }}
                        className="w-11 h-11 flex items-center justify-center rounded-full text-[#76777A] hover:text-[#00205C] hover:bg-[#00205C]/[0.08] transition-all text-base leading-none"
                        aria-label="Delete project"
                      >
                        ×
                      </button>
                      <span
                        className={`text-xs font-semibold px-3 py-1 rounded-full ${statusStyle.classes}`}
                      >
                        {statusStyle.label}
                      </span>
                      {greenBadgeStyle && (
                        <span
                          className={`text-xs font-semibold px-3 py-1 rounded-full border ${greenBadgeStyle}`}
                        >
                          {gs}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })()}
          </Link>
        );
      })}
    </div>
  );
}

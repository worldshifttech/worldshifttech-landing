// Shared constants for file uploads that may end up as Claude Code context — a client's
// feedback attachment (project-files bucket, threaded into planning-session context per
// Session 83) or an admin-attached planning context file (session-context-files bucket,
// Session 80). Scoped to what Claude Code's Read tool can actually make use of — images
// (vision) and plain text/PDF — not every file type the underlying storage buckets would
// technically accept. Word/Excel/PowerPoint, video, and audio all upload fine as
// far as storage is concerned, they just aren't usefully readable once attached, so
// they're excluded here rather than let through and silently ignored later.

export const ACCEPTED_CONTEXT_FILE_EXTENSIONS = [
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".webp",
  ".pdf",
  ".txt",
  ".md",
  ".csv",
  ".json",
];

// Mixed extensions + MIME types on purpose — browsers vary in which they honor for the
// native file picker's default filter. This is a UX hint on the picker itself, not an
// enforced boundary — isAcceptedContextFileType below is the actual check applied after
// selection, so a picker that ignores `accept` (or a user who overrides it) still gets
// caught.
export const ACCEPTED_CONTEXT_FILE_ACCEPT_ATTR =
  "image/*,application/pdf,.txt,.md,.csv,.json,text/plain,text/csv,application/json";

export const ACCEPTED_CONTEXT_FILE_HELP_TEXT =
  "Accepted: images (PNG, JPG, GIF, WebP), PDF, and text files (TXT, MD, CSV, JSON).";

export function isAcceptedContextFileType(file: File): boolean {
  const name = file.name.toLowerCase();
  return ACCEPTED_CONTEXT_FILE_EXTENSIONS.some((ext) => name.endsWith(ext));
}

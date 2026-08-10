// Shared constants/helpers for admin-attached planning-session context files (Session 80).
// Same shape as lib/project-files.ts, but a separate bucket — this is extra context an
// admin attaches to a dispatched orchestrator session, not a client project file. Every
// read and write goes through the service-role client via signed URLs, same as that bucket.

import crypto from "crypto";

export const BUCKET = "session-context-files";
export const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB — matches the bucket's file_size_limit

export function buildStoragePath(pendingKey: string, fileName: string): string {
  return `${pendingKey}/${crypto.randomUUID()}-${fileName}`;
}

// Shared constants/helpers for the per-project file exchange (Session 47).
// Files live in a private Supabase Storage bucket ("project-files"). Every
// read and write goes through the service-role client via signed URLs, so
// there are no storage.objects RLS policies to maintain.

import crypto from "crypto";

export const BUCKET = "project-files";
export const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB — matches the bucket's file_size_limit

export function buildStoragePath(projectId: string, fileName: string): string {
  return `${projectId}/${crypto.randomUUID()}-${fileName}`;
}

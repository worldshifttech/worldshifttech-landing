// A Supabase client for a *different* project than this app's own — used to read/resolve
// a target repo's feedback backlog directly, using credentials stored on its `repos` row.
// Mirrors lib/supabase.ts's getSupabase(), just parameterized per-repo instead of reading
// this project's fixed env vars. Never cached/module-level like getSupabase() is, since the
// url/key differ per call.

import { createClient, SupabaseClient } from "@supabase/supabase-js";

export function getTargetSupabaseClient(url: string, serviceRoleKey: string): SupabaseClient {
  return createClient(url, serviceRoleKey);
}

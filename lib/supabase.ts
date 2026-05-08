// Required env vars — set these in Vercel dashboard before deploying:
//   NEXT_PUBLIC_SUPABASE_URL
//   NEXT_PUBLIC_SUPABASE_ANON_KEY
//   SUPABASE_SERVICE_ROLE_KEY

import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { createBrowserClient } from "@supabase/auth-helpers-nextjs";

let _serverClient: SupabaseClient | null = null;

// Server-side data client — uses service role key, bypasses RLS.
// Use for personalization, case study ingestion, and other server-only operations.
export function getSupabase(): SupabaseClient {
  if (!_serverClient) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      throw new Error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set");
    }
    _serverClient = createClient(url, key);
  }
  return _serverClient;
}

// Browser client — uses anon key, cookie-based session for auth.
// Use in client components for sign-in, sign-up, and auth state.
// persistSession defaults to true — session stored in localStorage
export function getSupabaseBrowser() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { createClient } from "@supabase/supabase-js";

const ADMIN_EMAIL = "drew@worldshifttech.com";

export async function PATCH(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "").trim();

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  // Verify the token belongs to the admin
  const authClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data: { user }, error: userError } = await authClient.auth.getUser(token);

  if (userError || !user || user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { projectId, demo_url } = await req.json();

  if (!projectId) {
    return NextResponse.json({ error: "projectId required" }, { status: 400 });
  }

  const { error } = await getSupabase()
    .from("projects")
    .update({ demo_url, updated_at: new Date().toISOString() })
    .eq("id", projectId);

  if (error) {
    console.error("[ADMIN-UPDATE-DEMO-URL] Supabase error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

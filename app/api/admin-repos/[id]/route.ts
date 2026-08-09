import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

const ADMIN_EMAIL = "drew@worldshifttech.com";

async function verifyAdmin(req: NextRequest): Promise<boolean> {
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "").trim();
  if (!token) return false;
  const supabase = getSupabase();
  const { data, error } = await supabase.auth.getUser(token);
  return !error && data.user?.email === ADMIN_EMAIL;
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await verifyAdmin(req))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = (await req.json()) as {
    name?: string;
    local_path?: string;
    github_owner?: string;
    github_repo?: string;
    vercel_project_id?: string;
    framework_type?: string;
    auth_convention?: string;
    system_group?: string | null;
    client_facing_name?: string | null;
    client_project_id?: string | null;
    automation_enabled?: boolean;
    planning_interval_hours?: number | null;
    github_app_installation_id?: number | null;
    high_stakes?: boolean;
  };

  const supabase = getSupabase();

  const updateFields: Record<string, unknown> = {
    name: body.name,
    local_path: body.local_path,
    github_owner: body.github_owner,
    github_repo: body.github_repo,
    vercel_project_id: body.vercel_project_id || null,
    framework_type: body.framework_type || "other",
    auth_convention: body.auth_convention || "none",
    system_group: body.system_group || null,
    client_facing_name: body.client_facing_name || null,
    client_project_id: body.client_project_id || null,
    automation_enabled: Boolean(body.automation_enabled),
    planning_interval_hours: body.planning_interval_hours || null,
    github_app_installation_id: body.github_app_installation_id || null,
    // Session 71 — real client work gets the exact same one-click merge trust as a
    // personal test repo today. This is the only lever: an extra confirm step on Merge to
    // Production, gated by this flag rather than inferred automatically. See
    // ORCHESTRATOR_DESIGN.md §11.
    high_stakes: Boolean(body.high_stakes),
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase.from("repos").update(updateFields).eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

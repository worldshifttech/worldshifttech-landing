import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { hashPassword } from "@/lib/project-access";

const ADMIN_EMAIL = "drew@worldshifttech.com";

async function verifyAdmin(req: NextRequest): Promise<boolean> {
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "").trim();
  if (!token) return false;
  const supabase = getSupabase();
  const { data, error } = await supabase.auth.getUser(token);
  return !error && data.user?.email === ADMIN_EMAIL;
}

type MilestoneInput = {
  title?: string;
  description?: string;
  status?: string;
  target_date?: string;
};

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await verifyAdmin(req))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = (await req.json()) as {
    project: {
      title?: string;
      client_name?: string;
      percent_complete?: number;
      next_update_note?: string;
      next_due_date?: string;
      access_mode?: string;
      password?: string;
      budget_type?: string;
      budget_hours_cap?: number;
      hourly_rate?: number;
    };
    milestones?: MilestoneInput[];
  };

  const { project, milestones } = body;
  const supabase = getSupabase();

  const updateFields: Record<string, unknown> = {
    title: project.title,
    client_name: project.client_name || null,
    percent_complete: Math.max(0, Math.min(100, project.percent_complete ?? 0)),
    next_update_note: project.next_update_note || null,
    next_due_date: project.next_due_date || null,
    access_mode: project.access_mode === "public" ? "public" : "password",
    budget_type: project.budget_type === "hourly" ? "hourly" : "none",
    budget_hours_cap: project.budget_hours_cap || null,
    hourly_rate: project.hourly_rate || null,
    updated_at: new Date().toISOString(),
  };

  if (project.access_mode === "password" && project.password && project.password.trim()) {
    updateFields.access_password_hash = hashPassword(project.password.trim());
  }

  const { error: projectError } = await supabase.from("projects").update(updateFields).eq("id", id);

  if (projectError) {
    return NextResponse.json({ error: projectError.message }, { status: 500 });
  }

  if (Array.isArray(milestones)) {
    const { error: deleteError } = await supabase.from("project_milestones").delete().eq("project_id", id);
    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    const rows = milestones
      .filter((m) => m.title && m.title.trim())
      .map((m, i) => ({
        project_id: id,
        title: m.title,
        description: m.description || null,
        status: m.status ?? "not_started",
        target_date: m.target_date || null,
        sort_order: i,
      }));

    if (rows.length > 0) {
      const { error: insertError } = await supabase.from("project_milestones").insert(rows);
      if (insertError) {
        return NextResponse.json({ error: insertError.message }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ ok: true });
}

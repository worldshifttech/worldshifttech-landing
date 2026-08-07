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

// orchestrator_settings is a singleton table — always exactly one row, seeded by the
// Session 52 migration. Read/write that one row rather than modeling multiple settings
// rows; there's nothing per-repo here, that's automation_enabled on repos itself.
export async function GET(req: NextRequest) {
  if (!(await verifyAdmin(req))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const supabase = getSupabase();
  const { data, error } = await supabase.from("orchestrator_settings").select("automation_paused").limit(1).maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ automation_paused: Boolean(data?.automation_paused) });
}

export async function PATCH(req: NextRequest) {
  if (!(await verifyAdmin(req))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { automation_paused } = (await req.json()) as { automation_paused?: boolean };

  if (typeof automation_paused !== "boolean") {
    return NextResponse.json({ error: "automation_paused (boolean) is required" }, { status: 400 });
  }

  const supabase = getSupabase();

  const { data: existing } = await supabase.from("orchestrator_settings").select("id").limit(1).maybeSingle();

  const { error } = existing
    ? await supabase.from("orchestrator_settings").update({ automation_paused }).eq("id", existing.id)
    : await supabase.from("orchestrator_settings").insert({ automation_paused });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, automation_paused });
}

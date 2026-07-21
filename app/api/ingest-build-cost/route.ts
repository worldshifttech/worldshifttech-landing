import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

type BuildCostEntry = {
  label?: string;
  humanHours?: number;
  aiHours?: number;
  aiTier?: string;
  humanCost?: number;
  aiCost?: number;
  totalCost?: number;
  loggedAt?: string;
};

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "").trim();

  if (!token || token !== process.env.WST_INGEST_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { projectSlug, entries } = (await req.json()) as {
    projectSlug?: string;
    entries?: BuildCostEntry[];
  };

  if (!projectSlug || !Array.isArray(entries) || entries.length === 0) {
    return NextResponse.json({ error: "projectSlug and a non-empty entries array are required" }, { status: 400 });
  }

  const supabase = getSupabase();
  const { data: inserted, error } = await supabase
    .from("build_cost_entries")
    .insert(
      entries.map((entry) => ({
        project_slug: projectSlug,
        label: entry.label,
        human_hours: entry.humanHours ?? 0,
        ai_hours: entry.aiHours ?? 0,
        ai_tier: entry.aiTier,
        human_cost: entry.humanCost ?? 0,
        ai_cost: entry.aiCost ?? 0,
        total_cost: entry.totalCost ?? 0,
        logged_at: entry.loggedAt,
      }))
    )
    .select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, inserted });
}

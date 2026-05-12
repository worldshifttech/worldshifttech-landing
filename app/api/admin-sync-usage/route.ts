import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

const ADMIN_EMAIL = "drew@worldshifttech.com";
const ANTHROPIC_VERSION = "2023-06-01";

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "").trim();

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const supabase = getSupabase();
  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user || user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const adminKey = process.env.ANTHROPIC_ADMIN_KEY;
  if (!adminKey) {
    return NextResponse.json({ error: "ANTHROPIC_ADMIN_KEY not configured" }, { status: 400 });
  }

  const startingAt = daysAgo(30);
  const endingAt = new Date().toISOString();
  const headers = {
    "anthropic-version": ANTHROPIC_VERSION,
    "x-api-key": adminKey,
  };

  // Call 1: Messages usage
  let messagesData: Record<string, unknown>;
  try {
    const msgParams = new URLSearchParams({
      starting_at: startingAt,
      ending_at: endingAt,
      bucket_width: "1d",
    });
    const msgRes = await fetch(
      `https://api.anthropic.com/v1/organizations/usage_report/messages?${msgParams}`,
      { headers }
    );
    if (!msgRes.ok) {
      return NextResponse.json(
        { error: `Anthropic API error: ${msgRes.status}` },
        { status: 502 }
      );
    }
    messagesData = await msgRes.json();
  } catch {
    return NextResponse.json({ error: "Anthropic API error: network failure" }, { status: 502 });
  }

  // Call 2: Claude Code usage
  let claudeCodeData: Record<string, unknown>;
  try {
    const ccParams = new URLSearchParams({ starting_at: startingAt });
    const ccRes = await fetch(
      `https://api.anthropic.com/v1/organizations/usage_report/claude_code?${ccParams}`,
      { headers }
    );
    if (!ccRes.ok) {
      return NextResponse.json(
        { error: `Anthropic API error: ${ccRes.status}` },
        { status: 502 }
      );
    }
    claudeCodeData = await ccRes.json();
  } catch {
    return NextResponse.json({ error: "Anthropic API error: network failure" }, { status: 502 });
  }

  // Sum messages buckets
  let api_input_tokens = 0;
  let api_cache_read_tokens = 0;
  let api_cache_creation_tokens = 0;
  let api_output_tokens = 0;

  const buckets = (messagesData.buckets as Record<string, unknown>[] | undefined) ?? [];
  for (const bucket of buckets) {
    api_input_tokens += (bucket.input_tokens as number) ?? 0;
    api_cache_read_tokens += (bucket.cache_read_input_tokens as number) ?? 0;
    api_cache_creation_tokens += (bucket.cache_creation_input_tokens as number) ?? 0;
    api_output_tokens += (bucket.output_tokens as number) ?? 0;
  }

  // Sum Claude Code records
  let claude_code_input_tokens = 0;
  let claude_code_cache_read_tokens = 0;
  let claude_code_output_tokens = 0;
  let claude_code_sessions = 0;

  const ccRecords = (claudeCodeData.records as Record<string, unknown>[] | undefined) ?? [];
  for (const record of ccRecords) {
    const modelBreakdown = (record.model_breakdown as Record<string, unknown>[] | undefined) ?? [];
    for (const mb of modelBreakdown) {
      const tokens = (mb.tokens as Record<string, number> | undefined) ?? {};
      claude_code_input_tokens += tokens.input ?? 0;
      claude_code_cache_read_tokens += tokens.cache_read ?? 0;
      claude_code_output_tokens += tokens.output ?? 0;
    }
    const coreMetrics = (record.core_metrics as Record<string, number> | undefined) ?? {};
    claude_code_sessions += coreMetrics.num_sessions ?? 0;
  }

  // Compute energy and water
  const total_energy_wh =
    (api_input_tokens * 200 +
      api_cache_read_tokens * 20 +
      api_cache_creation_tokens * 25 +
      api_output_tokens * 990 +
      claude_code_input_tokens * 200 +
      claude_code_cache_read_tokens * 20 +
      claude_code_output_tokens * 990) /
    1_000_000;

  const total_water_ml = (total_energy_wh / 1000) * 0.15 * 1000;

  const { data: inserted, error: insertError } = await supabase
    .from("wst_usage_snapshots")
    .insert({
      api_input_tokens,
      api_cache_read_tokens,
      api_cache_creation_tokens,
      api_output_tokens,
      claude_code_input_tokens,
      claude_code_cache_read_tokens,
      claude_code_output_tokens,
      claude_code_sessions,
      total_energy_wh,
      total_water_ml,
      source: "api",
    })
    .select()
    .single();

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, snapshot: inserted });
}

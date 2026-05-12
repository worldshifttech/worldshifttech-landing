import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

const ADMIN_EMAIL = "drew@worldshifttech.com";
const ANTHROPIC_VERSION = "2023-06-01";

function isoDateOnly(d: Date): string {
  return d.toISOString().split("T")[0];
}

function daysAgoDate(n: number): Date {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - n);
  return d;
}

type MessageResult = {
  uncached_input_tokens?: number;
  cache_read_input_tokens?: number;
  cache_creation?: {
    ephemeral_5m_input_tokens?: number;
    ephemeral_1h_input_tokens?: number;
  };
  output_tokens?: number;
};

type MessageBucket = {
  results?: MessageResult[];
};

type CCModelBreakdown = {
  tokens?: {
    input?: number;
    cache_read?: number;
    cache_creation?: number;
    output?: number;
  };
};

type CCRecord = {
  core_metrics?: { num_sessions?: number };
  model_breakdown?: CCModelBreakdown[];
};

async function fetchAllPages<T>(
  buildUrl: (page?: string) => string,
  headers: Record<string, string>
): Promise<{ items: T[]; firstStatus?: number }> {
  const items: T[] = [];
  let page: string | undefined = undefined;
  let firstStatus: number | undefined;

  for (let i = 0; i < 50; i++) {
    const response = await fetch(buildUrl(page), { headers });
    if (!firstStatus) firstStatus = response.status;
    if (!response.ok) return { items, firstStatus: response.status };

    const json: { data?: T[]; has_more?: boolean; next_page?: string } = await response.json();
    const data: T[] = json.data ?? [];
    items.push(...data);

    if (!json.has_more || !json.next_page) break;
    page = json.next_page as string;
  }

  return { items, firstStatus };
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

  const headers = {
    "anthropic-version": ANTHROPIC_VERSION,
    "x-api-key": adminKey,
  };

  const startingAt = daysAgoDate(30).toISOString();
  const endingAt = new Date().toISOString();

  // Call 1: Messages usage (paginated)
  const { items: msgBuckets, firstStatus: msgStatus } = await fetchAllPages<MessageBucket>(
    (page) => {
      const p = new URLSearchParams({
        starting_at: startingAt,
        ending_at: endingAt,
        bucket_width: "1d",
        limit: "31",
      });
      if (page) p.set("page", page);
      return `https://api.anthropic.com/v1/organizations/usage_report/messages?${p}`;
    },
    headers
  );

  if (msgStatus && msgStatus >= 400) {
    return NextResponse.json(
      { error: `Anthropic API error: ${msgStatus}` },
      { status: 502 }
    );
  }

  // Call 2: Claude Code usage — query last 7 days, one day at a time
  const ccRecords: CCRecord[] = [];
  let ccFailed = false;

  for (let i = 1; i <= 7; i++) {
    const dateStr = isoDateOnly(daysAgoDate(i));
    const { items, firstStatus } = await fetchAllPages<CCRecord>(
      (page) => {
        const p = new URLSearchParams({ starting_at: dateStr, limit: "1000" });
        if (page) p.set("page", page);
        return `https://api.anthropic.com/v1/organizations/usage_report/claude_code?${p}`;
      },
      headers
    );
    if (firstStatus && firstStatus >= 400) {
      ccFailed = true;
      break;
    }
    ccRecords.push(...items);
  }

  if (ccFailed) {
    return NextResponse.json(
      { error: "Anthropic API error: Claude Code endpoint failed" },
      { status: 502 }
    );
  }

  // Sum messages — data[].results[].uncached_input_tokens etc.
  let api_input_tokens = 0;
  let api_cache_read_tokens = 0;
  let api_cache_creation_tokens = 0;
  let api_output_tokens = 0;

  for (const bucket of msgBuckets) {
    for (const r of bucket.results ?? []) {
      api_input_tokens += r.uncached_input_tokens ?? 0;
      api_cache_read_tokens += r.cache_read_input_tokens ?? 0;
      api_cache_creation_tokens +=
        (r.cache_creation?.ephemeral_5m_input_tokens ?? 0) +
        (r.cache_creation?.ephemeral_1h_input_tokens ?? 0);
      api_output_tokens += r.output_tokens ?? 0;
    }
  }

  // Sum Claude Code
  let claude_code_input_tokens = 0;
  let claude_code_cache_read_tokens = 0;
  let claude_code_output_tokens = 0;
  let claude_code_sessions = 0;

  for (const record of ccRecords) {
    claude_code_sessions += record.core_metrics?.num_sessions ?? 0;
    for (const mb of record.model_breakdown ?? []) {
      claude_code_input_tokens += mb.tokens?.input ?? 0;
      claude_code_cache_read_tokens += mb.tokens?.cache_read ?? 0;
      claude_code_output_tokens += mb.tokens?.output ?? 0;
    }
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

import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getSupabase } from "@/lib/supabase";
import { embedText } from "@/lib/voyage";

const ADMIN_EMAIL = "drew@worldshifttech.com";

async function verifyAdmin(req: NextRequest): Promise<boolean> {
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "").trim();
  if (!token) return false;
  const supabase = getSupabase();
  const { data, error } = await supabase.auth.getUser(token);
  return !error && data.user?.email === ADMIN_EMAIL;
}

// One-time migration: folds content/audit-knowledge/*.md — previously read straight off
// disk by the now-retired /admin/audit-knowledge page, disconnected from the dead
// audit_knowledge table and from everything else in the app — into
// knowledge_base_entries as category: 'audit_reference' rows. One browsable, embedded
// knowledge base instead of a file-based library nothing else could query. Safe to
// re-run: skips any tool_slug already present, so a retry after a partial failure only
// picks up what's missing. See NOTES.md Session 55.
//
// Title and category are parsed straight out of each doc's own header line (every file
// follows "# Name — WST Audit Reference" then "**Category:** X | **Infrastructure:** Y")
// rather than hand-maintained here — one less thing to keep in sync with the content.
//
// Same-day follow-up: the first real run against the live deploy only got through 3 of
// 21 files (silently — no per-file error, since a function timeout kills the process,
// it doesn't throw a catchable JS exception) — 21 fully sequential Voyage + Supabase
// round trips ran past Vercel's default execution limit. maxDuration below plus batched
// concurrency (instead of one file at a time) fixes both the ceiling and the pace. Still
// idempotent either way — re-running only ever processes what's missing. See NOTES.md.
export const maxDuration = 60;

// Third same-day follow-up: batches of 5 got the loop to actually finish (no more silent
// timeout kill), but reported "3 added, 3 already there, 15 failed" — a burst of 5
// concurrent Voyage embed calls is the leading suspect (rate limit or connection-limit
// rejections on a burst, not a systemic bug), though the UI previously threw away the
// actual per-file error message needed to confirm that. Dropped concurrency to 3 and
// added a short pause between batches as a defensive measure either way; the UI below now
// surfaces each failure's real error text so a repeat failure is diagnosable directly
// instead of guessed at again. See NOTES.md.
const BATCH_SIZE = 3;
const BATCH_PAUSE_MS = 500;

type FileResult = { slug: string; status: "inserted" | "skipped" | "failed"; error?: string };

async function processFile(dir: string, file: string): Promise<FileResult> {
  const slug = file.replace(/\.md$/, "");

  try {
    const content = fs.readFileSync(path.join(dir, file), "utf-8");
    const titleMatch = content.match(/^#\s+(.+?)\s+—\s+WST Audit Reference/m);
    const categoryMatch = content.match(/\*\*Category:\*\*\s*([^|]+)\|/);
    const title = titleMatch?.[1]?.trim() ?? slug;
    const category = categoryMatch?.[1]?.trim() ?? "Reference";

    const embedding = await embedText(content);

    const { error: insertError } = await getSupabase().from("knowledge_base_entries").insert({
      category: "audit_reference",
      title,
      tool_slug: slug,
      tags: [category],
      reference_doc: content,
      embedding,
    });

    if (insertError) {
      return { slug, status: "failed", error: insertError.message };
    }
    return { slug, status: "inserted" };
  } catch (err) {
    return { slug, status: "failed", error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function POST(req: NextRequest) {
  if (!(await verifyAdmin(req))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const supabase = getSupabase();

  const { data: existing, error: existingError } = await supabase
    .from("knowledge_base_entries")
    .select("tool_slug")
    .eq("category", "audit_reference");

  if (existingError) {
    return NextResponse.json({ error: existingError.message }, { status: 500 });
  }

  const existingSlugs = new Set((existing ?? []).map((r) => r.tool_slug).filter(Boolean));

  const dir = path.join(process.cwd(), "content", "audit-knowledge");
  let files: string[];
  try {
    files = fs.readdirSync(dir).filter((f) => f.endsWith(".md"));
  } catch (err) {
    return NextResponse.json(
      { error: `Could not read content/audit-knowledge: ${err instanceof Error ? err.message : "unknown error"}` },
      { status: 500 }
    );
  }

  const toProcess = files.filter((f) => !existingSlugs.has(f.replace(/\.md$/, "")));
  const skipped: FileResult[] = files
    .filter((f) => existingSlugs.has(f.replace(/\.md$/, "")))
    .map((f) => ({ slug: f.replace(/\.md$/, ""), status: "skipped" as const }));

  const results: FileResult[] = [...skipped];

  for (let i = 0; i < toProcess.length; i += BATCH_SIZE) {
    const batch = toProcess.slice(i, i + BATCH_SIZE);
    const batchResults = await Promise.all(batch.map((file) => processFile(dir, file)));
    results.push(...batchResults);
    if (i + BATCH_SIZE < toProcess.length) {
      await new Promise((resolve) => setTimeout(resolve, BATCH_PAUSE_MS));
    }
  }

  return NextResponse.json({ ok: true, results });
}

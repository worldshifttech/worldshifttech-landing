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

  const results: { slug: string; status: "inserted" | "skipped" | "failed"; error?: string }[] = [];

  for (const file of files) {
    const slug = file.replace(/\.md$/, "");

    if (existingSlugs.has(slug)) {
      results.push({ slug, status: "skipped" });
      continue;
    }

    try {
      const content = fs.readFileSync(path.join(dir, file), "utf-8");
      const titleMatch = content.match(/^#\s+(.+?)\s+—\s+WST Audit Reference/m);
      const categoryMatch = content.match(/\*\*Category:\*\*\s*([^|]+)\|/);
      const title = titleMatch?.[1]?.trim() ?? slug;
      const category = categoryMatch?.[1]?.trim() ?? "Reference";

      const embedding = await embedText(content);

      const { error: insertError } = await supabase.from("knowledge_base_entries").insert({
        category: "audit_reference",
        title,
        tool_slug: slug,
        tags: [category],
        reference_doc: content,
        embedding,
      });

      if (insertError) {
        results.push({ slug, status: "failed", error: insertError.message });
      } else {
        results.push({ slug, status: "inserted" });
      }
    } catch (err) {
      results.push({ slug, status: "failed", error: err instanceof Error ? err.message : "Unknown error" });
    }
  }

  return NextResponse.json({ ok: true, results });
}

"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import SignOutButton from "@/app/components/SignOutButton";
import { getSupabaseBrowser } from "@/lib/supabase";

// Number of content/audit-knowledge/*.md files as of Session 55 — used only to decide
// when the migrate button/box still needs to be shown (< this many audit_reference rows
// so far), not enforced anywhere server-side. Bump this by hand if more reference docs
// are ever added before a fresh migration.
const EXPECTED_AUDIT_DOC_COUNT = 21;

export type KnowledgeBaseEntry = {
  id: string;
  category: "audit_reference" | "build_artifact";
  title: string;
  tool_slug: string | null;
  tags: string[];
  tech_stack: string[];
  problem_solved: string | null;
  artifact_description: string | null;
  artifact_location: string | null;
  reference_doc: string | null;
  reuse_count: number;
  source_repo_name: string | null;
  created_at: string;
};

function relativeDate(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days < 1) return "today";
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

export default function KnowledgeBaseClient({ entries }: { entries: KnowledgeBaseEntry[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [migrating, setMigrating] = useState(false);
  const [migrateError, setMigrateError] = useState("");
  const [migrateSummary, setMigrateSummary] = useState<string | null>(null);

  // One-time backfill trigger for /api/admin/migrate-audit-knowledge (Session 55) — the
  // route itself is idempotent (skips any tool_slug already present), so this button is
  // safe to leave clickable rather than hiding it after first use. Same admin-bearer-token
  // pattern as every other action in this dashboard.
  async function handleMigrateAuditDocs() {
    setMigrating(true);
    setMigrateError("");
    setMigrateSummary(null);

    const supabase = getSupabaseBrowser();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const token = session?.access_token;

    try {
      const res = await fetch("/api/admin/migrate-audit-knowledge", {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      const data = await res.json();
      if (!res.ok) {
        setMigrateError(data.error ?? "Migration failed");
        return;
      }

      const results = data.results as { slug: string; status: string }[];
      const inserted = results.filter((r) => r.status === "inserted").length;
      const skipped = results.filter((r) => r.status === "skipped").length;
      const failed = results.filter((r) => r.status === "failed").length;
      setMigrateSummary(
        `${inserted} added, ${skipped} already there${failed ? `, ${failed} failed` : ""}.`
      );
      router.refresh();
    } catch {
      setMigrateError("Something went wrong. Please try again.");
    } finally {
      setMigrating(false);
    }
  }

  const filtered = useMemo(() => {
    if (!query.trim()) return entries;
    const q = query.toLowerCase();
    return entries.filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        e.tags.some((t) => t.toLowerCase().includes(q)) ||
        e.tech_stack.some((t) => t.toLowerCase().includes(q))
    );
  }, [entries, query]);

  const auditEntries = filtered.filter((e) => e.category === "audit_reference");
  const buildEntries = filtered.filter((e) => e.category === "build_artifact");
  const totalAuditCount = entries.filter((e) => e.category === "audit_reference").length;

  // Audit reference entries group by their parsed category tag (tags[0], set at
  // migration time from each doc's own "**Category:**" line) — same grouping the old
  // /admin/audit-knowledge sidebar used, just read from the DB now.
  const auditGroups = useMemo(() => {
    const groups: Record<string, KnowledgeBaseEntry[]> = {};
    for (const e of auditEntries) {
      const key = e.tags[0] ?? "Reference";
      (groups[key] ??= []).push(e);
    }
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  }, [auditEntries]);

  const selected = entries.find((e) => e.id === selectedId) ?? null;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--color-offwhite, #F4F2EE)" }}>
      <nav className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-sm border-b border-[#00205C]/10 shadow-sm">
        <div className="flex items-center justify-between px-6 py-5">
          <Link href="/">
            <Image
              src="/World_shift_tech_LOGO_PRIMARY.png"
              alt="World Shift Technologies"
              width={160}
              height={38}
              className="object-contain"
              priority
            />
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/admin" className="text-sm text-[#4B858E] hover:text-[#00205C] transition-colors">
              &larr; Dashboard
            </Link>
            <Link href="/" className="text-sm text-[#76777A] hover:text-[#00205C] transition-colors">
              Back to Site
            </Link>
            <SignOutButton />
          </div>
        </div>
      </nav>

      <div className="flex flex-1 overflow-hidden">
        <aside
          className="flex-shrink-0 flex flex-col border-r overflow-y-auto"
          style={{ width: 300, borderColor: "rgba(0,32,92,0.1)", background: "#ffffff" }}
        >
          <div className="px-5 pt-6 pb-4">
            <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "#4B858E" }}>
              Knowledge Base
            </p>
            <p className="text-xs mb-4" style={{ color: "#76777A" }}>
              {entries.length} entries — audit reference + past build artifacts
            </p>

            {totalAuditCount < EXPECTED_AUDIT_DOC_COUNT && (
              <div
                className="rounded-lg p-3 mb-4 text-xs"
                style={{ background: "rgba(75,133,142,0.08)", border: "1px solid rgba(75,133,142,0.25)" }}
              >
                <p className="mb-2" style={{ color: "#00205C" }}>
                  {totalAuditCount === 0
                    ? `No audit reference docs yet — run the one-time migration to pull in the ${EXPECTED_AUDIT_DOC_COUNT} tool reference docs.`
                    : `${totalAuditCount} of ${EXPECTED_AUDIT_DOC_COUNT} audit reference docs synced — run again to pull in the rest (already-synced ones are skipped automatically).`}
                </p>
                {migrateError && <p className="text-red-500 mb-2">{migrateError}</p>}
                {migrateSummary && (
                  <p className="mb-2" style={{ color: "#4B858E" }}>
                    {migrateSummary}
                  </p>
                )}
                <button
                  type="button"
                  onClick={handleMigrateAuditDocs}
                  disabled={migrating}
                  className="text-xs font-semibold px-3 py-1.5 rounded-full transition-colors disabled:opacity-50"
                  style={{ background: "#4B858E", color: "#ffffff" }}
                >
                  {migrating ? "Migrating..." : "Migrate Audit Docs"}
                </button>
              </div>
            )}

            <input
              type="text"
              placeholder="Search title, tags, stack..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded px-3 py-2 text-sm mb-5 outline-none"
              style={{ background: "#F4F2EE", border: "1px solid rgba(0,32,92,0.1)", color: "#00205C" }}
            />

            {buildEntries.length > 0 && (
              <div className="mb-5">
                <p className="text-xs uppercase tracking-wider mb-2" style={{ color: "#76777A" }}>
                  Build Artifacts ({buildEntries.length})
                </p>
                <ul className="space-y-1">
                  {buildEntries.map((e) => (
                    <EntryLink key={e.id} entry={e} isActive={e.id === selectedId} onSelect={setSelectedId} />
                  ))}
                </ul>
              </div>
            )}

            {auditGroups.map(([category, catEntries]) => (
              <div key={category} className="mb-5">
                <p className="text-xs uppercase tracking-wider mb-2" style={{ color: "#76777A" }}>
                  {category}
                </p>
                <ul className="space-y-1">
                  {catEntries.map((e) => (
                    <EntryLink key={e.id} entry={e} isActive={e.id === selectedId} onSelect={setSelectedId} />
                  ))}
                </ul>
              </div>
            ))}

            {filtered.length === 0 && (
              <p className="text-sm" style={{ color: "#76777A" }}>
                No entries match your search.
              </p>
            )}
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto px-10 py-8">
          {!selected ? (
            <div className="flex items-center justify-center h-full" style={{ color: "#76777A" }}>
              <p className="text-sm">Select an entry from the sidebar to view it.</p>
            </div>
          ) : (
            <EntryDetail entry={selected} />
          )}
        </main>
      </div>
    </div>
  );
}

function EntryLink({
  entry,
  isActive,
  onSelect,
}: {
  entry: KnowledgeBaseEntry;
  isActive: boolean;
  onSelect: (id: string) => void;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={() => onSelect(entry.id)}
        className="w-full text-left block rounded px-3 py-2 text-sm transition-colors"
        style={{
          background: isActive ? "rgba(75,133,142,0.15)" : "transparent",
          color: isActive ? "#4B858E" : "#00205C",
          borderLeft: isActive ? "2px solid #4B858E" : "2px solid transparent",
        }}
      >
        {entry.title}
      </button>
    </li>
  );
}

function EntryDetail({ entry }: { entry: KnowledgeBaseEntry }) {
  return (
    <>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "#4B858E" }}>
            {entry.category === "audit_reference" ? entry.tags[0] ?? "Reference" : "Build Artifact"}
          </p>
          <h1 className="text-2xl font-semibold" style={{ color: "#00205C" }}>
            {entry.title}
          </h1>
        </div>
        <div className="text-right text-xs shrink-0" style={{ color: "#76777A" }}>
          <p>{relativeDate(entry.created_at)}</p>
          <p>Surfaced {entry.reuse_count}x</p>
        </div>
      </div>

      {entry.category === "audit_reference" ? (
        <pre
          className="whitespace-pre-wrap leading-relaxed text-sm"
          style={{ fontFamily: "inherit", color: "#00205C", maxWidth: 860 }}
        >
          {entry.reference_doc}
        </pre>
      ) : (
        <div className="space-y-5 max-w-3xl">
          {entry.problem_solved && (
            <div>
              <p className="text-xs uppercase tracking-wide mb-1" style={{ color: "#76777A" }}>
                Problem solved
              </p>
              <p className="text-sm" style={{ color: "#00205C" }}>
                {entry.problem_solved}
              </p>
            </div>
          )}
          {entry.artifact_description && (
            <div>
              <p className="text-xs uppercase tracking-wide mb-1" style={{ color: "#76777A" }}>
                Description
              </p>
              <pre className="whitespace-pre-wrap text-sm font-mono" style={{ color: "#00205C" }}>
                {entry.artifact_description}
              </pre>
            </div>
          )}
          {entry.tech_stack.length > 0 && (
            <div>
              <p className="text-xs uppercase tracking-wide mb-1" style={{ color: "#76777A" }}>
                Tech stack
              </p>
              <div className="flex flex-wrap gap-2">
                {entry.tech_stack.map((t) => (
                  <span
                    key={t}
                    className="text-xs font-semibold px-3 py-1 rounded-full"
                    style={{ background: "rgba(145,182,187,0.25)", color: "#00205C" }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}
          {entry.artifact_location && (
            <div>
              <p className="text-xs uppercase tracking-wide mb-1" style={{ color: "#76777A" }}>
                Location
              </p>
              <p className="text-sm font-mono" style={{ color: "#00205C" }}>
                {entry.artifact_location}
              </p>
            </div>
          )}
          {entry.source_repo_name && (
            <div>
              <p className="text-xs uppercase tracking-wide mb-1" style={{ color: "#76777A" }}>
                Source repo
              </p>
              <p className="text-sm" style={{ color: "#00205C" }}>
                {entry.source_repo_name}
              </p>
            </div>
          )}
        </div>
      )}
    </>
  );
}

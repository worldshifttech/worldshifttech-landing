import { getSupabase } from "./supabase";
import { embedText } from "./voyage";

// The unified knowledge base: audit tech-stack reference material and reusable build
// artifacts from orchestrator sessions, sharing one embedded, searchable table. See
// NOTES.md Session 55 and ORCHESTRATOR_DESIGN.md §6.

export type KnowledgeBaseMatch = {
  id: string;
  category: "audit_reference" | "build_artifact";
  title: string;
  problem_solved: string | null;
  tags: string[];
  tech_stack: string[];
  artifact_description: string | null;
  artifact_location: string | null;
  reference_doc: string | null;
  similarity: number;
};

// Embeds `queryText` and returns the top `limit` most similar entries across both
// categories — a planning session's brief benefits from relevant audit reference
// knowledge just as much as a past build artifact. Best-effort: returns [] rather than
// throwing, so a Voyage or Supabase hiccup never blocks a dispatch.
export async function searchKnowledgeBase(queryText: string, limit = 3): Promise<KnowledgeBaseMatch[]> {
  try {
    const embedding = await embedText(queryText);
    const supabase = getSupabase();
    const { data, error } = await supabase.rpc("match_knowledge_base_entries", {
      query_embedding: embedding,
      match_count: limit,
    });

    if (error) {
      console.error("[knowledge-base] similarity search error:", error.message);
      return [];
    }

    return (data as KnowledgeBaseMatch[]) ?? [];
  } catch (err) {
    console.error("[knowledge-base] search failed:", err instanceof Error ? err.message : err);
    return [];
  }
}

// Same shape as lib/audit-knowledge.ts's retired formatKnowledgeForPrompt() — a single
// context block ready to drop into an agent's prompt — just backed by vector similarity
// across the unified table instead of a keyword-to-slug map.
export function formatKnowledgeForPrompt(matches: KnowledgeBaseMatch[]): string | null {
  if (!matches || matches.length === 0) return null;

  const formatted = matches
    .map((m) => {
      if (m.category === "audit_reference") {
        return `## ${m.title} (reference)\n${m.reference_doc ?? ""}`.trim();
      }
      const lines = [
        `## ${m.title} (past build artifact)`,
        `Problem solved: ${m.problem_solved ?? "—"}`,
        m.tech_stack.length ? `Tech stack: ${m.tech_stack.join(", ")}` : null,
        m.artifact_description ?? "",
        m.artifact_location ? `Location: ${m.artifact_location}` : null,
      ].filter((line): line is string => Boolean(line));
      return lines.join("\n");
    })
    .join("\n\n---\n\n");

  return `
=== RELEVANT WST KNOWLEDGE BASE ENTRIES ===
The following were surfaced as relevant to this session's brief via similarity search.
Use them if genuinely applicable — don't force a connection that isn't there.

${formatted}

=== END KNOWLEDGE BASE ===
`.trim();
}

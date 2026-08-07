import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/auth-helpers-nextjs";
import { getSupabase } from "@/lib/supabase";
import KnowledgeBaseClient, { type KnowledgeBaseEntry } from "./KnowledgeBaseClient";

const ADMIN_EMAIL = "drew@worldshifttech.com";

type RawEntryRow = {
  id: string;
  category: string;
  title: string;
  tool_slug: string | null;
  tags: string[] | null;
  tech_stack: string[] | null;
  problem_solved: string | null;
  artifact_description: string | null;
  artifact_location: string | null;
  reference_doc: string | null;
  reuse_count: number | null;
  created_at: string;
  repos: { name: string } | null;
};

// Replaces /admin/audit-knowledge — one browsable view over the unified
// knowledge_base_entries table (audit reference docs + build-session artifacts) instead
// of a file-based doc browser disconnected from everything else. See NOTES.md Session 55.
export default async function KnowledgeBasePage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => {},
      },
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session || session.user.email !== ADMIN_EMAIL) {
    redirect("/admin/login");
  }

  const serviceClient = getSupabase();

  const { data: rawRows } = await serviceClient
    .from("knowledge_base_entries")
    .select("*, repos(name)")
    .order("created_at", { ascending: false });

  const rows = (rawRows ?? []) as unknown as RawEntryRow[];

  const entries: KnowledgeBaseEntry[] = rows.map((r) => ({
    id: r.id,
    category: r.category as KnowledgeBaseEntry["category"],
    title: r.title,
    tool_slug: r.tool_slug,
    tags: r.tags ?? [],
    tech_stack: r.tech_stack ?? [],
    problem_solved: r.problem_solved,
    artifact_description: r.artifact_description,
    artifact_location: r.artifact_location,
    reference_doc: r.reference_doc,
    reuse_count: r.reuse_count ?? 0,
    source_repo_name: r.repos?.name ?? null,
    created_at: r.created_at,
  }));

  return <KnowledgeBaseClient entries={entries} />;
}

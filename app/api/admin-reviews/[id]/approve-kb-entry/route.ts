import { NextRequest, NextResponse } from "next/server";
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

// Promotes an approved kb_entry_draft review into a real, permanent, embedded
// knowledge_base_entries row (category: 'build_artifact') — the one genuinely new,
// semi-irreversible action this phase adds, same category as [id]/merge's "Merge to
// Production". Takes the final field values straight from the request body (whatever
// Drew last edited in the card) rather than re-reading review_items.kb_draft server-side
// — one submit, no PATCH-then-POST race. See NOTES.md Session 55.
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await verifyAdmin(req))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = (await req.json()) as {
    title?: string;
    problem_solved?: string;
    tags?: string[];
    tech_stack?: string[];
    artifact_location?: string;
    artifact_description?: string;
  };

  const title = body.title?.trim();
  const artifactDescription = body.artifact_description?.trim();

  if (!title || !artifactDescription) {
    return NextResponse.json({ error: "A title and description are required" }, { status: 400 });
  }

  const supabase = getSupabase();

  const { data: reviewItem, error: reviewError } = await supabase
    .from("review_items")
    .select("session_id, kind")
    .eq("id", id)
    .single();

  if (reviewError || !reviewItem) {
    return NextResponse.json({ error: "Review item not found" }, { status: 404 });
  }

  if (reviewItem.kind !== "kb_entry_draft") {
    return NextResponse.json({ error: "Not a kb_entry_draft review" }, { status: 400 });
  }

  const { data: session, error: sessionError } = await supabase
    .from("agent_sessions")
    .select("repo_id")
    .eq("id", reviewItem.session_id)
    .single();

  if (sessionError || !session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  const tags = body.tags ?? [];
  const techStack = body.tech_stack ?? [];

  const embeddingSource = [title, body.problem_solved ?? "", artifactDescription, techStack.join(", ")]
    .filter(Boolean)
    .join("\n\n");

  try {
    const embedding = await embedText(embeddingSource);

    const { error: insertError } = await supabase.from("knowledge_base_entries").insert({
      category: "build_artifact",
      title,
      problem_solved: body.problem_solved ?? null,
      tags,
      tech_stack: techStack,
      artifact_description: artifactDescription,
      artifact_location: body.artifact_location ?? null,
      source_repo_id: session.repo_id,
      source_session_id: reviewItem.session_id,
      embedding,
    });

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    await supabase
      .from("review_items")
      .update({ status: "answered", drew_response: "Added to knowledge base", answered_at: new Date().toISOString() })
      .eq("id", id);

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Approve failed" }, { status: 500 });
  }
}

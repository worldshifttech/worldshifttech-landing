import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/auth-helpers-nextjs";
import { getSupabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
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
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { lessonId, status } = body;

  if (!lessonId || !status) {
    return NextResponse.json(
      { error: "lessonId and status are required" },
      { status: 400 }
    );
  }

  const now = new Date().toISOString();
  const db = getSupabase();

  const { error } = await db.from("curriculum_progress").upsert(
    {
      user_id: session.user.id,
      lesson_id: lessonId,
      status,
      ...(status === "completed" ? { completed_at: now } : {}),
      ...(status === "in_progress" ? { started_at: now } : {}),
    },
    { onConflict: "user_id,lesson_id" }
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

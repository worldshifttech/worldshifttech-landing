import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export async function PATCH(req: NextRequest) {
  try {
    const { projectId, userId } = await req.json();

    if (!projectId || !userId) {
      return NextResponse.json(
        { error: "Missing projectId or userId" },
        { status: 400 }
      );
    }

    const supabase = getSupabase();

    const { data, error } = await supabase
      .from("projects")
      .update({
        user_id: userId,
        guest: false,
        updated_at: new Date().toISOString(),
      })
      .eq("id", projectId)
      .eq("guest", true)
      .is("user_id", null)
      .select("id")
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: "Project not found or already claimed" },
        { status: 400 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { auditId, userId } = await req.json();

    if (!auditId || !userId) {
      return NextResponse.json({ error: "Missing auditId or userId" }, { status: 400 });
    }

    const supabase = getSupabase();

    const { data, error } = await supabase
      .from("audit_estimates")
      .update({ user_id: userId, guest: false, updated_at: new Date().toISOString() })
      .eq("id", auditId)
      .eq("guest", true)
      .is("user_id", null)
      .select("id")
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Audit not found or already claimed" }, { status: 400 });
    }

    return NextResponse.json({ ok: true, id: data.id });
  } catch (err) {
    console.error("attach-guest-audit error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}


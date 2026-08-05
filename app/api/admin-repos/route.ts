import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

const ADMIN_EMAIL = "drew@worldshifttech.com";

async function verifyAdmin(req: NextRequest): Promise<boolean> {
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "").trim();
  if (!token) return false;
  const supabase = getSupabase();
  const { data, error } = await supabase.auth.getUser(token);
  return !error && data.user?.email === ADMIN_EMAIL;
}

export async function POST(req: NextRequest) {
  if (!(await verifyAdmin(req))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { name, local_path, github_owner, github_repo, framework_type, auth_convention } =
    (await req.json()) as {
      name?: string;
      local_path?: string;
      github_owner?: string;
      github_repo?: string;
      framework_type?: string;
      auth_convention?: string;
    };

  if (!name || !local_path || !github_owner || !github_repo) {
    return NextResponse.json(
      { error: "Name, local path, GitHub owner, and GitHub repo are required" },
      { status: 400 }
    );
  }

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("repos")
    .insert({
      name,
      local_path,
      github_owner,
      github_repo,
      framework_type: framework_type || "other",
      auth_convention: auth_convention || "none",
    })
    .select("id")
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: error?.message ?? "Could not create repo" },
      { status: 400 }
    );
  }

  return NextResponse.json({ id: data.id });
}

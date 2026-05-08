import { cookies } from "next/headers";
import { createServerClient } from "@supabase/auth-helpers-nextjs";
import ProjectWizard from "./ProjectWizard";

export default async function NewProjectPage() {
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

  return (
    <ProjectWizard
      userEmail={session?.user.email ?? ""}
      userId={session?.user.id ?? ""}
      isGuest={!session}
    />
  );
}

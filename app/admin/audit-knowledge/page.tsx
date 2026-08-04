import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/auth-helpers-nextjs";
import Image from "next/image";
import Link from "next/link";
import { ALL_AUDIT_TOOLS, getAuditDoc } from "@/lib/audit-knowledge";
import AuditKnowledgeClient from "./AuditKnowledgeClient";

const ADMIN_EMAIL = "drew@worldshifttech.com";

export default async function AuditKnowledgePage({
  searchParams,
}: {
  searchParams: Promise<{ tool?: string }>;
}) {
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

  const params = await searchParams;
  const selectedSlug = params.tool ?? null;
  const selectedTool = selectedSlug
    ? ALL_AUDIT_TOOLS.find((t) => t.slug === selectedSlug) ?? null
    : null;
  const docContent = selectedSlug ? getAuditDoc(selectedSlug) : null;

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "var(--color-offwhite, #F4F2EE)", color: "var(--color-navy, #00205C)" }}
    >
      {/* Nav */}
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
            <Link
              href="/admin"
              className="text-sm transition-colors font-normal"
              style={{ color: "var(--color-teal, #4B858E)" }}
            >
              &larr; Dashboard
            </Link>
            <Link
              href="/"
              className="text-sm transition-colors font-normal"
              style={{ color: "#76777A" }}
            >
              Back to Site
            </Link>
          </div>
        </div>
      </nav>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside
          className="flex-shrink-0 flex flex-col border-r overflow-y-auto"
          style={{
            width: 260,
            borderColor: "rgba(0,32,92,0.1)",
            background: "#ffffff",
          }}
        >
          <div className="px-5 pt-6 pb-4">
            <p
              className="text-xs font-semibold uppercase tracking-widest mb-4"
              style={{ color: "var(--color-teal, #4B858E)" }}
            >
              Audit Knowledge Base
            </p>
            <AuditKnowledgeClient
              tools={ALL_AUDIT_TOOLS}
              selectedSlug={selectedSlug}
            />
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto px-10 py-8">
          {!selectedTool || !docContent ? (
            <div
              className="flex items-center justify-center h-full font-normal"
              style={{ color: "#76777A" }}
            >
              <p className="text-sm">Select a tool from the sidebar to view its audit reference.</p>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <p
                  className="text-xs uppercase tracking-widest mb-1 font-normal"
                  style={{ color: "var(--color-teal, #4B858E)" }}
                >
                  {selectedTool.category}
                </p>
                <h1
                  className="text-2xl font-semibold"
                  style={{ color: "var(--color-navy, #00205C)" }}
                >
                  {selectedTool.name}
                </h1>
              </div>
              <pre
                className="font-normal"
                style={{
                  fontFamily: "inherit",
                  whiteSpace: "pre-wrap",
                  lineHeight: "1.6",
                  fontSize: "0.875rem",
                  color: "var(--color-navy, #00205C)",
                  maxWidth: 860,
                }}
              >
                {docContent}
              </pre>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

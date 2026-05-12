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
    redirect("/");
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
      style={{ background: "var(--color-dark, #080C14)", color: "var(--color-offwhite, #F4F2EE)" }}
    >
      {/* Nav */}
      <nav
        className="flex items-center justify-between px-6 py-5 border-b"
        style={{ borderColor: "rgba(255,255,255,0.06)" }}
      >
        <Link href="/">
          <Image
            src="/World_shift_tech_LOGO_WHITE.png"
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
            className="text-sm transition-colors"
            style={{ color: "var(--color-teal, #4B858E)", fontFamily: "var(--font-dm-sans)" }}
          >
            &larr; Dashboard
          </Link>
          <Link
            href="/"
            className="text-sm transition-colors"
            style={{ color: "#767B7A", fontFamily: "var(--font-dm-sans)" }}
          >
            Back to Site
          </Link>
        </div>
      </nav>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside
          className="flex-shrink-0 flex flex-col border-r overflow-y-auto"
          style={{
            width: 260,
            borderColor: "rgba(255,255,255,0.06)",
            background: "rgba(0,0,0,0.2)",
          }}
        >
          <div className="px-5 pt-6 pb-4">
            <p
              className="text-xs font-semibold uppercase tracking-widest mb-4"
              style={{ color: "var(--color-teal, #4B858E)", fontFamily: "var(--font-dm-sans)" }}
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
              className="flex items-center justify-center h-full"
              style={{ color: "#767B7A", fontFamily: "var(--font-dm-sans)" }}
            >
              <p className="text-sm">Select a tool from the sidebar to view its audit reference.</p>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <p
                  className="text-xs uppercase tracking-widest mb-1"
                  style={{ color: "var(--color-teal, #4B858E)", fontFamily: "var(--font-dm-sans)" }}
                >
                  {selectedTool.category}
                </p>
                <h1
                  className="text-2xl font-semibold"
                  style={{ fontFamily: "var(--font-playfair)", color: "var(--color-offwhite, #F4F2EE)" }}
                >
                  {selectedTool.name}
                </h1>
              </div>
              <pre
                style={{
                  fontFamily: "inherit",
                  whiteSpace: "pre-wrap",
                  lineHeight: "1.6",
                  fontSize: "0.875rem",
                  color: "var(--color-offwhite, #F4F2EE)",
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

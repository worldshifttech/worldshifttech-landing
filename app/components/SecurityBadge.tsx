import Link from "next/link";

// Small badge linking to /security, shown in the nav of every client-facing project
// dashboard (app/projects/[slug]/page.tsx and app/clients/[slug]/page.tsx) so clients
// uploading files or project details always have a one-click path to see how that
// information is protected. Shared here rather than duplicated so both navs stay in sync.
export default function SecurityBadge() {
  return (
    <Link
      href="/security"
      className="flex items-center gap-1.5 rounded-full border border-[#91B6BB]/50 bg-[#91B6BB]/10 px-3 py-1.5 text-xs font-semibold text-[#4B858E] transition-colors hover:bg-[#91B6BB]/20 hover:text-[#00205C]"
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 2 4 5v6c0 5 3.5 8.5 8 11 4.5-2.5 8-6 8-11V5l-8-3Z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
      Security
    </Link>
  );
}

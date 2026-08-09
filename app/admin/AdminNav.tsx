"use client";

import Link from "next/link";
import Image from "next/image";
import SignOutButton from "@/app/components/SignOutButton";

// Shared nav for every /admin/* page (Session 69). Replaces six independently
// hand-coded <nav> blocks that each linked to a different subset of the other admin
// pages — /admin/repos/[id] and /admin/projects/[id] in particular only linked back to
// their own list, with no way to reach Reviews, Knowledge Base, or Dashboard without a
// detour through the parent list first. Every destination is always present here; the
// `active` prop only controls which one is highlighted.

const NAV_ITEMS = [
  { key: "dashboard", href: "/admin", label: "Dashboard" },
  { key: "repos", href: "/admin/repos", label: "Repos" },
  { key: "reviews", href: "/admin/reviews", label: "Reviews" },
  { key: "knowledge-base", href: "/admin/knowledge-base", label: "Knowledge Base" },
  // Session 72 — cost_usd wasn't tracked anywhere until wst-orchestrator-runner's own
  // Session 10 started sending it; nothing to show for sessions dispatched before that.
  { key: "spend", href: "/admin/spend", label: "Spend" },
  { key: "guide", href: "/admin/guide", label: "Guide" },
] as const;

export type AdminNavSection = (typeof NAV_ITEMS)[number]["key"];

export default function AdminNav({ active }: { active?: AdminNavSection }) {
  return (
    <nav className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-sm border-b border-[#00205C]/10 shadow-sm">
      <div className="flex items-center justify-between px-6 py-5 flex-wrap gap-y-3">
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
        <div className="flex items-center gap-6 flex-wrap">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className={`text-sm transition-colors ${
                active === item.key
                  ? "text-[#00205C] font-semibold"
                  : "text-[#4B858E] hover:text-[#00205C]"
              }`}
            >
              {item.label}
            </Link>
          ))}
          <Link href="/" className="text-sm text-[#76777A] hover:text-[#00205C] transition-colors">
            Back to Site
          </Link>
          <SignOutButton />
        </div>
      </div>
    </nav>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

type Tool = {
  slug: string;
  name: string;
  category: string;
  file: string;
};

const CATEGORY_ORDER = [
  "AI/LLM",
  "Automation",
  "Project Management",
  "Cloud Infrastructure",
  "Customer Support",
  "Reference",
];

export default function AuditKnowledgeClient({
  tools,
  selectedSlug,
}: {
  tools: Tool[];
  selectedSlug: string | null;
}) {
  const [query, setQuery] = useState("");
  const searchParams = useSearchParams();

  const filtered = query.trim()
    ? tools.filter(
        (t) =>
          t.name.toLowerCase().includes(query.toLowerCase()) ||
          t.category.toLowerCase().includes(query.toLowerCase())
      )
    : tools;

  const grouped = CATEGORY_ORDER.reduce<Record<string, Tool[]>>((acc, cat) => {
    const matches = filtered.filter((t) => t.category === cat);
    if (matches.length) acc[cat] = matches;
    return acc;
  }, {});

  return (
    <>
      <input
        type="text"
        placeholder="Search tools..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full rounded px-3 py-2 text-sm mb-5 outline-none"
        style={{
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.1)",
          color: "#F4F2EE",
          fontFamily: "var(--font-dm-sans)",
        }}
      />

      {Object.entries(grouped).map(([category, catTools]) => (
        <div key={category} className="mb-5">
          <p
            className="text-xs uppercase tracking-wider mb-2"
            style={{ color: "#767B7A", fontFamily: "var(--font-dm-sans)" }}
          >
            {category}
          </p>
          <ul className="space-y-1">
            {catTools.map((tool) => {
              const isActive = tool.slug === selectedSlug;
              return (
                <li key={tool.slug}>
                  <Link
                    href={`/admin/audit-knowledge?tool=${tool.slug}`}
                    className="block rounded px-3 py-2 text-sm transition-colors"
                    style={{
                      fontFamily: "var(--font-dm-sans)",
                      background: isActive ? "rgba(75,133,142,0.15)" : "transparent",
                      color: isActive ? "var(--color-teal, #4B858E)" : "#F4F2EE",
                      borderLeft: isActive ? "2px solid var(--color-teal, #4B858E)" : "2px solid transparent",
                    }}
                  >
                    {tool.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}

      {Object.keys(grouped).length === 0 && (
        <p className="text-sm" style={{ color: "#767B7A", fontFamily: "var(--font-dm-sans)" }}>
          No tools match your search.
        </p>
      )}
    </>
  );
}

export type OpenItem = {
  id: string;
  message: string;
  status: string;
  created_at: string;
  milestone_title: string | null;
  attached_file: { file_name: string; downloadUrl: string | null } | null;
};

const STATUS_BADGE: Record<string, string> = {
  new: "bg-[#4B858E]/10 text-[#4B858E] border border-[#4B858E]/30",
  read: "bg-[#4B858E]/10 text-[#4B858E] border border-[#4B858E]/30",
  resolved: "bg-green-500/15 text-green-600 border border-green-500/30",
};

const STATUS_LABEL: Record<string, string> = {
  new: "Open",
  read: "Open",
  resolved: "Resolved",
};

function relativeDate(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days < 1) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

// Read-only list of open items. The submission form used to live in this same box
// (message + optional file attach + its own Turnstile widget) — split out into
// SubmitFeedback.tsx so "here's what's open" and "here's how you add something" are two
// distinct sections instead of one box doing both jobs. See NOTES.md for the session that
// made this split.
export default function OpenItems({ items }: { items: OpenItem[] }) {
  // One-line change if Drew wants resolved items shown too: drop this filter.
  const openList = items.filter((i) => i.status !== "resolved");

  return (
    <div className="bg-white border border-[#00205C]/10 rounded-2xl p-6">
      <span className="text-xs font-bold tracking-widest uppercase text-[#4B858E] block mb-4">Open Items</span>

      {openList.length === 0 ? (
        <p className="text-[#76777A] text-sm">No open items right now.</p>
      ) : (
        <div className="space-y-3">
          {openList.map((item) => (
            <div key={item.id} className="border border-[#00205C]/[0.08] rounded-xl px-4 py-3">
              <div className="flex items-start justify-between gap-3 mb-1">
                <p className="text-[#76777A] text-xs">{item.milestone_title ?? "General"}</p>
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${
                    STATUS_BADGE[item.status] ?? STATUS_BADGE.new
                  }`}
                >
                  {STATUS_LABEL[item.status] ?? item.status}
                </span>
              </div>
              <p className="text-[#00205C] text-sm">{item.message}</p>
              {item.attached_file && item.attached_file.downloadUrl && (
                <a
                  href={item.attached_file.downloadUrl}
                  className="inline-block mt-2 text-xs font-semibold px-3 py-1 rounded-full border border-[#4B858E] text-[#4B858E] hover:bg-[#4B858E]/10 transition-colors"
                >
                  {item.attached_file.file_name}
                </a>
              )}
              <p className="text-[#76777A] text-xs mt-1">{relativeDate(item.created_at)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

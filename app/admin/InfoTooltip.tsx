"use client";

import { useEffect, useRef, useState } from "react";

// Small "?" icon that toggles a short explanation bubble on click (Session 69) — not
// hover-only, since this dashboard gets used from a phone sometimes and hover has no
// touch equivalent. Closes on click-away or Escape. One shared component so every call
// site stays a one-line drop-in rather than reimplementing open/close/position logic.
export default function InfoTooltip({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) return;

    function handleClickAway(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handleClickAway);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickAway);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  return (
    <span ref={ref} className="relative inline-flex items-center">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="More info"
        aria-expanded={open}
        className="inline-flex items-center justify-center w-4 h-4 rounded-full border border-[#4B858E] text-[#4B858E] text-[10px] font-bold leading-none hover:bg-[#4B858E]/10 transition-colors flex-shrink-0"
      >
        ?
      </button>
      {open && (
        <span
          role="tooltip"
          className="absolute z-50 top-full left-0 mt-2 w-64 bg-white border border-[#00205C]/15 rounded-lg shadow-lg p-3 text-xs text-[#00205C] leading-relaxed font-normal normal-case"
        >
          {text}
        </span>
      )}
    </span>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const SOURCE_OPTIONS = [
  "I know Drew personally",
  "Found it through search",
  "Referred by someone",
  "Saw Drew's work somewhere",
];

export default function MeetPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [source, setSource] = useState("");
  const [description, setDescription] = useState("");
  const [transitioning, setTransitioning] = useState(false);

  function handleSourceSelect(option: string) {
    setSource(option);
    setTransitioning(true);
    setTimeout(() => {
      setStep(2);
      setTransitioning(false);
    }, 250);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!description.trim()) return;

    const value = JSON.stringify({ source, description: description.trim() });
    document.cookie = `wst_visitor=${encodeURIComponent(value)}; path=/; max-age=2592000; SameSite=Lax`;

    router.push("/for-you");
  }

  return (
    <main
      style={{ background: "var(--color-dark)" }}
      className="min-h-screen flex items-center justify-center px-4 py-16"
    >
      <div
        style={{
          opacity: transitioning ? 0 : 1,
          transition: "opacity 0.25s ease",
          maxWidth: 480,
          width: "100%",
          background: "#0f1623",
          border: "1px solid rgba(75,133,142,0.25)",
          borderRadius: 12,
          padding: "2.5rem 2rem",
        }}
      >
        {step === 1 ? (
          <div>
            <p
              style={{
                fontFamily: "var(--font-dm-sans)",
                color: "var(--color-teal)",
                fontSize: "0.8rem",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                marginBottom: "1rem",
              }}
            >
              Quick intro
            </p>
            <h1
              style={{
                fontFamily: "var(--font-playfair)",
                color: "var(--color-offwhite)",
                fontSize: "clamp(1.5rem, 4vw, 2rem)",
                fontWeight: 600,
                lineHeight: 1.3,
                marginBottom: "2rem",
              }}
            >
              How did you find this site?
            </h1>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {SOURCE_OPTIONS.map((option) => (
                <button
                  key={option}
                  onClick={() => handleSourceSelect(option)}
                  style={{
                    width: "100%",
                    padding: "0.875rem 1.25rem",
                    background: "transparent",
                    border: "1.5px solid var(--color-teal)",
                    borderRadius: 8,
                    color: "var(--color-offwhite)",
                    fontFamily: "var(--font-dm-sans)",
                    fontSize: "0.975rem",
                    textAlign: "left",
                    cursor: "pointer",
                    transition: "background 0.18s ease, color 0.18s ease",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = "var(--color-teal)";
                    (e.currentTarget as HTMLButtonElement).style.color = "var(--color-dark)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                    (e.currentTarget as HTMLButtonElement).style.color = "var(--color-offwhite)";
                  }}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <p
              style={{
                fontFamily: "var(--font-dm-sans)",
                color: "var(--color-teal)",
                fontSize: "0.8rem",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                marginBottom: "1rem",
              }}
            >
              One more thing
            </p>
            <h1
              style={{
                fontFamily: "var(--font-playfair)",
                color: "var(--color-offwhite)",
                fontSize: "clamp(1.5rem, 4vw, 2rem)",
                fontWeight: 600,
                lineHeight: 1.3,
                marginBottom: "1.75rem",
              }}
            >
              Briefly describe what you do.
            </h1>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. I run a 6-person marketing agency and spend too much time on client reporting..."
              rows={4}
              style={{
                width: "100%",
                padding: "0.875rem 1rem",
                background: "var(--color-dark)",
                border: "1.5px solid var(--color-offwhite)",
                borderRadius: 8,
                color: "var(--color-offwhite)",
                fontFamily: "var(--font-dm-sans)",
                fontSize: "0.95rem",
                lineHeight: 1.6,
                resize: "none",
                outline: "none",
                marginBottom: "1.25rem",
                boxSizing: "border-box",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "var(--color-teal)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "var(--color-offwhite)";
              }}
            />
            <button
              type="submit"
              disabled={!description.trim()}
              style={{
                width: "100%",
                padding: "0.9rem 1.25rem",
                background: description.trim() ? "var(--color-teal)" : "rgba(75,133,142,0.35)",
                border: "none",
                borderRadius: 8,
                color: description.trim() ? "var(--color-dark)" : "var(--color-gray)",
                fontFamily: "var(--font-dm-sans)",
                fontSize: "0.975rem",
                fontWeight: 600,
                cursor: description.trim() ? "pointer" : "not-allowed",
                transition: "background 0.18s ease",
              }}
            >
              Show me what you'd build &rarr;
            </button>
          </form>
        )}
      </div>
    </main>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";

const SOURCE_OPTIONS = [
  "I know Drew personally",
  "Found it through search",
  "Referred by someone",
  "Saw Drew's work somewhere",
];

const INTEREST_OPTIONS = [
  "Automation and workflow builds",
  "AI agent setups",
  "Tool or app builds",
  "Website builds",
];

export default function MeetPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [source, setSource] = useState("");
  const [description, setDescription] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [freeform, setFreeform] = useState("");
  const [transitioning, setTransitioning] = useState(false);
  const [honeypot, setHoneypot] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const [scriptLoaded, setScriptLoaded] = useState(false);

  // Explicit Turnstile render — fires when both the script is loaded AND step 4 is active.
  // The two-dependency effect covers both orderings: script-first or step-first.
  useEffect(() => {
    if (step !== 4 || !scriptLoaded) return;
    const el = document.getElementById("cf-widget");
    if (!el || !(window as any).turnstile) return;
    (window as any).turnstile.render(el, {
      sitekey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
      callback: (token: string) => setTurnstileToken(token),
    });
  }, [step, scriptLoaded]);

  function advance(nextStep: 2 | 3 | 4) {
    setTransitioning(true);
    setTimeout(() => {
      setStep(nextStep);
      setTransitioning(false);
    }, 250);
  }

  function handleSourceSelect(option: string) {
    setSource(option);
    advance(2);
  }

  function handleDescriptionSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!description.trim()) return;
    advance(3);
  }

  function toggleInterest(option: string) {
    setInterests((prev) =>
      prev.includes(option) ? prev.filter((i) => i !== option) : [...prev, option]
    );
  }

  function handleFinish(skipFreeform = false) {
    // Honeypot check — bot filled the hidden field, redirect silently without cookie
    if (honeypot) {
      router.push("/for-you");
      return;
    }

    const value = JSON.stringify({
      source,
      description: description.trim(),
      interests,
      freeform: skipFreeform ? "" : freeform.trim(),
      turnstileToken,
    });
    document.cookie = `wst_visitor=${encodeURIComponent(value)}; path=/; max-age=2592000; SameSite=Lax`;
    router.push("/for-you");
  }

  const labelStyle = {
    fontFamily: "var(--font-dm-sans)",
    color: "var(--color-teal)",
    fontSize: "0.8rem",
    letterSpacing: "0.12em",
    textTransform: "uppercase" as const,
    marginBottom: "1rem",
  };

  const headingStyle = {
    fontFamily: "var(--font-playfair)",
    color: "var(--color-offwhite)",
    fontSize: "clamp(1.5rem, 4vw, 2rem)",
    fontWeight: 600,
    lineHeight: 1.3,
    marginBottom: "2rem",
  };

  return (
    <main
      style={{ background: "var(--color-dark)" }}
      className="min-h-screen flex items-center justify-center px-4 py-16"
    >
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        strategy="afterInteractive"
        onLoad={() => setScriptLoaded(true)}
      />

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
        {/* Honeypot — visually hidden, never seen by real users */}
        <div aria-hidden="true" style={{ display: "none" }}>
          <input
            type="text"
            name="website"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
            tabIndex={-1}
            autoComplete="off"
          />
        </div>

        {/* Q1 — Source */}
        {step === 1 && (
          <div>
            <p style={labelStyle}>Quick intro</p>
            <h1 style={headingStyle}>How did you find this site?</h1>
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
                    e.currentTarget.style.background = "var(--color-teal)";
                    e.currentTarget.style.color = "var(--color-dark)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "var(--color-offwhite)";
                  }}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Q2 — Description */}
        {step === 2 && (
          <form onSubmit={handleDescriptionSubmit}>
            <p style={labelStyle}>About you</p>
            <h1 style={{ ...headingStyle, marginBottom: "1.75rem" }}>
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
              Next &rarr;
            </button>
          </form>
        )}

        {/* Q3 — Interests (multi-select) */}
        {step === 3 && (
          <div>
            <p style={labelStyle}>What you&apos;re looking for</p>
            <h1 style={headingStyle}>What are you curious about?</h1>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "1.5rem" }}>
              {INTEREST_OPTIONS.map((option) => {
                const selected = interests.includes(option);
                return (
                  <button
                    key={option}
                    onClick={() => toggleInterest(option)}
                    style={{
                      width: "100%",
                      padding: "0.875rem 1.25rem",
                      background: selected ? "var(--color-teal)" : "transparent",
                      border: "1.5px solid var(--color-teal)",
                      borderRadius: 8,
                      color: selected ? "var(--color-dark)" : "var(--color-offwhite)",
                      fontFamily: "var(--font-dm-sans)",
                      fontSize: "0.975rem",
                      textAlign: "left",
                      cursor: "pointer",
                      fontWeight: selected ? 600 : 400,
                      transition: "background 0.18s ease, color 0.18s ease",
                    }}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
            {interests.length > 0 && (
              <button
                onClick={() => advance(4)}
                style={{
                  width: "100%",
                  padding: "0.9rem 1.25rem",
                  background: "var(--color-teal)",
                  border: "none",
                  borderRadius: 8,
                  color: "var(--color-dark)",
                  fontFamily: "var(--font-dm-sans)",
                  fontSize: "0.975rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "opacity 0.18s ease",
                }}
              >
                Next &rarr;
              </button>
            )}
          </div>
        )}

        {/* Q4 — Freeform (optional) */}
        {step === 4 && (
          <div>
            <p style={labelStyle}>Almost there</p>
            <h1 style={{ ...headingStyle, marginBottom: "1.75rem" }}>
              Anything else you&apos;d like to see?
            </h1>
            <textarea
              value={freeform}
              onChange={(e) => setFreeform(e.target.value)}
              placeholder="Optional. Anything specific on your mind..."
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
            {/* Turnstile widget — rendered explicitly via turnstile.render() in useEffect */}
            <div id="cf-widget" style={{ marginBottom: "1.25rem" }} />

            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button
                onClick={() => handleFinish(true)}
                disabled={!turnstileToken}
                style={{
                  flex: 1,
                  padding: "0.9rem 1.25rem",
                  background: "transparent",
                  border: "1.5px solid rgba(118,123,122,0.5)",
                  borderRadius: 8,
                  color: "var(--color-gray)",
                  fontFamily: "var(--font-dm-sans)",
                  fontSize: "0.975rem",
                  fontWeight: 500,
                  cursor: turnstileToken ? "pointer" : "not-allowed",
                  opacity: turnstileToken ? 1 : 0.5,
                  transition: "border-color 0.18s ease",
                }}
                onMouseEnter={(e) => {
                  if (turnstileToken) e.currentTarget.style.borderColor = "var(--color-gray)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "rgba(118,123,122,0.5)";
                }}
              >
                Skip
              </button>
              <button
                onClick={() => handleFinish(false)}
                disabled={!turnstileToken}
                style={{
                  flex: 2,
                  padding: "0.9rem 1.25rem",
                  background: turnstileToken ? "var(--color-teal)" : "rgba(75,133,142,0.35)",
                  border: "none",
                  borderRadius: 8,
                  color: turnstileToken ? "var(--color-dark)" : "var(--color-gray)",
                  fontFamily: "var(--font-dm-sans)",
                  fontSize: "0.975rem",
                  fontWeight: 600,
                  cursor: turnstileToken ? "pointer" : "not-allowed",
                  transition: "background 0.18s ease",
                }}
              >
                Let&apos;s go &rarr;
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

"use client";

import { useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabase";

interface AuthModalProps {
  auditId: string;
  onSuccess: () => void;
  onClose: () => void;
}

type Mode = "signup" | "signin";

export default function AuthModal({ auditId, onSuccess, onClose }: AuthModalProps) {
  const [mode, setMode] = useState<Mode>("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [confirmEmail, setConfirmEmail] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = getSupabaseBrowser();

    try {
      if (mode === "signup") {
        const { data, error: signupError } = await supabase.auth.signUp({ email, password });

        if (signupError) {
          setError(signupError.message);
          setLoading(false);
          return;
        }

        if (data.session) {
          // Auto-confirmed â€” attach and proceed
          await attachAndFinish(data.session.user.id);
        } else {
          // Email confirmation required
          setConfirmEmail(true);
          setLoading(false);
        }
      } else {
        const { data, error: signinError } = await supabase.auth.signInWithPassword({ email, password });

        if (signinError) {
          setError(signinError.message);
          setLoading(false);
          return;
        }

        if (data.session) {
          await attachAndFinish(data.session.user.id);
        }
      }
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  async function attachAndFinish(userId: string) {
    if (auditId) {
      try {
        await fetch("/api/attach-guest-audit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ auditId, userId }),
        });
      } catch {
        // Non-fatal â€” audit still generated, just not linked
      }
    }
    setLoading(false);
    onSuccess();
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "0.75rem 1rem",
    background: "var(--bg-surface)",
    border: "1.5px solid rgba(0,32,92,0.18)",
    borderRadius: 8,
    color: "var(--text-primary)",
    fontFamily: "var(--font-poppins)",
    fontSize: "0.95rem",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.15s ease",
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,32,92,0.35)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
        padding: "1rem",
      }}
    >
      <div
        style={{
          background: "var(--bg-surface)",
          border: "1px solid rgba(75,133,142,0.25)",
          borderRadius: 12,
          padding: "2rem",
          width: "100%",
          maxWidth: 420,
          position: "relative",
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "1rem",
            right: "1rem",
            background: "transparent",
            border: "none",
            color: "var(--text-secondary)",
            cursor: "pointer",
            fontSize: "1.25rem",
            lineHeight: 1,
            padding: "0.25rem",
          }}
          aria-label="Close"
        >
          &times;
        </button>

        {confirmEmail ? (
          <div style={{ textAlign: "center" }}>
            <p style={{ color: "var(--accent)", fontSize: "2rem", marginBottom: "1rem" }}>
              âœ“
            </p>
            <h2
              style={{
                fontFamily: "var(--font-poppins)",
                color: "var(--text-primary)",
                fontSize: "1.4rem",
                fontWeight: 600,
                marginBottom: "0.75rem",
              }}
            >
              Check your email
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", lineHeight: 1.6 }}>
              We sent a confirmation link to <strong style={{ color: "var(--text-primary)" }}>{email}</strong>. Your report will be linked when you confirm.
            </p>
          </div>
        ) : (
          <>
            <p
              style={{
                fontFamily: "var(--font-poppins)",
                color: "var(--accent)",
                fontSize: "0.75rem",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                marginBottom: "0.75rem",
              }}
            >
              {mode === "signup" ? "Create an account" : "Sign in"}
            </p>

            <h2
              style={{
                fontFamily: "var(--font-poppins)",
                color: "var(--text-primary)",
                fontSize: "1.4rem",
                fontWeight: 600,
                marginBottom: "1.5rem",
              }}
            >
              Save your report
            </h2>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={inputStyle}
                onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(0,32,92,0.18)")}
              />
              <input
                type="password"
                placeholder={mode === "signup" ? "Create a password" : "Password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                style={inputStyle}
                onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(0,32,92,0.18)")}
              />

              {error && (
                <p style={{ color: "#f87171", fontSize: "0.875rem", margin: 0 }}>{error}</p>
              )}

              <button
                type="submit"
                disabled={loading || !email || !password}
                style={{
                  marginTop: "0.25rem",
                  padding: "0.875rem 1.25rem",
                  background:
                    loading || !email || !password
                      ? "rgba(75,133,142,0.35)"
                      : "var(--accent)",
                  border: "none",
                  borderRadius: 8,
                  color: loading || !email || !password ? "var(--text-secondary)" : "var(--text-on-accent)",
                  fontFamily: "var(--font-poppins)",
                  fontSize: "0.975rem",
                  fontWeight: 600,
                  cursor: loading || !email || !password ? "not-allowed" : "pointer",
                  transition: "background 0.15s ease",
                }}
              >
                {loading ? "Saving..." : mode === "signup" ? "Create account and save" : "Sign in and save"}
              </button>
            </form>

            <p
              style={{
                marginTop: "1rem",
                textAlign: "center",
                color: "var(--text-secondary)",
                fontSize: "0.85rem",
              }}
            >
              {mode === "signup" ? (
                <>
                  Already have an account?{" "}
                  <button
                    onClick={() => { setMode("signin"); setError(""); }}
                    style={{
                      background: "none",
                      border: "none",
                      color: "var(--accent)",
                      cursor: "pointer",
                      fontSize: "0.85rem",
                      padding: 0,
                      textDecoration: "underline",
                    }}
                  >
                    Log in to save.
                  </button>
                </>
              ) : (
                <>
                  New here?{" "}
                  <button
                    onClick={() => { setMode("signup"); setError(""); }}
                    style={{
                      background: "none",
                      border: "none",
                      color: "var(--accent)",
                      cursor: "pointer",
                      fontSize: "0.85rem",
                      padding: 0,
                      textDecoration: "underline",
                    }}
                  >
                    Create an account.
                  </button>
                </>
              )}
            </p>
          </>
        )}
      </div>
    </div>
  );
}


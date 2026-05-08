"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

function getCookie(name: string): string {
  if (typeof document === "undefined") return "";
  const match = document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]*)"));
  return match ? decodeURIComponent(match[1]) : "";
}

export default function ForYouPage() {
  const router = useRouter();

  useEffect(() => {
    const raw = getCookie("wst_visitor");
    let visitor = { source: "", description: "", interests: [] as string[], freeform: "" };

    try {
      if (raw) visitor = JSON.parse(raw);
    } catch {
      // malformed cookie — proceed with empty visitor
    }

    fetch("/api/personalize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(visitor),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Personalize failed");
        return res.json();
      })
      .then((data) => {
        router.push(`/for-you/${data.industry}/${data.solution}`);
      })
      .catch((err) => {
        console.error(err);
        // On failure, redirect to meet to try again
        router.push("/meet");
      });
  }, [router]);

  return (
    <main
      style={{ background: "var(--color-dark)" }}
      className="min-h-screen flex items-center justify-center px-4"
    >
      <div style={{ textAlign: "center" }}>
        <p
          style={{
            fontFamily: "var(--font-dm-sans)",
            color: "var(--color-teal)",
            fontSize: "0.8rem",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            marginBottom: "1.5rem",
          }}
        >
          Personalizing your view
        </p>
        <h1
          style={{
            fontFamily: "var(--font-playfair)",
            color: "var(--color-offwhite)",
            fontSize: "clamp(1.75rem, 5vw, 2.5rem)",
            fontWeight: 600,
            lineHeight: 1.3,
            marginBottom: "2rem",
          }}
        >
          Building your custom view...
        </h1>
        <PulseDot />
      </div>
    </main>
  );
}

function PulseDot() {
  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <style>{`
        @keyframes wst-pulse {
          0%, 100% { opacity: 0.3; transform: scaleX(1); }
          50% { opacity: 1; transform: scaleX(1.15); }
        }
      `}</style>
      <div
        style={{
          width: 48,
          height: 4,
          borderRadius: 2,
          background: "var(--color-teal)",
          animation: "wst-pulse 1.6s ease-in-out infinite",
        }}
      />
    </div>
  );
}

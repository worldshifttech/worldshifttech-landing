import { redirect } from "next/navigation";
import { getSupabase } from "@/lib/supabase";
import Image from "next/image";
import Link from "next/link";

interface PageProps {
  params: Promise<{ industry: string; solution: string }>;
}

export default async function PersonalizedPage({ params }: PageProps) {
  const { industry, solution } = await params;

  const { data, error } = await getSupabase()
    .from("generated_pages")
    .select("*")
    .eq("industry", industry)
    .eq("solution", solution)
    .single();

  if (!data || error) {
    redirect("/meet");
  }

  const useCases: { title: string; description: string }[] = data.use_cases ?? [];

  // Reconstruct human-readable labels from slugs
  const industryLabel = industry
    .split("-")
    .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
  const solutionLabel = solution
    .split("-")
    .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  return (
    <div style={{ background: "#080C14", minHeight: "100vh", fontFamily: "var(--font-dm-sans)" }}>
      {/* Nav */}
      <nav
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "1.25rem 2rem",
          borderBottom: "1px solid rgba(75,133,142,0.15)",
        }}
      >
        <Link href="/">
          <Image
            src="/World_shift_tech_LOGO_WHITE.png"
            alt="World Shift Technologies"
            width={180}
            height={46}
            style={{ objectFit: "contain" }}
          />
        </Link>
        <a
          href="https://calendly.com/fractionalbusinesscompanion/wst"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            padding: "0.55rem 1.25rem",
            background: "var(--color-teal)",
            borderRadius: 999,
            color: "#080C14",
            fontFamily: "var(--font-dm-sans)",
            fontSize: "0.875rem",
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          Book a Call
        </a>
      </nav>

      {/* Main content */}
      <main style={{ maxWidth: 720, margin: "0 auto", padding: "4rem 2rem 6rem" }}>
        {/* Eyebrow */}
        <p
          style={{
            color: "var(--color-teal)",
            fontSize: "0.75rem",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            marginBottom: "1.25rem",
          }}
        >
          {industryLabel} / {solutionLabel}
        </p>

        {/* Headline */}
        <h1
          style={{
            fontFamily: "var(--font-playfair)",
            color: "var(--color-offwhite)",
            fontSize: "clamp(2rem, 5vw, 3rem)",
            fontWeight: 600,
            lineHeight: 1.25,
            marginBottom: "2rem",
          }}
        >
          {data.headline}
        </h1>

        {/* Divider */}
        <div
          style={{
            height: 2,
            background: "var(--color-teal)",
            width: 64,
            borderRadius: 1,
            marginBottom: "3rem",
          }}
        />

        {/* Problem */}
        <section style={{ marginBottom: "2.5rem" }}>
          <p
            style={{
              color: "var(--color-teal)",
              fontSize: "0.7rem",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              marginBottom: "0.75rem",
            }}
          >
            The Problem
          </p>
          <p
            style={{
              color: "var(--color-offwhite)",
              fontSize: "1.0625rem",
              lineHeight: 1.75,
            }}
          >
            {data.problem}
          </p>
        </section>

        {/* Solution */}
        <section style={{ marginBottom: "3rem" }}>
          <p
            style={{
              color: "var(--color-teal)",
              fontSize: "0.7rem",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              marginBottom: "0.75rem",
            }}
          >
            What I&apos;d Build
          </p>
          <p
            style={{
              color: "var(--color-offwhite)",
              fontSize: "1.0625rem",
              lineHeight: 1.75,
            }}
          >
            {data.solution_body}
          </p>
        </section>

        {/* Use Cases */}
        {useCases.length > 0 && (
          <section style={{ marginBottom: "4rem" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                gap: "1.25rem",
              }}
            >
              {useCases.map((uc, i) => (
                <div
                  key={i}
                  style={{
                    background: "#00205C",
                    borderTop: "3px solid var(--color-teal)",
                    borderRadius: 10,
                    padding: "1.5rem",
                  }}
                >
                  <p
                    style={{
                      color: "var(--color-offwhite)",
                      fontWeight: 700,
                      fontSize: "1rem",
                      marginBottom: "0.6rem",
                    }}
                  >
                    {uc.title}
                  </p>
                  <p
                    style={{
                      color: "#F4F2EE",
                      fontSize: "0.9rem",
                      lineHeight: 1.65,
                    }}
                  >
                    {uc.description}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* CTA */}
        <section style={{ textAlign: "center" }}>
          <h2
            style={{
              fontFamily: "var(--font-playfair)",
              color: "var(--color-offwhite)",
              fontSize: "clamp(1.4rem, 3.5vw, 2rem)",
              fontWeight: 600,
              lineHeight: 1.35,
              marginBottom: "1.75rem",
            }}
          >
            Ready to see what this looks like for your business?
          </h2>
          <a
            href="https://calendly.com/fractionalbusinesscompanion/wst"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-block",
              padding: "0.9rem 2.25rem",
              background: "var(--color-teal)",
              borderRadius: 8,
              color: "#080C14",
              fontFamily: "var(--font-dm-sans)",
              fontSize: "1rem",
              fontWeight: 700,
              textDecoration: "none",
              marginBottom: "1.25rem",
            }}
          >
            Book a Call &rarr;
          </a>
          <p
            style={{
              color: "var(--color-offwhite)",
              fontSize: "0.8rem",
            }}
          >
            Save this page. Bookmark this URL to come back to it anytime.
          </p>
        </section>
      </main>
    </div>
  );
}

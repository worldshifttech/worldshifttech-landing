import { cookies } from "next/headers";

export default async function ForYouPage() {
  const cookieStore = await cookies();
  const raw = cookieStore.get("wst_visitor")?.value;

  let description = "";
  try {
    if (raw) {
      const parsed = JSON.parse(decodeURIComponent(raw));
      description = parsed.description ?? "";
    }
  } catch {
    // malformed cookie — render placeholder anyway
  }

  return (
    <main
      style={{ background: "var(--color-dark)" }}
      className="min-h-screen flex items-center justify-center px-4"
    >
      <div style={{ maxWidth: 560, width: "100%", textAlign: "center" }}>
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
            marginBottom: "1.5rem",
          }}
        >
          Building your custom view...
        </h1>
        {description && (
          <p
            style={{
              fontFamily: "var(--font-dm-sans)",
              color: "var(--color-gray)",
              fontSize: "1rem",
              lineHeight: 1.7,
              maxWidth: 400,
              margin: "0 auto",
            }}
          >
            {description}
          </p>
        )}
      </div>
    </main>
  );
}

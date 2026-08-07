// Thin wrapper around Voyage's embeddings API — plain fetch, no SDK, same convention as
// lib/github-app.ts's hand-rolled REST calls for a simple, infrequent request shape.
// Model pinned to voyage-3: confirmed against Voyage's own docs to be fixed at 1024
// dimensions (not configurable, unlike the newer voyage-3.5/voyage-4 families), matching
// knowledge_base_entries.embedding's vector(1024) column exactly. See NOTES.md Session 55.

const VOYAGE_EMBEDDINGS_URL = "https://api.voyageai.com/v1/embeddings";

export async function embedText(text: string): Promise<number[]> {
  const apiKey = process.env.VOYAGE_API_KEY;
  if (!apiKey) {
    throw new Error("VOYAGE_API_KEY is not set");
  }

  const res = await fetch(VOYAGE_EMBEDDINGS_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ input: [text], model: "voyage-3" }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Voyage embeddings request failed: ${res.status} ${errText}`);
  }

  const data = (await res.json()) as { data?: { embedding: number[] }[] };
  const embedding = data.data?.[0]?.embedding;
  if (!embedding) {
    throw new Error("Voyage embeddings response had no embedding array");
  }
  return embedding;
}

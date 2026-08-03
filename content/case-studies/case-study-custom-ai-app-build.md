---
client_type: consultant
industry: technology
pain_points:
  - existing tools did not support the specific workflow needed
  - off-the-shelf solutions required too many workarounds
  - no persistent memory or context across sessions
  - needed AI reasoning layered on top of structured user data
solution_type: custom_app
tools_used:
  - React
  - Supabase
  - Vercel
  - OpenAI API
  - Anthropic Claude API
results:
  time_saved: Replaced 3 separate tools with 1 custom build
  roi: Full ownership of the tool with zero recurring SaaS cost
  payback_period: Immediate on first use
headline: Built a fully custom AI-powered web app from scratch, persistent memory, dynamic content generation, and a personalized experience that no off-the-shelf tool could replicate.
story: >
  Sometimes the right tool doesn't exist yet. This project started with a clear use case and a stack of existing tools that almost fit, but not quite.

  The build: a React web app deployed on Vercel, with Supabase handling persistent data storage across sessions and devices. The Anthropic Claude API drives the intelligence layer, reading stored context, generating dynamic responses, and adapting its behavior based on a structured system prompt built from live user data. OpenAI handles media generation.

  The architecture was designed to be personal but extensible. A character and session data model allows multiple independent instances within the same app. Each session builds on the last: the AI reads past session recaps, campaign notes, and per-user rulings before generating any response. Nothing is stateless.

  Key decisions that made it work: keeping the data layer in Supabase rather than React state (avoids stale closure bugs in async contexts), designing the AI prompt to receive a complete structured snapshot of the user's state on every call, and separating concerns cleanly so new features slot in without touching the core loop.

  The result is a tool that feels purpose-built because it is. It does exactly what it needs to do, nothing more, and it costs less per month than most SaaS subscriptions charge per seat.
---

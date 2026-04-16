# World Shift Technologies — Landing App

Next.js marketing site at worldshifttech.com. Personalized front door: visitors answer 2 questions, Claude generates a custom page based on Drew's case study library.

## Dev

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Build Status

- [x] Next.js scaffold deployed to Vercel
- [x] GitHub repo connected
- [x] ANTHROPIC_API_KEY set in Vercel env
- [x] Brand fonts (Playfair Display, DM Sans) and CSS variables configured
- [x] `/meet` — two-question conversational flow, cookie write, redirect
- [x] `/for-you` — skeleton placeholder (reads `wst_visitor` cookie, shows description)
- [ ] `/api/personalize` — Claude API route: reads case studies + visitor cookie, streams personalized page content
- [ ] `/for-you` — wire real Claude response into the page
- [ ] Case study markdown files in `/content/case-studies/`
- [ ] `/api/ingest-case-study` — Zapier webhook to auto-commit new case studies

## Next Task

**Wire `/api/personalize` Claude API route + connect to `/for-you`**

- Create `/lib/case-studies.ts` to read and parse markdown files from `/content/case-studies/`
- Create `/lib/claude.ts` wrapper using `claude-sonnet-4-20250514`
- Create `/app/api/personalize/route.ts` — POST handler that reads `wst_visitor` cookie, loads case studies, calls Claude with personalization prompt from CLAUDE.md, streams response
- Update `/app/for-you/page.tsx` to call the route and render the streamed personalized content

## Architecture

```
/app
  /page.tsx              — Home (personal intro, Drew photo, CTA → /meet)
  /meet/page.tsx         — Question flow (2 Qs, stores wst_visitor cookie)
  /for-you/page.tsx      — Personalized result (Claude-generated)
  /api
    /personalize/route.ts      — Claude API call w/ visitor + case studies
    /ingest-case-study/route.ts — Zapier webhook for content pipeline
/content
  /case-studies/         — Markdown files, one per case study
/lib
  /case-studies.ts       — Parse case study files
  /claude.ts             — Claude API wrapper
```

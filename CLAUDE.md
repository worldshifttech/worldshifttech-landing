# CLAUDE.md — World Shift Technologies
> This file is the single source of truth for every Claude Code session working on this project.
> Read it fully before writing any code. Every decision should be grounded in this context.

---

## Who This Is For

**Drew Griffiths** — founder of World Shift Technologies (worldshifttech.com), also branded as Fractional Business Companion. Drew builds AI Super Agents and workflow automation systems for growing businesses. His core value proposition: **"I build digital copies of you."**

Drew works with solo consultants, agencies, and growing teams who are drowning in operational work. He doesn't sell software — he builds AI employees that actually do the work.

**Contact:**
- Email: drew@worldshifttech.com
- Calendly: calendly.com/fractionalbusinesscompanion/wst

---

## What We're Building

A Next.js marketing app at worldshifttech.com with two systems:

### System 1 — Personalized Front Door (the app)
A visitor lands on a clean, personal home screen introducing Drew and the mission. They then answer 2 questions:
1. "How did you find this site?" (options: I know Drew personally / Found it through search / Referred by someone / Saw Drew's work somewhere)
2. "Briefly describe what you do." (short text field)

Based on their answers, the app calls the Claude API with Drew's case study library as context and generates a **personalized landing page** — their specific pain, Drew's relevant proof, and 2-3 use case scenarios tailored to them.

A session cookie stores their answers and generated page so returning visitors see their personalized version immediately without re-answering.

### System 2 — Content Pipeline (back-end brain)
Drew uploads a case study doc to a designated Google Drive folder. A Zapier webhook hits a Vercel API route, which reads the doc, asks Claude to extract and format it into the case study schema, and commits it to the `/content/case-studies/` folder in this repo. Vercel auto-redeploys. The personalization engine always has fresh proof.

---

## Brand

**Colors** (per `WST_BRAND_STYLE_SHEET.pdf`, light-theme rebrand 2026):
- Tech Blue: `#00205C` (primary text/headings, nav/footer brand band)
- World Teal: `#4B858E` (accent, CTAs, highlights — unchanged)
- Soft Teal: `#91B6BB` (secondary accent — badges, subtle hover fills)
- Soft Gray: `#76777A` (secondary/muted text — corrected from prior `#767B7A`)
- Off-white: `#F4F2EE` (default page background)
- White: `#FFFFFF` (elevated card/surface background)
- Near-black: `#080C14` (kept narrowly as text-on-teal in buttons, e.g. `bg-teal text-near-black`; no longer used as a page background)

**Logo files:** `_old-site/World_shift_tech_LOGO_PRIMARY.png` (navy logo — use everywhere now; the white logo variant is retired since the site is no longer dark)
**Headshot:** `_old-site/Drew_Headshot.jpg`

**Typography direction:** Premium, professional, founder-led. Not generic AI agency. Light backgrounds with navy text and teal accents — the app now hosts client portals showing project roadmaps, so readability comes first. Personal and human, not corporate.

**Tone:** Direct. Warm. Outcome-focused. No corporate jargon. No em-dashes. Speaks to operators, not executives.

---

## Positioning & Messaging

**Primary headline (use this):**
> "Your Next Hire Shouldn't Be a Person. It Should Be an AI Super Agent."

**Subheadline:**
> "Custom AI automations built, managed, and optimized inside your ClickUp workspace. For solo professionals, agencies, and growing teams who are done wasting time on repetitive operations."

**Core positioning:**
- World Shift Technologies is in an uncontested market position — nobody offers ClickUp Brain agents as a managed service
- ZenPilot charges $4K–$75K with zero AI capability. Fractional COOs cost $10K–$20K/month with no tech implementation. Drew delivers both at $500–$5K/month
- Lead with outcomes, not technology. "We build digital employees that save you 2 days per week" — not "we build Zapier workflows"
- The fractional COO comparison is the strongest anchor: same operational leverage at 10–30% of the cost, with 24/7 execution

**Audience pain points to reference:**
- Solo founders: "I'm the bottleneck," revenue ceiling because all hours go to maintenance, 2+ hours/day on admin
- Agencies: 70% report burnout, doing more work for less money per project, fear of competitive irrelevance
- Both: tried Zapier (broke), tried VAs (quit or guessed wrong), tried ChatGPT (can't trust it enough)

**Key stats to use:**
- $12B AI agent market in 2024, projected $48B by 2030
- 60% of job roles have 1/3 of activities automatable (McKinsey)
- 55% reduction in first response time with AI agents
- 3.5–8x ROI documented in implementations
- $1,700 investment → $16,800 measurable annual value (Rafael case study)
- ROI typically pays back in 30–60 days

---

## Services Drew Offers

1. **AI Super Agents** — ClickUp Brain agents that handle operational tasks (onboarding, QA, reporting, customer service, meeting notes)
2. **Workflow Automation** — Zapier, Make.com, n8n builds
3. **ClickUp Implementation** — Full workspace architecture and systems
4. **Fractional COO Advisory** — Strategic operations leadership
5. **AI Agent Development** — Custom agent builds beyond ClickUp

**Pricing:** Not published on the site. Every engagement is scoped and priced per client
internally (see admin/project tooling in `/app/admin` and `/app/projects`), not shown as
public tiers. The `$500–$5K/month` range below is internal positioning context only, for
comparing against ZenPilot/fractional COO costs — don't surface it as a pricing table or
tier list on any public page. The one exception is the AI audit itself (`/app/audit`),
which has its own disclosed flat fee ($500–$1,500) since that's a distinct, bounded offer.

---

## Case Study Library

Case studies live in `/content/case-studies/` as markdown files. Each follows this schema:

```
---
client_type: [agency | saas | nonprofit | consultant | family_business]
industry: [digital_marketing | technology | nonprofit | creative_studio | distribution]
pain_points: [array of strings]
solution_type: [super_agent | clickup_implementation | automation | fractional_coo]
tools_used: [array: clickup, zapier, make, n8n, claude, etc.]
results:
  time_saved: [X hours/week]
  roi: [$ annual value or X% improvement]
  payback_period: [timeframe]
headline: [one sentence outcome]
story: [markdown narrative, 200-400 words]
---
```

**Current case studies (anonymized):**
- Digital marketing agency: ClickUp rebuild + AI agent system (Boost Local type)
- SaaS company: Customer success automation, 10–15 hours/week saved
- Technology firm: Knowledge management agent, $50K–$100K/year institutional knowledge preserved
- Nonprofit: Donor automation, Zapier + Mailchimp integration
- Creative studio: Intake and triage system, Jotform + ClickUp optimization
- Consultant: Meeting prep automation, $1,700 investment → $16,800 annual value

---

## App Architecture

```
/app
  /page.tsx              — Home screen (personal intro, Drew photo, mission)
  /meet/page.tsx         — Question flow (2 questions)
  /for-you/page.tsx      — Personalized result page (generated by Claude API)
  /api
    /personalize/route.ts  — Claude API call with visitor answers + case studies
    /ingest-case-study/route.ts  — Webhook endpoint for Zapier content pipeline
/content
  /case-studies/         — Markdown files, one per case study
/lib
  /case-studies.ts       — Helper to read and parse case study files
  /claude.ts             — Claude API wrapper
  /session.ts            — Cookie session management
/public
  /Drew_Headshot.jpg
  /World_shift_tech_LOGO_PRIMARY.png
```

---

## Session / Cookie Logic

- On first visit: generate UUID, store in cookie `wst_session`
- After question flow: store answers in cookie `wst_visitor` as JSON
- After page generation: cache generated content in cookie or simple KV store
- On return visit: detect cookie, skip questions, render personalized page directly
- Cookie expiry: 30 days

---

## Claude API Usage

Model: `claude-sonnet-4-20250514`

**Personalization prompt structure:**
```
System: You are the content engine for World Shift Technologies. 
Given a visitor's background and how they found the site, 
generate a personalized landing page that speaks directly to their situation.
Use the provided case studies as proof. Be direct, warm, outcome-focused.
No em-dashes. No corporate jargon.

Context provided:
- Visitor source: [how_they_found_site]
- Visitor description: [what_they_do]
- Available case studies: [relevant_case_studies_as_JSON]

Generate:
1. A headline that speaks to their specific situation
2. 2-3 sentences describing their pain as Drew understands it
3. The most relevant case study match with results
4. 2-3 specific use case scenarios for their business type
5. A CTA that fits their context
```

---

## Design Rules

- Light backgrounds (off-white `#F4F2EE` default, white `#FFFFFF` for elevated cards/surfaces)
- Navy (`#00205C`) for primary text and headings; teal (`#4B858E`) and soft teal (`#91B6BB`) for accents, CTAs, highlights
- Soft gray (`#76777A`) for secondary/muted text
- Premium, professional, highly readable typography — single Poppins family (Google Fonts) in two weight roles: Poppins 300 for headlines/section titles, Poppins 400/500 for body — upright only, no italics
- Drew's headshot is prominent on the home screen — this site is personal and founder-led
- No generic AI aesthetics (no purple gradients, no Inter font, no cookie-cutter layouts)
- Mobile responsive — Drew sends people here from his phone
- Fast — personalized page should feel instant (stream the response if needed)

---

## What NOT to Do

- Don't use em-dashes anywhere in copy
- Don't lead with technology — lead with outcomes
- Don't make this feel like a SaaS product page — it's a founder's personal practice
- Don't hide Drew's face — the headshot is a conversion signal
- Don't publish pricing tiers or numbers on public pages — pricing is scoped per client internally, not shown on the site (exception: the audit's flat fee, which is a disclosed standalone offer)
- Don't make the question flow feel like a form — it should feel like a conversation
- Don't generate a wall of text for the personalized page — it should feel curated and specific

---

## Current Status

- [x] Next.js scaffold deployed to Vercel
- [x] GitHub repo: worldshifttech/worldshifttech-landing
- [x] ANTHROPIC_API_KEY set in Vercel environment variables
- [ ] Home page built
- [ ] Question flow built
- [ ] Claude API personalization route built
- [ ] Personalized result page built
- [ ] Case study content files created
- [ ] Content pipeline (Zapier webhook) built

---

## First Session Goal

Build the home page (`/app/page.tsx`) and question flow (`/app/meet/page.tsx`).

The home page should:
- Feel personal and clean
- Show Drew's headshot prominently
- Have a clear headline and 2-3 sentence intro
- Single CTA: "See What I'd Build For You" → goes to /meet

The question flow should:
- Ask 2 questions conversationally, one at a time
- Question 1: How did you find this site? (4 options as clickable cards)
- Question 2: Briefly describe what you do (text input)
- On submit: store in cookie, redirect to /for-you

Start with the home page. Get it looking right before moving on.

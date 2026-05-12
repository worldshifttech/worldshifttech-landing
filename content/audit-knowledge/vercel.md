# Vercel — WST Audit Reference
**Category:** Cloud Infrastructure / Hosting | **Infrastructure:** AWS (WUE 0.15 L/kWh)

## Why This Matters
Vercel runs on AWS infrastructure, inheriting AWS's industry-leading WUE of 0.15 L/kWh. Its serverless and edge architecture is inherently lean — functions scale to zero when idle. The waste comes from configuration choices: always-on compute, stale preview deployments accumulating, oversized bundles increasing CDN edge execution time, and unused team seats.

## Platform Footprint Facts
| Factor | Context |
|---|---|
| Vercel infrastructure | AWS (confirmed via vercel.com/partners/aws) |
| AWS WUE (2024) | 0.15 L/kWh — 8x better than industry average |
| Serverless functions | Scale to zero — no idle compute when not invoked |
| Edge functions | Distributed globally — compute runs close to the user, reducing network energy |
| Preview deployments | Each active deployment consumes ongoing CDN and storage resources |
| Carbon/energy reporting | No published sustainability data specific to Vercel |

## Reduction Strategies

### 1. Delete stale preview deployments
- Vercel retains preview deployments indefinitely by default — every open PR branch and every manual deploy is kept live
- Go to the project dashboard, filter by "Preview" — delete anything older than 30 days that is not actively linked to an open PR
- **Typical finding: teams accumulate 20–60 stale preview deployments over 6 months**
- Enable automatic deployment deletion in Project Settings > Git > Auto-delete deployments

### 2. Reduce function bundle sizes
- Oversized bundles increase cold start time and edge execution time — both translate to more compute per invocation
- Run `next build` locally with `ANALYZE=true` to identify large dependencies
- Replace heavy libraries with lighter alternatives where possible (e.g. date-fns instead of moment.js)

### 3. Review Vercel team seat count
- Check team members at vercel.com/[team]/settings/members — remove members who are no longer active on the project
- Each Pro seat costs $20/month; Enterprise seats scale higher

### 4. Cache aggressively at the edge
- Set appropriate `Cache-Control` headers on static assets and API responses
- Proper caching reduces function invocation volume — fewer invocations = less compute

### 5. Evaluate always-on vs serverless compute
- If using Vercel Functions for tasks that run constantly, evaluate whether they belong on Vercel at all vs a dedicated long-running service

## Audit Questions
- How many active deployments are in the Vercel dashboard? How many are preview vs production?
- When were the oldest preview deployments created? Are they still linked to open PRs?
- What is the monthly function invocation count and has it grown unexpectedly?
- How many team members have Vercel access? When did each last log in?
- Are cache headers set on static assets and API routes?
- Is `ANALYZE=true` bundle analysis available and has it been run recently?

## Key Metrics
| Metric | Figure |
|---|---|
| Preview deployment accumulation | 20–60 stale deployments typical in 6-month-old projects |
| AWS WUE | 0.15 L/kWh (AWS Sustainability Report 2024) |
| Serverless idle cost | $0 — functions scale to zero |
| Pro seat cost | $20/month per removed unused seat |

## Recommended Actions
| Action | Effort | Impact |
|---|---|---|
| Delete stale preview deployments | Low | Medium — reduces CDN and storage overhead |
| Enable auto-delete for preview deployments | Low | High — prevents future accumulation |
| Audit and reduce team seat count | Low | Medium |
| Run bundle analysis and trim large dependencies | Medium | Medium — faster cold starts, less execution time |
| Set cache headers on static and API routes | Low–Medium | High — reduces invocation volume |

**Green scoring:** Serverless-only, auto-scaled, aggressive caching = Light. Always-on compute or large bundle sizes with high invocation volume = Moderate.

## Sources
- AWS Sustainability Report 2024 (WUE figures): sustainability.aboutamazon.com
- Vercel infrastructure on AWS: vercel.com/partners/aws

---
*WST Audit Knowledge Base | Internal Reference Only | Verify figures annually.*

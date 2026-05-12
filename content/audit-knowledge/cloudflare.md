# Cloudflare — WST Audit Reference
**Category:** Cloud Infrastructure / CDN & Security | **Infrastructure:** Cloudflare Global Network (Carbon Neutral since 2021)

## Why This Matters
Cloudflare operates its own global network of 300+ data centers, distinct from AWS/GCP/Azure. It has been carbon neutral since 2021 and uses renewable energy matching for its network. Its edge architecture is designed for energy efficiency: compute runs at the edge closest to the user, reducing both latency and the energy cost of long-distance data transfer. The waste is not in the infrastructure but in misconfiguration: cache bypasses that send requests all the way to the origin server instead of serving from the edge, unnecessary Worker executions, and unused features accumulating on the account.

## Platform Footprint Facts
| Factor | Context |
|---|---|
| Cloudflare infrastructure | Proprietary global network — not AWS/GCP/Azure |
| Carbon neutral status | Certified carbon neutral since 2021 |
| Edge compute model | Workers run at the edge — no cold starts, low latency, energy-efficient |
| Cache hit rate impact | Every cache miss routes traffic to origin server — more compute, more energy |
| Carbon/energy reporting | Annual sustainability report published |

## Reduction Strategies

### 1. Maximise cache hit rate
- A cache hit serves the response entirely from Cloudflare's edge — no origin request, minimal compute
- Check the Cloudflare dashboard Analytics > Cache — identify the cache hit ratio for your domain
- **Target cache hit ratio: above 85% for content-heavy sites; above 60% for application sites**
- Review Cache Rules: ensure static assets (JS, CSS, images, fonts) are cached with long TTLs
- Identify routes where `Cache-Control: no-store` is set unnecessarily

### 2. Audit Cloudflare Workers for unused or inefficient scripts
- Go to Workers & Pages — list all deployed Workers
- Identify Workers with zero invocations in the past 30 days and delete them
- Review high-invocation Workers for efficiency: unnecessary compute in a Worker runs on every request globally

### 3. Review Cloudflare Pages projects
- Pages projects accumulate preview deployments similar to Vercel
- Delete stale Pages deployments and projects from completed work

### 4. Disable unused Cloudflare features
- Cloudflare adds features over time: Bot Fight Mode, Waiting Room, Email Routing, Turnstile widgets, Stream — audit which are active and which are unused
- Each unused feature adds configuration overhead and in some cases processing on every request

### 5. Review DNS-only vs proxied records
- Records set to DNS-only (grey cloud) bypass Cloudflare entirely — these get no caching, no security, and no edge benefit
- Evaluate whether any proxied records should be DNS-only or vice versa

## Audit Questions
- What is the current cache hit ratio for the primary domain? Has it been reviewed recently?
- How many Cloudflare Workers are deployed and when were each last invoked?
- Are there Cloudflare Pages projects from completed or abandoned work?
- Which Cloudflare features are enabled (Bot Fight Mode, Waiting Room, Stream, Turnstile, Email Routing)?
- Are Cache Rules configured for static assets?
- Are there any routes with `Cache-Control: no-store` that could be cached?

## Key Metrics
| Metric | Figure |
|---|---|
| Target cache hit ratio | 85%+ for content sites; 60%+ for app sites |
| Carbon neutral status | Since 2021 |
| Cache miss cost | Full origin request — server compute + network transit |
| Unused Worker threshold | Zero invocations in 30 days = candidate for deletion |

## Recommended Actions
| Action | Effort | Impact |
|---|---|---|
| Review and improve cache hit ratio | Low–Medium | High — reduces origin compute |
| Delete unused Workers | Low | Medium |
| Configure Cache Rules for static assets | Low–Medium | High |
| Delete stale Pages deployments | Low | Low–Medium |
| Audit and disable unused Cloudflare features | Low | Low–Medium |

**Green scoring:** High cache hit ratio, no unused Workers, carbon-neutral infrastructure = Light. Low cache hit ratio with frequent origin requests and unused Workers = Moderate.

## Sources
- Cloudflare Sustainability: cloudflare.com/impact
- AWS Sustainability Report 2024 (WUE benchmark reference)

---
*WST Audit Knowledge Base | Internal Reference Only | Verify figures annually.*

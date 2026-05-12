# ChatGPT / OpenAI — WST Audit Reference
**Category:** AI/LLM Tools | **Infrastructure:** Microsoft Azure + AWS

## Why This Matters
GPT-4o consumes ~0.3 Wh per typical text query. At 8 queries/day per user, a 10-person team runs roughly 29,200 queries/year (~8.8 kWh total). Switching to a smaller model for routine tasks can cut that energy cost by 50–90%. Image generation is 60x more expensive than text — every AI image costs as much as charging a smartphone halfway.

## Platform Footprint Facts
| Query Type | Energy per Query | Water Equivalent |
|---|---|---|
| Typical text (GPT-4o) | ~0.3 Wh | ~0.54 ml |
| Long-context / reasoning (o3) | ~39 Wh | ~70 ml |
| Image generation (DALL-E 3) | ~2.9 Wh | ~5.2 ml |
| GPT-4.1 nano (small model) | ~0.5 Wh vs o3 | ~0.9 ml |
| 10-person team, 1yr text use | ~8.8 kWh | ~15.8 liters |

Water figures use industry average WUE of 1.8 L/kWh (The Green Grid, EESI 2024).
Sources: Epoch AI / arxiv:2505.09598 (May 2025), arxiv:2602.22261 (2025)

## Reduction Strategies

### 1. Right-size the model for the task
Research shows switching from largest to task-appropriate model reduces energy by 50–88% with minimal quality loss (arxiv:2510.01889, 2025).
- Audit every active use case: what is GPT-4o being used for vs what GPT-4o mini or GPT-4.1 nano could handle equally well
- Route simple tasks (summarise, classify, format, draft) to smaller models via API or custom GPT instructions
- Reserve frontier models (o3, GPT-4o) for complex reasoning, code architecture, or high-stakes outputs only
- **Target: 40–60% of current usage shifted to smaller models within 30 days**

### 2. Eliminate image generation waste
Image generation is 10–60x more energy-intensive than text.
- Audit: how many images are generated per week and for what purpose
- Eliminate one-off test generations — use reference images or stock where quality is not critical
- Batch image needs into single sessions rather than scattered individual prompts

### 3. Remove idle and redundant subscriptions
- Audit every ChatGPT Plus/Team/Enterprise seat against last-login data from the admin dashboard
- Eliminate seats with fewer than 5 logins in the past 30 days
- **Typical finding: 20–40% of seats are underused or duplicated**

### 4. Optimise prompt efficiency
- Strip bloated system prompts: remove boilerplate, consolidate instructions
- Use single-turn prompts for tasks that don't require dialogue
- Cache outputs where the same query is likely to repeat

## Audit Questions
- How many ChatGPT seats are active? When did each user last log in?
- What are the primary use cases — writing, coding, research, image gen?
- Are they using the API directly, custom GPTs, or the chat interface?
- How many images are generated per week through any OpenAI product?
- Are there personal Plus subscriptions running alongside a company plan?
- Is any usage automated (scheduled, webhook, or API-driven)?

## Key Metrics
| Metric | Figure | Source |
|---|---|---|
| Model switching energy reduction | Up to 67.5% | arxiv:2602.22261, 2025 |
| Quality retained after model switch | 93.6% | arxiv:2602.22261, 2025 |
| Image gen vs text energy cost | 10–60x more expensive | Nathan Bailey / Medium, 2025 |
| Typical unused seat rate | 20–40% | WST audit experience |
| Per-seat saving (Team plan) | $20/month | OpenAI pricing |

**Water proxy:** kWh saved × 1.8 L/kWh = liters of cooling water preserved
**CO2 proxy:** kWh saved × 0.385 kg CO2e/kWh = kg CO2e avoided

## Recommended Actions
| Action | Effort | Impact |
|---|---|---|
| Audit and remove unused seats | Low | High |
| Route simple tasks to smaller models | Medium | High — 50–67% energy reduction |
| Eliminate or batch image generation | Low | Medium — 10–60x per-image reduction |
| Optimise system prompts | Medium | Medium |
| Cache repeat queries via API layer | High | High — eliminates redundant model calls |

## Provider Sustainability Posture
OpenAI does not publish granular energy or water data per query. Microsoft Azure (WUE 0.30 L/kWh) and AWS (WUE 0.15 L/kWh) host OpenAI infrastructure.

**WST position:** Do not claim OpenAI infrastructure is "green." The honest framing: the best environmental action is to run fewer and smaller queries.
**Green scoring:** Heavy AI use with no model discipline = Heavy. Disciplined model routing = Moderate. No AI use = Light.

---
*WST Audit Knowledge Base | Internal Reference Only | Verify figures annually.*

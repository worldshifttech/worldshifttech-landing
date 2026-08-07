# Claude / Anthropic — WST Audit Reference
**Category:** AI/LLM Tools | **Infrastructure:** AWS (WUE 0.15 L/kWh)

## Why This Matters
Claude runs on AWS — the most water-efficient hyperscale infrastructure available (WUE 0.15 L/kWh, 8x better than industry average). Anthropic does not publish per-query energy figures. Relative model tiers: Haiku costs roughly 10–15% of Opus energy. The biggest lever is model tier selection and whether automations are calling Sonnet/Opus for tasks Haiku would handle equally well.

## Platform Footprint Facts
| Model | Relative Energy Cost | Best Use Case |
|---|---|---|
| Claude Haiku 4.5 | Lowest (~10–15% of Opus) | Classification, extraction, routing, simple Q&A |
| Claude Sonnet 4.6 | Mid (~30–40% of Opus) | Writing, analysis, code, most business tasks |
| Claude Opus 4.6 | Highest (baseline) | Complex reasoning, architecture, high-stakes tasks |
| Claude Code sessions | Variable — 5–50x single query | Full agentic coding runs |

AWS WUE: 0.15 L/kWh (AWS Sustainability Report 2024).

## Reduction Strategies

### 1. Default to Haiku for high-volume, low-complexity tasks
- Audit any API integrations calling claude-sonnet-* or claude-opus-* and evaluate whether Haiku produces acceptable output
- Run a side-by-side test on 20 sample inputs from their most common use case
- **Target: route 50–70% of automated calls to Haiku**

### 2. Reduce max_tokens and trim system prompts
- Set max_tokens to the realistic ceiling for the task
- Strip redundant system prompt instructions
- Use structured JSON output formats to prevent discursive responses

### 3. Cache at the application layer
- Build lightweight cache keyed on prompt hash
- **Can eliminate 30–60% of API calls in high-volume automation contexts**

### 4. Rationalise Claude.ai seat usage
- Identify single-purpose users whose use case could be served by a purpose-built internal tool

## Audit Questions
- Are they using Claude via Claude.ai or the API?
- If API: which models are in use? What is the monthly token volume by model?
- What automations or integrations are calling Claude and how frequently?
- Are there any Claude Code sessions running as part of a dev workflow?
- How many Pro or Team seats? When did each user last log in?
- Is any caching in place for repeated prompts?

## Key Metrics
| Metric | Figure | Source |
|---|---|---|
| Haiku vs Sonnet token cost ratio | ~10x cheaper per token | Anthropic pricing |
| Caching potential | 30–60% API call reduction | WST estimation |
| AWS WUE | 0.15 L/kWh | AWS Sustainability Report 2024 |
| Industry average WUE | 1.8–1.9 L/kWh | The Green Grid / EESI 2024 |

## Recommended Actions
| Action | Effort | Impact |
|---|---|---|
| Route automation to Haiku | Low–Medium | High — 70%+ cost and energy reduction |
| Trim max_tokens and system prompts | Low | Medium — 10–30% token reduction |
| Implement response caching | Medium–High | High — eliminates redundant calls |
| Remove underused Claude.ai seats | Low | Medium |
| Cap Claude Code session length | Low | Medium |

## Provider Sustainability Posture
**WST position:** Accurate framing: "Claude runs on infrastructure that is among the most renewable-committed available." Do not claim carbon neutrality directly.
**Green scoring:** Heavy unoptimised API use = Heavy. Haiku-routed, cached automation = Light–Moderate.

---
*WST Audit Knowledge Base | Internal Reference Only | Verify figures annually.*

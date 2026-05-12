# Notion — WST Audit Reference
**Category:** Project Management / SaaS | **Infrastructure:** AWS (WUE 0.15 L/kWh)

## Why This Matters
Notion runs on AWS. Its environmental footprint per user is relatively low — primarily storage and rendering. Notion AI is an add-on ($8–10/member/month) that calls external LLMs per generation. The waste is financial and structural: AI seats enabled for non-users, stale databases, duplicate workspaces, and inactive members.

## Platform Footprint Facts
| Factor | Context |
|---|---|
| Notion infrastructure | AWS — inherits AWS sustainability posture |
| AWS WUE (2024) | 0.15 L/kWh — 8x better than industry average |
| Notion AI | Calls external LLMs per generation ($8–10/member/month add-on) |
| Carbon/energy reporting | No published sustainability data |

## Reduction Strategies

### 1. Audit Notion AI usage and seat cost
- Disable AI access for members who haven't used it in 30+ days
- **A 10-person team with 7 non-AI-users paying the add-on = $560–700/year unnecessary spend**

### 2. Consolidate and archive the workspace
- Archive databases not edited in 90+ days
- **Typical finding: 40–60% of databases in accounts older than 12 months are effectively abandoned**

### 3. Remove unused members and guests
- Remove members who have not logged in within 60 days

### 4. Evaluate whether Notion is the right tool for each use case
- Clients using Notion as a CRM with 2,000+ records almost always struggle — signal to evaluate alternatives

## Audit Questions
- How many members and guests are in the workspace?
- Is Notion AI enabled? For how many members? How is it used?
- What are the primary use cases: documentation, project tracking, CRM, knowledge base?
- How many databases? When were the oldest ones last edited?
- Are there team members or guests who are no longer active at the company?

## Key Metrics
| Metric | Figure |
|---|---|
| AI add-on waste | ~70% of AI seats often unused in SMB workspaces |
| Stale database rate | 40–60% inactive in accounts older than 12 months |
| Cost-per-active-user signal | Above $30/user = over-provisioned |
| AI add-on cost | $8–10/member/month |

## Recommended Actions
| Action | Effort | Impact |
|---|---|---|
| Remove unused Notion AI seats | Low | High — $8–10/month per removed seat |
| Remove inactive members and guests | Low | Medium–High |
| Archive stale databases and pages | Low | Medium |
| Consolidate duplicate databases | Medium | Medium |
| Evaluate tool fit for each use case | Medium | High |

**Green scoring:** Notion-as-everything with AI enabled = Moderate. Clean documentation and knowledge base use only = Light.

---
*WST Audit Knowledge Base | Internal Reference Only | Verify figures annually.*

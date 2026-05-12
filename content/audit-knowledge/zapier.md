# Zapier — WST Audit Reference
**Category:** Automation Platforms | **Infrastructure:** AWS (WUE 0.15 L/kWh)

## Why This Matters
Zapier does not publish carbon or energy data. Its footprint is indirect — every Zap that fires triggers compute on Zapier's servers plus API calls to connected tools. The waste comes from Zaps firing unnecessarily, AI steps called on every record with no filter, and deprecated workflows nobody turned off.

## Platform Footprint Facts
| Factor | Context |
|---|---|
| Zapier infrastructure | AWS-hosted |
| AWS WUE (2024) | 0.15 L/kWh — 8x better than industry average |
| AWS renewable energy | Largest corporate buyer globally (5th year) |
| Zapier carbon reporting | No published emissions data |
| Zapier AI steps | Each calls an external LLM (OpenAI, etc.) |

## Reduction Strategies

### 1. Audit and kill dead Zaps
- Sort Zap list by "Last successful run" — anything with no successful run in 60+ days is a candidate for deletion
- Filter by Zap owner: if the owner is a former employee, the Zap is almost certainly dead weight
- **Typical finding: 20–40% of Zaps in a mature account are dormant or broken**

### 2. Reduce over-triggered Zaps
- Add or tighten Filter steps early in the Zap — before AI steps or expensive actions
- Replace polling triggers with webhook triggers where the source app supports it

### 3. Eliminate AI steps on every record
- Add a condition: only call AI if [field] meets [criteria]
- Consider whether the AI step is needed at all or whether a formatter/template produces the same result

### 4. Consolidate overlapping Zaps
- Merge where possible into a single Zap with Paths branching

### 5. Review plan tier vs actual usage
- Task consumption often drops 30–50% after cleanup — may enable plan downgrade

## Audit Questions
- How many active Zaps are in the account? When were the oldest ones built?
- What is the monthly task consumption and what plan tier are they on?
- Are there Zaps owned by people who are no longer at the company?
- Which Zaps use AI steps? What LLM are those steps calling?
- Are any Zaps polling-based that could be replaced with webhook triggers?
- Have any Zaps been throwing consistent errors without being fixed or deleted?

## Key Metrics
| Metric | Figure |
|---|---|
| Dead Zap rate in mature accounts | 20–40% dormant or broken |
| Filter optimisation on AI step Zaps | 50–90% task reduction |
| Task consumption drop after cleanup | 30–50% typical |
| Useful output rate formula | Meaningful outputs / Total tasks fired |

## Recommended Actions
| Action | Effort | Impact |
|---|---|---|
| Delete dormant and broken Zaps | Low | High |
| Add filters before AI steps | Low | High — 50–90% task reduction |
| Switch polling to webhook triggers | Medium | Medium |
| Consolidate duplicate Zaps | Medium | Medium |
| Review plan tier after cleanup | Low | Medium |

**Green scoring:** High-volume Zaps with AI steps and no filters = Heavy. Filtered, webhook-driven workflows = Light.

---
*WST Audit Knowledge Base | Internal Reference Only | Verify figures annually.*

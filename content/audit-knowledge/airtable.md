# Airtable — WST Audit Reference
**Category:** Project Management / SaaS | **Infrastructure:** AWS (WUE 0.15 L/kWh)

## Why This Matters
Airtable runs on AWS. Its per-user environmental footprint is low. The waste is structural and financial: abandoned bases, inactive automations, underused seats, and AI fields running on every record when they should be conditional.

## Platform Footprint Facts
| Factor | Context |
|---|---|
| Airtable infrastructure | AWS — inherits AWS sustainability posture |
| AWS WUE (2024) | 0.15 L/kWh — 8x better than industry average |
| Airtable AI | Calls external LLMs per generation |
| Airtable Automations | Runs server-side on every trigger against monthly run budget |
| Carbon reporting | No published sustainability data |

## Reduction Strategies

### 1. Audit and remove inactive bases and tables
- Sort bases by "Last modified" — archive anything not modified in 90+ days
- **Typical finding: 30–50% of bases in accounts older than 12 months are effectively abandoned**

### 2. Audit Airtable automations
- Review run history for the past 30 days, add conditions to prevent unnecessary runs
- Delete or disable automations in bases no longer actively used

### 3. Remove inactive members and manage seat count
- Filter members by last active date, remove anyone inactive 60+ days
- Evaluate whether view-only users should be downgraded to Viewer role

### 4. Evaluate Airtable AI usage
- Ensure AI fields only run on records that need them — not batch-processing entire tables on every update

### 5. Evaluate tool fit
- Flag any base with 5,000+ records where users report it feeling slow
- If Airtable is being used as a CRM replacement, evaluate purpose-built alternatives

## Audit Questions
- How many bases are in the workspace? When were the oldest ones last modified?
- How many creator/editor seats? When did each user last log in?
- Are automations running in active bases? How many run per month total?
- Is Airtable AI enabled? For which bases and fields?
- What are the primary use cases?
- Are there any bases users report as slow or hard to navigate?

## Key Metrics
| Metric | Figure |
|---|---|
| Inactive base rate | 30–50% abandoned in accounts older than 12 months |
| Seat waste benchmark | 20–30% of editor seats typically inactive |
| Cost-per-active-user signal | Above $25/user = over-provisioned |

## Recommended Actions
| Action | Effort | Impact |
|---|---|---|
| Archive or delete inactive bases | Low | High |
| Remove inactive members or downgrade to Viewer | Low | High |
| Audit and tighten automation trigger conditions | Low–Medium | Medium |
| Disable unused automations in inactive bases | Low | Medium |
| Evaluate AI field usage | Low–Medium | Medium |
| Evaluate tool fit for each use case | Medium | High |

**Green scoring:** Heavy automation volume with AI fields on all records = Moderate. Clean structured data with minimal automations = Light.

---
*WST Audit Knowledge Base | Internal Reference Only | Verify figures annually.*

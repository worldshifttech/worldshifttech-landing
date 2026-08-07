# Make (formerly Integromat) — WST Audit Reference
**Category:** Automation Platforms | **Infrastructure:** Google Cloud Platform

## Why This Matters
Make runs on Google Cloud Platform (PUE 1.09, 66% CFE%). Operation-based pricing makes waste highly visible: every module execution = 1 operation. A scenario with 8 modules running 1,000 times/month = 8,000 operations.

## Platform Footprint Facts
| Factor | Context |
|---|---|
| Make infrastructure | Google Cloud Platform (GCP) |
| GCP PUE (2024) | 1.09 — 84% less overhead energy than industry average |
| GCP CFE% (2024) | 66% carbon-free hourly average |
| Make carbon reporting | No published emissions data |
| Operation model | Each module execution = 1 operation; billed monthly |

## Reduction Strategies

### 1. Identify high-operation, low-value scenarios
- Sort scenarios by operations consumed in the past 30 days
- **Slowing a 15-minute polling scenario to 2-hour polling reduces execution frequency by 87%**

### 2. Add filters at the beginning of every scenario
Filter steps are free (0 operations). Everything after them costs operations.
- Move filter conditions to be the first module after the trigger
- **Can reduce total operations by 40–70% in high-trigger-to-useful-output scenarios**

### 3. Replace HTTP modules with native integrations
- Audit which scenarios use HTTP modules to call services Make supports natively
- Replace with native Make modules (HubSpot, Airtable, Notion, Slack, etc.)

### 4. Deactivate scenarios with no active use
- Filter by "Last execution" — deactivate anything not run intentionally in 30+ days

### 5. Use Data Stores instead of repeated lookups
- Cache static or slow-changing data in a Make Data Store — queried at zero additional operations

## Audit Questions
- What is their current Make plan and monthly operation limit?
- Which scenarios consume the most operations per month?
- What polling intervals are in use across active scenarios?
- Are there scenarios built by people who no longer use the system?
- Are any scenarios using HTTP modules to call services Make supports natively?
- Are Data Stores being used at all?

## Key Metrics
| Metric | Figure |
|---|---|
| Polling frequency reduction | 87% fewer executions (15 min → 2 hour) |
| Early filter operation reduction | 40–70% on high-volume scenarios |
| Useful output rate | Meaningful downstream actions / Total operations |

## Recommended Actions
| Action | Effort | Impact |
|---|---|---|
| Reduce polling frequency on non-real-time scenarios | Low | High — up to 87% per scenario |
| Add early filters to high-volume scenarios | Low | High — 40–70% operation reduction |
| Deactivate unused or orphaned scenarios | Low | Medium |
| Replace HTTP modules with native integrations | Medium | Medium |
| Implement Data Store caching | Medium | Medium |

**Green scoring:** Unfiltered high-frequency scenarios with AI steps = Heavy. Webhook-driven, filtered, Data Store-cached = Light.

---
*WST Audit Knowledge Base | Internal Reference Only | Verify figures annually.*

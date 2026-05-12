# Gemini / Google AI — WST Audit Reference
**Category:** AI/LLM Tools | **Infrastructure:** Google Cloud (PUE 1.09, CFE% 66%)

## Why This Matters
Google operates the most energy-efficient hyperscale data centers in the world: PUE 1.09 vs industry average 1.56 — 84% less overhead energy per unit of compute. Google Cloud gives customers region-level carbon data and a CFE% metric. This is the most auditable AI provider for environmental impact.

## Platform Footprint Facts
| Metric | Google / GCP | Industry Average |
|---|---|---|
| Data center PUE | 1.09 (2024) | 1.56 (Uptime Institute 2024) |
| Carbon-free energy (CFE%) | 66% hourly average (2024) | Varies — most at 40–60% |
| Best CFE% region (US) | Iowa (us-central1): ~90% CFE | — |
| Data center energy emissions change | -12% in 2024 despite +27% demand | — |
| Water replenishment (2024) | 64% of freshwater consumption | 18% in 2023 |

Source: Google 2025 Environmental Report; cloud.google.com/sustainability/region-carbon

## Reduction Strategies

### 1. Choose low-carbon Google Cloud regions
Migrating from 50% to 90% CFE region reduces gross carbon emissions ~40% with no architecture change.
- Check current workload regions in Google Cloud Console
- Compare against CFE% at cloud.google.com/sustainability/region-carbon
- Highest CFE% US regions (2024): Iowa (us-central1), Oregon (us-west1), Montreal (northamerica-northeast1)
- Set GCP Organization Policy to restrict resource creation to low-carbon regions

### 2. Use Gemini Flash for routine tasks
- Route summarisation, translation, classification, and drafting to Flash tier
- Reserve Pro/Ultra for multimodal reasoning, complex code, or high-stakes generation

### 3. Carbon-aware scheduling for batch workloads
- Switch from fixed schedules to carbon-aware scheduling via GCP Cloud Scheduler or Batch
- No architecture change required

### 4. Audit Google Workspace AI usage
- Disable Gemini features in applications where users report low/no usage
- Common finding: Gemini in Meet runs auto-transcription for every call even when summaries are never read

## Audit Questions
- Which Google Cloud regions are their primary workloads deployed in?
- Have they ever looked at the Carbon Footprint report in the GCP console?
- Are they using Gemini via API, Vertex AI, or Workspace (Docs/Gmail/Meet)?
- Are there batch workloads that could be time-shifted to cleaner grid windows?
- Is Gemini in Workspace enabled for all users? Which features are active?

## Key Metrics
| Metric | Figure | Source |
|---|---|---|
| Region migration impact | ~40% emissions reduction | GCP CFE% data, 2024 |
| Google PUE advantage vs industry | 84% less overhead energy | Google 2025 Environmental Report |
| CFE% hourly average (2024) | 66% | Google 2025 Environmental Report |
| Carbon Footprint dashboard | Free, per-service, per-region, monthly kg CO2e | GCP Console |

## Recommended Actions
| Action | Effort | Impact |
|---|---|---|
| Enable and review GCP Carbon Footprint report | Low | High — baseline visibility, zero cost |
| Migrate batch workloads to high-CFE regions | Medium | High — ~40% emissions reduction |
| Switch Gemini API to Flash for routine tasks | Low–Medium | High |
| Enable carbon-aware scheduling | Medium | Medium |
| Audit and restrict unused Gemini Workspace features | Low | Medium |

## Provider Sustainability Posture
**WST position:** Google Cloud and Gemini have the strongest verifiable sustainability story of any major AI provider. Use specific numbers. This is the one provider where specific, sourced claims can be made without hedging.
**Green scoring:** Workloads in high-CFE regions = Light. Standard regions = Moderate. No sustainability configuration = Heavy.

---
*WST Audit Knowledge Base | Internal Reference Only | Verify figures annually.*

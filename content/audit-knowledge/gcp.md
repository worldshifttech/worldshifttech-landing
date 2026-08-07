# Google Cloud Platform (GCP) — WST Audit Reference
**Category:** Cloud Infrastructure | **PUE: 1.09 | CFE%: 66% (2024)**

## Why This Matters
GCP is the most transparent and verifiable cloud provider for environmental impact. Google provides per-region Carbon Free Energy percentages (CFE%), a Carbon Footprint dashboard showing kg CO2e per service per month, and a region picker with low-carbon indicators built into the console.

## Platform Sustainability Facts
| Metric | GCP Performance (2024) | Source |
|---|---|---|
| Average PUE | 1.09 (industry average: 1.56) | Google 2025 Environmental Report |
| Carbon-free energy hourly % | 66% average across all regions | Google 2025 Environmental Report |
| Data center energy emissions | -12% in 2024 despite +27% more energy demand | Google 2025 Environmental Report |
| Best CFE% US region | Iowa (us-central1): ~90% CFE | cloud.google.com/sustainability/region-carbon |
| Water replenishment (2024) | 64% of freshwater consumption replenished | Google 2025 Environmental Report |
| Customer carbon tool | Free — per-service, per-region, monthly kg CO2e | GCP Carbon Footprint dashboard |

## Reduction Strategies

### 1. Enable and read the Carbon Footprint dashboard
- Console > Cost Management > Carbon Footprint — free
- Note current kg CO2e/month as the audit baseline
- **This is the most concrete and sourceable environmental metric in the entire WST audit toolkit**

### 2. Migrate workloads to high-CFE% regions
- Moving from 50% to 90% CFE region = ~40% emissions reduction with no architecture change
- High-CFE US regions (2024): us-central1 (Iowa) ~90%, us-west1 (Oregon) ~88%, northamerica-northeast1 (Montreal) ~86%
- Set a GCP Organization Policy to restrict resource creation to low-carbon regions

### 3. Use carbon-aware scheduling for batch workloads
- Switch from fixed-time schedules to carbon-aware scheduling in Cloud Scheduler

### 4. Implement GCP right-sizing and go serverless
- GCP Recommender: Console > Compute Engine > Recommendations — typically 20–40% cost reduction
- **Cloud Run and Cloud Functions scale to zero — 60–80% compute reduction for intermittent vs always-on GCE**

### 5. Eliminate unused projects, resources, and APIs
- Delete projects that are remnants of completed work
- Disable APIs not in use, check for unattached persistent disks and unused static IPs

## Audit Questions
- Is the GCP Carbon Footprint report enabled? Have they ever looked at it?
- Which regions are their primary workloads deployed in?
- What is the monthly GCP spend? Which services dominate?
- Are there GCE instances running at low utilisation 24/7?
- Are there batch workloads on fixed schedules that could be time-shifted?
- Are there old or unused GCP projects still open?

## Key Metrics
| Metric | Figure | Source |
|---|---|---|
| Carbon Footprint dashboard | Direct kg CO2e per month | GCP Console (free) |
| Region migration impact | ~40% emissions reduction (50% to 90% CFE) | GCP CFE% data |
| PUE advantage vs industry | 84% less overhead energy | Google 2025 Env. Report |
| Right-sizing via Recommender | 20–40% cost reduction typical | GCP Recommender |
| Cloud Run vs always-on GCE | 60–80% compute reduction for intermittent | WST estimation |

## Recommended Actions
| Action | Effort | Impact |
|---|---|---|
| Enable and review Carbon Footprint dashboard | Low | High — immediate baseline, free |
| Migrate workloads to high-CFE% regions | Medium | High — ~40% emissions reduction |
| Act on GCP Recommender right-sizing | Low–Medium | High |
| Enable carbon-aware scheduling | Medium | Medium |
| Migrate intermittent workloads to Cloud Run | High | High — 60–80% compute reduction |
| Delete unused projects and resources | Low | Medium |

## Provider Sustainability Posture
**WST position:** GCP is the easiest provider to make specific, sourced environmental claims for. Use the Carbon Footprint dashboard data directly in audit reports.
**Green scoring:** Workloads in high-CFE regions with carbon-aware scheduling = Light. Standard region, always-on GCE = Moderate–Heavy.

---
*WST Audit Knowledge Base | Internal Reference Only | Verify figures annually.*

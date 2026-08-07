# Calendly — WST Audit Reference
**Category:** Scheduling / SaaS | **Infrastructure:** AWS (WUE 0.15 L/kWh)

## Why This Matters
Calendly runs on AWS, inheriting AWS's WUE of 0.15 L/kWh. Its per-booking compute footprint is minimal. The waste is financial and structural: unused event types published and consuming routing logic on every page load, inactive team members holding paid seats, redundant booking links spread across multiple tools, and integrations connected but not actively used.

## Platform Footprint Facts
| Factor | Context |
|---|---|
| Calendly infrastructure | AWS-hosted |
| AWS WUE (2024) | 0.15 L/kWh — 8x better than industry average |
| Per-booking compute | Very low — scheduling logic is lightweight |
| Primary waste driver | Seat count and unused event types, not compute |
| Calendly Teams plan | $16/seat/month; Standard $12/seat/month |
| Carbon/energy reporting | No published sustainability data |

## Reduction Strategies

### 1. Audit and remove inactive event types
- Log in and go to Event Types — list all published event types
- Identify event types that have had zero bookings in the past 60 days — delete or unpublish them
- **Typical finding: teams accumulate 3–5 unused event types per user over 12 months**

### 2. Remove inactive team members
- Go to Admin > Users — filter by last login or last booking
- Remove users who are no longer active at the company or who have had zero bookings in 90+ days
- Each removed Teams seat saves $16/month

### 3. Consolidate booking links
- Teams often end up with booking links spread across email signatures, website pages, and Notion docs pointing to different Calendly event types for the same meeting purpose
- Audit where Calendly links are published and consolidate to a single canonical link per meeting type

### 4. Review and remove unused integrations
- Calendly connects to Zoom, Google Meet, HubSpot, Salesforce, Stripe, and others
- Go to Integrations and disconnect any integration not actively in use — each integration fires server-side on every booking event

### 5. Evaluate routing forms
- If using Calendly routing forms, review routing rules for efficiency — rules that never match still run on every submission

## Audit Questions
- How many event types are published across all team members? When did each last receive a booking?
- How many team members have Calendly seats? When did each last log in or receive a booking?
- Which integrations are connected (Zoom, CRM, payment tools)? Are they all actively firing?
- Are Calendly links appearing in multiple places for the same purpose?
- Are routing forms in use and are the routing rules current?

## Key Metrics
| Metric | Figure |
|---|---|
| Unused event type accumulation | 3–5 per user over 12 months typical |
| Teams seat cost | $16/seat/month |
| Standard seat cost | $12/seat/month |
| AWS WUE | 0.15 L/kWh (AWS Sustainability Report 2024) |

## Recommended Actions
| Action | Effort | Impact |
|---|---|---|
| Remove or unpublish unused event types | Low | Low–Medium |
| Remove inactive team members | Low | High — direct seat cost reduction |
| Disconnect unused integrations | Low | Medium |
| Consolidate duplicate booking links | Low | Medium |
| Review routing form rules | Low | Low |

**Green scoring:** Minimal event types, active users only, few integrations = Light. Large Teams plan with many unused event types and integrations = Moderate.

## Sources
- AWS Sustainability Report 2024 (WUE figures): sustainability.aboutamazon.com

---
*WST Audit Knowledge Base | Internal Reference Only | Verify figures annually.*

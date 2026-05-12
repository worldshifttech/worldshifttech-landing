# Resend — WST Audit Reference
**Category:** Email Infrastructure | **Infrastructure:** AWS (WUE 0.15 L/kWh)

## Why This Matters
Resend runs on AWS, inheriting AWS's WUE of 0.15 L/kWh. The per-email compute footprint is extremely low — transactional email is one of the lightest workloads in a typical SaaS stack. The environmental and financial waste is not in sending emails but in sending them poorly: to invalid or bounced addresses, to users who have disengaged, or at volumes driven by bugs or misconfigured triggers rather than intentional sends.

## Platform Footprint Facts
| Factor | Context |
|---|---|
| Resend infrastructure | AWS-hosted |
| AWS WUE (2024) | 0.15 L/kWh — 8x better than industry average |
| Per-email footprint | Very low — compute is minimal per transactional message |
| Primary waste driver | Sending volume, not compute efficiency |
| Carbon/energy reporting | No published sustainability data |
| Resend free tier | 3,000 emails/month, 100/day |

## Reduction Strategies

### 1. Suppress bounced and invalid addresses immediately
- Hard bounces (invalid address) consume resources and damage sender reputation — Resend tracks these automatically
- Review the Resend dashboard Suppression List regularly and ensure your application is not retrying sends to suppressed addresses
- **Every hard bounce retry is a wasted send and a sender reputation risk**

### 2. Audit triggered email logic for bugs
- The most common source of email volume spikes in SMB applications is a misconfigured trigger: a webhook firing twice, a loop in an automation, or a retry without deduplication
- Check Resend logs for unusual send volume on any single email type — a notification that should fire once per event but is firing multiple times per event is both a waste and a UX problem

### 3. Remove inactive contacts from marketing lists
- If using Resend for any broadcast or drip email: purge addresses that have not opened or clicked in 90+ days
- Sending to disengaged addresses hurts deliverability and adds cost per send

### 4. Consolidate notification types
- Review all triggered email types in your application — are there notifications that could be batched (e.g. one daily digest instead of individual emails per event)?
- Fewer, higher-value emails produce better engagement and lower send volume

### 5. Review API key access
- Ensure only the services that need to send email have Resend API keys
- Rotate unused or old keys

## Audit Questions
- What is the monthly send volume? Has it grown unexpectedly?
- Are there any hard bounce or suppression list entries that are being retried?
- What are the top 5 email types by volume? Is each send intentional and expected?
- Are there any automation tools (Zapier, Make, n8n) triggering Resend sends? Are those Zaps/scenarios firing correctly?
- Are marketing or drip sequences being sent to contacts who have not engaged in 90+ days?
- How many API keys are active and which services hold them?

## Key Metrics
| Metric | Figure |
|---|---|
| Hard bounce threshold for reputation damage | Above 2% bounce rate = deliverability risk |
| Disengaged contact threshold | No opens/clicks in 90+ days = suppress |
| AWS WUE | 0.15 L/kWh (AWS Sustainability Report 2024) |
| Per-email footprint | Very low — compute cost is negligible |

## Recommended Actions
| Action | Effort | Impact |
|---|---|---|
| Review and clean suppression list | Low | High — protects sender reputation |
| Audit high-volume email types for trigger bugs | Low | High — catches accidental volume spikes |
| Purge disengaged contacts from broadcast lists | Low | Medium |
| Consolidate notifications into digest emails | Medium | Medium |
| Rotate and audit API key access | Low | Low–Medium |

**Green scoring:** Transactional-only email with clean suppression list = Light. High-volume broadcast with disengaged contacts or trigger bugs = Moderate.

## Sources
- AWS Sustainability Report 2024 (WUE figures): sustainability.aboutamazon.com

---
*WST Audit Knowledge Base | Internal Reference Only | Verify figures annually.*

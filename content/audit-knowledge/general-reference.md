# General Audit Reference — Tools Not in the Dedicated Library
**WST Audit Knowledge Base | Use when no specific tool document exists**

## How to Use This Document
When auditing a tool without a dedicated WST reference doc, use this general framework. Every tool — Asana, Monday.com, Salesforce, HubSpot, Slack, Zoom, or any other SaaS or cloud product — follows the same underlying logic.

## Universal Footprint Framework
| Component | What It Is | Where It Shows Up |
|---|---|---|
| Compute emissions | Energy used when the tool processes requests, runs automations, calls APIs, or generates AI outputs | AI features, automations, data syncs, background jobs |
| Storage emissions | Energy used to store data at rest | File repositories, logs, old backups |
| Network emissions | Energy used to transmit data | High-bandwidth integrations, video, real-time sync |

For most SMB SaaS tools, **compute is the dominant component** — and within compute, AI features are the fastest-growing contributor. Focus the audit on compute first.

## The 6 Universal Audit Questions

**Q1. How many seats/licences are active? When did each user last log in?**
Industry benchmark: 20–30% of SaaS seats are underutilised.

**Q2. What automations, integrations, or background jobs is this tool running?**
Find jobs firing without producing useful output.

**Q3. Does this tool have AI features? Are they enabled? Is anyone using them?**
Enabled-but-unused AI is pure waste.

**Q4. What data is being stored in this tool? Is any of it stale?**
Identify data that can be archived or deleted.

**Q5. Is this the right tool for what it is being used for?**
If two tools do the same job, one of them is waste.

**Q6. What does this tool cost per month? What is the cost per active user?**
Above $50/active user warrants scrutiny. Divide total monthly spend by users who logged in at least 5 times in the past 30 days.

## The 5 Universal Reduction Levers

### Lever 1: Remove underused seats
- Filter member list by last login date — remove anyone inactive for 60+ days
- Industry benchmark: 20–30% of SaaS seats are underutilised

### Lever 2: Audit and trim automations
- Sort by last triggered / execution count
- Anything below 20% useful output rate (useful outputs / total runs) needs a filter or deletion

### Lever 3: Disable AI features that don't earn their keep
- Features triggered frequently but ignored by users are waste — disable them

### Lever 4: Archive and delete stale data
- Identify data not accessed in 12+ months
- Set data retention policies to automatically archive after defined periods

### Lever 5: Consolidate overlapping tools
- Two tools doing the same job — eliminating one removes its entire footprint

## Universal Metric System
| What You're Measuring | Proxy Metric | How to Calculate |
|---|---|---|
| Unused seats | Monthly cost eliminated | Seats removed × monthly seat cost |
| LLM calls eliminated | kWh saved (estimated) | Calls removed × 0.0003 kWh (text query) |
| kWh saved → water saved | Liters of cooling water preserved | kWh saved × 1.8 L/kWh |
| kWh saved → CO2 avoided | kg CO2e avoided | kWh saved × 0.385 kg CO2e/kWh |

These are proxy metrics, not verified measurements. Always be transparent: "This is an estimated equivalent based on industry benchmarks."

## Reference Benchmarks
| Benchmark | Figure | Source |
|---|---|---|
| Typical text LLM query energy | ~0.3 Wh (GPT-4o class) | Epoch AI / arxiv:2505.09598, 2025 |
| Image generation energy | ~2.9 Wh — 10x text query | Nathan Bailey / Medium, 2025 |
| Industry average data center WUE | 1.8–1.9 L/kWh | The Green Grid / EESI 2024 |
| Best-in-class data center WUE | 0.15 L/kWh (AWS 2024) | AWS Sustainability Report 2024 |
| US average grid carbon intensity | ~0.385 kg CO2e/kWh | EPA Greenhouse Gas Equivalencies 2024 |
| Underutilised SaaS seats | 20–30% of total seats | Industry benchmark |
| Model switching energy reduction | 50–67% (large to small model) | arxiv:2510.01889, arxiv:2602.22261 |

## Infrastructure Quick Reference
| Provider | WUE (2024) | Notes |
|---|---|---|
| AWS | 0.15 L/kWh | 8x better than industry average |
| Google Cloud | ~0.3 L/kWh avg | Best PUE (1.09); 66% CFE%; free carbon dashboard |
| Microsoft Azure | 0.30 L/kWh | Zero-water cooling for all new builds from late 2027 |
| Industry average | 1.8–1.9 L/kWh | The Green Grid benchmark |

## When to Flag a Tool for Replacement vs Optimisation
- Cost per active user exceeds $50/month and the use case could be served by a cheaper tool
- The tool is being used for a job it was not designed for
- AI features have been enabled for 6+ months with no measurable outcome improvement
- Two tools in the stack serve the same primary function and consolidation is feasible
- The tool requires more than 2 hours/week of admin maintenance for an SMB team

## WST Positioning Note
Always lead with the financial story. Frame environmental benefit as a parallel outcome:

> "Removing these 8 unused seats saves $320/month. It also eliminates the compute draw of 8 active accounts — equivalent to keeping 8 laptop-equivalent loads off the grid for a month."

---
*WST Audit Knowledge Base | Internal Reference Only | Data sourced from peer-reviewed research, provider sustainability reports, and IEA publications. Verify figures annually.*

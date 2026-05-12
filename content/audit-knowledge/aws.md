# Amazon Web Services (AWS) — WST Audit Reference
**Category:** Cloud Infrastructure | **WUE: 0.15 L/kWh (2024)**

## Why This Matters
AWS is the world's largest cloud provider and largest corporate buyer of renewable energy for five consecutive years. AWS infrastructure is up to 4.1x more energy efficient than on-premises equivalents. The levers for SMB clients: eliminating idle resources, right-sizing compute, and choosing low-carbon regions.

## Platform Sustainability Facts
| Metric | AWS Performance (2024) | Source |
|---|---|---|
| Global data center WUE | 0.15 L/kWh — industry average is 1.8–1.9 L/kWh | AWS Sustainability Report 2024 |
| WUE improvement | 17% from 2023; 40% since 2021 | AWS Sustainability Report 2024 |
| Energy efficiency vs on-prem | Up to 4.1x more efficient | AWS |
| Carbon footprint vs on-prem | Up to 99% reduction (with renewable coverage) | 451 Research / AWS |
| Renewable energy | Largest corporate buyer globally (5th consecutive year) | BloombergNEF 2024 |
| Water positive target | 2030 — 53% of the way there in 2024 | AWS Sustainability Report 2024 |

## Reduction Strategies

### 1. Eliminate idle and underutilised EC2 instances
- Check instances with <20% average CPU over 14 days via AWS Trusted Advisor (free)
- Schedule stop/start for instances needed only during business hours (~75% compute saving)
- Right-size: if a t3.xlarge runs at 15% CPU, a t3.medium handles the same load

### 2. Eliminate orphaned resources
- EBS volumes with no attached instance, Elastic IPs not associated with running instances, old snapshots, load balancers pointing to terminated instances
- **Typical finding: orphaned resources = 15–30% of an SMB's AWS bill**

### 3. Choose and use low-carbon regions
- Check the AWS Customer Carbon Footprint Tool (Cost Management > Carbon Footprint)
- US East (N. Virginia), US West (Oregon), EU (Ireland) all have strong renewable coverage

### 4. Move workloads to serverless and managed services
- **Moving from always-on EC2 to Lambda: 60–80% compute reduction for intermittent workloads**

### 5. Enable and act on Trusted Advisor and Compute Optimizer
- AWS Trusted Advisor (free): idle load balancers, underutilised EC2, unassociated Elastic IPs
- AWS Compute Optimizer: typically identifies 20–40% cost reduction

## Audit Questions
- What is the monthly AWS spend? How has it trended over the past 6 months?
- Have they ever reviewed AWS Trusted Advisor or Compute Optimizer recommendations?
- Which AWS services are in use? (EC2, RDS, S3, Lambda, etc.)
- Are any EC2 instances running 24/7 that could be scheduled off during non-working hours?
- Are there legacy resources from old projects still running?
- Have they enabled the AWS Customer Carbon Footprint Tool?

## Key Metrics
| Metric | Figure | Source |
|---|---|---|
| Orphaned resources as % of SMB AWS bill | 15–30% | WST audit experience |
| Right-sizing cost reduction (Compute Optimizer) | 20–40% | AWS |
| Scheduled instance saving | ~75% compute for business-hours-only | WST calculation |
| Serverless migration saving | 60–80% compute for intermittent workloads | WST estimation |
| AWS WUE | 0.15 L/kWh | AWS Sustainability Report 2024 |

## Recommended Actions
| Action | Effort | Impact |
|---|---|---|
| Audit and remove orphaned resources | Low | High — 15–30% bill reduction, no risk |
| Enable Trusted Advisor and act on it | Low | High — free, immediate visibility |
| Right-size underutilised EC2 instances | Medium | High — 20–40% compute reduction |
| Schedule dev/test instances to stop after hours | Low–Medium | High |
| Migrate intermittent workloads to serverless | High | High — 60–80% compute reduction |
| Enable Carbon Footprint Tool and set baseline | Low | Medium |

## Provider Sustainability Posture
**WST position:** Accurate framing: "Your AWS infrastructure is already among the most energy-efficient available — the opportunity is to use less of it."
**Green scoring:** Rightsized, auto-scaled workloads = Light. Always-on oversized EC2 with orphaned resources = Heavy.

---
*WST Audit Knowledge Base | Internal Reference Only | Verify figures annually.*

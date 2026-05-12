# n8n — WST Audit Reference
**Category:** Automation Platforms | **Infrastructure:** Variable (self-hosted or n8n Cloud on AWS)

## Why This Matters
n8n is self-hostable and open source. Clients running n8n self-hosted have direct control over the infrastructure — the highest-leverage sustainability conversation of any automation tool. The audit question: where is n8n running, and is that the right place?

## Platform Footprint Facts
| Deployment Type | Environmental Control | Key Variable |
|---|---|---|
| n8n Cloud (n8n.io) | Low — AWS-managed | Workflow efficiency |
| Self-hosted on VPS | Medium — provider choice matters | Provider energy source + server sizing |
| Self-hosted on AWS/GCP/Azure | Medium–High | Region selection, instance right-sizing |
| Self-hosted on-prem | Highest control | Local energy source, server efficiency |

## Reduction Strategies

### 1. Audit self-hosted server sizing
- If average utilisation is below 20%, the server is significantly oversized
- Moving from 4 vCPU/8GB RAM to 2 vCPU/4GB RAM is sufficient for most SMB deployments
- **Typical saving: 50–70% hosting cost and energy reduction**

### 2. Move self-hosted deployments to green regions
- For GCP: target us-central1 (Iowa), us-west1 (Oregon), or northamerica-northeast1 (Montreal) — all 85%+ CFE
- **Moving from 50% to 90% CFE region = ~40% carbon reduction**

### 3. Eliminate redundant workflow executions
- Add IF/Switch nodes early in workflows to discard irrelevant records before processing
- Reduce cron intervals on non-real-time workflows

### 4. For n8n Cloud — same discipline as Make
- Review workflow list for inactive or orphaned workflows
- Reduce polling intervals where real-time is not required

### 5. Review AI node usage
- Ensure a filter precedes every AI node to prevent unnecessary calls
- Check which model is configured — switch to a smaller model for simple tasks

## Audit Questions
- Is n8n self-hosted or cloud-hosted (n8n.io)?
- If self-hosted: what server/VPS type and region? Who manages it?
- What is the average CPU and memory utilisation on the host?
- How many active workflows? When were inactive ones last reviewed?
- Are any workflows using AI nodes? Which LLMs are they calling?
- Are there workflows built by former team members that nobody currently owns?

## Key Metrics
| Metric | Figure |
|---|---|
| Server rightsizing saving | 50–70% cost and energy reduction |
| Region migration (GCP) | ~40% carbon reduction |
| Cron interval reduction | 15-min to 2-hour = 87% fewer executions |

## Recommended Actions
| Action | Effort | Impact |
|---|---|---|
| Rightsize self-hosted server | Low–Medium | High — 50–70% cost and energy reduction |
| Migrate to greener cloud region | Medium | High — ~40% carbon reduction |
| Add early IF/Switch filters | Low | Medium |
| Reduce cron intervals | Low | Medium |
| Audit and deactivate orphaned workflows | Low | Medium |
| Review AI node model selection | Low | Medium |

**Green scoring:** Self-hosted on clean region, rightsized server = Light. Oversized server, high-frequency unfiltered workflows = Heavy.

---
*WST Audit Knowledge Base | Internal Reference Only | Verify figures annually.*

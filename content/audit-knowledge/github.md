# GitHub / GitHub Actions — WST Audit Reference
**Category:** Cloud Infrastructure / DevOps | **Infrastructure:** Microsoft Azure (WUE 0.30 L/kWh)

## Why This Matters
GitHub runs on Microsoft Azure infrastructure (WUE 0.30 L/kWh). The per-repository footprint of storing code is minimal. The compute cost is in GitHub Actions: every workflow run spins up a hosted runner, executes jobs in parallel, and consumes Azure compute for the duration. Inefficient workflows — redundant jobs, always-running scheduled workflows, no caching — are the primary source of avoidable compute.

## Platform Footprint Facts
| Factor | Context |
|---|---|
| GitHub infrastructure | Microsoft Azure |
| Azure WUE (2024) | 0.30 L/kWh |
| GitHub Actions runners | Hosted VMs — compute charged per minute |
| Free tier | 2,000 minutes/month on free plan; 3,000 on Team |
| Scheduled workflows | Run on a cron schedule regardless of whether there is work to do |
| Artifacts and caches | Stored in Azure Blob — accumulate without automatic cleanup |
| Carbon/energy reporting | No published per-workflow sustainability data |

## Reduction Strategies

### 1. Audit scheduled workflows
- Go to Actions tab, filter by workflow type — identify any workflows that run on a `schedule:` trigger
- For each scheduled workflow: what does it do? Is it running at the right frequency? Does it produce useful output every time it fires?
- **Typical finding: scheduled workflows run 2–5x more frequently than needed**
- Reduce cron frequency or replace with event-driven triggers (push, pull_request, workflow_dispatch)

### 2. Add caching to dependency installation steps
- Every workflow that installs npm, pip, or composer packages from scratch wastes 2–5 minutes of runner time on dependency download
- Add `actions/cache` before install steps — caches the dependency directory keyed to the lockfile hash
- **Cache hit rate of 70–90% is achievable, reducing install time from 3–5 min to under 30 seconds**

### 3. Eliminate redundant jobs and parallelism
- Review workflows with many parallel jobs — are all of them necessary for every run?
- Add `if:` conditions to skip jobs that only matter on certain branches or file changes
- Use `paths:` filters on triggers to skip workflows entirely when unrelated files change

### 4. Clean up artifacts and caches
- Artifacts default to 90-day retention and caches default to 7 days, but they accumulate
- Set explicit retention days on artifacts: `retention-days: 7` for most CI outputs
- GitHub automatically evicts caches when the 10GB limit is reached — but explicit cleanup prevents thrashing

### 5. Use self-hosted runners for high-volume workloads
- If GitHub Actions minutes are consistently high, evaluate self-hosted runners on existing infrastructure — eliminates per-minute hosted runner cost and associated compute

## Audit Questions
- How many GitHub Actions workflows are active across all repositories?
- Are there any workflows on `schedule:` triggers? How often do they run?
- What is the monthly Actions minutes consumption? Is it growing?
- Are dependency install steps using caching?
- Are there artifacts being generated with long or default retention periods?
- Are there any workflows that run on every push to every branch regardless of what changed?

## Key Metrics
| Metric | Figure |
|---|---|
| Cache hit rate (achievable) | 70–90% with actions/cache on dependency directories |
| Scheduled workflow over-frequency | 2–5x more often than needed is common |
| Dependency install without cache | 3–5 minutes per run |
| Dependency install with cache hit | Under 30 seconds |
| Azure WUE | 0.30 L/kWh |

## Recommended Actions
| Action | Effort | Impact |
|---|---|---|
| Reduce scheduled workflow frequency | Low | High — direct runner-minute reduction |
| Add actions/cache to dependency installs | Low–Medium | High — 70–90% install time reduction |
| Add paths: filters to triggers | Low–Medium | Medium — skips irrelevant runs |
| Set explicit artifact retention-days | Low | Medium |
| Audit and disable unused workflows | Low | Medium |

**Green scoring:** Event-driven workflows only, with caching and path filters = Light. High-frequency scheduled jobs with no caching = Moderate–Heavy.

## Sources
- AWS Sustainability Report 2024 (WUE reference for industry baseline)
- Azure infrastructure: azure.microsoft.com/en-us/global-infrastructure/sustainability

---
*WST Audit Knowledge Base | Internal Reference Only | Verify figures annually.*

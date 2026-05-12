# Supabase — WST Audit Reference
**Category:** Cloud Infrastructure / Database | **Infrastructure:** AWS (WUE 0.15 L/kWh)

## Why This Matters
Supabase runs on AWS, inheriting AWS's WUE of 0.15 L/kWh. Its database, auth, storage, and edge functions are all serverless-adjacent — most components scale with usage. The waste is in configuration: unused projects left running, oversized database instances, real-time subscriptions nobody is using, and storage buckets accumulating stale files.

## Platform Footprint Facts
| Factor | Context |
|---|---|
| Supabase infrastructure | AWS-hosted |
| AWS WUE (2024) | 0.15 L/kWh — 8x better than industry average |
| Database instances | Always-on per project (Postgres) — idle projects still consume resources |
| Edge Functions | Serverless — scale to zero |
| Real-time subscriptions | Each open connection consumes server resources continuously |
| Carbon/energy reporting | No published sustainability data |

## Reduction Strategies

### 1. Pause or delete unused projects
- Supabase free-tier projects can be paused — paused projects consume no active compute
- Go to the Supabase dashboard and identify projects with zero API activity in the past 30 days
- Delete projects from completed or abandoned work entirely
- **Typical finding: development and proof-of-concept projects are never cleaned up**

### 2. Right-size the database instance
- The default Supabase instance size is often 2x what an SMB application actually needs
- Check CPU and memory utilisation in Project Settings > Infrastructure — if consistently below 20%, downgrade to a smaller compute add-on
- **Downgrading from large to small compute add-on: ~50% database compute cost reduction**

### 3. Disable unused Realtime subscriptions
- Review whether Realtime is actively used in the application — if not, disable it in Project Settings > API
- Unused real-time connections hold open WebSocket connections that consume server-side memory

### 4. Audit Row Level Security policies for query efficiency
- Inefficient RLS policies cause every query to run additional policy-check subqueries — adds compute per request
- Review policies in the SQL editor and ensure indexes exist on the columns referenced in policy conditions

### 5. Clean up storage buckets
- List all storage buckets and check last-modified dates on objects
- Delete stale files (old uploads, test assets, abandoned media) — reduces storage cost and footprint

## Audit Questions
- How many Supabase projects exist across all team members' accounts?
- Are there any projects with no API activity in the past 30 days?
- What is the database instance size for each active project? What is CPU utilisation?
- Is Realtime enabled? Is it actively used in the application?
- How many storage buckets are there and when were the objects last accessed?
- Are RLS policies in place and do indexed columns back them?

## Key Metrics
| Metric | Figure |
|---|---|
| Idle project waste | Free-tier projects consume resources even at zero traffic |
| Compute right-sizing | ~50% reduction downgrading large to small compute add-on |
| AWS WUE | 0.15 L/kWh (AWS Sustainability Report 2024) |
| Realtime overhead | Each unused subscription = persistent open connection |

## Recommended Actions
| Action | Effort | Impact |
|---|---|---|
| Pause or delete unused projects | Low | High — eliminates idle compute entirely |
| Right-size database compute add-on | Low | Medium–High — 50% compute reduction |
| Disable Realtime if not actively used | Low | Medium |
| Clean up stale storage objects | Low | Medium |
| Add indexes to RLS policy columns | Medium | Medium — reduces per-query overhead |

**Green scoring:** Single active project, right-sized instance, no unused features = Light. Multiple idle projects, oversized instances, unused Realtime = Moderate–Heavy.

## Sources
- AWS Sustainability Report 2024 (WUE figures): sustainability.aboutamazon.com

---
*WST Audit Knowledge Base | Internal Reference Only | Verify figures annually.*

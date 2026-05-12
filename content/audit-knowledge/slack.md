# Slack — WST Audit Reference
**Category:** Communication / SaaS | **Infrastructure:** AWS (WUE 0.15 L/kWh)

## Why This Matters
Slack runs on AWS, inheriting AWS's WUE of 0.15 L/kWh. Its per-message compute footprint is low. The environmental and financial waste is structural: channel proliferation means messages are pushed to large numbers of people who do not read them, bots and integrations post noise into channels constantly, and seat counts accumulate as teams grow and contract. The notification load — compute used to deliver and render notifications across devices — scales directly with message volume and channel membership.

## Platform Footprint Facts
| Factor | Context |
|---|---|
| Slack infrastructure | AWS-hosted |
| AWS WUE (2024) | 0.15 L/kWh — 8x better than industry average |
| Per-message footprint | Low — but scales with channel membership and notification delivery |
| Workspace bots/integrations | Each fires server-side on triggers; posting bots add to message volume |
| File storage | Accumulates indefinitely unless retention policies are set |
| Carbon/energy reporting | No published sustainability data |

## Reduction Strategies

### 1. Reduce channel count and archive inactive channels
- Go to Slack > Browse Channels and sort by "Last active" — archive any channel with no messages in 60+ days
- **Typical finding: 30–50% of channels in a workspace older than 12 months are inactive**
- Fewer active channels = fewer notification deliveries per message = less compute

### 2. Audit bots and integrations
- Go to Settings > Manage apps — list all connected apps and bots
- For each: when was it last active? Is it posting to channels anyone reads? Does it serve a current need?
- Remove apps that are no longer actively used
- **Common finding: bots from cancelled subscriptions or completed projects still running and posting**

### 3. Remove inactive members or convert to guests
- Filter members by last active date in Settings > People — remove anyone inactive for 60+ days
- Downgrade users who only need to read specific channels to Multi-Channel Guests (lower cost on paid plans)
- **Pro plan: $7.25/active user/month; removing unused seats has direct cost impact**

### 4. Set file retention policies
- Slack stores all files indefinitely by default unless a retention policy is set
- Go to Settings > Retention & Deletion and set a file retention window appropriate for the team (90 days is common)
- Reduces storage footprint and avoids paying for file storage in older message history

### 5. Reduce notification noise
- High-noise channels (where most messages are bot posts or low-priority updates) cause members to disable all notifications — including important ones
- Consolidate integration notifications: route app alerts to dedicated channels with appropriate membership rather than broadcasting to general channels

## Audit Questions
- How many active channels are in the workspace? When were the least-active ones last used?
- How many apps and bots are connected? When did each last post a message?
- How many members are on the workspace? When did each last log in?
- Are there any channels where most messages come from bots rather than people?
- Is a file retention policy in place? How much file storage is the workspace using?
- Are there channels with very large membership where most members have notifications muted?

## Key Metrics
| Metric | Figure |
|---|---|
| Inactive channel rate | 30–50% in workspaces older than 12 months |
| Inactive member threshold | No activity in 60+ days = review for removal |
| Pro seat cost | $7.25/active user/month |
| AWS WUE | 0.15 L/kWh (AWS Sustainability Report 2024) |

## Recommended Actions
| Action | Effort | Impact |
|---|---|---|
| Archive inactive channels | Low | Medium |
| Remove unused bots and integrations | Low | Medium |
| Remove or downgrade inactive members | Low | High — direct seat cost reduction |
| Set file retention policy | Low | Medium |
| Consolidate integration notification channels | Medium | Medium |

**Green scoring:** Lean channel structure, no unused bots, active member list = Light. Channel sprawl with heavy bot posting and stale members = Moderate.

## Sources
- AWS Sustainability Report 2024 (WUE figures): sustainability.aboutamazon.com

---
*WST Audit Knowledge Base | Internal Reference Only | Verify figures annually.*

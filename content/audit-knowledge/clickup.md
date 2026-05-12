# ClickUp — WST Audit Reference
**Category:** Project Management / SaaS | **Infrastructure:** AWS + GCP (hybrid)

## Why This Matters
ClickUp has expanded into docs, whiteboards, automations, AI, and chat — making it one of the most feature-bloated tools in an SMB stack. ClickUp Brain (AI) calls external LLMs charged per user per month. Most SMB teams use 15–25% of available features.

## Platform Footprint Facts
| Factor | Context |
|---|---|
| ClickUp infrastructure | AWS and GCP (hybrid) |
| ClickUp Brain | Calls external LLMs — costs tokens per use |
| Automations | Each run consumes server-side compute |
| Carbon/energy reporting | No published sustainability data |
| Typical SMB feature usage | Teams use ~15–25% of available features |

## Reduction Strategies

### 1. Audit and kill dead automations
- Go to Settings > Automations > All Automations and sort by "Last triggered"
- Delete or disable any automation with no trigger in 30+ days
- **Typical finding: 25–40% of automations in accounts older than 12 months are dead or broken**

### 2. Rationalise ClickUp Brain usage
- Check ClickUp Brain usage per user in Settings > AI > Usage
- Remove Brain access for users with very low usage

### 3. Reduce workspace clutter
- Archive or delete Spaces with no activity in the past 60 days

### 4. Reduce guest seat count
- Pull the full guest list from Settings > Members > Guests
- Remove guests who haven't logged in within 60 days

### 5. Consolidate integrations and webhooks
- Go to Settings > Integrations and disconnect anything no longer actively used

## Audit Questions
- How many active seats does the workspace have? How many Guests?
- Is ClickUp Brain enabled? For how many users? How often is it used?
- How many Spaces in the workspace? When was each last active?
- How many automations are set up? When were they last reviewed?
- Which integrations are connected? Are they all actively in use?

## Key Metrics
| Metric | Figure |
|---|---|
| Dead automation rate in mature accounts | 25–40% of automations unused |
| Seat underutilisation benchmark | 20%+ of SaaS seats (fewer than 5 logins/month) |
| ClickUp Brain add-on cost | ~$5/user/month |

## Recommended Actions
| Action | Effort | Impact |
|---|---|---|
| Remove dead and broken automations | Low | High |
| Remove unused guest seats | Low | Medium |
| Archive inactive Spaces and Lists | Low | Medium |
| Review ClickUp Brain per-user usage | Low | Medium |
| Disconnect unused integrations | Low | Medium |

**Green scoring:** Heavily automated ClickUp with AI and many integrations = Moderate–Heavy. Streamlined task management only = Light.

---
*WST Audit Knowledge Base | Internal Reference Only | Verify figures annually.*

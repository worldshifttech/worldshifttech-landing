# Intercom / Zendesk — WST Audit Reference
**Category:** Customer Support Platforms | **Infrastructure:** AWS (WUE 0.15 L/kWh)

## Why This Matters
Both platforms have aggressively added AI features — AI agents, AI-generated replies, AI triage, AI summaries — all calling external LLMs on every customer interaction if enabled globally. Most SMBs pay for enterprise-tier features they never touch.

## Platform Footprint Facts
| Platform | Infrastructure | Carbon/Energy Data |
|---|---|---|
| Intercom | AWS-hosted | No published sustainability data |
| Zendesk | AWS-hosted | Minimal public ESG reporting |
| AI features (both) | Call external LLMs per interaction | See ChatGPT/OpenAI doc for LLM energy |
| AWS WUE | 0.15 L/kWh | AWS Sustainability Report 2024 |

## Reduction Strategies (applies to both platforms)

### 1. Audit AI features — what's enabled vs what's performing
- Map every AI feature enabled: AI chatbot/agent, suggested replies, summarisation, triage/routing
- For each: monthly interaction volume and measured outcome
- **AI chatbots with <20% deflection rate are not offsetting their compute cost — disable until retrained**

### 2. Restrict AI to high-volume, repeatable conversation types
- Enable AI responses only for predictable, high-volume inquiries (password resets, order status, FAQ topics)
- Route all other conversation types to human agents immediately

### 3. Audit seat and agent count
- Pull the full agent list and filter by last login date
- Remove agents who have not logged in within 60 days

### 4. Disconnect low-volume channels
- Check message volume per channel over the past 90 days
- Deactivate channels with fewer than 10 messages/month

### 5. Consolidate help center content
- Delete or update outdated articles
- Merge duplicate articles covering the same topic

## Audit Questions
- Which AI features are enabled? (AI agent/chatbot, suggested replies, summarisation, triage)
- What is the monthly conversation volume? What percentage is handled by AI vs humans?
- What is the AI deflection rate? Is it tracked?
- How many agent seats? When did each agent last log in?
- Which channels are active? What is the volume on each?
- When was the help center last reviewed and updated?

## Key Metrics
| Metric | Figure |
|---|---|
| AI deflection rate minimum for ROI | >35% (below 20% = disable or retrain signal) |
| Seat waste in SMB support platforms | 20–35% of agent seats often inactive |
| Low-volume channel threshold | <10 messages/month = deactivate |
| Help center quality impact | Directly proportional to AI accuracy and deflection rate |

## Recommended Actions
| Action | Effort | Impact |
|---|---|---|
| Measure AI deflection rate as baseline | Low | High — without this, nothing else is defensible |
| Restrict AI to high-volume repeatable conversation types | Medium | High |
| Remove inactive agent seats | Low | High |
| Disconnect low-volume channels | Low | Medium |
| Audit and clean up help center content | Medium | Medium–High |
| Disable AI features with <20% deflection rate | Low | Medium |

**Green scoring:** AI on all conversations with poor deflection = Heavy. AI restricted to high-deflection repeatable types = Light.

---
*WST Audit Knowledge Base | Internal Reference Only | Verify figures annually.*

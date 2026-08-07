# AI Meeting Notetakers — WST Audit Reference
**Covers:** Fireflies.ai, Otter.ai, Fathom, Read.ai, Grain, Notta, and similar tools
**Category:** AI/LLM Tools | **Infrastructure:** AWS or Google Cloud (varies by vendor)

## Why This Matters
AI meeting notetakers record, transcribe, and summarise meetings using LLM-based processing. Transcription and summarisation are compute-intensive: a 60-minute meeting generates roughly 9,000–12,000 words of transcript, which is then processed by an LLM for summary, action items, and topic extraction. Per the SummarizeMeeting January 2026 benchmark, AI notetaker accuracy varies from 76% to 93% across vendors depending on audio quality and speaker count. The environmental cost comes from recording every meeting by default — including 5-minute check-ins, internal standups, and calls where notes are never read.

## Platform Footprint Facts
| Factor | Context |
|---|---|
| Transcription infrastructure | AWS (Fireflies, Fathom) or Google Cloud (Otter.ai) |
| AWS WUE (2024) | 0.15 L/kWh |
| GCP WUE (2024) | ~0.3 L/kWh avg |
| LLM summarisation energy | ~0.3 Wh per text query (GPT-4o class); summary of 60-min meeting = multiple queries |
| Recording storage | Audio + transcript stored per meeting — accumulates without retention policies |
| AI accuracy range | 76–93% depending on vendor and audio quality (SummarizeMeeting Jan 2026) |
| Carbon/energy reporting | No published data from any major notetaker vendor |

## Reduction Strategies

### 1. Selective recording — stop recording every meeting by default
- The default for most notetaker tools is to auto-join and record every calendar event — including internal standups, quick check-ins, and 1:1s that do not need notes
- Switch to opt-in recording: require a deliberate decision to record each meeting
- **Typical finding: 40–60% of recorded meetings produce summaries that are never opened**
- Review the notetaker dashboard's "Meetings" list — filter by "Summary viewed" or "Notes accessed" to measure actual usage rate

### 2. Exclude recurring internal meetings
- Configure the notetaker to exclude specific recurring meetings (daily standups, internal team syncs) where notes are not needed
- Most tools support exclusion by meeting title keyword, calendar event type, or attendee list

### 3. Set a recording retention policy
- Audio recordings and transcripts accumulate indefinitely without a retention policy
- Set automatic deletion of recordings older than 30–60 days — most notetaker platforms support this in settings
- Reduces storage footprint and removes stale data

### 4. Evaluate per-seat usage
- Most notetaker tools charge per seat (Fireflies: $10–19/month, Fathom: free–$19/month, Otter.ai Business: $20/month)
- Identify users who have had zero meetings recorded in the past 30 days and remove their seat
- **Typical finding: 20–35% of licensed seats are inactive in teams that onboarded the tool 6+ months ago**

### 5. Verify the notetaker is actually replacing note-taking work
- If team members are still manually writing notes after meetings despite having a notetaker, the tool is doubling work rather than replacing it — evaluate whether the accuracy and format are meeting the team's needs
- Low accuracy (below 80%) on a team's typical meeting type is a signal to switch vendors or disable and revert

## Audit Questions
- Which notetaker tool is in use and what is the monthly cost per seat?
- How many meetings are recorded per month? How many of those summaries are actually opened and read?
- Is recording set to auto-join all meetings or opt-in per meeting?
- Are there recurring internal meetings (standups, 1:1s) being recorded that don't need notes?
- How many seats are licensed and when did each user last have a meeting recorded?
- Is a recording retention policy in place?

## Key Metrics
| Metric | Figure | Source |
|---|---|---|
| Summary view rate (typical) | 40–60% of summaries never opened | WST audit observation |
| AI accuracy range across vendors | 76–93% | SummarizeMeeting January 2026 benchmark |
| Typical inactive seat rate | 20–35% after 6 months | WST audit experience |
| Fireflies seat cost | $10–19/month/seat | Fireflies pricing |
| Otter.ai Business seat cost | $20/month/seat | Otter.ai pricing |
| LLM summarisation energy | ~0.3 Wh per query (GPT-4o class) | Epoch AI / arxiv:2505.09598, 2025 |

## Recommended Actions
| Action | Effort | Impact |
|---|---|---|
| Switch from auto-join to opt-in recording | Low | High — 40–60% reduction in recorded meetings |
| Exclude recurring internal meetings | Low | High |
| Set recording retention policy (30–60 days) | Low | Medium |
| Remove inactive seats | Low | Medium — direct cost reduction |
| Audit summary view rate as baseline | Low | High — makes all other decisions evidence-based |

**Green scoring:** Opt-in recording, retention policy, active seats only = Light. Auto-join all meetings with no retention policy and inactive seats = Heavy.

## Sources
- SummarizeMeeting January 2026 benchmark (notetaker accuracy): summarizemeeting.com
- AWS Sustainability Report 2024 (WUE figures): sustainability.aboutamazon.com
- Epoch AI / arxiv:2505.09598, May 2025 (LLM energy per query)

---
*WST Audit Knowledge Base | Internal Reference Only | Verify figures annually.*

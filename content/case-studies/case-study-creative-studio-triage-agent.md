---
client_type: creative_studio
industry: marketing
pain_points:
  - incoming requests landed in a single queue with no automatic sorting
  - project managers manually triaging every submission to the right team
  - no way to tell at a glance which requests were urgent or misrouted
  - conditional logic missing — all requests treated the same regardless of type
solution_type: agent
tools_used:
  - ClickUp
  - AI agents
  - Jotform
results:
  time_saved: 2-4 hours per week in triage and routing
  roi: Eliminated manual PM sorting on 40-60 weekly submissions
  payback_period: First two weeks
headline: Built an AI triage agent that reads incoming creative requests and routes them to the right team automatically — without a project manager in the loop.
story: >
  A high-volume creative studio was receiving dozens of requests per week across multiple service lines. Every one of them landed in the same queue. A project manager had to read each request, figure out what type it was, and manually move it to the right list, assign it to the right team, and set the right fields.

  On a slow week that was manageable. On a busy week it was a bottleneck that delayed work from even starting.

  The build: an AI agent that reads each incoming request as it arrives — the form fields, the request type, the market, the deliverable — and classifies it. Based on that classification it routes the task to the correct workstream, applies the right labels and assignments, and sets the priority level. Requests that match a standard pattern are handled entirely without human intervention. Only edge cases surface for review.

  The conditional logic layer was the key piece: marketing requests behave differently than custom solutions requests, which behave differently than portfolio work. Each branch has its own routing rules and field requirements. The agent handles all of it.

  What used to be a daily sorting task became a background process. The PM's queue went from full of logistics to full of actual work.
---

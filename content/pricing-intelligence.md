# WST Pricing Intelligence — Industry Baselines
*Used by Claude at scope generation time. Drew's rate: $250/hr. These floors are a safety net, not a target. Value-based reasoning is the primary pricing driver — start from the value the client signaled, then verify the result clears the floor.*

## How to Use This File
When generating a 3-tier price estimate, reason in this order:
1. What value did the client signal this tool would deliver? (Q5 value signals and Q6/Q9 answers are the primary input.)
2. From that value, work backward: what investment is proportional to the outcome?
3. What is the industry baseline ROI for this type of tool?
4. Once you have a value-based number, verify it is not below the tier floor. If it is, raise it to the floor. If it is above, keep it — do not anchor downward.

A project where the client said it would save $50,000/year or let them take on more clients without adding headcount should price significantly above the MVP floor even at MVP tier. The floors below are the minimum you will never go beneath — they are not the expected or default price.

MVP = simplest working version. Price from value first; floor is $2,000.
Polished = MVP + refined UX, better error handling, edge cases handled. Floor is $3,250. Typically 1.5–1.75× MVP.
Perfected = production-grade, fully finished, potentially with ongoing optimization. Floor is $6,500. Typically 2–2.5× MVP.

## Builder Rate
$250/hour. Current MVP builds: 5–7 hours of focused build time. Tier floors: MVP $2,000, Polished $3,250, Perfected $6,500. These floors represent the minimum — value-based pricing will often land well above them.

## Value Signal Multipliers
Apply these when reasoning from value. These are not additions to the floor — they inform the value-first price you then compare against the floor:

- "I'd have time back to focus on higher-value work" → estimate 4–10 hrs/week recovered × $75–$150/hr client value × 12 months. If the tool pays for itself in under 3 months, price can reflect 20–30% of first-year value.
- "I could offer this as a service or product to my own clients" → tool has revenue-generating potential. Strong signal — price should reflect 15–30% of realistic first-year revenue enabled.
- "I'd stop paying for something I currently pay for" → identify likely SaaS displacement. Average SMB SaaS tool: $50–$500/month. Price from the annual savings, not the tool cost.
- "I'd make fewer mistakes in an area that costs me when I get it wrong" → error cost reduction. Estimate annual error cost and price proportionally.
- "I could take on more clients or projects without adding headcount" → capacity unlock. High value signal. The capacity gain is the value — price from it.
- "My team would spend less time on repetitive work" → multiply hours saved × team size × hourly rate. Treat conservatively but do not underweight team-scale savings.
- "I'm not sure yet" → no value multiplier. Price at hours × rate, verify against floor.

## Industry Baselines

### Professional Services (consultants, agencies, fractional operators)
- Manual process cost: $100–$200/hr billed time lost
- Typical automation ROI: 3–5× in year one
- Common tools: client onboarding, intake routing, reporting, CRM sync
- MVP floor: $2,000; strong value signals often land $3,000–$6,000+

### E-commerce / Product Businesses
- Manual process cost: $25–$75/hr
- Typical automation ROI: 2–4× in year one
- Common tools: inventory sync, order routing, customer comms
- MVP floor: $2,000; complex integrations often land $3,500–$5,500+

### Creative Studios / Agencies
- Manual process cost: $50–$150/hr
- Typical automation ROI: 3–6× in year one
- Common tools: intake triage, brief processing, asset routing, client updates
- MVP floor: $2,000; revenue-generating or team-scale tools often land $3,500–$6,000+

### Nonprofits
- Manual process cost: $30–$80/hr (staff or volunteer time)
- Typical automation ROI: 2–3× (cost savings focused)
- Common tools: donor comms, intake, reporting
- MVP floor: $2,000; value-based pricing still applies — do not default to minimum

### Healthcare / Wellness
- Manual process cost: $75–$200/hr
- Typical automation ROI: 3–5× in year one
- Common tools: intake, scheduling sync, follow-up comms
- MVP floor: $2,000; compliance complexity and error-cost signals often land $4,000–$7,000+

### Operations / Logistics
- Manual process cost: $40–$100/hr
- Typical automation ROI: 4–8× in year one
- Common tools: shipment tracking, supplier comms, reporting dashboards
- MVP floor: $2,000; high ROI sector — value signals often land $4,000–$8,000+

### SaaS / Technology Companies
- Manual process cost: $100–$250/hr (eng time)
- Typical automation ROI: 5–10× in year one
- Common tools: internal tooling, data pipelines, AI feature additions
- MVP floor: $2,500; high-value signals here frequently justify $5,000–$10,500+ even at MVP

### Solo Operators / Freelancers
- Manual process cost: $50–$150/hr (billed time lost)
- Typical automation ROI: 3–5× in year one
- Common tools: client comms, invoicing triggers, intake, scheduling
- MVP floor: $2,000; capacity-unlock signals (more clients without more hours) often justify $3,000–$5,000+

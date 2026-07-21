# WST Practitioner Curriculum
## Domain 3 — Processes: How Work Flows, Where It Breaks, and How to Fix It Precisely
### Complete Lesson Content — All Four Modules

**Document type:** Lesson Content
**Domain:** 3 — Processes
**Version:** 1.0 — May 2026
**Prepared by:** World Shift Technologies / Drew Griffiths
**Status:** First draft
**Prerequisites:** Domain 1 — Foundations · Domain 2 — People

---

## Domain 3 Overview

**Total estimated engagement time:** 6–8 hours across all four modules
**Prerequisites:** Domain 1 (Foundations) · Domain 2 (People)

Process is where the people layer and the technology layer meet. You cannot design a good AI integration without understanding the process it is touching. You cannot redesign a role without understanding the work that flows through it. You cannot advise a client on what to automate without first knowing what the work actually is — not what the org chart says, not what the owner describes, but what actually happens between the moment a client makes contact and the moment the business delivers something.

The central claim of this domain is deceptively simple: most SMB operational problems are not technology problems. They are process visibility problems. The work is undocumented. The decisions are bottlenecked in one or two people. The tools are disconnected. The result is a business that runs on heroics rather than systems. AI does not fix that. A well-designed process layer — lean, documented, owned — makes AI possible. An undocumented process layer makes AI dangerous.

Domain 2 established that processes often live in people rather than documents. Domain 3 is the methodology for surfacing them: making the invisible visible, mapping what actually happens rather than what is supposed to happen, and designing the smallest system that reliably produces the outcome.

**The four modules:**
- **3A** — How work actually flows: mapping and auditing operations
- **3B** — SMB operational failure patterns
- **3C** — Lean methodology and right-sized systems design
- **3D** — Designing processes that survive AI disruption

---

# MODULE 3A — How Work Actually Flows: Mapping and Auditing Operations

**Estimated engagement time:** 2.0 hours

**Learning objectives:** By the end of this module, you can:

1. Distinguish "work as imagined" (what the SOP says, what the owner describes) from "work as done" (what actually happens), and explain why the gap between the two is where the real breakdowns are.
2. Conduct a process trace — following a single transaction or customer through an organization end to end — as the most reliable method for surfacing real breakpoints.
3. Produce a right-sized process map (one-page swimlane or documented runbook) appropriate for a 10–50-person firm, not borrowed from enterprise consulting.
4. Recognize the founder bottleneck as simultaneously a people problem and a process problem, and address both dimensions.

---

## Lesson 3A-1: Work as Imagined vs. Work as Done

**Estimated time:** 30 minutes
**Method:** Reading

---

Every organization has two versions of its processes: the version that is described, documented, or believed to be true — and the version that actually operates. Erik Hollnagel, working in the resilience engineering tradition, named this distinction precisely: *work as imagined* versus *work as done*.

Work as imagined is what appears in the SOP, what the owner tells you in the first conversation, what shows up in the org chart, what the training manual describes. It is the formal account of how the organization intends for work to flow. It is usually accurate in outline and wrong in detail — sometimes significantly wrong.

Work as done is what actually happens. The adaptations that have evolved because the formal procedure does not work in practice. The informal communication channels that carry critical information because the official ones are too slow. The steps that are routinely skipped because they require information that is not available, or because they produce a result that needs to be corrected anyway, or because someone with more experience learned years ago that the shortcut is reliable. The hand-offs that happen informally between people who have figured out that the formal hand-off process is broken.

This gap is universal. It is not a sign of organizational dysfunction or individual failure. It is how real organizations of any health actually operate — because no procedure anticipates every situation, and competent people adapt. The gap is not the problem. The problem is not knowing the gap exists, and building recommendations on the imagined version.

**Why the gap matters for the practitioner:**

Any recommendation built on work-as-imagined will fail when it meets work-as-done. The AI tool designed to fit a process that is, in reality, performed entirely differently will not work as designed. The runbook produced from owner interviews will not reflect the actual flow. The automation that eliminates a step the SOP describes as simple will turn out to have eliminated a step that required significant judgment — judgment that the SOP did not capture because no one knew it was there.

The practitioner's job is to access work-as-done rather than accepting work-as-imagined. This is not about distrust. It is about epistemics. The owner is describing the process as they believe it to be. The front-line staff are performing the process as it actually is. The practitioner needs both, and needs to be able to identify where they diverge.

**What produces the gap:**

Procedures are written at a moment in time, for a version of the operation that existed then. The operation evolves — clients change, tools change, staff change, the nature of the work changes — and the procedure does not always keep up. Adaptations accumulate. The staff learn which steps to skip, which shortcuts are reliable, which informal channels actually carry the information. Over time, the procedure and the practice diverge.

This is adaptive. The staff who have adapted are usually doing the right thing — they have found a way to make the process work in the real conditions they face. The problem is that the adaptation is invisible to anyone who reads the procedure. It lives in the staff's practice, not in any document. When that staff member leaves, the adaptation often leaves with them.

**The practitioner's first signal:**

The clearest signal that a significant work-as-imagined / work-as-done gap exists is when you hear confident descriptions of a process from an owner or manager, then hear different descriptions — more tentative, more specific, more complicated — from the people who actually do the work. The owner says the client onboarding takes about a week. The account manager says it depends — straightforward clients take three to four days, but complex clients can take three weeks, and there are always exceptions that go longer because the intake form does not capture what you actually need. The gap between those descriptions is the gap you need to understand.

**Key takeaway:** Every organization has work-as-imagined and work-as-done. The practitioner needs the latter. The former is where to start the conversation; the latter is where the real information is.

---

## Lesson 3A-2: The Process Trace

**Estimated time:** 40 minutes
**Method:** Reading + simulation

---

The most reliable method for accessing work-as-done is the process trace: following a single unit of work — a customer inquiry, a project, an invoice, a hire — through the organization from the moment it enters to the moment it exits, documenting every hand-off, every decision point, every delay, and every person whose judgment or action affects the outcome.

**Why the artifact is more reliable than the interview:**

When you ask someone to describe a process, they describe it as they understand it — which is usually a composite of the formal procedure and their experience of how it mostly goes. They will not spontaneously tell you about the exceptions, the workarounds, the steps that require judgment they apply automatically, or the informal communication that happens outside the official channel. They are not hiding anything; they just do not think of the exception as part of the process because it feels like handling a situation, not following a procedure.

When you follow the artifact — the actual client file, the actual invoice, the actual job applicant — you encounter what happens, not what is supposed to happen. The file that gets stuck in someone's queue for three days because they are the only one with the authority to approve it and they were traveling. The invoice that requires a manual correction step that everyone performs and no one has documented. The new-hire onboarding that goes off-script at step four because the system they are supposed to be given access to is handled by a person who has an informal process of their own. The artifact reveals the process as it actually operates.

**How to conduct the process trace:**

Select one representative unit of work. For a professional services firm, this might be a client engagement from first inquiry through final invoice. For a product business, it might be a customer order from placement through delivery. For a logistics firm, it might be a shipment from booking through delivery confirmation. The unit should be current enough that the people involved can still describe it in detail.

Document every step the artifact takes. Who touches it? What do they do to it? How long does each step take — not in theory, but in this instance? Where does it wait? What decisions get made, and by whom? What information does each person need to do their step, and where does that information come from? What happens when the information is not available or is incorrect?

Look specifically for: steps that appear in the procedure but did not happen; steps that happened but do not appear in the procedure; steps that required judgment that is not documented anywhere; delays that recur but have no formal owner; and hand-offs that depend on informal relationships rather than formal channels.

**Designing the trace before you conduct it:**

Before you follow the artifact, write down what you expect to find — based on the owner's description of the process. Then conduct the trace and compare. The divergences between your expectation and what you found are your most important findings. They reveal specifically where work-as-imagined and work-as-done diverge, and they give you a concrete basis for the conversation with the client about what is actually happening in their operation.

**The process trace interview:**

For each person whose judgment or action affects the artifact's movement, conduct a brief targeted conversation. Not "tell me about your role" — but "walk me through specifically what you did with this file, in the order you did it." The specificity of the artifact grounds the conversation and prevents the respondent from defaulting to the procedure description. "I'm looking at this actual engagement file — can you walk me through what happened between when it came to you and when it left your queue?"

**Simulation:**

You are working with Meridian Consulting, a 14-person strategy consulting firm. The owner tells you: "Our client onboarding is pretty straightforward. Once we get a signed contract, we send a welcome email, schedule the kickoff call, and set up the project in our project management tool. It usually takes about a week."

Design the process trace you would conduct to verify this description. Specifically:

1. What is the artifact you would follow?
2. Who would you need to speak with, and in what order?
3. What five questions are you most interested in answering through the trace?
4. What divergences from the owner's description would you not be surprised to find — and why?

*Debrief:* The owner's description is three steps: welcome email, kickoff call, project setup. A 14-person consulting firm onboarding a client almost certainly involves more than three steps. The questions worth investigating: Who sends the welcome email — the owner, an admin, or the engagement lead, and does it get sent from a template or written fresh? What goes into the project setup — is the project management tool actually used consistently? What happens with the contract handoff — does the engagement team know what was promised before they get on the kickoff call? What information does the project lead need before the kickoff that is not mentioned in the three-step description? The trace will almost always reveal more than the owner's account contains.

**Key takeaway:** The artifact does not have opinions about how the process is supposed to work. It only has a record of how it actually went.

---

## Lesson 3A-3: Right-Sized Process Documentation

**Estimated time:** 25 minutes
**Method:** Reading

---

Once you have accessed work-as-done through the process trace, the question is how to document it in a form that is actually useful. The answer for most SMBs is not a BPMN diagram or a 40-page process manual. It is a one-page runbook.

**What a runbook is:**

A runbook is a step-by-step description of a specific process, written for the person who will perform it, with enough detail that the process can be executed correctly by someone who has not done it before — and without so much detail that it becomes unusable. It documents the actual process (work-as-done, not work-as-imagined), identifies the owner of each step, specifies where each step's inputs come from and where its outputs go, and flags the decision points where judgment is required.

A one-page runbook for a 15-person firm is the appropriate format for most core processes. If it runs longer than one page, either the process is genuinely complex enough to require more detail (client contracts that have legal implications, for instance), or the runbook has been written at the wrong level of granularity.

**The design test:**

Can a person who has never done this job use this document to perform this process adequately? If yes, the runbook is complete. If no, it needs more work. If it is 40 pages, the problem is different — the document is too complex to use in practice and will be ignored. A runbook that sits on a server unread has not improved the process; it has just added the cost of writing it.

**What a swimlane adds:**

For processes that involve multiple people or departments, a one-page swimlane adds the visual dimension: who does what, in what sequence, and where the hand-offs are. This is the most useful process documentation format for most SMBs because it makes the hand-off points — which is where most delays and errors occur — immediately visible.

**The 10–15 core processes:**

Most SMBs of 10–50 people have 10 to 15 core processes that constitute the majority of their operation. These typically include: client inquiry handling, proposal or quoting, contract or agreement, client onboarding, service delivery, quality review, invoicing, collections, vendor management, and hiring. Documenting these at the one-page runbook level gives the organization a process foundation it currently almost certainly does not have.

What documenting them actually accomplishes is more limited than owners typically expect: it does not fix the processes, it makes them visible. Visibility is the prerequisite for improvement, for onboarding new staff, for identifying automation opportunities, and for building the resilience that comes from having the work live in documentation rather than exclusively in people.

**What documentation does not accomplish:**

It does not change behavior. Documented processes that conflict with the actual workflow incentives will be ignored. The new runbook that says the project setup takes one day will be ignored if the project management tool requires sign-off from a person who is only available twice a week. Documentation follows process redesign; it does not precede it.

**Key takeaway:** A one-page runbook that is actually used is worth more than a 40-page process manual that lives on a server. Right-size the documentation to the firm's actual capacity to maintain and follow it.

---

## Lesson 3A-4: The Founder Bottleneck

**Estimated time:** 25 minutes
**Method:** Reading + reflection

---

The most consistent operational failure mode in firms under 50 people is work concentrated in one or two people — usually the founder. Decisions that should be delegated route back to the founder because the founder is the only person with the authority, the information, or the relationships to make them. The process cannot move without the founder's involvement at multiple points. The business does not scale; it clones the founder's working hours.

**Why it develops:**

In the early stages of most small businesses, the founder is genuinely the most competent person in the operation. They know the clients, they know the service, they make good decisions quickly. Routing things through them is efficient — because they are fast, accurate, and trusted. The organization learns to route things through them because it works.

As the firm grows, this pattern persists because: the founder's quality of judgment is still high; delegating requires trusting someone else's judgment, which requires either confidence in that person or willingness to tolerate errors; and the founder often does not notice the bottleneck because from their position, things are moving — they are making decisions quickly, even if the queue of decisions waiting for them is growing.

**Its dual nature:**

The founder bottleneck is simultaneously a process problem and a people problem. As a process problem: the work is undocumented, because the founder knows how to do it and does not need documentation. The decision authority is not distributed, because delegation was never formalized. The client relationships are personal, because the founder built them and maintains them. None of this is visible in the org chart or the SOP.

As a people problem: the organization's capacity is constrained by the founder's working hours and attention. Any scaling effort is subject to the founder's bandwidth. If the founder leaves — even temporarily — the operation becomes fragile. The team has learned to wait for the founder rather than to exercise their own judgment, because that was the efficient behavior for so long.

**Addressing it with a client:**

Most founders do not see the bottleneck as a problem. They see themselves as involved in the right things, making good decisions, serving clients well. The framing that lands best is not "you are the bottleneck" — it is "right now, your firm's capacity is constrained by your bandwidth. Every time you scale, you are scaling against your own hours. That's a ceiling we can design around."

The process trace will make the bottleneck visible. Every time the artifact sits waiting for the founder's input or approval, that waiting time appears in the trace. Show the founder the trace. "This engagement spent three days waiting — twice. Both times it was waiting for you. That's not a criticism; it's what the data shows. The question is what we want to do about it."

**Reflection:**

You identify a clear founder bottleneck in a client firm. The founder is engaged, smart, and genuinely does make good decisions quickly when they are available. But the firm is trying to grow from 12 to 20 people, and the bottleneck is the primary constraint on that growth. When you raise it, the founder says: "I understand the theory, but honestly, when I delegate, things go wrong. I've tried it before. My team is good, but they're not ready for this level yet."

Write 150 words on how you would respond, and what you would do next.

**Key takeaway:** The founder bottleneck is not a personal failing. It is a structural pattern that develops rationally and persists rationally — until the cost of it becomes visible. The process trace makes it visible.

---

**Discussion prompt:** You conduct a process trace and discover that a critical client-facing process depends almost entirely on informal communication between two specific employees who sit near each other and talk throughout the day. The process documentation says this step is handled through the project management tool. What are the implications, and how do you handle it?

**AI assistant prompt:** Ask the curriculum assistant: "What does the resilience engineering literature say about the relationship between process documentation and operational resilience — does documenting a process make it more or less resilient, and under what conditions?"

---

**Module 3A Assessment**

**Type:** Process trace design + documentation critique

**Prompt:** You are given a description of a 16-person professional services firm's client delivery workflow — as described by the owner in a first conversation.

*(a)* Identify three places in this account where "work as imagined" likely diverges from "work as done." Explain your reasoning for each — what in the owner's description suggests the divergence, and what you would expect to find instead.

*(b)* Design the process trace you would conduct: what artifact would you follow, who would you speak with and in what order, and what five questions is the trace specifically designed to answer?

*(c)* The owner shows you their existing process documentation — a 47-page Word document last updated 22 months ago. Write the two or three sentences you would say about it.

**What it measures:** Ability to identify the work-as-imagined / work-as-done gap from description alone; process trace design rigor; honest, constructive client communication about existing documentation.

---

# MODULE 3B — SMB Operational Failure Patterns

**Estimated engagement time:** 1.75 hours

**Learning objectives:** By the end of this module, you can:

1. Name and operationally define all seven SMB failure modes, and explain why each develops and persists.
2. Identify which failure modes are present in a client firm from a first conversation — distinguishing what is clearly present, what needs investigation, and what is not yet indicated.
3. Recognize the co-occurrence patterns: which failure modes reliably appear together and why.
4. Apply the seven-failure-mode framework as a first-contact diagnostic, holding it as a hypothesis-generating tool rather than a verdict.

---

## Lesson 3B-1: The Seven Failure Modes — Overview

**Estimated time:** 20 minutes
**Method:** Reading

---

Across SMB types and industries, the same operational problems appear with striking regularity. They have different surface presentations in different businesses, but the underlying patterns are consistent. A practitioner who can recognize them quickly — from a first conversation, from a walk-through, from a brief read of the financials — is ahead of the engagement before the formal work begins.

The seven failure modes:

**1. Cash conversion failure.** The business is profitable on paper but perpetually short of cash. Revenue is recognized when work is done; cash arrives weeks or months later. The gap between delivery and payment is funded by the owner's personal credit, by delayed vendor payments, or by simply running out of money at predictable points in the cycle. The JPMorgan Chase Institute found in 2019 that the median small business holds fewer than 27 days of cash buffer — meaning that a single bad month or a 30-day delay from a major client is a genuine crisis. This is not primarily a financial management problem; it is a process problem. Invoicing timing, contract payment terms, collections processes, and the connection between project milestones and billing events are all operational choices that determine cash flow.

**2. Founder bottleneck.** Covered in Module 3A. The operation cannot scale beyond the founder's bandwidth. Decisions, client relationships, and institutional knowledge are concentrated in one person.

**3. Process opacity.** The organization cannot clearly describe how it does what it does. The processes exist — the work gets done — but they are not documented, not transferable, not improvable, and not auditable. When staff turn over, the process knowledge leaves with them. When the business tries to scale, it scales the founder's time rather than a replicable system. When something goes wrong, no one can identify where in the process the failure occurred.

**4. Tool sprawl and data fragmentation.** The firm has acquired tools over time — often one tool per problem as problems arose — and the tools do not talk to each other. Data lives in multiple systems with no single source of truth. Staff manually transfer information between tools. Reports are assembled by hand from multiple sources. The SaaS spend is significant and poorly understood; Productiv and Vendr data from 2024 suggest that the average company uses 4–6x more SaaS tools than IT is aware of, and SMBs without an IT function are particularly prone to uncontrolled tool accumulation. This is simultaneously an operational problem (manual data transfer is a source of errors and delays), a financial problem (duplicative tool spend), and a technology risk (data scattered across many vendors with varying security practices).

**5. Quality drift.** The business produces variable quality — inconsistent across staff, across time, or across client types — without having a quality system that would make the variation visible. The first signs are usually client complaints or churn that is attributed to individual incidents rather than patterns. Quality drift is often invisible until it is significant because the firm lacks the measurement infrastructure to see it. There is no defined standard, no review process, no mechanism for surfacing below-standard work before it reaches the client.

**6. Decision latency.** Decisions that should take hours take days or weeks. The organization does not have clear decision authority, so decisions wait for the right person to be available, or escalate to a level that does not need to be involved, or get made by the wrong person and then revisited. The cost of decision latency compounds: opportunities are missed, client responses are delayed, staff are blocked waiting for direction. In an AI-era environment, decision latency is particularly costly because AI tools require fast, iterative feedback to improve — a firm that cannot make decisions quickly cannot iterate.

**7. Customer concentration.** The Federal Reserve Small Business Credit Survey finding that SMBs with more than 25% of revenue from a single customer are significantly more likely to experience financial distress is not primarily a business development observation — it is an operational one. A firm dependent on a small number of large clients organizes its operations around those clients: its processes, staffing, and tools are all calibrated to serve that client base. When a concentrated client relationship changes — the client changes their vendor, reduces their spend, or is acquired — the firm's operational infrastructure no longer fits its actual revenue situation, and the adjustment is painful and slow.

**Key takeaway:** These seven failure modes are not random. They develop through understandable sequences of events, and they persist because the costs are often not visible until they become significant. Recognizing them early is a primary source of value in the first phase of any engagement.

---

## Lesson 3B-2: Each Failure Mode in Depth

**Estimated time:** 30 minutes
**Method:** Reading

---

**Cash conversion failure — the operational dimension:**

Cash flow problems are usually described as financial problems. They are also, and often primarily, process problems. The typical cash conversion crisis in an SMB has specific operational causes: invoices sent late because the billing process is manual and deprioritized; payment terms that were accepted without thought and now produce a 60-day gap between delivery and payment; collections processes that are nonexistent or too gentle to be effective; milestone billing that is not tied to actual project events. Each of these is a process design choice — and each can be addressed through process redesign rather than through the financial heroics that most owners resort to.

The practitioner's entry point: map the billing and collections process with the same rigor as the client delivery process. Where does the invoice get generated, and when? Who is responsible for it? What happens when payment is not received? These questions usually surface a process that is informal, delayed, and lacking ownership — and they surface it in a way that makes the operational fix obvious.

**Process opacity — what it costs at the moment of scaling:**

Process opacity is most expensive not in normal operation but at inflection points: when the firm tries to hire and the new person cannot figure out how to do the work without extensive hand-holding; when the firm tries to grow and discovers there is no system to replicate; when the founder tries to take a vacation and the operation struggles without them; when the firm faces a crisis and cannot diagnose where in its process the problem occurred.

At each of these moments, the cost of opacity becomes concrete and measurable. The new hire who needs six months of informal learning before they are productive. The client who churns because the account was managed informally and the relationship did not transfer. The crisis that took three weeks to resolve because no one could trace where it started.

**Tool sprawl — the hidden cost:**

The direct cost of tool sprawl is measurable: duplicative subscriptions, tools that overlap in function, tools that are unused. A 2024 BetterCloud survey found that an average of 28% of SaaS applications in organizations are unused or underutilized. For SMBs without an IT function to audit the stack, the proportion is likely higher.

The indirect cost is harder to quantify but larger: staff spend time manually transferring data between systems; reports that should be automated are assembled by hand; integrations that were built between tools break when tools are updated and no one notices; data that should inform decisions is inaccessible because it lives in a tool that only one person knows how to use. These costs accumulate without ever appearing on a line item.

**Quality drift — why it is invisible:**

Quality drift is the failure mode that surprises owners most, because by definition you cannot see it without measurement infrastructure that most SMBs do not have. The firm is producing variable quality — some deliverables are excellent, some are acceptable, some are below standard — and the variation is invisible because there is no defined standard to compare against, no review process to catch below-standard work, and no feedback loop that connects client satisfaction to specific process events.

The signal that quality drift is happening is usually pattern recognition: client complaints that seem like isolated incidents but cluster around similar types of work or similar staff; churn rates that are higher than the owner expected; referral rates that are lower than the client satisfaction scores would predict. When the practitioner sees these signals, the question to ask is: "What is your quality review process?" If the answer is vague, quality drift is the hypothesis.

**Decision latency — the organizational architecture problem:**

Decision latency is almost always an organizational architecture problem. Decisions wait because the authority to make them is unclear, because the person with authority is unavailable, or because the culture requires consensus that is never achieved. The fix is not working faster — it is designing decision rights clearly: who can make this decision without escalation, who needs to be consulted, who needs to be informed afterward.

RACI (Responsible, Accountable, Consulted, Informed) frameworks are the standard tool for documenting decision rights. At SMB scale, the practitioner does not need to run a full RACI exercise for every decision — but for the decisions that are consistently slow or contested, a brief RACI mapping is often sufficient to surface the problem and prompt the fix.

**Key takeaway:** Each failure mode has a specific operational root cause and a specific operational response. Naming the failure mode precisely is the first step toward the fix.

---

## Lesson 3B-3: Pattern Recognition in the First Conversation

**Estimated time:** 30 minutes
**Method:** Simulation

---

The seven failure modes are not just an analytical framework. They are a listening framework for the first conversation with a client. An owner who spends time in the first meeting describing cash pressure, client relationships that are "a bit rocky," and a team where "everyone wears a lot of hats" is giving you signals for cash conversion failure, quality drift, and process opacity simultaneously. The practitioner's job is to receive those signals accurately, generate hypotheses, and know which questions to ask next.

**What each failure mode sounds like in first-contact conversation:**

*Cash conversion failure:* "We've had a couple of tough months." "We have good revenue but cash is always tight." "We're growing but it doesn't feel like it." "A big client paid late and it really hurt us."

*Founder bottleneck:* "I'm involved in a lot of the client work directly." "My team is good but they need a lot of direction." "If I take time off, things tend to pile up." "I'm the one who has the relationships with most of our major clients."

*Process opacity:* "We don't really have formal processes — we're pretty nimble." "Everyone kind of knows what to do." "It's hard to explain exactly how we do it — it's more of an art." "We've never really written any of this down."

*Tool sprawl:* "We use a lot of different tools." "I'm not sure what everyone is using, to be honest." "We have a project management tool but I don't think everyone uses it." "Our data is kind of all over the place."

*Quality drift:* "We've had some issues with consistency." "A couple of client complaints recently that surprised me." "Some of our people are stronger than others." "I worry about what happens as we grow."

*Decision latency:* "Things take longer than they should." "I end up having to approve a lot of things I probably shouldn't need to." "My team is sometimes not sure what to do when something unusual comes up." "We had a situation recently that dragged on for weeks because no one knew who should decide."

*Customer concentration:* "We have one client who is about 40% of our revenue." "If [major client] reduced their spend, it would really hurt us." "Most of our processes are built around how [major client] wants things done."

**The co-occurrence patterns:**

Some failure modes reliably appear together. Cash conversion failure and customer concentration co-occur frequently: a firm dependent on a few large clients often has payment terms dictated by those clients, and the concentration means that any payment delay from a major client is a cash crisis. Tool sprawl and process opacity co-occur: the firm that does not document its processes also tends to adopt tools ad hoc, without governance, and the tool stack reflects the same informal decision-making that produces the process opacity. Founder bottleneck and decision latency co-occur: when the founder is the decision-maker for too many things, everything waits for the founder.

Recognizing co-occurrence patterns is useful because it suggests a systemic issue rather than isolated problems. A firm with cash conversion failure, customer concentration, and founder bottleneck is describing an organization where the owner personally manages the major client relationships, where the payment terms reflect those relationships rather than operational need, and where the collections process — if one exists — waits for the owner's involvement. The fix is not three separate fixes; it is one structural conversation about how the firm operates.

**The practitioner's discipline:**

Observe and hypothesize. Do not diagnose in the first conversation. The signals point toward failure modes that need investigation, not toward confirmed findings. The owner who says "our data is kind of all over the place" is giving you a tool-sprawl hypothesis, not a confirmed finding. The next step is: what does the actual tool inventory look like, who is using what, and what is the data actually doing across those tools?

**Simulation:**

You are given a 20-minute transcript of a first client conversation with the owner of a 17-person HR consulting firm. Highlights from the transcript:

- "We've been growing pretty fast — from 8 people two years ago to 17 now. It's been exciting but honestly a bit chaotic."
- "I'm still pretty involved in most of the client engagements. I know I should delegate more but my clients really want to deal with me."
- "We've added a lot of tools over the last two years — I think we have about 15 software subscriptions right now. Some of them overlap, I think."
- "We had a really difficult client situation last month. It dragged on for about three weeks before we resolved it. I'm not sure it was handled the way I would have handled it."
- "One client is about 35% of our revenue. They're great, but I sometimes think about what would happen if that changed."
- "Cash is fine right now, but we've had some months where it was tight, especially when big invoices were slow to pay."

Annotate the transcript: for each of the seven failure modes, mark whether it is (a) clearly indicated, (b) possibly indicated and needs investigation, or (c) not indicated. Then identify the two failure modes that concern you most given the firm's current growth trajectory, and write the one question you would prioritize for each in the next conversation.

**Key takeaway:** First-contact language is diagnostic data. The practitioner who can read it accurately arrives at the second conversation with hypotheses worth testing.

---

**Discussion prompt:** A client presents their business as highly organized and process-driven. They have a project management tool, documented SOPs, and a quality review process. As the conversation continues, you notice several signals that suggest the actual operation diverges from this description. How do you proceed?

**AI assistant prompt:** Ask the curriculum assistant: "What does the SMB financial research show about the relationship between cash conversion cycle length and business survival rates — and are there documented interventions that reliably shorten the cash conversion cycle?"

---

**Module 3B Assessment**

**Type:** Failure-mode annotation

**Prompt:** You are given a first-contact brief for a fictional 14-person marketing agency: the owner's opening email, notes from a 30-minute phone call, and three observations from a walk-through of the office.

*(a)* For each of the seven failure modes, annotate the brief: clearly present, possibly present and needs investigation, or not indicated. Cite the specific evidence from the brief that informs each assessment.

*(b)* Identify the co-occurrence pattern you observe — which failure modes appear together and what does their combination suggest about the underlying organizational structure?

*(c)* Write the two process-audit questions you would prioritize in the first on-site visit. Explain why each is the most important question for the failure mode it is investigating.

**What it measures:** Failure-mode pattern recognition; calibration between clear evidence and hypothesis; co-occurrence pattern analysis; diagnostic prioritization.

---

# MODULE 3C — Lean Methodology and Right-Sized Systems Design

**Estimated engagement time:** 1.75 hours

**Learning objectives:** By the end of this module, you can:

1. Apply lean philosophy at SMB scale — the smallest system that reliably produces the outcome — as a design principle, not a compliance exercise.
2. Use Wardley Mapping as a lightweight tool for identifying which parts of an SMB's operation are commodity (automate or buy) versus custom (protect and invest).
3. Identify when EOS/Traction and similar frameworks are genuinely useful versus overkill for a given client.
4. Design a one-page operating infrastructure — the 10–15 core processes that constitute most of an SMB's operation — appropriate for a firm of 10–50 people.

---

## Lesson 3C-1: Lean Philosophy at SMB Scale

**Estimated time:** 30 minutes
**Method:** Reading

---

The lean tradition began on the Toyota production floor and has since been applied to software development, product design, healthcare, education, and organizational management. What translates across all of these contexts is a deceptively simple principle: design the smallest system that reliably produces the outcome. Not the most comprehensive system. Not the most sophisticated system. The smallest reliable one.

For the SMB practitioner, this is the design standard. Not: what is the best practice in this domain? But: what is the minimum viable system that will work reliably at the scale and complexity of this specific firm?

**Build-Measure-Learn at operational scale:**

Eric Ries's Build-Measure-Learn loop, developed in the Lean Startup tradition for product development, applies directly to operational design. The practitioner does not design the perfect process on paper and then implement it. They design a process that is good enough to test, measure whether it produces the intended outcome, and learn what adjustment is needed. Then adjust. Then measure again.

This is the antidote to the most common process consulting failure mode: delivering a comprehensive process design that the client implements 40% of, abandons the rest, and then concludes that "the process stuff didn't really work for us." The process stuff did not work because it was designed for a firm three times the size and three times the operational sophistication of the actual firm.

The minimum viable process question: what is the simplest version of this process that would reliably produce a good outcome? Start there. Measure. Improve.

**Minimum viable bureaucracy:**

Julian Birkinshaw and Jonas Ridderstråle's concept of "minimum viable bureaucracy" captures the design target precisely. Every coordination mechanism — every meeting, every approval step, every reporting requirement, every tool — should be able to answer the question: what work does this enable? If the answer is unclear, the mechanism is overhead, not infrastructure.

The 47-page process manual that no one reads is a bureaucracy that has exceeded the minimum. The weekly all-hands meeting that produces no decisions is a coordination mechanism whose work cannot be clearly identified. The project management tool with 15 custom fields that only two people understand is a system that has been designed for a complexity the firm does not yet have.

The practitioner's application: for every process or coordination mechanism they encounter, the question is not "is this documented?" but "does this work, and is it the minimum that will make it work?"

**The failure mode of over-systematizing:**

It is possible to give a firm too much system. A 12-person professional services firm that receives a full EOS implementation — quarterly rocks, L10 meetings, V/TO, scorecards, issues lists — will spend the next six months implementing the framework rather than serving clients, and will have adopted an organizational management system designed for a firm significantly larger and more operationally mature than they currently are.

EOS/Traction (Gino Wickman's Entrepreneurial Operating System) is a useful framework. It is also frequently sold to firms for whom it is overkill, and the implementation cost is real. The practitioner's job is to assess which elements of a framework serve this specific firm at this specific stage — and to resist the temptation to deliver complexity because complexity feels like value.

**Key takeaway:** The design target is the smallest system that reliably works. Everything above that is overhead until proven otherwise.

---

## Lesson 3C-2: Wardley Mapping for SMBs

**Estimated time:** 35 minutes
**Method:** Reading + simulation

---

Simon Wardley developed his mapping framework to answer a specific question: given our current capabilities, what should we build ourselves, what should we buy off the shelf, and what should we outsource entirely? The answer depends on where each component of the value chain sits on the spectrum from genesis (novel, poorly understood, not yet productized) to commodity (standardized, widely available, interchangeable between suppliers).

The principle: commodity components should be bought off the shelf or outsourced; custom-built components are where the firm's differentiation lives and where investment is warranted. Spending significant resources on a commodity component — building custom infrastructure that could be bought — is waste. Commoditizing a component that is genuinely differentiating — outsourcing or buying off the shelf something that clients value specifically because the firm does it — is strategic error.

**The SMB application:**

Most SMBs are running commodity processes on custom or self-managed infrastructure. Email is a commodity. Billing is a commodity. Scheduling is a commodity. File storage is a commodity. But many SMBs are managing these on self-built or self-maintained systems — using tools that require internal expertise to maintain, or managing processes manually that could be handled by a standard off-the-shelf solution. The overhead is real; the value is not, because these are commodities.

At the same time, the things that actually differentiate the firm — the client relationship approach, the delivery methodology, the institutional knowledge of a specific sector or problem type — are often not protected or invested in. They live informally in people, undocumented, unreplicable. These are the things that should be built, documented, and invested in. The Wardley lens helps identify the mismatch.

**A simplified Wardley exercise for an SMB engagement:**

List the 10–15 components of the firm's value chain. For each, place it on the genesis-to-commodity spectrum:

- *Genesis:* Novel to this firm or this industry. No established solution exists. Requires custom development.
- *Custom-built:* Solutions exist, but this firm has built their own because the available solutions did not fit, or because the firm built before good solutions existed.
- *Product:* Good off-the-shelf solutions exist. The firm may or may not be using them.
- *Commodity:* Fully standardized, interchangeable between suppliers, available at low cost.

The mismatch to look for: components that are in the *product* or *commodity* zone but being managed as *custom-built* (wasted effort). Components that are in the *genesis* or *custom-built* zone and are a genuine source of differentiation (deserving of investment and protection).

**Simulation:**

You are working with Brightline, a 19-person commercial real estate advisory firm. From your process trace and first conversations, you have identified the following components of their value chain: client prospecting and outreach, market data analysis, client relationship management, property research and comparison, deal structuring advice, document preparation (LOIs, lease summaries), internal communication and coordination, billing and invoicing, knowledge management (what they have learned about specific markets), and client reporting.

Place each component on the genesis-to-commodity spectrum. Identify two components that you believe are being managed at the wrong point on the spectrum — one that is being treated as custom but should be a commodity buy, and one that is genuinely differentiating but is not being protected or invested in. Explain your reasoning for each.

*Debrief:* Most firms will have something like document preparation (a commodity being handled manually or with generic tools when specialized solutions exist) alongside market knowledge or client relationship depth (a genuine differentiator living entirely in people's heads). The mismatch between commodity overhead and underinvested differentiation is usually visible once you map it.

**Key takeaway:** Wardley Mapping is not a planning exercise — it is a clarity exercise. It shows where a firm is investing in things that don't differentiate and not investing in things that do.

---

## Lesson 3C-3: The One-Page Operating Infrastructure

**Estimated time:** 30 minutes
**Method:** Reading + simulation

---

Every SMB of 10–50 people has 10–15 core processes that constitute the majority of its operation. Mapping these at the one-page runbook level is the concrete output of the process design work — and it is the deliverable that gives a firm the process foundation it needs to scale, to onboard, to improve, and to absorb AI tools responsibly.

**The 10–15 core processes:**

The exact list varies by business type, but for most service or professional services SMBs, the list looks something like this:

1. Client inquiry handling (first contact through qualification)
2. Proposal or scoping (requirement gathering through proposal delivery)
3. Contract or agreement (proposal accepted through signed agreement)
4. Client onboarding (signed agreement through active engagement start)
5. Service delivery (engagement execution)
6. Quality review (internal review before client delivery)
7. Client communication and reporting (ongoing during engagement)
8. Project close and handoff (final deliverable through engagement closure)
9. Invoicing (engagement milestone or completion through invoice sent)
10. Collections (invoice sent through payment received)
11. Vendor management (vendor identification through ongoing relationship)
12. Hiring (role defined through offer accepted)
13. Staff onboarding (offer accepted through productive independent work)
14. Performance and development (ongoing)
15. Knowledge management (what we know and how we access it)

Not every firm needs all 15. Some firms have additional processes specific to their industry. The goal is to identify the complete set of core processes for this specific firm, then document each at the one-page level.

**What the exercise accomplishes:**

The owner who has completed this exercise with the practitioner has, for the first time, a complete picture of how their firm actually operates. Not how they think it operates — how it does. They can see where the processes are strong, where they are fragile, where they depend on specific people, and where the documentation is sufficient to allow onboarding without months of hand-holding.

They also have the foundation for AI integration. Every AI tool that is worth deploying touches a specific process. You cannot responsibly deploy it without understanding the process it is touching. The one-page runbook for each core process is the prerequisite for the technology audit in Domain 4.

**The sequencing principle:**

The practitioner does not produce all 15 runbooks themselves and hand them to the client. That is shelf-ware. They work through the process with the client and the key staff — the people who actually do the work — so that the documentation reflects what actually happens and is recognized as accurate by the people it is about. The client owns the documentation, participates in building it, and is therefore more likely to maintain it.

**Simulation:**

You are wrapping up the process phase of an engagement with a 16-person bookkeeping and tax advisory firm. You have completed process traces for three of their core processes. Based on your work, the owner asks you to help them prioritize: which five processes should they document first, and in what order?

Write the prioritized list with a brief rationale for each. Your prioritization should account for: which processes are most fragile (highest risk if the informal knowledge is lost), which processes are most client-facing (highest impact on client experience), and which processes are most likely to be touched by the AI tools they are considering.

**Key takeaway:** The one-page operating infrastructure is not a documentation project. It is a clarity project — a complete, accurate picture of how the firm actually works, owned by the people who do the work.

---

**Discussion prompt:** A client enthusiastically adopts the one-page runbook format and produces 23 runbooks in three weeks. When you review them, they are all written at the level of work-as-imagined rather than work-as-done — essentially formalized SOPs rather than traces of the actual process. How do you handle this?

**AI assistant prompt:** Ask the curriculum assistant: "What does the lean research actually show about the conditions under which lean implementation succeeds versus fails in small organizations — what are the documented failure modes of lean applied at SMB scale?"

---

**Module 3C Assessment**

**Type:** Systems design brief

**Prompt:** A client — a 13-person executive search firm — has asked you to help them design a more systematized operation. They are considering EOS/Traction as a framework. Their current state: no documented processes, a project management tool used inconsistently by half the team, billing handled manually by the owner, and a knowledge management system that consists of a shared folder called "Client Info" with 847 files in no discernible order.

*(a)* Make the case for or against EOS/Traction for this specific firm at this stage. Be specific about what elements of the framework would and would not serve them.

*(b)* Apply the Wardley lens: identify two components of their value chain that you suspect are being managed at the wrong point on the spectrum. What would you recommend for each?

*(c)* Propose the first five core processes they should document, in priority order. Explain how lean and minimum-viable-bureaucracy principles shaped your choices.

**What it measures:** Lean systems thinking at SMB scale; right-sizing to culture and context; Wardley Mapping application; sequencing and prioritization; avoidance of over-engineering.

---

# MODULE 3D — Designing Processes That Survive AI Disruption

**Estimated engagement time:** 1.75 hours

**Learning objectives:** By the end of this module, you can:

1. Conduct a brittleness audit on any automated process — identifying single points of failure, vendor dependency risks, and the human capacity gaps that over-automation creates.
2. Apply the "so-so automation" framework to distinguish automation that genuinely improves outcomes from automation that displaces work without meaningful gain.
3. Design a process for graceful degradation — the ability to perform the process adequately when the automated tool fails, changes pricing, or is deprecated.
4. Apply the AI process application evidence map (Tier 1 / Tier 2 / Tier 3) when advising clients on where AI investment is and is not supported by independent evidence.

---

## Lesson 3D-1: Automation-Induced Brittleness

**Estimated time:** 30 minutes
**Method:** Reading

---

When a process is automated end-to-end without preserving the human capacity to perform it manually, the firm becomes dependent on the tool's continued operation, pricing, and behavior. This is automation-induced brittleness.

At enterprise scale, brittleness is absorbed by redundancy: backup systems, IT teams, vendor contracts with SLAs, internal capacity to rebuild if something fails. At SMB scale, none of this exists. A tool that is deprecated, changes its pricing model, or updates its underlying model in a way that changes its outputs can break a process overnight — and the firm has no fallback.

This is not a hypothetical risk. The AI tool landscape of 2024–2026 has seen: models updated mid-contract in ways that changed output quality and format; pricing changes that made previously economical API use prohibitively expensive; tools acquired and pivoted or deprecated; companies that built processes around specific model capabilities that were altered in the next model release. Each of these affected firms that had built their operations on the assumption of tool stability. The firms with graceful degradation designed in — a human process that could run if the tool was unavailable — absorbed the disruption. The firms without it faced crisis.

**The resilience engineering perspective:**

The high-reliability organizations literature (Weick and Sutcliffe, Hollnagel, LaPorte and Roberts) addresses this at the level of complex systems: the organizations that perform reliably under abnormal conditions are the ones that have maintained the human capacity to understand and perform the process even when automated systems are operating nominally. The human who can only supervise the output of an automated system — who no longer knows how to perform the underlying work — cannot diagnose when the output is wrong, cannot perform the work when the system fails, and cannot improve the system because they do not understand it deeply enough.

This principle translates directly to the SMB context. If the staff have no idea how to perform the invoice processing manually — because the AI has been doing it for 18 months and the manual process has atrophied — then when the AI tool changes, the firm cannot function until a new tool is found and deployed. This is brittleness by design.

**Graceful degradation as a design principle:**

A process designed for graceful degradation can perform its function adequately — not necessarily at the same speed or cost, but adequately — when the automated component is unavailable. This requires: preserving the manual process as a documented fallback, ensuring that at least one person understands and can perform it, and testing the fallback periodically so that the capability does not atrophy.

This is not an argument against automation. It is an argument for automation designed with the fallback in mind. The two can coexist: automate the invoice processing, but maintain the spreadsheet-based process as a documented fallback, review the fallback process quarterly, and ensure that the one person who still knows it is not the only person who does.

**Key takeaway:** Brittleness is designed in when the human fallback capacity is not preserved alongside the automation. Design both.

---

## Lesson 3D-2: The Brittleness Audit

**Estimated time:** 30 minutes
**Method:** Reading + simulation

---

The brittleness audit is a five-question protocol applied to every automated or tool-dependent process in a client firm. It surfaces the dependency risks before they become crises.

**The five questions:**

**1. What breaks when the tool changes its pricing?**
Some AI tools are priced per-API-call or per-output in ways that make the economics fragile. A tool priced at $0.01 per document that processes 5,000 documents a month is $50/month — manageable. If the pricing doubles, it doubles the cost but may still be manageable. If the pricing moves to enterprise tiers that are 10x the current cost, the firm may not be able to continue using it. What happens to the process when that pricing decision is made?

**2. What breaks when the model is updated and the outputs change?**
This is particularly acute for processes that depend on specific output formats, specific accuracy levels, or specific behavior from the model. A customer service drafting tool that produces outputs in a specific format may, after a model update, produce outputs in a different format that breaks the downstream workflow. The firm did not change anything; the vendor did. Who is responsible for monitoring this, and what is the recovery process?

**3. What breaks when the API fails for 24 hours?**
Every API has downtime. Most production APIs have target uptimes of 99.9%, which means about 8.7 hours of downtime per year. If the process that depends on the API is time-critical — client communications, invoicing, scheduling — 8.7 hours of unplanned downtime per year is a real operational risk. What is the fallback for that window?

**4. What breaks when the vendor is acquired and the product is pivoted or deprecated?**
The AI tool landscape is consolidating. Tools that are useful, well-priced, and reliable today may be acquired by a larger company next year and either integrated into a more expensive product or deprecated. This is not rare — it is the normal pattern of technology markets. The firm that has built its invoicing process around a tool that is deprecated in 18 months needs a recovery path that does not involve 3 months of manual billing while the process is rebuilt.

**5. Can a human still perform this process without the tool, in a reasonable time, without the outcome being catastrophic?**
This is the graceful degradation test. If the answer is no — if the manual fallback has atrophied or was never designed — the process is brittle by design. The fix is to preserve and document the manual fallback, test it periodically, and ensure that the staff who would need to execute it know how.

**Simulation:**

A client has automated their invoice processing workflow: their accounting software receives project completion notifications from their project management tool, generates draft invoices using an AI tool that reads the project scope and completion notes, and routes the draft to the account manager for approval before sending. The tool handles approximately 45 invoices per month. The account manager reports it "saves about 20 hours a week."

Conduct the brittleness audit. For each of the five questions, describe: what specifically would break, how quickly, and what the consequence would be for the firm's cash flow and client relationships.

*Debrief:* Invoice processing is exactly the kind of process where brittleness has direct financial consequences. A broken invoicing process is not an operational inconvenience — it is a cash flow crisis. The brittleness audit is not about whether to automate; it is about whether the automation has been designed with adequate fallback.

**Key takeaway:** The brittleness audit is a five-question protocol. Run it on every automated process before the engagement's recommendations are finalized.

---

## Lesson 3D-3: So-So Automation — Recognizing and Naming It

**Estimated time:** 30 minutes
**Method:** Reading + case analysis

---

Not all automation is good automation. Daron Acemoglu and Pascual Restrepo's 2024 working paper on "so-so automation" provides the academic framework for a pattern practitioners encounter regularly: automation that displaces workers without generating productivity gains large enough to justify the displacement — or the organizational cost.

**The economic argument:**

Acemoglu and Restrepo's historical analysis distinguishes between two types of automation. The first type creates new tasks and new categories of work: the automation of physical manufacturing labor created a massive demand for knowledge workers, administrative workers, and service workers. The displacement was real, but the new categories absorbed the displaced workers over time and at better wages. The second type — so-so automation — displaces existing tasks without creating new ones in equivalent volume or quality. The productivity gains are narrow; the displacement is broad; the net economic effect is negative or neutral.

The SMB application is specific: a firm that automates its customer service function and achieves the same customer satisfaction scores at lower headcount cost has improved its margins. But if the customer service staff have been displaced without new roles available to them inside or outside the firm, and if the quality of customer service is genuinely lower in ways that are not yet visible in satisfaction scores, the automation has produced a narrow gain at a broader cost.

**So-so automation at SMB scale:**

The signal that so-so automation is happening is usually visible in the gap between what is being claimed and what can be measured independently. "We've reduced our administrative headcount by 30% through AI" is a claim about displacement. The question is: what is the customer experience during those administrative interactions now? What errors are occurring that were not occurring before? What tacit knowledge was carried by the administrative staff that is now absent from the process?

The Klarna case is the most well-documented example. The automation worked — in the narrow sense that tasks were completed. It did not work in the broader sense that the output quality was lower, the tacit knowledge was gone, and the costs of those two things eventually exceeded the savings.

**How the practitioner names it:**

The practitioner does not use the term "so-so automation" with clients. They describe the observation: "The invoice processing is faster. Before we finalize this recommendation, I want to verify that the quality of the invoices hasn't changed in ways that might affect client relationships or payment timing. Can we look at the error rates and the payment-to-invoice cycle over the last six months compared to the six months before the automation?"

This is the discipline of measuring genuine improvement rather than accepting claimed improvement. The automation that saves 20 hours a week is not a success story until you have confirmed that the 20 hours of saved labor have not been offset by errors, by client friction, or by the loss of something that was being done in those 20 hours that is now not being done.

**Case analysis:**

Thornton Legal Services, a 22-person law firm, implemented an AI-assisted contract review tool 14 months ago. The tool reviews incoming contracts, identifies non-standard clauses, and generates a summary with recommendations. The managing partner reports that review time has decreased from an average of 4 hours per contract to 1.5 hours. The paralegals who previously handled initial review are now "freed up for higher-value work."

On investigation, you discover: the paralegals are now primarily doing administrative coordination rather than substantive legal work; the AI-flagged clause recommendations are accepted without further review approximately 70% of the time; in two recent matters, clauses that were not flagged by the AI caused problems that were caught by the client after signing; and the paralegals report that they feel less engaged and less developed in their roles than they did before the tool.

Analyze this case using the so-so automation framework. What has genuinely improved? What has the automation cost that is not appearing in the productivity metrics? What would you say to the managing partner?

**Key takeaway:** So-so automation looks like a success story until you measure what was lost, not just what was gained. The practitioner's job is to measure both.

---

## Lesson 3D-4: The AI Process Application Evidence Map

**Estimated time:** 25 minutes
**Method:** Reading

---

Clients will ask: where should we use AI? The honest answer is not a vendor pitch. It is a tiered map of where the independent evidence supports AI process applications at SMB scale, and where it does not.

**Tier 1 — Reliable ROI, strong independent evidence:**

These are the AI process applications with the strongest independent (non-vendor-funded) evidence of genuine productivity improvement in real operational conditions, including at SMB scale:

*Document processing with human review.* AI reading, extracting from, and summarizing documents — contracts, invoices, intake forms, applications — with a human reviewer confirming outputs before action. The Brynjolfsson et al. research, the legal tech studies, and the financial services research all show genuine gains. The critical qualifier: with human review. Removing the human review from this category moves it toward Tier 3.

*Internal knowledge retrieval.* AI search over internal documentation — policies, past work product, client history, SOPs. Reduces time spent looking for information; improves consistency of answers to internal questions. Works well when the knowledge base is reasonably well-organized; works poorly when it is a chaotic accumulation of undifferentiated files.

*Customer support drafting.* AI drafting responses to customer inquiries for human review and editing before sending. The agent-assisted model — human sends, AI drafts — has reliable evidence. The autonomous model — AI sends without human review — does not have reliable evidence at quality levels appropriate for most SMB client relationships.

*Code generation for technical staff.* GitHub Copilot studies consistently show meaningful productivity gains for developers. Requires technical staff who can evaluate output quality; the practitioner who recommends this to a non-technical SMB is misapplying the evidence.

*Meeting summarization.* Works well in firms with disciplined meeting practice — regular meeting structures, consistent participants, clear agendas. Works poorly in firms with ad hoc meeting cultures, because the AI cannot distinguish a decision from a discussion or a commitment from a thought.

**Tier 2 — Conditional ROI, specific preconditions required:**

*Predictive analytics.* AI-based forecasting and prediction works when the underlying data is clean, consistent, and substantial. Most SMBs do not meet the data quality bar. Deploying predictive analytics on 18 months of inconsistently categorized data will produce predictions that are worse than the owner's intuition.

*Lead scoring.* Requires CRM discipline and sufficient lead volume for the model to be meaningful. Firms with fewer than a few hundred leads in their pipeline, or with inconsistently logged CRM data, will not benefit.

*AI-driven scheduling optimization.* Works in firms with stable enough demand patterns and sufficient booking volume. Not useful for firms with highly variable, project-based demand.

**Tier 3 — Frequently oversold, consistently underperform at SMB scale:**

*Fully autonomous customer service.* AI handling customer inquiries end-to-end without human review. The evidence for satisfaction-neutral performance at SMB relationship quality levels is weak. The Klarna reversal is the most public example, but the pattern is consistent across the research on AI customer service autonomous deployment.

*Multi-agent orchestration.* Multiple AI agents working together on complex tasks — research, analysis, action. Gartner projects that over 40% of agentic AI projects will be cancelled by end of 2027. At SMB scale, without dedicated technical resources to maintain and debug multi-agent systems, the implementation and maintenance cost typically exceeds the value.

*AI-generated content at scale.* Large-volume AI content generation without significant human editorial input. Quality is inconsistent; the content tends toward the generic; and the detection and brand-reputation risks are real for client-facing firms.

*Broad "AI transformation" platforms.* Vendor offerings that promise comprehensive AI transformation of the business. The evidence that any single platform delivers transformation at SMB scale is essentially absent. These tend to deliver a subset of Tier 1 capabilities at significant cost and complexity.

**How to use the evidence map:**

When a client is considering an AI tool or application, the practitioner's first question is: which tier does this fall into? The second question is: what are the preconditions for success, and does this firm meet them? The third question: what are the brittleness risks? The evidence map does not answer these questions definitively — it frames the conversation with the client and ensures that the decision is made with an accurate understanding of what the independent research supports.

**Key takeaway:** The practitioner who can state this map clearly, and back it up with specific evidence, is providing immediate value by protecting clients from expensive experiments that the evidence does not support.

---

**Discussion prompt:** A client is enthusiastic about implementing a multi-agent AI system that would handle research, analysis, and first-draft report writing for their consulting engagements. The vendor has shown them impressive demos. Based on the evidence map, what would you say?

**AI assistant prompt:** Ask the curriculum assistant: "What does the most recent independent research show about AI customer service satisfaction outcomes — specifically, are there contexts where fully autonomous AI customer service performs at parity with human service, and what are the conditions?"

---

**Module 3D Assessment**

**Type:** Brittleness audit + automation assessment

**Prompt:** A client tells you: "We've automated our entire invoice processing workflow with AI — it's saving us 20 hours a week."

*(a)* Write the five brittleness audit questions you would ask, in the order you would ask them. For each question, explain what it is specifically designed to surface and why that matters for this particular process.

*(b)* The client also tells you they are considering implementing an AI chatbot to handle all first-contact customer inquiries autonomously — no human review before the AI responds. Based on the evidence map, what tier does this application fall into? What are the conditions under which it might succeed? What would you say to the client about it?

*(c)* Using the so-so automation framework: what evidence would you look for over the next 30 days to determine whether the invoice processing automation is genuinely improving outcomes or producing so-so results?

**What it measures:** Brittleness audit rigor; evidence map application; so-so automation diagnostic thinking; honest, evidence-grounded client communication about AI investment.

---

## Domain 3 Capstone Reflection

**Prompt:** Write 250–400 words responding to the following:

A client tells you at the end of the process audit phase: "This has been really useful. Now I get why you wanted to look at all of this before the tech recommendations. But honestly, I'm surprised — I thought we were more organized than this. The process trace on the client onboarding was a real wake-up call."

The findings you are about to present include: three of the seven failure modes clearly present (founder bottleneck, process opacity, tool sprawl), a brittleness risk in two automated processes they are already running, and a proposed AI application they mentioned in the first conversation that falls in Tier 3 of the evidence map.

How do you present these findings? What do you lead with? What do you not lead with? And what is the one thing you want the client to understand about why the process layer had to come before the technology recommendations?

---

*WST Practitioner Curriculum — Domain 3: Processes*
*Complete Lesson Content — All Four Modules*
*World Shift Technologies / Drew Griffiths — May 2026*
*Cross-reference: WST_Curriculum_Domain3_Processes.md · WST_Curriculum_Module_Outlines.md · WST_Audit_Methodology.md · WST_Practitioner_Curriculum_Research_Foundations.md*

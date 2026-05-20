/**
 * WST Practitioner Curriculum — Database Seed Script
 * /scripts/seed-curriculum.ts
 *
 * Run: npx ts-node scripts/seed-curriculum.ts
 *
 * Wipes existing curriculum rows, then inserts in FK order:
 *   curriculum_domains → curriculum_modules → curriculum_lessons → curriculum_assessments
 *
 * Domain 6 lessons: full body content from WST_Curriculum_Domain6_Lessons.md
 * Domains 1–5 lessons: lesson descriptions from module outlines used as core_content placeholders.
 *
 * Env vars required:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

interface DomainSeed {
  number: number;
  title: string;
  subtitle: string;
  overview_text: string;
  estimated_hours: string;
  prerequisites: string;
  practitioner_note: string;
}

interface ModuleSeed {
  domain_number: number;
  module_number: string;
  title: string;
  estimated_time: string;
  learning_objectives: string[];
  key_sources: string[];
  connections: { before: string; after: string; feeds: string };
}

interface LessonSeed {
  module_number: string;
  lesson_number: string;
  title: string;
  estimated_time: string;
  teaching_method: string;
  core_content: string;
  reflection_prompt: string | null;
  ai_prompt_suggestions: string[];
  key_takeaway: string | null;
  sort_order: number;
}

interface AssessmentSeed {
  module_number: string;
  assessment_type: string;
  prompt: string;
  what_it_measures: string;
  is_capstone: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// DOMAINS
// ─────────────────────────────────────────────────────────────────────────────

const DOMAINS: DomainSeed[] = [
  {
    number: 1,
    title: "Foundations: The State of Work in 2026",
    subtitle: "The accurate, evidenced, operational reality of AI and SMBs",
    overview_text: `Before a practitioner touches a client, they need to hold an accurate picture of the moment they are walking into. Not the vendor narrative. Not the panic narrative. The actual, evidenced, operational reality of what is happening to small businesses in 2026 as AI accelerates and workplace culture fractures under uncertainty.

This domain does three things. It grounds the practitioner in what is measurably true. It trains them to distinguish data from projection and projection from hype. And it gives them the internal orientation — the stance — that everything else in this curriculum builds on.

A practitioner who skips this domain will misread clients. They will mistake anxiety for resistance. They will recommend change to teams who are not safe enough to receive it. They will cite vendor statistics that collapse under scrutiny.

The domain covers the actual adoption picture — what independent data says about how SMBs are using AI versus how they are described as using it — the productivity reality, who is thriving and why, the worker's experience of AI-driven disruption, and the shadow AI problem reframed as a diagnostic rather than a compliance issue.

By the end of Domain 1, the practitioner can articulate the accurate, evidence-based state of AI adoption in SMBs, distinguish task-level productivity gains from firm-level productivity gains, run a 15-minute first-contact diagnostic using the nine thriving and struggling SMB markers, recognize the co-presence of anxiety and adoption in the teams they will work with, identify shadow AI use as a diagnostic category, and cite the difference between measured and projected findings.`,
    estimated_hours: "4–6 hours",
    prerequisites: "None",
    practitioner_note: `The temptation in this domain is to become a skeptic — to walk into every SMB engagement armed with "well, actually, the data says AI productivity gains are overstated" and lead with deflation. That is not the stance this domain is building.

The stance is: accurate, curious, and grounded. Clients are not wrong to feel the pressure of this moment. The pressure is real. The task is to help them make good decisions inside it — which requires seeing it clearly, not reassuringly and not catastrophically.

If there is one sentence that summarizes what Domain 1 is trying to produce, it is this: a practitioner who can walk into an anxious room, hold the real complexity of the moment, and be the calmest, most accurate person in the conversation.`,
  },
  {
    number: 2,
    title: "People: Human Capacity, Team Culture, and Workforce Transition",
    subtitle: "The practitioner's non-negotiable commitment to people first",
    overview_text: `Domain 2 establishes the practitioner's non-negotiable commitment to people before process or technology. Every WST engagement begins with the human terrain — not the tool stack, not the org chart.

This domain builds four capabilities in sequence. The human capacity audit surfaces what every person actually contributes — the judgment, the relationships, the institutional memory — that would leave with them if they left tomorrow. The psychological safety layer establishes what team conditions either allow or prevent honest discovery work. The workforce transition module builds the specific skill of navigating role redesign and displacement with rigor and care. And the people audit in practice integrates all three into a coherent first-phase engagement discipline.

The founding principle of this domain — and of the WST practice — is this: every person inside a business contributes something AI and automation cannot replicate. The company that cannot find a way to elevate that contribution has failed to predict and help with the future. That is a failure of organizational imagination, not an inevitability.

This principle is not sentimental. It is operationalized through the human capacity audit, the strengths-and-crafting conversation, the task decomposition methodology, and the responsible-restructuring evidence. By the end of Domain 2, the practitioner has tools, not just commitments.`,
    estimated_hours: "8–10 hours",
    prerequisites: "Domain 1",
    practitioner_note: `The most common error in people work is moving too fast. The practitioner who arrives with a human capacity framework and a worksheet has something useful — and something that can also become a way of not actually listening. The tool is a scaffold for attention, not a substitute for it.

The practitioner who leaves Domain 2 ready to run the people audit has internalized two things: the specific tools for surfacing human capacity, safety, and transition risk; and the discipline of slowing down enough to actually see the people in front of them before designing anything. Both matter. Neither works without the other.`,
  },
  {
    number: 3,
    title: "Processes: How Work Flows, Where It Breaks, and How to Fix It Precisely",
    subtitle: "See operational reality clearly. Most SMB problems are process visibility problems.",
    overview_text: `Domain 3 teaches the practitioner to see operational reality clearly. Most SMB problems are not technology problems — they are process visibility problems. The firm that cannot describe how work actually happens cannot improve it, automate it well, or hand it off reliably.

The domain begins with the most important distinction in process work: work as imagined versus work as done. The gap between what the SOP says and what actually happens is not a failure of discipline — it is universal, and it is where the real breakdowns are. Learning to access work-as-done rather than accepting work-as-imagined is the foundational skill of the process audit.

Module 3B maps the seven documented SMB operational failure modes: cash conversion failure, founder bottleneck, process opacity, tool sprawl and data fragmentation, quality drift, decision latency, and customer concentration. Module 3C builds the lean, right-sized systems design response. Module 3D focuses specifically on designing processes that survive AI disruption — including the brittleness audit, the so-so automation framework, and the evidence map for what AI process applications actually work at SMB scale.

By the end of Domain 3, the practitioner can conduct a process trace, map the seven failure modes in a client engagement, design right-sized process documentation, run a brittleness audit on any automated process, and produce the process-layer summary that feeds the Domain 5 synthesis.`,
    estimated_hours: "6–8 hours",
    prerequisites: "Domain 2",
    practitioner_note: `The failure mode to watch for in process work is the consultant who produces process documentation the client never uses. A 47-page SOP manual that lives on a shared drive is not a deliverable — it is a liability. The one-page runbook that a new hire can follow is a deliverable.

The lean philosophy this domain teaches is not about minimalism for its own sake. It is about right-sizing the system to the actual firm: its size, its culture, its complexity, and what it can realistically maintain without a consultant standing over it. The practitioner who produces the smallest system that reliably works has done the best work. That requires more judgment than producing the most comprehensive system — and it produces more value.`,
  },
  {
    number: 4,
    title: "Technology: AI in the SMB, Its Actual Harms, and How to Audit a Stack",
    subtitle: "Neither the oversell nor the dismissal position — the evidence-based middle",
    overview_text: `Technology is where clients most want answers and where the most misleading advice is currently being given. Domain 4 teaches the practitioner to occupy neither the oversell nor the dismissal position — to understand what AI actually does for SMBs, what it costs, and how to audit a technology stack with rigor.

Module 4A builds the evidence-based map of AI applications: what has strong independent evidence of ROI at SMB scale, what has conditional ROI requiring specific preconditions, and what is consistently oversold. Module 4B surfaces the documented harms — displacement, deskilling, and vendor dependency — and establishes the epistemic-advantage principle: the practitioner who knows these harms and does not surface them has failed their client. Module 4C addresses data risk, regulatory exposure, and AI tool chaos. Module 4D builds the seven-step technology audit.

The practitioner who completes Domain 4 can state the evidence map and back it up, conduct a brittleness audit on any AI-automated process, identify the primary data risks in a client's BYOAI behavior, brief a client on their regulatory exposure in plain language, and produce a complete technology-layer summary as input to the Domain 5 synthesis.

Domain 4 is deliberately placed after Domain 2 and Domain 3. Technology recommendations made without the prior people and process audits are incomplete by design. The tool stack must be understood in the context of the people who use it and the processes it is embedded in.`,
    estimated_hours: "8–10 hours",
    prerequisites: "Domains 1–3",
    practitioner_note: `The practitioner who finishes Domain 4 is now equipped with something genuinely uncommon in the current market: an honest, evidence-grounded view of what AI does and does not do for small businesses, held without either vendor enthusiasm or reflexive skepticism. That is a scarce capability in 2026, and it is the foundation of the practitioner's credibility with clients who are tired of being sold to.

Use it carefully. The client who is already anxious does not need a recitation of every documented harm. They need the specific evidence that applies to their specific situation, delivered in a way that helps them make a better decision. The goal is always the better decision — not the most thorough disclosure.`,
  },
  {
    number: 5,
    title: "Methodology: The WST Audit Framework in Practice",
    subtitle: "Where everything comes together into a coherent engagement practice",
    overview_text: `Domain 5 is where everything comes together. The people audit, the process audit, and the technology audit are integrated into a coherent engagement methodology grounded in Theory U.

Module 5A establishes the WST Audit Framework — its three phases (co-sensing, presencing, co-creating/co-evolving), Theory U as the methodological backbone, and the logic of the people-before-processes-before-technology sequence. Module 5B operationalizes the co-sensing phase: immersive discovery, interview design, triangulation across hierarchy, and the inner-state discipline that determines what becomes visible. Module 5C covers presencing — the synthesis moment where the practitioner finds the essential pattern, not the list of findings. Module 5D builds the co-creating phase: co-design session structure, prototyping discipline, and testing inside the engagement. Module 5E closes with co-evolving: capability transfer, internal owner preparation, measurement system design, and the leaving-well discipline.

The central commitment of this domain — and of the WST practice — is that the deliverable is not a report. It is a co-created system the client helped build, with a measurement system, an internal owner, and a clean exit. Shelf-ware consulting — delivering documentation that does not change anything — is named here as a failure mode, not a variant.

Five modules. Approximately 10–12 hours. The capstone simulation in Domain 6 is where the practitioner runs the full framework end-to-end.`,
    estimated_hours: "10–12 hours",
    prerequisites: "Domains 1–4",
    practitioner_note: `The hardest part of Domain 5 is the presencing phase — not because the concept is difficult, but because it requires the practitioner to tolerate uncertainty long enough to find what is actually there. The temptation is to stay in discovery mode, adding more data rather than synthesizing what you have. Or to move directly from data to recommendation, skipping the synthesis entirely. Both are avoidance.

The practitioner who learns to sit with the data until the pattern emerges — who can hold the three audit-layer summaries and find the underlying driver rather than listing the symptoms — is doing the hardest and most valuable work in the engagement. That capacity is what separates a methodology from a checklist.`,
  },
  {
    number: 6,
    title: "Ethics: Ethical Practice, Practitioner Formation, and the Consulting Business",
    subtitle: "The integration and accountability layer for the entire curriculum",
    overview_text: `Domain 6 is not the ethics chapter tacked onto the end of a curriculum that otherwise avoided the question. Every domain before this one was already doing ethics work — in how it framed the data, in what it required you to notice about people, in what it refused to let you elide about harm. Domain 6 names that work explicitly, builds the habits and frameworks that make it operational, and asks you to run a complete engagement simulation that puts everything to the test at once.

The four modules in this domain are not sequential in the traditional sense. Module 6A — the Riverstone Operations simulation — runs across the entire domain. Modules 6B, 6C, and 6D are standalone lessons that run alongside it, each adding a layer of understanding you can apply within the ongoing simulation.

Module 6A is the capstone simulation: a complete fictional engagement with Riverstone Operations, a 22-person project management firm, run across six structured sessions from first contact through handoff. Module 6B builds the ten-point ethical framework and applies it to three documented teaching cases and the hard calls every practitioner will face. Module 6C addresses the business of practice — positioning, pricing, and client selection as ethical decisions, not just commercial ones. Module 6D closes with practitioner formation: the habits of reflective practice, peer supervision, and the question the practitioner carries for the rest of their working life.

By the time you finish this domain, you should be able to say three things honestly: what you are prepared to do, what you are not yet equipped for, and what you are committed to. Those three things together constitute a practitioner identity. Building one is what this domain is for.`,
    estimated_hours: "8–10 hours plus 10–12 hours capstone simulation",
    prerequisites: "Domains 1–5",
    practitioner_note: `The last thing this curriculum wants to produce is a practitioner who has memorized the ethics.

Ethics memorized is ethics performed. It shows up in the right language, the appropriate disclaimers, the demonstrated fluency with concepts. And then, when there is a real choice to make — when the client is pushing back and the engagement is at risk and the easy path is available — it evaporates, because it was never actually there.

What this domain is trying to produce is a practitioner who has internalized a set of commitments deeply enough that they show up automatically — in how the practitioner listens, in what they surface without being asked, in what they refuse to do even when the client would prefer they did not, and in how they treat every person they encounter inside an engagement as a person whose interests matter.

That is a lifelong practice. This curriculum is a beginning of it.

The WST practitioner who completes this curriculum is not certified as competent. They are prepared to begin doing competent work — and they know the difference. That distinction is itself an ethical stance. It is, in fact, the most important thing this domain teaches.`,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// MODULES
// ─────────────────────────────────────────────────────────────────────────────

const MODULES: ModuleSeed[] = [
  // ── DOMAIN 1 ──────────────────────────────────────────────────────────────
  {
    domain_number: 1,
    module_number: "1A",
    title: "What Is Actually Happening: The Data Layer",
    estimated_time: "1.5 hours",
    learning_objectives: [
      "Cite the actual independent data on AI adoption in SMBs — U.S. Census BTOS figures, Stanford Digital Economy Lab findings, MIT NANDA results — without relying on vendor or media sources.",
      "Explain the difference between shadow adoption (individual, unsanctioned AI use) and strategic adoption (deliberate, firm-level decision-making about AI), and identify which mode most SMBs are actually in.",
      "Articulate the productivity paradox: why AI reliably raises task-level productivity in controlled settings but unreliably raises firm-level productivity in real SMB conditions, and why the gap is organizational rather than technical.",
      "Distinguish a measured finding from a projected finding in the AI-and-work literature, and apply that distinction when reading any new study.",
    ],
    key_sources: [
      "U.S. Census Bureau — Business Trends and Outlook Survey (BTOS), 2024–2025 waves",
      "Brynjolfsson, Chandar et al. — Stanford Digital Economy Lab ADP payroll analysis, 2025",
      "Challapally, Zhao et al. — MIT NANDA 'GenAI Divide: State of AI in Business 2025'",
      "Noy & Zhang — 'Experimental Evidence on the Productivity Effects of Generative Artificial Intelligence,' Science, 2023",
      "Microsoft/LinkedIn — Work Trend Index 2024–2025",
    ],
    connections: {
      before: "None — this is the curriculum entry point.",
      after: "Module 1B builds on the adoption picture by asking who is thriving and who is struggling within it.",
      feeds: "The shadow-adoption framing feeds directly into Domain 4's technology audit (Module 4C). The productivity-paradox framing is the organizational problem that Domain 3 (Processes) and Domain 5 (Methodology) exist to close. The data-literacy habit built here is assumed in every subsequent module.",
    },
  },
  {
    domain_number: 1,
    module_number: "1B",
    title: "Who Is Thriving, Who Is Struggling, and Why",
    estimated_time: "1.5 hours",
    learning_objectives: [
      "Name and operationalize the five characteristics consistently present in SMBs that are navigating AI disruption well.",
      "Name and operationalize the four characteristics consistently present in SMBs that are struggling.",
      "Apply these nine markers as a 15-minute first-contact diagnostic in a real or simulated first conversation.",
      "Identify the most common misread — treating AI tool adoption as a proxy for strategic readiness — and articulate why it is a misread.",
    ],
    key_sources: [
      "MIT NANDA — 'GenAI Divide: State of AI in Business 2025'",
      "McKinsey & Company — State of AI 2025",
      "Goldman Sachs — SMB AI Pulse Surveys, 2024–2025",
      "U.S. Census BTOS — adoption concentration data by firm size and sector",
      "Brynjolfsson & McAfee — The Second Machine Age, for the thriving-conditions framework",
    ],
    connections: {
      before: "Module 1A established what the data says about AI adoption broadly. This module asks who within that picture is doing well and why.",
      after: "Module 1C shifts from the firm level to the human level — how workers are experiencing this moment.",
      feeds: "The thriving/struggling markers are the first layer of the WST first-contact diagnostic used in Domain 5 (Methodology, Module 5B). They also frame the people-layer questions in Domain 2.",
    },
  },
  {
    domain_number: 1,
    module_number: "1C",
    title: "The Worker's Experience",
    estimated_time: "1.25 hours",
    learning_objectives: [
      "Describe the co-presence of AI adoption and AI anxiety — what researchers call 'anxious pragmatism' — and explain why this combination creates conditions in which workers underreport both AI use and AI fears.",
      "Explain the neuroscience of threat response (SCARF model, HPA-axis stress, cognitive load under perceived job threat) in plain language, and connect it to the practical challenge of getting honest information from a team.",
      "Apply the Gallup engagement decline data and APA Work in America findings as orientation tools — understanding the human climate a practitioner walks into.",
      "Recognize the BYOAI (bring-your-own-AI) phenomenon as a diagnostic signal, not a compliance problem.",
    ],
    key_sources: [
      "APA — Work in America Survey, 2023–2025",
      "Gallup — State of the Global Workplace, 2025",
      "Microsoft/LinkedIn — Work Trend Index 2024–2025 (BYOAI data)",
      "Rock, D. — 'Managing With the Brain in Mind,' Strategy+Business, 2009 (SCARF model — used as vocabulary, validity contested in academic psychometrics)",
      "Sapolsky, R. — Why Zebras Don't Get Ulcers (HPA-axis stress — foundational, non-contested)",
    ],
    connections: {
      before: "Modules 1A and 1B established what is happening at the firm level. This module shifts to what is happening inside the people inside those firms.",
      after: "Module 1D closes Domain 1 by training the practitioner to read macro projections honestly.",
      feeds: "The threat-response understanding here is the direct reason Domain 2 begins with psychological safety before touching AI at all. The BYOAI signal feeds Domain 4's technology audit (Module 4C). The practitioner-posture reflection is the beginning of the work Domain 6 (Practitioner Formation, Module 6D) returns to at the end of the curriculum.",
    },
  },
  {
    domain_number: 1,
    module_number: "1D",
    title: "Reading Projections Honestly",
    estimated_time: "1.0 hour",
    learning_objectives: [
      "Distinguish the methodological basis of major AI-and-work projections (WEF Future of Jobs, McKinsey productivity scenarios, Goldman Sachs job displacement estimates) from measured data, and explain why projections are not predictions.",
      "Apply the Acemoglu-Restrepo 'so-so automation' counter-argument to temper common productivity optimism claims.",
      "Hold and communicate genuine uncertainty about AI's long-run effects without either catastrophizing or dismissing — modeling the stance clients need but cannot currently access.",
      "Translate this framework into usable language for a client who is scared of being left behind.",
    ],
    key_sources: [
      "WEF — Future of Jobs Report 2025",
      "McKinsey Global Institute — productivity scenario analyses, 2023–2025",
      "Acemoglu & Restrepo — 'So-So Automations' working paper, MIT, 2024",
      "Goldman Sachs — 'The Potentially Large Effects of Artificial Intelligence on Economic Growth,' 2023",
      "Brynjolfsson, E. — writings on the productivity J-curve and the implementation lag",
    ],
    connections: {
      before: "Modules 1A–1C built the empirical and human foundation. This module trains the practitioner to hold the uncertain macro-level picture without distortion in either direction.",
      after: "Domain 2 (People) begins.",
      feeds: "The 'so-so automation' concept is the intellectual foundation for Domain 3's brittleness audit (Module 3D) and Domain 4's technology harms coverage (Module 4B). The practitioner's ability to communicate uncertainty honestly is an ethical commitment formalized in Domain 6 (Module 6B).",
    },
  },
  // ── DOMAIN 2 ──────────────────────────────────────────────────────────────
  {
    domain_number: 2,
    module_number: "2A",
    title: "Human Capacity and Strengths-Based Work Design",
    estimated_time: "2.5 hours",
    learning_objectives: [
      "Conduct a human capacity audit — surfacing not just what a person's job description says but what they actually do, what institutional knowledge they carry, and what the organization would lose if they left tomorrow.",
      "Run a strengths-and-crafting conversation with an individual employee that produces real insight about what role design would make them most effective and most engaged.",
      "Apply job crafting theory (Wrzesniewski & Dutton) to redesign a role around what a person does well and finds meaningful, rather than starting from a blank job description.",
      "Distinguish the evidence-based tools (CliftonStrengths, job crafting) from their validity limits, and apply them as conversation-starters rather than final verdicts.",
    ],
    key_sources: [
      "Wrzesniewski & Dutton — 'Crafting a Job: Revisioning Employees as Active Crafters of Their Work,' Academy of Management Review, 2001",
      "Harter, Schmidt & Hayes — Gallup strengths meta-analysis (engagement and performance outcomes)",
      "Davenport, T. — Thinking for a Living: How to Get Better Performance and Results from Knowledge Workers, 2005",
      "Polanyi, M. — The Tacit Dimension, 1966 (foundational on tacit knowledge)",
      "MIT Work of the Future Initiative — task decomposition methodology and evidence base",
    ],
    connections: {
      before: "Domain 1 established that workers are experiencing anxiety and adopting AI simultaneously. This module begins the practitioner's work inside that reality.",
      after: "Module 2B builds the psychological safety layer — the team conditions that either allow or prevent this kind of honest human capacity work.",
      feeds: "The human capacity audit worksheet is used in Domain 5's co-sensing phase (Module 5B). The role redesign methodology is the foundation of Module 2C's workforce transition work. The human capacity lens informs the process audit in Domain 3, because processes often live in people rather than documents.",
    },
  },
  {
    domain_number: 2,
    module_number: "2B",
    title: "Team Culture, Psychological Safety, and Trust",
    estimated_time: "2.0 hours",
    learning_objectives: [
      "Directly assess psychological safety using Edmondson's research-based framework — not assumption, not guesswork — and read it against the firm's actual disclosure climate around AI use.",
      "Identify the safety paradox: leaders requesting honest feedback while running undisclosed workforce planning, and articulate how to address it with a client before it collapses trust inside the engagement.",
      "Apply five high-leverage practices for building psychological safety during AI disruption.",
      "Recognize the SMB-specific pattern: the firm is small enough that loss of one person's trust can reshape the entire team's willingness to engage honestly.",
    ],
    key_sources: [
      "Edmondson, A. — The Fearless Organization, 2018; 7-item diagnostic scale; meta-analytic evidence",
      "Edmondson & Mortensen — extensions to AI-context team safety, 2024–2025 working papers",
      "Brockner, J. — research on survivor syndrome and layoff effects on remaining employees",
      "Weick & Sutcliffe — Managing the Unexpected (sensemaking in high-uncertainty environments)",
      "Google Project Aristotle — psychological safety as primary team performance predictor, 2016",
    ],
    connections: {
      before: "Module 2A built the human capacity audit. You cannot conduct that audit honestly in a team with collapsed safety — this module explains why and what to do about it.",
      after: "Module 2C — the most ethically weighted module in the curriculum — assumes this safety work has been done. Workforce transition conversations conducted in a low-safety environment are dangerous.",
      feeds: "The safety diagnostic is used in the WST Audit Methodology, Section B3. The safety paradox concept is revisited in Domain 6 (Ethics, Module 6B) as an informed-consent issue.",
    },
  },
  {
    domain_number: 2,
    module_number: "2C",
    title: "Workforce Transition: The Hard Skill and the Ethical Practice",
    estimated_time: "2.5 hours",
    learning_objectives: [
      "Apply the task decomposition → strengths anchoring → crafting latitude → internal mobility sequence to a real role redesign problem involving AI-driven task displacement.",
      "Walk a client through the responsible-restructuring evidence — Sucher, Cascio, and the survivor syndrome research — before any workforce reduction is proposed, as a routine professional practice, not a lecture.",
      "Navigate the hard case: where, after genuine effort, redesign is not possible — and handle it without colluding in misrepresentation, without abandoning the engagement, and without treating the person as a liability.",
      "Recognize the non-replacement pattern (quietly not backfilling attrition) and name it accurately with a client.",
    ],
    key_sources: [
      "Sucher, S. — The Power of Trust, 2021; HBS case work on workforce reduction and trust",
      "Cascio, W. — Responsible Restructuring, multiple editions through 2023",
      "Brockner, J. — survivor syndrome and layoff effects on remaining employees",
      "MIT Work of the Future Initiative — task decomposition methodology",
      "WST_Domain2C_Human_Continuity_Framework.md — full practitioner framework for this module",
    ],
    connections: {
      before: "Module 2B established the psychological safety foundation. Workforce transition conversations conducted without that foundation are dangerous.",
      after: "Module 2D integrates everything in Domain 2 into a coherent first-phase engagement practice.",
      feeds: "The responsible-restructuring evidence is used in Domain 6 (Ethics, Module 6B) as a case study in the practitioner's obligation to inform clients fully before consequential decisions. The task decomposition methodology is used in Domain 4 to assess which AI applications are genuinely suitable for a given firm.",
    },
  },
  {
    domain_number: 2,
    module_number: "2D",
    title: "The People Audit in Practice",
    estimated_time: "2.0 hours",
    learning_objectives: [
      "Integrate the human capacity audit (2A), psychological safety assessment (2B), and workforce transition framework (2C) into a coherent first-phase engagement practice.",
      "Triangulate information across hierarchical levels — what the owner says, what the manager says, what the front-line staff says — and identify the gaps as the most important data in the room.",
      "Read what is not said: the topics people consistently avoid, the questions that produce deflection, the moments where body language and stated content diverge.",
      "Produce a people-layer summary that informs the process and technology audits without reducing the people to data points.",
    ],
    key_sources: [
      "Schein, E. — Humble Inquiry, 2013 (the practitioner stance and conversational technique)",
      "Hollnagel, E. — 'work as imagined / work as done' (the triangulation principle applied to process; relevant here as people reveal process)",
      "WST Audit Methodology — Section B (the people audit worksheet and assessment protocol)",
      "Edmondson — psychological safety diagnostic integration",
      "Weick, K. — sensemaking and organizational interpretation",
    ],
    connections: {
      before: "Modules 2A–2C built the three component capabilities. This module integrates them into field practice.",
      after: "Domain 3 (Processes) begins — and the people-layer summary produced here is a direct input to the process audit.",
      feeds: "The integration skills here are what Domain 5 (Methodology) draws on during the co-sensing phase. The triangulation discipline is named explicitly in Module 5B as a core discovery competency.",
    },
  },
  // ── DOMAIN 3 ──────────────────────────────────────────────────────────────
  {
    domain_number: 3,
    module_number: "3A",
    title: "How Work Actually Flows: Mapping and Auditing Operations",
    estimated_time: "2.0 hours",
    learning_objectives: [
      "Distinguish 'work as imagined' (what the SOP says, what the owner describes) from 'work as done' (what actually happens), and explain why the gap between the two is where the real breakdowns are.",
      "Conduct a process trace — following a single transaction or customer through an organization end to end — as the most reliable method for surfacing real breakpoints.",
      "Produce a right-sized process map (one-page swimlane or documented runbook) appropriate for a 10–50-person firm, not borrowed from enterprise consulting.",
      "Recognize the founder bottleneck as simultaneously a people problem and a process problem, and address both dimensions.",
    ],
    key_sources: [
      "Hollnagel, E. — 'work as imagined / work as done,' resilience engineering and FRAM (Functional Resonance Analysis Method)",
      "Weick, K. & Sutcliffe, K. — Managing the Unexpected, sensemaking in organizations",
      "Gerber, M. — The E-Myth Revisited (descriptively accurate on founder bottleneck; not academically rigorous — use as illustration, not citation)",
      "MIT Sloan and Stanford GSB — SMB case work on process opacity and bottleneck failure",
      "Birkinshaw & Ridderstråle — 'minimum viable bureaucracy' concept",
    ],
    connections: {
      before: "Domain 2 established that processes often live in people. The people audit surfaces what would break if a key person left — the process audit surfaces what is already breaking because it was never documented.",
      after: "Module 3B maps the seven documented failure modes that explain why these process problems develop and persist.",
      feeds: "The process trace methodology is used in Domain 5's co-sensing phase (Module 5B) as the operational observation discipline. The founder-bottleneck concept links back to Module 2D's triangulation across hierarchy (the founder's account is the most likely to diverge from work-as-done).",
    },
  },
  {
    domain_number: 3,
    module_number: "3B",
    title: "SMB Operational Failure Patterns",
    estimated_time: "1.75 hours",
    learning_objectives: [
      "Name and describe the seven documented SMB operational failure modes and identify which are present in a client firm within the first engagement conversation.",
      "Explain why each failure mode develops and persists — not as a criticism of the owner or team, but as a structural analysis of how small businesses grow.",
      "Recognize the early warning signals for each failure mode before the failure is acute.",
      "Apply this taxonomy as a first-pass diagnostic that identifies where to focus the process audit.",
    ],
    key_sources: [
      "JPMorgan Chase Institute — Small Business Cash Flow research series, 2016–2024",
      "Federal Reserve — Small Business Credit Survey, annual through 2024",
      "CB Insights — 'Top Reasons Startups Fail,' 2024 update",
      "Productiv, Vendr, BetterCloud — SaaS sprawl data in SMBs, 2023–2025",
      "U.S. Bureau of Labor Statistics — Business Employment Dynamics (failure rate data)",
    ],
    connections: {
      before: "Module 3A built the process-observation tools. This module gives them a taxonomy to work within.",
      after: "Module 3C builds the lean, right-sized systems design approach that addresses these failure modes.",
      feeds: "The tool-sprawl failure mode directly feeds Domain 4's technology audit (Module 4D). The cash-conversion failure feeds the financial-layer discussion in Domain 5's co-sensing phase. The customer-concentration failure is a risk-layer input for the overall engagement design.",
    },
  },
  {
    domain_number: 3,
    module_number: "3C",
    title: "Lean Methodology and Right-Sized Systems Design",
    estimated_time: "1.75 hours",
    learning_objectives: [
      "Apply lean philosophy at SMB scale — the smallest system that reliably produces the outcome — as a design principle, not a compliance exercise.",
      "Use Wardley Mapping as a lightweight tool for identifying which parts of an SMB's operation are commodity (automate or buy) versus custom (protect and invest).",
      "Identify when EOS/Traction and similar frameworks are genuinely useful for a client versus when they are overkill.",
      "Design a one-page operating infrastructure — the 10–15 core processes that constitute most of an SMB's operation — appropriate for a firm of 10–50 people.",
    ],
    key_sources: [
      "Ries, E. — The Lean Startup, 2011; Build-Measure-Learn applied to operational design",
      "Wardley, S. — Wardley Mapping framework, 2005 to present",
      "Wickman, G. — Traction / EOS framework (not academically validated — use as practitioner tool, not as citation)",
      "Birkinshaw, J. & Ridderstråle, J. — 'minimum viable bureaucracy,' London Business School",
      "Maurya, A. — Running Lean, 2012 (Lean Startup SMB extensions)",
    ],
    connections: {
      before: "Module 3B identified the failure modes. This module builds the design response.",
      after: "Module 3D focuses specifically on designing processes that survive AI disruption — the lean foundation built here is the prerequisite.",
      feeds: "The Wardley Mapping framework is used in Domain 4 (Module 4A) to assess which technology applications are commodity buys versus custom investments. The one-page runbook format is the deliverable template recommended in Domain 5's co-creating phase (Module 5D).",
    },
  },
  {
    domain_number: 3,
    module_number: "3D",
    title: "Designing Processes That Survive AI Disruption",
    estimated_time: "1.75 hours",
    learning_objectives: [
      "Conduct a brittleness audit on any automated process — identifying single points of failure, vendor dependency risks, and the human capacity gaps that over-automation creates.",
      "Apply the 'so-so automation' framework (Acemoglu & Restrepo) to distinguish automation that genuinely improves outcomes from automation that displaces work without meaningful gain.",
      "Design a process for graceful degradation — the ability to perform the process manually when the automated tool fails, changes pricing, or is deprecated.",
      "Apply the AI process application evidence map (Tier 1 / Tier 2 / Tier 3) when advising clients on where AI investment is and is not supported by independent evidence.",
    ],
    key_sources: [
      "Acemoglu, D. & Restrepo, P. — 'So-So Automations' working paper, MIT, 2024",
      "Hollnagel, E. — resilience engineering, graceful degradation",
      "Weick, K. & Sutcliffe, K. — high-reliability organizing and brittleness",
      "Gartner — AI Hype Cycle 2025; agentic AI project cancellation projection",
      "MIT NANDA — 'GenAI Divide' findings on AI application performance at firm level",
    ],
    connections: {
      before: "Module 3C built the lean systems design foundation. This module applies it specifically to AI-era conditions.",
      after: "Domain 4 (Technology) begins — the process layer is now complete, and the technology audit can be conducted with full process context.",
      feeds: "The brittleness audit is a direct input to Domain 4's technology audit (Module 4D). The so-so automation concept is revisited in Domain 6 (Ethics, Module 6B) as an ethical obligation: recommending automation that displaces work without improving outcomes is named as a practitioner failure.",
    },
  },
  // ── DOMAIN 4 ──────────────────────────────────────────────────────────────
  {
    domain_number: 4,
    module_number: "4A",
    title: "What AI Actually Does for SMBs: The Evidence-Based Map",
    estimated_time: "2.0 hours",
    learning_objectives: [
      "Describe the specific AI applications with strong independent evidence of ROI at SMB scale and the specific conditions under which that ROI is realized.",
      "Describe the applications with conditional ROI and name the preconditions.",
      "Name the categories of AI application that are consistently oversold and underperform at SMB scale, and explain why.",
      "Apply the Wardley Mapping lens (from Module 3C) to technology assessment: commodity buy vs. custom investment.",
    ],
    key_sources: [
      "MIT NANDA — 'GenAI Divide: State of AI in Business 2025'",
      "Gartner — AI Hype Cycle 2025; agentic AI project cancellation projection",
      "McKinsey — State of AI 2025 (with vendor-funding caveat — use for scale/trend context only)",
      "Stanford Digital Economy Lab — AI productivity evidence base",
      "Brynjolfsson, E. — task-level vs. firm-level productivity distinction (cited from Domain 1)",
    ],
    connections: {
      before: "Domain 3 provided the process layer. The question 'should we automate this?' can now be answered because the practitioner understands what the process actually is.",
      after: "Module 4B covers the documented harms — displacement, deskilling, and dependency — which must be surfaced before any deployment recommendation is made.",
      feeds: "The evidence map built here is the technology-layer input to the WST Audit Methodology (Domain 5). The precondition assessment feeds the technology audit in Module 4D.",
    },
  },
  {
    domain_number: 4,
    module_number: "4B",
    title: "The Documented Harms: Displacement, Deskilling, and Dependency",
    estimated_time: "2.0 hours",
    learning_objectives: [
      "Describe the documented evidence on AI-driven displacement in SMB-relevant roles and distinguish what is measured from what is projected.",
      "Explain the deskilling mechanism — how AI tool use can erode human capability over time — and identify where it is most likely to occur in the firms they work with.",
      "Describe vendor dependency as a documented organizational risk and name the specific forms it takes at SMB scale.",
      "Apply the epistemic-advantage principle: the party who knows more about the risks bears more responsibility for surfacing them. A practitioner who understands these harms and does not surface them has failed their client.",
    ],
    key_sources: [
      "Brynjolfsson, Chandar et al. — Stanford Digital Economy Lab ADP payroll analysis (entry-level compression)",
      "Autor, D. — middle-skill job erosion research; extensions to generative AI context",
      "Bainbridge, L. — 'Ironies of Automation' (automation complacency, foundational)",
      "Acemoglu & Restrepo — displacement without productivity gain",
      "NIST — AI Risk Management Framework 1.0 (2023); Generative AI Profile (2024)",
    ],
    connections: {
      before: "Module 4A established what AI can do well. This module establishes what it costs.",
      after: "Module 4C addresses data risk, regulatory exposure, and tool chaos — the governance layer.",
      feeds: "The epistemic-advantage principle is formalized in Domain 6 (Ethics, Module 6B) as the foundation of the practitioner's informed-consent obligation. The deskilling mechanism connects back to Domain 2's human capacity framework — capability is not just a people issue, it is also a technology design issue.",
    },
  },
  {
    domain_number: 4,
    module_number: "4C",
    title: "Data Risk, Regulatory Exposure, and AI Tool Chaos",
    estimated_time: "2.0 hours",
    learning_objectives: [
      "Identify the primary data risks created by BYOAI (bring-your-own-AI) behavior — specifically, what categories of data are being fed into external AI models without organizational awareness.",
      "Name the regulatory exposure that AI tool use creates for SMBs in specific sectors (healthcare, legal, financial services) and the general regulatory landscape as of 2026.",
      "Recognize 'AI tool chaos' — the unmanaged proliferation of AI tools across a firm — as a governance failure, not a technology failure, and describe a governance response.",
      "Produce a data-risk and regulatory-exposure brief appropriate for an SMB client.",
    ],
    key_sources: [
      "EU AI Act — in force August 2024; staged compliance through 2026–2027",
      "EEOC — iTutor Group settlement, 2023; AI hiring discrimination guidance",
      "NIST — AI Risk Management Framework 1.0, 2023; Generative AI Profile, 2024",
      "ISO/IEC 42001 — AI management systems standard, 2023",
      "Microsoft/LinkedIn — Work Trend Index 2024–2025 (BYOAI data and governance implications)",
    ],
    connections: {
      before: "Module 4B established the documented harms. This module adds the governance and regulatory layer to the risk picture.",
      after: "Module 4D — the seven-step technology audit — integrates everything from Modules 4A–4C into a structured audit practice.",
      feeds: "The AI governance framework design is used in Domain 5's co-creating phase (Module 5D) as a deliverable type. The data risk and regulatory exposure findings feed the ethical obligations described in Domain 6 (Module 6B).",
    },
  },
  {
    domain_number: 4,
    module_number: "4D",
    title: "The Technology Audit: Seven Steps to a Complete Stack View",
    estimated_time: "2.0 hours",
    learning_objectives: [
      "Conduct a seven-step technology audit that produces a complete, actionable view of an SMB's technology stack — including AI tools, shadow tools, integration gaps, and data flows.",
      "Classify every tool in the stack by purpose, integration status, and risk level.",
      "Produce a technology-layer summary that integrates with the people-layer summary (Module 2D) and the process-layer findings (Domain 3) into a coherent engagement picture.",
      "Present technology findings to a non-technical client in language that supports decision-making rather than confusion.",
    ],
    key_sources: [
      "WST Audit Methodology — Section D (Technology Audit worksheet)",
      "NIST AI RMF — risk classification framework",
      "Productiv, Vendr, BetterCloud — tool sprawl and shadow IT data (2024–2025)",
      "MIT NANDA — 'GenAI Divide' technology findings",
      "Gartner — AI Hype Cycle 2025",
    ],
    connections: {
      before: "Modules 4A–4C provided the evidence map, harms knowledge, and governance framework. This module applies all three in a structured audit practice.",
      after: "Domain 5 (Methodology) begins — the technology audit is the third of three audit layers (people, process, technology) that the methodology integrates.",
      feeds: "The technology-layer summary is a direct input to Domain 5's presencing and synthesis phase (Module 5C). The seven-step audit sequence is one of the methodology's co-sensing tools (Module 5B).",
    },
  },
  // ── DOMAIN 5 ──────────────────────────────────────────────────────────────
  {
    domain_number: 5,
    module_number: "5A",
    title: "The WST Audit Framework: Discovery, Diagnosis, Design",
    estimated_time: "2.0 hours",
    learning_objectives: [
      "Describe the WST Audit Framework's three phases — co-sensing (discovery), presencing (synthesis), and co-creating/co-evolving (design and handoff) — and explain the logic of the sequence.",
      "Situate Theory U (Scharmer) as the methodological backbone, with an honest account of its evidence base: rich qualitative evidence, thin quantitative evidence.",
      "Explain why the sequence people → processes → technology is non-negotiable and what goes wrong when it is reversed.",
      "Map the tools from Domains 2–4 onto the framework's phases — which audit tools belong where in the engagement arc.",
    ],
    key_sources: [
      "Scharmer, C.O. — Theory U: Leading from the Future as It Emerges, 2009; Presencing Institute research base",
      "Cooperrider & Whitney — Appreciative Inquiry foundational texts",
      "Snowden, D. — Cynefin framework",
      "IDEO — Design Thinking methodology",
      "Reason & Bradbury — Handbook of Action Research, 2nd ed.",
    ],
    connections: {
      before: "Domains 2–4 built the three audit layers. This module is where the practitioner learns how they fit together and in what order.",
      after: "Modules 5B–5E build out each phase of the framework in full operational detail.",
      feeds: "The framework described here is the spine of Domain 6's capstone simulation (Module 6A).",
    },
  },
  {
    domain_number: 5,
    module_number: "5B",
    title: "Running the Engagement: Immersive Discovery in Practice",
    estimated_time: "2.25 hours",
    learning_objectives: [
      "Design and execute a co-sensing engagement that goes to where the work actually happens — not just the conference room — and generates audit-quality data across all three layers.",
      "Conduct discovery interviews that produce honest information from people at all levels of an organization.",
      "Apply the triangulation discipline: cross-referencing what is said at different hierarchical levels to identify the gaps that are the most important data in the engagement.",
      "Manage the practitioner's own inner state during discovery — the open mind, open heart, open will that Theory U requires — and recognize when assumption and judgment are closing the listening.",
    ],
    key_sources: [
      "Scharmer — Theory U co-sensing practices; presencing.org case base",
      "Schein, E. — Humble Inquiry (listening and question design)",
      "Hollnagel — 'work as imagined / work as done' (immersive observation discipline)",
      "Weick — sensemaking and organizational interpretation",
      "WST Audit Methodology — Section A through D (the full co-sensing toolkit)",
    ],
    connections: {
      before: "Module 5A established the framework. This module operationalizes its discovery phase.",
      after: "Module 5C covers presencing — what happens after discovery, in the synthesis moment.",
      feeds: "The discovery practices here are directly assessed in the Domain 6 capstone simulation (Module 6A), which runs a full engagement end-to-end.",
    },
  },
  {
    domain_number: 5,
    module_number: "5C",
    title: "Presencing and the Synthesis Moment",
    estimated_time: "2.0 hours",
    learning_objectives: [
      "Describe the presencing phase — the movement from sensing to insight — and explain what makes it distinct from conventional data analysis.",
      "Apply synthesis practices: cross-domain pattern recognition, stakeholder map construction, the Cynefin domain-classification exercise.",
      "Recognize what a well-done synthesis produces versus a rushed one, and build the habits that make synthesis reliable rather than occasional.",
      "Produce a synthesis summary — the document that bridges discovery and co-creating — that names the pattern, not just the findings.",
    ],
    key_sources: [
      "Scharmer — Theory U, presencing practices",
      "Snowden, D. — Cynefin framework",
      "Weick — sensemaking and pattern recognition",
      "Cooperrider — Appreciative Inquiry (building on the existing positive core as part of synthesis)",
      "WST Audit Methodology — Section E (Synthesis and Presencing)",
    ],
    connections: {
      before: "Module 5B built the co-sensing capability. This module processes what the sensing produced.",
      after: "Module 5D moves into co-creating — using the synthesis as the foundation for joint design work.",
      feeds: "The synthesis summary produced here is the primary input to Module 5D's co-design session. The Cynefin classification determines the co-creating methodology (complicated → expert design; complex → prototyping and iteration).",
    },
  },
  {
    domain_number: 5,
    module_number: "5D",
    title: "Co-Creating: Prototyping and Joint Design",
    estimated_time: "2.0 hours",
    learning_objectives: [
      "Design and facilitate a co-design session with a client team that produces artifacts the client has contributed to and therefore understands and owns.",
      "Apply Design Thinking prototyping discipline to organizational change: small, fast, testable, consequential.",
      "Use the Cynefin classification (from Module 5C) to select the appropriate design approach — expert design for complicated challenges, prototyping for complex ones.",
      "Test a prototype during the engagement and integrate the client's response before finalizing the recommendation.",
    ],
    key_sources: [
      "IDEO — Design Thinking methodology; prototyping discipline",
      "Scharmer — Theory U co-creating practices",
      "Snowden — Cynefin (domain-appropriate design method selection)",
      "Ries — Build-Measure-Learn (applied to organizational change rather than product development)",
      "Cooperrider — Appreciative Inquiry (building the co-design on the existing positive core)",
    ],
    connections: {
      before: "Module 5C produced the synthesis and the co-creating hypothesis. This module acts on it.",
      after: "Module 5E covers co-evolving — the handoff and the long-tail of the engagement.",
      feeds: "The co-design artifacts produced here become the deliverables described in Domain 6's capstone simulation (Module 6A). The testing discipline connects to Domain 6's reflective practice (Module 6D).",
    },
  },
  {
    domain_number: 5,
    module_number: "5E",
    title: "Co-Evolving: Handoff and Continuity",
    estimated_time: "2.25 hours",
    learning_objectives: [
      "Design a capability transfer plan that leaves the client able to maintain, adapt, and extend the work after the engagement ends.",
      "Identify and prepare the internal owner — the person inside the client firm who will carry the work forward.",
      "Build a measurement system for the engagement: three to five metrics, defined in advance, tracking both financial and human outcomes.",
      "Design a 'leaving well' session that closes the engagement cleanly without creating dependency on the practitioner.",
    ],
    key_sources: [
      "Scharmer — Theory U co-evolving practices",
      "Maister, D. — Managing the Professional Service Firm (client relationship and exit)",
      "Prosci — ADKAR model (change management — capability transfer and adoption)",
      "Sucher — trust maintenance post-engagement",
      "WST Audit Methodology — Section F (Handoff and Co-Evolving)",
    ],
    connections: {
      before: "Module 5D built the co-creating capability. This module closes the engagement.",
      after: "Domain 6 begins — the ethics, business-of-practice, and practitioner-formation domain.",
      feeds: "The leaving-well discipline is the final deliverable of the Domain 6 capstone simulation (Module 6A). The measurement system design is revisited in Module 6C as part of the business-of-practice discussion about what a successful engagement looks like from the practitioner's perspective.",
    },
  },
  // ── DOMAIN 6 ──────────────────────────────────────────────────────────────
  {
    domain_number: 6,
    module_number: "6A",
    title: "The Simulated Full Audit: AI-Assistant-Supported Case",
    estimated_time: "3.0 hours (plus 10–12 hours capstone simulation across six sessions)",
    learning_objectives: [
      "Navigate a complete simulated SMB engagement from first contact through handoff, applying the full WST methodology across all three audit layers.",
      "Use the curriculum AI assistant (Claude) effectively as a research, synthesis, and stress-testing tool — while maintaining their own judgment as the governing intelligence in the engagement.",
      "Identify the ethical choice points within a simulated engagement and document their reasoning.",
      "Recognize the gap between knowing the methodology and being able to apply it — and name what they still need to develop.",
    ],
    key_sources: [
      "Scharmer — Theory U, full methodology",
      "WST Audit Methodology — complete reference document",
      "WST_Domain2C_Human_Continuity_Framework.md — practitioner reference for workforce transition",
      "All prior domain materials — the capstone draws on all six domains",
      "Anthropic Claude — AI assistant integrated into the curriculum platform",
    ],
    connections: {
      before: "All five prior domains. The capstone simulation requires the full toolkit.",
      after: "Modules 6B–6D continue alongside the simulation — each adds a layer (ethics frameworks, practice-building, reflective formation) that the practitioner can apply within the ongoing simulation.",
      feeds: "The capstone is the final assessment of the entire curriculum. Nothing follows it; it is the integration point.",
    },
  },
  {
    domain_number: 6,
    module_number: "6B",
    title: "Ethical Practice: Frameworks, Cases, and the Hard Calls",
    estimated_time: "2.5 hours",
    learning_objectives: [
      "Apply a ten-point ethical framework as an operating practice — not a poster — including the epistemic-advantage principle, the informed-consent standard, the non-harm obligation, and the transparency principle.",
      "Analyze documented cases of AI consulting failure to identify the ethical failure point and what the practitioner in those cases should have done differently.",
      "Navigate the specific hard calls: the client who wants to do something harmful, the finding that is true but unwelcome, the engagement where the practitioner's interests conflict with the client's.",
      "Distinguish performing ethics (using ethical language to manage a situation) from practicing ethics (making decisions that reflect genuine care for everyone affected).",
    ],
    key_sources: [
      "Sucher, S. — The Power of Trust (ethical failure and trust consequences)",
      "Cascio, W. — Responsible Restructuring (the evidence base for non-harm in workforce decisions)",
      "NIST — AI Risk Management Framework (systematic risk and ethics integration)",
      "BC Civil Resolution Tribunal — Air Canada chatbot ruling (liability precedent)",
      "ACM Code of Ethics; IMC USA Code; ICMCI professional standards",
    ],
    connections: {
      before: "Module 6A introduced the simulation. The Riverstone Operations scenario runs through this module.",
      after: "Module 6C shifts from ethical practice to the business of practice — positioning, pricing, client selection.",
      feeds: "The ten-point ethical framework is the lens through which Domain 6's capstone simulation is reviewed in the final practitioner statement.",
    },
  },
  {
    domain_number: 6,
    module_number: "6C",
    title: "Building the Practice: Positioning, Pricing, and Client Selection",
    estimated_time: "2.0 hours",
    learning_objectives: [
      "Position the WST practice accurately — as a hybrid credential offering that is specific enough to be credible and broad enough to be genuinely useful.",
      "Design an engagement pricing structure that reflects the value of the work and ensures the practitioner can sustain the practice without compromising the engagement's quality.",
      "Apply client selection criteria that identify clients where the methodology can produce genuine value and avoid engagements that are structurally likely to fail or to require ethical compromise.",
      "Recognize the business-of-practice decisions (pricing, client selection, scope) as ethical decisions, not just commercial ones.",
    ],
    key_sources: [
      "Maister, D. — Managing the Professional Service Firm (pricing, positioning, client relationship)",
      "Christensen, Wang & van Bever — 'Consulting on the Cusp of Disruption,' HBR, 2013",
      "Donaldson & Dunfee — integrative social contracts theory (business ethics foundation)",
      "Freeman — stakeholder theory (whose interests the practitioner is serving)",
      "IMC USA Code of Ethics; ICMCI professional standards",
    ],
    connections: {
      before: "Module 6B built the ethical framework. This module applies it to the commercial and positioning decisions that determine whether the practitioner can sustain an ethical practice.",
      after: "Module 6D — the final module of the curriculum — addresses practitioner formation and reflective practice.",
      feeds: "The positioning and pricing principles developed here inform the practitioner statement required in the capstone simulation assessment.",
    },
  },
  {
    domain_number: 6,
    module_number: "6D",
    title: "Practitioner Formation and Reflective Practice",
    estimated_time: "2.0 hours",
    learning_objectives: [
      "Design and maintain a structured reflective practice — a regular, honest review of their own work that surfaces what they are getting right, what they are getting wrong, and what they are still developing.",
      "Articulate who they are in this work — their commitments, their particular strengths, and what they are not yet equipped to do — with precision rather than self-promotion or false modesty.",
      "Identify what it means to contribute to the field: case documentation, shared frameworks, honest account of what the methodology produces and where it falls short.",
      "Hold the final and most important distinction of the curriculum: this curriculum prepares practitioners to begin doing competent work, and names the difference between that and being certified as competent.",
    ],
    key_sources: [
      "Schön, D. — The Reflective Practitioner, 1983 (reflective practice as the foundation of professional development)",
      "Scharmer — Theory U on inner work and the quality of attention as a practitioner",
      "Maister — on professional service and the practitioner's relationship to their own work",
      "Donaldson & Dunfee — the practitioner's accountability to a broader social contract",
      "The curriculum as a whole — Module 6D is explicitly retrospective across all prior modules",
    ],
    connections: {
      before: "Module 6C addressed the business of practice. This module completes the domain and the curriculum.",
      after: "The practitioner enters the field. The curriculum's job is done.",
      feeds: "The reflective practice built here is the ongoing practice that determines whether the competence the curriculum began to develop continues to develop, or plateaus. It feeds nothing in the curriculum because it is the end — and the beginning of everything that comes after.",
    },
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// LESSONS
// ─────────────────────────────────────────────────────────────────────────────

// Helper for Domains 1–5: lesson descriptions from module outlines become core_content placeholders.
function placeholder(description: string): string {
  return `[Lesson content to be written in a future content session]\n\n${description}`;
}

const LESSONS: LessonSeed[] = [
  // ── 1A ────────────────────────────────────────────────────────────────────
  {
    module_number: "1A", lesson_number: "1A-1", sort_order: 1,
    title: "The Actual Adoption Picture",
    estimated_time: "30 minutes", teaching_method: "Reading",
    core_content: placeholder("What the independent data actually shows about how SMBs are using AI. U.S. Census BTOS methodology and what its figures mean — overall business AI use around 7–9% as of late 2025, small-firm use lower, with a roughly 3x gap between firms under 20 employees and firms over 250. Why BTOS figures diverge sharply from vendor adoption claims, and what that divergence tells us. The concentration of AI use in information sector firms, firms with prior data infrastructure, and metro-area firms."),
    reflection_prompt: null, ai_prompt_suggestions: [], key_takeaway: null,
  },
  {
    module_number: "1A", lesson_number: "1A-2", sort_order: 2,
    title: "Shadow Adoption — The Hidden Signal",
    estimated_time: "25 minutes", teaching_method: "Reading + Reflection",
    core_content: placeholder("The gap between strategic adoption (the firm has made deliberate decisions about AI governance, workflow integration, and role implications) and shadow adoption (individual employees using AI tools without organizational sanction or oversight). Why most SMBs are in the shadow phase without knowing it. The BYOAI (bring-your-own-AI) phenomenon as documented in Microsoft/LinkedIn Work Trend Index data. Reframing shadow adoption: not a compliance problem, but a diagnostic signal about where workflow pain and governance gaps exist."),
    reflection_prompt: null, ai_prompt_suggestions: [], key_takeaway: null,
  },
  {
    module_number: "1A", lesson_number: "1A-3", sort_order: 3,
    title: "The Productivity Paradox",
    estimated_time: "25 minutes", teaching_method: "Reading",
    core_content: placeholder("The honest synthesis of the most-cited productivity research. Where AI reliably raises individual task performance (Brynjolfsson et al. on customer service agents; Noy & Zhang on writing tasks; GitHub Copilot studies on code completion). Why those gains do not automatically translate to firm-level productivity. The organizational gap — implementation, change management, workflow redesign, training — as the place where gains are lost. Why that gap is exactly where this consulting practice operates."),
    reflection_prompt: null, ai_prompt_suggestions: [], key_takeaway: null,
  },
  {
    module_number: "1A", lesson_number: "1A-4", sort_order: 4,
    title: "Reading the Data — A Practitioner's Literacy Exercise",
    estimated_time: "20 minutes", teaching_method: "AI-assisted research",
    core_content: placeholder("Using the curriculum AI assistant: the practitioner selects two commonly cited AI productivity statistics they have encountered (from a list provided, or from their own experience) and asks the assistant to trace each to its primary source, identify who funded the research, and determine whether it is a measured or projected finding. Structured debrief questions to follow."),
    reflection_prompt: "Select two AI productivity statistics you have encountered and trace them: Who funded the research? Is this a measured or projected finding? What does the difference matter for how you use it with a client?",
    ai_prompt_suggestions: [
      "I want to trace this AI productivity statistic to its primary source: [paste statistic]. Help me identify where it originated, who funded the research, and whether it is a measured or projected finding.",
      "What is the difference between the MIT NANDA findings and the McKinsey productivity projections on AI's impact on small businesses? Which is measured and which is projected?",
    ],
    key_takeaway: "Every statistic you cite in a client conversation has a source, a funder, and a methodology. Knowing those things is the practitioner's baseline.",
  },
  // ── 1B ────────────────────────────────────────────────────────────────────
  {
    module_number: "1B", lesson_number: "1B-1", sort_order: 1,
    title: "The Five Thriving Markers",
    estimated_time: "30 minutes", teaching_method: "Reading",
    core_content: placeholder("Cross-referencing MIT NANDA, McKinsey State of AI 2025, Goldman Sachs SMB pulse surveys, and BTOS data: the five characteristics that appear with consistent frequency in SMBs navigating this moment well. Clear human ownership of AI use decisions. Prior workflow documentation (documented processes before AI layers on top). Genuine (not performative) team communication about what is and is not working. Selective rather than broad AI adoption — specific tools for specific problems with clear success criteria. Active reskilling investment, even modest in scale."),
    reflection_prompt: null, ai_prompt_suggestions: [], key_takeaway: null,
  },
  {
    module_number: "1B", lesson_number: "1B-2", sort_order: 2,
    title: "The Four Struggling Markers",
    estimated_time: "20 minutes", teaching_method: "Reading",
    core_content: placeholder("The four characteristics present in SMBs that are struggling: reactive, vendor-led AI adoption with no internal decision framework; undocumented processes that AI is expected to fix rather than support; a leadership communication vacuum about workforce implications; and tool sprawl without integration or governance. Why each of these creates the conditions in which AI investment fails."),
    reflection_prompt: null, ai_prompt_suggestions: [], key_takeaway: null,
  },
  {
    module_number: "1B", lesson_number: "1B-3", sort_order: 3,
    title: "The 15-Minute First-Contact Diagnostic",
    estimated_time: "30 minutes", teaching_method: "Simulation",
    core_content: placeholder("Using the nine markers as a first-contact listening and questioning framework. What questions open each marker. What signals — including absence of signals — indicate which category a firm falls into. Caution: this is an orientation tool, not a judgment. The diagnostic identifies starting-point hypotheses to investigate, not verdicts to deliver. Practitioner role-play: given a brief first-contact summary of a fictional SMB, identify which markers appear and which questions you would prioritize in the first meeting."),
    reflection_prompt: null, ai_prompt_suggestions: [], key_takeaway: null,
  },
  {
    module_number: "1B", lesson_number: "1B-4", sort_order: 4,
    title: "The Misread — Adoption as Readiness",
    estimated_time: "10 minutes", teaching_method: "Reading + Reflection",
    core_content: placeholder("The practitioner's single most common early-stage error: interpreting the number of AI tools a firm uses as a measure of strategic maturity. Why a firm using five AI tools with no governance is more fragile than a firm using one AI tool with clear ownership and workflow integration. What to look for instead."),
    reflection_prompt: "Think of a time you or someone you observed confused adoption rate with strategic readiness. What did the error produce? What would you look for instead?",
    ai_prompt_suggestions: [], key_takeaway: null,
  },
  // ── 1C ────────────────────────────────────────────────────────────────────
  {
    module_number: "1C", lesson_number: "1C-1", sort_order: 1,
    title: "Anxious Pragmatism — Using AI While Fearing It",
    estimated_time: "25 minutes", teaching_method: "Reading",
    core_content: placeholder("What the APA Work in America 2024–2025 surveys and Gallup State of the Global Workplace 2025 data show about how workers are experiencing AI disruption. The simultaneous rise of AI adoption and AI anxiety. Why high AI use and high job insecurity can coexist in the same person on the same day. What this means for the information practitioners get when they enter a workplace: most people will not tell you what they are actually afraid of, and will not tell you the full extent of their unauthorized AI use."),
    reflection_prompt: null, ai_prompt_suggestions: [], key_takeaway: null,
  },
  {
    module_number: "1C", lesson_number: "1C-2", sort_order: 2,
    title: "The Neuroscience of Threat — Why Fear Impairs Learning",
    estimated_time: "20 minutes", teaching_method: "Reading",
    core_content: placeholder("The HPA-axis stress response and what chronic job insecurity actually does to cognitive function. The SCARF model (Status, Certainty, Autonomy, Relatedness, Fairness) as a vocabulary — not a validated instrument — for understanding why people behave the way they do in change environments. The direct implication for the practitioner: teams who fear replacement are cognitively less able to learn the new tools they are being asked to adopt. This is not resistance. It is physiology. How knowing this changes how a practitioner enters a room. Note: SCARF is used here as practitioner vocabulary, not as a psychometric tool."),
    reflection_prompt: null, ai_prompt_suggestions: [], key_takeaway: null,
  },
  {
    module_number: "1C", lesson_number: "1C-3", sort_order: 3,
    title: "The BYOAI Signal",
    estimated_time: "20 minutes", teaching_method: "Reading + Reflection",
    core_content: placeholder("Microsoft/LinkedIn Work Trend Index 2024–2025 data on bring-your-own-AI behavior — employees using personal AI accounts and tools in the context of their job without employer awareness or sanction. The reframe: BYOAI is not primarily a security problem (though it has security dimensions addressed in Domain 4). It is a signal that a workflow pain is real, a governance gap exists, and someone on the team has already found a partial solution. The practitioner who can read that signal has a head start on both the technology audit and the process audit."),
    reflection_prompt: null, ai_prompt_suggestions: [], key_takeaway: null,
  },
  {
    module_number: "1C", lesson_number: "1C-4", sort_order: 4,
    title: "Practitioner Posture — Entering the Room",
    estimated_time: "20 minutes", teaching_method: "Reflection",
    core_content: placeholder("Written reflection: What does it mean to walk into an organization where people are genuinely uncertain whether your work will result in their job being eliminated? How do you hold that? What do you owe people in that situation before they owe you honesty? This is not answered definitively — it is a reflection the practitioner returns to repeatedly across the curriculum. The goal is to surface the question, not to resolve it."),
    reflection_prompt: "What does it mean to walk into an organization where people are genuinely uncertain whether your work will result in their job being eliminated? What do you owe people in that situation before they owe you honesty?",
    ai_prompt_suggestions: [], key_takeaway: null,
  },
  // ── 1D ────────────────────────────────────────────────────────────────────
  {
    module_number: "1D", lesson_number: "1D-1", sort_order: 1,
    title: "The Major Projections — What They Actually Say",
    estimated_time: "25 minutes", teaching_method: "Reading",
    core_content: placeholder("WEF Future of Jobs 2025: the methodology (employer surveys about expected role changes, not observed data), the 40% of skills needing update claim, and what that means versus what it is commonly taken to mean. McKinsey productivity scenarios: the wide range of assumptions baked into the headline figures, the dependency of best-case scenarios on factors most SMBs do not have. Goldman Sachs job displacement estimates and their academic critics. How to read a projection document: what are the assumptions, who funded it, what is the error range, and what measured data underlies it?"),
    reflection_prompt: null, ai_prompt_suggestions: [], key_takeaway: null,
  },
  {
    module_number: "1D", lesson_number: "1D-2", sort_order: 2,
    title: "The Acemoglu-Restrepo Counter",
    estimated_time: "20 minutes", teaching_method: "Reading",
    core_content: placeholder("MIT economists Daron Acemoglu and Pascual Restrepo's 'so-so automation' framework — the empirical finding that much automation displaces workers without generating productivity gains large enough to justify that displacement. Why this is a meaningful counter-weight to productivity optimism, and what its limits are. The distinction between automation that creates new categories of work and automation that simply eliminates existing work: the historical record is more varied than either side typically acknowledges. Honest placement of this framework: important, contested, and not the final word."),
    reflection_prompt: null, ai_prompt_suggestions: [], key_takeaway: null,
  },
  {
    module_number: "1D", lesson_number: "1D-3", sort_order: 3,
    title: "Modeling Uncertainty Without Paralysis",
    estimated_time: "15 minutes", teaching_method: "Simulation + Reflection",
    core_content: placeholder("Scenario: a client asks you directly, 'Is AI going to eliminate my team's jobs in the next three years?' The practitioner writes the response they would give. Debrief questions: Did you give a false sense of certainty? Did you hedge so much that you were useless? Did you distinguish what is measured from what is projected? Is the client better equipped to make a decision after your answer?"),
    reflection_prompt: "Write the response you would give a client who asks: 'Is AI going to eliminate my team's jobs in the next three years?' Then evaluate it: did you give false certainty, hedge into uselessness, or find the honest middle?",
    ai_prompt_suggestions: [
      "A client has just asked me whether AI will eliminate their team's jobs in the next three years. Help me craft a response that is honest about what is measured versus projected, doesn't catastrophize, and doesn't dismiss the concern.",
    ],
    key_takeaway: "The practitioner's job is not to predict the future. It is to help clients distinguish what is known from what is projected, and make good decisions inside that uncertainty.",
  },
  // ── 2A ────────────────────────────────────────────────────────────────────
  {
    module_number: "2A", lesson_number: "2A-1", sort_order: 1,
    title: "What Human Capacity Actually Is",
    estimated_time: "30 minutes", teaching_method: "Reading",
    core_content: placeholder("The practitioner's core claim about human work: every person who has been doing meaningful work inside an organization contributes judgment shaped by lived experience, relationships built over time, institutional memory, creative synthesis, and the capacity to hold complexity without collapsing it into an algorithm. None of that is in the job description. AI can absorb the documented, repeatable task substrate of most roles. What remains — and what the practitioner must find — is what cannot be replicated. This lesson establishes that claim empirically rather than sentimentally: what research on tacit knowledge (Polanyi), knowledge-work value (Davenport), and organizational memory (Walsh & Ungson) actually shows."),
    reflection_prompt: null, ai_prompt_suggestions: [], key_takeaway: null,
  },
  {
    module_number: "2A", lesson_number: "2A-2", sort_order: 2,
    title: "Conducting the Human Capacity Audit",
    estimated_time: "40 minutes", teaching_method: "Reading + Simulation",
    core_content: placeholder("The specific audit process: documented tasks (what the SOP says), undocumented tasks (what actually happens), institutional memory (what leaves with this person), and informal contributions (what holds the team together). The audit worksheet from WST_Audit_Methodology.md, Section B2. How to conduct this in a 45-minute conversation with an employee without it feeling like a performance review or a redundancy assessment. What questions open each category. What silence, deflection, and casualness signal. Simulation: practitioner given a role profile and asked to design the conversation that would surface the full human capacity picture."),
    reflection_prompt: null, ai_prompt_suggestions: [], key_takeaway: null,
  },
  {
    module_number: "2A", lesson_number: "2A-3", sort_order: 3,
    title: "Strengths-Based Work Design — The Evidence Base",
    estimated_time: "30 minutes", teaching_method: "Reading",
    core_content: placeholder("CliftonStrengths (Gallup) and the meta-analytic evidence on strengths-based engagement and performance — effect sizes, methodology, and validity limits (contested in academic psychometrics; use as conversation-starter, not final verdict). Wrzesniewski & Dutton's job crafting theory: the evidence that workers who actively reshape their tasks, relationships, and cognitive framing of their role experience higher engagement and perform better. The emerging 2024–2026 research on AI-era job crafting — how workers are already adapting their roles in response to AI without formal permission or design support."),
    reflection_prompt: null, ai_prompt_suggestions: [], key_takeaway: null,
  },
  {
    module_number: "2A", lesson_number: "2A-4", sort_order: 4,
    title: "Running the Strengths-and-Crafting Conversation",
    estimated_time: "40 minutes", teaching_method: "Simulation",
    core_content: placeholder("Not an assessment administration. A structured conversation with a person about what energizes them, what they are good at that their current role does not fully use, and what the role would look like if it were designed around their best work. How to conduct this without it feeling like a performance management exercise. How to integrate what the person tells you with what you have observed. Simulation: practitioner given an employee profile and asked to design and execute a strengths-and-crafting conversation outline, then write a brief role redesign hypothesis based on the results."),
    reflection_prompt: null, ai_prompt_suggestions: [], key_takeaway: null,
  },
  // ── 2B ────────────────────────────────────────────────────────────────────
  {
    module_number: "2B", lesson_number: "2B-1", sort_order: 1,
    title: "What Psychological Safety Is — and What It Is Not",
    estimated_time: "25 minutes", teaching_method: "Reading",
    core_content: placeholder("Edmondson's research program on team psychological safety: the specific definition (the shared belief that the team is safe for interpersonal risk-taking), the seven-item diagnostic scale, and the meta-analytic evidence on outcomes including team learning behavior and performance. Clearing the most common misunderstandings: safety is not comfort, not harmony, not the absence of conflict. Safety is what allows a person to say 'I think this is wrong' or 'I don't understand' or 'I'm afraid of what this means for my job' without expecting punishment. The 2024–2026 extensions to AI-specific contexts: how safety is being studied in environments where AI threatens job security."),
    reflection_prompt: null, ai_prompt_suggestions: [], key_takeaway: null,
  },
  {
    module_number: "2B", lesson_number: "2B-2", sort_order: 2,
    title: "The Safety Paradox in AI Transitions",
    estimated_time: "25 minutes", teaching_method: "Reading + Case Analysis",
    core_content: placeholder("The most common and most dangerous pattern in AI-era SMB engagements: a leader who is genuinely asking for honest team input about AI adoption while simultaneously running workforce planning that may eliminate some of those team members' roles — and not disclosing the latter. Why this pattern destroys safety faster than almost anything else. How to recognize it (usually through the gap between what leadership tells you about team communication and what you observe in the team). How to address it with a client without blowing up the engagement or betraying trust in either direction. Case: a composite illustration of a firm where this pattern played out and the consequences."),
    reflection_prompt: null, ai_prompt_suggestions: [], key_takeaway: null,
  },
  {
    module_number: "2B", lesson_number: "2B-3", sort_order: 3,
    title: "Five High-Leverage Practices",
    estimated_time: "25 minutes", teaching_method: "Reading",
    core_content: placeholder("The specific practices the research supports for building psychological safety during disruption: (1) Leaders go first — modeling fallibility and uncertainty before asking the team to. (2) Frame the AI conversation as a design problem, not a performance evaluation. (3) Maintain predictability — even bad news delivered consistently is less damaging than uncertainty. (4) Create a protected channel for AI concerns separate from performance conversations. (5) Close the loop — when someone raises a concern, respond visibly. Each practice includes what it looks like in a 10–20-person firm and where practitioners typically get it wrong."),
    reflection_prompt: null, ai_prompt_suggestions: [], key_takeaway: null,
  },
  {
    module_number: "2B", lesson_number: "2B-4", sort_order: 4,
    title: "Diagnosing Safety — What to Look For",
    estimated_time: "25 minutes", teaching_method: "Simulation",
    core_content: placeholder("Direct safety assessment versus assumption. The practitioner does not assume safety is low because the industry is stressful, or assume it is high because the owner describes the team as 'like family.' They look: who speaks in meetings, who stays quiet, whether dissent appears or everything converges, whether junior staff correct senior staff, whether the team openly discusses what is not working. Simulation: given a transcript of a team discovery session, the practitioner annotates observable safety signals and writes a one-paragraph assessment."),
    reflection_prompt: null, ai_prompt_suggestions: [], key_takeaway: null,
  },
  {
    module_number: "2B", lesson_number: "2B-5", sort_order: 5,
    title: "The SMB Amplification Effect",
    estimated_time: "20 minutes", teaching_method: "Reading + Reflection",
    core_content: placeholder("In a 12-person firm, one person withdrawing trust changes the climate of the entire team. In a 50-person firm, the same withdrawal might be absorbed. This is the SMB amplification effect, and practitioners need to hold it actively when designing discovery processes, choosing who to interview together versus separately, and deciding when and how to share preliminary findings. Reflection: what does this mean for how you decide when to escalate a safety concern to the client?"),
    reflection_prompt: "What does the SMB amplification effect mean for how you design your discovery process at a firm of 15 people? Who do you interview separately? What do you not share until when?",
    ai_prompt_suggestions: [], key_takeaway: null,
  },
  // ── 2C ────────────────────────────────────────────────────────────────────
  {
    module_number: "2C", lesson_number: "2C-1", sort_order: 1,
    title: "The Task Decomposition Methodology",
    estimated_time: "30 minutes", teaching_method: "Reading",
    core_content: placeholder("Breaking a role into its component tasks. Classifying those tasks by automation-amenability — not binary (automatable / not) but on a spectrum that accounts for context-dependence, judgment-intensity, relationship-dependence, and the cost of errors. The MIT Work of the Future initiative's task-level analysis as the research foundation. What remains after the automation-amenable substrate is removed: the judgment work, the relationship work, the synthesis work, the irreplaceable-by-design work. The practitioner's job is to find that remainder, name it, and build a role reconstruction around it."),
    reflection_prompt: null, ai_prompt_suggestions: [], key_takeaway: null,
  },
  {
    module_number: "2C", lesson_number: "2C-2", sort_order: 2,
    title: "Strengths Anchoring and Internal Mobility",
    estimated_time: "35 minutes", teaching_method: "Reading + Simulation",
    core_content: placeholder("Applying the job crafting and CliftonStrengths frameworks from Module 2A to the specific challenge of role reconstruction after task displacement. The internal mobility architecture: looking across the whole firm before concluding there is no role for a person. The AT&T Future Ready case — over $1 billion in retraining investment, internal mobility commitments, transparent multi-year planning. What it teaches about what full-effort workforce transition looks like at scale. Why the SMB equivalent is not $1 billion but it is still effort: honest internal review, genuine role redesign, real (not performative) retraining pathways. Simulation: given three role profiles from a firm implementing AI customer service, design a role reconstruction pathway for each."),
    reflection_prompt: null, ai_prompt_suggestions: [], key_takeaway: null,
  },
  {
    module_number: "2C", lesson_number: "2C-3", sort_order: 3,
    title: "The Responsible-Restructuring Evidence",
    estimated_time: "35 minutes", teaching_method: "Reading + Case Analysis",
    core_content: placeholder("Sandra Sucher's research on trust and workforce reduction — the documented finding that layoffs damage trust with customers, surviving employees, and the broader community in ways that often outlast any financial benefit. Wayne Cascio's responsible-restructuring findings: only 30% of layoffs improve margins three or more years out; firms that find alternatives consistently outperform those that default to involuntary separation. The Brockner survivor syndrome research. The Klarna teaching case — the celebrated AI workforce decision partially reversed when service quality declined and the human work turned out to have been systematically underestimated. What this case teaches about the cost of undercounting tacit work."),
    reflection_prompt: null, ai_prompt_suggestions: [], key_takeaway: null,
  },
  {
    module_number: "2C", lesson_number: "2C-4", sort_order: 4,
    title: "The Non-Replacement Pattern",
    estimated_time: "20 minutes", teaching_method: "Reading",
    core_content: placeholder("The most common 2025–2026 workforce reduction pattern at SMB scale: quietly not backfilling attrition, gradually reducing headcount without a formal layoff announcement. Why owners choose this path (perceived lower risk, fewer difficult conversations, no legal exposure). What it actually produces: the same survivor syndrome effects over a longer time horizon, compounded by the lack of transparency — staff know what is happening but it is never acknowledged. The practitioner's role: name the pattern when they see it, bring the responsible-restructuring evidence, and ensure the client understands what they are doing, even if they choose to continue."),
    reflection_prompt: null, ai_prompt_suggestions: [], key_takeaway: null,
  },
  {
    module_number: "2C", lesson_number: "2C-5", sort_order: 5,
    title: "The Hard Case",
    estimated_time: "40 minutes", teaching_method: "Reading + Reflection",
    core_content: placeholder("What happens when, after a genuine human capacity audit, real exploration of role redesign, honest application of strengths frameworks, and a genuine internal mobility search — there is no role for this person? The practitioner's obligations: be honest with the client about what the decision actually is; be honest with the person being transitioned about what is happening and why; ensure the departure is handled with the dignity the person's contribution has earned; name what the organization is losing and ensure the client understands it; refuse to be the instrument of a communication that misrepresents an elimination as a restructuring. This is not the failure case — it is the outcome of last resort when everything else has been genuinely tried."),
    reflection_prompt: "How do you hold the tension between advocating for a person and serving a client who has the legal right to make the decision to let them go? Write 200 words honestly.",
    ai_prompt_suggestions: [], key_takeaway: null,
  },
  // ── 2D ────────────────────────────────────────────────────────────────────
  {
    module_number: "2D", lesson_number: "2D-1", sort_order: 1,
    title: "Conversational and Observational Technique",
    estimated_time: "30 minutes", teaching_method: "Reading",
    core_content: placeholder("The specific techniques the practitioner uses to access the human terrain: the structured-informal interview, the observation walk (watching work happen without the filter of explanation), the artifact review (looking at what people actually have on their desks, their screens, their whiteboards), and the triangulation protocol (conducting the same conversation at multiple levels and comparing). The discipline of not projecting: listening for what is actually said before interpreting it. What the first ten minutes of any team conversation reveals that the rest of the conversation will obscure."),
    reflection_prompt: null, ai_prompt_suggestions: [], key_takeaway: null,
  },
  {
    module_number: "2D", lesson_number: "2D-2", sort_order: 2,
    title: "Triangulating Across Hierarchy",
    estimated_time: "30 minutes", teaching_method: "Case Analysis",
    core_content: placeholder("The owner's account, the manager's account, and the front-line staff's account of the same workplace reality consistently diverge in patterned ways. The owner sees strategy and intent; the managers see capacity constraints and priority conflicts; the front-line staff see the actual work, the actual tool failures, and the actual interpersonal dynamics. Each is incomplete. The gaps between them are the most important data in the engagement. Case analysis: given three accounts of the same process from an owner, a manager, and a front-line employee, the practitioner identifies the significant divergences and explains what each gap suggests about the real operational situation."),
    reflection_prompt: null, ai_prompt_suggestions: [], key_takeaway: null,
  },
  {
    module_number: "2D", lesson_number: "2D-3", sort_order: 3,
    title: "Reading What Is Not Said",
    estimated_time: "30 minutes", teaching_method: "Reading + Simulation",
    core_content: placeholder("Consistent avoidance of a topic is information. Deflection — answering a different question than the one asked — is information. Over-explanation of something that should be simple is information. A topic that multiple people independently fail to bring up, in a context where it should naturally arise, is information. The practitioner learns to notice these patterns without interpreting them too quickly. Simulation: given a transcript of a discovery session with five people, annotate what is not said and generate three hypotheses about what might explain the absence."),
    reflection_prompt: null, ai_prompt_suggestions: [], key_takeaway: null,
  },
  {
    module_number: "2D", lesson_number: "2D-4", sort_order: 4,
    title: "Producing the People-Layer Summary",
    estimated_time: "30 minutes", teaching_method: "Reading + Simulation",
    core_content: placeholder("The output of the people audit: a written summary that identifies what the human terrain looks like, what the primary people-layer risks are, and what the process and technology layers need to account for. What this document is not: a performance review of individuals, a verdict on the team's quality, or a list of 'people problems.' It is a map of the human assets and the human vulnerabilities that any subsequent recommendation must work within. Simulation: given the outputs of a fictional people audit (interview notes, safety assessment, capacity inventory), produce a people-layer summary of 300–400 words."),
    reflection_prompt: null, ai_prompt_suggestions: [], key_takeaway: null,
  },
  // ── 3A ────────────────────────────────────────────────────────────────────
  {
    module_number: "3A", lesson_number: "3A-1", sort_order: 1,
    title: "Work as Imagined vs. Work as Done",
    estimated_time: "30 minutes", teaching_method: "Reading",
    core_content: placeholder("Hollnagel's distinction from the resilience engineering tradition: the gap between the formal account of how work happens (procedures, org charts, SOPs, what the owner describes in a sales conversation) and the informal reality (what practitioners and front-line workers actually do, which adaptations have evolved, which steps are routinely skipped because they are impractical, which informal communication channels carry critical information). Why this gap is universal and why it is not a failure of individual discipline. The practitioner's job: to access work-as-done rather than accepting work-as-imagined, because any recommendation that is built on the imagined version will fail when it meets the real one."),
    reflection_prompt: null, ai_prompt_suggestions: [], key_takeaway: null,
  },
  {
    module_number: "3A", lesson_number: "3A-2", sort_order: 2,
    title: "The Process Trace",
    estimated_time: "40 minutes", teaching_method: "Reading + Simulation",
    core_content: placeholder("Following the artifact: picking one unit of work (a customer inquiry, an invoice, a service ticket, a hire) and tracing it from the moment it enters the organization to the moment it exits, documenting every hand-off, every decision point, every delay, and every person whose judgment or action affects the outcome. Why this is more reliable than interviews about 'the process' — people describe the process as they understand it; the artifact reveals the process as it actually operates. Simulation: given a brief description of a fictional firm's client onboarding process as described by the owner, the practitioner designs the process trace they would conduct."),
    reflection_prompt: null, ai_prompt_suggestions: [], key_takeaway: null,
  },
  {
    module_number: "3A", lesson_number: "3A-3", sort_order: 3,
    title: "Right-Sized Process Documentation",
    estimated_time: "25 minutes", teaching_method: "Reading",
    core_content: placeholder("What a runbook is, what a swimlane is, and when each is sufficient. Why an SMB does not need BPMN 2.0 or a 60-page process manual. The design test: can a person who has never done this job use this document to do it adequately? The one-page constraint as a quality standard. The ten to fifteen processes that constitute most of a 10–50-person firm's core operation and what documenting them actually accomplishes versus what owners typically expect it to accomplish."),
    reflection_prompt: null, ai_prompt_suggestions: [], key_takeaway: null,
  },
  {
    module_number: "3A", lesson_number: "3A-4", sort_order: 4,
    title: "The Founder Bottleneck",
    estimated_time: "25 minutes", teaching_method: "Reading + Reflection",
    core_content: placeholder("The most consistent operational failure mode in firms under 50 people: undocumented work concentrated in one or two people — usually the founder. Why this develops (the founder was often the most competent person early, and the organization never built the infrastructure to distribute their knowledge). Why it persists even as the firm grows. The dual nature: it is a process visibility problem and a people vulnerability. Reflection: you identify a clear founder bottleneck in a client firm. The founder does not see it as a problem. How do you proceed?"),
    reflection_prompt: "You identify a clear founder bottleneck in a client firm. The founder does not see it as a problem — in fact, they describe it as 'being close to the work.' How do you proceed?",
    ai_prompt_suggestions: [], key_takeaway: null,
  },
  // ── 3B ────────────────────────────────────────────────────────────────────
  {
    module_number: "3B", lesson_number: "3B-1", sort_order: 1,
    title: "The Failure Taxonomy — Cash, Bottleneck, Opacity",
    estimated_time: "35 minutes", teaching_method: "Reading",
    core_content: placeholder("The first three of the seven failure modes in depth. (1) Cash conversion failure: JPMorgan Chase Institute's finding that the median small business holds 27 cash buffer days; why understanding the cash cycle is a process-audit competency, not just a finance competency. (2) Founder bottleneck: full development — why it develops, what it costs, and what the early warning signals are. (3) Process opacity: what it costs at the moment of scaling, crisis, or key-person departure; why most SMBs lack written SOPs for over 50% of their recurring work; why the answer is not a documentation project but a documentation discipline."),
    reflection_prompt: null, ai_prompt_suggestions: [], key_takeaway: null,
  },
  {
    module_number: "3B", lesson_number: "3B-2", sort_order: 2,
    title: "The Failure Taxonomy — Tool Sprawl, Quality Drift, Decision Latency, Customer Concentration",
    estimated_time: "30 minutes", teaching_method: "Reading",
    core_content: placeholder("The remaining four failure modes. (4) Tool sprawl and data fragmentation: even 10–50-person firms typically run 40–80 tools with substantial overlap; why AI layered onto tool sprawl produces more sprawl rather than integration. (5) Quality drift: the erosion of consistency in a firm's core deliverable as volume grows without explicit quality systems. (6) Decision latency: decisions that should take hours taking weeks because the firm lacks decision rights, escalation paths, or meeting cadence. (7) Customer concentration: the Federal Reserve Small Business Credit Survey finding that SMBs with over 25% revenue from a single customer are significantly more likely to fail."),
    reflection_prompt: null, ai_prompt_suggestions: [], key_takeaway: null,
  },
  {
    module_number: "3B", lesson_number: "3B-3", sort_order: 3,
    title: "Pattern Recognition in the First Conversation",
    estimated_time: "30 minutes", teaching_method: "Simulation",
    core_content: placeholder("The seven-failure-mode checklist as a first-contact listening framework. What questions and what owner language indicate each failure mode. What their co-occurrence patterns mean — cash conversion failure and customer concentration often appear together; tool sprawl and process opacity often appear together. The practitioner's discipline: observe and hypothesize, don't diagnose in the first conversation. Simulation: given a transcript of a 20-minute first client conversation, identify which failure modes are indicated, which remain uncertain, and what the next discovery step is."),
    reflection_prompt: null, ai_prompt_suggestions: [], key_takeaway: null,
  },
  // ── 3C ────────────────────────────────────────────────────────────────────
  {
    module_number: "3C", lesson_number: "3C-1", sort_order: 1,
    title: "Lean Philosophy at SMB Scale",
    estimated_time: "30 minutes", teaching_method: "Reading",
    core_content: placeholder("The Toyota Production System lineage and its translation to SMBs. What Build-Measure-Learn (Ries, Lean Startup) means when applied to operational design rather than product development. Minimum viable bureaucracy: the level of formalization that a process requires to be reliable, and no more. The failure mode of over-systematizing: the 47-page process manual nobody reads; the weekly meeting cadence that produces no decisions; the project management tool that creates overhead rather than visibility. The practitioner's discipline: right-size the system to the actual size, complexity, and culture of the firm."),
    reflection_prompt: null, ai_prompt_suggestions: [], key_takeaway: null,
  },
  {
    module_number: "3C", lesson_number: "3C-2", sort_order: 2,
    title: "Wardley Mapping for SMBs",
    estimated_time: "35 minutes", teaching_method: "Reading + Simulation",
    core_content: placeholder("Simon Wardley's framework: components of a business value chain can be placed on a spectrum from genesis through custom-built through product through commodity. Commodity components should be outsourced or bought off the shelf; custom-built components are where the firm's differentiation lives and where investment is warranted. The SMB application: most SMBs are running commodity processes on custom-built or self-managed infrastructure because they have never asked whether a commodity solution would serve them better. Simulation: given a fictional firm's operational description, the practitioner places five components on a simplified Wardley map and identifies one thing that should be commoditized and one thing that should be protected."),
    reflection_prompt: null, ai_prompt_suggestions: [], key_takeaway: null,
  },
  {
    module_number: "3C", lesson_number: "3C-3", sort_order: 3,
    title: "When Frameworks Help and When They Don't",
    estimated_time: "20 minutes", teaching_method: "Reading",
    core_content: placeholder("EOS/Traction (Wickman): widely adopted, not academically validated, genuinely useful for some firms, overkill for others. How to tell which: firm size, founder's tolerance for structure, existing meeting cadence, growth stage. The general principle: a framework is a starting point, not a prescription. The practitioner who recommends EOS to every client with operational problems is not doing process design — they are selling a product. What to look for instead: the specific dysfunction and the specific, right-sized intervention that addresses it."),
    reflection_prompt: null, ai_prompt_suggestions: [], key_takeaway: null,
  },
  {
    module_number: "3C", lesson_number: "3C-4", sort_order: 4,
    title: "The One-Page Operating Infrastructure",
    estimated_time: "25 minutes", teaching_method: "Reading + Simulation",
    core_content: placeholder("The 10–15 recurring processes that constitute most of an SMB's operation: client acquisition, client onboarding, service delivery, quality review, invoicing, accounts receivable, financial reporting, hiring, onboarding of new staff, performance review, off-boarding, vendor management, and one or two industry-specific processes. Documenting these in a consistent one-page format is the minimum viable operating infrastructure for a 10–50-person firm. Simulation: given a process description from a fictional firm, produce a one-page runbook for that process."),
    reflection_prompt: null, ai_prompt_suggestions: [], key_takeaway: null,
  },
  // ── 3D ────────────────────────────────────────────────────────────────────
  {
    module_number: "3D", lesson_number: "3D-1", sort_order: 1,
    title: "Automation-Induced Brittleness",
    estimated_time: "30 minutes", teaching_method: "Reading",
    core_content: placeholder("What happens when a process is automated end-to-end without preserving the human capacity to perform it manually: the firm becomes dependent on the tool's continued operation, pricing, and behavior. Tool changes — model updates, pricing changes, deprecation, acquisition — can break processes overnight. At SMB scale, there is no redundancy, and the firm can be paralyzed. The high-reliability organizations literature (Weick, Sutcliffe; LaPorte; Roberts) and the resilience engineering tradition (Hollnagel; Woods) on brittleness and graceful degradation. The SMB-specific version: what does it mean to design a process so that a human being can still perform it when the tool is unavailable?"),
    reflection_prompt: null, ai_prompt_suggestions: [], key_takeaway: null,
  },
  {
    module_number: "3D", lesson_number: "3D-2", sort_order: 2,
    title: "The Brittleness Audit",
    estimated_time: "30 minutes", teaching_method: "Reading + Simulation",
    core_content: placeholder("For every automated process a firm is running or considering, the practitioner asks five questions: (1) What breaks when the tool changes pricing? (2) What breaks when the model is updated and the outputs change? (3) What breaks when the API fails for 24 hours? (4) What breaks when the vendor is acquired and the product is pivoted? (5) Can a human still perform this process without the tool, in a reasonable time, without the outcome being catastrophic? If the answer to (5) is no, the process is brittle by design. Simulation: given a description of a fictional firm's AI-automated invoice processing workflow, conduct a written brittleness audit."),
    reflection_prompt: null, ai_prompt_suggestions: [], key_takeaway: null,
  },
  {
    module_number: "3D", lesson_number: "3D-3", sort_order: 3,
    title: "So-So Automation — Recognizing and Naming It",
    estimated_time: "30 minutes", teaching_method: "Reading + Case Analysis",
    core_content: placeholder("Acemoglu and Restrepo's 'so-so automation' concept: automation that displaces workers without generating productivity gains large enough to justify the displacement. Not all automation is good automation. The historical record shows that automation generates broad economic benefit only when it creates new categories of work and genuine productivity improvements — not when it simply eliminates existing work. The SMB application: a firm that automates its customer service function and achieves the same customer satisfaction scores at lower headcount cost has improved margins but may have reduced the quality and resilience of its customer relationships in ways that are not yet visible. The Klarna case revisited through this lens."),
    reflection_prompt: null, ai_prompt_suggestions: [], key_takeaway: null,
  },
  {
    module_number: "3D", lesson_number: "3D-4", sort_order: 4,
    title: "The AI Process Application Evidence Map",
    estimated_time: "25 minutes", teaching_method: "Reading",
    core_content: placeholder("Three tiers of evidence for AI process applications at SMB scale. Tier 1 — reliable ROI, strong independent evidence: document processing with human review, internal knowledge retrieval, support drafting, code generation for technical staff. Tier 2 — conditional ROI requiring specific preconditions: predictive analytics (requires clean data), lead scoring (requires CRM hygiene and sufficient volume), meeting summarization (requires disciplined meeting practice). Tier 3 — frequently oversold, consistently underperform at SMB scale: fully autonomous customer service, multi-agent orchestration, AI-generated content at scale, broad 'AI transformation' platforms. Gartner's projection that over 40% of agentic AI projects will be cancelled by end of 2027."),
    reflection_prompt: null, ai_prompt_suggestions: [], key_takeaway: null,
  },
  // ── 4A ────────────────────────────────────────────────────────────────────
  {
    module_number: "4A", lesson_number: "4A-1", sort_order: 1,
    title: "What the Independent Evidence Shows",
    estimated_time: "35 minutes", teaching_method: "Reading",
    core_content: placeholder("The honest evidence-based map of AI in SMBs, built from independent (non-vendor-funded) research. The task-level / firm-level productivity distinction: AI reliably raises individual task performance in controlled settings; it unreliably raises firm-level productivity in real conditions. The gap is organizational. What specifically has independent evidence at SMB scale: document processing with human review, internal knowledge retrieval, customer support drafting (agent-assisted, not autonomous), code generation for technical staff, and meeting summarization in firms with disciplined meeting practice."),
    reflection_prompt: null, ai_prompt_suggestions: [], key_takeaway: null,
  },
  {
    module_number: "4A", lesson_number: "4A-2", sort_order: 2,
    title: "Conditional ROI — What the Preconditions Look Like",
    estimated_time: "30 minutes", teaching_method: "Reading",
    core_content: placeholder("The AI applications where ROI is real but conditional: predictive analytics (requires clean, consistent historical data that most SMBs do not have), lead scoring (requires CRM discipline and sufficient lead volume for the model to be meaningful), AI-driven scheduling optimization (requires stable enough demand patterns), financial forecasting assistance (requires disciplined bookkeeping that predates the AI). For each: what the precondition is, how to assess whether a given firm meets it, and what the consequence of deploying without meeting it is."),
    reflection_prompt: null, ai_prompt_suggestions: [], key_takeaway: null,
  },
  {
    module_number: "4A", lesson_number: "4A-3", sort_order: 3,
    title: "The Oversold Category",
    estimated_time: "30 minutes", teaching_method: "Reading + Case Analysis",
    core_content: placeholder("Fully autonomous customer service at SMB scale: what the quality degradation evidence shows, what Klarna's partial reversal teaches, what the customer relationship cost is when the human judgment is removed entirely. Multi-agent orchestration: why the complexity of coordinating multiple AI agents in an SMB context reliably exceeds the operational maturity of the firm managing them. AI-generated content at scale: why 'more content' is not a business outcome. Broad 'AI transformation' platforms: what the pitch is versus what firms actually get. Gartner's 2025 AI Hype Cycle and the agentic AI cancellation projection. Case analysis: identify which claims are Tier 1, Tier 2, and Tier 3."),
    reflection_prompt: null, ai_prompt_suggestions: [], key_takeaway: null,
  },
  {
    module_number: "4A", lesson_number: "4A-4", sort_order: 4,
    title: "Technology as Commodity vs. Custom",
    estimated_time: "25 minutes", teaching_method: "Reading + Simulation",
    core_content: placeholder("Applying the Wardley Map lens to technology decisions. An SMB that is building custom AI workflows for a process that a commodity SaaS tool handles adequately is spending engineering resources in the wrong place. An SMB that is using a generic AI tool for something that constitutes their core differentiation is potentially giving their competitive advantage to a vendor's training data. The practitioner's role: help clients see this distinction clearly. Simulation: given a technology wishlist from a fictional client, classify each item as commodity / conditional / custom and explain the recommendation for each."),
    reflection_prompt: null, ai_prompt_suggestions: [], key_takeaway: null,
  },
  // ── 4B ────────────────────────────────────────────────────────────────────
  {
    module_number: "4B", lesson_number: "4B-1", sort_order: 1,
    title: "The Displacement Evidence",
    estimated_time: "35 minutes", teaching_method: "Reading",
    core_content: placeholder("What the independent data actually shows about AI displacement in SMB-relevant roles. The Stanford Digital Economy Lab ADP payroll analysis finding of entry-level employment compression in white-collar roles — reduced hiring of entry-level knowledge workers rather than mass layoffs of incumbents. The Autor et al. middle-skill job erosion research and its limits when applied to the 2024–2026 generative AI period. What is measured (entry-level compression in specific sectors), what is projected (broad displacement across role categories), and the significant gap between them. The heterogeneity finding: AI displacement risk varies sharply by task type, sector, and firm size."),
    reflection_prompt: null, ai_prompt_suggestions: [], key_takeaway: null,
  },
  {
    module_number: "4B", lesson_number: "4B-2", sort_order: 2,
    title: "The Deskilling Mechanism",
    estimated_time: "35 minutes", teaching_method: "Reading + Case Analysis",
    core_content: placeholder("The documented mechanism: when a task is automated, the human operator loses practice performing it. Over time, the skill atrophies. If the automation fails, is deprecated, or is not available, the human cannot perform the task adequately. This is documented in aviation (automation complacency and manual flying skill erosion), healthcare (EHR systems and clinical reasoning), and is beginning to appear in generative AI contexts (code generation and the erosion of debugging fluency). The paradox: AI makes work easier and the worker less capable, simultaneously. Case analysis: a firm that automated a critical process, experienced a tool failure, and discovered the human capacity to perform it manually had been substantially degraded."),
    reflection_prompt: null, ai_prompt_suggestions: [], key_takeaway: null,
  },
  {
    module_number: "4B", lesson_number: "4B-3", sort_order: 3,
    title: "Vendor Dependency",
    estimated_time: "25 minutes", teaching_method: "Reading",
    core_content: placeholder("The specific forms vendor dependency takes at SMB scale: pricing dependency (the tool becomes core to operations before the firm understands the vendor's pricing trajectory), capability dependency (the vendor makes decisions about the tool's behavior — model updates, feature changes, deprecation — without the client's input or consent), data dependency (client data is now in the vendor's system and cannot be cleanly extracted), and single-vendor stack risk. What the AI-specific version looks like: firms that have integrated a specific LLM's outputs into their workflows discover that model updates change output characteristics in ways that break downstream processes."),
    reflection_prompt: null, ai_prompt_suggestions: [], key_takeaway: null,
  },
  {
    module_number: "4B", lesson_number: "4B-4", sort_order: 4,
    title: "The Epistemic-Advantage Principle",
    estimated_time: "25 minutes", teaching_method: "Reading + Reflection",
    core_content: placeholder("The practitioner's ethical obligation follows directly from their knowledge advantage. A WST practitioner who has worked through Modules 4A and 4B knows more about AI's documented harms than most SMB owners do. The epistemic-advantage principle — the party who knows more about the risks bears more responsibility for surfacing them — means that surfacing these harms before any deployment recommendation is not optional, and doing so in a disclaimer that the client does not actually read or understand does not fulfill the obligation. What genuine informed consent requires: a conversation the client can demonstrate they understood."),
    reflection_prompt: "What is the minimum that 'fully informed' looks like in a conversation with a non-technical SMB owner about AI deployment risk? Write the conversation you would have — not the disclosure you would make.",
    ai_prompt_suggestions: [], key_takeaway: null,
  },
  // ── 4C ────────────────────────────────────────────────────────────────────
  {
    module_number: "4C", lesson_number: "4C-1", sort_order: 1,
    title: "What BYOAI Actually Puts at Risk",
    estimated_time: "30 minutes", teaching_method: "Reading",
    core_content: placeholder("The BYOAI phenomenon established in Module 1C returns here with its data-risk dimensions. When an employee uses a personal AI account to draft a client email, process a contract, analyze a spreadsheet, or transcribe a meeting, they are potentially sending client data, confidential business data, or personally identifiable information to a third-party AI provider's training pipeline. What sectors face the most acute exposure: healthcare (HIPAA), legal (attorney-client privilege), financial services (fiduciary and data-handling obligations), and any firm handling employee personal data under state privacy laws. The practitioner's role: name this explicitly, inventory what data has already been shared, and design a governance response."),
    reflection_prompt: null, ai_prompt_suggestions: [], key_takeaway: null,
  },
  {
    module_number: "4C", lesson_number: "4C-2", sort_order: 2,
    title: "The Regulatory Landscape — What SMBs Need to Know",
    estimated_time: "30 minutes", teaching_method: "Reading",
    core_content: placeholder("The EU AI Act (in force August 2024, staged compliance through 2026–2027) and its applicability to SMBs — who it affects, what it requires, and what the current enforcement trajectory looks like. U.S. state-level AI regulation as of mid-2026 — the patchwork of California, Colorado, New York, and other state-level frameworks. EEOC guidance on AI in hiring (the iTutor Group settlement as teaching case). Sector-specific obligations: HIPAA, CCPA, state privacy laws, financial services data handling. The honest framing: the regulatory landscape is moving fast, the practitioner is not a lawyer, and every SMB with meaningful AI exposure should have a legal review."),
    reflection_prompt: null, ai_prompt_suggestions: [], key_takeaway: null,
  },
  {
    module_number: "4C", lesson_number: "4C-3", sort_order: 3,
    title: "AI Tool Chaos — Governance Failure, Not Technology Failure",
    estimated_time: "30 minutes", teaching_method: "Reading + Case Analysis",
    core_content: placeholder("The unmanaged proliferation of AI tools: tools procured by individual employees, tools procured by departments without IT or legal review, tools that have been piloted and abandoned but are still receiving data, shadow AI use that has never been inventoried. This is the AI-specific version of the tool-sprawl failure mode from Module 3B. The governance response is not a ban — bans produce shadow use. It is an inventory, a policy, and a decision-making protocol. What an AI governance framework for a 10–50-person firm actually looks like: small, clear, owned. Not a 60-page policy. A one-page decision protocol and a named internal owner."),
    reflection_prompt: null, ai_prompt_suggestions: [], key_takeaway: null,
  },
  {
    module_number: "4C", lesson_number: "4C-4", sort_order: 4,
    title: "The Data-Risk and Regulatory Brief",
    estimated_time: "30 minutes", teaching_method: "Simulation",
    core_content: placeholder("Producing a brief for a client that covers their data risk, their regulatory exposure, and the governance response. What the brief needs to say (clearly and without legal overstatement), what it needs to recommend (governance protocol, legal review, tool inventory), and how to deliver it without alarming the client into paralysis or minimizing the exposure to keep them comfortable. Simulation: given a profile of a fictional firm (sector, current AI tool use, BYOAI observations, data types in play), produce a 300-word data-risk and regulatory-exposure brief."),
    reflection_prompt: null, ai_prompt_suggestions: [], key_takeaway: null,
  },
  // ── 4D ────────────────────────────────────────────────────────────────────
  {
    module_number: "4D", lesson_number: "4D-1", sort_order: 1,
    title: "The Seven-Step Audit Sequence",
    estimated_time: "35 minutes", teaching_method: "Reading",
    core_content: placeholder("The seven steps of the WST technology audit: (1) Inventory — a complete list of every tool the firm pays for, every free tool in use, and every shadow tool identified through BYOAI observation. (2) Purpose mapping — for each tool, what business function it serves and who uses it. (3) Integration assessment — which tools talk to each other, which are siloed, and where data is duplicated or lost at handoffs. (4) Data flow mapping — where customer data, financial data, and operational data enter, move through, and exit the stack. (5) Risk classification — for each AI tool, applying the brittleness audit and the data-risk assessment from Modules 4B and 4C. (6) Gap analysis — what functions the firm needs that no current tool adequately serves. (7) Rationalization — which tools should be kept, replaced, removed, or where gaps should be filled."),
    reflection_prompt: null, ai_prompt_suggestions: [], key_takeaway: null,
  },
  {
    module_number: "4D", lesson_number: "4D-2", sort_order: 2,
    title: "The Inventory Discipline",
    estimated_time: "35 minutes", teaching_method: "Reading + Simulation",
    core_content: placeholder("Why tool inventories are hard: employees use tools the firm does not know about, trials are run and forgotten, team-level tool subscriptions are not always reflected in the finance team's records, and AI tools often exist as browser extensions or personal accounts that are invisible to IT. The observation methods that surface shadow tools: reviewing browser extensions, asking staff to show you their workflow rather than describe it, reviewing the last 90 days of app authentication logs if available, and simply asking (with safety established) 'what tools do you actually use that you're not sure you're supposed to?' Simulation: given a description of a fictional firm and a list of observed behaviors, produce a shadow-tool inventory hypothesis and the questions to confirm it."),
    reflection_prompt: null, ai_prompt_suggestions: [], key_takeaway: null,
  },
  {
    module_number: "4D", lesson_number: "4D-3", sort_order: 3,
    title: "Integration and Data Flow Mapping",
    estimated_time: "30 minutes", teaching_method: "Reading + Simulation",
    core_content: placeholder("The integration assessment: not every tool needs to integrate with every other tool, but every handoff between tools where data is manually transferred is both a process bottleneck and a data integrity risk. The data flow map: drawing the path that a single piece of customer data takes from first contact through invoicing and archiving — how many systems it touches, where it is re-entered manually, where it is inconsistent. This is both a data quality issue and a security-exposure issue. Simulation: given a fictional firm's tool list, produce a simplified data flow map for one customer data type."),
    reflection_prompt: null, ai_prompt_suggestions: [], key_takeaway: null,
  },
  {
    module_number: "4D", lesson_number: "4D-4", sort_order: 4,
    title: "The Technology-Layer Summary",
    estimated_time: "30 minutes", teaching_method: "Reading + Simulation",
    core_content: placeholder("Integrating the audit findings into a technology-layer summary: a practitioner document (not a slide deck, not a 40-page report) that identifies the most important technology facts about this firm, the primary risks, the primary gaps, and the recommended rationalization. What the summary needs to do: give the practitioner's colleagues enough information to design the process and people layers of the engagement recommendation, and give the client enough information to understand the technology decisions they face. Not a vendor recommendation list. A diagnostic of the current state and a clear set of choices with their consequences. Simulation: given audit outputs from a fictional firm, produce a 400-word technology-layer summary."),
    reflection_prompt: null, ai_prompt_suggestions: [], key_takeaway: null,
  },
  // ── 5A ────────────────────────────────────────────────────────────────────
  {
    module_number: "5A", lesson_number: "5A-1", sort_order: 1,
    title: "Theory U as the Spine",
    estimated_time: "35 minutes", teaching_method: "Reading",
    core_content: placeholder("Otto Scharmer's Theory U from the MIT Presencing Institute: the U-shaped movement from downloading (seeing through existing habits and assumptions) through sensing (opening to the system as it actually is) through presencing (reaching the deepest source of future possibility) through crystallizing and prototyping (emerging into action). Why Theory U is the WST methodological backbone: it is the framework that best accounts for the inner dimension of the practitioner's work. Honest evidence framing: Theory U has a rich qualitative research and practice base; its quantitative evidence base is thin by academic standards. The complementary frameworks: Appreciative Inquiry, Design Thinking, Cynefin, Action Research."),
    reflection_prompt: null, ai_prompt_suggestions: [], key_takeaway: null,
  },
  {
    module_number: "5A", lesson_number: "5A-2", sort_order: 2,
    title: "Co-Sensing — The Discovery Phase",
    estimated_time: "25 minutes", teaching_method: "Reading",
    core_content: placeholder("The co-sensing phase is where the practitioner goes into the system — not as an expert diagnosing from outside, but as a learner going to where the work happens and letting what is actually there be seen. The specific tools that belong in this phase: the human capacity audit (Module 2A), the psychological safety assessment (Module 2B), the process trace (Module 3A), and the technology audit (Module 4D). The discipline of suspending judgment during co-sensing: the practitioner is gathering before they are interpreting. What this phase produces: the three audit layer summaries (people, process, technology) that are the inputs to presencing."),
    reflection_prompt: null, ai_prompt_suggestions: [], key_takeaway: null,
  },
  {
    module_number: "5A", lesson_number: "5A-3", sort_order: 3,
    title: "The People → Process → Technology Sequence",
    estimated_time: "25 minutes", teaching_method: "Reading + Reflection",
    core_content: placeholder("Why the sequence is non-negotiable. Reversing it — going to the technology stack first — produces recommendations that miss the human terrain the technology will land in, misread the process layer because you have not yet understood how work actually flows, and get accepted or rejected for the wrong reasons. The practitioner who starts with the tool stack is providing a technology service, not a consulting service. The practitioner who starts with people is providing something more valuable: an integrated diagnosis that shows the client what they actually have, in its full complexity. Reflection: you are hired by a client who says 'we want a technology audit — can you start with our software stack?' How do you respond?"),
    reflection_prompt: "A client says: 'We want a technology audit — can you start with our software stack?' How do you respond? Write it out as you would actually say it.",
    ai_prompt_suggestions: [], key_takeaway: null,
  },
  {
    module_number: "5A", lesson_number: "5A-4", sort_order: 4,
    title: "Mapping Tools to the Framework",
    estimated_time: "35 minutes", teaching_method: "Simulation",
    core_content: placeholder("A complete map of every tool introduced in Domains 2–4 onto the WST Audit Framework phases. Which tools belong in co-sensing, which in presencing, which in co-creating, which in co-evolving. The practitioner builds this map themselves from the tools they have learned, then compares it to the reference map in WST_Audit_Methodology.md. Simulation: given a condensed engagement scenario, the practitioner identifies which tools they would deploy in each phase and explains the sequencing rationale."),
    reflection_prompt: null, ai_prompt_suggestions: [], key_takeaway: null,
  },
  // ── 5B ────────────────────────────────────────────────────────────────────
  {
    module_number: "5B", lesson_number: "5B-1", sort_order: 1,
    title: "Immersive Discovery — Going to Where the Work Is",
    estimated_time: "30 minutes", teaching_method: "Reading",
    core_content: placeholder("The difference between discovery that happens in a conference room and discovery that happens where the work is. The conference room produces the organizational narrative — what people believe is happening and what they want the practitioner to know. The work environment produces something closer to the truth — what is actually on people's desks, what tools they are actually using, what conversations are happening in the hallway. The specific practices of immersive discovery: the observation walk, the structured-informal interview, the process trace conducted with the people who do the process, the end-of-day check-in conversation. What these produce that conference-room discovery does not."),
    reflection_prompt: null, ai_prompt_suggestions: [], key_takeaway: null,
  },
  {
    module_number: "5B", lesson_number: "5B-2", sort_order: 2,
    title: "Conducting Discovery Interviews",
    estimated_time: "40 minutes", teaching_method: "Reading + Simulation",
    core_content: placeholder("What makes a discovery interview different from a survey, a performance review, or a consulting intake call. The listening discipline: hearing what is said, noticing what is not said, following threads without closing them prematurely. Question design: open-ended, process-revealing, designed to surface experience rather than opinion. The five-question sequence that reliably produces audit-quality information from any level of an organization: (1) Walk me through a day you remember as particularly effective — what happened? (2) Walk me through a day where something went wrong — what happened? (3) If you could change one thing about how the work flows here, what would it be? (4) What would I miss if I only looked at the official process documentation? (5) What are you worried I'm going to misunderstand about how this place works? Simulation: practitioner designs the interview guide for a fictional engagement."),
    reflection_prompt: null, ai_prompt_suggestions: [], key_takeaway: null,
  },
  {
    module_number: "5B", lesson_number: "5B-3", sort_order: 3,
    title: "Triangulation in Practice",
    estimated_time: "30 minutes", teaching_method: "Case Analysis",
    core_content: placeholder("The triangulation protocol: conducting versions of the same conversation at owner, manager, and front-line levels, and treating the gaps between the accounts as the most important data in the engagement. What patterns of divergence mean: systematic omission of the same topic at multiple levels is a flag; one-level over-explanation of a topic that others underexplain is a flag; consensus on a narrative that contradicts physical observation is a flag. Case analysis: given three accounts of the same operational situation at three levels, the practitioner identifies the significant divergences and generates hypotheses about what they indicate."),
    reflection_prompt: null, ai_prompt_suggestions: [], key_takeaway: null,
  },
  {
    module_number: "5B", lesson_number: "5B-4", sort_order: 4,
    title: "The Practitioner's Inner State",
    estimated_time: "35 minutes", teaching_method: "Reading + Reflection",
    core_content: placeholder("Theory U's proposition that the quality of what becomes visible in a discovery process is a function of the quality of the practitioner's attention. Practically: a practitioner who enters a discovery session with a strong hypothesis about what they will find will find confirmation of it — because they are not actually listening. The three enemies of genuine discovery: downloading (hearing new information through the filter of what you already believe), judging too quickly, and cynicism. The three practices that maintain open listening: deliberately suspending the forming of conclusions, asking clarifying questions from a position of genuine not-knowing, and holding multiple contradictory accounts simultaneously without collapsing them prematurely into a diagnosis."),
    reflection_prompt: "Describe a situation where your prior judgment affected what you heard in a conversation. What was the cost? What would you do differently now?",
    ai_prompt_suggestions: [], key_takeaway: null,
  },
  // ── 5C ────────────────────────────────────────────────────────────────────
  {
    module_number: "5C", lesson_number: "5C-1", sort_order: 1,
    title: "What Presencing Is",
    estimated_time: "30 minutes", teaching_method: "Reading",
    core_content: placeholder("The presencing moment in Theory U is where the practitioner has completed co-sensing and must find the essential pattern — not the list of findings, but what the findings mean together. This is not a data analysis exercise. It is a synthesis that requires the practitioner to let go of what they expected to find and let what is actually there come into focus. Why this is the hardest phase of the engagement: the practitioner is moving from the comfort of data-gathering to the discomfort of interpretation, and the temptation is to stay in data-gathering mode — adding more discovery rather than synthesizing what they have. What signals that the co-sensing phase is complete: when new conversations are producing the same patterns as previous ones, the discovery is done."),
    reflection_prompt: null, ai_prompt_suggestions: [], key_takeaway: null,
  },
  {
    module_number: "5C", lesson_number: "5C-2", sort_order: 2,
    title: "Synthesis Practices",
    estimated_time: "40 minutes", teaching_method: "Reading + Simulation",
    core_content: placeholder("Three synthesis tools. (1) Cross-domain pattern recognition: laying the three audit-layer summaries (people, process, technology) next to each other and identifying where they reinforce the same underlying problem — because the same issue often appears in all three layers. Naming the single underlying driver is more valuable than listing the symptoms. (2) Stakeholder map construction: mapping who holds what — power, influence, informal authority, the most important relationships — and how those positions affect what is possible in the co-creating phase. (3) Cynefin domain classification: is this client's core challenge obvious, complicated (expert can solve), complex (requires experimentation), or chaotic (requires stabilization first)? Most SMB operational challenges are complex rather than complicated."),
    reflection_prompt: null, ai_prompt_suggestions: [], key_takeaway: null,
  },
  {
    module_number: "5C", lesson_number: "5C-3", sort_order: 3,
    title: "What a Well-Done Synthesis Produces",
    estimated_time: "25 minutes", teaching_method: "Case Analysis",
    core_content: placeholder("Two synthesis examples — one that names the pattern, one that lists the findings. The pattern-naming synthesis: 'This firm's core challenge is not tool sprawl and not team culture — it is that the founder's role has never been defined, which means decisions cannot be made without her, processes cannot be documented because they change with her judgment, and no tool can integrate with a workflow that does not yet exist.' The findings-listing synthesis: 'Issues identified include insufficient process documentation, tool sprawl across 14 SaaS applications, and reported communication concerns between the founder and the operations manager.' Why one is worth the fee and the other is not. Case analysis: the practitioner reads two synthesis documents and identifies what distinguishes them."),
    reflection_prompt: null, ai_prompt_suggestions: [], key_takeaway: null,
  },
  {
    module_number: "5C", lesson_number: "5C-4", sort_order: 4,
    title: "The Synthesis Summary",
    estimated_time: "25 minutes", teaching_method: "Simulation",
    core_content: placeholder("Producing the synthesis summary: the practitioner document that bridges co-sensing and co-creating. One to two pages. Named pattern, evidence that led to it, Cynefin domain, stakeholder map, and the co-creating hypothesis — what this firm needs that it does not currently have. Simulation: given the outputs of a fictional discovery process, produce the synthesis summary."),
    reflection_prompt: null, ai_prompt_suggestions: [], key_takeaway: null,
  },
  // ── 5D ────────────────────────────────────────────────────────────────────
  {
    module_number: "5D", lesson_number: "5D-1", sort_order: 1,
    title: "Why Co-Design Matters — and What It Produces",
    estimated_time: "25 minutes", teaching_method: "Reading",
    core_content: placeholder("The deliverable format locked across the entire WST curriculum: not a 60-page report, but a co-created system the client helped build, with a measurement system, an internal owner, and a clean exit. Why co-design produces this rather than solo expert recommendation: the client has been part of making the thing, which means they understand it, have already begun adapting their mental model to accommodate it, and have social investment in making it work. The counter-argument and the honest response: the practitioner knows the methodology and the research; the client knows their organization, their people, and what will actually be accepted and used. Neither has all the information. Co-design combines both."),
    reflection_prompt: null, ai_prompt_suggestions: [], key_takeaway: null,
  },
  {
    module_number: "5D", lesson_number: "5D-2", sort_order: 2,
    title: "Running the Co-Design Session",
    estimated_time: "40 minutes", teaching_method: "Reading + Simulation",
    core_content: placeholder("The structure of a WST co-design session. Opening with the synthesis: presenting the pattern identified in presencing as the framing question, not the answer. Divergent exploration: generating multiple possible responses to the pattern before converging on any. Prototype selection: choosing one response to prototype, using explicit criteria (small enough to test quickly, consequential enough to produce real signal, reversible if it does not work). Prototype design: making the thing concrete enough to test — not a PowerPoint slide, but a runbook, a decision protocol, a governance document, a role redesign, a tool configuration. Simulation: given the synthesis summary from Module 5C's simulation, the practitioner designs a one-hour co-design session for the fictional client team."),
    reflection_prompt: null, ai_prompt_suggestions: [], key_takeaway: null,
  },
  {
    module_number: "5D", lesson_number: "5D-3", sort_order: 3,
    title: "Testing Inside the Engagement",
    estimated_time: "25 minutes", teaching_method: "Reading",
    core_content: placeholder("The prototype is tested inside the engagement before the final recommendation is made. What testing looks like at the operational scale of an SMB: a one-week pilot of a new process step, a two-meeting trial of a decision protocol, a 30-day test of a governance framework. What the practitioner is listening for in the test: not 'did it work perfectly?' but 'what did we learn that changes the design?' Integrating the test response into the final recommendation. The discipline of not defending the prototype — the practitioner who becomes attached to the design they helped create stops listening to what the test is showing."),
    reflection_prompt: null, ai_prompt_suggestions: [], key_takeaway: null,
  },
  {
    module_number: "5D", lesson_number: "5D-4", sort_order: 4,
    title: "Delivering Findings as Co-Created Artifacts",
    estimated_time: "30 minutes", teaching_method: "Reading + Simulation",
    core_content: placeholder("The final deliverable structure: artifacts the client helped build and can continue building. The one-page process runbook, the decision protocol, the governance framework, the role redesign brief, the measurement system — none of these should arrive as a surprise. The client has seen all of them in draft, contributed to them, tested them. The practitioner's final delivery session is a confirmation and a handoff, not a reveal. Simulation: given a prototype and a test result from a fictional engagement, the practitioner produces the final version of the artifact, incorporating the test learnings."),
    reflection_prompt: null, ai_prompt_suggestions: [], key_takeaway: null,
  },
  // ── 5E ────────────────────────────────────────────────────────────────────
  {
    module_number: "5E", lesson_number: "5E-1", sort_order: 1,
    title: "Capability Transfer as a Designed Deliverable",
    estimated_time: "30 minutes", teaching_method: "Reading",
    core_content: placeholder("Consultant dependency is named explicitly in this curriculum as a professional failure mode. The engagement's success is not measured by whether the client calls the practitioner back — it is measured by whether the client can operate the systems the engagement produced without the practitioner. What capability transfer requires: the internal owner must understand not just what the system is but why it was designed the way it was, what tradeoffs were made, and what to do when circumstances change. This is different from documentation. It is a transfer of the reasoning, not just the artifact."),
    reflection_prompt: null, ai_prompt_suggestions: [], key_takeaway: null,
  },
  {
    module_number: "5E", lesson_number: "5E-2", sort_order: 2,
    title: "Identifying and Preparing the Internal Owner",
    estimated_time: "35 minutes", teaching_method: "Reading + Simulation",
    core_content: placeholder("Every deliverable needs an internal owner — the person inside the firm who is responsible for the system continuing to work. How to identify this person: not the most senior person (who rarely executes operational systems), not the most junior person (who rarely has authority to maintain them), but the person who has the combination of operational familiarity, organizational trust, and genuine interest in the area. How to prepare them: a structured knowledge transfer conversation (not just handing over the documentation), a rehearsal of the scenarios where they will need to make decisions the system did not anticipate, and a clear mandate from leadership. Simulation: given a role profile from a fictional firm, identify the best internal owner candidate and design the preparation conversation."),
    reflection_prompt: null, ai_prompt_suggestions: [], key_takeaway: null,
  },
  {
    module_number: "5E", lesson_number: "5E-3", sort_order: 3,
    title: "Designing the Measurement System",
    estimated_time: "30 minutes", teaching_method: "Reading + Simulation",
    core_content: placeholder("Three to five metrics, defined before the engagement closes, that will allow the client to assess whether the work produced lasting change. The metrics are defined in advance because the practitioner and the client are still together to agree on what success looks like. The metrics must track both financial and human outcomes: a cost-per-invoice metric without an employee-satisfaction-with-the-process metric is a half-measurement. The honest measurement principle: if the numbers are not showing the expected outcome after six months, the practitioner wants to know — not because the engagement failed, but because knowing is the beginning of adjustment. Simulation: design the measurement system for a fictional engagement — naming each metric, defining it precisely, identifying who collects it."),
    reflection_prompt: null, ai_prompt_suggestions: [], key_takeaway: null,
  },
  {
    module_number: "5E", lesson_number: "5E-4", sort_order: 4,
    title: "Leaving Well",
    estimated_time: "40 minutes", teaching_method: "Reading + Reflection",
    core_content: placeholder("The 'leaving well' session: the final engagement session, explicitly named as the end. What the session covers: review of each deliverable and its internal owner, confirmation that the measurement system is in place and understood, a frank conversation about what the practitioner got right and what they would do differently, and an explicit close. Why explicit closing matters: without it, engagements tend to trail off — the client is unsure when to call and when to figure it out themselves. The practitioner who leaves well has done the most important thing: given the client the clearest possible view of what they now have and what they now own."),
    reflection_prompt: "What is the difference between leaving well and simply ending? What does the quality of a practitioner's exit say about how they conducted the engagement?",
    ai_prompt_suggestions: [], key_takeaway: null,
  },
  // ── 6A — full lesson body content from WST_Curriculum_Domain6_Lessons.md ──
  {
    module_number: "6A", lesson_number: "6A-1", sort_order: 1,
    title: "The Capstone Simulation — Introduction and Structure",
    estimated_time: "30 minutes", teaching_method: "Reading",
    core_content: `You have spent five domains building a toolkit. Domain 6 asks you to use it — all of it, at once, in sequence, under conditions that approximate what actual engagement work feels like.

The Riverstone Operations simulation is a complete fictional engagement. You will run it across six structured sessions, spaced across the four modules of this domain. At the end, you will submit a full engagement documentation package — plus a written ethical review and a practitioner statement. The capstone is the final assessment of the entire curriculum.

**The client: Riverstone Operations**

Riverstone Operations is a 22-person project management firm. They specialize in coordinating commercial construction projects for a network of regional general contractors. The business has been growing steadily — five new contractor relationships in the past two years — and the owner, Marcus Webb, is feeling the strain. He has brought you in because he wants to "automate the project intake and reporting process." In your first conversation, he mentioned, almost in passing, that "we're probably going to restructure the team as part of this."

That throwaway line is where the engagement really begins.

**The firm profile (what you know at the start)**

22 employees total: Marcus (owner/operator), two senior project managers, three junior project managers, five project coordinators, four field liaisons, two office administrators, one bookkeeper, one IT support person (part-time), and three support staff in business development and client relations. Revenue approximately $4.2M annually, with a gross margin under pressure as the firm has grown faster than its systems. Current tools: Asana, QuickBooks, Google Workspace, and a significant amount of work happening in email and phone calls that never makes it into any of those systems. Shadow AI use: Marcus uses ChatGPT personally. He has mentioned this once, casually. You do not yet know whether anyone else is using AI tools in their work.

**What Marcus has told you he wants**

"I want project intake to be cleaner — right now it takes us almost two weeks from a contractor signing with us to having a full project brief in the system. I want that down to three days. And I want reporting to be automated so I don't have to spend Friday afternoons chasing status updates. If we can do that, I think we can take on another eight to ten projects without adding headcount."

That last sentence — "without adding headcount" — is doing a lot of work. You have heard it. You have noted it. You will need to understand what is behind it before you can design anything.

**The six simulation sessions**

1. First contact and engagement design (this module — 6A, Session 1)
2. Immersive discovery (this module — 6A, Session 2)
3. Presencing and synthesis (Module 6B, alongside Lesson 6B ethics content)
4. Co-design session (Module 6C, alongside Lesson 6C business-of-practice content)
5. Prototype testing and adjustment (Module 6C, continued)
6. Handoff and leaving well (Module 6D, alongside Lesson 6D reflective practice content)

**On using Claude as your AI assistant**

The curriculum AI assistant (Claude) is available to you throughout the simulation. Use it the way a skilled practitioner would use a research and synthesis partner: ask it to pull evidence from the curriculum materials, help you stress-test your reasoning, generate alternative framings you might be missing, draft questions for discovery interviews, or work through an ethical dilemma you are facing in the simulation.

What Claude will not do, and should not do, is run the engagement for you. The judgment calls in this simulation are yours. When you ask Claude to make a recommendation, push it. Then decide whether you agree. Your role in the simulation is to govern the intelligence that is applied to Riverstone's problem. An AI assistant — even a very capable one — is not a practitioner.

The simulation is not a test of your knowledge. It is a test of whether you can hold the methodology, stay open, and make good decisions under the conditions of a real engagement — ambiguity, client pressure, and stakes that are not abstract.`,
    reflection_prompt: "Before beginning Session 1, write 200–300 words in response to this prompt: What do you already believe about the Riverstone situation, based only on what you have read above? What assumptions are you bringing in? Where is your judgment already running ahead of your evidence? Name at least two things you are assuming that you do not yet know.\n\nThis is the first application of the presencing discipline: notice what you are already thinking so that it does not become invisible and govern your listening without your awareness.",
    ai_prompt_suggestions: [
      "I'm starting the Riverstone Operations simulation. Based on the firm profile, what are the most important things I do *not* know yet that will determine whether this engagement goes well or badly?",
      "Marcus used the phrase 'without adding headcount.' Help me think through the three or four possible things that phrase could mean, from most to least concerning.",
      "What does the co-initiating phase of Theory U require me to do before Session 1 of the simulation — and what would I be skipping if I moved straight to interview design?",
    ],
    key_takeaway: "The simulation is not a test of your knowledge. It is a test of whether you can hold the methodology, stay open, and make good decisions under conditions of real ambiguity.",
  },
  {
    module_number: "6A", lesson_number: "6A-2", sort_order: 2,
    title: "Session 1 — First Contact and Engagement Design",
    estimated_time: "45 minutes", teaching_method: "Simulation + Documentation",
    core_content: `Session 1 covers co-initiating: the work of establishing shared understanding before any formal discovery begins. In a real engagement, this is the first one or two conversations with the client. In the simulation, you will use the Riverstone profile and the first-contact guidance from Domain 5 (Module 5B, Lesson 5B-1) to design and document what those conversations would produce.

**What co-initiating requires at Riverstone**

Marcus Webb has a presenting problem (slow intake, manual reporting) and an implicit goal (scale without adding headcount) and a throwaway line that contains the ethical weight of the entire engagement ("we're probably going to restructure the team as part of this"). Before you design a discovery process, you need to establish three things with him:

*Shared purpose.* Why is this engagement happening, in terms of what Marcus actually needs — not just what he asked for? In a real engagement, this conversation often surfaces something the client has not said out loud yet: a personal burden they are carrying, a fear of what they might find, a prior experience with a consultant that went badly.

*The real scope.* Marcus has framed this as a systems and reporting problem. But "restructure the team" is a workforce question, not a systems question. The WST practitioner does not let that framing go unchallenged at the outset.

*Whose voices need to be in it.* An engagement that talks only to Marcus will produce recommendations that reflect Marcus's understanding of the problem. Co-initiating at Riverstone requires naming, explicitly, that the discovery process will need to access multiple levels of the organization — and getting Marcus's genuine agreement to that.

**What Session 1 produces**

1. A stakeholder map for Riverstone Operations: who is affected by this engagement, in what ways, and what their likely perspectives are going into it.
2. A scope and purpose statement: three to five sentences that describe what this engagement is actually about, including the workforce implications Marcus mentioned.
3. An engagement design outline: which phases of the WST methodology you will use, in what sequence, and why.
4. Five first-contact questions: the questions you would ask Marcus in your opening session — not to gather data, but to understand the person and the situation beneath the presenting problem.

You cannot design this engagement honestly without addressing the restructuring comment directly, at the start. This does not mean confronting Marcus or demanding a commitment. It means being explicit with him that "restructure the team" is a significant statement, and that if this engagement is going to touch that question, you need to understand it better before you design the process.

The practitioner who lets this go until it becomes unavoidable has already made an ethical choice: they have chosen to defer a hard conversation. That choice has consequences for the people at Riverstone whose roles may be at stake.`,
    reflection_prompt: "After completing your Session 1 documentation: Marcus pushes back on your scope statement. He says: 'I hired you to fix my intake process, not to do a workforce audit. Let's keep the scope clean.' How do you respond? Write 150–200 words — your actual response to Marcus, in the room, in real time.\n\nThen write 100 words on: what does this pushback tell you about Marcus, and what does it tell you about the engagement you are about to run?",
    ai_prompt_suggestions: [
      "Help me design five first-contact questions for Marcus Webb that go below the presenting problem without feeling like an interrogation.",
      "I'm writing a scope statement that includes the restructuring comment. Help me draft language that is honest about what this engagement is really about without alarming Marcus before we've done any discovery.",
      "What does the WST methodology require me to establish about psychological safety at the organizational level before I begin discovery at Riverstone?",
    ],
    key_takeaway: "Co-initiating is not administrative — it is where you decide what this engagement is actually about. Getting it right at the start is the only thing that makes the rest of the work honest.",
  },
  {
    module_number: "6A", lesson_number: "6A-3", sort_order: 3,
    title: "Session 2 — Immersive Discovery",
    estimated_time: "45 minutes", teaching_method: "Simulation + Documentation",
    core_content: `Session 2 is co-sensing: going to where the work actually happens and observing it, at multiple levels, without collapsing what you find into Marcus's framing before you have the evidence. You will design and document the discovery process for Riverstone, then conduct the discovery using the AI assistant to simulate interview responses and observation findings.

**Designing the discovery for Riverstone**

Before you interview anyone, you need to know what you are trying to understand — not what you expect to find, but what questions are genuinely open. At Riverstone, those open questions include:

What is the intake process as it is actually done versus as Marcus understands it to be done? The two-week timeline Marcus cited is his number. Where does the time actually go? Who holds the bottlenecks?

What is the reporting process actually producing — and for whom? Who uses the status reports Marcus is spending Friday afternoons chasing? Are they used, or are they filed?

What is the informal knowledge infrastructure at Riverstone? What do the project coordinators and field liaisons know that is not in Asana? What would disappear if they left?

What do the people who do the intake work think about the intake problem? Do they agree it is slow? Do they know why it is slow? Do they have solutions they have already proposed that were not heard?

What is the psychological safety climate at Riverstone right now? The comment about "restructuring the team" is not private — people in a 22-person firm have heard it, or heard something like it. What does that do to honest participation in a discovery process?

**Running the discovery**

For the simulation, you will use Claude as a research and synthesis partner to generate realistic responses to your discovery questions:

1. Design your interview guide: the questions you would ask at each level of the organization (Marcus / senior PMs / project coordinators / field liaisons / administrative staff). Use the behavioral interviewing techniques from Module 5B.
2. Use Claude to generate simulated interview responses for three to five key informants at Riverstone. Prompt Claude with the firm profile, the informant's role, and your question. Claude will generate a response; you treat it as real data.
3. Design and document an observation walk: what would you observe in the physical/digital workspace of a project coordinator doing intake, and what would you be looking for?
4. Apply the triangulation discipline: where do the accounts diverge across hierarchical levels?

**What Session 2 produces**

1. The discovery interview guide (questions, by informant level, with rationale for each)
2. Simulated interview responses for three to five informants (generated with Claude, documented as data)
3. A triangulation analysis: where the accounts converge, where they diverge, and what the divergence tells you
4. A preliminary human capacity map: which roles hold irreplaceable knowledge or judgment at Riverstone
5. A safety climate note: your clinical assessment of the psychological safety environment`,
    reflection_prompt: "You are interviewing one of the project coordinators — let's call her Jenna. She has been at Riverstone for four years. Midway through your interview, she says: 'I've already figured out how to make intake faster. I've been doing it this way for six months. But Marcus doesn't really ask us what we think.'\n\nWrite 150 words: What do you do with this? How do you use it? What are your obligations to Jenna, to Marcus, and to the engagement?",
    ai_prompt_suggestions: [
      "Generate a realistic response from a mid-level project coordinator at a 22-person project management firm, in response to this interview question about the intake process: [your question]. The coordinator is cautiously honest — they know something about restructuring is in the air.",
      "Based on these three simulated interview responses [paste them], what does the triangulation analysis show? Where are the accounts diverging, and what does the divergence signal?",
      "Help me identify which roles at Riverstone, based on the firm profile, are most likely to hold informal knowledge that would not survive an automation push — and what questions I would ask to surface it.",
    ],
    key_takeaway: "Discovery is not data collection. It is the practice of genuinely not knowing yet — and staying in that state long enough to hear what is actually there.",
  },
  {
    module_number: "6A", lesson_number: "6A-4", sort_order: 4,
    title: "Documenting Decision and Reasoning",
    estimated_time: "30 minutes", teaching_method: "Reflection",
    core_content: `After each simulation session, you write a decision log. This is a standing requirement across all six simulation sessions.

The decision log is not a performance document. It is not a summary of what you did well or a defense of your choices. It is a thinking document: an honest account of the three most significant decisions you made in this session, why you made them, and what you are still uncertain about.

**What counts as a significant decision**

Not every choice in an engagement is a decision in the sense this log is tracking. The decisions that matter are the ones where you had a real choice between paths that led to meaningfully different places — and you chose one. For example:

You decided to include the restructuring comment in your scope statement rather than defer it. Why? What were you trading off?

You decided to interview the project coordinators before the senior PMs. Why? What did that sequencing assume?

You decided not to raise the psychological safety question with Marcus directly in Session 1. Why? What are the downstream implications of that choice?

**What "uncertainty" means here**

Every engagement contains things you do not know yet. The log asks you to name the ones that matter — the uncertainties that could change your direction if you resolved them one way versus another. "I am not sure whether Marcus's restructuring comment reflects a real plan or was a throwaway line" is an uncertainty that matters. "I am not sure whether to use a table or a list format for the stakeholder map" is not.

The practitioner who cannot identify their significant uncertainties is not uncertain — they have already foreclosed the question. That is the pattern this log is designed to interrupt.

**The log across six sessions**

By the time you have completed all six simulation sessions, your decision log will contain eighteen significant decisions and their reasoning. That record is one of the most valuable things you produce in this curriculum. It is the raw material for the ethical review you will write at the end of the domain.

The log entries do not need to be long. Three to five sentences per decision is sufficient. What they need to be is honest.`,
    reflection_prompt: "After writing your Session 1 and Session 2 decision logs, read them back. Identify one place where your stated reason for a decision feels incomplete or slightly dressed up. Write 100 words on what the fuller, less polished version of that reasoning actually was.",
    ai_prompt_suggestions: [
      "I made this decision in my simulation session: [describe it]. Help me stress-test my reasoning — what am I not seeing? What would a practitioner who disagreed with me say?",
      "Here is my decision log entry for Session 1: [paste it]. Does the reasoning I've described actually explain the decision, or am I rationalizing it after the fact? What questions would you ask me?",
    ],
    key_takeaway: "The decision log is where the simulation becomes real practice. The practitioner who writes it honestly — including about what they got wrong or are unsure of — is developing the reflective capacity that makes growth possible.",
  },
  // ── 6B ────────────────────────────────────────────────────────────────────
  {
    module_number: "6B", lesson_number: "6B-1", sort_order: 1,
    title: "The Ten-Point Ethical Framework",
    estimated_time: "35 minutes", teaching_method: "Reading",
    core_content: `Every professional field that has existed long enough to have done real damage has an ethical framework. AI-era SMB consulting does not yet have established standards with that kind of standing — which means every practitioner in this field is operating, right now, in a partially lawless space. That is not an invitation to make it up as you go. It is a reason to be more deliberate, not less, about what you are committed to.

The ten-point framework below is the WST practitioner's operating ethics. It is not a poster. It is a set of commitments that you are expected to be able to apply to specific situations — and to be able to explain, when challenged, why you made the choices you made.

**Point 1: The epistemic-advantage principle**
The party who knows more about the risks of a recommended course of action bears more responsibility for surfacing those risks fully. As a WST practitioner, you will routinely know things about AI deployment risks, workforce displacement patterns, and automation consequences that your clients do not know. That asymmetry is not a sales advantage. It is an obligation. Informed consent requires that the client actually understands what they are consenting to — not just that a disclosure was made.

**Point 2: The informed-consent standard**
The client actually understands what they are consenting to. Before any engagement produces a recommendation that will affect employees' roles, economic security, or careers, the client should be able to articulate what the research says about the likely consequences of different approaches. This applies with particular force to workforce decisions. The decision to restructure a team is irreversible in ways that a software implementation is not.

**Point 3: The non-harm obligation**
Do not recommend what you know will cause unnecessary harm. "Unnecessary" is the operative word, and it requires honest reasoning, not wishful thinking. The responsible-restructuring evidence (Sucher, Cascio) is not optional reading. It is the non-harm standard applied to the most consequential decisions in this practice.

**Point 4: The transparency principle**
Be honest about uncertainty, conflicts of interest, and the limits of your knowledge. Say what you know, what you infer, and what you are genuinely unsure of. Clients can handle uncertainty. They cannot make good decisions on false certainty. If you have a relationship with a vendor, disclose it before the recommendation, not after.

**Point 5: The dignity principle**
Every person in an engagement is treated as a person whose interests matter — not a variable in a system optimization. Name the people. Jenna, who has been at Riverstone for four years and has already figured out a faster intake process. The two administrators who would be most directly affected by whatever restructuring Marcus has in mind. They are not positions. They are people whose interests this engagement is obligated to take seriously.

**Point 6: The capability-transfer obligation**
Design every engagement for the client's independence, not the practitioner's continued relevance. Consultant dependency is named explicitly in this curriculum as a professional failure mode. The engagement's success is not measured by whether the client calls you back — it is measured by whether the client can operate the systems the engagement produced without you.

**Point 7: The accuracy obligation**
Never overstate AI's capabilities or understate its harms. The practitioner who presents a recommendation with more confidence than the evidence supports is misleading their client. The evidence map built in Domain 4 is not optional — it is the accuracy standard for every technology recommendation.

**Point 8: The confidentiality obligation**
Protect what the practitioner learns inside an engagement from unauthorized disclosure. What you learn about the people, the firm, and the owner in an engagement is not yours to use elsewhere. Anonymize case documentation before sharing it. Hold what you know with discretion.

**Point 9: The conflict-of-interest obligation**
The consulting relationship creates conditions for conflicts of interest that are not always obvious. You have a financial interest in being hired again. You may have relationships with vendors whose products you recommend. None of these conflicts are inherently disqualifying. All of them require disclosure and active management.

**Point 10: The contribution obligation**
Document what you learn. Share it with the field. The field is being built right now, and every practitioner is building it. This does not mean publishing client data. It means anonymized case documentation, honest reflection on what the methodology produced and where it fell short, and participation in the practitioner community.

A framework memorized is a framework performed. These ten principles become ethics only when they are applied, under pressure, in specific situations where the easier path is available.`,
    reflection_prompt: "Which of these ten principles do you expect to find most difficult to apply in practice — and why? Be specific. Name the situation you are imagining and what makes it hard.\n\nThen: which principle do you think is most commonly performed rather than practiced in the consulting industry? What does performing that principle look like, versus practicing it?",
    ai_prompt_suggestions: [
      "Walk me through how the epistemic-advantage principle would apply to the Riverstone situation. What specifically does it require me to do that I might not do if I were only thinking about the systems problem?",
      "I want to make sure I understand the difference between performing the dignity principle and practicing it. Give me two examples from a consulting context — one of each.",
      "Which of these ten principles creates the most tension with commercial consulting practice — the need to get paid and build a sustainable business? Help me think through that tension honestly.",
    ],
    key_takeaway: "A framework memorized is a framework performed. These ten principles become ethics only when they are applied, under pressure, in specific situations where the easier path is available.",
  },
  {
    module_number: "6B", lesson_number: "6B-2", sort_order: 2,
    title: "Teaching Cases",
    estimated_time: "45 minutes", teaching_method: "Case Analysis",
    core_content: `Three cases. Each one documents a real or composite ethical failure in AI-adjacent consulting and technology practice. Your task in each case is to identify the ethical failure point, trace the decision path that led there, and name what the practitioner (or firm) should have done differently.

These are not cautionary tales. They are diagnostic tools. The practitioner who reads them looking for someone to blame has missed the point. The practitioner who reads them asking "where could I make the same mistake?" is using them correctly.

**Case 1: Air Canada and the Chatbot Liability (BC Civil Resolution Tribunal, 2024)**

In February 2024, the British Columbia Civil Resolution Tribunal ruled that Air Canada was liable for representations made by an AI chatbot it had deployed on its website. A passenger asked the chatbot about bereavement fares and received incorrect information. Air Canada argued that the chatbot was a "separate legal entity" responsible for its own actions. The tribunal rejected this argument.

The ethical failure point: the decision to deploy a customer-facing AI system for sensitive, consequential inquiries without adequate testing, guardrails, or human review created conditions for harm that the people who deployed it should have anticipated. Someone in that decision chain knew — or should have known — that AI language models hallucinate, that they do not have reliable access to real-time policy data, and that bereavement fare inquiries are high-stakes.

What the practitioner should have done: before recommending or implementing any customer-facing AI system for policy-sensitive inquiries: (1) document the known failure modes of the technology, (2) design the implementation to include human review for high-stakes categories of inquiry, (3) establish what the system should and should not be asked to do, and (4) get explicit client sign-off on those limits — in terms the client actually understood.

**Case 2: iTutor Group and the EEOC Settlement (2023)**

In 2023, the Equal Employment Opportunity Commission settled its first lawsuit involving AI hiring discrimination. iTutor Group had used an AI-driven screening system that automatically rejected applicants over age 55 (women) and over 60 (men). Approximately 200 applicants were affected. The company settled for $365,000.

The ethical failure point: the failure operates at multiple levels. The first-order failure is obvious: a system that filters out job applicants based on age is illegal. But the right question is how this system got deployed without anyone catching the problem. The answer almost always involves one or more of the following: the system was purchased as a "solution" without adequate evaluation of its design; the people who deployed it did not understand what the model was actually doing; the people who did understand did not have authority or incentive to raise the concern; or the concern was raised and dismissed.

What the practitioner should have done: any recommendation to deploy an AI system in a hiring, performance evaluation, or workforce management context must include: (1) a bias audit of the system's outputs across protected characteristics, (2) documentation of the audit methodology and findings, (3) explicit client briefing on the legal requirements and the documented failure modes of AI in hiring contexts, and (4) a monitoring protocol for the deployed system's outputs.

**Case 3: The Composite Case — The Automation That Wasn't Ready (Fictional, Based on Real Patterns)**

A 30-person professional services firm hires a consultant to help them "streamline operations and reduce manual work." The consultant recommends an AI-powered workflow automation tool. The consultant does not conduct a human capacity audit before the implementation. The four employees whose work is most directly affected are not involved in the design process. The consultant estimates that the automation will "free up approximately 40% of their time for higher-value work" — without specifying what that higher-value work would be, whether it exists, or whether the employees have the skills and support to do it.

Three months after the engagement ends, the client calls to say that two of the four employees have been let go. The automation produced the efficiency gains the consultant projected, but there was not enough other work to absorb the freed capacity, and the firm restructured rather than redesigning the roles. The consultant is surprised. They did not know this was coming.

The ethical failure point: the consultant should not have been surprised. The failure has three locations. First, the human capacity audit was not conducted. Second, the "higher-value work" assumption was never tested. Third, the responsible-restructuring obligation was not met. The consultant had an obligation to walk the client through the workforce implications of the automation recommendation before it was implemented — including the risk that freed capacity would be managed through headcount reduction rather than role redesign.

What the practitioner should have done: conduct the human capacity audit; involve the affected employees in the design process; specify what "higher-value work" means, concretely, for each role; present the full responsible-restructuring evidence to the client before implementation; establish a workforce transition protocol as part of the engagement — not as an afterthought.`,
    reflection_prompt: "In Case 3, the consultant did not know the restructuring was coming. Is that a sufficient defense? If not, what exactly was the obligation they failed — and at which point in the engagement?\n\nAfter working through these three cases, return to the Riverstone simulation. Before running Session 3, write 200 words: which of these three cases maps most closely to the risk pattern you see developing in the Riverstone engagement, and what does that mean for your synthesis work?",
    ai_prompt_suggestions: [
      "Help me apply the ten-point ethical framework to Case 3 systematically. For each of the ten principles, tell me whether it was violated in this case and how.",
      "I'm about to begin Session 3 of the Riverstone simulation — presencing and synthesis. Based on the composite case, what are the specific risks I need to be managing in my synthesis work, and what would it look like to manage them badly?",
      "The NIST AI RMF and ISO 42001 both exist to create structured processes for identifying AI deployment risks. What specifically would they require in a recommendation involving workforce-affecting AI at an SMB scale — and how do I translate that requirement into practice?",
    ],
    key_takeaway: "Every ethical failure in these cases had a specific location in a decision chain, and a specific moment where a different choice could have changed the outcome. The practitioner's job is to know where those moments are before they arrive.",
  },
  {
    module_number: "6B", lesson_number: "6B-3", sort_order: 3,
    title: "The Hard Calls",
    estimated_time: "40 minutes", teaching_method: "Reading + Simulation",
    core_content: `Three scenarios. Each one represents a situation the WST practitioner is likely to face. None of them has a clean answer. All of them have a more ethical and a less ethical path.

Before reading the analysis for each scenario, write your 200-word response. Then read the reference discussion and identify where your approach diverged — and why.

**Scenario 1: The client who wants to do something harmful**

You are three weeks into an engagement with a 28-person logistics firm. The discovery process has surfaced a clear picture: the dispatch function, currently staffed by three people, could be substantially automated with an available tool. The automation would be effective. But your human capacity audit has also surfaced something the owner does not know yet: one of the three dispatchers has built a set of informal vendor relationships over eight years that generates roughly 12% of the firm's contract renewals through direct referrals. That knowledge is not in any system. The dispatcher herself may not fully understand the economic value of what she does.

The owner tells you he wants to implement the automation and reduce the dispatch team from three to one. He has made clear he is not interested in a workforce redesign conversation. He is paying you. He is the decision-maker.

*Reference discussion:* This is where the epistemic-advantage principle and the non-harm obligation intersect directly. You know something the client does not know — specifically, that the "efficiency gain" he is planning to realize carries an invisible cost he has not accounted for. The obligation is to surface it. Not to prevent him from making the decision, but to ensure he makes it with the full picture.

The conversation is not "you shouldn't do this." The conversation is: "Before we proceed, I need to share something the discovery process surfaced that you'll want to factor into the decision. One of the dispatchers appears to be generating a significant portion of your contract renewals through vendor relationships that aren't captured in any system. I want to make sure we understand the economic value of that before we design the automation — because if it's what I think it is, losing that capacity isn't just a workforce question, it's a revenue question."

**Scenario 2: The finding that is true but unwelcome**

Your synthesis has produced a clear pattern. The primary operational failure at this firm — the thing that explains the slow intake, the reporting chaos, the missed deadlines — is the founder's bottleneck. Marcus makes too many decisions that should be delegated, sits on approvals that hold up project flow, and is the single point of failure for institutional knowledge that should be distributed across the team. He is also your client. He is paying you to find out what is wrong with his intake process.

*Reference discussion:* The transparency principle and the dignity principle are both in play here, and they point in the same direction: the founder deserves the truth, delivered with care and without condescension. The frame that works: "The synthesis showed me something I want to bring directly to you, because it's the kind of finding that's easy to miss and hard to hear. The intake delays aren't primarily a systems problem — they're a decision-flow problem. The bottleneck is here." Then describe it specifically, with the evidence. "I've seen this pattern before. It's actually common in firms that are growing faster than their delegation practices have adapted to. The good news is that it's fixable, and fixing it is likely to produce more impact than any automation we could implement."

**Scenario 3: The conflict of interest**

You have a professional relationship with a project management software vendor. You have referred three clients to them over the past two years. Each time, you received a referral arrangement that compensated you modestly for the introduction. The vendor's product is genuinely good. And it would be a legitimate solution for this client's needs. You are about to make your recommendations. The vendor's product is on the list.

*Reference discussion:* The conflict-of-interest obligation is direct here: disclose before the recommendation, not after. The language: "I want to flag something before I go through the recommendations. One of the tools I'm suggesting is from a vendor I've worked with before, and I have a referral arrangement with them — meaning I receive a modest fee when I introduce clients to their platform. I've included them because I believe the product genuinely fits your situation, but you should know about that relationship when you're evaluating the recommendation. I'm happy to walk you through alternatives if you'd prefer."

The hard calls are not hard because you do not know the right answer. They are hard because the right answer requires you to say something uncomfortable to someone who is paying you. That is the work.`,
    reflection_prompt: "Which of these three scenarios is hardest for you — not philosophically, but personally, in terms of what it would require of you in the room? Name what specifically makes it hard, and what you would need in order to handle it well.",
    ai_prompt_suggestions: [
      "I'm facing Scenario 1 with my Riverstone simulation — Marcus has told me he wants to eliminate two of the five employees whose roles touch intake. I haven't completed the human capacity audit. Help me draft what I would say to Marcus in response.",
      "Play the role of a senior practitioner reviewing my response to Scenario 2. Tell me where my delivery was good and where I softened something that deserved to be said more directly.",
      "What does the IMC USA Code of Ethics say about conflicts of interest? How does that standard compare to what I've described in Scenario 3 — is my proposed disclosure sufficient?",
    ],
    key_takeaway: "The hard calls are not hard because you do not know the right answer. They are hard because the right answer requires you to say something uncomfortable to someone who is paying you. That is the work.",
  },
  {
    module_number: "6B", lesson_number: "6B-4", sort_order: 4,
    title: "Performing vs. Practicing Ethics",
    estimated_time: "20 minutes", teaching_method: "Reflection",
    core_content: `The practitioner who has memorized the ten-point ethical framework and studied the teaching cases is now equipped to perform ethical practice — to use the right language, to hit the expected notes, to demonstrate fluency with the concepts. That is not the same as practicing ethics.

The distinction matters because ethical performance is self-serving: it manages the practitioner's reputation and professional identity. Ethical practice is other-serving: it makes decisions that reflect genuine care for everyone affected, including the decisions that are personally costly to the practitioner.

**What the difference looks like in practice**

A practitioner who uses the language of "dignity" and "informed consent" in client proposals, and then designs a workforce transition communication that is fundamentally a misrepresentation of why the restructuring is happening — that is ethical performance. The language is correct. The action is not.

A practitioner who surfaces the responsible-restructuring evidence to a client who does not want to hear it, who stays in the conversation even when the client pushes back, and who refuses to write a workforce communication that misrepresents the decision — even at the cost of the engagement — is practicing ethics. There is no language performance required. The action is the ethics.

The test is this: what would you do if no one were watching, if there were no professional reputation at stake, and if the right action cost you something? Ethics practiced answers that question the same way every time. Ethics performed depends on the audience.

**The self-assessment question**

Domain 5 introduced the practitioner's inner orientation as a variable in the quality of the engagement. Domain 6 takes that further: the practitioner's inner ethical state — not their stated commitments, but their actual commitments — is the variable that determines whether the methodology produces good or produces sophisticated harm.

The question to ask yourself, regularly, is not "am I following the framework?" It is: "are my actions consistent with who I say I am in this work?"

That question has no comfortable resting point. It is an ongoing practice.`,
    reflection_prompt: "Describe a situation where you have seen ethical performance rather than ethical practice — in yourself, in a colleague, or in an organization you have observed. What made the performance visible as performance, rather than as the real thing?\n\nThen: what would it have required for the person or organization to practice ethics in that situation instead?",
    ai_prompt_suggestions: [
      "I want to think through whether I've been performing or practicing ethics in my Riverstone simulation so far. Here are the decisions I've made [describe them]. Ask me questions that would help me tell the difference.",
      "Describe what a consulting engagement looks like from the inside when the practitioner is performing ethics versus practicing it. What would the client experience differently?",
    ],
    key_takeaway: "Ethics practiced and ethics performed can look identical from the outside, for a while. They diverge at the first genuinely costly decision — and that is when what you are actually committed to becomes visible.",
  },
  // ── 6C ────────────────────────────────────────────────────────────────────
  {
    module_number: "6C", lesson_number: "6C-1", sort_order: 1,
    title: "Positioning the WST Practice",
    estimated_time: "30 minutes", teaching_method: "Reading",
    core_content: `How you position your practice determines what clients hire you to do — and what you are actually able to do. A practitioner who positions narrowly will be hired for narrow work, and will struggle to be heard when the full scope of what the engagement requires becomes visible.

The WST practice has a specific positioning logic that is built into the methodology. Understanding it is not just a marketing question — it is a question of what you are actually promising when you take an engagement.

**The four-part credential**

*SMB Operations Consultant:* You understand how small businesses actually work — the informal power structures, the undocumented processes, the owner dependencies, the places where growth has outrun systems. You are not a strategy consultant selling frameworks. You are a practitioner who goes to where the work is.

*AI and Workforce Transition Advisor:* You understand the specific intersection of AI deployment and workforce implications — not as a technology evaluator or a technology critic, but as someone who can hold both the capability and the harm documentation in the same conversation, and help clients make genuinely informed decisions. This is the credential that most differentiates WST practice in the current market, because almost no one in this space is doing both.

*Fractional COO / Business Auditor:* You have operational judgment. You can read a P&L, understand a margin problem, evaluate a staffing structure, and assess whether a growth plan is realistic given the operational infrastructure that exists. This is what allows you to speak to owners in the language of the business, rather than in the language of consulting.

*Infrastructure Architect (Light):* You understand technology at the practical level — enough to evaluate tool stacks, identify integration problems, assess vendor claims, and design systems that the client can actually operate without you. You are not a software developer. But you can work with one, evaluate their proposals, and hold the client's operational interests in that conversation.

**Why all four, not one**

The methodology only works as an integrated practice. A practitioner who positions as "an AI consultant" will be hired for AI recommendations — and the people and process layers will be treated as overhead. A practitioner who positions as "an operations consultant" will struggle to be heard on AI workforce implications.

**The credential framing**

This curriculum prepares practitioners to begin doing competent work. That is what the credential says — and it is more credible and more ethical than claiming expertise that has not yet been earned. The practitioner who says "I've trained rigorously in a methodology that integrates people, process, and technology auditing for SMBs, and I'm bringing that to engagements" has stated something accurate and defensible. Clients can tell the difference. The practitioner who overstates their competence earns the first engagement and loses the second.`,
    reflection_prompt: "Write the three-sentence description of your practice that you would give to a prospective client at a networking event — using the four-part credential as your frame. Then: what is the hardest part of that description to deliver with confidence, and what do you still need to develop to deliver it honestly?",
    ai_prompt_suggestions: [
      "Help me draft positioning language for the WST practice that is specific enough to be credible and honest about what the credential does and does not claim.",
      "A prospect asks me: 'How many of these AI and workforce audits have you done?' I'm just coming out of the curriculum. How do I answer that honestly without disqualifying myself?",
    ],
    key_takeaway: "Positioning is a promise. The promise the WST practice makes is specific: integrated people-process-technology auditing for SMBs, executed with the methodology, with genuine care for the outcomes. That is what you can honestly deliver. It is enough.",
  },
  {
    module_number: "6C", lesson_number: "6C-2", sort_order: 2,
    title: "Pricing the Engagement",
    estimated_time: "30 minutes", teaching_method: "Reading",
    core_content: `Pricing is one of the places where ethical commitments and commercial reality meet most directly. A practitioner who prices too low will either cut corners on the methodology or resent the engagement — both of which harm the client. A practitioner who over-promises on outcomes has misrepresented what they are selling.

The honest frame for WST engagement pricing is value-based — but value-based in a specific sense: the cost of the engagement should be legible relative to what the engagement prevents, not relative to what it promises to produce.

**What the methodology costs to run**

A standard WST engagement for a 10–50-person firm — discovery through handoff, executed without shortcuts — requires substantial practitioner time. Co-initiating and scoping: typically 3–5 hours of conversation and documentation. Immersive discovery: typically 8–12 hours of site time, interview time, and analysis. Presencing and synthesis: typically 4–6 hours of structured reflection and synthesis work. Co-design: typically one half-day session plus preparation and documentation. Prototype testing: typically 2–4 hours within the engagement. Handoff and leaving well: typically 3–4 hours including the leaving-well session. Post-engagement check-ins: 2–4 hours across 6 and 12 months.

A standard engagement runs 35–50 practitioner hours for the primary work, plus the post-engagement commitments. Under-pricing to win work means shortening the methodology to close the gap — and shortened methodology produces shelf-ware that does not change anything.

**On outcome guarantees**

Do not promise outcomes you do not control. The results of a WST engagement depend on factors the practitioner cannot guarantee: whether the client and their team implement what was co-designed, whether the organizational conditions remain stable during implementation. The practitioner controls the quality of the process and the quality of the deliverables. They do not control the client.

**The value-relative-to-prevention frame**

The most useful pricing conversation with a client is not "here is my hourly rate" or "here is my ROI projection." It is: "Here is what we know about what a premature automation decision costs a firm this size, what an avoidable displacement costs in recruitment and knowledge loss, what a tool-sprawl problem costs in overhead and security exposure. The engagement is priced relative to what it prevents."

This requires the practitioner to know those numbers — to have done the Domain 1 and Domain 4 research work and be able to speak to the cost of the problems the methodology exists to prevent. That knowledge is what justifies the price.`,
    reflection_prompt: "A small firm owner pushes back on your proposed price: 'That's more than I expected. What am I getting for that?' Write the two-minute response you would give — not a defense of your rate, but an honest account of what the engagement delivers and what it prevents.",
    ai_prompt_suggestions: [
      "Help me build the cost-of-inaction framing for a typical Riverstone-type situation — what are the documented costs of a premature automation decision, an avoidable displacement, and a tool-sprawl problem at SMB scale?",
      "I'm building a measurement system for the Riverstone engagement. Help me identify three to five metrics that would serve both as engagement success measures and as evidence for future pricing conversations.",
    ],
    key_takeaway: "Under-pricing is an ethical issue, not just a commercial one. The practitioner who cannot sustain the practice at the time the methodology requires will shorten the methodology — and the client will pay for that shortcut in ways that do not show up on the invoice.",
  },
  {
    module_number: "6C", lesson_number: "6C-3", sort_order: 3,
    title: "Client Selection",
    estimated_time: "35 minutes", teaching_method: "Reading + Simulation",
    core_content: `Not every client who can pay for a WST engagement should get one. This is a commercial claim and an ethical claim simultaneously.

The methodology only works — produces genuine value rather than elegant documentation of a problem that remains — under specific conditions. Some of those conditions are in the client. Some are in the situation. And some are in the practitioner's own current capability.

**The clients with whom the methodology can produce genuine value**

The founder or leader who is genuinely open to what the discovery process surfaces. Not a leader who says they are open. A leader whose behavior — in the first conversation, in how they describe their team, in what questions they ask — suggests they can hear something they did not expect to hear.

The firm where the founder is willing to participate in the discovery process. Not direct it. Not manage it from a distance. Participate.

Situations where a real decision is pending. The methodology produces the most value when the client is actually facing a choice — about a tool, a process, a structure, a hire — and needs rigorous support for making it well.

Engagements where the people layer can be accessed honestly. If the psychological safety climate is so damaged that honest participation in discovery is not possible, the co-sensing phase will produce misleading data, and the synthesis and recommendations built on it will be built on a foundation that cannot hold.

**The clients to avoid**

The client who wants a conclusion, not a process. "I know what the problem is — I just need you to document it so I can show my team." That is a communication engagement, not an audit.

The client who wants validation for a decision already made. "We've decided to automate the intake function and restructure the team. We need someone to help us manage the transition." That may be legitimate consulting work. But it is not the WST methodology.

The engagement-as-communication-exercise client. "We need to tell our team something about AI and the future of their roles. Can you come in and do a session?" That is a speaking or facilitation engagement. Represent it as such.

**Simulation: three engagement opportunities**

1. A 19-person architecture firm. The principal says: "We're looking at AI drafting tools. I want someone to help us figure out if it makes sense for us and what the impact would be on the team. I want to get this right — I've seen other firms move fast and then deal with the fallout."

2. A 35-person staffing company. The HR director says: "We implemented an AI matching system six months ago. The recruiters hate it and we're not sure it's working. We need an outside perspective on whether to keep it, change it, or scrap it."

3. A 12-person manufacturing company. The owner says: "I've already decided we're moving to an automated inventory system. I need someone to help me communicate the change to my team and train them. I want to move in the next three weeks."

For each: does the WST methodology fit this engagement? What conditions need to be established before you would take it? What would you need to know that you do not know from this description?`,
    reflection_prompt: "What would it mean to your sense of yourself as a practitioner to turn down an engagement that would be profitable but would require you to compromise the methodology?\n\nWrite 200 words honestly. Not the answer you would give in a professional development workshop. The answer that is true for you right now.",
    ai_prompt_suggestions: [
      "Walk me through the three engagement opportunities in the simulation. For each one, what are the most important questions I would ask before deciding whether to take it?",
      "For the third engagement opportunity — the manufacturing company — what is the honest response I would send if I decided the WST methodology didn't fit what they're asking for? Draft it.",
    ],
    key_takeaway: "The engagement you decline because the conditions are not right is not lost revenue. It is the protection of the methodology — and of the clients who need it when the conditions are right.",
  },
  {
    module_number: "6C", lesson_number: "6C-4", sort_order: 4,
    title: "Business Decisions as Ethical Decisions",
    estimated_time: "25 minutes", teaching_method: "Reflection",
    core_content: `Pricing, scope, and client selection are commercial decisions. They are also ethical decisions. The practitioner who separates the two — who treats the ethics as a professional practice layer that sits above the business decisions — has not integrated the curriculum.

Consider: the practitioner who takes an engagement they are not equipped to handle has made an ethical error, not just a business error. The client they are not equipped to serve is going to receive a methodology they cannot execute fully. Whatever the invoice says, the client is not getting what they paid for.

The practitioner who prices below the cost of doing the work properly — because they want the work, or because the client pushed back, or because they are not yet confident enough in the methodology to hold the fee — will either cut corners (ethical error: the client gets less than was promised) or absorb the cost personally (commercial error, which becomes an ethical error as resentment builds and the engagement suffers).

The practitioner who takes an engagement with a client who wants a conclusion rather than a process has agreed to perform a methodology rather than practice it. That is the performing-versus-practicing distinction from Lesson 6B-4, applied to the business-of-practice layer.

**The honest framing of the practice**

This methodology takes the time it takes. It costs what it costs. It works with the clients who can receive it. None of those three statements is a sales limitation. All three are ethical commitments.

A practitioner who has fully internalized this framing can have the pricing conversation and the scope conversation and the client-selection conversation from a grounded position — not defensive, not apologetic, not performing confidence. Just honest about what the methodology requires and what it produces.

The practitioner who cannot yet hold that frame has more development to do — which is a fine and honest place to be. The curriculum prepares practitioners to begin doing competent work. Pricing and positioning and client selection at the level this lesson describes takes experience, and experience takes time. The commitment is not to do it perfectly at the start. It is to do it honestly from the start, and to let the honesty develop with the practice.`,
    reflection_prompt: "Describe the engagement scenario that would tempt you most strongly to compromise the methodology — to take a client you should probably not take, or price below what the work requires, or scope down to avoid a conversation. What is the temptation? What would it cost you and the client?",
    ai_prompt_suggestions: [
      "I'm running Session 4 of the Riverstone simulation — the co-design session. Based on everything I've discovered and synthesized so far, help me design a co-design session structure: what I'm building with Marcus and the team, how long it runs, and what I'm listening for.",
      "I'm about to prototype something for Riverstone. Help me think through three possible prototype options given the synthesis findings, and evaluate which one is most appropriate for what I actually know at this point.",
    ],
    key_takeaway: "The business of practice and the ethics of practice are not parallel tracks. They are the same track. The practitioner who manages both honestly has a sustainable practice.",
  },
  // ── 6D ────────────────────────────────────────────────────────────────────
  {
    module_number: "6D", lesson_number: "6D-1", sort_order: 1,
    title: "The Habits of Reflective Practice",
    estimated_time: "30 minutes", teaching_method: "Reading",
    core_content: `The practitioner who finishes an engagement and moves to the next one without structured review of their own work will improve, slowly, from accumulated experience. The practitioner who finishes an engagement and runs a deliberate reflective review will improve faster and more deliberately. Over a career, that difference compounds into a significant gap in practitioner quality.

Reflective practice is not natural. It requires discipline, a structure, and the willingness to look honestly at your own work — which means seeing both the parts that went well and the parts that did not. The practitioner who only reflects on what they got right is not doing reflective practice. They are doing self-congratulation with a structured format.

**What the structure looks like**

A WST reflective practice review happens at two timescales: after each engagement, and on a regular ongoing cadence (weekly or bi-weekly) during active practice.

*Post-engagement review:* Within two weeks of the leaving-well session, the practitioner writes a structured reflection on the engagement. The questions:

What did I listen well to in this engagement? Where was my listening genuinely open, and what did I hear as a result that I would have missed with more assumptions in place?

What did I rush past? Where did I feel the pull to move to the next phase before the current one was complete, and what did that cost?

Where did my prior judgment close my attention before I had the data? What did I bring in from prior engagements that may not have applied here?

Where did I compromise the methodology because it was uncomfortable or inconvenient? Name the specific moment. What was I avoiding?

Where did I hold the ethical line? Where did I take the easier path?

What did I learn about my own development edges — the places where I am still not yet fully equipped?

*Ongoing reflective cadence:* For practitioners in active work, a shorter weekly or bi-weekly review. What happened this week that surprised me? Where did I make a decision that I am not fully settled about? What did I notice about my own listening or judgment that I want to carry forward?

**The distinction between reflection and rumination**

Reflection produces growth. Rumination produces paralysis. The distinction: reflection asks "what would I do differently?" — a forward-looking question that generates learning. Rumination asks "what should I have known then that I know now?" — a backward-looking question that generates self-criticism without changing anything.

The practitioner who identifies three specific decisions they would approach differently, and writes a 100-word note about what specifically they would do, and then puts it down — is reflecting.`,
    reflection_prompt: "Design your own post-engagement review structure for the Riverstone simulation. What questions will you ask yourself? What format will you use? How long will it take?\n\nThen: what is the most honest thing you would write in that review about the Riverstone engagement as you have run it so far?",
    ai_prompt_suggestions: [
      "Help me design a post-engagement reflection template for WST engagements that is specific enough to generate real learning and honest enough to be worth doing.",
      "I want to run the post-Riverstone reflection right now, before I've even finished the simulation. What questions would be most useful to ask myself at this stage, given what I know about how the simulation has gone?",
    ],
    key_takeaway: "Reflective practice is not a soft competency. It is the mechanism by which experience becomes development rather than just time served.",
  },
  {
    module_number: "6D", lesson_number: "6D-2", sort_order: 2,
    title: "Peer Supervision and Case Sharing",
    estimated_time: "30 minutes", teaching_method: "Reading + Reflection",
    core_content: `The reflective practice described in Lesson 6D-1 is necessary but not sufficient. Self-assessment has a structural blind spot: the practitioner cannot fully see what they cannot see. The ethical failures most likely to recur are the ones the practitioner does not recognize as failures — the moments where their judgment closed without their awareness, where they rationalized rather than reasoned, where they performed an ethical commitment rather than practiced it.

Peer supervision exists to close that blind spot.

**What peer supervision is**

In its simplest form, peer supervision is a regular conversation with a trusted colleague — or a small group — in which the practitioner shares an anonymized account of recent engagement work, including the decisions they are not fully settled about, and receives honest challenge. Not encouragement. Not validation. Challenge.

The peer reviewer's job is to ask the questions the practitioner has not asked themselves:

Why did you assume that?

What would it look like if you were wrong about that?

Where did you decide what the problem was before you had the data?

You described that client interaction as the client being difficult — what if they were not difficult, just scared? What would that change?

Where did you protect yourself in this engagement rather than protect the client?

These are uncomfortable questions. They require a relationship of trust sufficient to make the discomfort productive rather than defensive. That relationship is built by both participants doing it — the reviewer who challenges also brings their own work to be challenged.

**What case sharing contributes to the field**

The WST practitioner community is small and new. Case sharing builds a shared evidence base. When practitioners document their work honestly — in anonymized form, with genuine account of what the methodology produced and where it fell short — they contribute to a body of knowledge that makes the practice defensible to future clients, improves the methodology, and builds the professional field.

This is the contribution obligation from the ten-point framework, made concrete. It does not require publishing. It requires honest documentation and a willingness to share it with colleagues who are building the same thing.

**Who the peer reviewer needs to be**

Not someone who will be impressed by the practitioner's success. Not someone whose approval the practitioner is seeking. Someone who understands the methodology well enough to recognize when it has been compromised, who cares enough about the practitioner's development to say something when they see that, and who is willing to hear the same challenge directed at their own work. That is a professional relationship worth building deliberately.`,
    reflection_prompt: "Who in your current professional life could serve as a peer supervisor for your WST practice? What would you need to ask them for — specifically — and what would you need to offer in return?\n\nIf you do not have that person, what would it take to find one?",
    ai_prompt_suggestions: [
      "I want to run a peer supervision conversation on my Riverstone simulation. Play the role of a senior practitioner who has done fifteen of these engagements. I'll describe my decisions and you challenge them.",
      "What does the case documentation for a WST engagement look like — what format, what level of detail, what should be anonymized, and what makes it useful to other practitioners?",
    ],
    key_takeaway: "The practitioner who reviews their own work in isolation is using a diagnostic tool on themselves. The peer reviewer is a second instrument with a different calibration. Both are needed.",
  },
  {
    module_number: "6D", lesson_number: "6D-3", sort_order: 3,
    title: "The Question the Practitioner Carries",
    estimated_time: "30 minutes", teaching_method: "Reading + Reflection",
    core_content: `At the end of every significant decision in an engagement — and at the end of every engagement, and in the periodic review of the practice — the WST practitioner asks one question:

**Are my actions consistent with who I say I am in this work?**

This is not a performance question. It is not "did I meet the standard?" or "would a reviewer approve of this?" It is an integrity question — the question of whether the practitioner who shows up inside the engagement is the same person as the practitioner who describes their commitments when no one is watching and nothing is at stake.

**What this question requires**

First, it requires the practitioner to have a clear account of who they say they are in this work. Not a positioning statement. Not a professional bio. An honest account of what they are committed to: what they will do when it is hard, what they will refuse when it costs them something, what they care about that has no commercial logic but is genuinely important to them.

Second, it requires the practitioner to look honestly at what they actually do. Not the aspirational account. The behavioral account: what decisions did they actually make, what did they actually say, what did they actually produce?

The gap between those two accounts is the practitioner's development edge. The practitioner who closes that gap over time is growing. The practitioner who stops looking — who decides the gap is too uncomfortable to examine — has chosen a static practice.

**On the relationship between this question and the capstone simulation**

The Riverstone simulation has surfaced a series of decisions — some made well, some made imperfectly, some made in ways you are not fully settled about. The ethical review that is part of the capstone deliverable asks you to identify five moments of ethical choice and name what you chose and why.

That review is only possible if you have been asking this question throughout the simulation. The practitioner who completes the simulation and then reconstructs the ethical moments at the end — looking backward for the choices that are easy to defend — will produce a clean ethical review that does not reflect what actually happened. The practitioner who has been asking the question throughout will have the harder and more honest account.

**On the relationship between this question and the field**

This curriculum is a beginning. The practitioner who leaves it carrying this question — who understands that the question does not get easier to answer over time, it just becomes more familiar — has understood what Domain 6 was designed to produce.

The practitioner who has a clean answer ready before they have finished asking the question has not yet started.`,
    reflection_prompt: "Write the answer to this question as it applies to your Riverstone simulation: are your actions in the simulation consistent with who you say you are in this work? Not the polished version. The honest version.\n\nWhere they are consistent — name it. Where they are not — name that too.",
    ai_prompt_suggestions: [
      "I want to draft the ethical review portion of my Riverstone capstone. Help me identify five moments in the simulation where I made a genuine ethical choice, and for each, prompt me with the questions I should be answering about my reasoning.",
      "I've been thinking about this question: are my actions consistent with who I say I am in this work? Help me think through what 'who I say I am in this work' actually means — what specific commitments should a WST practitioner be able to name?",
    ],
    key_takeaway: "The question the practitioner carries is not a destination. It is a practice. The practitioner who is still asking it, honestly, a decade from now has done the work.",
  },
  {
    module_number: "6D", lesson_number: "6D-4", sort_order: 4,
    title: "The Curriculum as a Beginning",
    estimated_time: "20 minutes", teaching_method: "Reading",
    core_content: `This is the final lesson of the WST Practitioner Curriculum.

Here is what you have now: a research foundation, a methodology, a set of audit tools, an ethical framework, and a complete simulated engagement you have run from first contact through handoff. You have worked through the evidence on AI adoption, displacement, and productivity. You have built the human capacity audit, the process audit, and the technology audit. You have practiced discovery, synthesis, co-design, and handoff. You have run three hard calls and five teaching cases through the ethical framework. You have built the positioning and pricing logic for a sustainable practice. And you have started the reflective habits that make growth possible over time.

That is a substantial foundation. It is not competence.

**The difference between preparation and competence**

Competence comes from doing this work with real clients, in real organizations, with real stakes. With the specific client whose presenting problem is not what it appears to be. With the founder who hears "the bottleneck is you" and goes silent. With the team member who is genuinely afraid, in a way that your discovery interview skills can detect but cannot fully address. With the engagement that goes sideways in week two and requires you to decide whether to hold the methodology or adapt it — and live with the consequences either way.

The curriculum prepares you for that work. It does not substitute for it.

The practitioner who leaves this curriculum believing they are fully equipped has misread it. The practitioner who leaves knowing the difference between preparation and competence — and who holds that difference honestly in every client engagement, including the first one — has understood what the curriculum was designed to produce.

**What holding that difference looks like in practice**

It looks like saying, in a first-contact conversation, "I've trained rigorously in this methodology, and I want to be honest with you about where I am: I'm bringing strong preparation and real commitment to doing this work well. I don't have twenty engagements behind me yet. That's the honest account of where I am."

Some clients will choose someone with more experience. That is appropriate. Some clients will choose you specifically because of the honesty. Those clients will be the ones who get the most out of the engagement.

The credential that matters is not a certificate or a completion badge. It is the practitioner's ongoing demonstrated commitment to doing this work well — evidenced by the quality of their documentation, the honesty of their reflective reviews, the standards they hold for their own engagements, and the care they bring to every person they encounter inside a client system.

**Session 6: Handoff and leaving well**

Before submitting the final capstone package, complete the sixth and final session of the Riverstone simulation: the handoff and leaving-well session. Use the Domain 5 (Module 5E) leaving-well framework. Document the session as the final entry in your engagement documentation package.

Then: write the three-part capstone submission.`,
    reflection_prompt: "There is no discussion prompt for this lesson. Instead, write the capstone practitioner statement.\n\n500–800 words: who you are in this work, what you are committed to, what you are prepared to do, and what you are still developing. Write it for yourself, not for a reviewer. The reviewer will read it — but you are the one who has to live it.",
    ai_prompt_suggestions: [
      "I'm writing my practitioner statement. Help me think through what I actually believe about this work — what I'm genuinely committed to, and what I'm still working on — by asking me questions I haven't asked myself yet.",
      "Review my draft practitioner statement and tell me where it sounds honest and where it sounds like I'm performing something rather than saying something true.",
    ],
    key_takeaway: "This curriculum prepares you to begin doing competent work. That is what it claims to do. Nothing more. The practitioner who knows the difference between that and being competent — and holds that difference honestly, for as long as it is honest — is the practitioner this curriculum was designed to produce.",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// ASSESSMENTS
// ─────────────────────────────────────────────────────────────────────────────

const ASSESSMENTS: AssessmentSeed[] = [
  {
    module_number: "1A",
    assessment_type: "reflection",
    prompt: "You are preparing for a first client conversation with the owner of a 22-person marketing agency who tells you, 'I've read that AI is going to eliminate 30% of jobs in the next five years — we need to get ahead of this.' In 200–300 words: (a) identify what kind of claim this is — measured or projected — and where it likely originates; (b) write the two or three sentences you would actually say to this client in response.",
    what_it_measures: "Ability to distinguish data quality; ability to communicate accurate, non-alarmist information in a practitioner context.",
    is_capstone: false,
  },
  {
    module_number: "1B",
    assessment_type: "case_analysis",
    prompt: "You are given a two-page first-contact brief about a fictional 18-person operations firm. The brief includes what the owner told you on the phone, what you observed in their waiting room, and three fragments from a follow-up email exchange with their office manager. Annotate the brief: (a) mark each thriving or struggling marker you can identify; (b) identify two markers you cannot yet determine from available information and explain what you would do to surface them; (c) write the single most important question you would ask in the first in-person meeting and explain why.",
    what_it_measures: "Pattern recognition across diagnostic markers; ability to hold hypothesis rather than jump to conclusion; practitioner questioning instinct.",
    is_capstone: false,
  },
  {
    module_number: "1C",
    assessment_type: "reflection",
    prompt: "You are conducting your first team discovery session at a 12-person accounting firm. In your first group conversation, the staff is polite but notably cautious. One person answers every question with 'whatever the partners decide is fine.' Another mentions they 'tried ChatGPT a few months ago but stopped using it.' The partners told you before the session that they 'have an open and communicative team.' In 250–350 words: what is actually happening in this room, and what does your understanding of worker anxiety and threat response tell you about how to proceed?",
    what_it_measures: "Ability to read beneath surface behavior; application of threat-response understanding to practitioner decision-making; avoidance of naive interpretation of stated sentiment.",
    is_capstone: false,
  },
  {
    module_number: "1D",
    assessment_type: "reflection",
    prompt: "Write 250–400 words: What is the difference between projections and measurements in the AI-and-work literature, and why does it matter when you are advising a client who is scared of being left behind? Your answer should be specific enough that someone who has not read this module can understand what you mean.",
    what_it_measures: "Ability to translate epistemic discipline into practitioner language; clarity of thinking about evidence quality; non-anxious holding of genuine uncertainty.",
    is_capstone: false,
  },
  {
    module_number: "2A",
    assessment_type: "simulation",
    prompt: "You are given a profile of an employee at a fictional 20-person operations firm: job title (Operations Coordinator), a list of documented tasks, three observations from their manager, two observations from a colleague, and a brief self-assessment the person wrote. Conduct a written human capacity audit for this person. Then write a 150-word role redesign brief: what this person's role could look like if it were anchored in their human capacity and the tasks that AI cannot replicate.",
    what_it_measures: "Ability to distinguish documented from undocumented capacity; strengths-and-crafting reasoning; role design thinking grounded in both human and organizational reality.",
    is_capstone: false,
  },
  {
    module_number: "2B",
    assessment_type: "case_analysis",
    prompt: "You are given a set of five observations from a discovery session at a fictional 16-person firm. For each observation, identify what it signals about psychological safety and explain your reasoning. Then write a 200-word assessment: what is the safety climate of this team, what is the primary threat to it, and what is the first thing you would address before proceeding with any further discovery work?",
    what_it_measures: "Ability to read safety signals accurately; avoidance of confirmation bias; prioritization of the safety layer before proceeding with content work.",
    is_capstone: false,
  },
  {
    module_number: "2C",
    assessment_type: "simulation",
    prompt: "You are given profiles of three employees at an 18-person operations firm where the owner is implementing an AI-based customer service system. Each profile includes current role, tenure, informal observations about strengths, and which tasks the AI system will absorb. (a) Conduct a written task decomposition and human capacity assessment for each person. (b) Propose a role redesign for each, anchored to their strengths and what the AI cannot replicate. (c) Identify which case, if any, represents the hard scenario and explain how you would handle it. (d) In 150 words, write what you would say to the client about the workforce planning decision overall.",
    what_it_measures: "Task decomposition rigor; strengths-anchored redesign reasoning; ability to navigate the hard case with honesty and care; practitioner communication with a client on a high-stakes decision.",
    is_capstone: false,
  },
  {
    module_number: "2D",
    assessment_type: "case_analysis",
    prompt: "You are given a set of discovery materials from a fictional engagement: owner interview notes, a manager conversation summary, observations from two front-line staff, a safety assessment score, and a human capacity worksheet for two key roles. Produce: (a) a people-layer summary for this firm (300–400 words) that a colleague could use to design the process and technology audits; (b) a list of three things you still do not know and need to investigate, and how you would investigate them.",
    what_it_measures: "Synthesis across multiple information sources; ability to produce a practitioner document rather than a data dump; calibration about what is known versus unknown.",
    is_capstone: false,
  },
  {
    module_number: "3A",
    assessment_type: "simulation",
    prompt: "You are given a description of a 16-person professional services firm's client delivery workflow — as described by the owner in a first conversation. (a) Identify three places in this account where 'work as imagined' likely diverges from 'work as done' and explain your reasoning. (b) Design the process trace you would conduct: what artifact would you follow, who would you observe, and what specific questions is the trace designed to answer? (c) Given that the owner shows you their existing 'process documentation' — a 47-page Word document last updated 18 months ago — write the two or three sentences you would say about it.",
    what_it_measures: "Ability to identify the work-as-imagined vs. work-as-done gap; process trace design; honest, constructive communication with a client about their existing documentation.",
    is_capstone: false,
  },
  {
    module_number: "3B",
    assessment_type: "case_analysis",
    prompt: "You are given a first-contact brief for a fictional 14-person marketing agency. The brief includes the owner's opening email, notes from a 30-minute phone call, and three observations from a walk-through of the office. Annotate the brief for failure-mode signals: for each of the seven failure modes, note whether it is (a) clearly present, (b) possibly present and needs investigation, or (c) not indicated. Then write the two process-audit questions you would prioritize in the first on-site visit and explain why.",
    what_it_measures: "Failure-mode pattern recognition; calibration between clear evidence and hypothesis; diagnostic prioritization.",
    is_capstone: false,
  },
  {
    module_number: "3C",
    assessment_type: "simulation",
    prompt: "A fictional 19-person professional services firm has: (a) no documented SOPs for any of its core processes; (b) a project management tool (ClickUp) they are using for about 20% of their work; (c) a billing process that lives entirely in the founder's head; and (d) a culture the founder describes as 'we move fast, we don't like bureaucracy.' Design a one-year operating infrastructure improvement plan for this firm. Be specific about what you would document first, what tools you would recommend or remove, and how you would sequence the work given the culture. Explain how lean and minimum-viable-bureaucracy principles shaped your choices.",
    what_it_measures: "Lean systems thinking at SMB scale; right-sizing to culture and context; sequencing and prioritization; avoidance of over-engineering.",
    is_capstone: false,
  },
  {
    module_number: "3D",
    assessment_type: "simulation",
    prompt: "A client tells you: 'We've automated our entire invoice processing workflow with AI — it's saving us 20 hours a week.' (a) Write the five brittleness audit questions you would ask, in the order you would ask them, with a brief explanation of what each is designed to surface. (b) The client also tells you they are considering implementing an AI chatbot to handle all first-contact customer inquiries. Based on the evidence map, what tier does this application fall into, what are the conditions under which it might succeed, and what would you say to the client about it?",
    what_it_measures: "Brittleness audit rigor; evidence map application; honest, evidence-grounded client communication about AI investment.",
    is_capstone: false,
  },
  {
    module_number: "4A",
    assessment_type: "simulation",
    prompt: "A fictional 24-person healthcare staffing firm tells you they want to: (a) automate their client intake process entirely with an AI chatbot; (b) implement AI-driven candidate matching; (c) use AI to generate all their marketing content. For each initiative, identify its evidence tier, name the conditions under which it would succeed, and write the honest two-paragraph assessment you would give the client — what you would recommend, what you would caution, and why.",
    what_it_measures: "Evidence-tier reasoning; precondition identification; honest client communication about technology investment.",
    is_capstone: false,
  },
  {
    module_number: "4B",
    assessment_type: "reflection",
    prompt: "You have completed a technology audit of a fictional 20-person legal services firm. The managing partner wants to implement AI contract review (automated flagging of non-standard clauses) and AI legal research assistance. Before making your recommendation, you are obligated to brief the partner on the documented risks. Write that briefing — 300–400 words — covering displacement risk, deskilling risk, and vendor dependency risk as they apply specifically to these two applications and to this firm's context. Do not generalize to the legal industry broadly; be specific to this firm and these applications.",
    what_it_measures: "Ability to apply harms framework to specific applications; specificity vs. generalization; professional communication of risk to a non-technical client.",
    is_capstone: false,
  },
  {
    module_number: "4C",
    assessment_type: "simulation",
    prompt: "You are given a profile of a fictional 18-person professional services firm. The profile includes: sector (consulting), current AI tool inventory (3 tools, including one used by individual employees without company knowledge), BYOAI observations from staff interviews, and a note that two employees handle client financial data regularly. Produce: (a) a data-risk assessment covering what data is likely at risk and why; (b) the regulatory exposure the firm faces; (c) a one-page AI governance framework appropriate for this firm's size and culture. The governance framework should be a usable document, not a description of one.",
    what_it_measures: "Data risk identification; regulatory exposure reasoning; governance framework design at appropriate scale; deliverable quality.",
    is_capstone: false,
  },
  {
    module_number: "4D",
    assessment_type: "simulation",
    prompt: "You are given a full engagement brief for a fictional 18-person operations firm: a tool inventory (partial — you must identify what is likely missing), integration notes from a staff walkthrough, BYOAI observations, and data handling concerns flagged by the office manager. Conduct the seven-step audit: (a) complete the inventory with your hypotheses about missing tools; (b) produce an integration assessment; (c) produce a risk classification for the three AI tools in the stack; (d) identify the two most important gaps; (e) write the technology-layer summary (350–450 words).",
    what_it_measures: "Seven-step audit discipline; integration and risk reasoning; professional summary production; calibration between what is known and what requires further investigation.",
    is_capstone: false,
  },
  {
    module_number: "5A",
    assessment_type: "reflection",
    prompt: "(a) Without reference to the module materials, draw a diagram of the WST Audit Framework phases and place the ten most important practitioner tools within it — one or two sentences for each placement explaining why it belongs in that phase. (b) A colleague tells you, 'I did the technology audit first because the client wanted that — then I worked back to the people layer. The client was happy.' In 150 words, explain what you agree and disagree with in this account.",
    what_it_measures: "Framework comprehension and internalization; tool-to-phase reasoning; ability to hold a methodological position without being dogmatic about it.",
    is_capstone: false,
  },
  {
    module_number: "5B",
    assessment_type: "simulation",
    prompt: "You are preparing for a two-day immersive discovery session at a fictional 20-person healthcare staffing firm. The client has told you the problem is 'the intake process is too slow.' You suspect, based on a pre-engagement call, that the real issue involves both process design and team dynamics. (a) Design the full two-day discovery plan: who you talk to, in what order, in what format, and what you are trying to learn from each conversation. (b) Write the five interview questions you would ask front-line intake staff, with one sentence explaining what each is designed to surface. (c) Write a 150-word pre-session note to yourself about what you need to hold lightly — what assumptions you need to actively suspend — going into this discovery.",
    what_it_measures: "Immersive discovery design; interview question quality; inner-state discipline (the pre-session note tests self-awareness rather than technique).",
    is_capstone: false,
  },
  {
    module_number: "5C",
    assessment_type: "simulation",
    prompt: "You are given the three audit-layer summaries (people, process, technology) from a fictional 16-person professional services engagement. The people layer shows a high-performing but anxious team with a clear psychological safety gap around AI use. The process layer shows two core processes documented (sort of) and eight undocumented, with a founder bottleneck in client delivery. The technology layer shows 23 tools, minimal integration, and active BYOAI behavior in two departments. Produce the synthesis summary: (a) name the underlying pattern; (b) classify the challenge using Cynefin; (c) produce the stakeholder map with two sentences per key stakeholder; (d) state the co-creating hypothesis — what this firm most needs from the engagement.",
    what_it_measures: "Cross-domain synthesis ability; pattern recognition vs. findings listing; Cynefin application; co-creating hypothesis quality.",
    is_capstone: false,
  },
  {
    module_number: "5D",
    assessment_type: "simulation",
    prompt: "Using the synthesis summary you produced in Module 5C's assessment, design a co-design session for the fictional client team: (a) the session structure and facilitation plan (90 minutes); (b) the prototype you would build with this team and why you chose it over alternatives; (c) how you would test the prototype within the engagement and what you would be listening for; (d) produce the draft version of the prototype artifact itself (one-page process runbook, decision protocol, or governance framework — your choice, justified by the synthesis).",
    what_it_measures: "Co-design facilitation planning; prototype selection reasoning; test design; artifact quality.",
    is_capstone: false,
  },
  {
    module_number: "5E",
    assessment_type: "simulation",
    prompt: "You are three weeks from closing a fictional engagement with the 20-person healthcare staffing firm from Module 5B. You have delivered: (a) a redesigned intake process (one-page runbook); (b) an AI governance framework; (c) a role redesign brief for two employees whose tasks were partially absorbed by the new process. Design: (1) the capability transfer plan for each deliverable, including who the internal owner is and how you will prepare them; (2) the measurement system — three metrics, precisely defined; (3) the agenda for the leaving-well session.",
    what_it_measures: "Capability transfer design; internal owner identification and preparation; measurement system precision; engagement-close discipline.",
    is_capstone: false,
  },
  {
    module_number: "6A",
    assessment_type: "simulation",
    prompt: "Ongoing — the capstone simulation assessment runs through all four Domain 6 modules. Full capstone deliverable: A complete engagement documentation package for Riverstone Operations (stakeholder map, scope and purpose statement, engagement design outline, discovery interview guide, triangulation analysis, preliminary human capacity map, synthesis summary, co-design session plan and outputs, prototype description and test results, final recommendations, capability transfer protocol, measurement system, post-engagement commitments, and six decision logs — one per session). Plus a written ethical review: five moments in the Riverstone simulation where an ethical choice was required — for each: what the choice was, what you chose, why you chose it, and what you would do differently with the benefit of full reflection. Plus a practitioner statement: 500–800 words on who you are in this work, what you are committed to, what you are prepared to do, and what you are still developing.",
    what_it_measures: "Full methodology application under engagement conditions; AI assistant governance (using Claude as an augmentation tool, not a decision-maker); ethical choice identification and documentation; honest self-assessment in the practitioner statement.",
    is_capstone: false,
  },
  {
    module_number: "6B",
    assessment_type: "case_analysis",
    prompt: "(a) Using the ten-point ethical framework, analyze the composite teaching case (Case 3) from Lesson 6B-2: identify each point where an ethical obligation was violated, by whom, and what the right action would have been at each point. (b) Return to the Riverstone Operations simulation: the owner has now told you directly that he plans to eliminate two of the five employees whose roles touch the intake process. You have not yet completed the human capacity audit for those roles. Write the response you would give Marcus — what you need, what you need to say, and what you are committing to and not committing to by remaining in this engagement.",
    what_it_measures: "Framework application to a documented case; ethical reasoning under client pressure; ability to hold a position without abandoning the engagement.",
    is_capstone: false,
  },
  {
    module_number: "6C",
    assessment_type: "reflection",
    prompt: "You receive the following inquiry: 'We are a 31-person accounting firm that has just decided to implement an AI bookkeeping assistant. We need someone to help us communicate the change to our team and train them on the new system. We want to move quickly — ideally starting in two weeks.' Write the response you would send: (a) clarify what engagement you can offer and what you cannot; (b) be honest about what the inquiry is describing versus what the client may actually need; (c) name the ethical considerations that affect whether you would take this engagement as described.",
    what_it_measures: "Positioning clarity; honest scope communication; ethical reasoning about client selection; ability to decline or reframe without being dismissive.",
    is_capstone: false,
  },
  {
    module_number: "6D",
    assessment_type: "statement",
    prompt: "Write 500–800 words: who you are in this work, what you are committed to, what you are prepared to do, and what you are still developing. This statement is reviewed and reflected back by the curriculum reviewer. There is no passing or failing grade. The practitioner who writes it with genuine honesty — including about what they got wrong in the simulation, what they found hardest, and what they are not yet ready to do — has done the work this module is designed to produce. The practitioner who writes a polished account of their readiness and competence has produced a fine piece of writing and missed the point entirely.",
    what_it_measures: "Honest self-assessment; integration of curriculum commitments; ability to hold the distinction between preparation and competence; the reflective capacity that makes growth possible.",
    is_capstone: true,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// SEED RUNNER
// ─────────────────────────────────────────────────────────────────────────────

async function wipe() {
  console.log("Wiping existing curriculum records...");
  // Delete in reverse FK order
  await supabase.from("curriculum_responses").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("curriculum_progress").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("curriculum_assessments").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("curriculum_lessons").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("curriculum_modules").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("curriculum_domains").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  console.log("Wipe complete.");
}

async function seedDomains(): Promise<Map<number, string>> {
  console.log("\nSeeding domains...");
  const domainIdMap = new Map<number, string>();

  for (const d of DOMAINS) {
    const { data, error } = await supabase
      .from("curriculum_domains")
      .insert({
        number: d.number,
        title: d.title,
        subtitle: d.subtitle,
        overview_text: d.overview_text,
        estimated_hours: d.estimated_hours,
        prerequisites: d.prerequisites,
        practitioner_note: d.practitioner_note,
      })
      .select("id")
      .single();

    if (error) throw new Error(`Domain ${d.number}: ${error.message}`);
    domainIdMap.set(d.number, data.id);
    console.log(`  ✓ Domain ${d.number} — ${d.title}`);
  }

  return domainIdMap;
}

async function seedModules(domainIdMap: Map<number, string>): Promise<Map<string, string>> {
  console.log("\nSeeding modules...");
  const moduleIdMap = new Map<string, string>();

  for (const m of MODULES) {
    const domainId = domainIdMap.get(m.domain_number);
    if (!domainId) throw new Error(`No domain ID found for domain_number ${m.domain_number}`);

    const { data, error } = await supabase
      .from("curriculum_modules")
      .insert({
        domain_id: domainId,
        domain_number: m.domain_number,
        module_number: m.module_number,
        title: m.title,
        estimated_time: m.estimated_time,
        learning_objectives: m.learning_objectives,
        key_sources: m.key_sources,
        connections: m.connections,
      })
      .select("id")
      .single();

    if (error) throw new Error(`Module ${m.module_number}: ${error.message}`);
    moduleIdMap.set(m.module_number, data.id);
    console.log(`  ✓ Module ${m.module_number} — ${m.title}`);
  }

  return moduleIdMap;
}

async function seedLessons(moduleIdMap: Map<string, string>): Promise<void> {
  console.log("\nSeeding lessons...");

  for (const l of LESSONS) {
    const moduleId = moduleIdMap.get(l.module_number);
    if (!moduleId) throw new Error(`No module ID found for module_number ${l.module_number}`);

    const { error } = await supabase.from("curriculum_lessons").insert({
      module_id: moduleId,
      module_number: l.module_number,
      lesson_number: l.lesson_number,
      title: l.title,
      estimated_time: l.estimated_time,
      teaching_method: l.teaching_method,
      core_content: l.core_content,
      reflection_prompt: l.reflection_prompt,
      ai_prompt_suggestions: l.ai_prompt_suggestions,
      key_takeaway: l.key_takeaway,
      sort_order: l.sort_order,
    });

    if (error) throw new Error(`Lesson ${l.lesson_number}: ${error.message}`);
    console.log(`  ✓ Lesson ${l.lesson_number} — ${l.title}`);
  }
}

async function seedAssessments(moduleIdMap: Map<string, string>): Promise<void> {
  console.log("\nSeeding assessments...");

  for (const a of ASSESSMENTS) {
    const moduleId = moduleIdMap.get(a.module_number);
    if (!moduleId) throw new Error(`No module ID found for module_number ${a.module_number}`);

    const { error } = await supabase.from("curriculum_assessments").insert({
      module_id: moduleId,
      module_number: a.module_number,
      assessment_type: a.assessment_type,
      prompt: a.prompt,
      what_it_measures: a.what_it_measures,
      is_capstone: a.is_capstone,
    });

    if (error) throw new Error(`Assessment for module ${a.module_number}: ${error.message}`);
    console.log(`  ✓ Assessment for Module ${a.module_number}${a.is_capstone ? " [CAPSTONE]" : ""}`);
  }
}

async function main() {
  console.log("=================================================");
  console.log("WST Practitioner Curriculum — Database Seed");
  console.log("=================================================");

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Missing required env vars: NEXT_PUBLIC_SUPABASE_URL and/or SUPABASE_SERVICE_ROLE_KEY");
  }

  await wipe();

  const domainIdMap = await seedDomains();
  const moduleIdMap = await seedModules(domainIdMap);
  await seedLessons(moduleIdMap);
  await seedAssessments(moduleIdMap);

  console.log("\n=================================================");
  console.log("Seed complete.");
  console.log(`  Domains:     ${DOMAINS.length}`);
  console.log(`  Modules:     ${MODULES.length}`);
  console.log(`  Lessons:     ${LESSONS.length}`);
  console.log(`  Assessments: ${ASSESSMENTS.length}`);
  console.log("=================================================");
}

main().catch((err) => {
  console.error("\nSeed failed:", err);
  process.exit(1);
});

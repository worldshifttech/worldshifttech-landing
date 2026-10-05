// Data-driven structure for the CCL Creative Studio intake demo. Everything the wizard renders
// (group-code routing, workflow levels, per-level chapters, fields, conditional questions) lives
// here so the flow can be re-pointed at a real ClickUp form without touching the UI components.
//
// `cu` on each field is the ClickUp field the answer would be written to. `n` is the question
// number on CCL's source form (gaps are questions that were folded into other fields).

export type FieldType =
  | "text"
  | "email"
  | "url"
  | "textarea"
  | "date"
  | "group"
  | "radio"
  | "multi"
  | "checkbox";

export type FormValues = Record<string, string | string[] | boolean | undefined>;

export interface Field {
  id: string;
  n?: number;
  label: string;
  type: FieldType;
  help?: string;
  note?: string;
  /** Checkbox statement shown beside the box. */
  text?: string;
  options?: string[];
  cu: string;
  optional?: boolean;
  showIf?: (values: FormValues) => boolean;
}

export interface Section {
  id: string;
  kicker: string;
  title: string;
  intro: string[];
  guidance?: [string, string][];
  note?: string;
  /** Show the "standard project folder structure" explainer. */
  folder?: boolean;
  fields: Field[];
}

export type LevelId = "L1" | "L2" | "L3";

export interface Level {
  id: LevelId;
  value: string;
  title: string;
  tag: string;
  desc: string;
  timing: string;
  when: string[];
}

// ---------------------------------------------------------------------------------------------
// Group codes. Marketing codes route into the three-level workflow; everything else hands off to
// the existing standard (BAU) intake.
// ---------------------------------------------------------------------------------------------

export const GROUP_CODES = [
  "_Other",
  "000 - BalanceSheet",
  "040 - Portfolio",
  "050 - Delivery/Faculty",
  "055 - Faculty - OnCall",
  "100 - Global Operations",
  "110 - Open Enrollment",
  "115 - Individual Leader Development R&D",
  "120 - Custom Solutions",
  "123 - GM Management",
  "125 - Organizational Leadership strategy",
  "130 - Coaching",
  "133 - Feedback",
  "135 - Feedback Coaching RAD",
  "150 - Licensing",
  "170 - Nonprofit Sector",
  "190 - Core Business R&D",
  "195 - Singapore",
  "199 - Europe",
  "200 - RIPD General",
  "205 - Societal Advancement Operations",
  "210 - Equity Diversity, and Inclusion",
  "215 - Global Research & Evaluation",
  "220 - W.K. Kellogg Foundation Grant",
  "225 - Golden LEAF Foundation Grant",
  "230 - Evaluation",
  "235 - Global Product Development",
  "240 - Programs Service Development",
  "245 - K12 Education",
  "250 - Tools Instruments, & Publications Dev",
  "251 - Health Sector",
  "255 - Research Horizons",
  "260 - CCL Labs",
  "290 - Global Learning Products - Admin.",
  "291 - Assessment Services",
  "292 - Digital Learning Products",
  "293 - Publications",
  "295 - Higher Education",
  "299 - USAID/WLEthiopia Grant",
  "300 - Client & Constituency Relations",
  "310 - Client Services",
  "330 - Alumni Marketing",
  "350 - Business Development",
  "380 - Global Initiatives",
  "500 - Global Marketing Administrative",
  "510 - Planning & Measurements",
  "520 - Global Web Services",
  "530 - Global Marketing Insights & Operations",
  "540 - Global Brand Marketing",
  "550 - SI Development",
  "560 - Global Creative Services",
  "57 - Leadership Development - Staff",
  "570 - Product & Marketing Insights",
  "580 - Global Growth Marketing",
  "700 - Knowledge Management",
  "710 - Information Technology",
  "730 - Knowledge Management",
  "750 - Knowledge Management Systems",
  "770 - Customer Success",
  "771 - Client Relations",
  "772 - Client Support Services",
  "773 - Assessment Operations",
  "780 - Creative Multimedia Technologies",
  "785 - US GAAP",
  "800 - Corporate Resources",
  "810 - Global Human Resources",
  "830 - Financial Systems",
  "840 - Business Strategy",
  "850 - Global Organizational Leadership Develop",
  "861 - Dining Room",
  "862 - GSO Cafe",
  "863 - Building",
  "864 - Interior Maintenance",
  "866 - Distribution Center",
  "867 - FMG - Technical Operations",
  "868 - Printing Services",
  "870 - Corporate",
  "880 - Operations",
  "890 - Office Move",
  "900 - Commercializtion and Innovation",
  "910 - Global Capability enter",
  "920 - Transformation",
  "930 - Administration",
  "940 - COO Office",
  "950 - Presidents Ofice",
  "989 - Strategic Alignment",
  "990 - Innovation Fund",
  "991 - Waddington Trust Fund",
  "992 - Technology -Board Designated Funds",
  "993 - Alfred T. Marrow fund",
  "994 - Board Designated Strategy Funds",
  "995 - CCL PTE LTD-Singapore",
  "996 - Smith Richardson Visiting Fellow Fund",
  "997 - Strategic Fund",
  "998 - Temporarily Restricted Funds",
  "999 - Endowment Fund",
];

export const MARKETING_CODES = ["330", "500", "520", "530", "540", "560", "570", "580", "770"];

export const codeOf = (group?: string) => (group || "").split(" - ")[0].trim();
export const isMarketingGroup = (group?: string) => MARKETING_CODES.includes(codeOf(group));

// ---------------------------------------------------------------------------------------------
// Shared copy
// ---------------------------------------------------------------------------------------------

export const WELCOME_COPY =
  "We'll ask a few questions to understand your request and route it through the appropriate workflow. Most requests take about 5 - 7 minutes to complete.";

export const WELCOME_HELP = {
  lead: "Need help completing the Creative Intake Form?",
  link: "Start HERE.",
};

export const LEVEL_PROMPT = "Select the workflow level that best matches the support you need.";

export const LEVEL_RULES = [
  "The requester selects the level that best reflects the support needed. Creative Studio confirms the level after reviewing the request, scope, inputs, timeline, and resource needs.",
  "If the selected level does not match the work, Creative Studio explains why and offers two paths: reclassify the request or reduce the scope/support to fit the selected level.",
];

export const TURNAROUND_NOTE =
  "The turnaround clock begins only after the request is complete, the scope and level are confirmed, and Creative Studio has the required inputs.";

export const REVIEW_NOTES: Record<LevelId, string[]> = {
  L1: [],
  L2: [
    "With the creative direction established, working materials available, and review responsibilities confirmed, Creative Studio can begin collaborative creative development.",
  ],
  L3: [
    "Level 3 requests may remain staged while discovery, strategic alignment, resourcing, or milestone planning is completed before active production begins.",
    "Significant Creative Director involvement and specialized internal or external resources may be required depending on the scope.",
    "The request owner remains Creative Studio's primary point of contact and manages stakeholder routing, decisions, approvals, and consolidated feedback.",
  ],
};

export const FOLDER_GUIDE = {
  title: "STANDARD PROJECT FOLDER STRUCTURE",
  name: "Folder name: [Request Name]",
  items: [
    "Deliverables List and Channel Plan",
    "Final Approved Copy",
    "Required Assets and Source Files (including specific photography)",
    "References and Research",
    "Reviews and Approvals",
  ],
  body: "The folder should contain everything Creative Studio needs to complete the production-ready work order. If something must remain in another approved system, place a shortcut or link to it in the appropriate subfolder.",
};

const AUDIENCES = [
  "Mid-Level L&D Leader",
  "HR Decision-Maker",
  "C-Suite (non-HR)",
  "Future Participant",
  "Alumni",
  "Partner",
  "Managed Account",
  "Other",
];

const MARKETS = [
  "Global/Multiple Markets",
  "Americas",
  "Europe",
  "India",
  "Singapore",
  "APAC",
  "Middle East",
  "Social Markets",
];

const deliverables = (brochure: string, other: string) => [
  "Advertisement / Paid Media Asset",
  "Article Graphic or Quote",
  brochure,
  "Campaign Messaging or Tagline",
  "Illustration",
  "Infographic",
  "Sales Enablement & Collateral",
  "Slide Deck / Presentation",
  other,
];

const hasPrint = (v: FormValues["x"]) =>
  Array.isArray(v) && v.some((d) => d.startsWith("Brochure"));

const FOLDER_HELP =
  "Provide the link to the Microsoft 365, Teams, SharePoint, or ECM project folder for this request. The folder should contain the complete deliverables list, approved copy, source assets, reference materials, and supporting documentation. Do not link to individual files.";

const VENDOR_HELP =
  "Provide production specifications, templates, file requirements, submission instructions, or a link to the vendor's requirements.";

const OWNER_HELP = "Enter the person's name. This person becomes Creative Studio's primary point of contact.";

// ---------------------------------------------------------------------------------------------
// Basics (every request)
// ---------------------------------------------------------------------------------------------

export const BASICS: Section = {
  id: "basics",
  kicker: "Welcome",
  title: "Let's start with the basics.",
  intro: [],
  fields: [
    { id: "name", label: "Requester Name", type: "text", help: "Your first and last name", cu: "Requester Name" },
    {
      id: "email",
      label: "Requester Email",
      type: "email",
      help: "We'll send your confirmation here.",
      cu: "Requester Email",
      optional: true,
    },
    {
      id: "request",
      label: "Request Name",
      type: "text",
      help: "Enter a descriptive project name",
      cu: "Task name",
    },
    { id: "group", label: "Group Code", type: "group", help: "Please select", cu: "Group Code" },
    { id: "project", label: "Project ID", type: "text", help: "Enter the Project ID", cu: "Project ID" },
  ],
};

// ---------------------------------------------------------------------------------------------
// Workflow levels
// ---------------------------------------------------------------------------------------------

export const LEVELS: Level[] = [
  {
    id: "L1",
    value: "Level 1",
    title: "LEVEL 1 - EFFICIENT EXECUTION",
    tag: "Tell us what to make.",
    desc: "Production-ready, standardized work with clear requirements.",
    timing: "5 - 10 business days. 1 review cycle",
    when: [
      "The request is complete and ready for creative production",
      "Final, approved copy and assets are provided",
      "Deliverables and versions, specifications, URLs, CTAs, required codes, and production instructions are confirmed",
    ],
  },
  {
    id: "L2",
    value: "Level 2",
    title: "LEVEL 2 - GUIDED CREATIVE SUPPORT",
    tag: "Work with us to make it.",
    desc: "Creative work requiring guidance, adaptation, or collaboration within established brand systems.",
    timing: "2 - 4 weeks. 2 planned review cycles",
    when: [
      "The objective, audience, key message, and strategic direction are defined",
      "You need Creative Studio to interpret, adapt, or shape the creative execution",
      "Working copy and materials are available, and you can coordinate milestones, approvals, and consolidated feedback",
    ],
  },
  {
    id: "L3",
    value: "Level 3",
    title: "LEVEL 3 - STRATEGIC CREATIVE PARTNERSHIP",
    tag: "Partner with us to define and make it.",
    desc: "High-visibility, high-impact, or ambiguous work requiring Creative Studio to help define the creative direction.",
    timing: "Project-based, typically 4-8+ weeks. Significant Creative Director involvement.",
    when: [
      "Creative Studio should be engaged early to help define the concept, storytelling approach, or integrated creative direction",
      "The work spans multiple channels, deliverables, or phases, or introduces something new or bespoke",
      "The business challenge, audience, desired outcome, and success measures are defined, while creative direction may still be preliminary",
    ],
  },
];

// ---------------------------------------------------------------------------------------------
// Chapters per level
// ---------------------------------------------------------------------------------------------

export const CHAPTERS: Record<LevelId, Section[]> = {
  L1: [
    {
      id: "l1",
      kicker: "Level 1 · Efficient Execution",
      title: "Ready for production",
      intro: ["Since this request is ready for production, let's confirm everything is in place before work begins."],
      guidance: [
        [
          "Deliverable types",
          "Select the broad deliverable categories, then provide every item Creative Studio should produce and all required versions and specifications.",
        ],
        [
          "Shared project folder",
          "Link to one shared project folder containing everything Creative Studio needs to complete the request. Use the standard folder structure and do not link to an individual file.",
        ],
        [
          "Folder access",
          "Open the folder using the link you provided and confirm that anyone at the Center for Creative Leadership can edit its contents - not only specific individuals.",
        ],
        [
          "Additional production instructions",
          "Include only requirements Creative Studio must follow that are not already captured in the complete deliverables list and specifications.",
        ],
      ],
      folder: true,
      fields: [
        {
          id: "l1_type",
          n: 6,
          label: "Is this a new project or are you requesting updates to existing work?",
          type: "radio",
          options: ["New project", "Update to existing work"],
          help: "Select one.",
          cu: "Request Type",
        },
        {
          id: "l1_purpose",
          n: 7,
          label: "What is the purpose of this request?",
          type: "multi",
          options: ["Accessibility Review", "Brand Review", "Design Execution", "New Vendor Onboarding", "Miscellaneous"],
          help: "Select all that apply.",
          cu: "Primary Purpose",
        },
        {
          id: "l1_deliv",
          n: 8,
          label: "Which creative deliverable is production ready?",
          type: "multi",
          options: deliverables("Brochure (print and/or digital)", "Other (please specify)"),
          help: "Select all that apply. This identifies the broad category; provide the complete work order in the next question.",
          cu: "Deliverables",
        },
        {
          id: "l1_list",
          n: 9,
          label: "Provide the complete deliverables list and specifications.",
          type: "textarea",
          help: "List each item Creative Studio should produce, including all required sizes, formats, versions, cutdowns, thumbnails, languages, markets, URLs, CTAs, and codes. You may enter the list here or place a deliverables-list file in the shared project folder and identify its file name or subfolder.",
          cu: "Fulfillment Instructions",
        },
        {
          id: "l1_aud",
          n: 10,
          label: "Who is the intended audience for this work?",
          type: "multi",
          options: AUDIENCES,
          help: "Select all that apply.",
          cu: "Audience Persona",
        },
        {
          id: "l1_mkt",
          n: 11,
          label: "Select the market(s) your request supports.",
          type: "multi",
          options: MARKETS,
          help: "Select all that apply.",
          cu: "Market(s)",
        },
        {
          id: "l1_folder",
          n: 12,
          label: "Provide the shared project folder.",
          type: "url",
          help: FOLDER_HELP,
          note: "Folder name: [Request Name]",
          cu: "Shared Project Folder",
        },
        {
          id: "l1_print",
          n: 13,
          label: "If this request includes print materials, where will they be produced?",
          type: "radio",
          options: ["Print Center (GSO)", "Outside Vendor", "Not Applicable"],
          cu: "Print Vendor",
        },
        {
          id: "l1_vendor",
          n: 14,
          label: "Link to the vendor requirements.",
          type: "textarea",
          help: VENDOR_HELP,
          cu: "Vendor Specifications",
          showIf: (v) => v.l1_print === "Outside Vendor",
        },
        {
          id: "l1_fixed",
          n: 15,
          label: "Is this request tied to a fixed launch, event, or delivery date?",
          type: "radio",
          options: ["Yes", "No"],
          help: "Select one.",
          cu: "Fixed Date Gate",
        },
        {
          id: "l1_date",
          n: 16,
          label: "What is the fixed date?",
          type: "date",
          help: "Select the date. Creative Studio service standards still apply.",
          cu: "Requested Due Date",
          showIf: (v) => v.l1_fixed === "Yes",
        },
      ],
    },
  ],

  L2: [
    {
      id: "l2c1",
      kicker: "Level 2 · Chapter 1 of 3",
      title: "Let's align on the creative direction.",
      intro: [
        "These questions confirm the direction Marketing has established and identify where Creative Studio should apply creative judgment.",
      ],
      guidance: [
        [
          "Primary message",
          "The single most important idea the audience should take away. This should already be defined by Marketing.",
        ],
        [
          "Creative judgment",
          "The areas where Creative Studio may recommend or shape the execution within the established strategy and brand system.",
        ],
      ],
      fields: [
        {
          id: "l2_type",
          n: 17,
          label: "Is this new work or an update to existing work?",
          type: "radio",
          options: ["New work", "Update to existing work"],
          help: "Select one.",
          cu: "Request Type",
        },
        {
          id: "l2_purpose",
          n: 18,
          label: "What is the purpose of this request?",
          type: "multi",
          options: [
            "Accessibility Review",
            "Brand Review",
            "Copywriting",
            "Design Execution",
            "Proofreading",
            "New Vendor Onboarding",
            "Miscellaneous",
          ],
          help: "Select all that apply.",
          cu: "Primary Purpose",
        },
        {
          id: "l2_aud",
          n: 19,
          label: "Who is the intended audience for this work?",
          type: "multi",
          options: AUDIENCES,
          help: "Select all that apply.",
          cu: "Audience Persona",
        },
        {
          id: "l2_msg",
          n: 20,
          label: "What is the primary message, and what should the audience understand, feel, or do?",
          type: "textarea",
          help: "Summarize the communication objective, key message, and intended audience response.",
          cu: "Primary Objective",
        },
        {
          id: "l2_obj",
          n: 21,
          label: "What is this work intended to accomplish?",
          type: "textarea",
          help: "Briefly describe the communication or business objective this creative work should support.",
          cu: "Objectives",
        },
        {
          id: "l2_support",
          n: 22,
          label: "Where would you like Creative Studio's support?",
          type: "multi",
          options: [
            "Copy Refinement",
            "Creative Concepting",
            "Visual Design",
            "Information Visualization",
            "Adapting Existing Materials",
            "Presentation Design",
            "Creative Consultation",
            "Other (please specify)",
          ],
          help: "Select all that apply.",
          cu: "Creative Support Requested",
        },
        {
          id: "l2_judg",
          n: 23,
          label: "What is already established, and where should Creative Studio use its creative judgment?",
          type: "textarea",
          help: "Identify what is fixed and what may be interpreted, adapted, organized, or developed.",
          cu: "Creative Judgment Notes",
        },
      ],
    },
    {
      id: "l2c2",
      kicker: "Level 2 · Chapter 2 of 3",
      title: "Show us what we're working with.",
      intro: [
        "Provide one organized, accessible project folder containing the working materials Creative Studio will use throughout the project. Materials do not need to be final, but they must be developed enough for creative development to begin.",
      ],
      guidance: [
        [
          "Shared project folder",
          "Link to one shared project folder containing all materials for this request. Use the standard folder structure and confirm that Creative Studio can access the folder and everything within it. Do not link to an individual file.",
        ],
        [
          "Folder access",
          "Open the folder using the link you provided and confirm that anyone at the Center for Creative Leadership can edit its contents - not only specific individuals.",
        ],
        [
          "Deliverables list",
          "Include each item Creative Studio is expected to create and any known versions, sizes, formats, languages, markets, or extensions. If the complete list is already in the shared project folder, identify the file or subfolder where it can be found.",
        ],
        [
          "Required elements or creative boundaries",
          "Anything the Studio must include, preserve, avoid, or follow while developing the creative execution.",
        ],
      ],
      note: "The briefing questions in this form replace a separate creative brief attachment. If something must remain in another approved system, place a shortcut or link to it in the appropriate subfolder.",
      folder: true,
      fields: [
        {
          id: "l2_deliv",
          n: 24,
          label: "Which creative deliverable(s) do you need?",
          type: "multi",
          options: deliverables("Brochure (print or digital)", "Other"),
          help: "Select all that apply.",
          cu: "Deliverables",
        },
        {
          id: "l2_mkt",
          n: 25,
          label: "Select the market(s) your request supports.",
          type: "multi",
          options: MARKETS,
          help: "Select all that apply.",
          cu: "Market(s)",
        },
        {
          id: "l2_folder",
          n: 26,
          label: "Provide the shared project folder.",
          type: "url",
          help: "Link to the Microsoft 365, Teams, SharePoint, or ECM folder containing all working materials for this request. Do not link to an individual file.",
          note: "Folder name: [Request Name]",
          cu: "Shared Project Folder",
        },
        {
          id: "l2_list",
          n: 27,
          label: "Provide the deliverables list.",
          type: "textarea",
          help: "List the known deliverables, versions, sizes, formats, languages, markets, or campaign extensions, or note where this information can be found in the shared project folder above.",
          cu: "Fulfillment Instructions",
        },
        {
          id: "l2_copy",
          n: 28,
          label: "What is the status of the copy?",
          type: "radio",
          options: ["Final and approved", "Working draft available", "Still in development", "Not applicable"],
          help: "Select one.",
          cu: "Copy Status",
        },
        {
          id: "l2_ai",
          n: 29,
          label: "Were AI tools used to develop the copy?",
          type: "radio",
          options: [
            "No - Copy was developed without AI tools",
            "Yes - reviewed and approved - AI was used, and the appropriate Marketing owner has reviewed it for strategic accuracy",
          ],
          help: "Select one.",
          cu: "AI Copy Disclosure",
        },
        {
          id: "l2_bound",
          n: 30,
          label: "Are there any required elements or creative boundaries Creative Studio must follow?",
          type: "textarea",
          help: "Tone, mandatories, brand requirements, accessibility requirements, approved claims, URLs, CTAs, codes, or other non-negotiables.",
          cu: "Creative Boundaries",
        },
      ],
    },
    {
      id: "l2c3",
      kicker: "Level 2 · Chapter 3 of 3",
      title: "Let's confirm timing and review details.",
      intro: [
        "These questions establish the request owner, milestones, and practical requirements Creative Studio should plan around.",
      ],
      guidance: [
        [
          "Request owner",
          "The form submitter is treated as the request owner unless they identify another person. The request owner serves as Creative Studio's primary point of contact and manages stakeholder review, approvals, and consolidated feedback.",
        ],
        [
          "Milestones",
          "Include the draft and approval deadlines that the Creative Studio must comply with to keep this work on schedule, not only the final launch or event date.",
        ],
      ],
      fields: [
        {
          id: "l2_miles",
          n: 31,
          label: "What project milestones or key dates should Creative Studio plan around?",
          type: "textarea",
          help: "Copy ready, stakeholder reviews, approvals, campaign launch, event date, vendor handoff, etc.",
          cu: "Milestones",
        },
        {
          id: "l2_behalf",
          n: 32,
          label: "Are you submitting this request on behalf of someone else?",
          type: "radio",
          options: ["Yes", "No"],
          help: "Select one.",
          cu: "Submitted On Behalf",
        },
        {
          id: "l2_owner",
          n: 33,
          label: "Who is the Marketing Manager or request owner responsible for this work?",
          type: "text",
          help: OWNER_HELP,
          cu: "Request Owner",
          showIf: (v) => v.l2_behalf === "Yes",
        },
        {
          id: "l2_print",
          n: 34,
          label: "If this request includes print materials, where will they be produced?",
          type: "radio",
          options: ["Print Center (GSO)", "Outside Vendor", "Not Applicable"],
          cu: "Print Vendor",
          showIf: (v) => hasPrint(v.l2_deliv),
        },
        {
          id: "l2_vendor",
          n: 35,
          label: "Link to the vendor requirements.",
          type: "textarea",
          help: VENDOR_HELP,
          cu: "Vendor Specifications",
          showIf: (v) => hasPrint(v.l2_deliv) && v.l2_print === "Outside Vendor",
        },
      ],
    },
  ],

  L3: [
    {
      id: "l3c1",
      kicker: "Level 3 · Chapter 1 of 4",
      title: "Tell us about the initiative.",
      intro: [
        "These questions provide the strategic context Creative Studio and the Creative Director need before discovery and creative planning begin.",
      ],
      guidance: [
        [
          "Business outcome",
          "The measurable change or result the initiative is intended to support, not the creative deliverable itself.",
        ],
        [
          "Success measures",
          "Identify how Marketing or the business will know the initiative is working. Measures may be quantitative or qualitative, but should connect to the desired business outcome.",
        ],
        [
          "Initiative stage",
          "Choose the stage that reflects the broader initiative, even if individual deliverables are at different points in development.",
        ],
      ],
      fields: [
        {
          id: "l3_ctx",
          n: 37,
          label: "Tell us about the initiative, opportunity, or challenge.",
          type: "textarea",
          help: "Describe the current situation. What's driving this work? What challenge are we solving for?",
          cu: "Initiative Context",
        },
        {
          id: "l3_outcome",
          n: 38,
          label: "What business outcome are you trying to achieve?",
          type: "textarea",
          help: "Describe the desired outcomes from this work. What are your objectives? How will success be measured?",
          cu: "Business Outcome",
        },
        {
          id: "l3_aud",
          n: 39,
          label: "Who is the intended audience for this work?",
          type: "multi",
          options: AUDIENCES,
          help: "Select all that apply.",
          cu: "Audience Persona",
        },
        {
          id: "l3_insight",
          n: 40,
          label: "What should Creative Studio understand about the intended audience?",
          type: "textarea",
          help: "Share relevant audience needs, perceptions, behaviors, or barriers. What does the audience currently think/feel? What do we want them to think/feel? Provide research if applicable.",
          cu: "Audience Insights",
        },
        {
          id: "l3_success",
          n: 41,
          label: "How will success be measured?",
          type: "textarea",
          help: "What are key KPIs? e.g., impressions, engagement, lead generation, etc.",
          cu: "Success Measures",
        },
      ],
    },
    {
      id: "l3c2",
      kicker: "Level 3 · Chapter 2 of 4",
      title: "Help us understand the creative opportunity.",
      intro: [
        "Level 3 direction may be preliminary. Tell us what is known, what still needs to be defined, and how the parts of the initiative may need to work together.",
      ],
      guidance: [
        [
          "Body of work",
          "Describe the full initiative, not only the first asset. For example: a campaign across paid, owned, and organic channels; strategic video with cutdowns and multiple specifications; or an event rollout spanning pre-event promotion, the event experience, and post-event materials.",
        ],
        [
          "Creative direction",
          "The unifying concept, story, message, and visual approach that connect the work. At Level 3, developing this direction may be part of Creative Studio's role.",
        ],
        [
          "Supporting evidence",
          "Share any evidence that makes the message credible, such as research, audience insights, outcomes, differentiators, data, or testimonials. Preliminary information is acceptable.",
        ],
        [
          "Call to action",
          "The action the audience should take after engaging with the work, such as register, learn more, contact us, download, attend, or share.",
        ],
      ],
      fields: [
        {
          id: "l3_partner",
          n: 43,
          label: "Where do you need Creative Studio's strategic or creative partnership?",
          type: "multi",
          options: [
            "Creative Direction",
            "Concept Development",
            "Campaign or Experience Development",
            "Storytelling and Messaging",
            "Visual System Development",
            "Integrated Deliverable Planning",
            "Strategic Video Development",
            "Vendor or Production Partner Support",
            "Other",
          ],
          help: "Select all that apply.",
          cu: "Strategic Partnership Areas",
        },
        {
          id: "l3_dir",
          n: 44,
          label: "What creative direction is already established, and what should we help define?",
          type: "textarea",
          help: "Identify decisions that are fixed, preliminary, or open for exploration, including messaging, visual direction, storytelling, channel approach, or the relationship among deliverables.",
          cu: "Creative Direction Status",
        },
        {
          id: "l3_deliv",
          n: 45,
          label: "Which creative deliverables do you anticipate this initiative including?",
          type: "multi",
          options: deliverables("Brochure (print or digital)", "Other (please specify)"),
          help: "Select all that apply.",
          cu: "Deliverables",
        },
        {
          id: "l3_mkt",
          n: 46,
          label: "Select the market(s) your request supports.",
          type: "multi",
          options: MARKETS,
          help: "Select all that apply.",
          cu: "Market(s)",
        },
        {
          id: "l3_body",
          n: 47,
          label: "Describe the body of work you anticipate.",
          type: "textarea",
          help: "Include known channels, deliverables, formats, phases, campaign extensions, event touchpoints, video cutdowns, or other connected components. Preliminary information is acceptable.",
          cu: "Body of Work",
        },
        {
          id: "l3_msg",
          n: 48,
          label: "What is the primary message you believe this initiative needs to communicate?",
          type: "textarea",
          help: "A preliminary answer is fine. Let us know if this still needs to be developed or refined.",
          cu: "Primary Objective",
          optional: true,
        },
        {
          id: "l3_evid",
          n: 49,
          label: "What evidence, proof points, research, or audience insights support that message?",
          type: "textarea",
          help: "Share anything currently available. This does not need to be fully developed.",
          cu: "Supporting Evidence",
          optional: true,
        },
        {
          id: "l3_cta",
          n: 50,
          label: "What action should the audience take?",
          type: "textarea",
          help: "Describe the desired call to action, if known. Creative Studio may help develop or refine it.",
          cu: "Call to Action",
          optional: true,
        },
      ],
    },
    {
      id: "l3c3",
      kicker: "Level 3 · Chapter 3 of 4",
      title: "Show us what is already available.",
      intro: [
        "Now that we've established the strategic direction, show us what materials are already available so Creative Studio can begin planning and creative development.",
      ],
      guidance: [
        [
          "Shared project folder",
          "Link to one shared project folder containing the materials available for this initiative. Use the standard folder structure and confirm that Creative Studio can access the folder and everything within it. Do not link to an individual file.",
        ],
        [
          "Folder access",
          "Open the folder using the link you provided and confirm that anyone at the Center for Creative Leadership can edit its contents, not only specific individuals.",
        ],
        [
          "AI-assisted copy",
          "Any AI-assisted copy must be meaningfully reviewed by the appropriate Marketing owner before it is treated as approved direction or used in production.",
        ],
        [
          "Copywriting budget",
          "Identify the amount available specifically for copywriting and proofreading so Creative Studio can determine whether external support or specialized resources are feasible.",
        ],
      ],
      folder: true,
      fields: [
        {
          id: "l3_folder",
          n: 51,
          label: "Provide the shared project folder.",
          type: "url",
          help: "Link to the Microsoft 365, Teams, SharePoint, or ECM folder containing the materials available for this initiative. Do not link to an individual file.",
          note: "Folder name: [Request Name]",
          cu: "Shared Project Folder",
        },
        {
          id: "l3_access",
          n: 52,
          label: "Confirm Creative Studio can access the project folder and all materials within it.",
          type: "checkbox",
          help: "Open the link and verify access before submitting.",
          text: "I have opened the link and confirmed that the Creative Studio team can access the project folder and everything within it.",
          cu: "Folder Access Confirmed",
        },
        {
          id: "l3_copy",
          n: 53,
          label: "What is the status of the copy?",
          type: "radio",
          options: [
            "Final and approved",
            "Working draft available",
            "Copy development is needed",
            "Still being determined",
            "Not applicable",
          ],
          help: "Select one.",
          cu: "Copy Status",
        },
        {
          id: "l3_ai",
          n: 54,
          label: "Were AI tools used to develop any available copy?",
          type: "radio",
          options: ["Yes, reviewed by the appropriate Marketing owner", "Yes, not yet reviewed", "No", "Not sure"],
          help: "Select one.",
          cu: "AI Copy Disclosure",
          showIf: (v) => ["Final and approved", "Working draft available"].includes(String(v.l3_copy)),
        },
        {
          id: "l3_budget",
          n: 55,
          label: "Describe the copywriting and proofreading support you anticipate and the budget available for that work.",
          type: "textarea",
          help: "Include expected needs such as messaging development, long-form copy, scripts, campaign copy, editing, or proofreading. Enter Not applicable if no support is anticipated.",
          cu: "Copy Support & Budget",
        },
        {
          id: "l3_bound",
          n: 56,
          label: "Are there any required elements or creative boundaries Creative Studio must follow?",
          type: "textarea",
          help: "Mandatories, brand or accessibility requirements, approved claims, legal or compliance needs, fixed assets, required photography, URLs, or other non-negotiables.",
          cu: "Creative Boundaries",
        },
      ],
    },
    {
      id: "l3c4",
      kicker: "Level 3 · Chapter 4 of 4",
      title: "Let's confirm timing and decision-making.",
      intro: [
        "Level 3 work requires early visibility, a clear request owner, and an established path for strategic decisions and milestone approvals.",
      ],
      guidance: [
        [
          "Request owner",
          "The form submitter is treated as the request owner unless another person is identified. This person coordinates stakeholders and serves as Creative Studio's primary point of contact throughout the partnership.",
        ],
        [
          "Final decision authority",
          "The person empowered to approve the strategic or creative direction when competing feedback or significant choices arise.",
        ],
        [
          "Milestones",
          "Include the broader initiative timeline, not only the final launch or event date, so Creative Studio can plan discovery, concept development, reviews, production, and handoffs.",
        ],
      ],
      fields: [
        {
          id: "l3_miles",
          n: 57,
          label: "What initiative milestones or key dates should Creative Studio plan around?",
          type: "textarea",
          help: "Business milestones, campaign phases, executive reviews, content readiness, vendor dependencies, launch, activation, event, or post-launch dates.",
          cu: "Milestones",
        },
        {
          id: "l3_behalf",
          n: 58,
          label: "Are you submitting this request on behalf of someone else?",
          type: "radio",
          options: ["Yes", "No"],
          help: "Select one.",
          cu: "Submitted On Behalf",
        },
        {
          id: "l3_owner",
          n: 59,
          label: "Who is the Marketing Manager or request owner responsible for this work?",
          type: "text",
          help: OWNER_HELP,
          cu: "Request Owner",
          showIf: (v) => v.l3_behalf === "Yes",
        },
        {
          id: "l3_auth",
          n: 60,
          label: "Who holds final decision authority, and which leaders must approve major milestones?",
          type: "textarea",
          help: "Identify the final strategic decision-maker and any required leadership approvals. The request owner remains responsible for routing and consolidating feedback.",
          cu: "Decision Authority",
        },
        {
          id: "l3_ack",
          n: 61,
          label: "Confirm the request owner's partnership and approval responsibilities.",
          type: "checkbox",
          help: "If you are not submitting on behalf of someone else, you are the request owner.",
          text: "I understand that the request owner is responsible for coordinating stakeholders, routing work for review, securing decisions and approvals, and providing Creative Studio with one consolidated set of feedback.",
          cu: "Partnership Acknowledgment",
        },
        {
          id: "l3_risk",
          n: 62,
          label: "Are there any constraints, risks, dependencies, or budget considerations we should know?",
          type: "textarea",
          help: "Timing, compliance, executive expectations, fixed launch dates, vendor needs, production requirements, specialized resources, cross-functional dependencies, or overall budget limits.",
          cu: "Constraints & Risks",
        },
        {
          id: "l3_print",
          n: 63,
          label: "If this request includes print materials, where will they be produced?",
          type: "radio",
          options: ["Print Center", "Outside Vendor", "Not Applicable"],
          cu: "Print Vendor",
          showIf: (v) => hasPrint(v.l3_deliv),
        },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------------------------
// Form helpers
// ---------------------------------------------------------------------------------------------

export const isVisible = (field: Field, values: FormValues) => !field.showIf || field.showIf(values);

export const otherKey = (fieldId: string) => `${fieldId}__other`;

/** "Other (please specify)" options reveal a free-text box; plain "Other" does not. */
export const needsSpecify = (option: string) => option.startsWith("Other") && option.includes("specify");

export const asList = (v: FormValues[string]): string[] => (Array.isArray(v) ? v : []);
export const asText = (v: FormValues[string]): string => (typeof v === "string" ? v : "");

const FILE_LINK = /\.(docx?|pdf|pptx?|xlsx?|png|jpe?g|gif|zip|mp4|mov|ai|psd|indd|txt|csv)(\?|#|$)/i;

export function errorFor(field: Field, values: FormValues): string | null {
  const raw = values[field.id];

  if (field.type === "multi") {
    const picked = asList(raw);
    if (!field.optional && picked.length === 0) return "Select at least one option.";
    const other = picked.find((p) => p.startsWith("Other"));
    if (other && needsSpecify(other) && !asText(values[otherKey(field.id)]).trim()) {
      return "Please specify the other option.";
    }
    return null;
  }

  if (field.type === "checkbox") return raw ? null : "Please confirm to continue.";

  const text = asText(raw).trim();
  if (!text) return field.optional ? null : "This field is required.";

  if (field.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)) {
    return "Enter a valid email address.";
  }
  if (field.type === "url") {
    if (!/^https?:\/\/\S+\.\S+/i.test(text)) return "Enter a full link starting with https://";
    if (FILE_LINK.test(text)) return "This looks like an individual file. Link to the project folder instead.";
  }
  return null;
}

export function displayValue(field: Field, values: FormValues): string {
  const raw = values[field.id];
  if (field.type === "multi") {
    return asList(raw)
      .map((o) => (needsSpecify(o) ? `Other: ${asText(values[otherKey(field.id)])}` : o))
      .join(", ");
  }
  if (field.type === "checkbox") return raw ? "Checked" : "";
  return asText(raw);
}

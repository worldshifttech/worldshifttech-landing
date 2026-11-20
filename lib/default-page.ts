// The page a visitor sees when the personalization model cannot answer (model retired, API down,
// bad JSON). It is built in, so the front door never depends on Claude or Supabase to show something.
// Copy rules: no em-dashes, outcomes first, no pricing.

export const DEFAULT_INDUSTRY = "general";
export const DEFAULT_SOLUTION = "overview";

export interface PageContent {
  headline: string;
  problem: string;
  solution_body: string;
  use_cases: { title: string; description: string }[];
}

export const DEFAULT_PAGE: PageContent = {
  headline: "Get your time back from the work that repeats",
  problem:
    "Most small teams lose hours every week to the same handoffs, updates and follow-ups. You are good at the work itself, but the running of it keeps landing on you.",
  solution_body:
    "Drew builds AI helpers and automations that take over the repeat work inside the tools you already use, so your team keeps the judgment calls and loses the busywork.",
  use_cases: [
    {
      title: "Onboarding that runs itself",
      description:
        "A new client or team member gets the right steps, reminders and files without anyone chasing them.",
    },
    {
      title: "Reports without the Friday scramble",
      description:
        "The weekly numbers and status updates are gathered and written for you, ready to read on Monday.",
    },
    {
      title: "Requests sorted before you see them",
      description:
        "Incoming requests are read, sorted and routed to the right person, so you only open what needs you.",
    },
  ],
};

export function isDefaultSlug(industry: string, solution: string): boolean {
  return industry === DEFAULT_INDUSTRY && solution === DEFAULT_SOLUTION;
}

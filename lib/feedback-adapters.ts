// Bridges each managed repo's own, genuinely different feedback-ticket schema behind one
// normalized shape, so the admin UI can list/resolve tickets without knowing repo-specific
// table or column names. Confirmed against each repo's actual schema.sql/migration before
// writing this — not guessed. See NOTES.md Session 51.
//
// Keyed by `repos.github_repo`. Only repos with a real feedback backlog and a Supabase
// project of their own belong here — most repos in the fleet don't need an entry.

export type FeedbackAdapter = {
  table: string;
  openStatuses: string[];
  titleField: string;
  bodyField: string | null;
  resolveField: string;
  resolveValue: string;
  resolveTimestampField: string | null;
};

export const FEEDBACK_ADAPTERS: Record<string, FeedbackAdapter> = {
  // feedback_tickets: id, user_id, title, description, status ('open' | 'in_progress' |
  // 'done'), source_screen, created_at, updated_at. No existing "close" script in this
  // repo (unlike drew-griffiths-speak-easy) — resolveValue 'done' matches its CHECK
  // constraint, chosen this session, not drawn from a prior convention.
  "forgotten-realms-dm": {
    table: "feedback_tickets",
    openStatuses: ["open", "in_progress"],
    titleField: "title",
    bodyField: "description",
    resolveField: "status",
    resolveValue: "done",
    resolveTimestampField: null,
  },
  // app_feedback: id, text, status ('open' | 'planned' | 'closed'), session_number,
  // notes, created_at, closed_at. Matches this repo's own scripts/list-feedback.js and
  // scripts/close-feedback.js exactly.
  "drew-griffiths-speak-easy": {
    table: "app_feedback",
    openStatuses: ["open", "planned"],
    titleField: "text",
    bodyField: "notes",
    resolveField: "status",
    resolveValue: "closed",
    resolveTimestampField: "closed_at",
  },
};

export function getFeedbackAdapter(githubRepo: string): FeedbackAdapter | null {
  return FEEDBACK_ADAPTERS[githubRepo] ?? null;
}

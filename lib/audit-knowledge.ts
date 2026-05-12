import { getSupabase } from './supabase';
import fs from 'fs';
import path from 'path';

export interface AuditKnowledgeBlock {
  tool_slug: string;
  tool_name: string;
  category: string;
  footprint_summary: string;
  reduction_strategies: string;
  audit_questions: string;
  key_metrics: string;
  wst_positioning: string;
}

const TOOL_SLUG_MAP: Record<string, string> = {
  'Zapier': 'zapier',
  'Make': 'make',
  'n8n': 'n8n',
  'HubSpot': 'general',
  'Airtable': 'airtable',
  'Notion': 'notion',
  'ClickUp': 'clickup',
  'Google Sheets': 'general',
  'Slack': 'slack',
  'ChatGPT': 'chatgpt',
  'Claude': 'claude',
  'Gemini': 'gemini',
  'AWS': 'aws',
  'Google Cloud': 'gcp',
  'Vercel': 'vercel',
  'Netlify': 'general',
  'Intercom': 'intercom',
  'Zendesk': 'zendesk',
  'Supabase': 'supabase',
  'GitHub': 'github',
  'GitHub Actions': 'github',
  'Resend': 'resend',
  'Cloudflare': 'cloudflare',
  'Calendly': 'calendly',
  'Fireflies': 'ai-notetaker',
  'Fireflies.ai': 'ai-notetaker',
  'Otter': 'ai-notetaker',
  'Otter.ai': 'ai-notetaker',
  'Fathom': 'ai-notetaker',
  'Read.ai': 'ai-notetaker',
  'Grain': 'ai-notetaker',
  'Notta': 'ai-notetaker',
  'AI Notetaker': 'ai-notetaker',
  'Meeting Notetaker': 'ai-notetaker',
};

const SLUG_TO_FILE: Record<string, string> = {
  'chatgpt': 'chatgpt-openai.md',
  'claude': 'claude-anthropic.md',
  'gemini': 'gemini-google.md',
  'zapier': 'zapier.md',
  'make': 'make.md',
  'n8n': 'n8n.md',
  'clickup': 'clickup.md',
  'notion': 'notion.md',
  'aws': 'aws.md',
  'gcp': 'gcp.md',
  'airtable': 'airtable.md',
  'intercom': 'intercom-zendesk.md',
  'zendesk': 'intercom-zendesk.md',
  'general': 'general-reference.md',
  'vercel': 'vercel.md',
  'supabase': 'supabase.md',
  'github': 'github.md',
  'resend': 'resend.md',
  'cloudflare': 'cloudflare.md',
  'slack': 'slack.md',
  'calendly': 'calendly.md',
  'ai-notetaker': 'ai-notetaker.md',
};

export const ALL_AUDIT_TOOLS = [
  { slug: 'chatgpt',  name: 'ChatGPT / OpenAI',      category: 'AI/LLM',               file: 'chatgpt-openai.md' },
  { slug: 'claude',   name: 'Claude / Anthropic',     category: 'AI/LLM',               file: 'claude-anthropic.md' },
  { slug: 'gemini',   name: 'Gemini / Google AI',     category: 'AI/LLM',               file: 'gemini-google.md' },
  { slug: 'zapier',   name: 'Zapier',                 category: 'Automation',           file: 'zapier.md' },
  { slug: 'make',     name: 'Make (Integromat)',       category: 'Automation',           file: 'make.md' },
  { slug: 'n8n',      name: 'n8n',                    category: 'Automation',           file: 'n8n.md' },
  { slug: 'clickup',  name: 'ClickUp',                category: 'Project Management',   file: 'clickup.md' },
  { slug: 'notion',   name: 'Notion',                 category: 'Project Management',   file: 'notion.md' },
  { slug: 'airtable', name: 'Airtable',               category: 'Project Management',   file: 'airtable.md' },
  { slug: 'aws',      name: 'AWS',                    category: 'Cloud Infrastructure', file: 'aws.md' },
  { slug: 'gcp',      name: 'Google Cloud (GCP)',      category: 'Cloud Infrastructure', file: 'gcp.md' },
  { slug: 'intercom', name: 'Intercom / Zendesk',     category: 'Customer Support',     file: 'intercom-zendesk.md' },
  { slug: 'general',  name: 'General Reference',      category: 'Reference',            file: 'general-reference.md' },
];

export async function getAuditKnowledge(
  q10Tools: string[],
  q10Other?: string
): Promise<AuditKnowledgeBlock[]> {
  if (!q10Tools || q10Tools.length === 0) return [];

  const supabase = getSupabase();

  const slugs = [...new Set(
    q10Tools.map(tool => TOOL_SLUG_MAP[tool] || 'general').filter(Boolean)
  )];

  if (!slugs.includes('general')) slugs.push('general');

  const { data, error } = await supabase
    .from('audit_knowledge')
    .select('*')
    .in('tool_slug', slugs);

  if (error) {
    console.error('[audit-knowledge] Supabase fetch error:', error.message);
    return [];
  }

  return data ?? [];
}

export function formatKnowledgeForPrompt(blocks: AuditKnowledgeBlock[]): string {
  if (!blocks || blocks.length === 0) return '';

  const formatted = blocks.map(block => `
## ${block.tool_name} (${block.category})

**Footprint Summary:**
${block.footprint_summary}

**Reduction Strategies:**
${block.reduction_strategies}

**Key Metrics:**
${block.key_metrics}

**WST Positioning:**
${block.wst_positioning}
`.trim()).join('\n\n---\n\n');

  return `
=== WST AUDIT KNOWLEDGE BASE ===
The following tool-specific sustainability data informs the green_score, green_score_reason, and green_offset_estimate fields. Use the footprint summaries, reduction strategies, and metrics for tools the client mentioned in their answers. Apply WST positioning rules when reasoning about environmental impact.

${formatted}

=== END AUDIT KNOWLEDGE BASE ===
`.trim();
}

export function getAuditDoc(slug: string): string {
  const filename = SLUG_TO_FILE[slug];
  if (!filename) return '# Document not found\n\nNo audit reference document exists for this tool slug.';

  try {
    const filePath = path.join(process.cwd(), 'content', 'audit-knowledge', filename);
    return fs.readFileSync(filePath, 'utf-8');
  } catch (err) {
    console.error(`[audit-knowledge] Failed to read doc for slug "${slug}":`, err);
    return `# Document not found\n\nCould not read the audit reference for "${slug}".`;
  }
}

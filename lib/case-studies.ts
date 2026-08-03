import fs from "fs";
import path from "path";
import matter from "gray-matter";

const CASE_STUDIES_DIR = path.join(process.cwd(), "content", "case-studies");

export function loadCaseStudies(): string {
  if (!fs.existsSync(CASE_STUDIES_DIR)) return "";

  const files = fs.readdirSync(CASE_STUDIES_DIR).filter((f) => f.endsWith(".md"));

  return files
    .map((file) => {
      const content = fs.readFileSync(path.join(CASE_STUDIES_DIR, file), "utf-8");
      return `=== ${file} ===\n${content}`;
    })
    .join("\n\n");
}

export type CaseStudy = {
  slug: string;
  client_type: string;
  industry: string;
  pain_points: string[];
  solution_type: string;
  tools_used: string[];
  results: {
    time_saved?: string;
    roi?: string;
    payback_period?: string;
  };
  headline: string;
  story: string;
};

function slugFromFilename(file: string): string {
  return file.replace(/^case-study-/, "").replace(/\.md$/, "");
}

export function getCaseStudySlugs(): string[] {
  if (!fs.existsSync(CASE_STUDIES_DIR)) return [];
  return fs
    .readdirSync(CASE_STUDIES_DIR)
    .filter((f) => f.endsWith(".md"))
    .map(slugFromFilename);
}

export function getCaseStudy(slug: string): CaseStudy | null {
  const filePath = path.join(CASE_STUDIES_DIR, `case-study-${slug}.md`);
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, "utf-8");
  const { data } = matter(raw);

  return {
    slug,
    client_type: data.client_type ?? "",
    industry: data.industry ?? "",
    pain_points: data.pain_points ?? [],
    solution_type: data.solution_type ?? "",
    tools_used: data.tools_used ?? [],
    results: data.results ?? {},
    headline: data.headline ?? "",
    story: data.story ?? "",
  };
}

export function getStoryParagraphs(story: string): string[] {
  return story
    .trim()
    .split("\n")
    .map((p) => p.trim())
    .filter(Boolean);
}

export function formatLabel(value: string): string {
  return value
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

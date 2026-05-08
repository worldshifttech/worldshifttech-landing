import fs from "fs";
import path from "path";

export function loadCaseStudies(): string {
  const dir = path.join(process.cwd(), "content", "case-studies");

  if (!fs.existsSync(dir)) return "";

  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".md"));

  return files
    .map((file) => {
      const content = fs.readFileSync(path.join(dir, file), "utf-8");
      return `=== ${file} ===\n${content}`;
    })
    .join("\n\n");
}

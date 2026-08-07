import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { getInstallationToken } from "@/lib/github-app";

// Vercel Cron hits this on its own schedule, separate from scheduler-tick — checking
// deployment status is a different concern from dispatching sessions, not worth
// conflating into one route. Same Authorization: Bearer $CRON_SECRET pattern as
// scheduler-tick. See NOTES.md Session 54.
function verifyCron(req: NextRequest): boolean {
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "").trim();
  return Boolean(token) && token === process.env.CRON_SECRET;
}

type DriftResult = {
  repo_id: string;
  repo_name: string;
  checked: boolean;
  reason?: string;
  deployed_sha?: string | null;
  github_head_sha?: string | null;
  drifted?: boolean;
};

export async function GET(req: NextRequest) {
  if (!verifyCron(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const vercelToken = process.env.VERCEL_API_TOKEN;
  const vercelTeamId = process.env.VERCEL_TEAM_ID;
  if (!vercelToken) {
    return NextResponse.json({ error: "VERCEL_API_TOKEN is not set" }, { status: 500 });
  }

  const supabase = getSupabase();

  const { data: repos, error: reposError } = await supabase
    .from("repos")
    .select("id, name, github_owner, github_repo, vercel_project_id, github_app_installation_id")
    .not("vercel_project_id", "is", null)
    .not("github_app_installation_id", "is", null);

  if (reposError) {
    return NextResponse.json({ error: reposError.message }, { status: 500 });
  }

  const results: DriftResult[] = [];

  for (const repo of repos ?? []) {
    try {
      // Vercel's own production deployment record — meta.githubCommitSha is populated
      // automatically by its GitHub integration, confirmed against Vercel's own API docs
      // and community discussions before writing this, not guessed.
      const vercelParams = new URLSearchParams({
        projectId: repo.vercel_project_id as string,
        target: "production",
        limit: "1",
      });
      if (vercelTeamId) vercelParams.set("teamId", vercelTeamId);

      const vercelRes = await fetch(`https://api.vercel.com/v7/deployments?${vercelParams}`, {
        headers: { Authorization: `Bearer ${vercelToken}` },
      });

      if (!vercelRes.ok) {
        results.push({
          repo_id: repo.id,
          repo_name: repo.name,
          checked: false,
          reason: `Vercel API ${vercelRes.status}`,
        });
        continue;
      }

      const vercelData = await vercelRes.json();
      const deployedSha: string | null = vercelData.deployments?.[0]?.meta?.githubCommitSha ?? null;

      // GitHub's default-branch HEAD. Hardcoded to "main" — every repo in the fleet
      // uses it as of this session; a repo on a different default branch would need
      // this made configurable, not worth a new column for a fleet that's currently
      // 100% consistent.
      const installationToken = await getInstallationToken(repo.github_app_installation_id as number);
      const githubRes = await fetch(
        `https://api.github.com/repos/${repo.github_owner}/${repo.github_repo}/commits/main`,
        {
          headers: {
            Authorization: `Bearer ${installationToken}`,
            Accept: "application/vnd.github+json",
          },
        }
      );

      if (!githubRes.ok) {
        results.push({
          repo_id: repo.id,
          repo_name: repo.name,
          checked: false,
          reason: `GitHub API ${githubRes.status}`,
        });
        continue;
      }

      const githubData = await githubRes.json();
      const githubHeadSha: string | null = githubData.sha ?? null;

      await supabase
        .from("repos")
        .update({
          deployed_sha: deployedSha,
          github_head_sha: githubHeadSha,
          drift_checked_at: new Date().toISOString(),
        })
        .eq("id", repo.id);

      results.push({
        repo_id: repo.id,
        repo_name: repo.name,
        checked: true,
        deployed_sha: deployedSha,
        github_head_sha: githubHeadSha,
        drifted: Boolean(deployedSha && githubHeadSha && deployedSha !== githubHeadSha),
      });
    } catch (err) {
      results.push({
        repo_id: repo.id,
        repo_name: repo.name,
        checked: false,
        reason: err instanceof Error ? err.message : "Unknown error",
      });
    }
  }

  return NextResponse.json({ results });
}

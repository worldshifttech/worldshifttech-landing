// Required env vars — set these in Vercel dashboard before deploying:
//   WST_GITHUB_APP_ID
//   WST_GITHUB_APP_PRIVATE_KEY

import { createAppAuth } from "@octokit/auth-app";

// Exchanges the GitHub App for a short-lived (~1 hour) installation token, scoped to
// whatever repos that installation covers. One shared installation across the whole
// fleet + the orchestrator runner repo means a single installationId works for both
// firing repository_dispatch on the runner and (inside the runner's own workflow)
// cloning/pushing to whichever target repo. No caching — installation tokens are cheap
// to mint and this app's request volume doesn't warrant it.
export async function getInstallationToken(installationId: number): Promise<string> {
  const appId = process.env.WST_GITHUB_APP_ID;
  const privateKey = process.env.WST_GITHUB_APP_PRIVATE_KEY;

  if (!appId || !privateKey) {
    throw new Error("WST_GITHUB_APP_ID and WST_GITHUB_APP_PRIVATE_KEY must be set");
  }

  const auth = createAppAuth({ appId, privateKey });
  const { token } = await auth({ type: "installation", installationId });
  return token;
}

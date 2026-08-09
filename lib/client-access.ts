// Cookie name for client hub pages (worldshifttech.com/clients/{slug}) — kept in its own
// tiny helper so a client slug and a project slug can never collide on the same cookie name,
// even though the rest of the access logic (hashPassword, verifyPassword, signAccessToken,
// verifyAccessToken, verifyTurnstile) is already slug-generic and reused directly from
// lib/project-access.ts rather than duplicated here. See NOTES.md Session 76.
export function clientAccessCookieName(slug: string): string {
  return `wst_ca_${slug}`;
}

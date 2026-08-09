// Cloudflare Turnstile's global — loaded via the <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js">
// tag already present on every page that renders a widget, never imported as a module.
// Every call site used to reach it via `(window as any).turnstile`, four separate copies
// of the same `any` cast (app/meet/page.tsx, app/projects/[slug]/FileUploads.tsx,
// app/projects/[slug]/MilestoneActionPanel.tsx, app/projects/[slug]/PasswordGate.tsx) —
// the same long-standing eslint no-explicit-any finding NOTES.md has flagged as
// "pre-existing, unrelated" across a dozen sessions. One real type here, `window.turnstile`
// used directly everywhere, closes the whole category instead of explaining around it.
export {};

declare global {
  interface TurnstileRenderOptions {
    sitekey: string | undefined;
    callback: (token: string) => void;
  }

  interface TurnstileApi {
    render: (container: HTMLElement, options: TurnstileRenderOptions) => void;
  }

  interface Window {
    turnstile?: TurnstileApi;
  }
}

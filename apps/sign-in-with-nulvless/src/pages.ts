const ENTITIES: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ENTITIES[character] ?? character);
}

const STYLES = `
  :root {
    --paper: #fafafc; --surface: #ffffff; --sunken: #f3f2f8; --ink: #1b1830; --muted: #6b6880;
    --line: #e6e3ef; --accent: #5b3df5; --accent-hover: #4a2ee0; --accent-ink: #ffffff;
    --danger: #b42318; --danger-soft: #fef0ee;
    color-scheme: light; font-family: 'Instrument Sans', system-ui, sans-serif; font-size: 15px;
    line-height: 1.55; color: var(--ink); background: var(--paper); -webkit-font-smoothing: antialiased;
  }
  @media (prefers-color-scheme: dark) {
    :root {
      --paper: #0f0e17; --surface: #17151f; --sunken: #1d1a28; --ink: #edebf5; --muted: #9a97ad;
      --line: #2a2737; --accent: #8b74ff; --accent-hover: #a08dff; --accent-ink: #120d2b;
      --danger: #ff8a7a; --danger-soft: #2c1513; color-scheme: dark;
    }
  }
  * { box-sizing: border-box; }
  body { margin: 0; min-height: 100vh; display: grid; place-items: center; padding: 2rem 1rem; }
  main { width: 100%; max-width: 30rem; display: grid; gap: 1.5rem; }
  h1 { margin: 0; font-size: 1.6rem; line-height: 1.2; font-weight: 620; letter-spacing: -0.02em; }
  p { margin: 0; }
  .muted { color: var(--muted); }
  .brand { display: inline-flex; align-items: center; gap: 0.6rem; font-weight: 650; font-size: 1.05rem; }
  .brand-mark { width: 1.6rem; height: 1.6rem; border-radius: 7px; display: grid; place-items: center;
    background: var(--accent); color: var(--accent-ink); font-size: 0.85rem; }
  .panel { display: grid; gap: 1.25rem; padding: 1.75rem; border: 1px solid var(--line); border-radius: 14px;
    background: var(--surface); }
  .heading { display: grid; gap: 0.4rem; }
  .button { font: inherit; font-weight: 580; display: inline-flex; align-items: center; justify-content: center;
    gap: 0.6rem; padding: 0.65rem 1rem; border-radius: 7px; text-decoration: none; border: 1px solid transparent; }
  .button:focus-visible { outline: none; box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 35%, transparent); }
  .button-primary { color: var(--accent-ink); background: var(--accent); }
  .button-primary:hover { background: var(--accent-hover); }
  .button-quiet { color: var(--ink); background: var(--surface); border-color: var(--line); }
  .button-quiet:hover { background: var(--sunken); }
  .claims { margin: 0; display: grid; grid-template-columns: max-content 1fr; gap: 0.5rem 1.5rem; }
  .claims dt { color: var(--muted); }
  .claims dd { margin: 0; overflow-wrap: anywhere; }
  details { border-top: 1px solid var(--line); padding-top: 1rem; }
  summary { cursor: pointer; color: var(--muted); }
  pre { overflow-x: auto; margin: 0.75rem 0 0; padding: 1rem; border-radius: 9px; background: var(--sunken);
    font-size: 0.85rem; }
  .alert { padding: 0.65rem 0.8rem; border-radius: 7px; color: var(--danger); background: var(--danger-soft); }
  .footnote { font-size: 0.87rem; color: var(--muted); text-align: center; }
`;

const KEY_ICON = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="8" cy="15" r="4"/><path d="m11 12 9-9M17 6l3 3M15 8l2 2"/></svg>`;

function page(body: string) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Acme Analytics</title>
    <style>${STYLES}</style>
  </head>
  <body>
    <main>
      <span class="brand"><span class="brand-mark" aria-hidden="true">A</span>Acme Analytics</span>
      ${body}
    </main>
  </body>
</html>`;
}

const CLAIM_LABELS: Record<string, string> = {
  sub: 'User ID',
  name: 'Name',
  email: 'Email',
  email_verified: 'Email confirmed',
  phone_number: 'Phone',
  preferred_username: 'Username',
};

function claimValue(value: unknown) {
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  return String(value);
}

function claimRows(profile: Record<string, unknown>) {
  return Object.entries(CLAIM_LABELS)
    .filter(([claim]) => profile[claim] !== undefined)
    .map(([claim, label]) => `<dt>${label}</dt><dd>${escapeHtml(claimValue(profile[claim]))}</dd>`)
    .join('');
}

export function signedOutPage() {
  return page(`<section class="panel">
      <div class="heading">
        <h1>Sign in to Acme Analytics</h1>
        <p class="muted">A third-party app. It never sees your password: your Nulvless project signs you in and shares
        only the details you approve.</p>
      </div>
      <a class="button button-primary" href="/login">${KEY_ICON}Sign in with Nulvless</a>
    </section>
    <p class="footnote">Uses OAuth 2.1 with PKCE, without an SDK.</p>`);
}

export function signedInPage(profile: Record<string, unknown>) {
  const rows = claimRows(profile);
  return page(`<section class="panel">
      <div class="heading">
        <h1>You're signed in</h1>
        <p class="muted">Your Nulvless project shared these details with Acme Analytics.</p>
      </div>
      ${rows ? `<dl class="claims">${rows}</dl>` : ''}
      <details>
        <summary>Every claim received</summary>
        <pre>${escapeHtml(JSON.stringify(profile, null, 2))}</pre>
      </details>
      <a class="button button-quiet" href="/logout">Sign out of this app</a>
    </section>`);
}

export function failurePage(message: string) {
  return page(`<section class="panel">
      <div class="heading">
        <h1>Sign-in did not finish</h1>
        <p class="alert" role="alert">${escapeHtml(message)}</p>
      </div>
      <a class="button button-primary" href="/login">Try again</a>
    </section>`);
}

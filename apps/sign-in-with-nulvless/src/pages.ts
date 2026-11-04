const ENTITIES: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ENTITIES[character] ?? character);
}

function page(body: string) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Sign in with Nulvless</title>
    <style>
      :root { color-scheme: light dark; font-family: system-ui, sans-serif; }
      body { max-width: 32rem; margin: 4rem auto; padding: 0 1rem; line-height: 1.5; }
      pre { overflow-x: auto; padding: 1rem; border: 1px solid #8884; border-radius: 6px; }
    </style>
  </head>
  <body>${body}</body>
</html>`;
}

export function signedOutPage() {
  return page(`<h1>Acme Analytics</h1>
    <p>A third-party app that lets people sign in with their account on your Nulvless project.</p>
    <p><a href="/login">Sign in with Nulvless</a></p>`);
}

export function signedInPage(profile: Record<string, unknown>) {
  return page(`<h1>Signed in</h1>
    <p>Your Nulvless project shared these claims with this app:</p>
    <pre>${escapeHtml(JSON.stringify(profile, null, 2))}</pre>
    <p><a href="/logout">Sign out of this app</a></p>`);
}

export function failurePage(message: string) {
  return page(`<h1>Sign-in did not finish</h1>
    <p>${escapeHtml(message)}</p>
    <p><a href="/login">Try again</a></p>`);
}

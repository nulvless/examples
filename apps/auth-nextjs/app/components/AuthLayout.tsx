import type { ReactNode } from 'react';

const STEPS = [
  { title: 'Sign in in the browser', call: 'auth.signIn' },
  { title: 'Send the token to your server', call: 'auth.getAccessToken' },
  { title: 'Verify it in a route handler', call: 'auth.verify' },
];

export function AuthLayout({ current, children }: { current: number; children: ReactNode }) {
  return (
    <div className="auth">
      <aside className="auth-aside">
        <a className="brand" href="/">
          <span className="brand-mark" aria-hidden>
            A
          </span>
          Acme
        </a>
        <ol className="flow" aria-label="Sign-in steps">
          {STEPS.map((step, index) => (
            <li
              key={step.title}
              aria-current={index === current ? 'step' : undefined}
              data-done={index < current ? '' : undefined}
            >
              <span className="flow-index">{index + 1}</span>
              <span>
                <span className="flow-title">{step.title}</span>
                <br />
                <code className="flow-call">{step.call}</code>
              </span>
            </li>
          ))}
        </ol>
        <p className="muted">Replace Acme with your product. Every screen here is yours to restyle.</p>
      </aside>
      <main className="auth-main">
        <div className="auth-panel">{children}</div>
      </main>
    </div>
  );
}

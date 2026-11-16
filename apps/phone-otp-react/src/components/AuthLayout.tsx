import type { ReactNode } from 'react';

export interface FlowStep {
  title: string;
  call: string;
}

interface AuthLayoutProps {
  steps: FlowStep[];
  current: number;
  children: ReactNode;
}

export function AuthLayout({ steps, current, children }: AuthLayoutProps) {
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
          {steps.map((step, index) => (
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

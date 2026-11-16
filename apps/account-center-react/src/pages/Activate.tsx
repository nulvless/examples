import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { AuthLayout } from '@/components/AuthLayout';
import { SIGN_UP_STEPS } from '@/lib/flows';
import { nulvless } from '@/lib/nulvless';

type Status = 'confirming' | 'confirmed' | 'failed';

const CONFIRMED_LINKS_KEY = 'acme.confirmed-links';
const activations = new Map<string, Promise<Status>>();

function confirmedLinks(): string[] {
  try {
    return JSON.parse(localStorage.getItem(CONFIRMED_LINKS_KEY) ?? '[]');
  } catch {
    return [];
  }
}

function rememberConfirmed(token: string) {
  try {
    localStorage.setItem(CONFIRMED_LINKS_KEY, JSON.stringify([...confirmedLinks(), token].slice(-10)));
  } catch {
    return;
  }
}

function activateOnce(token: string) {
  if (confirmedLinks().includes(token)) return Promise.resolve<Status>('confirmed');
  let activation = activations.get(token);
  if (!activation) {
    activation = nulvless.auth.activate(token).then(({ error }) => {
      if (error && error.code !== 'user_already_confirmed') return 'failed';
      rememberConfirmed(token);
      return 'confirmed';
    });
    activations.set(token, activation);
  }
  return activation;
}

export function Activate() {
  const [status, setStatus] = useState<Status>('confirming');

  useEffect(() => {
    const token = new URLSearchParams(location.search).get('token');
    if (!token) return setStatus('failed');
    let active = true;
    activateOnce(token).then((result) => active && setStatus(result));
    return () => {
      active = false;
    };
  }, []);

  return (
    <AuthLayout steps={SIGN_UP_STEPS} current={status === 'confirmed' ? 2 : 1}>
      <div className="auth-heading">
        <h1>
          {status === 'confirming' && 'Confirming your email…'}
          {status === 'confirmed' && 'Your email is confirmed'}
          {status === 'failed' && 'This link can no longer be used'}
        </h1>
        <p className="muted">
          {status === 'confirming' && 'This takes a second.'}
          {status === 'confirmed' && 'Your account is ready. Sign in to start using Acme.'}
          {status === 'failed' &&
            'Each link works once and expires after a while. If you already opened it, your account is confirmed: sign in. Otherwise, sign up again to get a new link.'}
        </p>
      </div>
      {status === 'confirmed' && (
        <Link className="button button-primary button-wide" to="/sign-in">
          Sign in
        </Link>
      )}
      {status === 'failed' && (
        <div className="stack" style={{ gap: '0.6rem' }}>
          <Link className="button button-primary button-wide" to="/sign-in">
            Sign in
          </Link>
          <Link className="button button-quiet button-wide" to="/sign-up">
            Sign up again
          </Link>
        </div>
      )}
    </AuthLayout>
  );
}

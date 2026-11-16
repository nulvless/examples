import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { AuthLayout } from '@/components/AuthLayout';
import { SIGN_UP_STEPS } from '@/lib/flows';
import { nulvless } from '@/lib/nulvless';

type Status = 'confirming' | 'confirmed' | 'failed';

export function Activate() {
  const [status, setStatus] = useState<Status>('confirming');

  useEffect(() => {
    const token = new URLSearchParams(location.search).get('token');
    if (!token) return setStatus('failed');
    nulvless.auth.activate(token).then(({ error }) => setStatus(error ? 'failed' : 'confirmed'));
  }, []);

  return (
    <AuthLayout steps={SIGN_UP_STEPS} current={status === 'confirmed' ? 2 : 1}>
      <div className="auth-heading">
        <h1>
          {status === 'confirming' && 'Confirming your email…'}
          {status === 'confirmed' && 'Your email is confirmed'}
          {status === 'failed' && 'This link did not work'}
        </h1>
        <p className="muted">
          {status === 'confirming' && 'This takes a second.'}
          {status === 'confirmed' && 'Your account is ready. Sign in to start using Acme.'}
          {status === 'failed' && 'It may have expired or been used already. Sign up again to get a new one.'}
        </p>
      </div>
      {status !== 'confirming' && (
        <Link className="button button-primary button-wide" to={status === 'confirmed' ? '/sign-in' : '/sign-up'}>
          {status === 'confirmed' ? 'Sign in' : 'Sign up again'}
        </Link>
      )}
    </AuthLayout>
  );
}

import { useState, type FormEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router';
import type { Challenge } from '@nulvless/nulvless-js';
import { AuthLayout } from '@/components/AuthLayout';
import { CodeInput } from '@/components/CodeInput';
import { SIGN_IN_STEPS, SIGN_UP_STEPS } from '@/lib/flows';
import { errorMessage } from '@/lib/format';
import { nulvless } from '@/lib/nulvless';
import { useUser } from '@/lib/user';

interface VerifyState {
  challenge: Challenge;
  flow: 'sign-in' | 'sign-up';
  next: string;
}

function copyFor(challenge: Challenge) {
  if (challenge.preferred === 'totp') return { title: 'Enter your authenticator code', body: 'Open your authenticator app and type the 6-digit code for Acme.' };
  if (challenge.preferred === 'recovery_codes') return { title: 'Enter a recovery code', body: 'Use one of the recovery codes you saved when you turned on two-step sign-in.' };
  const destination = challenge.identifier ?? 'you';
  if (challenge.subject === 'mfa') return { title: 'Check your messages', body: `We sent a 6-digit code to ${destination}.` };
  return { title: 'Confirm your email', body: `We sent a 6-digit code to ${destination}. It confirms the address is yours.` };
}

export function Verify() {
  const navigate = useNavigate();
  const { refreshUser } = useUser();
  const state = useLocation().state as VerifyState | null;
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [expired, setExpired] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!state?.challenge?.token) return <Navigate to="/sign-in" replace />;
  const { challenge, flow, next } = state;
  const copy = copyFor(challenge);

  async function verify(event: FormEvent) {
    event.preventDefault();
    if (code.length < 6 || submitting) return;
    setSubmitting(true);
    setError(null);

    const { data, error: verifyError } = await nulvless.auth.verifyChallenge({ token: challenge.token!, code });
    setSubmitting(false);

    if (verifyError) {
      setCode('');
      if (verifyError.code === 'action_verification_failed') {
        setExpired(true);
        return setError('Too many wrong codes. Start again to get a new one.');
      }
      return setError(errorMessage(verifyError, 'That code is not right. Check it and try again.'));
    }
    if (!data.access_token) return navigate('/sign-in', { replace: true, state: { next } });
    await refreshUser();
    navigate(next, { replace: true });
  }

  return (
    <AuthLayout steps={flow === 'sign-up' ? SIGN_UP_STEPS : SIGN_IN_STEPS} current={1}>
      <div className="auth-heading">
        <h1>{copy.title}</h1>
        <p className="muted">{copy.body}</p>
      </div>
      <form className="stack" onSubmit={verify}>
        <CodeInput value={code} onChange={setCode} invalid={Boolean(error)} disabled={submitting || expired} />
        {error && (
          <p className="alert" role="alert">
            {error}
          </p>
        )}
        <button type="submit" className="button button-primary button-wide" disabled={code.length < 6 || submitting || expired}>
          {submitting && <span className="spinner" aria-hidden />}
          Continue
        </button>
      </form>
      <p className="auth-footer">
        Didn't get a code? <Link to={flow === 'sign-up' ? '/sign-up' : '/sign-in'}>Start again</Link>
      </p>
    </AuthLayout>
  );
}

import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { AuthLayout } from '@/components/AuthLayout';
import { PasswordField } from '@/components/PasswordField';
import { SIGN_IN_STEPS } from '@/lib/flows';
import { errorMessage } from '@/lib/format';
import { nulvless } from '@/lib/nulvless';
import { useUser } from '@/lib/user';

export function SignIn() {
  const navigate = useNavigate();
  const { refreshUser } = useUser();
  const location = useLocation();
  const next = (location.state as { next?: string } | null)?.next ?? '/';
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    const form = new FormData(event.currentTarget);
    setSubmitting(true);
    setError(null);

    const { data, error: signInError } = await nulvless.auth.signIn({
      email: String(form.get('email')),
      password: String(form.get('password')),
    });
    setSubmitting(false);

    if (signInError) {
      if (signInError.code === 'invalid_credentials') return setError('Email or password is incorrect.');
      if (signInError.code === 'user_not_confirmed') return setError('Confirm your email first. Look for the message we sent when you signed up.');
      if (signInError.code === 'user_banned') return setError('This account is suspended. Contact support to restore it.');
      return setError(errorMessage(signInError, 'Could not sign you in. Try again.'));
    }
    if (data.challenge) return navigate('/verify', { state: { challenge: data.challenge, flow: 'sign-in', next } });
    await refreshUser();
    navigate(next, { replace: true });
  }

  return (
    <AuthLayout steps={SIGN_IN_STEPS} current={0}>
      <div className="auth-heading">
        <h1>Sign in to Acme</h1>
        <p className="muted">Use the email and password of your account.</p>
      </div>
      <form className="stack" onSubmit={signIn}>
        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" autoComplete="email" required autoFocus />
        </div>
        <PasswordField id="password" label="Password" autoComplete="current-password" />
        {error && (
          <p className="alert" role="alert">
            {error}
          </p>
        )}
        <button type="submit" className="button button-primary button-wide" disabled={submitting}>
          {submitting && <span className="spinner" aria-hidden />}
          Sign in
        </button>
      </form>
      <p className="auth-footer">
        New to Acme? <Link to="/sign-up">Create an account</Link>
      </p>
    </AuthLayout>
  );
}

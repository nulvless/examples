import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import { AuthLayout } from '@/components/AuthLayout';
import { PasswordField } from '@/components/PasswordField';
import { SIGN_UP_STEPS } from '@/lib/flows';
import { errorMessage } from '@/lib/format';
import { nulvless } from '@/lib/nulvless';
import { useUser } from '@/lib/user';

export function SignUp() {
  const navigate = useNavigate();
  const { refreshUser } = useUser();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function signUp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    const form = new FormData(event.currentTarget);
    const email = String(form.get('email'));
    setSubmitting(true);
    setError(null);

    const { data, error: signUpError } = await nulvless.auth.signUp({
      email,
      password: String(form.get('password')),
      profile: { name: String(form.get('name')).trim() || undefined },
    });
    setSubmitting(false);

    if (signUpError) {
      if (signUpError.code === 'email_already_exists') return setError('An account with this email already exists. Sign in instead.');
      if (signUpError.code === 'password_weak') return setError('Choose a stronger password: longer, with letters, numbers and symbols.');
      if (signUpError.code === 'password_leaked') return setError('This password appeared in a data breach. Choose a different one.');
      if (signUpError.code === 'registration_closed') return setError('Sign-up is closed for now.');
      return setError(errorMessage(signUpError, 'Could not create your account. Try again.'));
    }

    const challenge = data.challenge;
    if (challenge?.preferred === 'link' || (!challenge && !data.access_token)) {
      return navigate('/check-email', { state: { email: challenge?.identifier ?? email } });
    }
    if (challenge) return navigate('/verify', { state: { challenge, flow: 'sign-up', next: '/' } });
    await refreshUser();
    navigate('/', { replace: true });
  }

  return (
    <AuthLayout steps={SIGN_UP_STEPS} current={0}>
      <div className="auth-heading">
        <h1>Create your Acme account</h1>
        <p className="muted">It takes a minute. You can change your details later.</p>
      </div>
      <form className="stack" onSubmit={signUp}>
        <div className="field">
          <label htmlFor="name">Name</label>
          <input id="name" name="name" autoComplete="name" autoFocus />
        </div>
        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" autoComplete="email" required />
        </div>
        <PasswordField
          id="password"
          label="Password"
          autoComplete="new-password"
          hint="Your project's password rules apply, such as length and leaked-password checks."
        />
        {error && (
          <p className="alert" role="alert">
            {error}
          </p>
        )}
        <button type="submit" className="button button-primary button-wide" disabled={submitting}>
          {submitting && <span className="spinner" aria-hidden />}
          Create account
        </button>
      </form>
      <p className="auth-footer">
        Already have an account? <Link to="/sign-in">Sign in</Link>
      </p>
    </AuthLayout>
  );
}

'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { AuthLayout } from '@/app/components/AuthLayout';
import { nulvless } from '@/lib/nulvless';

export default function SignIn() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function signIn(formData: FormData) {
    setError(null);
    setSubmitting(true);
    const { data, error } = await nulvless.auth.signIn({
      email: String(formData.get('email')),
      password: String(formData.get('password')),
    });
    setSubmitting(false);

    if (error) return setError('Email or password is incorrect.');
    if (data.challenge) return setError('This account uses two-step sign-in. Add a verification step to finish signing in.');

    router.push('/dashboard');
  }

  return (
    <AuthLayout current={0}>
      <div className="auth-heading">
        <h1>Sign in to Acme</h1>
        <p className="muted">Use the email and password of a user in your Nulvless project.</p>
      </div>
      <form className="stack" action={signIn}>
        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" autoComplete="email" required autoFocus />
        </div>
        <div className="field">
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <label htmlFor="password">Password</label>
            <button type="button" className="button-link" style={{ fontSize: '0.84rem' }} onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
          <input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            required
          />
        </div>
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
    </AuthLayout>
  );
}

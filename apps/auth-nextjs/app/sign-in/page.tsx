'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { nulvless } from '@/lib/nulvless';

export default function SignIn() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  async function signIn(formData: FormData) {
    setError(null);
    const { data, error } = await nulvless.auth.signIn({
      email: String(formData.get('email')),
      password: String(formData.get('password')),
    });

    if (error) return setError('Check your email and password.');
    if (data.challenge) return setError('This account uses MFA. Add a verification step to finish signing in.');

    router.push('/dashboard');
  }

  return (
    <main>
      <h1>Sign in</h1>
      <form action={signIn}>
        <input name="email" type="email" placeholder="Email" autoComplete="email" required />
        <input name="password" type="password" placeholder="Password" autoComplete="current-password" required />
        {error && <p role="alert">{error}</p>}
        <button type="submit">Sign in</button>
      </form>
    </main>
  );
}

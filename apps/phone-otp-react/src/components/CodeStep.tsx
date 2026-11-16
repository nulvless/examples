import { useEffect, useState, type FormEvent } from 'react';
import type { Challenge, Phone } from '@nulvless/nulvless-js';
import { CodeInput } from '@/components/CodeInput';
import { errorMessage } from '@/lib/errors';
import { nulvless } from '@/lib/nulvless';

const RESEND_AFTER_SECONDS = 30;

interface CodeStepProps {
  phone: Phone;
  challenge: Challenge;
  onResent: (challenge: Challenge) => void;
  onChangeNumber: () => void;
  onSignedIn: () => void;
}

export function CodeStep({ phone, challenge, onResent, onChangeNumber, onSignedIn }: CodeStepProps) {
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [locked, setLocked] = useState(false);
  const [wait, setWait] = useState(RESEND_AFTER_SECONDS);

  useEffect(() => {
    if (wait <= 0) return;
    const timer = setTimeout(() => setWait(wait - 1), 1000);
    return () => clearTimeout(timer);
  }, [wait]);

  async function verify(event?: FormEvent) {
    event?.preventDefault();
    if (code.length < 6 || verifying || !challenge.token) return;
    setVerifying(true);
    setError(null);
    setNotice(null);
    const { data, error: verifyError } = await nulvless.auth.verifyChallenge({ token: challenge.token, code });
    setVerifying(false);

    if (verifyError) {
      setCode('');
      if (verifyError.code === 'action_verification_failed') {
        setLocked(true);
        return setError('Too many wrong codes. Send a new one to try again.');
      }
      return setError(errorMessage(verifyError, 'That code is not right. Check the message and try again.'));
    }
    if (data.access_token) onSignedIn();
  }

  async function resend() {
    setError(null);
    setNotice(null);
    const { data, error: otpError } = await nulvless.auth.signInWithOTP({ phone });
    if (otpError) return setError(errorMessage(otpError, 'Could not send a new code. Try again in a moment.'));
    setCode('');
    setLocked(false);
    setWait(RESEND_AFTER_SECONDS);
    setNotice('A new code is on its way. Use only the latest one.');
    onResent(data);
  }

  return (
    <>
      <div className="auth-heading">
        <h1>Enter the code</h1>
        <p className="muted">
          We texted a 6-digit code to {challenge.identifier ?? `${phone.country_code} ${phone.number}`}.{' '}
          <button type="button" className="button-link" onClick={onChangeNumber}>
            Change number
          </button>
        </p>
      </div>
      <form className="stack" onSubmit={verify}>
        <CodeInput value={code} onChange={setCode} invalid={Boolean(error)} disabled={verifying || locked} />
        {error && (
          <p className="alert" role="alert">
            {error}
          </p>
        )}
        {notice && (
          <p className="notice" role="status">
            {notice}
          </p>
        )}
        <button type="submit" className="button button-primary button-wide" disabled={code.length < 6 || verifying || locked}>
          {verifying && <span className="spinner" aria-hidden />}
          Sign in
        </button>
      </form>
      <p className="auth-footer">
        {wait > 0 ? (
          `You can ask for a new code in ${wait}s.`
        ) : (
          <>
            Didn't get it?{' '}
            <button type="button" className="button-link" onClick={resend}>
              Send a new code
            </button>
          </>
        )}
      </p>
    </>
  );
}

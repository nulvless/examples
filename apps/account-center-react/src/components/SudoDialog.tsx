import { useEffect, useRef, useState, type FormEvent } from 'react';
import type { Challenge, NulvlessError } from '@nulvless/nulvless-js';
import { CodeInput } from '@/components/CodeInput';
import { nulvless } from '@/lib/nulvless';
import { errorMessage } from '@/lib/format';

interface SudoDialogProps {
  action: string | null;
  onCancel: () => void;
  onConfirm: (code: string) => Promise<NulvlessError | null>;
}

function instructions(challenge: Challenge | null) {
  if (!challenge) return 'Sending a confirmation code…';
  if (challenge.preferred === 'totp') return 'Enter the 6-digit code from your authenticator app.';
  return `We sent a 6-digit code to ${challenge.identifier ?? 'your account'}.`;
}

export function SudoDialog({ action, onCancel, onConfirm }: SudoDialogProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!action) {
      dialog.current?.close();
      return;
    }
    setChallenge(null);
    setCode('');
    setError(null);
    dialog.current?.showModal();
    nulvless.auth.sessions.sudo().then(({ data, error: sudoError }) => {
      if (sudoError) setError(errorMessage(sudoError, 'Could not send a confirmation code. Try again.'));
      else setChallenge(data.challenge ?? null);
    });
  }, [action]);

  async function confirm(event: FormEvent) {
    event.preventDefault();
    if (code.length < 6 || submitting) return;
    setSubmitting(true);
    setError(null);
    const confirmError = await onConfirm(code);
    setSubmitting(false);
    if (!confirmError) return;
    setCode('');
    setError(
      confirmError.code === 'action_verification_failed'
        ? 'Too many wrong codes. Close this and start again.'
        : 'That code is not right. Check it and try again.',
    );
  }

  return (
    <dialog ref={dialog} className="dialog" onCancel={onCancel} aria-labelledby="sudo-title">
      <form className="stack" onSubmit={confirm}>
        <div className="stack" style={{ gap: '0.4rem' }}>
          <h2 id="sudo-title">Confirm it's you</h2>
          <p className="muted">
            To {action}, confirm your identity. {instructions(challenge)}
          </p>
        </div>
        <CodeInput value={code} onChange={setCode} invalid={Boolean(error)} disabled={submitting} />
        {error && (
          <p className="alert" role="alert">
            {error}
          </p>
        )}
        <div className="dialog-actions">
          <button type="button" className="button button-quiet" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="button button-primary" disabled={code.length < 6 || submitting}>
            {submitting && <span className="spinner" aria-hidden />}
            Confirm
          </button>
        </div>
      </form>
    </dialog>
  );
}

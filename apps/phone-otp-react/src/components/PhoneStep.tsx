import { useState, type FormEvent } from 'react';
import type { Challenge, Phone } from '@nulvless/nulvless-js';
import { COUNTRIES } from '@/lib/countries';
import { errorMessage } from '@/lib/errors';
import { nulvless } from '@/lib/nulvless';

interface PhoneStepProps {
  initial: Phone | null;
  onSent: (phone: Phone, challenge: Challenge) => void;
}

export function PhoneStep({ initial, onSent }: PhoneStepProps) {
  const [countryIndex, setCountryIndex] = useState(() => {
    const found = COUNTRIES.findIndex((country) => country.dialCode === initial?.country_code);
    return found >= 0 ? found : COUNTRIES.findIndex((country) => country.name === 'United States');
  });
  const [number, setNumber] = useState(initial?.number ?? '');
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  async function send(event: FormEvent) {
    event.preventDefault();
    const digits = number.replace(/\D/g, '');
    if (digits.length < 6) return setError('Enter your full phone number, without the country code.');
    if (sending) return;

    const phone = { country_code: COUNTRIES[countryIndex]!.dialCode, number: digits };
    setSending(true);
    setError(null);
    const { data, error: otpError } = await nulvless.auth.signInWithOTP({ phone });
    setSending(false);

    if (otpError) return setError(errorMessage(otpError, 'Could not send the code. Check the number and try again.'));
    onSent(phone, data);
  }

  return (
    <>
      <div className="auth-heading">
        <h1>Sign in with your phone</h1>
        <p className="muted">We'll text you a 6-digit code. No password needed.</p>
      </div>
      <form className="stack" onSubmit={send}>
        <div className="field">
          <label htmlFor="country">Country</label>
          <select id="country" value={countryIndex} onChange={(event) => setCountryIndex(Number(event.target.value))}>
            {COUNTRIES.map((country, index) => (
              <option key={country.name} value={index}>
                {country.name} ({country.dialCode})
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="phone">Phone number</label>
          <div className="phone-input">
            <span aria-hidden>{COUNTRIES[countryIndex]!.dialCode}</span>
            <input
              id="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel-national"
              value={number}
              onChange={(event) => setNumber(event.target.value)}
              aria-invalid={Boolean(error) || undefined}
              autoFocus
              required
            />
          </div>
        </div>
        {error && (
          <p className="alert" role="alert">
            {error}
          </p>
        )}
        <button type="submit" className="button button-primary button-wide" disabled={sending}>
          {sending && <span className="spinner" aria-hidden />}
          Text me a code
        </button>
      </form>
      <p className="auth-footer">Message and data rates may apply.</p>
    </>
  );
}

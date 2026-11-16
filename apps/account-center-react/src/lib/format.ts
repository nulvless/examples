import type { NulvlessError, Session, User } from '@nulvless/nulvless-js';

const relative = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ['year', 365 * 24 * 3600],
  ['month', 30 * 24 * 3600],
  ['week', 7 * 24 * 3600],
  ['day', 24 * 3600],
  ['hour', 3600],
  ['minute', 60],
];

export function timeAgo(date: string | undefined) {
  if (!date) return 'unknown';
  const seconds = (new Date(date).getTime() - Date.now()) / 1000;
  for (const [unit, size] of UNITS) {
    if (Math.abs(seconds) >= size) return relative.format(Math.round(seconds / size), unit);
  }
  return 'just now';
}

export function longDate(date: string | undefined) {
  if (!date) return 'unknown';
  return new Date(date).toLocaleDateString('en', { year: 'numeric', month: 'long', day: 'numeric' });
}

export function displayName(user: User) {
  return user.profile?.name ?? user.username ?? user.email ?? 'Your account';
}

export function initials(user: User) {
  const source = user.profile?.name ?? user.username ?? user.email ?? '?';
  const words = source.split(/[\s@._-]+/).filter(Boolean);
  return words
    .slice(0, 2)
    .map((word) => word[0]!.toUpperCase())
    .join('');
}

export function phoneNumber(user: User) {
  return user.phone ? `${user.phone.country_code} ${user.phone.number}` : undefined;
}

export function deviceName(session: Session) {
  const browser = session.finger_print?.browser?.name;
  const os = session.finger_print?.os?.name;
  if (browser && os) return `${browser} on ${os}`;
  return browser ?? os ?? 'Unknown device';
}

export function isMobile(session: Session) {
  const type = session.finger_print?.device?.type;
  return type === 'mobile' || type === 'tablet';
}

export function place(session: Session) {
  const location = session.finger_print?.location;
  return [location?.city, location?.country].filter(Boolean).join(', ') || undefined;
}

const METHODS: Record<string, string> = {
  password: 'password',
  pwd: 'password',
  email_password: 'password',
  username_password: 'password',
  phone_password: 'password',
  email_otp: 'email code',
  sms_otp: 'SMS code',
  otp: 'one-time code',
  totp: 'authenticator app',
  recovery_codes: 'recovery code',
  oauth: 'social account',
  link: 'email link',
};

export function methodNames(session: Session) {
  const names = [...new Set(session.amr.map(({ method }) => METHODS[method] ?? method.replaceAll('_', ' ')))];
  return names.length ? names.join(' and ') : undefined;
}

export function signInMethods(session: Session) {
  const names = methodNames(session);
  return names ? `Signed in with ${names}` : undefined;
}

export function errorMessage(error: NulvlessError, fallback: string) {
  if (error.code === 'rate_limit_exceeded') return 'Too many attempts. Wait a minute and try again.';
  if (error.code === 'network_error' || error.code === 'request_timeout') return 'Could not reach the server. Check your connection and try again.';
  const message = Array.isArray(error.message) ? error.message.join(' ') : error.message;
  return message || fallback;
}

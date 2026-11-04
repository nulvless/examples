import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { exchangeCode, fetchUserInfo, startSignIn, type OAuthConfig, type PendingSignIn } from './oauth.ts';
import { failurePage, signedInPage, signedOutPage } from './pages.ts';
import { randomToken } from './pkce.ts';

const config: OAuthConfig = {
  issuer: process.env.NULVLESS_ISSUER!,
  clientId: process.env.OAUTH_CLIENT_ID!,
  clientSecret: process.env.OAUTH_CLIENT_SECRET || undefined,
  redirectUri: process.env.REDIRECT_URI ?? 'http://localhost:3000/callback',
};

const SESSION_COOKIE = 'sid';
const PENDING_COOKIE = 'pending';
const pendingSignIns = new Map<string, PendingSignIn>();
const profiles = new Map<string, Record<string, unknown>>();

function cookie(req: IncomingMessage, name: string) {
  const match = req.headers.cookie?.split(';').find((part) => part.trim().startsWith(`${name}=`));
  return match?.split('=')[1]?.trim();
}

function setCookie(res: ServerResponse, name: string, value: string, maxAgeSeconds: number) {
  res.appendHeader('Set-Cookie', `${name}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAgeSeconds}`);
}

function send(res: ServerResponse, status: number, html: string) {
  res.writeHead(status, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' }).end(html);
}

function redirect(res: ServerResponse, location: string) {
  res.writeHead(302, { location, 'cache-control': 'no-store' }).end();
}

async function callback(req: IncomingMessage, res: ServerResponse, url: URL) {
  const pendingId = cookie(req, PENDING_COOKIE);
  const pending = pendingId ? pendingSignIns.get(pendingId) : undefined;
  if (pendingId) pendingSignIns.delete(pendingId);
  setCookie(res, PENDING_COOKIE, '', 0);

  if (url.searchParams.get('error')) return send(res, 400, failurePage('You did not approve the request.'));
  if (!pending || url.searchParams.get('state') !== pending.state) {
    return send(res, 400, failurePage('The sign-in request expired or did not start here.'));
  }

  const tokens = await exchangeCode(config, url.searchParams.get('code') ?? '', pending.verifier);
  const sessionId = randomToken();
  profiles.set(sessionId, await fetchUserInfo(config, tokens.access_token));
  setCookie(res, SESSION_COOKIE, sessionId, tokens.expires_in);
  redirect(res, '/');
}

async function route(req: IncomingMessage, res: ServerResponse) {
  const url = new URL(req.url ?? '/', config.redirectUri);

  switch (url.pathname) {
    case '/': {
      const profile = profiles.get(cookie(req, SESSION_COOKIE) ?? '');
      return send(res, 200, profile ? signedInPage(profile) : signedOutPage());
    }
    case '/login': {
      const { url: authorizeUrl, pending } = startSignIn(config);
      const pendingId = randomToken();
      pendingSignIns.set(pendingId, pending);
      setCookie(res, PENDING_COOKIE, pendingId, 600);
      return redirect(res, authorizeUrl);
    }
    case new URL(config.redirectUri).pathname:
      return callback(req, res, url);
    case '/logout':
      profiles.delete(cookie(req, SESSION_COOKIE) ?? '');
      setCookie(res, SESSION_COOKIE, '', 0);
      return redirect(res, '/');
    default:
      return send(res, 404, failurePage('There is nothing here.'));
  }
}

const port = Number(process.env.PORT ?? 3000);

createServer((req, res) => {
  route(req, res).catch((error: Error) => send(res, 502, failurePage(error.message)));
}).listen(port, () => console.log(`Open http://localhost:${port}`));

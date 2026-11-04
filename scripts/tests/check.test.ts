import assert from 'node:assert/strict';
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { describe, it } from 'node:test';
import { findProblems } from '../check.ts';

async function workspace(files: Record<string, string>) {
  const root = await mkdtemp(join(tmpdir(), 'examples-'));
  for (const [path, content] of Object.entries(files)) {
    await mkdir(dirname(join(root, path)), { recursive: true });
    await writeFile(join(root, path), content);
  }
  return root;
}

const manifest = (fields: Record<string, unknown>) =>
  JSON.stringify({ title: 'Hello', description: 'Answers with a greeting.', features: ['edge-functions'], ...fields });

const validFunction = {
  'functions/hello/index.ts': '',
  'functions/hello/deno.json': '{}',
  'functions/hello/README.md': '# Hello',
  'functions/hello/example.json': manifest({ kind: 'function' }),
};

describe('findProblems', () => {
  it('accepts a complete function', async () => {
    assert.deepEqual(await findProblems(await workspace(validFunction)), []);
  });

  it('accepts a complete app', async () => {
    const root = await workspace({
      'apps/auth-vue/README.md': '# Vue',
      'apps/auth-vue/.env.example': 'VITE_NULVLESS_URL=',
      'apps/auth-vue/package.json': '{}',
      'apps/auth-vue/example.json': manifest({ kind: 'app' }),
    });

    assert.deepEqual(await findProblems(root), []);
  });

  it('rejects a manifest that does not match the schema', async () => {
    const root = await workspace({
      ...validFunction,
      'functions/hello/example.json': manifest({ kind: 'function', features: ['teleport'] }),
    });

    const [problem] = await findProblems(root);
    assert.match(problem ?? '', /^functions\/hello: example\.json \/features\/0 must be equal to one of the allowed values/);
  });

  it('rejects a kind that does not match its folder', async () => {
    const root = await workspace({ ...validFunction, 'functions/hello/example.json': manifest({ kind: 'app' }) });

    assert.deepEqual(await findProblems(root), ['functions/hello: kind "app" belongs in apps/.']);
  });

  it('rejects folder names that are not kebab-case', async () => {
    const root = await workspace({
      'functions/Hello_World/index.ts': '',
      'functions/Hello_World/deno.json': '{}',
      'functions/Hello_World/README.md': '',
      'functions/Hello_World/example.json': manifest({ kind: 'function' }),
    });

    assert.deepEqual(await findProblems(root), ['functions/Hello_World: use a lowercase kebab-case name.']);
  });

  it('rejects a function without an entrypoint or with files a deploy refuses', async () => {
    const root = await workspace({
      'functions/hello/main.ts': '',
      'functions/hello/data.csv': '',
      'functions/hello/README.md': '',
      'functions/hello/example.json': manifest({ kind: 'function' }),
    });

    assert.deepEqual(await findProblems(root), [
      'functions/hello: missing index.ts.',
      'functions/hello: missing deno.json.',
      'functions/hello: data.csv cannot be deployed; use .ts, .tsx, .js, .jsx, .mjs, deno.json or .npmrc.',
    ]);
  });

  it('asks every example for a README and every app for an .env.example', async () => {
    const root = await workspace({
      'apps/web/package.json': '{}',
      'apps/web/example.json': manifest({ kind: 'app' }),
    });

    assert.deepEqual(await findProblems(root), ['apps/web: missing README.md.', 'apps/web: missing .env.example.']);
  });

  it('reports a missing manifest', async () => {
    const root = await workspace({ 'functions/hello/index.ts': '', 'functions/hello/README.md': '' });

    assert.deepEqual(await findProblems(root), ['functions/hello: missing example.json.']);
  });

  it('accepts a complete template', async () => {
    const root = await workspace({
      'templates/email/welcome-user/en-US.html': '<p>Welcome to {{platform.name}}</p>',
      'templates/email/welcome-user/README.md': '# Welcome',
      'templates/email/welcome-user/example.json': JSON.stringify({
        title: 'Welcome email',
        description: 'Sent when an account is created.',
        kind: 'template',
        features: ['comms'],
        subject: { 'en-US': 'Welcome to {{platform.name}}' },
        variables: ['platform.name'],
      }),
    });

    assert.deepEqual(await findProblems(root), []);
  });

  it('checks the files, subjects and variables of a template', async () => {
    const root = await workspace({
      'templates/sms/login-code/en-US.html': '{{code}}',
      'templates/sms/login-code/es.txt': '{{code}}',
      'templates/sms/login-code/pt-BR.txt': 'Código: {{code}}',
      'templates/sms/login-code/README.md': '# Code',
      'templates/sms/login-code/example.json': JSON.stringify({
        title: 'Login code',
        description: 'Sent when a user signs in with a code.',
        kind: 'template',
        features: ['comms'],
        variables: ['platform.name'],
      }),
    });

    assert.deepEqual(await findProblems(root), [
      'templates/sms/login-code: missing en-US.txt.',
      'templates/sms/login-code: en-US.html is not a template file; use <language>.txt with en-US or pt-BR.',
      'templates/sms/login-code: es.txt is not a template file; use <language>.txt with en-US or pt-BR.',
      'templates/sms/login-code: {{code}} is used but not listed in variables.',
      'templates/sms/login-code: platform.name is listed in variables but never used.',
    ]);
  });

  it('asks every email template language for a subject', async () => {
    const root = await workspace({
      'templates/email/welcome-user/en-US.html': 'Hi',
      'templates/email/welcome-user/pt-BR.html': 'Oi',
      'templates/email/welcome-user/README.md': '# Welcome',
      'templates/email/welcome-user/example.json': JSON.stringify({
        title: 'Welcome email',
        description: 'Sent when an account is created.',
        kind: 'template',
        features: ['comms'],
        subject: { 'en-US': 'Welcome' },
        variables: [],
      }),
    });

    assert.deepEqual(await findProblems(root), ['templates/email/welcome-user: pt-BR.html has no subject in example.json.']);
  });

  it('accepts templates only in email and sms folders, with unique names', async () => {
    const template = JSON.stringify({ title: 'Code', description: 'Sent with a one-time code.', kind: 'template', features: ['comms'], variables: [] });
    const root = await workspace({
      'templates/fax/code/en-US.txt': 'x',
      'templates/fax/code/README.md': '',
      'templates/fax/code/example.json': template,
      'templates/sms/hello/en-US.txt': 'x',
      'templates/sms/hello/README.md': '',
      'templates/sms/hello/example.json': template,
      'functions/hello/index.ts': '',
      'functions/hello/deno.json': '{}',
      'functions/hello/README.md': '',
      'functions/hello/example.json': manifest({ kind: 'function' }),
    });

    assert.deepEqual(await findProblems(root), [
      'templates/fax/code: fax is not a channel; put templates in templates/email or templates/sms.',
      'templates/sms/hello: the name hello is already used by functions/hello; the CLI installs examples by name.',
    ]);
  });
});


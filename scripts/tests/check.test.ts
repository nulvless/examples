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
});

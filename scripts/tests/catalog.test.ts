import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { describe, it } from 'node:test';
import { buildCatalog, renderLlmsTxt, renderReadmeTable, replaceCatalogSection } from '../catalog.ts';

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

describe('buildCatalog', () => {
  it('lists functions with only the files a deploy accepts', async () => {
    const root = await workspace({
      'functions/hello/index.ts': 'export default () => new Response("hi");',
      'functions/hello/deno.json': '{}',
      'functions/hello/README.md': '# Hello',
      'functions/hello/example.json': manifest({ kind: 'function' }),
    });

    const catalog = await buildCatalog(root);

    assert.deepEqual(catalog.examples, [
      {
        name: 'hello',
        kind: 'function',
        path: 'functions/hello',
        title: 'Hello',
        description: 'Answers with a greeting.',
        features: ['edge-functions'],
        frameworks: [],
        secrets: [],
        minCliVersion: '0.2.0',
        files: ['deno.json', 'index.ts'],
      },
    ]);
  });

  it('lists every app file except the manifest and what is never committed', async () => {
    const root = await workspace({
      'apps/auth-vue/package.json': '{}',
      'apps/auth-vue/README.md': '# Vue',
      'apps/auth-vue/src/main.ts': '',
      'apps/auth-vue/.env.example': 'VITE_NULVLESS_URL=',
      'apps/auth-vue/.env.local': 'SECRET=1',
      'apps/auth-vue/node_modules/vue/index.js': '',
      'apps/auth-vue/example.json': manifest({ kind: 'app', frameworks: ['vue'], minCliVersion: '0.3.0' }),
    });

    const [app] = (await buildCatalog(root)).examples;

    assert.equal(app?.minCliVersion, '0.3.0');
    assert.deepEqual(app?.files, ['.env.example', 'README.md', 'package.json', 'src/main.ts']);
  });

  it('sorts examples by kind and name', async () => {
    const root = await workspace({
      'functions/zeta/index.ts': '',
      'functions/zeta/example.json': manifest({ kind: 'function' }),
      'functions/alpha/index.ts': '',
      'functions/alpha/example.json': manifest({ kind: 'function' }),
      'apps/web/index.ts': '',
      'apps/web/example.json': manifest({ kind: 'app' }),
    });

    const names = (await buildCatalog(root)).examples.map((example) => example.path);

    assert.deepEqual(names, ['functions/alpha', 'functions/zeta', 'apps/web']);
  });
});

describe('buildCatalog in a git repository', () => {
  it('leaves out files the repository ignores', async () => {
    const root = await workspace({
      '.gitignore': 'apps/*/package-lock.json\nnext-env.d.ts\n',
      'apps/web/package.json': '{}',
      'apps/web/package-lock.json': '{}',
      'apps/web/next-env.d.ts': '',
      'apps/web/example.json': manifest({ kind: 'app' }),
    });
    execFileSync('git', ['init', '-q'], { cwd: root });

    const [app] = (await buildCatalog(root)).examples;

    assert.deepEqual(app?.files, ['package.json']);
  });
});

describe('README catalog', () => {
  it('replaces only the generated section', async () => {
    const root = await workspace({
      'functions/hello/index.ts': '',
      'functions/hello/example.json': manifest({ kind: 'function' }),
    });
    const readme = 'Intro\n<!-- catalog:start -->\nold\n<!-- catalog:end -->\nOutro\n';

    const table = renderReadmeTable(await buildCatalog(root));
    const updated = replaceCatalogSection(readme, table);

    assert.match(updated, /^Intro\n<!-- catalog:start -->\n/);
    assert.match(updated, /\| \[hello\]\(functions\/hello\) \| Answers with a greeting\. \|/);
    assert.match(updated, /<!-- catalog:end -->\nOutro\n$/);
    assert.doesNotMatch(updated, /old/);
  });

  it('fails when the README has no generated section', () => {
    assert.throws(() => replaceCatalogSection('Intro', ''), /catalog:start/);
  });
});

describe('llms.txt', () => {
  it('lists every example with a link to its README, grouped by kind', async () => {
    const root = await workspace({
      'functions/hello/index.ts': '',
      'functions/hello/example.json': manifest({ kind: 'function' }),
      'apps/web/package.json': '{}',
      'apps/web/example.json': manifest({ kind: 'app', title: 'Web', description: 'A web app with sign-in.' }),
    });

    const text = renderLlmsTxt(await buildCatalog(root));

    assert.match(text, /^# Nulvless examples\n\n> /);
    assert.match(
      text,
      /## Edge Functions\n\n- \[Hello\]\(https:\/\/raw\.githubusercontent\.com\/nulvless\/examples\/main\/functions\/hello\/README\.md\): Answers with a greeting\. Install: `nulvless functions new <slug> --template hello`\n/,
    );
    assert.match(text, /## Apps\n\n- \[Web\]\(.+\/apps\/web\/README\.md\): A web app with sign-in\. Install: `nulvless create <dir> --example web`\n/);
  });
});

describe('templates in the catalog', () => {
  it('lists the language files and the template fields', async () => {
    const root = await workspace({
      'templates/email/welcome-user/en-US.html': '<p>Hi</p>',
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

    const [template] = (await buildCatalog(root)).examples;

    assert.equal(template?.path, 'templates/email/welcome-user');
    assert.deepEqual(template?.files, ['en-US.html']);
    assert.deepEqual(template?.template, { channel: 'email', subject: { 'en-US': 'Welcome' }, variables: [] });
    assert.match(renderReadmeTable(await buildCatalog(root)), /### Communication templates[\s\S]+\| \[welcome-user\]\(templates\/email\/welcome-user\) \| Sent when an account is created\. \| email \|/);
  });
});


import { execFile } from 'node:child_process';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { promisify } from 'node:util';
import { join, relative, sep } from 'node:path';

export type ExampleKind = 'function' | 'app';

export interface Manifest {
  title: string;
  description: string;
  kind: ExampleKind;
  features: string[];
  frameworks?: string[];
  secrets?: string[];
  minCliVersion?: string;
}

export interface CatalogEntry {
  name: string;
  kind: ExampleKind;
  path: string;
  title: string;
  description: string;
  features: string[];
  frameworks: string[];
  secrets: string[];
  minCliVersion: string;
  files: string[];
}

export interface Catalog {
  version: 1;
  examples: CatalogEntry[];
}

export const KIND_FOLDERS: Record<ExampleKind, string> = { function: 'functions', app: 'apps' };
export const MANIFEST_FILE = 'example.json';
export const DEFAULT_MIN_CLI_VERSION = '0.2.0';

const NEVER_PUBLISHED = new Set(['node_modules', '.next', 'dist', '.turbo', '.vercel', '.DS_Store']);
const LOCAL_ENV_FILE = /^\.env(\..+)?$/;
const FUNCTION_ONLY_DOCS = new Set(['README.md']);
const README_START = '<!-- catalog:start -->';
const README_END = '<!-- catalog:end -->';

function isPublished(name: string) {
  if (NEVER_PUBLISHED.has(name)) return false;
  return name === '.env.example' || !LOCAL_ENV_FILE.test(name);
}

async function filesGitKeeps(directory: string) {
  const { stdout } = await promisify(execFile)(
    'git',
    ['ls-files', '--cached', '--others', '--exclude-standard', '-z', '.'],
    { cwd: directory },
  );
  return stdout.split('\0').filter(Boolean);
}

async function filesOnDisk(directory: string) {
  const entries = await readdir(directory, { withFileTypes: true, recursive: true });
  return entries
    .filter((entry) => entry.isFile())
    .map((entry) => relative(directory, join(entry.parentPath, entry.name)).split(sep).join('/'));
}

export async function listFiles(directory: string): Promise<string[]> {
  const files = await filesGitKeeps(directory).catch(() => filesOnDisk(directory));
  return files.filter((path) => path.split('/').every(isPublished)).sort();
}

export async function exampleDirectories(root: string) {
  const directories: { kind: ExampleKind; name: string; directory: string }[] = [];
  for (const [kind, folder] of Object.entries(KIND_FOLDERS) as [ExampleKind, string][]) {
    const entries = await readdir(join(root, folder), { withFileTypes: true }).catch(() => []);
    for (const entry of entries) {
      if (entry.isDirectory()) directories.push({ kind, name: entry.name, directory: join(root, folder, entry.name) });
    }
  }
  return directories;
}

export async function readManifest(directory: string): Promise<Manifest> {
  return JSON.parse(await readFile(join(directory, MANIFEST_FILE), 'utf8'));
}

function installedFiles(kind: ExampleKind, files: string[]) {
  return files.filter((file) => file !== MANIFEST_FILE && !(kind === 'function' && FUNCTION_ONLY_DOCS.has(file)));
}

export async function buildCatalog(root: string): Promise<Catalog> {
  const examples: CatalogEntry[] = [];

  for (const { kind, name, directory } of await exampleDirectories(root)) {
    const manifest = await readManifest(directory);
    examples.push({
      name,
      kind: manifest.kind,
      path: `${KIND_FOLDERS[kind]}/${name}`,
      title: manifest.title,
      description: manifest.description,
      features: manifest.features,
      frameworks: manifest.frameworks ?? [],
      secrets: manifest.secrets ?? [],
      minCliVersion: manifest.minCliVersion ?? DEFAULT_MIN_CLI_VERSION,
      files: installedFiles(manifest.kind, await listFiles(directory)),
    });
  }

  const kindOrder = Object.keys(KIND_FOLDERS);
  examples.sort((a, b) => kindOrder.indexOf(a.kind) - kindOrder.indexOf(b.kind) || a.name.localeCompare(b.name));

  return { version: 1, examples };
}

const RAW_URL = 'https://raw.githubusercontent.com/nulvless/examples/main';

const installCommand: Record<ExampleKind, (name: string) => string> = {
  function: (name) => `nulvless functions new <slug> --template ${name}`,
  app: (name) => `nulvless create <dir> --example ${name}`,
};

const kindHeading: Record<ExampleKind, string> = { function: 'Edge Functions', app: 'Apps' };

export function renderLlmsTxt(catalog: Catalog) {
  const section = (kind: ExampleKind) => {
    const items = catalog.examples
      .filter((example) => example.kind === kind)
      .map(
        (example) =>
          `- [${example.title}](${RAW_URL}/${example.path}/README.md): ${example.description} Install: \`${installCommand[kind](example.name)}\``,
      );
    return [`## ${kindHeading[kind]}`, '', ...items].join('\n');
  };

  return [
    '# Nulvless examples',
    '',
    '> Edge Functions and apps built on Nulvless, installable with the Nulvless CLI (`npx @nulvless/cli`). Each README explains what the example does, the secrets it needs and how to try it.',
    '',
    section('function'),
    '',
    section('app'),
    '',
    '## Optional',
    '',
    `- [Catalog](${RAW_URL}/catalog.json): every example as JSON, with its files and secrets`,
    '- [Nulvless docs](https://www.nulvless.com/llms.txt): the platform, SDK and CLI documentation',
    '',
  ].join('\n');
}

export function renderReadmeTable(catalog: Catalog) {
  const section = (kind: ExampleKind, heading: string, command: (name: string) => string) => {
    const rows = catalog.examples
      .filter((example) => example.kind === kind)
      .map((example) => `| [${example.name}](${example.path}) | ${example.description} | \`${command(example.name)}\` |`);
    return [`### ${heading}`, '', '| Example | What it does | Install |', '| --- | --- | --- |', ...rows].join('\n');
  };

  return [
    section('function', kindHeading.function, installCommand.function),
    section('app', kindHeading.app, installCommand.app),
  ].join('\n\n');
}

export function replaceCatalogSection(readme: string, table: string) {
  const start = readme.indexOf(README_START);
  const end = readme.indexOf(README_END);
  if (start < 0 || end < start) throw new Error(`README.md needs ${README_START} and ${README_END} markers.`);

  return `${readme.slice(0, start + README_START.length)}\n${table}\n${readme.slice(end)}`;
}

export function serialize(catalog: Catalog) {
  return `${JSON.stringify(catalog, null, 2)}\n`;
}

async function main(root: string, verify: boolean) {
  const catalog = await buildCatalog(root);
  const outputs = {
    'catalog.json': serialize(catalog),
    'llms.txt': renderLlmsTxt(catalog),
    'README.md': replaceCatalogSection(await readFile(join(root, 'README.md'), 'utf8'), renderReadmeTable(catalog)),
  };

  for (const [file, content] of Object.entries(outputs)) {
    const current = await readFile(join(root, file), 'utf8').catch(() => '');
    if (current === content) continue;
    if (verify) {
      console.error(`${file} is out of date. Run \`npm run catalog\` and commit the result.`);
      process.exitCode = 1;
      continue;
    }
    await writeFile(join(root, file), content);
    console.log(`Updated ${file}`);
  }
}

if (import.meta.main) {
  await main(process.cwd(), process.argv.includes('--verify'));
}

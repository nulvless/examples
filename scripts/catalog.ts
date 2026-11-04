import { execFile } from 'node:child_process';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { promisify } from 'node:util';
import { join, relative, sep } from 'node:path';

export type ExampleKind = 'function' | 'app' | 'template';
export type TemplateChannel = 'email' | 'sms';

export interface TemplateFields {
  channel: TemplateChannel;
  subject?: Record<string, string>;
  variables: string[];
}

export interface Manifest {
  title: string;
  description: string;
  kind: ExampleKind;
  features: string[];
  frameworks?: string[];
  secrets?: string[];
  minCliVersion?: string;
  subject?: Record<string, string>;
  variables?: string[];
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
  template?: TemplateFields;
}

export interface Catalog {
  version: 1;
  examples: CatalogEntry[];
}

export const KIND_FOLDERS: Record<ExampleKind, string> = { function: 'functions', app: 'apps', template: 'templates' };
export const MANIFEST_FILE = 'example.json';
export const DEFAULT_MIN_CLI_VERSION = '0.2.0';

const NEVER_PUBLISHED = new Set(['node_modules', '.next', 'dist', '.turbo', '.vercel', '.DS_Store']);
const LOCAL_ENV_FILE = /^\.env(\..+)?$/;
const KINDS_WITHOUT_README_INSTALL = new Set<ExampleKind>(['function', 'template']);
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

export const TEMPLATE_CHANNELS: TemplateChannel[] = ['email', 'sms'];

export interface ExampleDirectory {
  kind: ExampleKind;
  name: string;
  path: string;
  directory: string;
  channel?: string;
}

async function subfolders(directory: string) {
  const entries = await readdir(directory, { withFileTypes: true }).catch(() => []);
  return entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name);
}

export async function exampleDirectories(root: string): Promise<ExampleDirectory[]> {
  const directories: ExampleDirectory[] = [];
  for (const [kind, folder] of Object.entries(KIND_FOLDERS) as [ExampleKind, string][]) {
    if (kind !== 'template') {
      for (const name of await subfolders(join(root, folder))) {
        directories.push({ kind, name, path: `${folder}/${name}`, directory: join(root, folder, name) });
      }
      continue;
    }
    for (const channel of await subfolders(join(root, folder))) {
      for (const name of await subfolders(join(root, folder, channel))) {
        directories.push({
          kind,
          name,
          channel,
          path: `${folder}/${channel}/${name}`,
          directory: join(root, folder, channel, name),
        });
      }
    }
  }
  return directories;
}

export async function readManifest(directory: string): Promise<Manifest> {
  return JSON.parse(await readFile(join(directory, MANIFEST_FILE), 'utf8'));
}

function installedFiles(kind: ExampleKind, files: string[]) {
  return files.filter((file) => file !== MANIFEST_FILE && !(KINDS_WITHOUT_README_INSTALL.has(kind) && file === 'README.md'));
}

export async function buildCatalog(root: string): Promise<Catalog> {
  const examples: CatalogEntry[] = [];

  for (const { name, path, directory, channel } of await exampleDirectories(root)) {
    const manifest = await readManifest(directory);
    examples.push({
      name,
      kind: manifest.kind,
      path,
      title: manifest.title,
      description: manifest.description,
      features: manifest.features,
      frameworks: manifest.frameworks ?? [],
      secrets: manifest.secrets ?? [],
      minCliVersion: manifest.minCliVersion ?? DEFAULT_MIN_CLI_VERSION,
      files: installedFiles(manifest.kind, await listFiles(directory)),
      ...(manifest.kind === 'template'
        ? {
            template: {
              channel: channel as TemplateChannel,
              ...(manifest.subject ? { subject: manifest.subject } : {}),
              variables: manifest.variables ?? [],
            },
          }
        : {}),
    });
  }

  const kindOrder = Object.keys(KIND_FOLDERS);
  examples.sort((a, b) => kindOrder.indexOf(a.kind) - kindOrder.indexOf(b.kind) || a.name.localeCompare(b.name));

  return { version: 1, examples };
}

const RAW_URL = 'https://raw.githubusercontent.com/nulvless/examples/main';

const installCommand: Record<Exclude<ExampleKind, 'template'>, (name: string) => string> = {
  function: (name) => `nulvless functions new <slug> --template ${name}`,
  app: (name) => `nulvless create <dir> --example ${name}`,
};

const kindHeading: Record<ExampleKind, string> = {
  function: 'Edge Functions',
  app: 'Apps',
  template: 'Communication templates',
};

function howToUse(example: CatalogEntry) {
  return example.kind === 'template'
    ? `Paste into Communications → Templates in the console, slug \`${example.name}\``
    : `Install: \`${installCommand[example.kind](example.name)}\``;
}

export function renderLlmsTxt(catalog: Catalog) {
  const section = (kind: ExampleKind) => {
    const items = catalog.examples
      .filter((example) => example.kind === kind)
      .map(
        (example) =>
          `- [${example.title}](${RAW_URL}/${example.path}/README.md): ${example.description} ${howToUse(example)}`,
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
    section('template'),
    '',
    '## Optional',
    '',
    `- [Catalog](${RAW_URL}/catalog.json): every example as JSON, with its files and secrets`,
    '- [Nulvless docs](https://www.nulvless.com/llms.txt): the platform, SDK and CLI documentation',
    '',
  ].join('\n');
}

export function renderReadmeTable(catalog: Catalog) {
  const section = (kind: Exclude<ExampleKind, 'template'>, heading: string, command: (name: string) => string) => {
    const rows = catalog.examples
      .filter((example) => example.kind === kind)
      .map((example) => `| [${example.name}](${example.path}) | ${example.description} | \`${command(example.name)}\` |`);
    return [`### ${heading}`, '', '| Example | What it does | Install |', '| --- | --- | --- |', ...rows].join('\n');
  };

  const templates = catalog.examples
    .filter((example) => example.kind === 'template')
    .map((example) => `| [${example.name}](${example.path}) | ${example.description} | ${example.template?.channel} |`);

  return [
    section('function', kindHeading.function, installCommand.function),
    section('app', kindHeading.app, installCommand.app),
    [`### ${kindHeading.template}`, '', '| Template | When it is sent | Channel |', '| --- | --- | --- |', ...templates].join('\n'),
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

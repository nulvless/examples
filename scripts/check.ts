import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { Ajv2020 } from 'ajv/dist/2020.js';
import { join as joinPath } from 'node:path';
import {
  exampleDirectories,
  KIND_FOLDERS,
  listFiles,
  MANIFEST_FILE,
  TEMPLATE_CHANNELS,
  type ExampleKind,
  type Manifest,
  type TemplateChannel,
} from './catalog.ts';

const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const DEPLOYABLE = /(\.(ts|tsx|js|jsx|mjs)|(^|\/)deno\.jsonc?|(^|\/)\.npmrc)$/;
const FUNCTION_ENTRYPOINT = 'index.ts';

const SCHEMA_URL = new URL('../schema/example.schema.json', import.meta.url);

async function loadValidator() {
  const schema = JSON.parse(await readFile(SCHEMA_URL, 'utf8'));
  return new Ajv2020({ allErrors: true }).compile(schema);
}

const TEMPLATE_LANGUAGES = ['en-US', 'pt-BR'];
const DEFAULT_LANGUAGE = 'en-US';
const TEMPLATE_EXTENSION = { email: 'html', sms: 'txt' } as const;
const PLACEHOLDER = /{{\s*([a-z_][a-z0-9_.]*)\s*}}/gi;

function requiredFiles(kind: ExampleKind) {
  if (kind === 'app') return ['README.md', '.env.example'];
  if (kind === 'template') return ['README.md'];
  return [FUNCTION_ENTRYPOINT, 'deno.json', 'README.md'];
}

async function templateProblems(directory: string, files: string[], manifest: Manifest, channel: TemplateChannel) {
  const problems: string[] = [];
  const extension = TEMPLATE_EXTENSION[channel];
  const languageFile = new RegExp(`^(${TEMPLATE_LANGUAGES.join('|')})\\.${extension}$`);
  const languageFiles = files.filter((file) => languageFile.test(file));

  if (!languageFiles.includes(`${DEFAULT_LANGUAGE}.${extension}`)) problems.push(`missing ${DEFAULT_LANGUAGE}.${extension}.`);
  for (const file of files) {
    if (file === MANIFEST_FILE || file === 'README.md' || languageFile.test(file)) continue;
    problems.push(`${file} is not a template file; use <language>.${extension} with ${TEMPLATE_LANGUAGES.join(' or ')}.`);
  }

  if (channel === 'email') {
    for (const file of languageFiles) {
      if (!manifest.subject?.[file.split('.')[0]!]) problems.push(`${file} has no subject in ${MANIFEST_FILE}.`);
    }
  }

  const texts = [
    ...(await Promise.all(languageFiles.map((file) => readFile(joinPath(directory, file), 'utf8')))),
    ...Object.values(manifest.subject ?? {}),
  ];
  const used = new Set(texts.flatMap((text) => [...text.matchAll(PLACEHOLDER)].map((match) => match[1]!)));
  const declared = new Set(manifest.variables ?? []);

  for (const variable of used) if (!declared.has(variable)) problems.push(`{{${variable}}} is used but not listed in variables.`);
  for (const variable of declared) if (!used.has(variable)) problems.push(`${variable} is listed in variables but never used.`);

  return problems;
}

export async function findProblems(root: string): Promise<string[]> {
  const validate = await loadValidator();
  const problems: string[] = [];

  const seen = new Map<string, string>();

  for (const { kind, name, path, directory, channel } of await exampleDirectories(root)) {
    const report = (message: string) => problems.push(`${path}: ${message}`);

    if (channel !== undefined && !TEMPLATE_CHANNELS.includes(channel as TemplateChannel)) {
      report(`${channel} is not a channel; put templates in ${TEMPLATE_CHANNELS.map((entry) => `${KIND_FOLDERS.template}/${entry}`).join(' or ')}.`);
      continue;
    }

    const duplicate = seen.get(name);
    if (duplicate) report(`the name ${name} is already used by ${duplicate}; the CLI installs examples by name.`);
    seen.set(name, path);

    if (!SLUG.test(name)) {
      report('use a lowercase kebab-case name.');
      continue;
    }

    const files = await listFiles(directory);
    if (!files.includes(MANIFEST_FILE)) {
      report(`missing ${MANIFEST_FILE}.`);
      continue;
    }

    const manifest = JSON.parse(await readFile(join(directory, MANIFEST_FILE), 'utf8'));
    if (!validate(manifest)) {
      for (const error of validate.errors ?? []) report(`${MANIFEST_FILE} ${error.instancePath} ${error.message}`.trim());
      continue;
    }

    if (manifest.kind !== kind) {
      report(`kind "${manifest.kind}" belongs in ${KIND_FOLDERS[manifest.kind as ExampleKind]}/.`);
      continue;
    }

    for (const required of requiredFiles(kind)) {
      if (!files.includes(required)) report(`missing ${required}.`);
    }

    if (kind === 'template') {
      for (const problem of await templateProblems(directory, files, manifest, channel as TemplateChannel)) report(problem);
    }

    if (kind === 'function') {
      for (const file of files) {
        if (file === MANIFEST_FILE || file === 'README.md' || DEPLOYABLE.test(file)) continue;
        report(`${file} cannot be deployed; use .ts, .tsx, .js, .jsx, .mjs, deno.json or .npmrc.`);
      }
    }
  }

  return problems;
}

if (import.meta.main) {
  const problems = await findProblems(process.cwd());
  for (const problem of problems) console.error(problem);
  if (problems.length) process.exitCode = 1;
  else console.log('Every example is valid.');
}

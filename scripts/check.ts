import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { Ajv2020 } from 'ajv/dist/2020.js';
import { exampleDirectories, KIND_FOLDERS, listFiles, MANIFEST_FILE, type ExampleKind } from './catalog.ts';

const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const DEPLOYABLE = /(\.(ts|tsx|js|jsx|mjs)|(^|\/)deno\.jsonc?|(^|\/)\.npmrc)$/;
const FUNCTION_ENTRYPOINT = 'index.ts';

const SCHEMA_URL = new URL('../schema/example.schema.json', import.meta.url);

async function loadValidator() {
  const schema = JSON.parse(await readFile(SCHEMA_URL, 'utf8'));
  return new Ajv2020({ allErrors: true }).compile(schema);
}

function requiredFiles(kind: ExampleKind) {
  return kind === 'app' ? ['README.md', '.env.example'] : [FUNCTION_ENTRYPOINT, 'README.md'];
}

export async function findProblems(root: string): Promise<string[]> {
  const validate = await loadValidator();
  const problems: string[] = [];

  for (const { kind, name, directory } of await exampleDirectories(root)) {
    const label = `${KIND_FOLDERS[kind]}/${name}`;
    const report = (message: string) => problems.push(`${label}: ${message}`);

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

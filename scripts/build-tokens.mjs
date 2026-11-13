import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = readFileSync(resolve(root, 'src/tokens/tokens.ts'), 'utf8');
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
});
const mod = await import('data:text/javascript;base64,' + Buffer.from(outputText).toString('base64'));

const out = resolve(root, 'src/styles/tokens.css');
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, '/* Generado por scripts/build-tokens.mjs desde src/tokens/tokens.ts — no editar a mano. */\n' + mod.buildCssVariables());
console.log('tokens.css generado:', out);

/**
 * Optional live check: run the real one-action publication refraction against a
 * live provider, using the fixture publication. Never part of `npm test` —
 * needs a real key. Uses the SAME module resolver as the test suite
 * (--import ./tests/register.mjs) per apps/shared/BUILD_INSTRUCTIONS.md.
 *
 *   ANTHROPIC_API_KEY=... npm run verify:refraction
 *   VERIFY_PROVIDER=gemini GEMINI_API_KEY=... npm run verify:refraction
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { transportFor, defaultModelFor } from '../src/app/core/transports/index.ts';
import { refractPublication } from '../src/app/core/publication-refract.ts';
import { flattenTopics } from '../src/app/core/tree.ts';
import { refractionKey } from '../src/app/core/models.ts';

const provider = (process.env.VERIFY_PROVIDER ?? 'claude').toLowerCase();
const key = process.env.ANTHROPIC_API_KEY ?? process.env.GEMINI_API_KEY ?? '';
if (!key) {
  console.error('Set ANTHROPIC_API_KEY or GEMINI_API_KEY.');
  process.exit(2);
}

const FIX = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'fixtures', 'rate-limiting');
const pub = JSON.parse(readFileSync(join(FIX, 'publication.json'), 'utf8'));

const transport = transportFor(provider);
const model = defaultModelFor(provider);
console.log(`Refracting "${pub.meta.displayName}" — ${flattenTopics(pub.topics).length} topics × ${pub.personas.length} personas.\n`);

const res = await refractPublication(pub, transport, key, model, (p) => {
  process.stdout.write(`\r${p.done}/${p.total}`);
});
process.stdout.write('\n\n');

for (const t of flattenTopics(pub.topics)) {
  for (const persona of pub.personas) {
    const cell = res.cells.get(refractionKey(t.id, persona.id));
    console.log(`=== ${t.name} → ${persona.name} ===`);
    console.log(cell.ok ? cell.text : `ERROR ${cell.error.type}: ${cell.error.message}`);
    console.log();
  }
}

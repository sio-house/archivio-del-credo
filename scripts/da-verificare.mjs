/** Elenco in console delle voci senza fonte, per lavorarci offline. */
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const senzaFonte = (cartella) => readdirSync(cartella).filter((f) => f.endsWith('.md')).filter((f) => {
  const t = readFileSync(join(cartella, f), 'utf8').split('---')[1] ?? '';
  return !/^fonti:/m.test(t) && !/^fontiInterne:/m.test(t);
});

let totale = 0;
for (const c of ['data/personaggi', 'data/opere', 'data/glossario']) {
  const voci = senzaFonte(c);
  totale += voci.length;
  if (voci.length) console.log(`\n${c} — ${voci.length} senza fonte:\n  ` + voci.map((v) => v.replace('.md', '')).join('\n  '));
}
console.log(`\nTotale: ${totale}`);

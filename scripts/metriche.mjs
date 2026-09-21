/** Misura il sito costruito e salva i numeri in data/metriche.json, che la pagina Info mostra. */
import { readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const file = (d) => readdirSync(d, { withFileTypes: true }).flatMap((e) => e.isDirectory() ? file(join(d, e.name)) : [join(d, e.name)]);
const tutti = file('dist');
const html = tutti.filter((f) => f.endsWith('.html'));
const peso = (f) => statSync(f).size;
const somma = (a) => a.reduce((s, x) => s + x, 0);
const piuPesante = html.map((f) => ({ f: '/' + f.replace(/^dist\/|index\.html$/g, ''), kb: +(peso(f) / 1024).toFixed(1) })).sort((a, b) => b.kb - a.kb)[0];

writeFileSync('data/metriche.json', JSON.stringify({
  misurato: new Date().toISOString().slice(0, 10),
  pagine: html.length,
  pesoTotaleMB: +(somma(tutti.map(peso)) / 1e6).toFixed(1),
  htmlMedioKB: +(somma(html.map(peso)) / html.length / 1024).toFixed(1),
  paginaPiuPesante: piuPesante,
  jsKB: +(somma(tutti.filter((f) => f.endsWith('.js') && !f.includes('pagefind')).map(peso)) / 1024).toFixed(1),
  cssKB: +(somma(tutti.filter((f) => f.endsWith('.css')).map(peso)) / 1024).toFixed(1),
}, null, 2) + '\n');
console.log('metriche aggiornate');

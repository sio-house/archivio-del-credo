import type { APIContext } from 'astro';
import { anteprima } from '../../lib/og';
import { dati, TIPI, anno } from '../../lib/data';

export async function getStaticPaths() {
  const { opere, personaggi, glossario, percorsi } = await dati();
  const fisse: [string, { titolo: string; occhiello?: string; nota?: string }][] = [
    ['home', { titolo: 'Tutto il Credo, in ordine.', nota: "Timeline, mappa, percorsi e collezione di Assassin's Creed." }],
    ['timeline', { titolo: 'Timeline', occhiello: 'Archivio', nota: "Giochi, romanzi, fumetti e manga su un'unica linea del tempo." }],
    ['mappa', { titolo: 'Mappa', occhiello: 'Archivio', nota: 'Tutti i luoghi della saga, con i viaggi dei personaggi.' }],
    ['percorsi', { titolo: 'Percorsi', occhiello: 'Guide', nota: 'In che ordine giocare e leggere.' }],
    ['opere', { titolo: 'Opere', occhiello: 'Archivio' }],
    ['storia/piani', { titolo: 'I tre piani della storia', occhiello: 'Storia', nota: "Era degli Isu, ricordi nell'Animus, presente." }],
    ['storia', { titolo: 'Storia e finzione', occhiello: 'Archivio', nota: "Cosa è vero e cosa è inventato nei giochi." }],
    ['personaggi', { titolo: 'Personaggi', occhiello: 'Archivio' }],
    ['personaggi/grafo', { titolo: 'Grafo delle relazioni', occhiello: 'Personaggi' }],
    ['glossario', { titolo: 'Glossario', occhiello: 'Archivio', nota: "Animus, Isu, Frutti dell'Eden e gli altri termini della saga." }],
    ['collezione', { titolo: 'Collezione', occhiello: 'Archivio' }],
    ['collezione/mancanti', { titolo: 'Cosa mi manca', occhiello: 'Collezione' }],
    ['notizie', { titolo: 'Notizie', occhiello: 'Archivio' }],
    ['about', { titolo: 'Info', occhiello: 'Archivio' }],
  ];

  return [
    ...fisse.map(([rotta, props]) => ({ params: { rotta }, props })),
    ...opere.map((o) => ({ params: { rotta: `opere/${o.id}` }, props: { titolo: o.data.titolo, occhiello: `${TIPI[o.data.tipo]} · ${anno(o.data.uscita)}` } })),
    ...personaggi.map((p) => ({ params: { rotta: `personaggi/${p.id}` }, props: { titolo: p.data.nome, occhiello: p.data.affiliazione, nota: p.data.sommario } })),
    ...glossario.map((g) => ({ params: { rotta: `glossario/${g.id}` }, props: { titolo: g.data.termine, occhiello: `Glossario · ${g.data.categoria}` } })),
    ...percorsi.map((p) => ({ params: { rotta: `percorsi/${p.id}` }, props: { titolo: p.data.titolo, occhiello: 'Percorso', nota: p.data.sommario } })),
  ];
}

export async function GET({ props }: APIContext) {
  const png = await anteprima(props as { titolo: string; occhiello?: string; nota?: string });
  return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=31536000, immutable' } });
}

/**
 * Livello di accesso ai dati: carica tutte le collezioni una volta,
 * risolve i riferimenti e fallisce la build se un riferimento è rotto.
 */
import { getCollection, type CollectionEntry } from 'astro:content';

export type Opera = CollectionEntry<'opere'>;
export type Segmento = CollectionEntry<'segmenti'>;
export type Personaggio = CollectionEntry<'personaggi'>;

export const TIPI: Record<Opera['data']['tipo'], string> = {
  gioco: 'Gioco', dlc: 'DLC', romanzo: 'Romanzo', fumetto: 'Fumetto', manga: 'Manga',
  film: 'Film', corto: 'Corto', saggio: 'Saggio', altro: 'Altro',
};
export const FILONI = { storico: 'Storico', moderno: 'Epoca moderna', isu: 'Isu' } as const;

let cache: Awaited<ReturnType<typeof carica>> | undefined;

async function carica() {
  const [opere, segmenti, personaggi, relazioni, edizioni, copie, percorsi, luoghi, glossario, verita] = await Promise.all([
    getCollection('opere'), getCollection('segmenti'), getCollection('personaggi'),
    getCollection('relazioni'), getCollection('edizioni'), getCollection('copie'), getCollection('percorsi'), getCollection('luoghi'), getCollection('glossario'), getCollection('verita'),
  ]);

  const mappa = <T extends { id: string }>(xs: T[]) => new Map(xs.map((x) => [x.id, x]));
  const idx = {
    opere: mappa(opere), personaggi: mappa(personaggi), edizioni: mappa(edizioni),
  };

  {
    const ids = new Set(glossario.map((g) => g.id));
    const rotti = glossario.flatMap((g) => [
      ...g.data.correlati.filter((c) => !ids.has(c.id)).map((c) => `glossario/${g.id} → ${c.id}`),
    ]);
    if (rotti.length) throw new Error('Rimandi rotti nel glossario:\n  ' + rotti.join('\n  '));
  }

  const errori: string[] = [];
  const must = <K extends keyof typeof idx>(coll: K, id: string, dove: string) => {
    const x = idx[coll].get(id);
    if (!x) errori.push(`${dove}: "${id}" non esiste in ${coll}`);
    return x as NonNullable<ReturnType<(typeof idx)[K]['get']>>;
  };

  for (const o of opere) o.data.collegamenti.forEach((c) => must('opere', c.opera.id, `opere/${o.id}`));
  for (const s of segmenti) {
    must('opere', s.data.opera.id, `segmenti/${s.id}`);
    s.data.personaggi.forEach((p) => must('personaggi', p.id, `segmenti/${s.id}`));
  }
  for (const r of relazioni) { must('personaggi', r.data.da.id, `relazioni/${r.id}`); must('personaggi', r.data.a.id, `relazioni/${r.id}`); }
  for (const e of edizioni) must('opere', e.data.opera.id, `edizioni/${e.id}`);
  for (const c of copie) must('edizioni', c.data.edizione.id, `collezione/${c.id}`);
  for (const v of verita) must('opere', v.data.opera.id, `verita/${v.id}`);
  // anche le citazioni dal materiale posseduto devono puntare a un'opera esistente
  for (const [coll, voci] of [['opere', opere], ['personaggi', personaggi], ['glossario', glossario], ['verita', verita]] as const)
    for (const x of voci as any[])
      for (const f of (x.data.fontiInterne ?? [])) must('opere', f.opera.id, `${coll}/${x.id} (fonte interna)`);
  for (const g of glossario) g.data.opere.forEach((o) => must('opere', o.id, `glossario/${g.id}`));
  for (const p of percorsi) p.data.passi.forEach((s) => must('opere', s.opera.id, `percorsi/${p.id}`));
  const coord = new Map(luoghi.map((l) => [l.id, l.data]));
  const senzaCoord = [...new Set(segmenti.flatMap((s) => s.data.luoghi))].filter((l) => !coord.has(l));
  if (senzaCoord.length) console.warn(`[mappa] luoghi senza coordinate in data/luoghi.yaml: ${senzaCoord.join(', ')}`);
  if (errori.length) throw new Error('Riferimenti rotti nei dati:\n  ' + errori.join('\n  '));

  const perUscita = [...opere].sort((a, b) => +a.data.uscita - +b.data.uscita);
  const perCronologia = [...segmenti].sort(
    (a, b) => a.data.inizio - b.data.inizio || a.data.fine - b.data.fine ||
      +idx.opere.get(a.data.opera.id)!.data.uscita - +idx.opere.get(b.data.opera.id)!.data.uscita,
  );

  return { coord, glossario, verita, opere, segmenti, personaggi, relazioni, edizioni, copie, percorsi, idx, perUscita, perCronologia };
}

export async function dati() {
  return (cache ??= await carica());
}

export const anno = (d: Date) => d.getUTCFullYear();

/** Anni prima di Cristo scritti come si deve: -49 diventa "49 a.C.". */
export const annoTesto = (y: number) => (y < 0 ? `${Math.abs(y).toLocaleString('it-IT')} a.C.` : String(y));

export const periodo = (i: number, f: number, approx = false) => {
  const c = approx ? 'c. ' : '';
  if (i === f) return c + annoTesto(i);
  if (i < 0 && f < 0) return `${c}${Math.abs(i).toLocaleString('it-IT')}–${Math.abs(f).toLocaleString('it-IT')} a.C.`;
  return `${c}${annoTesto(i)}–${annoTesto(f)}`;
};

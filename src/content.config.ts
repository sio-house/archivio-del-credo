/**
 * Modello dei dati del portale.
 *
 *  Opera ──< Segmento narrativo >── Personaggio ──< Relazione >── Personaggio
 *    │
 *    └──< Edizione ──< Copia posseduta   (la tua collezione)
 *
 *  Percorso = lista ordinata di Opere (guida all'ordine di fruizione)
 *
 * Tutti i dati vivono in /data come file Markdown/YAML versionati in git.
 * I riferimenti tra collezioni sono validati in fase di build (vedi src/lib/data.ts).
 */
import { defineCollection, reference } from 'astro:content';
import { glob, file } from 'astro/loaders';
import { z } from 'astro/zod';

const anno = z.number().int().min(-500000).max(2100);

/**
 * Fonte interna: una citazione dal materiale che possiedi.
 * Vale quanto un link, spesso di più, perché è la fonte originale.
 *   - { opera: assassins-creed-ii, riferimento: "voce del database: Mela dell'Eden" }
 *   - { opera: rinascimento, riferimento: "capitolo 12" }
 */
const fonteInterna = () =>
  z.array(z.object({ opera: reference('opere'), riferimento: z.string().min(2) })).default([]);

/** Un singolo prodotto del franchise: gioco, romanzo, fumetto, manga, film… */
const opere = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './data/opere' }),
  schema: z.object({
    titolo: z.string(),
    titoloOriginale: z.string().optional(),
    tipo: z.enum(['gioco', 'dlc', 'romanzo', 'fumetto', 'manga', 'film', 'corto', 'saggio', 'altro']),
    uscita: z.coerce.date(),
    /** true se è nota solo l'anno o il mese di uscita */
    uscitaApprossimata: z.boolean().default(false),
    autori: z.array(z.string()).default([]),
    studio: z.string().optional(),
    editore: z.string().optional(),
    piattaforme: z.array(z.string()).default([]),
    canonicita: z.enum(['canonico', 'non-canonico', 'incerto']).default('canonico'),
    /** Raggruppamento libero, es. "Saga di Ezio" */
    serie: z.string().optional(),
    collegamenti: z
      .array(
        z.object({
          opera: reference('opere'),
          tipo: z.enum(['seguito', 'prequel', 'adattamento', 'parallelo', 'spin-off', 'remake']),
          nota: z.string().optional(),
        }),
      )
      .default([]),
    /** Fatti curiosi, scritti con parole nostre a partire dalle fonti */
    curiosita: z.array(z.string()).default([]),
    /** false = dati inseriti ma non ancora controllati sulle fonti */
    verificato: z.boolean().default(false),
    fonti: z.array(z.url()).default([]),
    fontiInterne: fonteInterna(),
  }),
});

/** La parte di un'opera ambientata in un periodo: alimenta la timeline. */
const segmenti = defineCollection({
  loader: file('./data/segmenti.yaml'),
  schema: z.object({
    opera: reference('opere'),
    titolo: z.string(),
    filone: z.enum(['storico', 'moderno', 'isu']),
    inizio: anno,
    fine: anno,
    approssimato: z.boolean().default(false),
    luoghi: z.array(z.string()).default([]),
    personaggi: z.array(reference('personaggi')).default([]),
    nota: z.string().optional(),
  }).refine((s) => s.fine >= s.inizio, { message: 'fine deve essere >= inizio' }),
});

const personaggi = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './data/personaggi' }),
  schema: z.object({
    nome: z.string(),
    alias: z.array(z.string()).default([]),
    affiliazione: z.enum(['assassini', 'templari', 'isu', 'alleato', 'neutrale', 'altro']),
    /** una riga che dice chi è */
    sommario: z.string().optional(),
    /** epoca e luogo, quando le date esatte non bastano */
    epoca: z.string().optional(),
    nascita: anno.optional(),
    morte: anno.optional(),
    storico: z.boolean().default(false), // personaggio realmente esistito
    /** che cosa dicono le fonti storiche, per chi è esistito davvero */
    storiaVera: z.string().optional(),
    curiosita: z.array(z.string()).default([]),
    fonti: z.array(z.url()).default([]),
    fontiInterne: fonteInterna(),
    verificato: z.boolean().default(false),
  }),
});

/** Arco del futuro grafo delle relazioni. */
const relazioni = defineCollection({
  loader: file('./data/relazioni.yaml'),
  schema: z.object({
    da: reference('personaggi'),
    a: reference('personaggi'),
    tipo: z.enum(['genitore', 'parente', 'mentore', 'alleato', 'nemico', 'antenato', 'amore']),
    dettaglio: z.string().optional(),
  }),
});

/** Una versione concreta di un'opera che si può possedere. */
const edizioni = defineCollection({
  loader: file('./data/edizioni.yaml'),
  schema: z.object({
    opera: reference('opere'),
    nome: z.string(),
    lingua: z.string(),
    editore: z.string().optional(),
    formato: z.enum(['fisico', 'digitale', 'collector', 'limitata', 'bundle']),
    piattaforma: z.string().optional(),
    isbn: z.string().optional(),
    ean: z.string().optional(),
    anno: z.number().int().optional(),
  }),
});

/** La tua collezione. */
const copie = defineCollection({
  loader: file('./data/collezione.yaml'),
  schema: z.object({
    edizione: reference('edizioni'),
    stato: z.enum(['posseduto', 'desiderato', 'prestato', 'venduto']),
    fruizione: z.enum(['da-iniziare', 'in-corso', 'completato', 'platinato']).optional(),
    condizioni: z.enum(['nuovo', 'ottime', 'buone', 'usurato']).optional(),
    acquistato: z.coerce.date().optional(),
    voto: z.number().min(0).max(10).optional(),
    note: z.string().optional(),
    foto: z.string().optional(), // percorso in /public/collezione/
  }),
});

/** Guida all'ordine di fruizione, curata a mano. */
const percorsi = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './data/percorsi' }),
  schema: z.object({
    titolo: z.string(),
    sommario: z.string(),
    livello: z.enum(['nuovo-arrivato', 'appassionato', 'completista']),
    passi: z.array(
      z.object({
        opera: reference('opere'),
        nota: z.string().optional(),
        opzionale: z.boolean().default(false),
      }),
    ).min(1),
  }),
});

/** Coordinate per la mappa: l'id è il nome del luogo usato nei segmenti. */
const luoghi = defineCollection({
  loader: file('./data/luoghi.yaml'),
  schema: z.object({ lat: z.number().min(-90).max(90), lon: z.number().min(-180).max(180) }),
});

/** Storia e finzione: che cosa un'opera prende dalla storia e che cosa inventa. */
const verita = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './data/verita' }),
  schema: z.object({
    opera: reference('opere'),
    reali: z.array(z.string()).min(1),
    inventati: z.array(z.string()).default([]),
    licenze: z.array(z.string()).default([]),
    fonti: z.array(z.url()).default([]),
    fontiInterne: fonteInterna(),
  }),
});

/** Glossario: termini della saga con rimandi incrociati. */
const glossario = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './data/glossario' }),
  schema: z.object({
    termine: z.string(),
    categoria: z.enum(['organizzazione', 'tecnologia', 'artefatto', 'concetto', 'luogo']),
    alias: z.array(z.string()).default([]),
    correlati: z.array(reference('glossario')).default([]),
    opere: z.array(reference('opere')).default([]),
    fonti: z.array(z.url()).default([]),
    fontiInterne: fonteInterna(),
  }),
});

/** Notizie datate sul franchise, con fonte. */
const notizie = defineCollection({
  loader: file('./data/notizie.yaml'),
  schema: z.object({
    data: z.coerce.date(),
    titolo: z.string(),
    testo: z.string(),
    stato: z.enum(['ufficiale', 'indiscrezione']).default('ufficiale'),
    opere: z.array(reference('opere')).default([]),
    fonti: z.array(z.url()).min(1),
  }),
});

export const collections = { verita, glossario, notizie, luoghi, opere, segmenti, personaggi, relazioni, edizioni, copie, percorsi };

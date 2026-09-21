# Archivio del Credo

Portale amatoriale su Assassin's Creed: timeline, percorsi di lettura e collezione.
Fatto con Astro 7 (content collections tipizzate) e Pagefind per la ricerca.

## Avvio

```bash
npm install
npm run dev      # http://localhost:4321  (la ricerca funziona solo dopo la build)
npm run build    # build statica in dist/ + indice di ricerca Pagefind
npm run preview
```

## Dove stanno i dati

Tutto è in `data/`, e gli schemi sono in `src/content.config.ts`.

| File / cartella         | Cosa contiene                                              |
|-------------------------|------------------------------------------------------------|
| `data/opere/*.md`       | Una scheda per opera (il nome del file è l'id)             |
| `data/segmenti.yaml`    | Periodi narrati da ogni opera: alimentano la timeline      |
| `data/personaggi/*.md`  | Schede personaggio: sommario, biografia, curiosità, `storiaVera` per chi è esistito davvero |
| `data/relazioni.yaml`   | Legami tra personaggi (base per il futuro grafo)           |
| `data/edizioni.yaml`    | Versioni concrete di un'opera (lingua, editore, ISBN…)     |
| `data/collezione.yaml`  | Le tue copie: stato, fruizione, voto, note                 |
| `data/percorsi/*.md`    | Guide all'ordine di fruizione curate a mano                |
| `data/notizie.yaml`     | Notizie datate con fonte (ufficiale / indiscrezione)       |
| `data/verita/*.md`      | Storia e finzione per opera: contesto, fatti reali, invenzioni, licenze |
| `data/glossario/*.md`   | Voci del glossario, con rimandi incrociati e opere        |
| `data/luoghi.yaml`      | Coordinate dei luoghi usati nei segmenti (per la mappa)    |

Ogni opera può avere `curiosita` (elenco) e `fonti` (URL), mostrate in fondo alla scheda.
I testi sono scritti con parole nostre: le wiki (Wikipedia, Fandom) sono sotto licenza CC BY-SA, quindi
non copiare testo alla lettera senza citare e rilasciare con la stessa licenza.

La build **fallisce** se un riferimento punta a un id inesistente, così i dati restano coerenti.

`verificato: false` segna opere e personaggi i cui dati non sono ancora stati controllati su una fonte
consultabile: sul sito compaiono con l'etichetta "da verificare".

### Due tipi di fonte

- `fonti`: elenco di URL (Wikipedia, pagine ufficiali, editori).
- `fontiInterne`: citazioni dal materiale che possiedi, che spesso valgono di più perché sono la fonte originale.

```yaml
fontiInterne:
  - { opera: assassins-creed-ii, riferimento: "voce del database: Mela dell'Eden" }
  - { opera: rinascimento, riferimento: "capitolo 12" }
```

L'`opera` è l'id del file in `data/opere/`; se non esiste, la build si ferma. Il riferimento è libero:
una voce di database, un capitolo, una tavola, un minuto di un cortometraggio. Se l'opera è in collezione,
la scheda lo segnala. Il campo vale per opere, personaggi, glossario e schede storia/finzione.

`npm run verifica` elenca in console le voci ancora senza fonte; la stessa lista, con le istruzioni,
sta nella pagina `/da-verificare` (esclusa dai motori di ricerca).

Regola di contenuto: ogni affermazione dovrebbe poggiare su una fonte citata in `fonti` o `fontiInterne`, non sulla memoria di chi scrive.
Quando le fonti non concordano, si riportano entrambe le versioni. Quando una fonte non dice qualcosa
(per esempio la data della catastrofe degli Isu), non la si inventa: il dato resta indicato come convenzionale.

> La collezione contiene i pezzi posseduti. Per i giochi piattaforma ed edizione sono "Da specificare": completali in `data/edizioni.yaml`.
> Se un segmento usa un luogo senza coordinate, la build lo segnala con un avviso `[mappa]`.

## Pagine

- `/timeline`: ordine di storia o di uscita, con filtri per tipo e filone
- `/percorsi`: guide curate + ordine cronologico e di uscita generati in automatico
- `/opere/[id]`: schede con collegamenti in entrambe le direzioni, curiosità con fonti e JSON-LD schema.org
- `/personaggi/[id]`: biografia, riquadro "storico o inventato?" per i personaggi reali, curiosità, relazioni, apparizioni e fonti; JSON-LD `Person` per chi è esistito davvero
- `/notizie` e `/notizie.xml`: notizie datate con fonte, e relativo feed RSS
- `/storia`: confronto fra storia e finzione, gioco per gioco; la scheda completa sta in fondo a ogni opera (`#storia`)
- `/storia/piani`: i tre piani narrativi (era degli Isu, ricordi nell'Animus, presente); la timeline accetta `?filone=isu|storico|moderno` per aprirsi già filtrata
- `/glossario`: i termini della saga, filtrabili per categoria e collegati alle opere
- `/personaggi/grafo`: grafo delle relazioni; il layout è calcolato in fase di build con d3-force, quindi il client riceve solo posizioni già pronte
- `/collezione` e `/collezione/mancanti`: statistiche, tabella dei pezzi e opere ancora da prendere, ordinate per quanto contano nei percorsi
- `/mappa`: mappa interattiva in stile schizzo (zoom, trascinamento, pinch su mobile), filtri per epoca e collezione, viaggio di un personaggio. Le coste dettagliate (Natural Earth 1:50m) si caricano solo al primo zoom da `/mappa-dettaglio.txt`.

## Qualità

- Sitemap generata da `@astrojs/sitemap`.

- `npm run check` (o `npx astro check`): controllo dei tipi, atteso a zero errori.
- `npm run build` termina con `scripts/metriche.mjs`, che misura il sito e aggiorna `data/metriche.json`: la pagina Info mostra quei numeri.
- Anteprime social: generate in build con satori + resvg da `src/lib/og.ts`, una per pagina, servite da `/og/<rotta>.png`.
- Accessibilità verificata con axe-core sulle pagine principali, in tema chiaro e scuro e con la modalità Animus attiva.

## Animazioni (stile Animus)

Stanno in `src/styles/animus.css` e in `src/components/Animus.astro`:

- **Modalità Animus**: pulsante in alto a destra, tema blu con griglia e scansione, scelta ricordata nel browser. In questa modalità la mappa diventa un ologramma.
- **Sincronizzazione**: gli elementi con `data-sync` compaiono a scaglioni quando entrano nello schermo.
- **Sequenza di avvio** in home e scansione luminosa sui titoli.
- **Mappa**: il percorso di un personaggio scorre, il segnaposto selezionato pulsa.
- **Collezione**: le barre di copertura si riempiono.
- **Transizioni tra pagine** con la View Transitions API (ClientRouter di Astro).

Tutto si disattiva automaticamente con `prefers-reduced-motion: reduce`.

## Pubblicazione su GitHub Pages

Il sito si pubblica da solo a ogni push su `main`, con il workflow `.github/workflows/deploy.yml`.

1. Crea il repository (es. `sio-house/archivio-del-credo`) e fai il push.
2. Su GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Dopo il primo giro del workflow il sito è su `https://sio-house.github.io/archivio-del-credo/`.

Il workflow legge da solo proprietario e nome del repository, quindi funziona con qualsiasi nome. Tutti i link interni passano da `u()` (`src/lib/url.ts`), che aggiunge il prefisso del sottopercorso; nei file Markdown ci pensa un plugin in `astro.config.mjs`.

Per provare in locale la versione con sottopercorso:

```sh
SITE_URL=https://sio-house.github.io BASE_PATH=/archivio-del-credo npm run build
```

**Dominio personalizzato** (es. `ac.s-io.net`): crea `public/CNAME` con il dominio, nel workflow imposta `SITE_URL: https://ac.s-io.net` e `BASE_PATH: /`, e aggiungi nel DNS un record CNAME verso `sio-house.github.io`.

## Prossimi passi

1. Completare piattaforme ed edizioni dei giochi e verificare le opere segnate come "da verificare".
2. Aggiungere le foto della collezione in `public/collezione/` (campo `foto`).
3. Estendere un'era alla volta (Altaïr, Connor/Kenway, …).
4. Grafo delle relazioni in `/personaggi` a partire da `relazioni.yaml`.
5. Versione inglese con l'i18n di Astro.

Sito non ufficiale, non affiliato con Ubisoft.

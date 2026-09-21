/**
 * Percorsi interni compatibili con il "base" di Astro.
 * Su GitHub Pages il sito vive in una sottocartella (es. /archivio-del-credo),
 * quindi ogni link interno deve passare da qui invece di cominciare con "/".
 */
const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');
export const u = (percorso: string) => `${BASE}${percorso.startsWith('/') ? percorso : `/${percorso}`}`;
/** Toglie il base da un pathname, utile per confronti e per calcolare lo slug delle anteprime. */
export const senzaBase = (pathname: string) => (BASE && pathname.startsWith(BASE) ? pathname.slice(BASE.length) || '/' : pathname);

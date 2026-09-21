// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

/**
 * Dove viene pubblicato il sito.
 * - In locale: radice ("/").
 * - Su GitHub Pages il workflow imposta SITE_URL=https://<account>.github.io
 *   e BASE_PATH=/<nome-repository>.
 * - Con un dominio proprio (es. ac.s-io.net): SITE_URL=https://ac.s-io.net e BASE_PATH=/.
 */
const site = process.env.SITE_URL ?? 'https://sio-house.github.io';
const base = process.env.BASE_PATH ?? '/';
const prefisso = base.replace(/\/$/, '');

/** I link assoluti scritti nei file Markdown (es. [testo](/storia/piani)) ricevono anche loro il base. */
function linkConBase() {
  const visita = (nodo) => {
    if (nodo.type === 'element' && nodo.tagName === 'a') {
      const href = nodo.properties?.href;
      if (typeof href === 'string' && href.startsWith('/') && !href.startsWith('//')) nodo.properties.href = prefisso + href;
    }
    (nodo.children ?? []).forEach(visita);
  };
  return (albero) => visita(albero);
}

export default defineConfig({
  site,
  base,
  trailingSlash: 'ignore',
  integrations: [sitemap()],
  markdown: { rehypePlugins: [linkConBase] },
});

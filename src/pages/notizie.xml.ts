import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';
import { u } from '../lib/url';

export async function GET(context: APIContext) {
  const notizie = (await getCollection('notizie')).sort((a, b) => +b.data.data - +a.data.data);
  return rss({
    title: 'Archivio del Credo · Notizie',
    description: "Notizie su Assassin's Creed: giochi, remake, serie TV e pubblicazioni.",
    site: context.site!,
    items: notizie.map((n) => ({
      title: n.data.titolo,
      pubDate: n.data.data,
      description: n.data.testo,
      link: `${u('/notizie')}#${n.id}`,
      categories: [n.data.stato],
    })),
    customData: '<language>it-IT</language>',
  });
}

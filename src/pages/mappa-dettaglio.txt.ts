// Contorni ad alta risoluzione (Natural Earth 1:50m), caricati dalla mappa solo quando si ingrandisce.
import { feature } from 'topojson-client';
import world from 'world-atlas/land-50m.json';
import { path } from '../lib/proiezione';

export function GET() {
  return new Response(path(feature(world as any, (world as any).objects.land) as any), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}

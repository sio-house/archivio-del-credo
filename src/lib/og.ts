/** Generazione delle anteprime social (Open Graph), in fase di build. */
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const font = (p: string) => readFileSync(require.resolve(p));
const fonts = [
  { name: 'Cormorant', data: font('@fontsource/cormorant-garamond/files/cormorant-garamond-latin-600-normal.woff'), weight: 600 as const, style: 'normal' as const },
  { name: 'Inter', data: font('@fontsource/inter/files/inter-latin-400-normal.woff'), weight: 400 as const, style: 'normal' as const },
  { name: 'Inter', data: font('@fontsource/inter/files/inter-latin-600-normal.woff'), weight: 600 as const, style: 'normal' as const },
];

const INK = '#1d1b19', CARTA = '#f3ebd8', ROSSO = '#a3262a', GRIGIO = '#6b645c';
const el = (type: string, props: Record<string, unknown>) => ({ type, props });

export async function anteprima({ titolo, occhiello, nota }: { titolo: string; occhiello?: string; nota?: string }) {
  const svg = await satori(
    el('div', {
      style: { width: 1200, height: 630, display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        background: CARTA, padding: '64px 72px', fontFamily: 'Inter', position: 'relative' },
      children: [
        el('div', { style: { position: 'absolute', top: 0, left: 0, width: 1200, height: 10, background: ROSSO } }),
        el('div', {
          style: { display: 'flex', flexDirection: 'column', gap: 18 },
          children: [
            occhiello && el('div', { style: { fontSize: 24, letterSpacing: 3, textTransform: 'uppercase', color: GRIGIO, fontWeight: 600 }, children: occhiello }),
            el('div', { style: { fontFamily: 'Cormorant', fontSize: titolo.length > 46 ? 76 : 96, lineHeight: 1.06, color: INK }, children: titolo }),
            nota && el('div', { style: { fontSize: 30, color: GRIGIO, maxWidth: 940 }, children: nota }),
          ].filter(Boolean),
        }),
        el('div', {
          style: { display: 'flex', alignItems: 'center', gap: 16, fontSize: 26, color: INK },
          children: [
            el('div', { style: { width: 26, height: 26, background: ROSSO, transform: 'rotate(45deg)' } }),
            el('div', { style: { fontFamily: 'Cormorant', fontSize: 38 }, children: 'Archivio del Credo' }),
            el('div', { style: { color: GRIGIO, fontSize: 24 }, children: '· portale non ufficiale' }),
          ],
        }),
      ],
    }) as any,
    { width: 1200, height: 630, fonts },
  );
  return new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } }).render().asPng();
}

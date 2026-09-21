import { geoNaturalEarth1, geoPath } from 'd3-geo';
export const W = 1600, H = 820;
export const proj = geoNaturalEarth1().fitExtent([[10, 10], [W - 10, H - 10]], {
  type: 'MultiPoint', coordinates: [[-180, -57], [180, 84], [-180, 84], [180, -57], [0, -57], [0, 84]],
} as any);
export const path = geoPath(proj).digits(1);

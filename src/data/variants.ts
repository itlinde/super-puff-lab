// Variant matrix for The Super Puff Lab.
//
// Source: Isabella's saved copy of aritzia.com/en/clothing/coats-jackets/puffers/thesuperpuff
// (Oct 13, 2026). Product names, fabrics, prices and URLs are taken from the
// product tiles on that page. Full colour lists, descriptions and feature
// details live on the individual product pages and are NOT verified yet:
// anything marked `verified: false` or containing [COPY] is a placeholder.

export type Family = 'super-puff' | 'supersnug';
export type Length = 'xtrashorty' | 'shorty' | 'original' | 'mid' | 'long';
export type FabricId = 'climatte' | 'hi-gloss' | 'rainstop' | 'liquid-shine' | 'orbit-stretch';
export type Sleeves = 'sleeves' | 'vest';

export const LENGTHS: { id: Length; label: string }[] = [
  { id: 'xtrashorty', label: 'XtraShorty' },
  { id: 'shorty', label: 'Shorty' },
  { id: 'original', label: 'Original' },
  { id: 'mid', label: 'Mid' },
  { id: 'long', label: 'Long' },
];

export const FAMILIES: { id: Family; label: string; fitLabel: string }[] = [
  { id: 'super-puff', label: 'The Super Puff™', fitLabel: 'Oversized' },
  { id: 'supersnug', label: 'The SuperSnug Puff™', fitLabel: 'Slim' },
];

// Fabric copy is verbatim from the "Weatherproof Fabrics" story in the
// "All About Super" section of the Super Puff page.
export const FABRICS: { id: FabricId; label: string; description: string; video: string }[] = [
  { id: 'climatte', label: 'cliMATTE™', description: 'Matte Japanese ripstop that’s water repellent and wind resistant.', video: 'fw26-super-puff-fabric-climatte-app' },
  { id: 'rainstop', label: 'Rainstop™', description: 'Waterproof, windproof Japanese ripstop with two-layer construction.', video: 'fw26-super-puff-fabric-rainstop-app' },
  { id: 'hi-gloss', label: 'Hi-Gloss', description: 'water-repellent and wind-resistant French taffeta with a glossy finish and a soft feel.', video: 'fw26-super-puff-fabric-higloss-app' },
  { id: 'orbit-stretch', label: 'Orbit Stretch™', description: 'water-repellent, soft-matte fabric with all-around stretch.', video: 'fw26-super-puff-fabric-orbit-stretch-app' },
  { id: 'liquid-shine', label: 'Liquid Shine', description: 'water-resistant, windproof stretch fabric with a velvety look and a sleek feel.', video: 'fw26-super-puff-fabric-liquidshine-app' },
];

export interface Variant {
  name: string; // exact tile name from aritzia.com
  family: Family;
  length: Length;
  sleeves: Sleeves;
  fabric: FabricId;
  price: string;
  url: string;
  colours: string[]; // visible swatches only; full list unverified
  verified: boolean; // true once checked against the product page
}

const P = 'https://www.aritzia.com/en/product/';

export const VARIANTS: Variant[] = [
  // The Super Puff™ — jackets
  { name: 'The SuperPuff™ XtraShorty - cliMATTE™', family: 'super-puff', length: 'xtrashorty', sleeves: 'sleeves', fabric: 'climatte', price: '$275', url: P + 'the-super-puff%E2%84%A2-xtrashorty/126653.html', colours: ['BLACK', 'MATTE PEARL'], verified: false },
  { name: 'The Super Puff™ Shorty - cliMATTE™', family: 'super-puff', length: 'shorty', sleeves: 'sleeves', fabric: 'climatte', price: '$275 - $298', url: P + 'the-super-puff%E2%84%A2-shorty/126465.html', colours: ['VILLA PINK', 'BLACK'], verified: false },
  { name: 'The Super Puff™ Shorty - Hi-Gloss', family: 'super-puff', length: 'shorty', sleeves: 'sleeves', fabric: 'hi-gloss', price: '$298 - $325', url: P + 'the-super-puff%E2%84%A2-shorty/126366.html', colours: ['MOCHI PINK', 'BLACK', 'BIRCH', 'MODERN TAUPE', 'ADMIRAL NAVY', 'SUMAC BURGUNDY'], verified: false },
  { name: 'The Super Puff™ Shorty - Liquid Shine', family: 'super-puff', length: 'shorty', sleeves: 'sleeves', fabric: 'liquid-shine', price: '$325', url: P + 'the-super-puff%E2%84%A2-shorty/126367.html', colours: ['MOCHI PINK', 'BLACK'], verified: false },
  { name: 'The Super Puff₂O™ Shorty - Rainstop™', family: 'super-puff', length: 'shorty', sleeves: 'sleeves', fabric: 'rainstop', price: '$375', url: P + 'the-super-puff%E2%82%82o%E2%84%A2-shorty/126493.html', colours: ['DEW BLUE', 'BLACK'], verified: false },
  { name: 'The Super Puff™ - cliMATTE™', family: 'super-puff', length: 'original', sleeves: 'sleeves', fabric: 'climatte', price: '$298 - $325', url: P + 'the-super-puff%E2%84%A2/126464.html', colours: ['VILLA PINK', 'BLACK'], verified: false },
  { name: 'The Super Puff™ - Hi-Gloss', family: 'super-puff', length: 'original', sleeves: 'sleeves', fabric: 'hi-gloss', price: '$325 - $350', url: P + 'the-super-puff%E2%84%A2/126361.html', colours: ['SUMAC BURGUNDY', 'BLACK', 'BIRCH', 'MODERN TAUPE', 'ADMIRAL NAVY'], verified: false },
  { name: 'The Super Puff™ - Liquid Shine', family: 'super-puff', length: 'original', sleeves: 'sleeves', fabric: 'liquid-shine', price: '$350', url: P + 'the-super-puff%E2%84%A2/126362.html', colours: ['MOCHI PINK', 'BLACK', 'ADMIRAL NAVY'], verified: false },
  { name: 'The Super Puff₂O™ - Rainstop™', family: 'super-puff', length: 'original', sleeves: 'sleeves', fabric: 'rainstop', price: '$398', url: P + 'the-super-puff%E2%82%82o%E2%84%A2/126385.html', colours: ['CLAREMONT', 'BLACK', 'MODERN TAUPE'], verified: false },
  { name: 'The Super Puff™ Mid - cliMATTE™', family: 'super-puff', length: 'mid', sleeves: 'sleeves', fabric: 'climatte', price: '$350', url: P + 'the-super-puff%E2%84%A2-mid/126379.html', colours: ['MODERN TAUPE', 'BLACK', 'RICH MOCHA BROWN'], verified: false },
  { name: 'The Super Puff™ Mid - Hi-Gloss', family: 'super-puff', length: 'mid', sleeves: 'sleeves', fabric: 'hi-gloss', price: '$375', url: P + 'the-super-puff%E2%84%A2-mid/127156.html', colours: ['SUMAC BURGUNDY', 'BLACK', 'ADMIRAL NAVY'], verified: false },
  { name: 'The Super Puff₂O™ Mid - Rainstop™', family: 'super-puff', length: 'mid', sleeves: 'sleeves', fabric: 'rainstop', price: '$450', url: P + 'the-super-puff%E2%82%82o%E2%84%A2-mid/126422.html', colours: ['CLAREMONT', 'BLACK', 'MODERN TAUPE'], verified: false },
  { name: 'The Super Puff™ Long - cliMATTE™', family: 'super-puff', length: 'long', sleeves: 'sleeves', fabric: 'climatte', price: '$398 - $425', url: P + 'the-super-puff%E2%84%A2-long/126654.html', colours: ['ADMIRAL NAVY', 'BLACK'], verified: false },
  { name: 'The Super Puff™ Long - Hi-Gloss', family: 'super-puff', length: 'long', sleeves: 'sleeves', fabric: 'hi-gloss', price: '$425', url: P + 'the-super-puff%E2%84%A2-long/126378.html', colours: ['SUMAC BURGUNDY', 'BLACK', 'ADMIRAL NAVY'], verified: false },
  { name: 'The Super Puff₂O™ Long - Rainstop™', family: 'super-puff', length: 'long', sleeves: 'sleeves', fabric: 'rainstop', price: '$498', url: P + 'the-super-puff%E2%82%82o%E2%84%A2-long/126421.html', colours: ['RICH MOCHA BROWN', 'BLACK'], verified: false },
  // The Super Puff™ — vests
  { name: 'The Super Puff™ Shorty Vest - cliMATTE™', family: 'super-puff', length: 'shorty', sleeves: 'vest', fabric: 'climatte', price: '$225', url: P + 'the-super-puff%E2%84%A2-shorty-vest/126383.html', colours: ['DEW BLUE', 'BLACK'], verified: false },
  { name: 'The Super Puff™ Shorty Vest - Hi-Gloss', family: 'super-puff', length: 'shorty', sleeves: 'vest', fabric: 'hi-gloss', price: '$250', url: P + 'the-super-puff%E2%84%A2-shorty-vest/126384.html', colours: ['BIRCH', 'BLACK'], verified: false },
  { name: 'The Super Puff™ Vest - cliMATTE™', family: 'super-puff', length: 'original', sleeves: 'vest', fabric: 'climatte', price: '$250', url: P + 'the-super-puff%E2%84%A2-vest/126380.html', colours: ['CHROME GREY', 'ADMIRAL NAVY'], verified: false },
  { name: 'The Super Puff™ Vest - Hi-Gloss', family: 'super-puff', length: 'original', sleeves: 'vest', fabric: 'hi-gloss', price: '$275', url: P + 'the-super-puff%E2%84%A2-vest/126381.html', colours: ['ADMIRAL NAVY', 'BLACK', 'BIRCH'], verified: false },
  { name: 'The Super Puff™ Vest - Liquid Shine', family: 'super-puff', length: 'original', sleeves: 'vest', fabric: 'liquid-shine', price: '$298', url: P + 'the-super-puff%E2%84%A2-vest/126382.html', colours: ['BLACK', 'COAL GREY'], verified: false },
  { name: 'The Super Puff™ Mid Vest - cliMATTE™', family: 'super-puff', length: 'mid', sleeves: 'vest', fabric: 'climatte', price: '$275', url: P + 'the-super-puff%E2%84%A2-mid-vest/126724.html', colours: ['MODERN TAUPE', 'ELEGANT CHARCOAL'], verified: false },
  { name: 'The Super Puff™ Long Vest - cliMATTE™', family: 'super-puff', length: 'long', sleeves: 'vest', fabric: 'climatte', price: '$298', url: P + 'the-super-puff%E2%84%A2-long-vest/127138.html', colours: ['RICH MOCHA BROWN', 'BLACK'], verified: false },
  // The SuperSnug Puff™ — slim
  { name: 'The SuperSnug Puff™ - Orbit Stretch™', family: 'supersnug', length: 'original', sleeves: 'sleeves', fabric: 'orbit-stretch', price: '$298 - $325', url: P + 'the-supersnug-puff%E2%84%A2/128395.html', colours: ['BLACK', 'BLACK/SHINY GOLD', 'MATTE PEARL', 'ADMIRAL NAVY', 'MODERN TAUPE'], verified: false },
  { name: 'The SuperSnug Puff™ - Hi-Gloss', family: 'supersnug', length: 'original', sleeves: 'sleeves', fabric: 'hi-gloss', price: '$325 - $350', url: P + 'the-supersnug-puff%E2%84%A2/126426.html', colours: ['BLACK', 'BIRCH'], verified: false },
  { name: 'The SuperSnug Puff™ - Liquid Shine', family: 'supersnug', length: 'original', sleeves: 'sleeves', fabric: 'liquid-shine', price: '$350', url: P + 'the-supersnug-puff%E2%84%A2/126427.html', colours: ['ADMIRAL NAVY', 'BLACK'], verified: false },
  { name: 'The SuperSnug Puff₂O™ - Rainstop™', family: 'supersnug', length: 'original', sleeves: 'sleeves', fabric: 'rainstop', price: '$398', url: P + 'the-supersnug-puff%E2%82%82o%E2%84%A2/129390.html', colours: ['DEW BLUE', 'BLACK', 'MODERN TAUPE'], verified: false },
  { name: 'The SuperSnug Puff™ Mid - Orbit Stretch™', family: 'supersnug', length: 'mid', sleeves: 'sleeves', fabric: 'orbit-stretch', price: '$350 - $375', url: P + 'the-supersnug-puff%E2%84%A2-mid/131883.html', colours: ['ADMIRAL NAVY', 'MATTE PEARL', 'BLACK', 'BLACK/SHINY GOLD'], verified: false },
  { name: 'The SuperSnug Puff™ Mid - Hi-Gloss', family: 'supersnug', length: 'mid', sleeves: 'sleeves', fabric: 'hi-gloss', price: '$375 - $398', url: P + 'the-supersnug-puff%E2%84%A2-mid/126434.html', colours: ['ADMIRAL NAVY', 'BLACK'], verified: false },
  { name: 'The SuperSnug Puff₂O™ Mid - Rainstop™', family: 'supersnug', length: 'mid', sleeves: 'sleeves', fabric: 'rainstop', price: '$450', url: P + 'the-supersnug-puff%E2%82%82o%E2%84%A2-mid/120326.html', colours: ['ADMIRAL NAVY', 'BLACK'], verified: false },
  { name: 'The SuperSnug Puff™ Long - Orbit Stretch™', family: 'supersnug', length: 'long', sleeves: 'sleeves', fabric: 'orbit-stretch', price: '$398 - $425', url: P + 'the-supersnug-puff%E2%84%A2-long/127438.html', colours: ['RICH MOCHA BROWN', 'BLACK'], verified: false },
  { name: 'The SuperSnug Puff™ Long - Hi-Gloss', family: 'supersnug', length: 'long', sleeves: 'sleeves', fabric: 'hi-gloss', price: '$425 - $450', url: P + 'the-supersnug-puff%E2%84%A2-long/126425.html', colours: ['ADMIRAL NAVY', 'BLACK'], verified: false },
  { name: 'The SuperSnug Puff₂O™ Long - Rainstop™', family: 'supersnug', length: 'long', sleeves: 'sleeves', fabric: 'rainstop', price: '$498', url: P + 'the-supersnug-puff%E2%82%82o%E2%84%A2-long/116847.html', colours: ['MODERN TAUPE', 'BLACK'], verified: false },
];

// Placeholder swatch colours (eyeballed, not sampled). Replace with values
// sampled from Aritzia's swatch images once the product pages are saved.
export const COLOUR_HEX: Record<string, string> = {
  'BLACK': '#1d1d1f',
  'BIRCH': '#e9e2d4',
  'MATTE PEARL': '#e7e2d9',
  'VILLA PINK': '#ebc9cc',
  'MOCHI PINK': '#efd3d3',
  'DEW BLUE': '#bcd0de',
  'CLAREMONT': '#c9c3b6',
  'CHROME GREY': '#b9bbbc',
  'COAL GREY': '#4d4e50',
  'ELEGANT CHARCOAL': '#45464a',
  'MODERN TAUPE': '#a59584',
  'ADMIRAL NAVY': '#242c40',
  'SUMAC BURGUNDY': '#5e2129',
  'RICH MOCHA BROWN': '#5a4134',
  'BLACK/SHINY GOLD': '#1d1d1f',
};

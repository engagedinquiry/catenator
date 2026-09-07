/**
 * branding.rename — the one place the product name and tagline live.
 *
 * Mirrors apps/reader-app/prompts/build-config.yaml → branding.productName /
 * branding.tagline. Every UI surface reads from this object; no other file
 * contains the product name as a literal string (micro.single-source-of-truth).
 */
export const BRAND = {
  productName: 'Catenator Reader',
  tagline: 'Browse by persona, or view the schema'
} as const;

export const PRIOR_NAMES = ['Syntaxia', 'Syntaxia Studio'] as const;

export const BRAND_LINE = `${BRAND.productName} · ${BRAND.tagline}`;

/**
 * ui.edge-cases.dynamic-page-title: "<crumbs> — Catenator Reader".
 * e.g. pageTitle(['Refraction', 'engineers']) -> "Refraction — engineers — Catenator Reader"
 */
export function pageTitle(parts: string[]): string {
  return [...parts, BRAND.productName].filter(Boolean).join(' — ');
}

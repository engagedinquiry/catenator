/**
 * branding.rename — the single source of truth for the product's displayed name
 * and tagline. Mirrors apps/phase-1-basic-publication/prompts/build-config.yaml →
 * branding.productName / branding.tagline. Every UI surface reads from here; no
 * other file contains the product name as a literal (micro.single-source-of-truth).
 *
 * PRIOR_NAMES = build-config.yaml → branding.priorNames. The test suite scans the
 * built source for them (micro.scan-for-prior-names).
 */
export const BRAND = {
  productName: 'Catenator',
  tagline: 'Creating and Refracting — Basic Publication'
} as const;

export const PRIOR_NAMES = ['Syntaxia', 'Syntaxia Studio'] as const;

/** "Catenator · Creating and Refracting — Basic Publication" */
export const BRAND_LINE = `${BRAND.productName} · ${BRAND.tagline}`;

/** Page <title>. */
export const BRAND_TITLE = `${BRAND.productName} — ${BRAND.tagline}`;

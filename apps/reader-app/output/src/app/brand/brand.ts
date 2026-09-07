/**
 * branding.rename — the one place the product name and tagline live.
 *
 * Mirrors apps/reader-app/prompts/build-config.yaml → branding.productName /
 * branding.tagline. Every UI surface reads from this object; no other file
 * contains the product name as a literal string (micro.single-source-of-truth).
 * PRIOR_NAMES (build-config → branding.priorNames, currently empty) keeps the
 * retired Catenator-family names so the test suite can scan for them.
 */
export const BRAND = {
  productName: 'Catenator Reader',
  tagline: 'Browse by persona, or view the schema'
} as const;

export const PRIOR_NAMES = ['Syntaxia', 'Syntaxia Studio'] as const;

/** "Catenator Reader · Browse by persona, or view the schema" */
export const BRAND_LINE = `${BRAND.productName} · ${BRAND.tagline}`;

/** Page <title>. */
export const BRAND_TITLE = BRAND.productName;

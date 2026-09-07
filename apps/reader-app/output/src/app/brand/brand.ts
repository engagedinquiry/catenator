/**
 * Single source of truth for the product's displayed name and tagline.
 *
 * These values mirror `apps/reader-app/prompts/build-config.yaml` →
 * `branding.productName` / `branding.tagline`. They are declared once here and
 * every UI surface (page title, top bar, rail tooltip) reads from this object —
 * no other file contains the product name as a literal string.
 *
 * `PRIOR_NAMES` records names that must never reappear in user-visible text
 * (build-config.yaml → branding.priorNames, currently empty). The Catenator
 * family's retired names are still listed so the test suite can scan for them.
 *
 * (system.yaml references components/branding-rename.yaml, which is not present
 * in this app's spec set; this file applies the same brand.ts pattern Phase 0
 * used for branding.rename.)
 */
export const BRAND = {
  productName: 'Catenator Reader',
  tagline: 'One idea, read your way'
} as const;

export const PRIOR_NAMES = ['Syntaxia', 'Syntaxia Studio'] as const;

/** "Catenator Reader · One idea, read your way" — the canonical one-line label. */
export const BRAND_LINE = `${BRAND.productName} · ${BRAND.tagline}`;

/** Page <title>. */
export const BRAND_TITLE = BRAND.productName;

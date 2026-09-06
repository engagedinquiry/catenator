/**
 * Single source of truth for the product's displayed name and tagline.
 *
 * These values mirror `apps/phase-0-single-topic/prompts/build-config.yaml`
 * → `branding.productName` / `branding.tagline`. They are declared once here
 * and every UI surface (page title, top bar, rail tooltip) reads from this
 * object — no other file contains the product name as a literal string.
 *
 * `PRIOR_NAMES` records names that must never reappear in user-visible text
 * (build-config.yaml → branding.priorNames); the test suite scans the built
 * source for them.
 */
export const BRAND = {
  productName: 'Catenator',
  tagline: 'Creating and Refracting'
} as const;

export const PRIOR_NAMES = ['Syntaxia', 'Syntaxia Studio'] as const;

/** "Catenator · Creating and Refracting" — the canonical one-line label. */
export const BRAND_LINE = `${BRAND.productName} · ${BRAND.tagline}`;

/** Page <title>. */
export const BRAND_TITLE = `${BRAND.productName} — ${BRAND.tagline}`;

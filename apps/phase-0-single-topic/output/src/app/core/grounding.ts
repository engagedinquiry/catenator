/**
 * check.grounding — verify a refracted output traces back to the topic text
 * and sources before it can be delivered.
 *
 * intent:      "Verify refracted output traces to topic/sources before delivery."
 * mustNever:   "Deliver output containing an ungrounded specific claim"
 * micro:       "Absent facts stated as absent, not filled in"
 *
 * This is a deterministic pre-check, not a semantic judge. It extracts the
 * kinds of tokens that carry specific factual weight — numbers, status codes,
 * header names, ALL-CAPS identifiers, quoted phrases — and checks each one
 * appears in the combined topic + sources text. Anything that does not is
 * surfaced to the verifier (the author) as a candidate ungrounded claim.
 * Delivery is blocked until every candidate is either absent from the output
 * or explicitly acknowledged by the verifier (see publish.ts).
 */

import type { Refraction, SourceItem } from '../model/models';

export interface Claim {
  /** The exact token as it appears in the refracted output. */
  text: string;
  /** Did an equivalent token appear in topic + sources? */
  grounded: boolean;
}

export interface GroundingReport {
  personaId: string;
  claims: Claim[];
  /** Claims the check could not trace to the source material. */
  ungrounded: Claim[];
}

function normalize(s: string): string {
  return s.toLowerCase().replace(/\s+/g, ' ');
}

/** Pull specific, checkable tokens out of a piece of text. */
export function extractClaims(text: string): string[] {
  const found = new Set<string>();

  // Numbers with an optionally-attached unit (429, 140ms, 60, 83%).
  for (const m of text.matchAll(/\b\d[\d.,]*(?:ms|s|%)?\b/gi)) {
    const t = m[0].trim();
    if (/\d/.test(t) && !/^\d+[.)]$/.test(t)) found.add(t);
  }
  // Hyphenated / dotted identifiers and header names (X-RateLimit-Reset, ADR-014).
  for (const m of text.matchAll(/\b[A-Za-z][A-Za-z0-9]*(?:[-.][A-Za-z0-9]+){1,}\b/g)) {
    found.add(m[0]);
  }
  // ALL-CAPS identifiers of length >= 2 (HTTP, RRF, BM25-ish, API).
  for (const m of text.matchAll(/\b[A-Z]{2,}[A-Z0-9]*\b/g)) {
    found.add(m[0]);
  }
  // Explicitly quoted phrases.
  for (const m of text.matchAll(/["“]([^"”]{2,60})["”]/g)) {
    found.add(m[1]);
  }
  return [...found];
}

function sourceText(topicText: string, sources: SourceItem[]): string {
  return normalize(
    [topicText, ...sources.flatMap((s) => [s.title, s.reference, s.description])].join(' \n ')
  );
}

export function checkGrounding(
  refraction: Refraction,
  topicText: string,
  sources: SourceItem[]
): GroundingReport {
  const haystack = sourceText(topicText, sources);
  const claims: Claim[] = extractClaims(refraction.output).map((raw) => {
    const needle = normalize(raw).replace(/\s?(ms|s|%)$/, '').trim();
    const grounded =
      haystack.includes(normalize(raw)) ||
      (needle.length > 0 && haystack.includes(needle));
    return { text: raw, grounded };
  });
  return {
    personaId: refraction.personaId,
    claims,
    ungrounded: claims.filter((c) => !c.grounded)
  };
}

import type { SourceItem } from './models';

/**
 * check.grounding — verify a refracted text traces to the topic / sources.
 *
 * intent: "Verify refracted output traces to topic/sources before delivery."
 * mustNever "Deliver output containing an ungrounded specific claim".
 * micro.missing-fact-disclosure: absent facts must be stated as absent, not
 * filled in — so a sentence that discloses a gap is never itself "ungrounded".
 * micro.runs-as-a-publish-gate: this function is called from delivery.ts at
 * request time, once per persona — not at Refract, not as its own step.
 *
 * A "specific claim" here is a concrete token the model could only have if it
 * were in the input: a number, a status code, a header/identifier name, a
 * quoted phrase. Each such token in the output must appear (case-insensitively)
 * somewhere in topic + sources. Any that does not => ungrounded.
 */
export interface GroundingResult {
  grounded: boolean;
  ungrounded: string[];
}

const DISCLOSURE_RE =
  /\b(not (?:specified|stated|provided|given|defined|documented)|does(?:n't| not) (?:specify|state|say|mention)|no (?:value|detail|information) (?:is )?(?:specified|provided|given))\b/i;

/** Pull the specific, checkable tokens out of a piece of prose. */
export function extractClaims(text: string): string[] {
  const claims = new Set<string>();

  // numbers (incl. "429", "1000", "3.5", "60s") — but not list bullets "1."
  for (const m of text.matchAll(/(?<![.\w])\d[\d,]*(?:\.\d+)?\w*/g)) {
    const tok = m[0].replace(/[,.]$/, '');
    if (/\d/.test(tok) && tok.length > 0 && !/^\d\.$/.test(m[0])) claims.add(tok);
  }
  // Header / identifier style names: X-Rate-Limit, X-RateLimit-Reset, snake_case, CONSTANT_CASE
  for (const m of text.matchAll(/\b(?:[A-Z][a-z0-9]*-)+[A-Za-z0-9-]+\b|\b[A-Z][A-Za-z0-9]*(?:-[A-Za-z0-9]+)+\b|\b[A-Za-z]+_[A-Za-z_]+\b/g)) {
    claims.add(m[0]);
  }
  // `code spans` and "quoted phrases"
  for (const m of text.matchAll(/`([^`]+)`/g)) claims.add(m[1].trim());
  for (const m of text.matchAll(/"([^"]{2,60})"/g)) claims.add(m[1].trim());

  return [...claims];
}

export function checkGrounding(text: string, topicText: string, sources: SourceItem[]): GroundingResult {
  const corpus = [
    topicText,
    ...sources.flatMap((s) => [s.title, s.reference, s.description])
  ]
    .join(' \n ')
    .toLowerCase();

  const ungrounded: string[] = [];
  for (const claim of extractClaims(text)) {
    const needle = claim.toLowerCase();
    if (corpus.includes(needle)) continue;
    // digits-only claim: also accept a spelled/normalised match without separators
    if (/^\d[\d,]*$/.test(claim) && corpus.includes(needle.replace(/,/g, ''))) continue;
    // the claim only appears inside a sentence that discloses it as absent
    const sentence = sentenceAround(text, claim);
    if (sentence && DISCLOSURE_RE.test(sentence)) continue;
    ungrounded.push(claim);
  }

  return { grounded: ungrounded.length === 0, ungrounded };
}

function sentenceAround(text: string, claim: string): string | null {
  const idx = text.toLowerCase().indexOf(claim.toLowerCase());
  if (idx === -1) return null;
  const start = Math.max(0, text.lastIndexOf('.', idx) + 1, text.lastIndexOf('\n', idx) + 1);
  let end = text.length;
  for (const p of ['.', '\n']) {
    const e = text.indexOf(p, idx);
    if (e !== -1 && e < end) end = e;
  }
  return text.slice(start, end);
}

import { FIXED_DIMENSIONS } from './models';
import type { Dimension, SourceItem } from './models';

/**
 * input-mode.dual — the free-text parser for the Sources and Personas steps.
 *
 * micro.mode-parity: parses into the EXACT same fields the structured form
 * writes.
 * micro.sources-format: markdown H2 sections "## Title" / "## Source" /
 * "## Description"; each section body is that field's value.
 * micro.personas-format: "## <name>" heading IS the name; the next paragraph is
 * the summary; a later comma-list matching system.yaml contentScope.fixedDimensions
 * is the dimensions (matched by name, no label).
 * micro.clean-value-extraction: values never contain "##", labels, colons, or
 * structural quote marks.
 * micro.parse-only-what-is-stated: a dimension not present in the text stays
 * unselected; nothing is inferred.
 */

/** Split markdown into { headingText -> bodyLines } by H2. Body is trimmed. */
function h2Sections(md: string): Array<{ heading: string; body: string; bodyLines: string[] }> {
  const lines = md.replace(/\r\n/g, '\n').split('\n');
  const out: Array<{ heading: string; body: string; bodyLines: string[] }> = [];
  let current: { heading: string; bodyLines: string[] } | null = null;
  for (const line of lines) {
    const h = line.match(/^\s*##\s+(.*\S)\s*$/);
    if (h) {
      if (current) out.push({ ...current, body: current.bodyLines.join('\n').trim() });
      current = { heading: h[1].trim(), bodyLines: [] };
    } else if (current) {
      current.bodyLines.push(line);
    }
  }
  if (current) out.push({ ...current, body: current.bodyLines.join('\n').trim() });
  return out;
}

/** Collapse internal whitespace/newlines in a field value to single spaces. */
function flatten(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

// ---- Sources ----------------------------------------------------------------

export interface SourcesParse {
  ok: boolean;
  sources: SourceItem[];
  errors: string[];
}

/**
 * micro.sources-format. A single labeled record is ONE source
 * (mustNever "Split a single labeled record into multiple separate entries").
 */
export function parseSourcesFreetext(md: string): SourcesParse {
  const sections = h2Sections(md);
  const pick = (name: string) =>
    sections.find((s) => s.heading.toLowerCase() === name)?.body ?? null;

  const title = pick('title');
  const reference = pick('source');
  const description = pick('description');
  const errors: string[] = [];
  if (title === null) errors.push('Missing "## Title" section.');
  if (reference === null) errors.push('Missing "## Source" section.');
  if (description === null) errors.push('Missing "## Description" section.');

  if (errors.length) return { ok: false, sources: [], errors };

  return {
    ok: true,
    sources: [
      {
        title: flatten(title!),
        reference: flatten(reference!),
        description: flatten(description!)
      }
    ],
    errors: []
  };
}

// ---- Personas -------------------------------------------------------------

export interface PersonaDraft {
  name: string;
  summary: string;
  dimensions: Dimension[];
}
export interface PersonasParse {
  ok: boolean;
  personas: PersonaDraft[];
  errors: string[];
}

/**
 * A line is a dimension list iff every comma-separated token, trimmed, matches
 * one of FIXED_DIMENSIONS case-insensitively. Recognition, not inference —
 * the words must actually be there (micro.parse-only-what-is-stated).
 */
function asDimensionLine(line: string): Dimension[] | null {
  const raw = line.trim();
  if (!raw || !raw.includes(',') && !FIXED_DIMENSIONS.some((d) => d.toLowerCase() === raw.toLowerCase())) {
    return null;
  }
  const tokens = raw.split(',').map((t) => t.trim()).filter(Boolean);
  if (tokens.length === 0) return null;
  const matched: Dimension[] = [];
  for (const tok of tokens) {
    const hit = FIXED_DIMENSIONS.find((d) => d.toLowerCase() === tok.toLowerCase());
    if (!hit) return null; // any non-dimension token disqualifies the whole line
    if (!matched.includes(hit)) matched.push(hit);
  }
  // return in canonical order
  return FIXED_DIMENSIONS.filter((d) => matched.includes(d));
}

export function parsePersonasFreetext(md: string): PersonasParse {
  const sections = h2Sections(md);
  const errors: string[] = [];
  const personas: PersonaDraft[] = [];

  for (const sec of sections) {
    const bodyLines = sec.body.split('\n').map((l) => l.trim());
    // strip trailing blank lines
    while (bodyLines.length && bodyLines[bodyLines.length - 1] === '') bodyLines.pop();

    // last non-empty line MAY be a dimension list
    let dimensions: Dimension[] = [];
    let summaryLines = [...bodyLines];
    if (bodyLines.length) {
      const dims = asDimensionLine(bodyLines[bodyLines.length - 1]);
      if (dims) {
        dimensions = dims;
        summaryLines = bodyLines.slice(0, -1);
      }
    }
    // summary = everything under the heading that is not the trailing dimension
    // line, flattened. (personas-format: "the paragraph immediately following the
    // heading is that persona's summary"; blank lines collapse.)
    const summaryPara = summaryLines.join(' ');

    const name = flatten(sec.heading);
    const summary = flatten(summaryPara);
    if (!name) errors.push('A persona heading is empty.');
    if (!summary) errors.push(`Persona "${name}" has no summary paragraph.`);
    personas.push({ name, summary, dimensions });
  }

  if (personas.length === 0) errors.push('No "## <name>" persona headings found.');

  return { ok: errors.length === 0, personas, errors };
}

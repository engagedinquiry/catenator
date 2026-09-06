/**
 * Deterministic free-text -> structured-field parsers (input-mode.dual).
 *
 * The free-text mode parses into the SAME shape the structured form produces,
 * so downstream steps never know which mode was used (micro.mode-parity).
 * No LLM here — plain string work.
 *
 * Hard rules enforced here:
 *  - parse-only-what-is-stated: a field the text does not contain stays blank;
 *    a dimension not written stays unselected. Nothing is inferred.
 *  - clean-value-extraction: parsed values never contain "##", surrounding
 *    quote marks, field labels, or structural colons.
 *  - Sources free text is markdown with H2 sections: "## Title" / "## Source" /
 *    "## Description". The old "Label:" line-prefix style is not supported.
 *  - Personas free text is markdown: each "## <name>" heading IS the persona
 *    name; the paragraph after it is the summary; a line that is a
 *    comma-separated list of known dimension names is the dimensions list.
 */

import {
  type Dimension,
  DIMENSIONS,
  MAX_PERSONAS,
  matchDimension,
  type Persona,
  type SourceItem
} from '../model/models';

interface Section {
  heading: string;
  body: string;
}

/** Split markdown into H2 sections. Text before the first "##" is ignored. */
function h2Sections(text: string): Section[] {
  const lines = text.replace(/\r\n/g, '\n').split('\n');
  const sections: Section[] = [];
  let current: { heading: string; body: string[] } | null = null;

  for (const line of lines) {
    const m = line.match(/^\s*##\s+(.*\S)\s*$/);
    if (m) {
      if (current) sections.push({ heading: current.heading, body: current.body.join('\n').trim() });
      current = { heading: cleanValue(m[1]), body: [] };
    } else if (current) {
      current.body.push(line);
    }
  }
  if (current) sections.push({ heading: current.heading, body: current.body.join('\n').trim() });
  return sections;
}

/** Strip structural punctuation that is never part of an intended value. */
export function cleanValue(raw: string): string {
  let v = raw.replace(/\r\n/g, '\n').trim();
  v = v.replace(/^#{1,6}\s*/, ''); // stray heading marks
  v = v.replace(/^\s*[-*]\s+/, ''); // stray list bullet
  // surrounding matched quotes only
  const pairs: Array<[string, string]> = [
    ['"', '"'],
    ["'", "'"],
    ['“', '”'],
    ['‘', '’']
  ];
  for (const [open, close] of pairs) {
    if (v.length >= 2 && v.startsWith(open) && v.endsWith(close)) {
      v = v.slice(1, -1).trim();
      break;
    }
  }
  return v;
}

const SOURCE_HEADINGS: Record<string, keyof SourceItem> = {
  title: 'title',
  topic: 'title',
  name: 'title',
  source: 'reference',
  reference: 'reference',
  ref: 'reference',
  description: 'description',
  desc: 'description',
  about: 'description'
};

/**
 * Parse a markdown blob into ONE source record { title, reference, description }.
 * A section that is not present leaves its field blank — never inferred.
 */
export function parseSource(text: string): SourceItem {
  const out: SourceItem = { title: '', reference: '', description: '' };
  for (const section of h2Sections(text)) {
    const key = SOURCE_HEADINGS[section.heading.trim().toLowerCase()];
    if (key && !out[key]) out[key] = collapseParagraph(section.body);
  }
  return out;
}

/** Parse a markdown blob into a list of source records (phase-0: 0 or 1). */
export function parseSources(text: string): SourceItem[] {
  const one = parseSource(text);
  return one.title || one.reference || one.description ? [one] : [];
}

function collapseParagraph(body: string): string {
  return cleanValue(body)
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .join(' ');
}

function slugify(name: string, index: number): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return base || `persona-${index + 1}`;
}

/** True when every comma-separated token on the line is a known dimension. */
function asDimensionLine(line: string): Dimension[] | null {
  const tokens = line
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);
  if (tokens.length === 0) return null;
  const matched = tokens.map(matchDimension);
  if (matched.some((m) => m === null)) return null;
  const set = new Set(matched as Dimension[]);
  return DIMENSIONS.filter((d) => set.has(d)); // canonical order, deduped
}

/**
 * Parse a markdown blob into up to MAX_PERSONAS personas.
 * Each "## <name>" heading = one persona; the heading text is the name.
 * The first non-empty paragraph after it is the summary. A line that is a
 * comma-separated list of known dimension names is the dimensions list.
 */
export function parsePersonas(text: string): Persona[] {
  return h2Sections(text)
    .slice(0, MAX_PERSONAS)
    .map((section, i) => {
      const name = section.heading;
      const lines = section.body
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean);

      let dimensions: Dimension[] = [];
      const summaryLines: string[] = [];
      for (const line of lines) {
        const dims = asDimensionLine(line);
        if (dims && dimensions.length === 0) {
          dimensions = dims;
        } else {
          summaryLines.push(line);
        }
      }

      return {
        id: slugify(name, i),
        name,
        summary: summaryLines.join(' ').replace(/\s+/g, ' ').trim(),
        dimensions
      } satisfies Persona;
    })
    .filter((p) => p.name.length > 0);
}

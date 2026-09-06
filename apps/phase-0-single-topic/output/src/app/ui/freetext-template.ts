/**
 * input-mode.dual micro.downloadable-template — a blank markdown template the
 * user can fill in and paste back into the free-text box. Section headers only,
 * no pre-filled example values.
 */

export const SOURCES_TEMPLATE = `## Title

## Source

## Description
`;

export const PERSONAS_TEMPLATE = `## Persona name

Summary — who this reader is and what they read for.

Content, Context
`;

/** Trigger a browser download of \`text\` as \`filename\`. */
export function downloadText(filename: string, text: string): void {
  const blob = new Blob([text], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

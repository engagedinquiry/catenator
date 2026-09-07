/**
 * input-mode.dual micro.downloadable-template — markdown a user can fill in and
 * paste back. Section headers only, no pre-filled example values.
 */
export const SOURCES_TEMPLATE = ['## Title', '', '## Source', '', '## Description', ''].join('\n');

export const PERSONAS_TEMPLATE = [
  '## <persona name>',
  '',
  '<one-paragraph summary of who this reader is and what they need>',
  '',
  '<comma-separated dimensions from: Surface, Content, Context, Time, Trust>',
  ''
].join('\n');

/** Trigger a client-side download of `text` as `filename` (dev-server + prod). */
export function downloadText(filename: string, text: string): void {
  const blob = new Blob([text], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

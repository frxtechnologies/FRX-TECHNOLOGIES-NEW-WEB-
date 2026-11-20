/** "Title | description" per line → pairs. Lines without a pipe become a title only. */
export function pairs(text: string): { title: string; body: string }[] {
  return text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      const i = l.indexOf("|");
      return i < 0 ? { title: l, body: "" } : { title: l.slice(0, i).trim(), body: l.slice(i + 1).trim() };
    });
}

/** Paragraphs separated by one or more blank lines. */
export function paragraphs(text: string): string[] {
  return text
    .split(/\r?\n\s*\r?\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

/**
 * Structured data, emitted as the Next.js docs prescribe.
 *
 * The `<` escaping matters: schema values are ordinary strings, and one
 * containing `</script>` would otherwise close the tag early and let the rest
 * of the payload be parsed as markup.
 *
 * React logs a dev-only warning about script tags inside components. It is
 * expected here — the tag is never meant to execute, only to be read by
 * crawlers from the server-rendered HTML.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}

interface JsonLdProps {
  /** A schema.org document, normally built by the helpers in `@/lib/schema`. */
  data: Record<string, unknown>;
}

/**
 * Renders structured data as a plain `<script type="application/ld+json">`.
 *
 * A native script tag is deliberate: JSON-LD is data, not code, so `next/script`
 * and its loading strategies buy nothing here. `<` is escaped because
 * `JSON.stringify` will happily emit a closing tag from a string field and end
 * the script early.
 */
export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}

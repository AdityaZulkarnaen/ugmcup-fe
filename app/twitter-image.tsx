/**
 * X/Twitter reads `twitter:image` and only falls back to `og:image` when that
 * tag is missing. Rather than keep a second design in sync, this route is the
 * Open Graph card verbatim.
 */
export { default, alt, size, contentType } from "./opengraph-image";

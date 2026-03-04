/**
 * Build-time HTML sanitizer for config fields rendered via set:html.
 * Strips dangerous tags and attributes while preserving safe formatting.
 */

const DANGEROUS_TAGS =
  /(<\s*\/?\s*(script|iframe|object|embed|form|input|textarea|select|button|link|style|base|meta|applet|frame|frameset)\b[^>]*>)/gi;

const DANGEROUS_ATTRS =
  /\s+(on\w+|formaction|xlink:href|data-bind|srcdoc|action)\s*=\s*["'][^"']*["']/gi;

const JAVASCRIPT_URLS = /\bhref\s*=\s*["']\s*javascript:/gi;

export function sanitizeHtml(input: string): string {
  return input
    .replace(DANGEROUS_TAGS, '')
    .replace(DANGEROUS_ATTRS, '')
    .replace(JAVASCRIPT_URLS, 'href="');
}

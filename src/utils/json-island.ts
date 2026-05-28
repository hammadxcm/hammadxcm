/**
 * Serialize a value for embedding in an inline `<script type="application/json">`
 * island. Escapes `<` to its JSON unicode escape so a string containing
 * `</script>` cannot break out of the tag (defense-in-depth against XSS).
 * The escape is transparent: JSON.parse restores the original `<`.
 */
export function safeJsonForScript(value: unknown): string {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}

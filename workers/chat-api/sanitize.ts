export const REFUSAL_PHRASE = "I can only help with questions about Hammad's portfolio.";

/**
 * Post-process AI responses to catch contradictions:
 * If the model starts with a refusal but then adds off-topic content anyway, truncate.
 * Also block any code generation that slips through.
 */
export function sanitizeResponse(text: string): string {
  const lower = text.toLowerCase();
  const refusalLower = REFUSAL_PHRASE.toLowerCase().replace('.', '');

  // If response STARTS with refusal but has more content, truncate to just the refusal
  if (lower.startsWith(refusalLower) && text.length > REFUSAL_PHRASE.length + 20) {
    return REFUSAL_PHRASE;
  }

  // If response contains refusal phrase AND code blocks, it's contradicting itself
  if (lower.includes(refusalLower) && (lower.includes('```') || lower.includes('def ') || lower.includes('function('))) {
    return REFUSAL_PHRASE;
  }

  // Block code blocks that aren't about Hammad's work
  if (lower.includes('```') && !lower.includes('hammad')) {
    return REFUSAL_PHRASE;
  }

  return text;
}

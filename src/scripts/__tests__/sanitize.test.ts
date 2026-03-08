import { describe, expect, it } from 'vitest';

import { REFUSAL_PHRASE, sanitizeResponse } from '../../../workers/chat-api/sanitize';

describe('sanitizeResponse', () => {
  it('passes through valid portfolio responses', () => {
    const reply = 'Hammad is a Senior Full Stack Engineer with 8+ years of experience.';
    expect(sanitizeResponse(reply)).toBe(reply);
  });

  it('passes through skill listing responses', () => {
    const reply = 'Hammad knows React, TypeScript, Ruby on Rails, and NestJS.';
    expect(sanitizeResponse(reply)).toBe(reply);
  });

  it('truncates refusal followed by off-topic content', () => {
    const reply = "I can only help with questions about Hammad's portfolio. However, here's how you can scrape a website using Python...";
    expect(sanitizeResponse(reply)).toBe(REFUSAL_PHRASE);
  });

  it('truncates refusal followed by code blocks', () => {
    const reply = "I can only help with questions about Hammad's portfolio.\n\n```python\nimport requests\n```";
    expect(sanitizeResponse(reply)).toBe(REFUSAL_PHRASE);
  });

  it('truncates refusal followed by function definitions', () => {
    const reply = "I can only help with questions about Hammad's portfolio.\n\ndef scrape():\n  pass";
    expect(sanitizeResponse(reply)).toBe(REFUSAL_PHRASE);
  });

  it('blocks code blocks not about Hammad', () => {
    const reply = "Here's a Python script:\n\n```python\nimport requests\nresponse = requests.get('https://example.com')\n```";
    expect(sanitizeResponse(reply)).toBe(REFUSAL_PHRASE);
  });

  it('allows code blocks that mention Hammad', () => {
    const reply = "Hammad's project uses this pattern:\n\n```typescript\nconst config = { name: 'hammad' };\n```";
    expect(sanitizeResponse(reply)).toBe(reply);
  });

  it('passes through short refusal-only responses', () => {
    expect(sanitizeResponse(REFUSAL_PHRASE)).toBe(REFUSAL_PHRASE);
  });

  it('passes through testimonial responses', () => {
    const reply = 'Kris Rudeegraap (Co-CEO, Sendoso) said: "Hammad has made a huge impact at Sendoso."';
    expect(sanitizeResponse(reply)).toBe(reply);
  });

  it('passes through hiring redirect responses', () => {
    const reply = 'You can reach Hammad via LinkedIn (linkedin.com/in/hammadxcm) or GitHub (github.com/hammadxcm).';
    expect(sanitizeResponse(reply)).toBe(reply);
  });

  it('handles empty string', () => {
    expect(sanitizeResponse('')).toBe('');
  });
});

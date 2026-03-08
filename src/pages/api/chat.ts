import type { APIRoute } from 'astro';

// Chat is handled by the Cloudflare Worker (workers/chat-api/).
// This stub exists only for completeness — the client calls the worker directly.
export const POST: APIRoute = () => {
  return new Response(
    JSON.stringify({ reply: 'Chat is served by the Cloudflare Worker. See workers/chat-api/.' }),
    { status: 200, headers: { 'Content-Type': 'application/json' } },
  );
};

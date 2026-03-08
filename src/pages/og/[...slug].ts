import type { APIRoute, GetStaticPaths } from 'astro';

export const getStaticPaths: GetStaticPaths = () => {
  return [{ params: { slug: 'home' } }];
};

export const GET: APIRoute = () => {
  return new Response('OG image generation requires satori and @resvg/resvg-js packages', {
    status: 501,
    headers: { 'Content-Type': 'text/plain' },
  });
};

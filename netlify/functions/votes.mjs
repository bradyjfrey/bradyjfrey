import { getStore } from '@netlify/blobs';

const STORE_NAME = 'japan-votes';
const KEY = 'scores';

export default async (req) => {
  const store = getStore({ name: STORE_NAME, consistency: 'strong' });

  if (req.method === 'GET') {
    const scores = (await store.get(KEY, { type: 'json' })) || {};
    return Response.json(scores, {
      headers: { 'cache-control': 'no-store' },
    });
  }

  if (req.method === 'POST') {
    const body = await req.json().catch(() => null);
    if (
      !body ||
      typeof body.itemId !== 'string' ||
      (body.direction !== 'up' && body.direction !== 'down')
    ) {
      return new Response('Bad request', { status: 400 });
    }
    const scores = (await store.get(KEY, { type: 'json' })) || {};
    const delta = body.direction === 'up' ? 1 : -1;
    scores[body.itemId] = (scores[body.itemId] || 0) + delta;
    await store.setJSON(KEY, scores);
    return Response.json(
      { itemId: body.itemId, score: scores[body.itemId] },
      { headers: { 'cache-control': 'no-store' } },
    );
  }

  return new Response('Method not allowed', { status: 405 });
};

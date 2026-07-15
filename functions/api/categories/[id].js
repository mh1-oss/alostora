import { getDbClient } from '../_db.js';

// DELETE /api/categories/:id - Delete a category
export async function onRequest(context) {
  const { request, env, params } = context;

  const jsonHeaders = {
    'Content-Type': 'application/json;charset=UTF-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: jsonHeaders });
  }

  if (request.method !== 'DELETE') {
    return new Response('Method not allowed', { status: 405, headers: jsonHeaders });
  }

  const id = params.id;

  const client = getDbClient(env);
  if (!client) {
    return new Response(JSON.stringify({ success: true }), { headers: jsonHeaders });
  }

  try {
    await client.connect();
    await client.query('DELETE FROM categories WHERE id = $1', [id]);
    return new Response(JSON.stringify({ success: true }), { headers: jsonHeaders });
  } catch (e) {
    console.error('Category DELETE error:', e.message);
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: jsonHeaders });
  } finally {
    await client.end();
  }
}

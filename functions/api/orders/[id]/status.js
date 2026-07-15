import { getDbClient } from '../../_db.js';

// PUT /api/orders/:id/status - Update order status (Admin)
export async function onRequest(context) {
  const { request, env, params } = context;

  const jsonHeaders = {
    'Content-Type': 'application/json;charset=UTF-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'PUT, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: jsonHeaders });
  }

  if (request.method !== 'PUT') {
    return new Response('Method not allowed', { status: 405, headers: jsonHeaders });
  }

  const id = params.id;
  const client = getDbClient(env);

  try {
    const { status } = await request.json();

    if (!client) {
      return new Response(JSON.stringify({ id, status }), { headers: jsonHeaders });
    }

    await client.connect();
    const res = await client.query(
      'UPDATE orders SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );

    if (res.rows.length === 0) {
      return new Response(JSON.stringify({ error: 'الطلب غير موجود' }), { status: 404, headers: jsonHeaders });
    }

    return new Response(JSON.stringify(res.rows[0]), { headers: jsonHeaders });
  } catch (e) {
    console.error('Order status update error:', e.message);
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: jsonHeaders });
  } finally {
    if (client) await client.end();
  }
}

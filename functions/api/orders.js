import { getDbClient } from './_db.js';

// GET /api/orders
// POST /api/orders
export async function onRequest(context) {
  const { request, env } = context;
  const client = getDbClient(env);

  const jsonHeaders = {
    'Content-Type': 'application/json;charset=UTF-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: jsonHeaders });
  }

  // Handle GET request (Fetch orders - Admin)
  if (request.method === 'GET') {
    if (!client) {
      return new Response(JSON.stringify([]), { headers: jsonHeaders });
    }
    try {
      await client.connect();
      const res = await client.query('SELECT * FROM orders ORDER BY id DESC');
      return new Response(JSON.stringify(res.rows), { headers: jsonHeaders });
    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: jsonHeaders });
    } finally {
      await client.end();
    }
  }

  // Handle POST request (Submit new order)
  if (request.method === 'POST') {
    try {
      const body = await request.json();
      const { customer_name, customer_phone, customer_address, total_price, items } = body;

      if (!client) {
        const newOrder = {
          id: Date.now(),
          customer_name,
          customer_phone,
          customer_address,
          total_price: parseFloat(total_price),
          status: 'pending',
          items,
          created_at: new Date().toISOString()
        };
        return new Response(JSON.stringify(newOrder), { status: 201, headers: jsonHeaders });
      }

      await client.connect();
      // Start transaction
      await client.query('BEGIN');

      const orderRes = await client.query(
        'INSERT INTO orders (customer_name, customer_phone, customer_address, total_price, items) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [customer_name, customer_phone, customer_address, total_price, JSON.stringify(items)]
      );

      for (const item of items) {
        await client.query(
          'UPDATE products SET stock = GREATEST(0, stock - $1) WHERE id = $2',
          [item.quantity, item.id]
        );
      }

      await client.query('COMMIT');
      return new Response(JSON.stringify(orderRes.rows[0]), { status: 201, headers: jsonHeaders });
    } catch (e) {
      if (client) await client.query('ROLLBACK');
      return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: jsonHeaders });
    } finally {
      if (client) await client.end();
    }
  }

  return new Response("Method not allowed", { status: 405 });
}

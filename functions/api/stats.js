import { getDbClient } from './_db.js';

// GET /api/stats
export async function onRequest(context) {
  const { request, env } = context;
  const client = getDbClient(env);

  const jsonHeaders = {
    'Content-Type': 'application/json;charset=UTF-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: jsonHeaders });
  }

  if (request.method === 'GET') {
    if (!client) {
      return new Response(JSON.stringify({ total_sales: 0, orders_count: 0, products_count: 3 }), { headers: jsonHeaders });
    }
    try {
      await client.connect();
      const salesRes = await client.query('SELECT COALESCE(SUM(total_price), 0) as total FROM orders');
      const ordersRes = await client.query('SELECT COUNT(*) as count FROM orders');
      const productsRes = await client.query('SELECT COUNT(*) as count FROM products');

      return new Response(JSON.stringify({
        total_sales: parseFloat(salesRes.rows[0].total),
        orders_count: parseInt(ordersRes.rows[0].count, 10),
        products_count: parseInt(productsRes.rows[0].count, 10)
      }), { headers: jsonHeaders });
    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: jsonHeaders });
    } finally {
      await client.end();
    }
  }

  return new Response("Method not allowed", { status: 405 });
}

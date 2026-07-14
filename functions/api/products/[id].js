import { getDbClient } from './_db.js';

// PUT /api/products/[id]
// DELETE /api/products/[id]
export async function onRequest(context) {
  const { request, env, params } = context;
  const client = getDbClient(env);
  
  // Extract product ID from URL params (e.g. /api/products/[id])
  // Cloudflare pages handles files inside folders like [id].js as placeholders
  const url = new URL(request.url);
  const parts = url.pathname.split('/');
  const id = parts[parts.length - 1];

  const jsonHeaders = {
    'Content-Type': 'application/json;charset=UTF-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: jsonHeaders });
  }

  // Handle PUT (Update product)
  if (request.method === 'PUT') {
    try {
      const body = await request.json();
      const { title, category, subcategory, price, image_url, specs, stock } = body;

      if (!client) {
        return new Response(JSON.stringify({ id, title, category, subcategory, price, image_url, specs, stock }), { headers: jsonHeaders });
      }

      await client.connect();
      const res = await client.query(
        'UPDATE products SET title = $1, category = $2, subcategory = $3, price = $4, image_url = $5, specs = $6, stock = $7 WHERE id = $8 RETURNING *',
        [title, category, subcategory, price, image_url, JSON.stringify(specs || {}), stock, id]
      );
      if (res.rows.length === 0) {
        return new Response(JSON.stringify({ error: "المنتج غير موجود" }), { status: 404, headers: jsonHeaders });
      }
      return new Response(JSON.stringify(res.rows[0]), { headers: jsonHeaders });
    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: jsonHeaders });
    } finally {
      await client.end();
    }
  }

  // Handle DELETE (Delete product)
  if (request.method === 'DELETE') {
    if (!client) {
      return new Response(JSON.stringify({ success: true }), { headers: jsonHeaders });
    }
    try {
      await client.connect();
      const res = await client.query('DELETE FROM products WHERE id = $1 RETURNING id', [id]);
      if (res.rows.length === 0) {
        return new Response(JSON.stringify({ error: "المنتج غير موجود" }), { status: 404, headers: jsonHeaders });
      }
      return new Response(JSON.stringify({ success: true }), { headers: jsonHeaders });
    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: jsonHeaders });
    } finally {
      await client.end();
    }
  }

  return new Response("Method not allowed", { status: 405 });
}

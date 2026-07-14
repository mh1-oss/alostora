import { getDbClient, tempProducts } from './_db.js';

// GET /api/products
// POST /api/products
export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const client = getDbClient(env);

  // Headers for JSON response
  const jsonHeaders = {
    'Content-Type': 'application/json;charset=UTF-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: jsonHeaders });
  }

  // Handle GET request
  if (request.method === 'GET') {
    if (!client) {
      return new Response(JSON.stringify(tempProducts), { headers: jsonHeaders });
    }
    try {
      await client.connect();
      const res = await client.query('SELECT * FROM products ORDER BY id DESC');
      return new Response(JSON.stringify(res.rows), { headers: jsonHeaders });
    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: jsonHeaders });
    } finally {
      await client.end();
    }
  }

  // Handle POST request (Add Product)
  if (request.method === 'POST') {
    try {
      const body = await request.json();
      const { title, category, subcategory, price, image_url, specs, stock } = body;

      if (!client) {
        const newProduct = {
          id: Date.now(),
          title,
          category,
          subcategory,
          price: parseFloat(price),
          image_url,
          specs: specs || {},
          stock: parseInt(stock) || 10
        };
        return new Response(JSON.stringify(newProduct), { status: 201, headers: jsonHeaders });
      }

      await client.connect();
      const res = await client.query(
        'INSERT INTO products (title, category, subcategory, price, image_url, specs, stock) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
        [title, category, subcategory, price, image_url, JSON.stringify(specs || {}), stock]
      );
      return new Response(JSON.stringify(res.rows[0]), { status: 201, headers: jsonHeaders });
    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: jsonHeaders });
    } finally {
      await client.end();
    }
  }

  return new Response("Method not allowed", { status: 405 });
}

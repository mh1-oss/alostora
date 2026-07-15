import { getDbClient } from './_db.js';

const defaultCategories = [
  { id: 'gaming', name: '🎮 ألعاب - Gaming', type: 'laptop' },
  { id: 'ultrabook', name: '💼 خفيف ونحيف - Ultrabook', type: 'laptop' },
  { id: 'office', name: '🖥️ مكتبي - Office', type: 'laptop' },
  { id: 'workstation', name: '⚙️ محطة عمل - Workstation', type: 'laptop' },
  { id: '2in1', name: '🔄 قابل للطي - 2-in-1', type: 'laptop' },
  { id: 'mouse', name: '🖱️ فأرة - Mouse', type: 'accessory' },
  { id: 'keyboard', name: '⌨️ لوحة مفاتيح - Keyboard', type: 'accessory' },
  { id: 'headset', name: '🎧 سماعة - Headset', type: 'accessory' },
  { id: 'monitor', name: '🖥️ شاشة - Monitor', type: 'accessory' },
  { id: 'bag', name: '🎒 حقيبة - Bag', type: 'accessory' },
  { id: 'cooling', name: '🌀 تبريد - Cooling', type: 'accessory' },
  { id: 'hub', name: '🔌 موزع منافذ - Hub', type: 'accessory' },
  { id: 'mousepad', name: '⬛ لوحة فأرة - Mousepad', type: 'accessory' }
];

// GET /api/categories - Returns all categories
// POST /api/categories - Add or update a category
export async function onRequest(context) {
  const { request, env } = context;

  const jsonHeaders = {
    'Content-Type': 'application/json;charset=UTF-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: jsonHeaders });
  }

  const client = getDbClient(env);

  const ensureTable = async (c) => {
    await c.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id VARCHAR(100) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL
      );
    `);
    const countRes = await c.query('SELECT COUNT(*) FROM categories');
    if (parseInt(countRes.rows[0].count, 10) === 0) {
      for (const cat of defaultCategories) {
        await c.query(
          'INSERT INTO categories (id, name, type) VALUES ($1, $2, $3) ON CONFLICT (id) DO NOTHING',
          [cat.id, cat.name, cat.type]
        );
      }
    }
  };

  // GET - Return all categories
  if (request.method === 'GET') {
    if (!client) {
      return new Response(JSON.stringify(defaultCategories), { headers: jsonHeaders });
    }
    try {
      await client.connect();
      await ensureTable(client);
      const res = await client.query('SELECT * FROM categories ORDER BY type, id');
      return new Response(JSON.stringify(res.rows), { headers: jsonHeaders });
    } catch (e) {
      console.error('Categories GET error:', e.message);
      return new Response(JSON.stringify(defaultCategories), { headers: jsonHeaders });
    } finally {
      await client.end();
    }
  }

  // POST - Add or update category
  if (request.method === 'POST') {
    try {
      const { id, name, type } = await request.json();
      if (!client) {
        return new Response(JSON.stringify({ id, name, type }), { status: 201, headers: jsonHeaders });
      }
      await client.connect();
      await ensureTable(client);
      const res = await client.query(
        'INSERT INTO categories (id, name, type) VALUES ($1, $2, $3) ON CONFLICT (id) DO UPDATE SET name = $2, type = $3 RETURNING *',
        [id, name, type]
      );
      return new Response(JSON.stringify(res.rows[0]), { status: 201, headers: jsonHeaders });
    } catch (e) {
      console.error('Categories POST error:', e.message);
      return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: jsonHeaders });
    } finally {
      if (client) await client.end();
    }
  }

  return new Response('Method not allowed', { status: 405, headers: jsonHeaders });
}

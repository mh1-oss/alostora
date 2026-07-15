import { getDbClient } from './_db.js';

// GET /api/settings - Returns all store settings
// PUT /api/settings - Updates one or more settings
export async function onRequest(context) {
  const { request, env } = context;

  const jsonHeaders = {
    'Content-Type': 'application/json;charset=UTF-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: jsonHeaders });
  }

  const defaultSettings = {
    admin_user: 'admin',
    admin_pass: 'alostora2025',
    whatsapp_number: '9647801814088',
    phone_number: '+964 780 181 4088',
    store_address: 'بغداد، عمارة النعمان - مجمع حاسبات الأسطورة',
    budget_limit_low: '900',
    budget_limit_high: '1300',
    telegram_bot_token: '',
    telegram_chat_id: ''
  };

  const client = getDbClient(env);

  // GET - Return all settings
  if (request.method === 'GET') {
    if (!client) {
      return new Response(JSON.stringify(defaultSettings), { headers: jsonHeaders });
    }
    try {
      await client.connect();
      // Ensure table exists
      await client.query(`
        CREATE TABLE IF NOT EXISTS store_settings (
          key VARCHAR(100) PRIMARY KEY,
          value TEXT NOT NULL
        );
      `);
      // Seed if empty
      const countRes = await client.query('SELECT COUNT(*) FROM store_settings');
      if (parseInt(countRes.rows[0].count, 10) === 0) {
        for (const [key, value] of Object.entries(defaultSettings)) {
          await client.query(
            'INSERT INTO store_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO NOTHING',
            [key, String(value)]
          );
        }
      }
      const res = await client.query('SELECT key, value FROM store_settings');
      const settings = { ...defaultSettings };
      res.rows.forEach(row => { settings[row.key] = row.value; });
      return new Response(JSON.stringify(settings), { headers: jsonHeaders });
    } catch (e) {
      console.error('Settings GET error:', e.message);
      return new Response(JSON.stringify(defaultSettings), { headers: jsonHeaders });
    } finally {
      await client.end();
    }
  }

  // PUT - Update settings
  if (request.method === 'PUT') {
    try {
      const updates = await request.json();
      if (!client) {
        return new Response(JSON.stringify({ ...defaultSettings, ...updates }), { headers: jsonHeaders });
      }
      await client.connect();
      await client.query(`
        CREATE TABLE IF NOT EXISTS store_settings (
          key VARCHAR(100) PRIMARY KEY,
          value TEXT NOT NULL
        );
      `);
      for (const [key, value] of Object.entries(updates)) {
        await client.query(
          'INSERT INTO store_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = $2',
          [key, String(value)]
        );
      }
      const res = await client.query('SELECT key, value FROM store_settings');
      const settings = { ...defaultSettings };
      res.rows.forEach(row => { settings[row.key] = row.value; });
      return new Response(JSON.stringify(settings), { headers: jsonHeaders });
    } catch (e) {
      console.error('Settings PUT error:', e.message);
      return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: jsonHeaders });
    } finally {
      if (client) await client.end();
    }
  }

  return new Response('Method not allowed', { status: 405, headers: jsonHeaders });
}

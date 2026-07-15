import { getDbClient } from './_db.js';

// GET /api/orders - Returns all orders (Admin only)
// POST /api/orders - Submit a new order
export async function onRequest(context) {
  const { request, env } = context;
  const client = getDbClient(env);

  const jsonHeaders = {
    'Content-Type': 'application/json;charset=UTF-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
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

      let newOrder = {
        id: Date.now(),
        customer_name,
        customer_phone,
        customer_address,
        total_price: parseFloat(total_price),
        status: 'pending',
        items,
        created_at: new Date().toISOString()
      };

      if (client) {
        try {
          await client.connect();
          // Begin transaction
          await client.query('BEGIN');

          const orderRes = await client.query(
            'INSERT INTO orders (customer_name, customer_phone, customer_address, total_price, items) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [customer_name, customer_phone, customer_address, total_price, JSON.stringify(items)]
          );
          newOrder = orderRes.rows[0];

          // Update stock for each item
          for (const item of items) {
            await client.query(
              'UPDATE products SET stock = GREATEST(0, stock - $1) WHERE id = $2',
              [item.quantity, item.id]
            );
          }

          await client.query('COMMIT');
        } catch (e) {
          try { await client.query('ROLLBACK'); } catch (_) {}
          console.error('DB order insert error:', e.message);
        } finally {
          await client.end();
        }
      }

      // Send Telegram notification (fire-and-forget)
      try {
        let botToken = null;
        let chatId = null;

        // Fetch Telegram settings from DB
        const settClient = getDbClient(env);
        if (settClient) {
          try {
            await settClient.connect();
            const settRes = await settClient.query(
              "SELECT key, value FROM store_settings WHERE key IN ('telegram_bot_token', 'telegram_chat_id')"
            );
            const s = {};
            settRes.rows.forEach(r => { s[r.key] = r.value; });
            botToken = s['telegram_bot_token'] || null;
            chatId = s['telegram_chat_id'] || null;
          } catch (e) {
            console.error('Telegram settings fetch error:', e.message);
          } finally {
            await settClient.end();
          }
        }

        // Also check env variables as fallback
        if (!botToken && env.TELEGRAM_BOT_TOKEN) botToken = env.TELEGRAM_BOT_TOKEN;
        if (!chatId && env.TELEGRAM_CHAT_ID) chatId = env.TELEGRAM_CHAT_ID;

        if (botToken && chatId) {
          const itemsList = items.map(it =>
            `- ${it.title} (${it.quantity} قطعة) = ${Number(it.price * it.quantity).toLocaleString('en-US')} د.ع`
          ).join('\n');
          const totalIQD = Math.round(Number(newOrder.total_price)).toLocaleString('en-US');

          const text =
            `🔔 *طلب جديد وارد!*\n\n` +
            `👤 *الزبون:* ${customer_name}\n` +
            `📞 *الهاتف:* \`${customer_phone}\`\n` +
            `📍 *العنوان:* ${customer_address}\n\n` +
            `📦 *تفاصيل الطلب:*\n${itemsList}\n\n` +
            `💵 *الإجمالي:* ${totalIQD} د.ع`;

          // Send Telegram message (non-blocking)
          fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: chatId,
              text,
              parse_mode: 'Markdown'
            })
          }).catch(e => console.error('Telegram send error:', e.message));
        }
      } catch (tgErr) {
        console.error('Telegram notification error:', tgErr.message);
      }

      return new Response(JSON.stringify(newOrder), { status: 201, headers: jsonHeaders });
    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: jsonHeaders });
    }
  }

  return new Response("Method not allowed", { status: 405, headers: jsonHeaders });
}

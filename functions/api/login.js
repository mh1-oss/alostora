import { getDbClient } from './_db.js';

const JWT_SECRET = 'alostora_secret_key_2026_secure';

// Simple JWT creation using Web Crypto API (compatible with CF Workers)
async function createJWT(payload, expiresInHours = 12) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const fullPayload = { ...payload, iat: now, exp: now + expiresInHours * 3600 };

  const encode = (obj) => btoa(JSON.stringify(obj)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

  const headerB64 = encode(header);
  const payloadB64 = encode(fullPayload);
  const data = `${headerB64}.${payloadB64}`;

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(JWT_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data));
  const sigB64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

  return `${data}.${sigB64}`;
}

// POST /api/login - Admin login returning JWT
export async function onRequest(context) {
  const { request, env } = context;

  const jsonHeaders = {
    'Content-Type': 'application/json;charset=UTF-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: jsonHeaders });
  }

  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: jsonHeaders });
  }

  try {
    const { username, password } = await request.json();

    let adminUser = 'admin';
    let adminPass = 'alostora2025';

    const client = getDbClient(env);
    if (client) {
      try {
        await client.connect();
        const res = await client.query(
          "SELECT key, value FROM store_settings WHERE key IN ('admin_user', 'admin_pass')"
        );
        const s = {};
        res.rows.forEach(r => { s[r.key] = r.value; });
        if (s.admin_user) adminUser = s.admin_user;
        if (s.admin_pass) adminPass = s.admin_pass;
      } catch (e) {
        console.error('Login settings fetch error:', e.message);
      } finally {
        await client.end();
      }
    }

    if (username === adminUser && password === adminPass) {
      const token = await createJWT({ role: 'admin' });
      return new Response(JSON.stringify({ success: true, token }), { headers: jsonHeaders });
    } else {
      return new Response(
        JSON.stringify({ error: 'خطأ في اسم المستخدم أو كلمة المرور' }),
        { status: 401, headers: jsonHeaders }
      );
    }
  } catch (e) {
    console.error('Login error:', e.message);
    return new Response(
      JSON.stringify({ error: 'حدث خطأ أثناء تسجيل الدخول' }),
      { status: 500, headers: jsonHeaders }
    );
  }
}

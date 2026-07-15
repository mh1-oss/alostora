import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import https from 'https';
import { pool, sql, initDB } from './db.js';

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = 'alostora_secret_key_2026_secure';

app.use(cors());
app.use(express.json());

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'مطلوب تسجيل الدخول كمسؤول' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'توكن منتهي الصلاحية أو غير صالح' });
    req.user = user;
    next();
  });
};

// API Endpoint for Admin Login returning a JWT Token
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  let adminUser = 'admin';
  let adminPass = 'alostora2025';

  if (pool) {
    try {
      const rows = await pool.query('SELECT value FROM store_settings WHERE key = $1', ['admin_user']);
      const passRows = await pool.query('SELECT value FROM store_settings WHERE key = $1', ['admin_pass']);
      if (rows.rows && rows.rows.length > 0) adminUser = rows.rows[0].value;
      if (passRows.rows && passRows.rows.length > 0) adminPass = passRows.rows[0].value;
    } catch (e) {
      console.error('Fetch settings login error:', e.message);
    }
  }

  if (username === adminUser && password === adminPass) {
    const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '12h' });
    return res.json({ success: true, token });
  } else {
    return res.status(401).json({ error: 'خطأ في اسم المستخدم أو كلمة المرور' });
  }
});


// In-memory fallback if Neon DATABASE_URL is not set
let tempProducts = [
  {
    id: 1,
    title: "ASUS ROG Strix G16 (2024)",
    category: "laptop",
    subcategory: "gaming",
    price: 1450,
    image_url: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=600&q=80",
    specs: {
      "المعالج (CPU)": "Intel Core i7-13650HX",
      "كرت الشاشة (GPU)": "NVIDIA RTX 4060 8GB",
      "الذاكرة (RAM)": "16GB DDR5",
      "التخزين (SSD)": "1TB PCIe Gen4 NVMe",
      "الشاشة": "16\" FHD+ 165Hz IPS"
    },
    stock: 7
  },
  {
    id: 2,
    title: "Lenovo Legion 5 Slim",
    category: "laptop",
    subcategory: "gaming",
    price: 1280,
    image_url: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=600&q=80",
    specs: {
      "المعالج (CPU)": "AMD Ryzen 7 7840HS",
      "كرت الشاشة (GPU)": "NVIDIA RTX 4060 8GB",
      "الذاكرة (RAM)": "16GB DDR5",
      "التخزين (SSD)": "512GB NVMe PCIe 4.0",
      "الشاشة": "16\" WQXGA 144Hz IPS"
    },
    stock: 5
  },
  {
    id: 3,
    title: "MacBook Air M3 (13-inch)",
    category: "laptop",
    subcategory: "ultrabook",
    price: 1150,
    image_url: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80",
    specs: {
      "المعالج (CPU)": "Apple M3 Chip (8-Core)",
      "كرت الشاشة (GPU)": "10-Core GPU",
      "الذاكرة (RAM)": "8GB Unified Memory",
      "التخزين (SSD)": "256GB SSD Storage",
      "الشاشة": "13.6\" Liquid Retina"
    },
    stock: 12
  },
  {
    id: 4,
    title: "Dell XPS 13 9340",
    category: "laptop",
    subcategory: "ultrabook",
    price: 1550,
    image_url: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=600&q=80",
    specs: {
      "المعالج (CPU)": "Intel Core Ultra 7 155H",
      "كرت الشاشة (GPU)": "Intel Arc Graphics",
      "الذاكرة (RAM)": "16GB LPDDR5X",
      "التخزين (SSD)": "512GB M.2 PCIe NVMe",
      "الشاشة": "13.4\" FHD+ InfinityEdge"
    },
    stock: 4
  },
  {
    id: 5,
    title: "HP Victus 15",
    category: "laptop",
    subcategory: "office",
    price: 790,
    image_url: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=600&q=80",
    specs: {
      "المعالج (CPU)": "Intel Core i5-12450H",
      "كرت الشاشة (GPU)": "NVIDIA GTX 1650 4GB",
      "الذاكرة (RAM)": "8GB DDR4",
      "التخزين (SSD)": "512GB PCIe NVMe SSD",
      "الشاشة": "15.6\" FHD 144Hz"
    },
    stock: 9
  },
  {
    id: 6,
    title: "Logitech G502 Hero Gaming Mouse",
    category: "accessory",
    subcategory: "mouse",
    price: 55,
    image_url: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=600&q=80",
    specs: {
      "المستشعر": "Hero 25K Sensor",
      "الحساسية (DPI)": "100 - 25,600 DPI",
      "الاتصال": "سلكي USB مضفر",
      "الأزرار": "11 زر قابل للبرمجة",
      "الإضاءة": "RGB Lightsync"
    },
    stock: 25
  },
  {
    id: 7,
    title: "Razer BlackWidow V4 Pro",
    category: "accessory",
    subcategory: "keyboard",
    price: 180,
    image_url: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=600&q=80",
    specs: {
      "النوع": "ميكانيكي كامل (Mechanical)",
      "المفاتيح": "Razer Green (Clicky)",
      "الاتصال": "سلكي Type-C قابل للفصل",
      "الميزات": "أزرار ماكرو مخصصة، عجلة وسائط",
      "الإضاءة": "Chroma RGB لكل مفتاح"
    },
    stock: 10
  },
  {
    id: 8,
    title: "HyperX Cloud III Wireless Headset",
    category: "accessory",
    subcategory: "headset",
    price: 125,
    image_url: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=600&q=80",
    specs: {
      "الاتصال": "لاسلكي 2.4GHz منخفض التأخير",
      "البطارية": "تصل إلى 120 ساعة",
      "الميكروفون": "قابل للفصل مع إلغاء الضوضاء",
      "الصوت": "DTS Headphone:X Spatial Audio",
      "التوافق": "PC, PS5, PS4, Switch"
    },
    stock: 15
  }
];

let tempOrders = [];
// مخزن بيانات الطلبات مرتبطة بـ message_id التليغرام
// يُستخدم من طرف نظام Polling لمعرفة بيانات الطلب عند ضغط زر التجهيز
const orderStore = new Map(); // key: telegram message_id, value: order data

// Initialize Database connection & tables
initDB();

// API Endpoints

// 1. Get all products
app.get('/api/products', async (req, res) => {
  if (!pool) {
    return res.json(tempProducts);
  }
  try {
    const result = await pool.query('SELECT * FROM products ORDER BY id DESC');
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "حدث خطأ أثناء جلب المنتجات" });
  }
});

// 2. Add product (Admin)
app.post('/api/products', authenticateToken, async (req, res) => {
  const { title, category, subcategory, price, discount_price, image_url, specs, stock } = req.body;
  if (!pool) {
    const newProduct = {
      id: tempProducts.length ? Math.max(...tempProducts.map(p => p.id)) + 1 : 1,
      title, category, subcategory, price: parseFloat(price), discount_price: discount_price ? parseFloat(discount_price) : null, image_url, specs: specs || {}, stock: parseInt(stock) || 10
    };
    tempProducts.unshift(newProduct);
    return res.status(201).json(newProduct);
  }
  try {
    const result = await pool.query(
      'INSERT INTO products (title, category, subcategory, price, discount_price, image_url, specs, stock) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [title, category, subcategory, price, discount_price ? parseFloat(discount_price) : null, image_url, JSON.stringify(specs || {}), stock]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Add product error:', error.message);
    res.status(500).json({ error: 'حدث خطأ أثناء إضافة المنتج: ' + error.message });
  }
});

// 3. Update product (Admin)
app.put('/api/products/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { title, category, subcategory, price, discount_price, image_url, specs, stock } = req.body;
  if (!pool) {
    const idx = tempProducts.findIndex(p => p.id === parseInt(id));
    if (idx !== -1) {
      tempProducts[idx] = { ...tempProducts[idx], title, category, subcategory, price: parseFloat(price), discount_price: discount_price ? parseFloat(discount_price) : null, image_url, specs: specs || {}, stock: parseInt(stock) || 10 };
      return res.json(tempProducts[idx]);
    }
    return res.status(404).json({ error: 'المنتج غير موجود' });
  }
  try {
    const result = await pool.query(
      'UPDATE products SET title = $1, category = $2, subcategory = $3, price = $4, discount_price = $5, image_url = $6, specs = $7, stock = $8 WHERE id = $9 RETURNING *',
      [title, category, subcategory, price, discount_price ? parseFloat(discount_price) : null, image_url, JSON.stringify(specs || {}), stock, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'المنتج غير موجود' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update product error:', error.message);
    res.status(500).json({ error: 'حدث خطأ أثناء تعديل المنتج: ' + error.message });
  }
});

// 4. Delete product (Admin)
app.delete('/api/products/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  if (!pool) {
    tempProducts = tempProducts.filter(p => p.id !== parseInt(id));
    return res.json({ success: true });
  }
  try {
    const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'المنتج غير موجود' });
    res.json({ success: true });
  } catch (error) {
    console.error('Delete product error:', error.message);
    res.status(500).json({ error: 'حدث خطأ أثناء حذف المنتج: ' + error.message });
  }
});

// مساعد إرسال رسالة لتليغرام مع استرجاع الرد
function tgPost(botToken, path, body) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(body);
    const req = https.request({
      hostname: 'api.telegram.org', port: 443,
      path: `/bot${botToken}/${path}`, method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(postData) }
    }, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => { try { resolve(JSON.parse(d)); } catch(e) { reject(e); } });
    });
    req.on('error', reject); req.write(postData); req.end();
  });
}

// 5. إرسال طلب جديد (بدون تخزين Neon - كل شيء في التليغرام)
// 5. إرسال طلب جديد سحابياً في قاعدة بيانات Neon
app.post('/api/orders', async (req, res) => {
  const { customer_name, customer_phone, customer_address, total_price, items } = req.body;

  let insertedOrder = null;
  if (pool) {
    try {
      const result = await pool.query(
        'INSERT INTO orders (customer_name, customer_phone, customer_address, total_price, status, items) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [customer_name, customer_phone, customer_address, parseFloat(total_price), 'pending', JSON.stringify(items || [])]
      );
      insertedOrder = result.rows[0];
    } catch (e) {
      console.error('[Neon Database Order Insert Failed]:', e.message);
    }
  }

  const newOrder = insertedOrder || {
    id: Date.now(), // Fallback ID if offline
    customer_name,
    customer_phone,
    customer_address,
    total_price: parseFloat(total_price),
    status: 'pending',
    items,
    created_at: new Date().toISOString()
  };

  if (!insertedOrder) {
    tempOrders.push(newOrder);
  }

  // تحديث الكميات في قاعدة البيانات أو الذاكرة
  if (pool) {
    try {
      for (const item of items) {
        await pool.query(
          'UPDATE products SET stock = GREATEST(0, stock - $1) WHERE id = $2',
          [item.quantity, item.id]
        );
      }
    } catch(e) { console.warn('Stock update failed:', e.message); }
  } else {
    items.forEach(item => {
      const prod = tempProducts.find(p => p.id === item.id);
      if (prod) prod.stock = Math.max(0, prod.stock - item.quantity);
    });
  }

  // إرسال إشعار تليغرام وتخزين message_id
  try {
    let botToken = null, chatId = null;
    if (pool) {
      const result = await pool.query("SELECT key, value FROM store_settings WHERE key IN ('telegram_bot_token', 'telegram_chat_id')");
      const s = {}; result.rows.forEach(r => { s[r.key] = r.value; });
      botToken = s['telegram_bot_token']; chatId = s['telegram_chat_id'];
    }

    console.log('[Telegram] botToken:', botToken ? '✅ موجود' : '❌ غير موجود', '| chatId:', chatId ? '✅ موجود' : '❌ غير موجود');

    if (botToken && chatId) {
      const itemsList = items.map(it => `- ${it.title} (${it.quantity} قطعة) = ${Number(it.price * it.quantity).toLocaleString('en-US')} د.ع`).join('\n');
      const totalIQD = Math.round(Number(newOrder.total_price)).toLocaleString('en-US');

      const text =
        `🔔 *طلب جديد وارد!*\n\n` +
        `👤 *الزبون:* ${customer_name}\n` +
        `📞 *الهاتف:* \`${customer_phone}\`\n` +
        `📍 *العنوان:* ${customer_address}\n\n` +
        `📦 *تفاصيل الطلب:*\n${itemsList}\n\n` +
        `💵 *الإجمالي:* ${totalIQD} د.ع\n\n` +
        `اضغط زر التجهيز عند الاستعداد:`;

      const tgResp = await tgPost(botToken, 'sendMessage', {
        chat_id: chatId,
        text,
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [[
            { text: '📦 تجهيز الطلب', callback_data: `prepare:${newOrder.id}` }
          ]]
        }
      });

      console.log('[Telegram] sendMessage result:', JSON.stringify(tgResp).substring(0, 300));

      // تخزين بيانات الطلب في orderStore مرتبطة بـ message_id
      if (tgResp.ok && tgResp.result) {
        const msgId = tgResp.result.message_id;
        orderStore.set(msgId, {
          id: newOrder.id,
          customer_name,
          customer_phone,
          customer_address,
          total_price: newOrder.total_price,
          items
        });
        console.log(`🔔 [Telegram] Order #${newOrder.id} sent, msg_id: ${msgId}`);
      }
    }
  } catch (tgErr) {
    console.error('Telegram send error:', tgErr.message);
  }

  res.status(201).json(newOrder);
});

// 6. جلب جميع الطلبات (من قاعدة بيانات Neon أو الذاكرة كبديل)
app.get('/api/orders', authenticateToken, async (req, res) => {
  if (!pool) {
    return res.json(tempOrders.slice().reverse());
  }
  try {
    const result = await pool.query('SELECT * FROM orders ORDER BY id DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('[Fetch Orders Failed]:', error.message);
    res.status(500).json({ error: 'خطأ أثناء جلب الطلبات: ' + error.message });
  }
});

// تحديث حالة الطلب سحابياً
app.put('/api/orders/:id/status', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  if (!pool) {
    const order = tempOrders.find(o => String(o.id) === String(id));
    if (!order) return res.status(404).json({ error: 'الطلب غير موجود' });
    order.status = status;
    return res.json(order);
  }
  try {
    const result = await pool.query('UPDATE orders SET status = $1 WHERE id = $2 RETURNING *', [status, id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'الطلب غير موجود' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error('[Update Order Status Failed]:', error.message);
    res.status(500).json({ error: 'خطأ أثناء تحديث حالة الطلب: ' + error.message });
  }
});


// Telegram Bot Webhook route (kept for compatibility, actual processing via polling below)
app.post('/api/telegram-webhook', (req, res) => res.sendStatus(200));

// 7. Get stats (Admin)
app.get('/api/stats', authenticateToken, async (req, res) => {
  if (!pool) {
    const totalSales = tempOrders.reduce((sum, o) => sum + o.total_price, 0);
    return res.json({
      total_sales: totalSales,
      orders_count: tempOrders.length,
      products_count: tempProducts.length
    });
  }
  try {
    const salesRes = await pool.query('SELECT COALESCE(SUM(total_price), 0) as total FROM orders');
    const ordersRes = await pool.query('SELECT COUNT(*) as count FROM orders');
    const productsRes = await pool.query('SELECT COUNT(*) as count FROM products');

    res.json({
      total_sales: parseFloat(salesRes.rows[0].total),
      orders_count: parseInt(ordersRes.rows[0].count, 10),
      products_count: parseInt(productsRes.rows[0].count, 10)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "حدث خطأ أثناء جلب الإحصائيات" });
  }
});

// 8. Categories API Endpoints (GET, POST, PUT, DELETE)
let tempCategories = [
  { id: 'gaming', name: 'ألعاب', type: 'laptop' },
  { id: 'ultrabook', name: 'خفيف ونحيف', type: 'laptop' },
  { id: 'office', name: 'مكتبي', type: 'laptop' },
  { id: 'workstation', name: 'محطة عمل', type: 'laptop' },
  { id: '2in1', name: 'قابل للطي', type: 'laptop' },
  { id: 'mouse', name: 'فأرة (ماوس)', type: 'accessory' },
  { id: 'keyboard', name: 'لوحة مفاتيح', type: 'accessory' },
  { id: 'headset', name: 'سماعات', type: 'accessory' },
  { id: 'monitor', name: 'شاشات', type: 'accessory' },
  { id: 'bag', name: 'حقائب', type: 'accessory' },
  { id: 'cooling', name: 'تبريد', type: 'accessory' },
  { id: 'hub', name: 'موزع منافذ', type: 'accessory' },
  { id: 'mousepad', name: 'لوحة فأرة (ماوس باد)', type: 'accessory' }
];

app.get('/api/categories', async (req, res) => {
  if (!pool) {
    return res.json(tempCategories);
  }
  try {
    const result = await pool.query('SELECT * FROM categories');
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "حدث خطأ أثناء جلب التصنيفات" });
  }
});

app.post('/api/categories', async (req, res) => {
  const { id, name, type } = req.body;
  if (!pool) {
    const newCat = { id, name, type };
    tempCategories.push(newCat);
    return res.status(201).json(newCat);
  }
  try {
    const result = await pool.query(
      'INSERT INTO categories (id, name, type) VALUES ($1, $2, $3) ON CONFLICT (id) DO UPDATE SET name = $2, type = $3 RETURNING *',
      [id, name, type]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "حدث خطأ أثناء إضافة التصنيف" });
  }
});

app.delete('/api/categories/:id', async (req, res) => {
  const { id } = req.params;
  if (!pool) {
    tempCategories = tempCategories.filter(c => c.id !== id);
    return res.json({ success: true });
  }
  try {
    await pool.query('DELETE FROM categories WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "حدث خطأ أثناء حذف التصنيف" });
  }
});

// 9. Settings API (GET all, PUT update one or more)
const defaultSettings = {
  admin_user: 'admin',
  admin_pass: 'alostora2025',
  whatsapp_number: '9647801814088',
  phone_number: '+964 780 181 4088',
  store_address: 'بغداد، شارع الصناعة، مجمع الحاسبات',
  budget_limit_low: '900',
  budget_limit_high: '1300',
  telegram_bot_token: '8716178157:AAF3XbstprNyL6Mt2aMNjatPLTogO_abfik',
  telegram_chat_id: '267707743'
};
let tempSettings = { ...defaultSettings };

app.get('/api/settings', async (req, res) => {
  if (!pool) {
    return res.json(tempSettings);
  }
  try {
    const result = await pool.query('SELECT key, value FROM store_settings');
    const settings = {};
    result.rows.forEach(row => { settings[row.key] = row.value; });
    res.json(settings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'خطأ أثناء جلب الإعدادات' });
  }
});

app.put('/api/settings', async (req, res) => {
  const updates = req.body;
  if (!pool) {
    tempSettings = { ...tempSettings, ...updates };
    return res.json(tempSettings);
  }
  try {
    for (const [key, value] of Object.entries(updates)) {
      await pool.query(
        'INSERT INTO store_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = $2',
        [key, String(value)]
      );
    }
    const result = await pool.query('SELECT key, value FROM store_settings');
    const settings = {};
    result.rows.forEach(row => { settings[row.key] = row.value; });
    res.json(settings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'خطأ أثناء حفظ الإعدادات' });
  }
});

// ─── Telegram Long Polling ────────────────────────────────────────────────────
// يعمل تلقائياً بدون webhook — السيرفر يسأل تليغرام كل ثانيتين بنفسه
async function processTelegramUpdate(update, botToken, chatId) {
  const callback_query = update.callback_query;
  if (!callback_query || !callback_query.data) return;

  const data = callback_query.data;
  const msgId = callback_query.message.message_id;

  // تجاهل الضغطات المتكررة (noop)
  if (data === 'noop') {
    await tgPost(botToken, 'answerCallbackQuery', {
      callback_query_id: callback_query.id,
      text: '✅ هذا الطلب تم تجهيزه مسبقاً'
    });
    return;
  }

  if (!data.startsWith('prepare:')) return;

  const orderId = data.split(':')[1];

  // جلب بيانات الطلب من orderStore
  const order = orderStore.get(msgId);
  if (!order) {
    await tgPost(botToken, 'answerCallbackQuery', {
      callback_query_id: callback_query.id,
      text: '⚠️ لم يتم العثور على بيانات الطلب (ربما أُعيد تشغيل السيرفر)'
    });
    return;
  }

  try {
    // تحديث الحالة في قاعدة بيانات Neon أو الذاكرة
    if (pool) {
      try {
        await pool.query("UPDATE orders SET status = 'prepared' WHERE id = $1", [order.id]);
      } catch (dbErr) {
        console.error('[Telegram Callback DB Update Failed]:', dbErr.message);
      }
    }

    const memOrder = tempOrders.find(o => String(o.id) === String(order.id));
    if (memOrder) memOrder.status = 'prepared';

    // 1. الرد على callback لإزالة "loading..."
    await tgPost(botToken, 'answerCallbackQuery', {
      callback_query_id: callback_query.id,
      text: '✅ تم تجهيز الطلب بنجاح!'
    });

    // 2. بناء رابط واتساب للزبون
    const cleanPhone = order.customer_phone.startsWith('0')
      ? '964' + order.customer_phone.slice(1)
      : order.customer_phone.replace(/^\+/, '');
    const totalIQD = Math.round(Number(order.total_price)).toLocaleString('en-US');

    const itemsList = Array.isArray(order.items)
      ? order.items.map(it => `• ${it.title} (${it.quantity} قطعة)`).join('\n')
      : '';

    const whatsAppMsg = encodeURIComponent(
      `✅ تم تجهيز طلبك - متجر الأسطورة للحاسبات\n` +
      `━━━━━━━━━━━━━━━━━━━━\n\n` +
      `مرحباً أستاذ ${order.customer_name} 😊\n\n` +
      `يسعدنا إعلامك بأن طلبك قد تم تجهيزه وتغليفه بنجاح! 📦\n\n` +
      (itemsList ? `📋 تفاصيل طلبك:\n${itemsList}\n\n` : '') +
      `📍 العنوان: ${order.customer_address}\n` +
      `💰 الإجمالي: ${totalIQD} د.ع\n\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `🚚 سيتم تسليمه قريباً عبر شركة التوصيل\n` +
      `شكراً لثقتك بنا! 🙏`
    );
    const waLink = `https://wa.me/${cleanPhone}?text=${whatsAppMsg}`;

    // 3. تعديل رسالة التليغرام: زر "✅ تم التجهيز" + زر واتساب
    const esc = (s) => String(s).replace(/[_*[\]()~`>#+\-=|{}.!]/g, '\\$&');

    const itemsListForTg = Array.isArray(order.items)
      ? order.items.map(it => `• ${esc(it.title)} \\(${it.quantity} قطعة\\) \\- ${Number(it.price).toLocaleString('en-US')} د\\.ع`).join('\n')
      : '';

    const updatedText =
      `✅ *تم التجهيز بنجاح\\!*\n` +
      `━━━━━━━━━━━━━━━━━━━━\n\n` +
      `👤 *الزبون:* ${esc(order.customer_name)}\n` +
      `📞 *الهاتف:* \`${order.customer_phone}\`\n` +
      `📍 *العنوان:* ${esc(order.customer_address)}\n\n` +
      (itemsListForTg ? `📦 *تفاصيل الطلب:*\n${itemsListForTg}\n\n` : '') +
      `💵 *الإجمالي:* ${totalIQD} د\\.ع\n\n` +
      `⬇️ اضغط زر واتساب لإبلاغ الزبون:`;

    await tgPost(botToken, 'editMessageText', {
      chat_id: chatId,
      message_id: msgId,
      text: updatedText,
      parse_mode: 'MarkdownV2',
      reply_markup: {
        inline_keyboard: [
          [{ text: '✅ تم التجهيز', callback_data: 'noop' }],
          [{ text: '💬 إبلاغ الزبون عبر واتساب', url: waLink }]
        ]
      }
    });

    // حذف من orderStore بعد التجهيز
    orderStore.delete(msgId);
    console.log(`✅ [Telegram] Order #${orderId} prepared`);
  } catch (e) {
    console.error('Telegram polling handler error:', e.message);
  }
}


async function startTelegramPolling() {
  if (!pool) return; // لا داعي للبوت بدون قاعدة بيانات

  let offset = 0;
  let botToken = null;
  let chatId = null;

  const fetchSettings = async () => {
    try {
      const result = await pool.query("SELECT key, value FROM store_settings WHERE key IN ('telegram_bot_token', 'telegram_chat_id')");
      const s = {};
      result.rows.forEach(r => { s[r.key] = r.value; });
      botToken = s['telegram_bot_token'] || null;
      chatId = s['telegram_chat_id'] || null;
    } catch (err) {
      console.error('[Telegram Polling Config Fetch Error]:', err.message);
    }
  };

  // Initial fetch
  await fetchSettings();

  // Fetch settings every 10 seconds to detect admin configuration changes on-the-fly
  setInterval(fetchSettings, 10000);

  const poll = () => {
    if (!botToken) {
      // إعادة المحاولة بعد 10 ثوان إذا لم يُضبط التوكن بعد
      setTimeout(async () => { await fetchSettings(); poll(); }, 10000);
      return;
    }

    const postData = JSON.stringify({ offset, timeout: 30, allowed_updates: ['callback_query'] });
    const req = https.request({
      hostname: 'api.telegram.org',
      port: 443,
      path: `/bot${botToken}/getUpdates`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(postData) }
    }, res => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', async () => {
        try {
          const json = JSON.parse(body);
          if (json.ok && json.result.length > 0) {
            for (const update of json.result) {
              offset = update.update_id + 1;
              await processTelegramUpdate(update, botToken, chatId);
            }
          }
        } catch (e) {
          console.error('Telegram polling parse error:', e.message);
        }
        // إعادة الاتصال فوراً
        setImmediate(poll);
      });
    });
    req.on('error', (e) => {
      console.error('Telegram polling request error:', e.message);
      // إعادة المحاولة بعد 5 ثوان عند الخطأ
      setTimeout(poll, 5000);
    });
    req.write(postData);
    req.end();
  };

  console.log('🤖 Telegram Long Polling started...');
  poll();
}
// ─────────────────────────────────────────────────────────────────────────────

app.listen(PORT, '0.0.0.0', async () => {
  console.log(`🚀 الخادم يعمل على المنفذ http://localhost:${PORT}`);
  // تشغيل بوت التليغرام بالـ Polling تلقائياً
  startTelegramPolling();
});

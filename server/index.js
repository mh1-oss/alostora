import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
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

  if (sql) {
    try {
      const rows = await sql.query('SELECT value FROM store_settings WHERE key = $1', ['admin_user']);
      const passRows = await sql.query('SELECT value FROM store_settings WHERE key = $1', ['admin_pass']);
      if (rows.length > 0) adminUser = rows[0].value;
      if (passRows.length > 0) adminPass = passRows[0].value;
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
  if (!sql) {
    const newProduct = {
      id: tempProducts.length ? Math.max(...tempProducts.map(p => p.id)) + 1 : 1,
      title, category, subcategory, price: parseFloat(price), discount_price: discount_price ? parseFloat(discount_price) : null, image_url, specs: specs || {}, stock: parseInt(stock) || 10
    };
    tempProducts.unshift(newProduct);
    return res.status(201).json(newProduct);
  }
  try {
    const rows = await sql.query(
      'INSERT INTO products (title, category, subcategory, price, discount_price, image_url, specs, stock) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [title, category, subcategory, price, discount_price ? parseFloat(discount_price) : null, image_url, JSON.stringify(specs || {}), stock]
    );
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Add product error:', error.message);
    res.status(500).json({ error: 'حدث خطأ أثناء إضافة المنتج: ' + error.message });
  }
});

// 3. Update product (Admin)
app.put('/api/products/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { title, category, subcategory, price, discount_price, image_url, specs, stock } = req.body;
  if (!sql) {
    const idx = tempProducts.findIndex(p => p.id === parseInt(id));
    if (idx !== -1) {
      tempProducts[idx] = { ...tempProducts[idx], title, category, subcategory, price: parseFloat(price), discount_price: discount_price ? parseFloat(discount_price) : null, image_url, specs: specs || {}, stock: parseInt(stock) || 10 };
      return res.json(tempProducts[idx]);
    }
    return res.status(404).json({ error: 'المنتج غير موجود' });
  }
  try {
    const rows = await sql.query(
      'UPDATE products SET title = $1, category = $2, subcategory = $3, price = $4, discount_price = $5, image_url = $6, specs = $7, stock = $8 WHERE id = $9 RETURNING *',
      [title, category, subcategory, price, discount_price ? parseFloat(discount_price) : null, image_url, JSON.stringify(specs || {}), stock, id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'المنتج غير موجود' });
    res.json(rows[0]);
  } catch (error) {
    console.error('Update product error:', error.message);
    res.status(500).json({ error: 'حدث خطأ أثناء تعديل المنتج: ' + error.message });
  }
});

// 4. Delete product (Admin)
app.delete('/api/products/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  if (!sql) {
    tempProducts = tempProducts.filter(p => p.id !== parseInt(id));
    return res.json({ success: true });
  }
  try {
    const rows = await sql.query('DELETE FROM products WHERE id = $1 RETURNING id', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'المنتج غير موجود' });
    res.json({ success: true });
  } catch (error) {
    console.error('Delete product error:', error.message);
    res.status(500).json({ error: 'حدث خطأ أثناء حذف المنتج: ' + error.message });
  }
});


// 5. Submit new order
app.post('/api/orders', async (req, res) => {
  const { customer_name, customer_phone, customer_address, total_price, items } = req.body;

  if (!pool) {
    const newOrder = {
      id: tempOrders.length + 1,
      customer_name,
      customer_phone,
      customer_address,
      total_price: parseFloat(total_price),
      status: 'pending',
      items,
      created_at: new Date().toISOString()
    };
    tempOrders.push(newOrder);

    // Decrement local stock
    items.forEach(item => {
      const prod = tempProducts.find(p => p.id === item.id);
      if (prod) {
        prod.stock = Math.max(0, prod.stock - item.quantity);
      }
    });

    return res.status(201).json(newOrder);
  }

  try {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Create Order
      const orderRes = await client.query(
        'INSERT INTO orders (customer_name, customer_phone, customer_address, total_price, items) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [customer_name, customer_phone, customer_address, total_price, JSON.stringify(items)]
      );

      // Update stocks
      for (const item of items) {
        await client.query(
          'UPDATE products SET stock = GREATEST(0, stock - $1) WHERE id = $2',
          [item.quantity, item.id]
        );
      }

      await client.query('COMMIT');
      res.status(201).json(orderRes.rows[0]);
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "حدث خطأ أثناء حفظ الطلب" });
  }
});

// 6. Get all orders (Admin)
app.get('/api/orders', authenticateToken, async (req, res) => {
  if (!pool) {
    return res.json(tempOrders.slice().reverse());
  }
  try {
    const result = await pool.query('SELECT * FROM orders ORDER BY id DESC');
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "حدث خطأ أثناء جلب الطلبات" });
  }
});

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
  if (!sql) {
    const newCat = { id, name, type };
    tempCategories.push(newCat);
    return res.status(201).json(newCat);
  }
  try {
    const rows = await sql.query(
      'INSERT INTO categories (id, name, type) VALUES ($1, $2, $3) ON CONFLICT (id) DO UPDATE SET name = $2, type = $3 RETURNING *',
      [id, name, type]
    );
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "حدث خطأ أثناء إضافة التصنيف" });
  }
});

app.delete('/api/categories/:id', async (req, res) => {
  const { id } = req.params;
  if (!sql) {
    tempCategories = tempCategories.filter(c => c.id !== id);
    return res.json({ success: true });
  }
  try {
    await sql.query('DELETE FROM categories WHERE id = $1', [id]);
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
  budget_limit_high: '1300'
};
let tempSettings = { ...defaultSettings };

app.get('/api/settings', async (req, res) => {
  if (!sql) {
    return res.json(tempSettings);
  }
  try {
    const rows = await sql.query('SELECT key, value FROM store_settings');
    const settings = {};
    rows.forEach(row => { settings[row.key] = row.value; });
    res.json(settings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'خطأ أثناء جلب الإعدادات' });
  }
});

app.put('/api/settings', async (req, res) => {
  const updates = req.body;
  if (!sql) {
    tempSettings = { ...tempSettings, ...updates };
    return res.json(tempSettings);
  }
  try {
    for (const [key, value] of Object.entries(updates)) {
      await sql.query(
        'INSERT INTO store_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = $2',
        [key, String(value)]
      );
    }
    const rows = await sql.query('SELECT key, value FROM store_settings');
    const settings = {};
    rows.forEach(row => { settings[row.key] = row.value; });
    res.json(settings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'خطأ أثناء حفظ الإعدادات' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 الخادم يعمل على المنفذ http://localhost:${PORT}`);
});

import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.warn("⚠️ تحذير: لم يتم تعيين DATABASE_URL في ملف .env. سيتم تعطيل العمليات على قاعدة البيانات حتى تعيينه.");
}

export const pool = connectionString ? new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false // Required for Neon PostgreSQL serverless connections
  }
}) : null;

export async function initDB() {
  if (!pool) return;

  try {
    const client = await pool.connect();
    console.log("⚡ تم الاتصال بقاعدة بيانات Neon PostgreSQL بنجاح.");

    // Create products table
    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        category VARCHAR(50) NOT NULL,
        subcategory VARCHAR(100),
        price DECIMAL(10, 2) NOT NULL,
        image_url TEXT,
        specs JSONB DEFAULT '{}',
        stock INT DEFAULT 10,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("✅ جدول المنتجات products جاهز.");

    // Create orders table
    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        customer_name VARCHAR(255) NOT NULL,
        customer_phone VARCHAR(50) NOT NULL,
        customer_address TEXT NOT NULL,
        total_price DECIMAL(10, 2) NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        items JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("✅ جدول الطلبات orders جاهز.");

    // Seed database if empty
    const res = await client.query("SELECT COUNT(*) FROM products;");
    const count = parseInt(res.rows[0].count, 10);
    if (count === 0) {
      console.log("🌱 قاعدة البيانات فارغة. جاري إضافة المنتجات الافتراضية...");
      const initialProducts = [
        {
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

      for (const p of initialProducts) {
        await client.query(
          "INSERT INTO products (title, category, subcategory, price, image_url, specs, stock) VALUES ($1, $2, $3, $4, $5, $6, $7);",
          [p.title, p.category, p.subcategory, p.price, p.image_url, JSON.stringify(p.specs), p.stock]
        );
      }
      console.log("🌱 تم إدخال المنتجات الافتراضية بنجاح.");
    }

    client.release();
  } catch (error) {
    console.error("❌ خطأ أثناء إعداد قاعدة بيانات Neon:", error);
  }
}

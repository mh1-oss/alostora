// Functions helper for Neon DB connection on Cloudflare Pages
import { Client } from '@neondatabase/serverless';

export function getDbClient(env) {
  // If DATABASE_URL is not provided, we will return mock database client logic
  const databaseUrl = env.DATABASE_URL;
  if (!databaseUrl) {
    return null;
  }
  return new Client(databaseUrl);
}

// Fallback in-memory data representation for serverless instances when DB is not configured
export const tempProducts = [
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
  }
];

export interface Product {
  id?: number;
  title: string;
  category: 'laptop' | 'accessory';
  subcategory: string;
  price: number;
  image_url: string;
  specs: Record<string, string>;
  stock: number;
  created_at?: string;
}

export const INITIAL_PRODUCTS: Product[] = [
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

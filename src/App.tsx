// App.tsx - Al-Ostoura computer store frontend
import React, { useState, useEffect } from 'react';
import { 
  Laptop, 
  Gamepad2, 
  ShoppingBag, 
  ShoppingCart, 
  Search, 
  CheckCircle, 
  X, 
  Plus, 
  Minus, 
  Trash2, 
  ArrowLeftRight, 
  Compass, 
  UserCheck, 
  Package, 
  DollarSign, 
  Eye, 
  Edit3, 
  Send,
  MessageSquare,
  AlertCircle,
  Monitor,
  Flame,
  Cpu,
  Layers,
  HardDrive,
  ShieldCheck,
  Truck,
  RefreshCw,
  Phone,
  Mail,
  MapPin,
  ChevronDown,
  Receipt
} from 'lucide-react';
import { INITIAL_PRODUCTS, Product } from './data/products';
import { motion, AnimatePresence } from 'framer-motion';

function App() {
  // Navigation & UI States
  const [activeTab, setActiveTab] = useState<'home' | 'laptops' | 'accessories' | 'smart-finder' | 'contact' | 'product-detail' | 'admin' | 'cart'>('home');
  
  // Currency States
  const [currency, setCurrency] = useState<'USD' | 'IQD'>('USD');
  const [exchangeRate, setExchangeRate] = useState<number>(1480);
  const [productPricingCurrency, setProductPricingCurrency] = useState<'USD' | 'IQD'>('USD');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('all');
  const [compareList, setCompareList] = useState<Product[]>([]);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [selectedProductDetail, setSelectedProductDetail] = useState<Product | null>(null);
  const [detailQuantity, setDetailQuantity] = useState(1);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [animateCart, setAnimateCart] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  
  // Data States
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [stats, setStats] = useState({ total_sales: 0, orders_count: 0, products_count: 0 });
  const [dbStatus, setDbStatus] = useState<{ connected: boolean; message: string }>({ connected: false, message: 'جاري التحميل...' });

  // Admin States
  const [adminLoggedIn, setAdminLoggedIn] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [adminUsername, setAdminUsername] = useState('');
  const [adminSubTab, setAdminSubTab] = useState<'products' | 'orders' | 'categories' | 'shipping' | 'settings'>('products');
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState<number | null>(null);
  
  // Admin Credential Management (with localStorage survival)
  const [savedAdminUser, setSavedAdminUser] = useState(() => localStorage.getItem('savedAdminUser') || 'admin');
  const [savedAdminPass, setSavedAdminPass] = useState(() => localStorage.getItem('savedAdminPass') || 'alostora2025');
  const [newAdminUser, setNewAdminUser] = useState('');
  const [newAdminPass, setNewAdminPass] = useState('');
  const [newAdminPassConfirm, setNewAdminPassConfirm] = useState('');

  // Save admin credentials updates to localStorage
  const updateAdminCredentials = (user: string, pass: string) => {
    if (user) {
      setSavedAdminUser(user);
      localStorage.setItem('savedAdminUser', user);
    }
    if (pass) {
      setSavedAdminPass(pass);
      localStorage.setItem('savedAdminPass', pass);
    }
  };
  
  // Bulk Shipping States
  const [bulkShippingRate, setBulkShippingRate] = useState('');
  const [bulkShippingSelected, setBulkShippingSelected] = useState<string[]>([]);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [specList, setSpecList] = useState<{ key: string; value: string }[]>([
    { key: 'المعالج (CPU)', value: '' },
    { key: 'كرت الشاشة (GPU)', value: '' },
    { key: 'الذاكرة (RAM)', value: '' },
    { key: 'التخزين (SSD)', value: '' }
  ]);
  const [adminForm, setAdminForm] = useState<{
    title: string;
    category: 'laptop' | 'accessory';
    subcategory: string;
    price: string;
    image_url: string;
    stock: string;
  }>({
    title: '',
    category: 'laptop',
    subcategory: 'gaming',
    price: '',
    image_url: '',
    stock: '10'
  });

  // Admin Catalog Filter/Search/Sort States
  const [adminSearchQuery, setAdminSearchQuery] = useState('');
  const [adminSortBy, setAdminSortBy] = useState<'title' | 'price-asc' | 'price-desc' | 'stock-desc' | 'all'>('all');
  const [adminCategoryFilter, setAdminCategoryFilter] = useState<string>('all');
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);

  // Dynamic Categories State
  const [categories, setCategories] = useState<{
    id: string;
    name: string;
    type: 'laptop' | 'accessory';
  }[]>([
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
  ]);

  // Category Edit / Add modal states
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<{
    id: string;
    name: string;
    type: 'laptop' | 'accessory';
    isNew: boolean;
  } | null>(null);

  // Shipping Delivery Cost States (in USD to sum up with product pricing)
  const [selectedProvince, setSelectedProvince] = useState<string>('بغداد');
  const [isProvinceDropdownOpen, setIsProvinceDropdownOpen] = useState(false);
  const [shippingRates, setShippingRates] = useState<Record<string, number>>({
    'بغداد': 5000,
    'البصرة': 10000,
    'نينوى': 10000,
    'أربيل': 10000,
    'النجف': 8000,
    'كربلاء': 8000,
    'ذي قار': 9000,
    'بابل': 8000,
    'السليمانية': 10000,
    'دهوك': 10000,
    'الأنبار': 9000,
    'ديالى': 8000,
    'كركوك': 9000,
    'صلاح الدين': 9000,
    'المثنى': 9000,
    'ميسان': 9000,
    'القادسية': 9000,
    'واسط': 8000
  });

  // Smart Finder States
  const [finderStep, setFinderStep] = useState(1);
  const [finderBudget, setFinderBudget] = useState<'low' | 'mid' | 'high' | null>(null);
  const [finderUsage, setFinderUsage] = useState<'gaming' | 'office' | 'ultrabook' | null>(null);
  const [finderResult, setFinderResult] = useState<Product | null>(null);
  const [finderAlternatives, setFinderAlternatives] = useState<Product[]>([]);

  // Checkout Form States
  const [checkoutForm, setCheckoutForm] = useState({
    name: '',
    phone: '',
    address: ''
  });

  // Fetch Products & Backend status
  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
        setDbStatus({ connected: true, message: 'متصل بـ Neon DB سحابياً' });
      } else {
        throw new Error();
      }
    } catch (e) {
      console.warn("Could not connect to API server. Operating in offline/fallback mode.");
      setProducts(INITIAL_PRODUCTS);
      setDbStatus({ connected: false, message: 'قاعدة البيانات الافتراضية (وضع المعاينة)' });
    }
  };

  const fetchAdminData = async () => {
    try {
      const ordRes = await fetch('/api/orders');
      const statsRes = await fetch('/api/stats');
      if (ordRes.ok && statsRes.ok) {
        const ordersData = await ordRes.json();
        const statsData = await statsRes.json();
        setOrders(ordersData);
        setStats(statsData);
      }
    } catch (e) {
      console.warn("Could not fetch admin data.");
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (adminLoggedIn) {
      fetchAdminData();
    }
  }, [adminLoggedIn]);

  useEffect(() => {
    if (isAdminModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isAdminModalOpen]);

  // Cart Functions
  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find((item: { product: Product; quantity: number }) => item.product.id === product.id);
      if (existing) {
        return prev.map((item: { product: Product; quantity: number }) => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    setAnimateCart(true);
    setTimeout(() => setAnimateCart(false), 600);
  };

  const addToCartWithQty = (product: Product, qty: number) => {
    setCart(prev => {
      const existing = prev.find((item: { product: Product; quantity: number }) => item.product.id === product.id);
      if (existing) {
        return prev.map((item: { product: Product; quantity: number }) => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + qty }
            : item
        );
      }
      return [...prev, { product, quantity: qty }];
    });
    setAnimateCart(true);
    setTimeout(() => setAnimateCart(false), 600);
  };

  const updateCartQuantity = (productId: number | undefined, delta: number) => {
    if (!productId) return;
    setCart(prev => prev.map((item: { product: Product; quantity: number }) => {
      if (item.product.id === productId) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : null;
      }
      return item;
    }).filter(Boolean) as any);
  };

  const removeFromCart = (productId: number | undefined) => {
    if (!productId) return;
    setCart(prev => prev.filter((item: { product: Product; quantity: number }) => item.product.id !== productId));
  };

  const cartTotal = cart.reduce((sum: number, item: { product: Product; quantity: number }) => sum + item.product.price * item.quantity, 0);
  // shippingRates stored in IQD — convert to USD for total calculation
  const deliveryCostIQD = shippingRates[selectedProvince] || 0;
  const deliveryCost = deliveryCostIQD / exchangeRate;
  const finalCartTotal = cartTotal + deliveryCost;

  // Compare Functions
  const toggleCompare = (product: Product) => {
    setCompareList(prev => {
      const exists = prev.find((p: Product) => p.id === product.id);
      if (exists) {
        return prev.filter((p: Product) => p.id !== product.id);
      }
      if (prev.length >= 2) {
        alert("يمكنك مقارنة منتجين فقط كحد أقصى.");
        return prev;
      }
      return [...prev, product];
    });
  };

  // Checkout Flow
  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkoutForm.name || !checkoutForm.phone || !checkoutForm.address) {
      alert("يرجى ملء جميع الحقول المطلوبة.");
      return;
    }

    const orderPayload = {
      customer_name: checkoutForm.name,
      customer_phone: checkoutForm.phone,
      customer_address: `${selectedProvince} - ${checkoutForm.address}`,
      total_price: finalCartTotal,
      items: cart.map(item => ({
        id: item.product.id,
        title: item.product.title,
        price: item.product.price,
        quantity: item.quantity
      }))
    };

    try {
      await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });
    } catch (e) {
      console.warn("Offline order submission.");
    }

    // WhatsApp Message Integration
    const orderItemsText = cart.map(item => 
      `- ${item.product.title} (الكمية: ${item.quantity}) - $${item.product.price * item.quantity}`
    ).join('\n');

    const whatsappMessage = encodeURIComponent(
      `مرحباً متجر الأسطورة للحاسبات 💻\n` +
      `أود تقديم طلب شراء جديد:\n\n` +
      `👤 العميل: ${checkoutForm.name}\n` +
      `📞 الهاتف: ${checkoutForm.phone}\n` +
      `📍 المحافظة: ${selectedProvince}\n` +
      `📍 العنوان بالتفصيل: ${checkoutForm.address}\n\n` +
      `📦 تفاصيل الطلب:\n${orderItemsText}\n\n` +
      `💵 المجموع الفرعي: $${cartTotal}\n` +
      `🚚 تكلفة التوصيل: $${deliveryCost}\n` +
      `💵 الإجمالي الكلي: $${finalCartTotal}\n\n` +
      `شكراً لكم، بانتظار تأكيد التوصيل!`
    );

    window.open(`https://wa.me/9647801814088?text=${whatsappMessage}`, '_blank');

    setCart([]);
    setIsCheckoutOpen(false);
    setIsCartOpen(false);
    fetchProducts();
  };

  // Smart Finder Run
  const handleFinderRun = () => {
    let allLaptops = products.filter(p => p.category === 'laptop');
    let candidates = allLaptops;

    // Filter by usage
    if (finderUsage) {
      candidates = candidates.filter(p => p.subcategory === finderUsage);
    }

    // Filter by budget
    let budgetFilter = (p: Product) => true;
    if (finderBudget === 'low') {
      budgetFilter = (p: Product) => p.price < 900;
    } else if (finderBudget === 'mid') {
      budgetFilter = (p: Product) => p.price >= 900 && p.price <= 1300;
    } else if (finderBudget === 'high') {
      budgetFilter = (p: Product) => p.price > 1300;
    }

    let exactMatches = candidates.filter(budgetFilter);

    if (exactMatches.length > 0) {
      // Sort exact matches: show best specifications first (highest price within budget)
      exactMatches.sort((a, b) => b.price - a.price);
      setFinderResult(exactMatches[0]);
      setFinderAlternatives(exactMatches.slice(1));
    } else {
      // Fallback: If no exact matches within budget for this usage, get all laptops of this usage
      // and sort them by price ascending (to show the most affordable option closest to their budget first)
      let fallbackCandidates = allLaptops.filter(p => p.subcategory === finderUsage);
      if (fallbackCandidates.length > 0) {
        fallbackCandidates.sort((a, b) => a.price - b.price);
        setFinderResult(fallbackCandidates[0]);
        setFinderAlternatives(fallbackCandidates.slice(1));
      } else {
        setFinderResult(null);
        setFinderAlternatives([]);
      }
    }
    setFinderStep(3);
  };

  // Admin Login with lockout
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (lockoutUntil && Date.now() < lockoutUntil) {
      const remaining = Math.ceil((lockoutUntil - Date.now()) / 1000);
      alert(`تم تعطيل تسجيل الدخول مؤقتاً. حاول مرة أخرى بعد ${remaining} ثانية.`);
      return;
    }
    
    if (adminUsername === savedAdminUser && adminPassword === savedAdminPass) {
      setAdminLoggedIn(true);
      setLoginAttempts(0);
      setLockoutUntil(null);
      setAdminUsername('');
      setAdminPassword('');
    } else {
      const newAttempts = loginAttempts + 1;
      setLoginAttempts(newAttempts);
      if (newAttempts >= 5) {
        setLockoutUntil(Date.now() + 60000);
        setLoginAttempts(0);
        alert('تم تأمين الدخول لمدة 60 ثانية بعد 5 محاولات خاطئة.');
      } else {
        alert(`اسم المستخدم أو رمز المرور خاطئ. المحاولات المتبقية: ${5 - newAttempts}`);
      }
    }
  };

  // Price formatting helper
  const formatPrice = (rawPrice: number | string | undefined) => {
    const usdPrice = Number(rawPrice) || 0;
    if (currency === 'IQD') {
      return `${Math.round(usdPrice * exchangeRate).toLocaleString('ar-IQ')} د.ع`;
    }
    return `$${usdPrice.toFixed(2)}`;
  };

  // Format product price (takes into account admin pricing currency)
  const formatProductPrice = (rawPrice: number | string | undefined) => {
    const price = Number(rawPrice) || 0;
    // If products are priced in IQD, convert to USD first for display
    const usdEquiv = productPricingCurrency === 'IQD' ? price / exchangeRate : price;
    return formatPrice(usdEquiv);
  };

  // Format IQD value directly (for shipping rates which are stored in IQD)
  const formatIQD = (iqd: number) => `${Math.round(iqd).toLocaleString('ar-IQ')} د.ع`;
  const handleAddOrEditProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const specsObj = specList.reduce((acc, item) => {
      if (item.key.trim()) {
        acc[item.key.trim()] = item.value.trim();
      }
      return acc;
    }, {} as Record<string, string>);

    const payload = {
      title: adminForm.title,
      category: adminForm.category,
      subcategory: adminForm.subcategory,
      price: parseFloat(adminForm.price),
      image_url: adminForm.image_url || "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=600&q=80",
      specs: specsObj,
      stock: parseInt(adminForm.stock)
    };

    try {
      const url = editingProductId ? `/api/products/${editingProductId}` : '/api/products';
      const method = editingProductId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        alert(editingProductId ? "تم تعديل مواصفات الجهاز!" : "تم إضافة المنتج للمتجر!");
        setAdminForm({
          title: '',
          category: 'laptop',
          subcategory: 'gaming',
          price: '',
          image_url: '',
          stock: '10'
        });
        setEditingProductId(null);
        setIsAdminModalOpen(false);
        fetchProducts();
        fetchAdminData();
      }
    } catch (e) {
      alert("فشل تحديث خادم الـ API.");
    }
  };

  const handleEditClick = (product: Product) => {
    setEditingProductId(product.id || null);
    setAdminForm({
      title: product.title,
      category: product.category,
      subcategory: product.subcategory,
      price: product.price.toString(),
      image_url: product.image_url,
      stock: product.stock.toString()
    });
    const parsedSpecs = Object.entries(product.specs || {}).map(([k, v]) => ({
      key: k,
      value: String(v)
    }));
    setSpecList(parsedSpecs.length > 0 ? parsedSpecs : [
      { key: 'المعالج (CPU)', value: '' },
      { key: 'الذاكرة (RAM)', value: '' }
    ]);
    setIsAdminModalOpen(true);
  };

  const handleDeleteProduct = async (id: number | undefined) => {
    if (!id) return;
    if (!confirm("هل تود إزالة المنتج من المعروضات؟")) return;

    try {
      const response = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (response.ok) {
        alert("تم الحذف بنجاح.");
        fetchProducts();
        fetchAdminData();
      }
    } catch (e) {
      alert("فشل حذف المنتج.");
    }
  };

  const renderProductCard = (product: Product) => {
    const isCompared = compareList.some((p: Product) => p.id === product.id);
    return (
      <div key={product.id} className="card-glass flex flex-col justify-between overflow-hidden relative">
        <div className="absolute top-3.5 right-3.5 z-10 px-3 py-1 rounded-full text-[10px] font-bold text-white bg-indigo-600 shadow">
          {product.category === 'laptop' ? 'لابتوب' : 'ملحق'}
        </div>

        <div className="p-3.5">
          <div 
            onClick={() => { setSelectedProductDetail(product); setDetailQuantity(1); setActiveTab('product-detail'); }}
            className="aspect-[16/10] rounded-xl overflow-hidden mb-4 bg-gray-50 border border-gray-100 relative group cursor-pointer"
          >
            <img 
              src={product.image_url} 
              alt={product.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
            />
          </div>

          <h3 
            onClick={() => { setSelectedProductDetail(product); setDetailQuantity(1); setActiveTab('product-detail'); }}
            className="font-extrabold text-base text-gray-900 line-clamp-1 mb-1.5 cursor-pointer hover:text-indigo-600 transition-colors" 
            title={product.title}
          >
            {product.title}
          </h3>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
              {product.subcategory}
            </span>
            <span className={`text-[10px] font-bold ${product.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
              {product.stock > 0 ? `المخزن: ${product.stock}` : 'غير متوفر'}
            </span>
          </div>

          <div className="border-t border-gray-100/60 pt-3 space-y-1.5 text-xs text-gray-600">
            {Object.entries(product.specs).slice(0, 3).map(([key, val]) => (
              <div key={key} className="flex justify-between items-center">
                <span className="font-semibold text-gray-400 text-[11px]">{key}</span>
                <span className="font-bold text-gray-700 text-[11px] truncate max-w-[150px]">{val}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 border-t border-gray-150/50 bg-gray-50/50 flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-semibold text-gray-400">السعر النقدي</span>
            <span className="text-xl font-black text-indigo-600">{formatProductPrice(product.price)}</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button 
              onClick={() => toggleCompare(product)}
              disabled={product.category !== 'laptop'}
              className={`py-2 px-1 rounded-xl border text-[10px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                isCompared 
                  ? 'bg-indigo-50 border-indigo-300 text-indigo-600' 
                  : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-150'
              }`}
            >
              <ArrowLeftRight size={12} />
              <span>{isCompared ? 'مضاف' : 'مقارنة'}</span>
            </button>

            <button 
              onClick={() => setQuickViewProduct(product)}
              className="py-2 px-1 rounded-xl bg-white border border-gray-200 text-gray-500 hover:bg-gray-150 text-[10px] font-bold flex items-center justify-center gap-1 cursor-pointer"
            >
              <Eye size={12} />
              <span>تفاصيل</span>
            </button>

            <button 
              onClick={() => addToCart(product)}
              disabled={product.stock <= 0}
              className="py-2 px-1 rounded-xl btn-premium-primary text-[10px] font-bold flex items-center justify-center gap-1 shadow-none hover:translate-y-0"
            >
              <ShoppingCart size={12} />
              <span>سلة</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  const filteredProducts = products.filter((p: Product) => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === 'home' 
      ? true 
      : activeTab === 'laptops' 
        ? p.category === 'laptop' 
        : activeTab === 'accessories' 
          ? p.category === 'accessory' 
          : false;
    const matchesSubcat = selectedSubcategory === 'all' || p.subcategory === selectedSubcategory;
    return matchesSearch && matchesTab && matchesSubcat;
  });

  return (
    <div className="min-h-screen flex flex-col font-sans antialiased text-gray-800 pb-12">
      <div className="float-dot-1"></div>
      <div className="float-dot-2"></div>

      {/* Modern Premium Header/Navbar */}
      <nav className={`card-glass flat sticky top-4 z-40 mx-4 md:mx-12 my-4 px-6 py-4 flex items-center border-white min-h-[74px] transition-all duration-350 ${
        isScrolled 
          ? 'bg-white/45 backdrop-blur-[28px] shadow-lg shadow-indigo-100/10 border-indigo-100/30' 
          : 'bg-white/65'
      }`}>
        <AnimatePresence mode="wait">
          {isSearchOpen ? (
            <motion.div 
              key="search-mode"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.15 }}
              className="w-full flex items-center gap-4 text-right"
              dir="rtl"
            >
              <div className="relative flex-1">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="text" 
                  placeholder="ابحث عن الأجهزة، الملحقات، أو المواصفات..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  autoFocus
                  className="w-full pr-12 pl-5 py-3 rounded-2xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-sm text-right"
                />
              </div>
              <button 
                onClick={() => { setIsSearchOpen(false); setSearchQuery(''); }}
                className="px-5 py-3 text-xs font-black text-gray-500 hover:text-indigo-650 transition-all cursor-pointer rounded-2xl bg-gray-50 border border-gray-200/60 hover:bg-gray-100"
              >
                إلغاء
              </button>
            </motion.div>
          ) : (
            <motion.div 
              key="normal-mode"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="w-full flex items-center justify-between"
            >
              <div className="logo-wrapper" onClick={() => setActiveTab('home')}>
                <div className="logo-icon-box">
                  <div className="logo-shape1"></div>
                  <div className="logo-shape2"></div>
                  <div className="logo-shape3"></div>
                </div>
                <div>
                  <span className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800">
                    الأسطورة
                  </span>
                  <span className="text-xs block font-bold text-gray-500">للحاسبات والملحقات</span>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="hidden md:flex items-center gap-8">
                <button onClick={() => { setActiveTab('home'); setSelectedSubcategory('all'); }} className={`nav-link-premium ${activeTab === 'home' ? 'active' : ''}`}>الرئيسية</button>
                <button onClick={() => { setActiveTab('laptops'); setSelectedSubcategory('all'); }} className={`nav-link-premium ${activeTab === 'laptops' ? 'active' : ''}`}>أجهزة اللابتوب</button>
                <button onClick={() => { setActiveTab('accessories'); setSelectedSubcategory('all'); }} className={`nav-link-premium ${activeTab === 'accessories' ? 'active' : ''}`}>الإكسسوارات</button>
                <button onClick={() => { setActiveTab('smart-finder'); setFinderStep(1); }} className={`nav-link-premium ${activeTab === 'smart-finder' ? 'active' : ''} flex items-center gap-1.5`}>
                  <Compass size={16} className="text-indigo-650 animate-spin-slow" />
                  <span className="font-bold text-indigo-650">المساعد الذكي</span>
                </button>
                <button onClick={() => setActiveTab('contact')} className={`nav-link-premium ${activeTab === 'contact' ? 'active' : ''}`}>اتصل بنا</button>
              </div>

              {/* Status indicator, Search & Cart trigger */}
              <div className="flex items-center gap-2.5">
                {/* Currency Toggle */}
                <button 
                  onClick={() => setCurrency(c => c === 'USD' ? 'IQD' : 'USD')}
                  className="p-2 rounded-xl bg-white border border-gray-200 shadow-sm hover:border-indigo-500 hover:text-indigo-600 transition-all flex items-center gap-1.5 cursor-pointer text-xs font-black"
                  title="تبديل العملة"
                >
                  <span className="hidden sm:inline">{currency === 'USD' ? '🇺🇸 USD' : '🇮🇶 IQD'}</span>
                  <span className="sm:hidden">{currency === 'USD' ? '$' : 'د'}</span>
                </button>

                {/* Search trigger button */}
                <button 
                  onClick={() => { setIsSearchOpen(true); setIsMobileMenuOpen(false); }}
                  className="p-2.5 rounded-xl bg-white border border-gray-200 shadow-sm hover:border-indigo-500 hover:text-indigo-600 transition-all flex items-center justify-center cursor-pointer"
                  title="بحث"
                >
                  <Search size={18} />
                </button>

                <motion.button 
                  onClick={() => { setActiveTab('cart'); setIsMobileMenuOpen(false); }} 
                  animate={animateCart ? { scale: [1, 1.3, 0.9, 1.15, 1], rotate: [0, -12, 12, -6, 0] } : { scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                  className="relative p-2.5 rounded-xl bg-white border border-gray-200 shadow-sm hover:border-indigo-500 hover:text-indigo-600 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <ShoppingCart size={18} />
                  <span className="hidden md:inline font-bold text-xs">السلة</span>
                  {cart.length > 0 && (
                    <motion.span 
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      key={cart.reduce((sum, item) => sum + item.quantity, 0)}
                      className="absolute -top-1.5 -right-1.5 bg-indigo-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-extrabold shadow"
                    >
                      {cart.reduce((sum, item) => sum + item.quantity, 0)}
                    </motion.span>
                  )}
                </motion.button>

                {/* Mobile Menu Toggle Button */}
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="md:hidden flex flex-col justify-center items-center w-10 h-10 rounded-xl bg-white border border-gray-200 shadow-sm relative cursor-pointer"
                >
                  <motion.span
                    animate={isMobileMenuOpen ? { rotate: 45, y: 5.5 } : { rotate: 0, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className="w-5 h-0.5 bg-gray-600 rounded-full mb-1 block"
                  />
                  <motion.span
                    animate={isMobileMenuOpen ? { opacity: 0 } : { opacity: 1 }}
                    transition={{ duration: 0.2 }}
                    className="w-5 h-0.5 bg-gray-600 rounded-full mb-1 block"
                  />
                  <motion.span
                    animate={isMobileMenuOpen ? { rotate: -45, y: -5.5 } : { rotate: 0, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className="w-5 h-0.5 bg-gray-600 rounded-full block"
                  />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Floating Instant Search Dropdown Results directly below sticky navbar */}
      <AnimatePresence>
        {isSearchOpen && searchQuery.trim() !== '' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="fixed top-28 left-4 right-4 md:left-auto md:right-12 z-40 bg-white/85 backdrop-blur-xl rounded-3xl border border-white/60 shadow-[0_20px_50px_rgba(99,102,241,0.15)] p-5 w-auto md:w-[450px] max-h-[450px] overflow-y-auto space-y-2.5 text-right"
            dir="rtl"
          >
            {(() => {
              const query = searchQuery.toLowerCase().trim();
              const results = products.filter((p: Product) => 
                p.title.toLowerCase().includes(query) ||
                p.subcategory.toLowerCase().includes(query) ||
                Object.values(p.specs).some(val => val.toLowerCase().includes(query))
              );
              
              if (results.length === 0) {
                return (
                  <div className="text-center py-8 text-gray-400 text-xs font-bold">
                    لا توجد نتائج تطابق "{searchQuery}"
                  </div>
                );
              }

              return results.map((prod: Product, idx) => (
                <div 
                  key={prod.id}
                  className="p-3 bg-gray-50/40 hover:bg-indigo-50/50 hover:scale-[1.02] hover:shadow-sm border border-gray-100/60 rounded-2xl flex items-center justify-between gap-4 transition-all duration-200 cursor-pointer"
                >
                  <div 
                    onClick={() => { setSelectedProductDetail(prod); setDetailQuantity(1); setActiveTab('product-detail'); setIsSearchOpen(false); setSearchQuery(''); }}
                    className="flex items-center gap-3 text-right cursor-pointer flex-1 min-w-0"
                  >
                    <img 
                      src={prod.image_url} 
                      alt={prod.title} 
                      className="w-11 h-11 object-cover rounded-xl border shrink-0 bg-white"
                    />
                    <div className="min-w-0">
                      <h4 className="font-extrabold text-xs text-gray-900 truncate">{prod.title}</h4>
                      <span className="text-[9px] font-bold text-gray-400 block mt-0.5">{prod.subcategory} • {prod.category === 'laptop' ? 'لابتوب' : 'ملحق'}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-black text-xs text-indigo-650">{formatProductPrice(prod.price)}</span>
                    <button 
                      onClick={() => addToCart(prod)}
                      disabled={prod.stock <= 0}
                      className="p-2 rounded-xl bg-white border border-gray-200/80 shadow-sm text-indigo-600 hover:border-indigo-500 cursor-pointer transition-colors"
                      title="إضافة للسلة"
                    >
                      <ShoppingCart size={13} />
                    </button>
                  </div>
                </div>
              ));
            })()}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Menu Dropdown Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="md:hidden mx-4 my-2 overflow-hidden card-glass bg-white/95 border-white shadow-xl z-30 px-6 py-5 flex flex-col gap-4 text-center items-center"
          >
            <button 
              onClick={() => { setActiveTab('home'); setSelectedSubcategory('all'); setIsMobileMenuOpen(false); }} 
              className={`py-2.5 text-sm font-extrabold border-b border-gray-100 text-gray-700 hover:text-indigo-650 transition-colors block text-center w-full cursor-pointer ${activeTab === 'home' ? 'text-indigo-650' : ''}`}
            >
              الرئيسية
            </button>
            <button 
              onClick={() => { setActiveTab('laptops'); setSelectedSubcategory('all'); setIsMobileMenuOpen(false); }} 
              className={`py-2.5 text-sm font-extrabold border-b border-gray-100 text-gray-700 hover:text-indigo-650 transition-colors block text-center w-full cursor-pointer ${activeTab === 'laptops' ? 'text-indigo-650' : ''}`}
            >
              أجهزة اللابتوب
            </button>
            <button 
              onClick={() => { setActiveTab('accessories'); setSelectedSubcategory('all'); setIsMobileMenuOpen(false); }} 
              className={`py-2.5 text-sm font-extrabold border-b border-gray-100 text-gray-700 hover:text-indigo-650 transition-colors block text-center w-full cursor-pointer ${activeTab === 'accessories' ? 'text-indigo-650' : ''}`}
            >
              الإكسسوارات
            </button>
            <button 
              onClick={() => { setActiveTab('smart-finder'); setFinderStep(1); setIsMobileMenuOpen(false); }} 
              className={`py-2.5 text-sm font-extrabold border-b border-gray-100 text-indigo-650 flex items-center gap-1.5 justify-center transition-colors block cursor-pointer w-full ${activeTab === 'smart-finder' ? 'font-black' : ''}`}
            >
              <Compass size={16} className="animate-spin-slow" />
              <span>المساعد الذكي</span>
            </button>
            <button 
              onClick={() => { setActiveTab('contact'); setIsMobileMenuOpen(false); }} 
              className={`py-2.5 text-sm font-extrabold text-gray-700 hover:text-indigo-650 transition-colors block text-center w-full cursor-pointer ${activeTab === 'contact' ? 'text-indigo-650' : ''}`}
            >
              اتصل بنا
            </button>
          </motion.div>
        )}
      </AnimatePresence>



      {/* Hero Landing Section (Home tab only) */}
      {activeTab === 'home' && (
        <header className="container mx-auto px-6 md:px-12 py-16 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center max-w-7xl">
          <div className="lg:col-span-7 text-right">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-bold mb-6">
              ⭐ إعادة تعريف السرعة والأداء العالي لعام 2026
            </span>
            <h1 className="text-4xl md:text-6xl font-black text-gray-900 leading-tight mb-6">
              نبني المستقبل بأقوى <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500">
                أجهزة اللابتوب والملحقات
              </span>
            </h1>
            <p className="text-gray-600 text-base md:text-lg mb-8 max-w-xl">
              تصفح التشكيلة الأحدث من اللابتوبات المخصصة للألعاب والمونتاج والدراسة، بالإضافة إلى تشكيلة إكسسوارات احترافية تضمن لك الأداء المتكامل والسرعة القصوى.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <button onClick={() => setActiveTab('laptops')} className="btn-premium-primary">
                استكشف المعروضات <Laptop size={18} />
              </button>
              <button onClick={() => { setActiveTab('smart-finder'); setFinderStep(1); }} className="btn-premium-glass">
                مساعد الاختيار الذكي <Compass size={18} />
              </button>
            </div>
          </div>

          {/* Premium Floating visual matching reference layout */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="hero-card max-w-sm w-full border border-gray-100/80 bg-white/85">
              <div className="flex justify-between items-center mb-6">
                <span className="bg-indigo-50 text-indigo-600 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                  <Flame size={12} className="animate-pulse" /> الأسطورة بنشمارك
                </span>
                <span className="text-xs font-bold text-gray-400">مؤشر السرعة والأداء</span>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span>لابتوبات الألعاب Gaming</span>
                    <span className="text-indigo-600">99% أداء</span>
                  </div>
                  <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" style={{ width: '99%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span>الترا بوك خفيف Ultrabook</span>
                    <span className="text-indigo-600">92% بطارية وسرعة</span>
                  </div>
                  <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full" style={{ width: '92%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span>ملحقات وإكسسوارات</span>
                    <span className="text-indigo-600">96% استجابة</span>
                  </div>
                  <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full" style={{ width: '96%' }}></div>
                  </div>
                </div>
              </div>

              {/* Graphic metrics simulation */}
              <div className="mt-6 pt-4 border-t border-gray-100 flex items-end justify-between h-20 px-2">
                <div className="graph-bar h-12" title="Gaming"></div>
                <div className="graph-bar-accent h-16" title="Ultrabook"></div>
                <div className="graph-bar h-10" title="Office"></div>
                <div className="graph-bar-accent h-14" title="Accessories"></div>
              </div>
            </div>
          </div>
        </header>
      )}

      {/* Catalog navigation filters for dedicated pages */}
      {['laptops', 'accessories'].includes(activeTab) && (
        <section className="container mx-auto px-6 md:px-12 mt-6 mb-8 max-w-7xl">
          <div className="card-glass p-5 flex justify-center items-center bg-white/70 border-white">
            {/* Subcategory Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 justify-center" dir="rtl">
              <span className="text-xs font-bold text-gray-400 ml-2">التصنيف:</span>
              <button 
                onClick={() => setSelectedSubcategory('all')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${selectedSubcategory === 'all' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
              >
                الكل
              </button>
              {activeTab === 'laptops' && (
                <>
                  <button 
                    onClick={() => setSelectedSubcategory('gaming')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${selectedSubcategory === 'gaming' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                  >
                    لابتوبات قيمنق
                  </button>
                  <button 
                    onClick={() => setSelectedSubcategory('ultrabook')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${selectedSubcategory === 'ultrabook' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                  >
                    الترا بوك خفيف
                  </button>
                  <button 
                    onClick={() => setSelectedSubcategory('office')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${selectedSubcategory === 'office' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                  >
                    للدراسة والأعمال
                  </button>
                </>
              )}
              {activeTab === 'accessories' && (
                <>
                  <button 
                    onClick={() => setSelectedSubcategory('mouse')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${selectedSubcategory === 'mouse' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                  >
                    ماوسات
                  </button>
                  <button 
                    onClick={() => setSelectedSubcategory('keyboard')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${selectedSubcategory === 'keyboard' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                  >
                    كيبوردات
                  </button>
                  <button 
                    onClick={() => setSelectedSubcategory('headset')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${selectedSubcategory === 'headset' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                  >
                    سماعات
                  </button>
                </>
              )}
            </div>
          </div>
        </section>
      )}      {/* Products Display Section */}
      {['home', 'laptops', 'accessories'].includes(activeTab) && (
        <main className="container mx-auto px-6 md:px-12 pb-20 max-w-7xl">
          {activeTab === 'home' ? (
            <>
              {/* Laptops Section */}
              <div className="mb-16">
                <div className="flex justify-between items-center mb-6 border-b pb-3 border-gray-200/40">
                  <h2 className="text-2xl font-black flex items-center gap-2">
                    <span>💻 أجهزة لابتوب مميزة</span>
                    <span className="text-xs font-extrabold text-gray-500 bg-white border border-gray-150 px-3 py-1 rounded-full shadow-sm">
                      {filteredProducts.filter((p: Product) => p.category === 'laptop').length} جهاز
                    </span>
                  </h2>
                </div>
                {filteredProducts.filter((p: Product) => p.category === 'laptop').length === 0 ? (
                  <div className="card-glass p-12 text-center text-gray-400 text-xs font-semibold">
                    لا تتوفر أجهزة لابتوب مطابقة للبحث حالياً.
                  </div>
                ) : (
                  <div className="products-grid">
                    {filteredProducts.filter((p: Product) => p.category === 'laptop').map((product: Product) => renderProductCard(product))}
                  </div>
                )}
              </div>

              {/* Accessories Section */}
              <div>
                <div className="flex justify-between items-center mb-6 border-b pb-3 border-gray-200/40">
                  <h2 className="text-2xl font-black flex items-center gap-2">
                    <span>🎧 إكسسوارات وملحقات احترافية</span>
                    <span className="text-xs font-extrabold text-gray-500 bg-white border border-gray-150 px-3 py-1 rounded-full shadow-sm">
                      {filteredProducts.filter((p: Product) => p.category === 'accessory').length} ملحق
                    </span>
                  </h2>
                </div>
                {filteredProducts.filter((p: Product) => p.category === 'accessory').length === 0 ? (
                  <div className="card-glass p-12 text-center text-gray-400 text-xs font-semibold">
                    لا تتوفر إكسسوارات مطابقة للبحث حالياً.
                  </div>
                ) : (
                  <div className="products-grid">
                    {filteredProducts.filter((p: Product) => p.category === 'accessory').map((product: Product) => renderProductCard(product))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="flex justify-between items-center mb-6 border-b pb-3 border-gray-200/40">
                <h2 className="text-2xl font-black">
                  {activeTab === 'laptops' ? 'أجهزة اللابتوب المتوفرة' : 'ملحقات الحاسبات'}
                </h2>
                <span className="text-xs font-extrabold text-gray-500 bg-white border border-gray-150 px-3 py-1 rounded-full shadow-sm">
                  المجموع: {filteredProducts.length}
                </span>
              </div>
              {filteredProducts.length === 0 ? (
                <div className="card-glass p-16 text-center text-gray-500 max-w-lg mx-auto">
                  <AlertCircle size={44} className="mx-auto text-amber-500 mb-4 animate-bounce" />
                  <h3 className="font-extrabold text-lg mb-1">لا توجد نتائج مطابقة</h3>
                  <p className="text-xs">جرب البحث بكلمة أخرى أو تغيير الفلتر.</p>
                </div>
              ) : (
                <div className="products-grid">
                  {filteredProducts.map((product: Product) => renderProductCard(product))}
                </div>
              )}
            </>
          )}
        </main>
      )}

      {/* Smart Laptop Finder Tab */}
      {activeTab === 'smart-finder' && (
        <main className="container mx-auto px-6 py-12 flex-1 max-w-4xl">
          <div className="card-glass p-8 md:p-12 bg-white/80 border-white relative overflow-hidden">
            <h2 className="text-3xl font-black text-center mb-3">مستشار الشراء الذكي 🧭</h2>
            <p className="text-gray-500 text-center mb-10 text-sm">حدد مواصفاتك المناسبة لتصل للابتوب أحلامك بسرعة دون حيرة.</p>

            {finderStep === 1 && (
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-center text-gray-800">1. حدد نطاق الميزانية المتاحة لديك:</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <button 
                    onClick={() => { setFinderBudget('low'); setFinderStep(2); }}
                    className="card-glass p-6 text-center cursor-pointer border-gray-100"
                  >
                    <span className="text-3xl block mb-2">💵</span>
                    <span className="font-extrabold block text-base mb-1">أقل من $900</span>
                    <span className="text-[11px] text-gray-400">حواسيب دراسية واقتصادية ممتازة</span>
                  </button>
                  <button 
                    onClick={() => { setFinderBudget('mid'); setFinderStep(2); }}
                    className="card-glass p-6 text-center cursor-pointer border-gray-100"
                  >
                    <span className="text-3xl block mb-2">💳</span>
                    <span className="font-extrabold block text-base mb-1">$900 - $1300</span>
                    <span className="text-[11px] text-gray-400">أداء ممتاز جداً للألعاب الخفيفة والتصميم</span>
                  </button>
                  <button 
                    onClick={() => { setFinderBudget('high'); setFinderStep(2); }}
                    className="card-glass p-6 text-center cursor-pointer border-gray-100"
                  >
                    <span className="text-3xl block mb-2">💎</span>
                    <span className="font-extrabold block text-base mb-1">أكثر من $1300</span>
                    <span className="text-[11px] text-gray-400">أقوى معالجات ورسوميات قيمنق ومونتاج</span>
                  </button>
                </div>
              </div>
            )}

            {finderStep === 2 && (
              <div className="space-y-6">
                <div className="flex justify-between items-center mb-4 border-b pb-4">
                  <button onClick={() => setFinderStep(1)} className="text-xs font-extrabold text-indigo-600 flex items-center gap-1">
                    ← العودة للخلف
                  </button>
                  <span className="text-xs font-bold text-gray-400">المرحلة 2 من 2</span>
                </div>
                <h3 className="text-lg font-bold text-center text-gray-800">2. اختر طبيعة ومجال استخدامك اليومي:</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <button 
                    onClick={() => setFinderUsage('gaming')}
                    className={`card-glass p-6 text-center cursor-pointer border-2 ${finderUsage === 'gaming' ? 'border-indigo-600 bg-indigo-50/50' : 'border-gray-100'}`}
                  >
                    <Gamepad2 size={28} className="mx-auto text-indigo-600 mb-3" />
                    <span className="font-extrabold block text-base mb-1">قيمنق وصناعة محتوى</span>
                    <span className="text-[11px] text-gray-400">أداء فائق مع كروت شاشة NVIDIA RTX</span>
                  </button>
                  <button 
                    onClick={() => setFinderUsage('ultrabook')}
                    className={`card-glass p-6 text-center cursor-pointer border-2 ${finderUsage === 'ultrabook' ? 'border-indigo-600 bg-indigo-50/50' : 'border-gray-100'}`}
                  >
                    <Laptop size={28} className="mx-auto text-indigo-600 mb-3" />
                    <span className="font-extrabold block text-base mb-1">خفيف الوزن وعمر بطارية</span>
                    <span className="text-[11px] text-gray-400">هياكل نحيفة وسهولة في التنقل المستمر</span>
                  </button>
                  <button 
                    onClick={() => setFinderUsage('office')}
                    className={`card-glass p-6 text-center cursor-pointer border-2 ${finderUsage === 'office' ? 'border-indigo-600 bg-indigo-50/50' : 'border-gray-100'}`}
                  >
                    <Monitor size={28} className="mx-auto text-indigo-600 mb-3" />
                    <span className="font-extrabold block text-base mb-1">تصفح ودراسة مكتبي</span>
                    <span className="text-[11px] text-gray-400">أجهزة اقتصادية وعملية ذات اعتمادية عالية</span>
                  </button>
                </div>

                <div className="text-center pt-6">
                  <button 
                    onClick={handleFinderRun}
                    disabled={!finderUsage}
                    className="btn-premium-primary px-10 cursor-pointer"
                  >
                    أظهر توصية المستشار الذكي
                  </button>
                </div>
              </div>
            )}

            {finderStep === 3 && (
              <div className="space-y-8 text-right animate-fadeIn" dir="rtl">
                <div className="text-center">
                  <h3 className="text-xl font-black text-gray-900">مستشار الشراء الذكي: التوصية المخصصة لك</h3>
                  <p className="text-gray-500 text-xs mt-1">بناءً على تفضيلات الاستخدام والميزانية التي حددتها</p>
                </div>
                
                {finderResult ? (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Primary Recommendation Card */}
                    <div className="lg:col-span-7 card-glass border-indigo-150 bg-indigo-50/10 p-6 md:p-8 relative">
                      {(() => {
                        const matchesBudget = finderBudget === 'low' 
                          ? finderResult.price < 900 
                          : finderBudget === 'mid' 
                            ? (finderResult.price >= 900 && finderResult.price <= 1300) 
                            : finderResult.price > 1300;
                        return (
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold text-white shadow-sm inline-block mb-6 ${matchesBudget ? 'bg-indigo-600' : 'bg-amber-600'}`}>
                            {matchesBudget ? '⭐ التوصية المثالية لميزانيتك واحتياجاتك' : '💡 البديل الأقرب لميزانيتك واحتياجاتك'}
                          </span>
                        );
                      })()}

                      <div className="flex flex-col md:flex-row gap-6">
                        <img 
                          src={finderResult.image_url} 
                          alt={finderResult.title}
                          className="w-full md:w-48 h-44 object-cover rounded-2xl border bg-white shrink-0"
                        />
                        <div className="flex-1 space-y-4">
                          <div>
                            <h4 className="text-lg font-black text-gray-900 mb-1">{finderResult.title}</h4>
                            <span className="text-2xl font-black text-indigo-650 block">${finderResult.price}</span>
                          </div>

                          <div className="bg-white/80 p-4 rounded-xl text-xs space-y-2.5 border border-gray-100/60 shadow-sm">
                            {Object.entries(finderResult.specs).map(([key, val]) => (
                              <div key={key} className="flex justify-between">
                                <span className="text-gray-400 font-bold">{key}:</span>
                                <span className="text-gray-800 font-extrabold">{val}</span>
                              </div>
                            ))}
                          </div>

                          <div className="flex gap-2.5 pt-2">
                            <button 
                              onClick={() => addToCart(finderResult)}
                              className="flex-1 btn-premium-primary justify-center text-xs py-3"
                            >
                              أضف للسلة <ShoppingCart size={14} />
                            </button>
                            <button 
                              onClick={() => { setFinderStep(1); setFinderBudget(null); setFinderUsage(null); }}
                              className="btn-premium-glass text-xs py-3"
                            >
                              إعادة الفحص ↻
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Alternative Matches Column */}
                    <div className="lg:col-span-5 space-y-4">
                      <h4 className="font-extrabold text-xs text-gray-400 border-b pb-2 flex items-center gap-1.5">
                        <span>💡 خيارات بديلة قد تهمك:</span>
                      </h4>

                      {finderAlternatives.length === 0 ? (
                        <div className="p-8 text-center text-gray-400 text-xs font-bold card-glass border-gray-150 bg-white">
                          لا توجد خيارات بديلة متوفرة حالياً لهذا التصنيف.
                        </div>
                      ) : (
                        <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                          {finderAlternatives.map((alt: Product) => (
                            <div 
                              key={alt.id}
                              className="p-3 bg-white/70 hover:bg-indigo-50/20 border border-gray-100 rounded-2xl flex items-center justify-between gap-4 transition-all"
                            >
                              <div 
                                onClick={() => { setSelectedProductDetail(alt); setDetailQuantity(1); setActiveTab('product-detail'); }}
                                className="flex items-center gap-3 text-right cursor-pointer flex-1 min-w-0"
                              >
                                <img 
                                  src={alt.image_url} 
                                  alt={alt.title} 
                                  className="w-12 h-12 object-cover rounded-xl border shrink-0 bg-white"
                                />
                                <div className="min-w-0">
                                  <h5 className="font-extrabold text-xs text-gray-950 truncate">{alt.title}</h5>
                                  <span className="text-[9px] font-bold text-gray-400 block mt-0.5">${alt.price}</span>
                                </div>
                              </div>
                              <button 
                                onClick={() => addToCart(alt)}
                                disabled={alt.stock <= 0}
                                className="p-2 rounded-xl bg-white border border-gray-200/80 shadow-sm text-indigo-600 hover:border-indigo-500 cursor-pointer transition-colors"
                              >
                                <ShoppingCart size={13} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-gray-500 text-center">
                    عذراً، لا يتوفر حالياً جهاز يطابق الخيارات المحددة بدقة.
                    <div className="mt-4">
                      <button onClick={() => { setFinderStep(1); setFinderBudget(null); setFinderUsage(null); }} className="btn-premium-primary mx-auto">
                        البدء من جديد
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      )}

      {/* Contact Us Tab */}
      {activeTab === 'contact' && (
        <main className="container mx-auto px-6 py-12 flex-1 max-w-5xl space-y-8">
          {/* Header Title */}
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">تواصل معنا 📞</h2>
            <p className="text-gray-500 text-xs md:text-sm">
              نحن هنا لمساعدتك والإجابة على أي استفسارات تخص الحواسيب والملحقات. تفضل بزيارتنا أو مراسلتنا في أي وقت.
            </p>
          </div>

          {/* Top Row: Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Address */}
            <div className="card-glass p-5 bg-white/90 border-white shadow-sm flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <MapPin size={18} />
              </div>
              <div>
                <span className="text-[10px] text-gray-400 font-bold block mb-0.5">موقع المعرض</span>
                <span className="text-xs text-gray-800 font-black">بغداد، شارع الصناعة، مجمع الحاسبات</span>
              </div>
            </div>

            {/* Phone */}
            <div className="card-glass p-5 bg-white/90 border-white shadow-sm flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <Phone size={18} />
              </div>
              <div>
                <span className="text-[10px] text-gray-400 font-bold block mb-0.5">الهاتف المباشر</span>
                <span className="text-xs text-gray-800 font-black" dir="ltr">+964 780 181 4088</span>
              </div>
            </div>
          </div>

          {/* Bottom Row: Map and Form */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch">
            {/* Map and Navigation (5 Columns) */}
            <div className="md:col-span-5 flex">
              <div className="card-glass p-5 bg-white/90 border-white shadow-sm space-y-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-black text-gray-800 border-b pb-2 mb-3">📍 موقعنا على الخريطة</h3>
                  
                  {/* Embedded Map */}
                  <div className="rounded-xl overflow-hidden border border-gray-150 relative h-60 shadow-inner">
                    <iframe 
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3334.298715873919!2d44.440263675402095!3d33.31149457344445!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1557816174a7eb07%3A0xe54d24a0d9b4b74e!2z2KfZhNis2KfZhdi52Kkg2KfZhNiq2YPZhtmI2YTZiNis2YrZgQ!5e0!3m2!1sar!2siq!4v1689110000000!5m2!1sar!2siq" 
                      width="100%" 
                      height="100%" 
                      style={{ border: 0 }} 
                      allowFullScreen={true} 
                      loading="lazy" 
                      referrerPolicy="no-referrer-when-downgrade"
                    ></iframe>
                  </div>
                </div>

                <div className="space-y-3">
                  {/* Grid Navigation buttons side-by-side */}
                  <div className="grid grid-cols-2 gap-3">
                    <a 
                      href="https://waze.com/ul?ll=33.311494,44.442838&navigate=yes" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-gradient-to-r from-sky-400 to-blue-500 text-white font-extrabold text-[10px] text-center shadow-md shadow-sky-100 hover:-translate-y-0.5 hover:shadow-lg transition-all cursor-pointer"
                    >
                      <span>🚙 اتجاهات Waze</span>
                    </a>

                    <a 
                      href="https://wa.me/9647801814088" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 text-white font-extrabold text-[10px] text-center shadow-md shadow-emerald-100 hover:-translate-y-0.5 hover:shadow-lg transition-all cursor-pointer"
                    >
                      <MessageSquare size={12} />
                      <span>مراسلة واتساب</span>
                    </a>
                  </div>
                  
                  <span className="text-[9px] text-gray-400 text-center block font-medium">ساعات عمل المعرض: 9:00 صباحاً - 9:00 مساءً</span>
                </div>
              </div>
            </div>

            {/* Contact Form (7 Columns) */}
            <div className="md:col-span-7 flex">
              <div className="card-glass p-6 md:p-8 bg-white/90 border-white shadow-sm space-y-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-black text-gray-800 border-b pb-2 mb-4 text-right">✉️ أرسل لنا رسالة مباشرة</h3>
                  
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      alert("تم إرسال رسالتك بنجاح. سنقوم بالرد عليك عبر الهاتف أو البريد الإلكتروني في أقرب وقت.");
                      (e.target as HTMLFormElement).reset();
                    }}
                    className="space-y-4 text-right"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="text-right">
                        <label className="text-xs font-bold text-gray-600 block mb-1.5 text-right w-full">الاسم الكريم *</label>
                        <input 
                          type="text" 
                          placeholder="الاسم الكامل"
                          required
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white text-right"
                        />
                      </div>
                      <div className="text-right">
                        <label className="text-xs font-bold text-gray-600 block mb-1.5 text-right w-full">رقم الهاتف للتواصل *</label>
                        <input 
                          type="tel" 
                          placeholder="07xxxxxxxx"
                          required
                          dir="rtl"
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white text-right"
                        />
                      </div>
                    </div>

                    <div className="text-right">
                      <label className="text-xs font-bold text-gray-600 block mb-1.5 text-right w-full">تفاصيل طلبك أو استفسارك *</label>
                      <textarea 
                        placeholder="اكتب هنا استفسارك بخصوص الحواسيب أو الملحقات..."
                        required
                        rows={5}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white text-right"
                      />
                    </div>

                    <button 
                      type="submit" 
                      className="w-full btn-premium-primary justify-center py-3.5 text-xs flex items-center gap-2 cursor-pointer shadow-lg shadow-indigo-150/20"
                    >
                      <span>إرسال الرسالة الاستفسارية</span>
                      <Send size={12} />
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* Product Detail Page */}
      {activeTab === 'product-detail' && selectedProductDetail && (
        <main className="container mx-auto px-6 py-12 flex-1 max-w-6xl">
          {/* Back button */}
          <button 
            onClick={() => setActiveTab(selectedProductDetail.category === 'laptop' ? 'laptops' : 'accessories')} 
            className="text-xs font-black text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5 mb-8 cursor-pointer bg-white px-4 py-2.5 rounded-full border border-gray-150 shadow-sm"
          >
            ← العودة لصفحة التسوق والتصنيفات
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Product Image Column (Sticky on Desktop) */}
            <div className="lg:col-span-5 lg:sticky lg:top-24">
              <div className="card-glass p-5 bg-white/95 border-white relative overflow-hidden group shadow-md">
                <div className="absolute top-4.5 right-4.5 z-10 px-3.5 py-1 rounded-full text-[10px] font-extrabold text-white bg-indigo-600 shadow-md">
                  {selectedProductDetail.category === 'laptop' ? 'لابتوب' : 'ملحق ملائم'}
                </div>
                
                <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 relative shadow-inner">
                  <img 
                    src={selectedProductDetail.image_url} 
                    alt={selectedProductDetail.title} 
                    className="w-full h-full object-cover group-hover:scale-102 transition-all duration-500"
                  />
                </div>
              </div>
            </div>

            {/* Product Info Column */}
            <div className="lg:col-span-7 space-y-6">
              {/* Card 1: Title block */}
              <div className="card-glass flat p-6 md:p-8 bg-white/90 border-white shadow-sm space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md">
                    📁 {selectedProductDetail.subcategory}
                  </span>
                  <span className={`text-[10px] font-bold ${selectedProductDetail.stock > 0 ? 'text-emerald-600 bg-emerald-50' : 'text-red-500 bg-red-50'} px-2.5 py-1 rounded-md`}>
                    {selectedProductDetail.stock > 0 ? `🟢 متوفر في المخزن: ${selectedProductDetail.stock}` : '🔴 غير متوفر حالياً'}
                  </span>
                </div>
                <h2 className="text-2xl md:text-3xl font-black text-gray-900 leading-tight">
                  {selectedProductDetail.title}
                </h2>
              </div>

              {/* Card 2: Pricing & Purchase Widget */}
              <div className="card-glass flat p-6 bg-gradient-to-tr from-indigo-500/5 to-purple-500/5 border-indigo-100/50 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-6">
                <div>
                  <span className="text-[10px] text-gray-400 block font-bold mb-0.5">السعر النقدي المعتمد</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black text-indigo-600">{formatProductPrice(selectedProductDetail.price)}</span>
                    <span className="text-xs font-bold text-gray-400">{currency === 'IQD' ? 'دينار عراقي' : 'بالدولار الأمريكي'}</span>
                  </div>
                </div>
                
                {/* Quantity selector */}
                <div className="flex items-center gap-4 bg-white p-2.5 rounded-xl border border-gray-200 shadow-sm">
                  <span className="text-xs font-bold text-gray-400 pr-1">الكمية:</span>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => setDetailQuantity(prev => Math.max(1, prev - 1))}
                      className="p-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-600 cursor-pointer transition-colors"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="text-sm font-extrabold w-6 text-center">{detailQuantity}</span>
                    <button 
                      onClick={() => setDetailQuantity(prev => Math.min(selectedProductDetail.stock, prev + 1))}
                      className="p-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-600 cursor-pointer transition-colors"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Card 3: Spec Table with Visual Icons */}
              <div className="card-glass flat p-6 md:p-8 bg-white/90 border-white shadow-sm space-y-4">
                <h3 className="font-extrabold text-sm text-gray-800 border-b pb-3 mb-2 flex items-center gap-2">
                  <span>⚙️ المواصفات الفنية والتقنية</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(selectedProductDetail.specs).map(([key, val]) => {
                    // Match key to icons
                    let Icon = Cpu;
                    const lkey = key.toLowerCase();
                    if (lkey.includes('معالج') || lkey.includes('cpu') || lkey.includes('processor')) {
                      Icon = Cpu;
                    } else if (lkey.includes('رام') || lkey.includes('ram') || lkey.includes('ذاكرة') || lkey.includes('memory')) {
                      Icon = Layers;
                    } else if (lkey.includes('تخزين') || lkey.includes('ssd') || lkey.includes('hdd') || lkey.includes('storage') || lkey.includes('هارد')) {
                      Icon = HardDrive;
                    } else if (lkey.includes('شاشة') || lkey.includes('display') || lkey.includes('screen') || lkey.includes('دقة')) {
                      Icon = Monitor;
                    } else if (lkey.includes('كرت') || lkey.includes('gpu') || lkey.includes('graphics') || lkey.includes('فيديو')) {
                      Icon = Flame;
                    }
                    return (
                      <div key={key} className="flex items-center gap-3 border-b pb-3 border-gray-100/50">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                          <Icon size={14} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-[10px] text-gray-400 font-bold block">{key}</span>
                          <span className="text-xs text-gray-800 font-extrabold truncate block">{val}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Card 4: Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => addToCartWithQty(selectedProductDetail, detailQuantity)}
                  disabled={selectedProductDetail.stock <= 0}
                  className="flex-1 btn-premium-primary justify-center py-3.5 text-sm cursor-pointer shadow-lg shadow-indigo-150/20"
                >
                  <ShoppingCart size={18} />
                  <span>إضافة لسلة التسوق</span>
                </button>
                
                <button 
                  onClick={() => {
                    const msgText = encodeURIComponent(
                      `مرحباً متجر الأسطورة للحاسبات 💻\n` +
                      `أود شراء هذا المنتج مباشرة:\n` +
                      `- ${selectedProductDetail.title} (الكمية: ${detailQuantity}) - $${selectedProductDetail.price * detailQuantity}\n` +
                      `رابط الصورة: ${selectedProductDetail.image_url}\n\n` +
                      `يرجى تأكيد الحجز والتوصيل!`
                    );
                    window.open(`https://wa.me/9647801814088?text=${msgText}`, '_blank');
                  }}
                  className="flex-1 btn-premium-glass justify-center py-3.5 text-sm cursor-pointer border-indigo-200/60 hover:bg-indigo-50/10 text-indigo-600"
                >
                  <MessageSquare size={18} />
                  <span>اطلب الآن عبر واتساب</span>
                </button>
              </div>

              {/* Card 5: Badges & Guarantees */}
              <div className="grid grid-cols-3 gap-4 pt-4">
                <div className="card-glass flat p-4 bg-white/60 border-white text-center space-y-1">
                  <ShieldCheck size={20} className="mx-auto text-indigo-600" />
                  <span className="text-[10px] font-black text-gray-800 block">ضمان لمدة سنة</span>
                  <span className="text-[8px] text-gray-400 block">ضمان حقيقي معتمد</span>
                </div>
                <div className="card-glass flat p-4 bg-white/60 border-white text-center space-y-1">
                  <Truck size={20} className="mx-auto text-indigo-600" />
                  <span className="text-[10px] font-black text-gray-800 block">توصيل سريع</span>
                  <span className="text-[8px] text-gray-400 block">لكافة محافظات العراق</span>
                </div>
                <div className="card-glass flat p-4 bg-white/60 border-white text-center space-y-1">
                  <RefreshCw size={20} className="mx-auto text-indigo-600" />
                  <span className="text-[10px] font-black text-gray-800 block">استبدال مجاني</span>
                  <span className="text-[8px] text-gray-400 block">خلال 7 أيام للعيوب</span>
                </div>
              </div>
            </div>
          </div>

          {/* Related products recommendation row */}
          {(() => {
            const related = products.filter(
              (p: Product) => p.category === selectedProductDetail.category && p.id !== selectedProductDetail.id
            ).slice(0, 4);
            if (related.length === 0) return null;
            return (
              <div className="mt-16 text-right">
                <h3 className="text-xl font-black mb-6 flex items-center gap-2 border-b pb-3 border-gray-200/40">
                  <span>✨ أجهزة ومنتجات قد تعجبك أيضاً</span>
                </h3>
                <div className="products-grid">
                  {related.map((prod: Product) => (
                    <div key={prod.id} className="card-glass flex flex-col justify-between overflow-hidden relative">
                      <div className="p-3.5">
                        <div 
                          onClick={() => { setSelectedProductDetail(prod); setDetailQuantity(1); }}
                          className="aspect-[16/10] rounded-xl overflow-hidden mb-4 bg-gray-50 border border-gray-100 relative group cursor-pointer"
                        >
                          <img src={prod.image_url} alt={prod.title} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500" />
                        </div>
                        <h4 
                          onClick={() => { setSelectedProductDetail(prod); setDetailQuantity(1); }}
                          className="font-extrabold text-sm text-gray-900 line-clamp-1 mb-1.5 cursor-pointer hover:text-indigo-600"
                        >
                          {prod.title}
                        </h4>
                        <div className="flex justify-between items-center mt-3">
                          <span className="text-indigo-650 font-black text-sm">{formatProductPrice(prod.price)}</span>
                          <span className="text-[10px] text-gray-400 font-bold">{prod.subcategory}</span>
                        </div>
                      </div>
                      <div className="p-3 bg-gray-50/50 border-t flex gap-2">
                        <button 
                          onClick={() => { setSelectedProductDetail(prod); setDetailQuantity(1); }}
                          className="flex-1 py-1.5 rounded-lg bg-white border border-gray-200 text-gray-600 text-[10px] font-bold text-center cursor-pointer hover:bg-gray-100"
                        >
                          عرض المواصفات
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </main>
      )}
      {/* Dedicated Cart & Checkout Page */}
      {activeTab === 'cart' && (
        <main className="container mx-auto px-6 py-12 flex-1 max-w-7xl">
          <div className="text-right mb-8">
            <h2 className="text-3xl font-black text-gray-900 flex items-center gap-3 justify-end">
              <span>سلة التسوق وإتمام الطلب</span>
              <ShoppingBag size={30} className="text-indigo-650" />
            </h2>
            <p className="text-xs text-gray-400 mt-1">راجع الأجهزة والملحقات المختارة، حدد تفاصيل العنوان وأجور التوصيل لإكمال طلبك.</p>
          </div>

          {cart.length === 0 ? (
            <div className="card-glass p-12 text-center text-gray-400 bg-white/70 max-w-xl mx-auto border-white/40 shadow-md">
              <ShoppingBag size={54} className="mx-auto mb-4 text-gray-300" />
              <h3 className="font-extrabold text-base text-gray-700 mb-2">سلة المشتريات فارغة حالياً</h3>
              <p className="text-xs mb-6">يرجى إضافة الأجهزة والملحقات المناسبة للبدء في إجراء الطلب.</p>
              <button 
                onClick={() => setActiveTab('home')}
                className="btn-premium-primary inline-flex justify-center cursor-pointer mx-auto text-xs"
              >
                <span>العودة لصفحة التسوق الرئيسية</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Right Column: Cart Items List */}
              <div className="lg:col-span-8 space-y-4">
                <div className="card-glass flat p-6 bg-white/90 border-white shadow-sm space-y-4 text-right">
                  <h3 className="font-extrabold text-sm text-gray-800 border-b pb-3 mb-2 flex items-center gap-2 justify-end">
                    <span>الأجهزة والملحقات المختارة ({cart.reduce((sum, item) => sum + item.quantity, 0)})</span>
                    <Package size={18} className="text-indigo-650" />
                  </h3>
                  
                  <div className="space-y-4 relative">
                    <AnimatePresence mode="popLayout">
                      {cart.map((item, idx) => (
                        <motion.div 
                          layout
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -50 }}
                          transition={{ type: "spring", damping: 28, stiffness: 220 }}
                          key={item.product.id} 
                          className="bg-gray-50/50 hover:bg-indigo-50/10 border border-gray-100/60 p-4 rounded-2xl flex flex-col sm:flex-row gap-4 items-center justify-between transition-all"
                        >
                          <div className="flex gap-4 items-center text-right w-full sm:w-auto">
                            <img 
                              src={item.product.image_url} 
                              alt={item.product.title} 
                              className="w-20 h-20 object-cover rounded-xl border border-gray-150 shadow-sm shrink-0"
                            />
                            <div>
                              <h4 className="font-extrabold text-sm text-gray-900 line-clamp-2">{item.product.title}</h4>
                              <span className="text-[10px] text-gray-400 font-bold block mt-1">المجموعة: {item.product.subcategory}</span>
                              <span className="text-xs text-indigo-650 font-black block mt-1">{formatProductPrice(item.product.price)}</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-200/50">
                            {/* Quantity control */}
                            <div className="flex items-center gap-1.5 bg-white border border-gray-200/80 rounded-xl p-1 shadow-sm">
                              <button onClick={() => updateCartQuantity(item.product.id, -1)} className="p-1.5 rounded-lg hover:bg-gray-50 text-gray-500 cursor-pointer transition-colors">
                                <Minus size={11} />
                              </button>
                              <span className="text-xs font-black px-2.5 text-gray-800">{item.quantity}</span>
                              <button onClick={() => updateCartQuantity(item.product.id, 1)} className="p-1.5 rounded-lg hover:bg-gray-50 text-gray-500 cursor-pointer transition-colors">
                                <Plus size={11} />
                              </button>
                            </div>

                            <div className="text-left font-black text-sm text-indigo-650 w-24">
                              {formatProductPrice(item.product.price * item.quantity)}
                            </div>

                            <button onClick={() => removeFromCart(item.product.id)} className="text-gray-400 hover:text-red-500 cursor-pointer transition-colors p-2 bg-white rounded-xl border border-gray-200/60 shadow-sm hover:border-red-200" title="إزالة من السلة">
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              {/* Left Column: Checkout Summary & Form */}
              <div className="lg:col-span-4 space-y-6">
                {/* Summary & Form Card */}
                <div className="card-glass flat p-6 bg-white/90 border-white shadow-sm space-y-5 text-right">
                  <h3 className="font-extrabold text-sm text-gray-800 border-b pb-3 mb-2 flex items-center gap-2 justify-end">
                    <span>ملخص الحساب وبيانات المستلم</span>
                    <Receipt size={18} className="text-indigo-650" />
                  </h3>

                  {/* Province custom dropdown */}
                  <div className="space-y-2 relative">
                    <label className="text-[10px] font-black text-gray-400 block flex items-center gap-1.5 justify-end">
                      <span>اختر محافظة التوصيل لحساب الأجور</span>
                      <Truck size={12} />
                    </label>
                    
                    <button
                      type="button"
                      onClick={() => setIsProvinceDropdownOpen(!isProvinceDropdownOpen)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 font-bold text-xs text-right flex justify-between items-center cursor-pointer transition-all hover:bg-gray-100 focus:ring-2 focus:ring-indigo-500/20"
                    >
                      <span className="flex items-center gap-1">
                        <MapPin size={12} className="text-indigo-650" />
                        {selectedProvince} (أجور التوصيل: {formatIQD(shippingRates[selectedProvince])})
                      </span>
                      <ChevronDown size={14} className={`text-gray-400 transition-transform ${isProvinceDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isProvinceDropdownOpen && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setIsProvinceDropdownOpen(false)} />
                        <div className="absolute right-0 bottom-full mb-2 w-full bg-white rounded-2xl shadow-xl border border-gray-100 p-2 z-20 max-h-48 overflow-y-auto space-y-1 text-right" dir="rtl">
                          {Object.keys(shippingRates).map(province => (
                            <button
                              key={province}
                              type="button"
                              onClick={() => { setSelectedProvince(province); setIsProvinceDropdownOpen(false); }}
                              className={`w-full text-right px-3 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer block ${selectedProvince === province ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-gray-50 text-gray-600'}`}
                            >
                              📍 {province} (أجور التوصيل: {formatIQD(shippingRates[province])})
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Invoice calculation breakdown */}
                  <div className="space-y-2 bg-gray-50/70 p-4 rounded-2xl border border-gray-150/50 text-xs font-bold">
                    <div className="flex justify-between items-center text-gray-500">
                      <span>مجموع قيمة الأجهزة:</span>
                      <span>{formatProductPrice(cartTotal)}</span>
                    </div>
                    <div className="flex justify-between items-center text-gray-500">
                      <span>تكلفة التوصيل إلى {selectedProvince}:</span>
                      <span>{formatIQD(deliveryCostIQD)}</span>
                    </div>
                    <div className="border-t border-gray-200 my-2"></div>
                    <div className="flex justify-between items-center text-sm font-black text-gray-900">
                      <span>الإجمالي المطلوب دفعه:</span>
                      <span className="text-indigo-650 text-lg">{formatProductPrice(finalCartTotal)}</span>
                    </div>
                  </div>

                  {/* Address info Form */}
                  <form onSubmit={handleCheckoutSubmit} className="space-y-3.5 pt-2">
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 block mb-1">الاسم الثلاثي الكامل *</label>
                      <input 
                        type="text" 
                        placeholder="اكتب اسمك الثلاثي لبطاقة الضمان"
                        required
                        value={checkoutForm.name}
                        onChange={e => setCheckoutForm(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-gray-400 block mb-1">رقم الهاتف المستلم *</label>
                      <input 
                        type="tel" 
                        placeholder="مثال: 07801814088"
                        required
                        value={checkoutForm.phone}
                        onChange={e => setCheckoutForm(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white text-left"
                        dir="ltr"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-gray-400 block mb-1">العنوان بالتفصيل *</label>
                      <textarea 
                        placeholder="المنطقة، الشارع، أقرب نقطة دالة، رقم الزقاق..."
                        required
                        rows={2}
                        value={checkoutForm.address}
                        onChange={e => setCheckoutForm(prev => ({ ...prev, address: e.target.value }))}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white"
                      />
                    </div>

                    <button 
                      type="submit" 
                      className="w-full btn-premium-primary justify-center py-3.5 text-xs flex items-center gap-2 cursor-pointer shadow-lg shadow-indigo-150/40 mt-4"
                    >
                      <span>تأكيد الطلب وإرسال عبر الواتساب</span>
                      <MessageSquare size={14} />
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}
        </main>
      )}

      {/* Admin Dashboard */}
      {activeTab === 'admin' && (
        <main className="container mx-auto px-6 py-12 flex-1 max-w-7xl">
          {!adminLoggedIn ? (
            <div className="max-w-sm mx-auto mt-16" dir="rtl">
              <div className="card-glass flat p-8 bg-white/90 border-white shadow-xl space-y-6 text-right">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-indigo-50 rounded-2xl flex items-center justify-center border border-indigo-100">
                    <UserCheck size={28} className="text-indigo-600" />
                  </div>
                  <h2 className="text-xl font-black text-gray-900 mb-1">بوابة لوحة التحكم</h2>
                  <p className="text-xs text-gray-400 font-bold">أدخل بيانات دخول المسؤول للمتابعة</p>
                </div>

                {lockoutUntil && Date.now() < lockoutUntil && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-center">
                    <p className="text-red-600 text-xs font-black">🔒 تم تأمين الدخول مؤقتاً بسبب محاولات خاطئة متعددة.</p>
                  </div>
                )}

                <form onSubmit={handleAdminLogin} className="space-y-4">
                  <div>
                    <label className="text-xs font-black text-gray-600 block mb-1.5">اسم المستخدم</label>
                    <input 
                      type="text"
                      placeholder="admin"
                      value={adminUsername}
                      onChange={e => setAdminUsername(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm font-bold bg-white"
                      autoComplete="username"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-black text-gray-600 block mb-1.5">كلمة المرور</label>
                    <input 
                      type="password"
                      placeholder="••••••••"
                      value={adminPassword}
                      onChange={e => setAdminPassword(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm font-bold bg-white"
                      autoComplete="current-password"
                    />
                  </div>
                  {loginAttempts > 0 && (
                    <p className="text-amber-600 text-xs font-bold">⚠️ بيانات خاطئة. المحاولات المتبقية: {5 - loginAttempts}</p>
                  )}
                  <button type="submit" className="w-full btn-premium-primary justify-center cursor-pointer mt-2">
                    دخول لوحة التحكم <UserCheck size={18} />
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div className="space-y-8 admin-page-enter">
              {/* Heading */}
              <div className="flex justify-between items-center border-b pb-4">
                <div>
                  <h2 className="text-2xl font-black">لوحة الإشراف والمبيعات ⚙️</h2>
                  <p className="text-xs text-gray-400">إدارة المنتجات، متابعة فواتير الواتساب، والتحقق من التزامن بقاعدة بيانات Neon</p>
                </div>
                <button onClick={() => setAdminLoggedIn(false)} className="btn-premium-glass text-xs py-2 px-4 cursor-pointer">
                  خروج المسؤول
                </button>
              </div>

              {/* Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="stat-card card-glass flat p-6 bg-gradient-to-tr from-indigo-500/5 to-purple-500/5 border-indigo-100 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-gray-400 font-bold block mb-1">إجمالي المبيعات الافتراضية</span>
                    <span className="text-2xl font-black text-indigo-700">${stats.total_sales}</span>
                  </div>
                  <div className="w-11 h-11 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shadow-sm">
                    <DollarSign size={20} />
                  </div>
                </div>

                <div className="stat-card card-glass flat p-6 bg-gradient-to-tr from-emerald-500/5 to-teal-500/5 border-emerald-100 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-gray-400 font-bold block mb-1">الطلبات الواردة</span>
                    <span className="text-2xl font-black text-emerald-700">{stats.orders_count}</span>
                  </div>
                  <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-sm">
                    <Package size={20} />
                  </div>
                </div>

                <div className="stat-card card-glass flat p-6 bg-gradient-to-tr from-cyan-500/5 to-blue-500/5 border-cyan-100 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-gray-400 font-bold block mb-1">الأجهزة المعروضة</span>
                    <span className="text-2xl font-black text-cyan-700">{stats.products_count}</span>
                  </div>
                  <div className="w-11 h-11 rounded-xl bg-cyan-100 text-cyan-600 flex items-center justify-center shadow-sm">
                    <Laptop size={20} />
                  </div>
                </div>
              </div>

              {/* Subtab Navigation */}
              <div className="flex gap-4 border-b border-gray-250/20 pb-3">
                <button 
                  onClick={() => setAdminSubTab('products')} 
                  className={`pb-2.5 text-sm font-extrabold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                    adminSubTab === 'products' ? 'border-indigo-650 text-indigo-650' : 'border-transparent text-gray-450 hover:text-gray-700'
                  }`}
                >
                  <span>📦 إدارة معروضات المتجر</span>
                </button>
                <button 
                  onClick={() => setAdminSubTab('orders')} 
                  className={`pb-2.5 text-sm font-extrabold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                    adminSubTab === 'orders' ? 'border-indigo-650 text-indigo-650' : 'border-transparent text-gray-450 hover:text-gray-700'
                  }`}
                >
                  <span>📋 سجل فواتير المبيعات والطلب</span>
                  {orders.length > 0 && (
                    <span className="bg-indigo-600 text-white text-[9px] px-2 py-0.5 rounded-full font-black">
                      {orders.length}
                    </span>
                  )}
                </button>
                <button 
                  onClick={() => setAdminSubTab('categories')} 
                  className={`pb-2.5 text-sm font-extrabold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                    adminSubTab === 'categories' ? 'border-indigo-650 text-indigo-650' : 'border-transparent text-gray-450 hover:text-gray-700'
                  }`}
                >
                  <span>📂 إدارة التصنيفات</span>
                </button>
                <button 
                  onClick={() => setAdminSubTab('shipping')} 
                  className={`pb-2.5 text-sm font-extrabold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                    adminSubTab === 'shipping' ? 'border-indigo-650 text-indigo-650' : 'border-transparent text-gray-450 hover:text-gray-700'
                  }`}
                >
                  <span>🚚 أجور التوصيل</span>
                </button>
                <button 
                  onClick={() => setAdminSubTab('settings')} 
                  className={`pb-2.5 text-sm font-extrabold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                    adminSubTab === 'settings' ? 'border-indigo-650 text-indigo-650' : 'border-transparent text-gray-450 hover:text-gray-700'
                  }`}
                >
                  <span>⚙️ الإعدادات</span>
                </button>
              </div>

              {/* Subtab 1: Products Management */}
              {adminSubTab === 'products' && (
                <div className="space-y-6">
                  {/* Catalog Header Actions */}
                  <div className="flex justify-between items-center bg-white/60 p-4 rounded-2xl border border-white shadow-sm">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-black text-gray-800">📋 إدارة المعروضات</span>
                      <span className="text-[10px] font-bold text-gray-500 bg-gray-50 px-2.5 py-1 rounded-md border border-gray-150">
                        العدد الكلي: {products.length} جهاز
                      </span>
                    </div>
                    <button 
                      onClick={() => {
                        setEditingProductId(null);
                        setAdminForm({
                          title: '',
                          category: 'laptop',
                          subcategory: 'gaming',
                          price: '',
                          image_url: '',
                          stock: '10'
                        });
                        setSpecList([
                          { key: 'المعالج (CPU)', value: '' },
                          { key: 'كرت الشاشة (GPU)', value: '' },
                          { key: 'الذاكرة (RAM)', value: '' },
                          { key: 'التخزين (SSD)', value: '' }
                        ]);
                        setIsAdminModalOpen(true);
                      }}
                      className="btn-premium-primary text-xs py-2.5 px-4 cursor-pointer flex items-center gap-1.5 shadow-md shadow-indigo-100"
                    >
                      <span>➕ إضافة منتج جديد للمتجر</span>
                    </button>
                  </div>

                  {/* Search, Filter & Sort Bar */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-white/60 p-4 rounded-3xl border border-gray-100 shadow-sm">
                    {/* Search Input */}
                    <div className="md:col-span-6 relative">
                      <input 
                        type="text" 
                        placeholder="🔍 ابحث بالاسم أو الموديل..."
                        value={adminSearchQuery}
                        onChange={e => setAdminSearchQuery(e.target.value)}
                        className="w-full pl-4 pr-10 py-3 rounded-2xl border border-gray-200 focus:ring-4 focus:ring-indigo-500/10 bg-white focus:outline-none font-bold text-xs text-right transition-all"
                      />
                    </div>

                     {/* Category & Subcategory Filter */}
                    <div className="md:col-span-3 relative">
                      <button
                        type="button"
                        onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
                        className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-white font-bold text-xs text-right flex justify-between items-center cursor-pointer transition-all hover:bg-gray-50 focus:ring-4 focus:ring-indigo-500/10"
                      >
                        <span>{
                          adminCategoryFilter === 'all' ? '📂 كل التصنيفات' :
                          adminCategoryFilter === 'laptop' ? '💻 كل أجهزة اللابتوب' :
                          adminCategoryFilter === 'accessory' ? '🔌 كل الإكسسوارات' :
                          categories.find(c => c.id === adminCategoryFilter)?.name || '📂 كل التصنيفات'
                        }</span>
                        <ChevronDown size={14} className={`text-gray-400 transition-transform ${isFilterDropdownOpen ? 'rotate-180' : ''}`} />
                      </button>

                      {isFilterDropdownOpen && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setIsFilterDropdownOpen(false)} />
                          <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 z-20 max-h-80 overflow-y-auto space-y-1 text-right" dir="rtl">
                            <button
                              type="button"
                              onClick={() => { setAdminCategoryFilter('all'); setIsFilterDropdownOpen(false); }}
                              className={`w-full text-right px-3 py-2 rounded-xl text-xs font-black transition-colors cursor-pointer block ${adminCategoryFilter === 'all' ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-gray-50 text-gray-700'}`}
                            >
                              📂 كل التصنيفات
                            </button>
                            
                            <div className="border-t border-gray-100 my-1"></div>
                            
                            <div className="px-3 py-1 text-[10px] font-black text-indigo-650 bg-indigo-50/40 rounded-md">💻 أجهزة اللابتوب</div>
                            <div className="mr-1.5 space-y-0.5 border-r border-indigo-100 pr-1.5 mt-1">
                              <button
                                type="button"
                                onClick={() => { setAdminCategoryFilter('laptop'); setIsFilterDropdownOpen(false); }}
                                className={`w-full text-right px-3 py-1.5 rounded-lg text-xs font-extrabold transition-colors cursor-pointer block ${adminCategoryFilter === 'laptop' ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-gray-50 text-gray-600'}`}
                              >
                                💻 كل أجهزة اللابتوب
                              </button>
                              {categories
                                .filter(c => c.type === 'laptop')
                                .map(cat => (
                                  <button
                                    key={cat.id}
                                    type="button"
                                    onClick={() => { setAdminCategoryFilter(cat.id); setIsFilterDropdownOpen(false); }}
                                    className={`w-full text-right px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer block ${adminCategoryFilter === cat.id ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-gray-50 text-gray-500'}`}
                                  >
                                    {cat.name}
                                  </button>
                                ))
                              }
                            </div>

                            <div className="border-t border-gray-100 my-1"></div>

                            <div className="px-3 py-1 text-[10px] font-black text-indigo-650 bg-indigo-50/40 rounded-md">🔌 الإكسسوارات والملحقات</div>
                            <div className="mr-1.5 space-y-0.5 border-r border-indigo-100 pr-1.5 mt-1">
                              <button
                                type="button"
                                onClick={() => { setAdminCategoryFilter('accessory'); setIsFilterDropdownOpen(false); }}
                                className={`w-full text-right px-3 py-1.5 rounded-lg text-xs font-extrabold transition-colors cursor-pointer block ${adminCategoryFilter === 'accessory' ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-gray-50 text-gray-600'}`}
                              >
                                🔌 كل الإكسسوارات
                              </button>
                              {categories
                                .filter(c => c.type === 'accessory')
                                .map(cat => (
                                  <button
                                    key={cat.id}
                                    type="button"
                                    onClick={() => { setAdminCategoryFilter(cat.id); setIsFilterDropdownOpen(false); }}
                                    className={`w-full text-right px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer block ${adminCategoryFilter === cat.id ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-gray-50 text-gray-500'}`}
                                  >
                                    {cat.name}
                                  </button>
                                ))
                              }
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Sort Selector */}
                    <div className="md:col-span-3 relative">
                      <button
                        type="button"
                        onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                        className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-white font-bold text-xs text-right flex justify-between items-center cursor-pointer transition-all hover:bg-gray-50 focus:ring-4 focus:ring-indigo-500/10"
                      >
                        <span>{
                          adminSortBy === 'all' ? '⏳ الترتيب الافتراضي' :
                          adminSortBy === 'title' ? '🔤 حسب الاسم (أبجدي)' :
                          adminSortBy === 'price-asc' ? '💵 السعر: من الأقل للأعلى' :
                          adminSortBy === 'price-desc' ? '💵 السعر: من الأعلى للأقل' :
                          adminSortBy === 'stock-desc' ? '📦 المخزون: الأكثر أولاً' : '⏳ الترتيب الافتراضي'
                        }</span>
                        <ChevronDown size={14} className={`text-gray-400 transition-transform ${isSortDropdownOpen ? 'rotate-180' : ''}`} />
                      </button>

                      {isSortDropdownOpen && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setIsSortDropdownOpen(false)} />
                          <div className="absolute right-0 top-full mt-2 w-full bg-white rounded-2xl shadow-xl border border-gray-100 p-2 z-20 space-y-1 text-right" dir="rtl">
                            <button
                              type="button"
                              onClick={() => { setAdminSortBy('all'); setIsSortDropdownOpen(false); }}
                              className={`w-full text-right px-3 py-2 rounded-xl text-xs font-black transition-colors cursor-pointer block ${adminSortBy === 'all' ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-gray-50 text-gray-700'}`}
                            >
                              ⏳ الترتيب الافتراضي
                            </button>
                            <button
                              type="button"
                              onClick={() => { setAdminSortBy('title'); setIsSortDropdownOpen(false); }}
                              className={`w-full text-right px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer block ${adminSortBy === 'title' ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-gray-50 text-gray-700'}`}
                            >
                              🔤 حسب الاسم (أبجدي)
                            </button>
                            <button
                              type="button"
                              onClick={() => { setAdminSortBy('price-asc'); setIsSortDropdownOpen(false); }}
                              className={`w-full text-right px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer block ${adminSortBy === 'price-asc' ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-gray-50 text-gray-700'}`}
                            >
                              💵 السعر: من الأقل للأعلى
                            </button>
                            <button
                              type="button"
                              onClick={() => { setAdminSortBy('price-desc'); setIsSortDropdownOpen(false); }}
                              className={`w-full text-right px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer block ${adminSortBy === 'price-desc' ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-gray-50 text-gray-700'}`}
                            >
                              💵 السعر: من الأعلى للأقل
                            </button>
                            <button
                              type="button"
                              onClick={() => { setAdminSortBy('stock-desc'); setIsSortDropdownOpen(false); }}
                              className={`w-full text-right px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer block ${adminSortBy === 'stock-desc' ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-gray-50 text-gray-700'}`}
                            >
                              📦 المخزون: الأكثر أولاً
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Full-width Products List - Clean Modern Rows */}
                  {(() => {
                    const filtered = products.filter(p => {
                      const matchesSearch = p.title.toLowerCase().includes(adminSearchQuery.toLowerCase()) || 
                                            p.subcategory.toLowerCase().includes(adminSearchQuery.toLowerCase());
                      const matchesCategory = adminCategoryFilter === 'all' || 
                                              p.category === adminCategoryFilter || 
                                              p.subcategory === adminCategoryFilter;
                      return matchesSearch && matchesCategory;
                    }).sort((a, b) => {
                      if (adminSortBy === 'title') return a.title.localeCompare(b.title);
                      if (adminSortBy === 'price-asc') return a.price - b.price;
                      if (adminSortBy === 'price-desc') return b.price - a.price;
                      if (adminSortBy === 'stock-desc') return b.stock - a.stock;
                      return 0;
                    });

                    if (filtered.length === 0) {
                      return (
                        <div className="card-glass flat p-12 text-center text-gray-400 text-xs font-semibold bg-white/70">
                          🔍 لم يتم العثور على أي أجهزة تطابق خيارات البحث الحالية.
                        </div>
                      );
                    }

                    return (
                      <div className="space-y-3.5">
                        {filtered.map(p => (
                          <div key={p.id} className="admin-table-row card-glass flat bg-white/95 border-white shadow-sm p-4 flex flex-col md:flex-row items-center justify-between gap-4 text-right hover:border-indigo-150 transition-all duration-300">
                            {/* Image + Title Section */}
                            <div className="flex items-center gap-4 w-full md:w-auto">
                              <img 
                                src={p.image_url} 
                                alt={p.title} 
                                className="w-16 h-11 object-cover rounded-xl border border-gray-150 shadow-sm bg-gray-50 shrink-0" 
                              />
                              <div className="min-w-0">
                                <h4 className="font-black text-gray-900 text-sm md:text-base line-clamp-1">{p.title}</h4>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-[9px] font-black text-indigo-650 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100/50">
                                    {p.category === 'laptop' ? '💻 لابتوب' : '🔌 ملحق'}
                                  </span>
                                  <span className="text-[9px] font-bold text-gray-400">({p.subcategory})</span>
                                </div>
                              </div>
                            </div>

                            {/* Price, Stock and Actions */}
                            <div className="flex flex-wrap items-center justify-between md:justify-end gap-6 w-full md:w-auto border-t md:border-t-0 pt-3 md:pt-0">
                              {/* Price */}
                              <div className="text-right">
                                <span className="text-[10px] text-gray-400 block font-bold">السعر بالدولار</span>
                                <span className="font-black text-indigo-600 text-base">${p.price}</span>
                              </div>

                              {/* Stock status */}
                              <div className="text-right">
                                <span className="text-[10px] text-gray-400 block font-bold">المخزون المتوفر</span>
                                <span className={`inline-block font-extrabold text-xs px-2.5 py-0.5 rounded-full mt-0.5 ${p.stock > 0 ? 'text-gray-700 bg-gray-100 border border-gray-250' : 'text-red-500 bg-red-50 border border-red-100'}`}>
                                  {p.stock} {p.stock > 0 ? 'أجهزة متوفرة' : 'نفذت الكمية'}
                                </span>
                              </div>

                              {/* Action Buttons */}
                              <div className="flex gap-2">
                                <button 
                                  onClick={() => handleEditClick(p)} 
                                  className="py-2 px-3 text-indigo-650 hover:bg-indigo-50 border border-indigo-100 rounded-xl cursor-pointer transition-all flex items-center gap-1.5 font-bold text-xs shadow-sm bg-white"
                                  title="تعديل تفاصيل ومواصفات الجهاز"
                                >
                                  <Edit3 size={13} />
                                  <span>تعديل</span>
                                </button>
                                <button 
                                  onClick={() => handleDeleteProduct(p.id)} 
                                  className="py-2 px-3 text-red-500 hover:bg-red-50 border border-red-100 rounded-xl cursor-pointer transition-all flex items-center gap-1.5 font-bold text-xs shadow-sm bg-white"
                                  title="إزالة الجهاز نهائياً"
                                >
                                  <Trash2 size={13} />
                                  <span>حذف</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}


                </div>
              )}

              {/* Subtab 2: Orders Management */}
              {adminSubTab === 'orders' && (
                <div className="card-glass flat p-6 bg-white/90 border-white shadow-sm space-y-6">
                  <div className="flex justify-between items-center border-b pb-3 mb-4">
                    <h3 className="font-extrabold text-sm text-gray-800">قائمة فواتير وطلبات الزبائن الواردة</h3>
                    <span className="text-[10px] font-bold text-gray-500 bg-gray-50 px-2.5 py-1 rounded-md border border-gray-150">
                      إجمالي الطلبات: {orders.length} طلب
                    </span>
                  </div>

                  {orders.length === 0 ? (
                    <p className="text-gray-500 text-center py-12 text-xs">لم يتم استلام أي طلبات شراء من الزبائن بعد.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {orders.map((o: any) => {
                        const cleanPhone = o.customer_phone.startsWith('0') ? '964' + o.customer_phone.slice(1) : o.customer_phone;
                        const whatsAppMsg = encodeURIComponent(
                          `مرحباً أستاذ ${o.customer_name} 💻\n` +
                          `معك إدارة متجر الأسطورة للحاسبات بخصوص طلبك رقم #${o.id} بقيمة $${o.total_price}.\n` +
                          `نود تأكيد الطلب وعنوان التوصيل: (${o.customer_address}) لإرسال المنتج مباشرة!`
                        );
                          return (
                          <div key={o.id} className="order-card card-glass border-gray-150/60 p-5 bg-white/95 flex flex-col justify-between shadow-sm space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div>
                              {/* Receipt Header */}
                              <div className="flex justify-between items-start border-b border-gray-100 pb-3">
                                <div>
                                  <span className="font-black text-gray-900 text-xs block">👤 العميل: {o.customer_name}</span>
                                  <span className="text-[9px] text-gray-400 block mt-0.5">🗓️ التاريخ: {new Date(o.created_at).toLocaleString('ar-EG')}</span>
                                </div>
                                <div className="text-left">
                                  <span className="bg-indigo-50 text-indigo-650 text-[9px] font-extrabold px-2 py-0.5 rounded-full block mb-1">
                                    فاتورة رقم #{o.id}
                                  </span>
                                  <span className="text-base font-black text-indigo-600">${o.total_price}</span>
                                </div>
                              </div>

                              {/* Customer info */}
                              <div className="text-xs text-gray-650 space-y-1.5 py-3 border-b border-gray-100/50">
                                <div className="flex gap-2">
                                  <span className="text-gray-450">📞 رقم الهاتف:</span>
                                  <span className="font-bold text-gray-800" dir="ltr">{o.customer_phone}</span>
                                </div>
                                <div className="flex gap-2">
                                  <span className="text-gray-450">📍 العنوان:</span>
                                  <span className="font-bold text-gray-800">{o.customer_address}</span>
                                </div>
                              </div>

                              {/* Items list */}
                              <div className="pt-3">
                                <span className="text-[10px] text-gray-400 font-bold block mb-2">📋 تفاصيل السلة المشترات:</span>
                                <ul className="space-y-1.5 text-xs text-gray-650">
                                  {o.items.map((item: any, idx: number) => (
                                    <li key={idx} className="flex justify-between items-center bg-gray-50/50 p-2 rounded-lg border border-gray-100">
                                      <span className="font-bold text-gray-800">{item.title}</span>
                                      <span className="text-[10px] text-gray-400 font-bold">
                                        {item.quantity} × ${item.price}
                                      </span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>

                            {/* Contact Action */}
                            <div className="pt-2">
                              <a 
                                href={`https://wa.me/${cleanPhone}?text=${whatsAppMsg}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 text-white font-extrabold text-xs shadow-md hover:shadow-lg transition-all cursor-pointer"
                              >
                                <MessageSquare size={14} />
                                <span>تواصل لتأكيد الفاتورة بالواتساب</span>
                              </a>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Subtab 3: Categories Management */}
              {adminSubTab === 'categories' && (
                <div className="space-y-6">
                  {/* Category Header Actions */}
                  <div className="flex justify-between items-center bg-white/60 p-4 rounded-2xl border border-white shadow-sm">
                    <span className="text-xs font-black text-gray-800">📂 إدارة أقسام وتصنيفات المتجر</span>
                    <button
                      onClick={() => {
                        setEditingCategory({ id: '', name: '', type: 'laptop', isNew: true });
                        setIsCategoryModalOpen(true);
                      }}
                      className="btn-premium-primary text-xs py-2.5 px-4 cursor-pointer flex items-center gap-1.5 shadow-md shadow-indigo-100 animate-pulse hover:animate-none"
                    >
                      <span>➕ إضافة تصنيف فرعي جديد</span>
                    </button>
                  </div>

                  {/* Category stats dashboard overview */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Laptops Main Category Card */}
                    <div className="card-glass flat p-6 bg-white/95 border-indigo-100 shadow-sm space-y-4">
                      <div className="flex items-center gap-3 border-b pb-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-inner">
                          <Laptop size={22} />
                        </div>
                        <div>
                          <h3 className="font-black text-gray-900 text-base">💻 أجهزة اللابتوب</h3>
                          <span className="text-[10px] text-gray-400 font-bold block">إجمالي المعروض: {products.filter(p => p.category === 'laptop').length} جهاز</span>
                        </div>
                      </div>

                      <div className="space-y-2.5">
                        {categories
                          .filter(c => c.type === 'laptop')
                          .map(sub => {
                            const count = products.filter(p => p.subcategory === sub.id).length;
                            return (
                              <div key={sub.id} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-indigo-50/30 transition-all group">
                                <span className="font-bold text-xs text-gray-800">{sub.name}</span>
                                <div className="flex items-center gap-3">
                                  <span className="text-[10px] font-black text-indigo-650 bg-indigo-50 px-2 py-0.5 rounded-md">{count} أجهزة</span>
                                  <button
                                    onClick={() => {
                                      setAdminCategoryFilter(sub.id);
                                      setAdminSubTab('products');
                                    }}
                                    className="text-[10px] font-bold text-indigo-600 hover:underline cursor-pointer"
                                    title="عرض الأجهزة المعروضة في هذا القسم"
                                  >
                                    عرض الأجهزة 🔍
                                  </button>
                                  <div className="flex gap-1 border-r pr-2 border-gray-200">
                                    <button
                                      onClick={() => {
                                        setEditingCategory({ id: sub.id, name: sub.name, type: 'laptop', isNew: false });
                                        setIsCategoryModalOpen(true);
                                      }}
                                      className="p-1 text-indigo-650 hover:bg-indigo-50 rounded cursor-pointer transition-all"
                                      title="تعديل اسم التصنيف"
                                    >
                                      <Edit3 size={11} />
                                    </button>
                                    <button
                                      onClick={() => {
                                        if (count > 0) {
                                          alert(`لا يمكن حذف هذا التصنيف لأنه يحتوي على ${count} أجهزة معروضة حالياً! يرجى نقل أو حذف الأجهزة أولاً.`);
                                          return;
                                        }
                                        if (confirm(`هل أنت متأكد من حذف تصنيف (${sub.name}) نهائياً؟`)) {
                                          setCategories(prev => prev.filter(c => c.id !== sub.id));
                                        }
                                      }}
                                      className="p-1 text-red-500 hover:bg-red-50 rounded cursor-pointer transition-all"
                                      title="حذف التصنيف"
                                    >
                                      <Trash2 size={11} />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </div>

                    {/* Accessories Main Category Card */}
                    <div className="card-glass flat p-6 bg-white/95 border-indigo-100 shadow-sm space-y-4">
                      <div className="flex items-center gap-3 border-b pb-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-inner">
                          <Package size={22} />
                        </div>
                        <div>
                          <h3 className="font-black text-gray-900 text-base">🔌 الإكسسوارات والملحقات</h3>
                          <span className="text-[10px] text-gray-400 font-bold block">إجمالي المعروض: {products.filter(p => p.category === 'accessory').length} ملحق</span>
                        </div>
                      </div>

                      <div className="space-y-2.5">
                        {categories
                          .filter(c => c.type === 'accessory')
                          .map(sub => {
                            const count = products.filter(p => p.subcategory === sub.id).length;
                            return (
                              <div key={sub.id} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-indigo-50/30 transition-all group">
                                <span className="font-bold text-xs text-gray-800">{sub.name}</span>
                                <div className="flex items-center gap-3">
                                  <span className="text-[10px] font-black text-indigo-650 bg-indigo-50 px-2 py-0.5 rounded-md">{count} ملحقات</span>
                                  <button
                                    onClick={() => {
                                      setAdminCategoryFilter(sub.id);
                                      setAdminSubTab('products');
                                    }}
                                    className="text-[10px] font-bold text-indigo-600 hover:underline cursor-pointer"
                                    title="عرض الملحقات المعروضة في هذا القسم"
                                  >
                                    عرض الأجهزة 🔍
                                  </button>
                                  <div className="flex gap-1 border-r pr-2 border-gray-200">
                                    <button
                                      onClick={() => {
                                        setEditingCategory({ id: sub.id, name: sub.name, type: 'accessory', isNew: false });
                                        setIsCategoryModalOpen(true);
                                      }}
                                      className="p-1 text-indigo-650 hover:bg-indigo-50 rounded cursor-pointer transition-all"
                                      title="تعديل اسم التصنيف"
                                    >
                                      <Edit3 size={11} />
                                    </button>
                                    <button
                                      onClick={() => {
                                        if (count > 0) {
                                          alert(`لا يمكن حذف هذا التصنيف لأنه يحتوي على ${count} ملحقات معروضة حالياً! يرجى نقل أو حذف الأجهزة أولاً.`);
                                          return;
                                        }
                                        if (confirm(`هل أنت متأكد من حذف تصنيف (${sub.name}) نهائياً؟`)) {
                                          setCategories(prev => prev.filter(c => c.id !== sub.id));
                                        }
                                      }}
                                      className="p-1 text-red-500 hover:bg-red-50 rounded cursor-pointer transition-all"
                                      title="حذف التصنيف"
                                    >
                                      <Trash2 size={11} />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Add/Edit Category Modal Overlay */}
              {isCategoryModalOpen && editingCategory && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                  {/* Backdrop overlay */}
                  <div 
                    className="modal-overlay fixed inset-0 bg-slate-900/45 backdrop-blur-md cursor-pointer"
                    onClick={() => setIsCategoryModalOpen(false)}
                  />
                  
                  {/* Modal Dialog Box */}
                  <div className="modal-box bg-white rounded-3xl max-w-md w-full p-6 border shadow-2xl relative space-y-5 text-right z-10" dir="rtl">
                    <div className="flex justify-between items-center border-b pb-4">
                      <h3 className="text-base font-black text-gray-800 flex items-center gap-2">
                        <Edit3 size={18} className="text-indigo-600" />
                        <span>{editingCategory.isNew ? 'إضافة تصنيف فرعي جديد' : 'تعديل التصنيف الفرعي'}</span>
                      </h3>
                      <button 
                        type="button"
                        onClick={() => setIsCategoryModalOpen(false)}
                        className="w-8 h-8 rounded-full bg-gray-50 hover:bg-gray-100 text-gray-500 flex items-center justify-center cursor-pointer transition-all border border-gray-150"
                      >
                        ✕
                      </button>
                    </div>

                    <form onSubmit={(e) => {
                      e.preventDefault();
                      if (editingCategory.isNew) {
                        // Check if ID already exists
                        if (categories.some(c => c.id === editingCategory.id)) {
                          alert("معرف التصنيف هذا موجود بالفعل! يرجى استخدام معرف فريد.");
                          return;
                        }
                        setCategories(prev => [...prev, { id: editingCategory.id, name: editingCategory.name, type: editingCategory.type }]);
                      } else {
                        setCategories(prev => prev.map(c => c.id === editingCategory.id ? { ...c, name: editingCategory.name, type: editingCategory.type } : c));
                      }
                      setIsCategoryModalOpen(false);
                    }} className="space-y-4 text-right">
                      {editingCategory.isNew && (
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-black text-gray-700">المُعرّف بالإنجليزية (ID - فريد ولا يمكن تعديله لاحقاً) *</label>
                          <input
                            type="text"
                            placeholder="مثال: gpu أو speaker"
                            required
                            value={editingCategory.id}
                            onChange={e => setEditingCategory(prev => prev ? { ...prev, id: e.target.value.toLowerCase().replace(/\s+/g, '') } : null)}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500/20 bg-white focus:outline-none font-bold text-xs text-right"
                          />
                        </div>
                      )}

                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-black text-gray-700">اسم التصنيف (بالعربية مع الإيموجي) *</label>
                        <input
                          type="text"
                          placeholder="مثال: 🎮 كروت شاشة - GPU"
                          required
                          value={editingCategory.name}
                          onChange={e => setEditingCategory(prev => prev ? { ...prev, name: e.target.value } : null)}
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500/20 bg-white focus:outline-none font-bold text-xs text-right"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-black text-gray-700">التصنيف الرئيسي التابع له</label>
                        <select
                          value={editingCategory.type}
                          onChange={e => setEditingCategory(prev => prev ? { ...prev, type: e.target.value as any } : null)}
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500/20 bg-white focus:outline-none font-bold text-xs text-right"
                        >
                          <option value="laptop">💻 لابتوب</option>
                          <option value="accessory">🔌 إكسسوار</option>
                        </select>
                      </div>

                      <button type="submit" className="w-full btn-premium-primary justify-center py-3 text-xs flex items-center gap-2 cursor-pointer mt-4">
                        <span>حفظ التصنيف</span>
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {/* Subtab 4: Shipping Rates Management */}
              {adminSubTab === 'shipping' && (
                <div className="card-glass flat p-6 bg-white/90 border-white shadow-sm space-y-6 animate-fadeIn" dir="rtl">
                  <div className="flex justify-between items-center border-b pb-3 mb-2">
                    <div>
                      <h3 className="font-extrabold text-sm text-gray-800">🚚 ضبط أجور التوصيل للمحافظات العراقية</h3>
                      <p className="text-[10px] text-gray-400 font-bold mt-1">قم بتعديل تكلفة التوصيل لكل محافظة بشكل فردي، أو طبّق سعراً موحداً على عدة محافظات دفعة واحدة.</p>
                    </div>
                    <span className="text-[10px] font-black text-indigo-650 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-md shrink-0">
                      العراق: {Object.keys(shippingRates).length} محافظة
                    </span>
                  </div>

                  {/* Bulk Rate Tool */}
                  <div className="bg-indigo-50/60 border border-indigo-100 rounded-2xl p-4 space-y-3">
                    <h4 className="font-extrabold text-xs text-indigo-700">⚡ تطبيق سعر موحد على محافظات مختارة</h4>
                    <div className="flex flex-wrap gap-2">
                      {Object.keys(shippingRates).map(province => (
                        <button
                          key={province}
                          type="button"
                          onClick={() => setBulkShippingSelected(prev =>
                            prev.includes(province) ? prev.filter(p => p !== province) : [...prev, province]
                          )}
                          className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border cursor-pointer transition-all ${
                            bulkShippingSelected.includes(province)
                              ? 'bg-indigo-600 text-white border-indigo-600'
                              : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-400'
                          }`}
                        >
                          {province}
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-2 items-center">
                      <input
                        type="number"
                        min="0"
                        placeholder="أدخل السعر بالدينار العراقي..."
                        value={bulkShippingRate}
                        onChange={e => setBulkShippingRate(e.target.value)}
                        className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-xs font-bold bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      />
                      <span className="text-[10px] font-bold text-gray-400 shrink-0">د.ع</span>
                      <button
                        type="button"
                        disabled={!bulkShippingRate || bulkShippingSelected.length === 0}
                        onClick={() => {
                          const rate = parseFloat(bulkShippingRate) || 0;
                          const updated: Record<string, number> = {};
                          bulkShippingSelected.forEach(p => { updated[p] = rate; });
                          setShippingRates(prev => ({ ...prev, ...updated }));
                          setBulkShippingSelected([]);
                          setBulkShippingRate('');
                        }}
                        className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-black cursor-pointer hover:bg-indigo-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        تطبيق على {bulkShippingSelected.length} محافظة
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {Object.entries(shippingRates).map(([province, rate]) => (
                      <div key={province} className="flex items-center justify-between p-3.5 rounded-2xl border border-gray-100 bg-gray-50/50 hover:bg-indigo-50/10 hover:border-indigo-150 transition-all">
                        <span className="font-black text-xs text-gray-700">📍 {province}</span>
                        <div className="flex items-center gap-1.5">
                          <input 
                            type="number" 
                            min="0"
                            value={rate}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value) || 0;
                              setShippingRates(prev => ({ ...prev, [province]: val }));
                            }}
                            className="w-20 px-2.5 py-1.5 rounded-xl border border-gray-200 text-center font-bold text-xs bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                          />
                          <span className="text-[10px] font-bold text-gray-400">د.ع</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Subtab 5: Settings */}
              {adminSubTab === 'settings' && (
                <div className="space-y-6 animate-fadeIn" dir="rtl">

                  {/* Currency & Exchange Rate */}
                  <div className="card-glass flat p-6 bg-white/90 border-white shadow-sm space-y-5">
                    <h3 className="font-extrabold text-sm text-gray-800 border-b pb-3">💱 إعدادات العملة وسعر الصرف</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-1.5">
                        <label className="text-xs font-black text-gray-700">عملة التسعير (عند إضافة المنتجات)</label>
                        <select
                          value={productPricingCurrency}
                          onChange={e => setProductPricingCurrency(e.target.value as 'USD' | 'IQD')}
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold text-xs bg-white"
                        >
                          <option value="USD">🇺🇸 دولار أمريكي (USD)</option>
                          <option value="IQD">🇮🇶 دينار عراقي (IQD)</option>
                        </select>
                        <p className="text-[10px] text-gray-400">بهذه العملة يتم إدخال أسعار المنتجات في النظام.</p>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-black text-gray-700">سعر صرف الدولار (1 USD = ? IQD)</label>
                        <input
                          type="number"
                          min="1"
                          value={exchangeRate}
                          onChange={e => setExchangeRate(parseFloat(e.target.value) || 1480)}
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold text-xs bg-white"
                        />
                        <p className="text-[10px] text-gray-400">مثال: الدولار = {exchangeRate.toLocaleString('ar-IQ')} دينار</p>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-3 text-xs font-bold text-gray-600">
                      معاينة التحويل: $100 = {(100 * exchangeRate).toLocaleString('ar-IQ')} د.ع
                    </div>
                  </div>

                  {/* Admin Credentials */}
                  <div className="card-glass flat p-6 bg-white/90 border-white shadow-sm space-y-5">
                    <h3 className="font-extrabold text-sm text-gray-800 border-b pb-3">🔐 تغيير بيانات دخول المسؤول</h3>
                    
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                      <p className="text-xs text-amber-700 font-bold">⚠️ احتفظ ببيانات الدخول في مكان آمن. لا يمكن استرجاعها تلقائياً.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-1.5">
                        <label className="text-xs font-black text-gray-700">اسم المستخدم الجديد</label>
                        <input
                          type="text"
                          placeholder={`الحالي: ${savedAdminUser}`}
                          value={newAdminUser}
                          onChange={e => setNewAdminUser(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold text-xs bg-white"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-black text-gray-700">كلمة المرور الجديدة</label>
                        <input
                          type="password"
                          placeholder="أدخل كلمة المرور الجديدة..."
                          value={newAdminPass}
                          onChange={e => setNewAdminPass(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold text-xs bg-white"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-gray-700">تأكيد كلمة المرور الجديدة</label>
                      <input
                        type="password"
                        placeholder="أعد إدخال كلمة المرور للتأكيد..."
                        value={newAdminPassConfirm}
                        onChange={e => setNewAdminPassConfirm(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold text-xs bg-white"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (!newAdminUser && !newAdminPass) {
                          alert('أدخل اسم المستخدم أو كلمة المرور الجديدة على الأقل.');
                          return;
                        }
                        if (newAdminPass && newAdminPass !== newAdminPassConfirm) {
                          alert('كلمتا المرور غير متطابقتين!');
                          return;
                        }
                        if (newAdminPass && newAdminPass.length < 6) {
                          alert('يجب أن تكون كلمة المرور 6 أحرف على الأقل.');
                          return;
                        }
                        updateAdminCredentials(newAdminUser, newAdminPass);
                        setNewAdminUser('');
                        setNewAdminPass('');
                        setNewAdminPassConfirm('');
                        alert('✅ تم حفظ بيانات الدخول الجديدة بنجاح!');
                      }}
                      className="btn-premium-primary text-xs py-3 px-6 cursor-pointer"
                    >
                      حفظ بيانات الدخول الجديدة 🔐
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      )}

      {/* Footer */}
      <footer className="card-glass flat mx-4 md:mx-12 mt-auto mb-4 p-8 border-white bg-white/70">
        <div className="container mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-3 gap-8 text-right">
          <div>
            <h3 className="font-black text-lg text-indigo-600 mb-3">متجر الأسطورة للحاسبات</h3>
            <p className="text-gray-500 text-xs">نوفر لك أرقى تشكيلة من الحواسيب المحمولة والألعاب والإكسسوارات الاحترافية مع خدمات توصيل سريعة ودعم فني متميز في العراق.</p>
          </div>
          <div>
            <h3 className="font-bold text-gray-800 mb-3 text-sm">العنوان والتواصل</h3>
            <ul className="text-gray-500 text-xs space-y-2">
              <li>📍 بغداد، شارع الصناعة، مجمع الحاسبات</li>
              <li>📞 هاتف المتجر: +964 780 181 4088</li>
              <li>⏰ التوصيل متوفر لكافة محافظات العراق</li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-gray-800 mb-3 text-sm">روابط سريعة</h3>
            <div className="flex gap-4 flex-wrap text-xs font-bold">
              <button onClick={() => { setActiveTab('home'); }} className="text-indigo-600 hover:underline cursor-pointer">الرئيسية</button>
              <button onClick={() => { setActiveTab('laptops'); }} className="text-indigo-600 hover:underline cursor-pointer">اللابتوبات</button>
              <button onClick={() => { setActiveTab('accessories'); }} className="text-indigo-600 hover:underline cursor-pointer">الملحقات</button>
              <button onClick={() => { setActiveTab('smart-finder'); }} className="text-indigo-600 hover:underline cursor-pointer">المساعد الذكي</button>
              <button onClick={() => { setActiveTab('contact'); }} className="text-indigo-600 hover:underline cursor-pointer">اتصل بنا</button>
            </div>
          </div>
        </div>
      </footer>

      {/* Compare indicator — subtle badge instead of floating widget */}
      {compareList.length > 0 && (
        <div className="fixed bottom-4 right-4 z-40">
          <AnimatePresence>
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={() => compareList.length >= 1 && setQuickViewProduct(compareList[0])}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-2xl shadow-lg text-xs font-black cursor-pointer hover:bg-indigo-700 transition-all"
            >
              <ArrowLeftRight size={14} />
              <span>مقارنة {compareList.length}/2</span>
              <button
                onClick={(e) => { e.stopPropagation(); setCompareList([]); }}
                className="mr-1 text-indigo-200 hover:text-white cursor-pointer"
              >
                <X size={12} />
              </button>
            </motion.button>
          </AnimatePresence>
        </div>
      )}

      {/* Quick View & Comparison Modal combined */}
      {quickViewProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
          <div className="card-glass max-w-2xl w-full bg-white p-6 max-h-[90vh] overflow-y-auto relative border-gray-100">
            <button 
              onClick={() => setQuickViewProduct(null)}
              className="absolute top-4 left-4 p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-all cursor-pointer"
            >
              <X size={20} />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div>
                <img 
                  src={quickViewProduct.image_url} 
                  alt={quickViewProduct.title}
                  className="w-full h-56 object-cover rounded-2xl border"
                />
              </div>
              <div className="flex flex-col justify-between">
                <div>
                  <span className="bg-indigo-50 text-indigo-600 text-[10px] font-bold px-2.5 py-0.5 rounded-full mb-2 inline-block">
                    {quickViewProduct.category === 'laptop' ? 'لابتوب' : 'ملحق'} - {quickViewProduct.subcategory}
                  </span>
                  <h3 className="text-xl font-black text-gray-900 mb-2">{quickViewProduct.title}</h3>
                  <p className="text-2xl font-black text-indigo-600 mb-4">{formatProductPrice(quickViewProduct.price)}</p>
                  
                  <div className="space-y-2 border-t pt-4 text-xs">
                    <span className="font-bold text-gray-700 block mb-2">المواصفات الفنية:</span>
                    {Object.entries(quickViewProduct.specs).map(([key, val]) => (
                      <div key={key} className="flex justify-between border-b pb-1.5 border-gray-50">
                        <span className="text-gray-400 font-bold">{key}:</span>
                        <span className="text-gray-800 font-extrabold">{val}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6">
                  <button 
                    onClick={() => { addToCart(quickViewProduct); setQuickViewProduct(null); }}
                    className="w-full btn-premium-primary justify-center cursor-pointer"
                    disabled={quickViewProduct.stock <= 0}
                  >
                    أضف إلى سلة التسوق <ShoppingCart size={18} />
                  </button>
                </div>
              </div>
            </div>

            {/* Side-by-side spec comparison if 2 items selected */}
            {compareList.length === 2 && compareList.some(p => p.id === quickViewProduct.id) && (
              <div className="mt-8 border-t pt-6 text-right">
                <h4 className="font-black text-gray-800 mb-4 flex items-center gap-2">
                  <ArrowLeftRight size={16} className="text-indigo-600" />
                  جدول مقارنة المواصفات المباشر
                </h4>
                <div className="grid grid-cols-2 gap-4 text-xs bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <div>
                    <span className="font-extrabold text-indigo-600 block mb-1">{quickViewProduct.title}</span>
                    <span className="text-base font-black block mb-3 text-indigo-700">${quickViewProduct.price}</span>
                    {Object.entries(quickViewProduct.specs).map(([key, val]) => (
                      <div key={key} className="mb-2">
                        <span className="text-[10px] text-gray-400 block font-bold">{key}</span>
                        <span className="font-bold text-gray-700">{val}</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-r pr-4 border-gray-200">
                    {(() => {
                      const other = compareList.find((p: Product) => p.id !== quickViewProduct.id)!;
                      return (
                        <>
                          <span className="font-extrabold text-indigo-600 block mb-1">{other.title}</span>
                          <span className="text-base font-black block mb-3 text-indigo-700">${other.price}</span>
                          {Object.entries(other.specs).map(([key, val]) => (
                            <div key={key} className="mb-2">
                              <span className="text-[10px] text-gray-400 block font-bold">{key}</span>
                              <span className="font-bold text-gray-700">{val}</span>
                            </div>
                          ))}
                        </>
                      );
                    })()}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}


      {/* Add/Edit Product Modal Overlay */}
      {isAdminModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop overlay */}
          <div 
            className="modal-overlay fixed inset-0 bg-slate-900/45 backdrop-blur-md cursor-pointer"
            onClick={() => setIsAdminModalOpen(false)}
          />
          
          {/* Modal Dialog Box */}
          <div className="modal-box bg-white rounded-3xl max-w-2xl w-full p-6 md:p-8 border shadow-2xl relative max-h-[90vh] overflow-y-auto space-y-6 text-right z-10" dir="rtl">
            <div className="flex justify-between items-center border-b pb-4">
              <h3 className="text-base font-black text-gray-800 flex items-center gap-2">
                <Edit3 size={18} className="text-indigo-600" />
                <span>{editingProductId ? 'تعديل مواصفات الجهاز' : 'إضافة جهاز أو ملحق جديد'}</span>
              </h3>
              <button 
                type="button"
                onClick={() => setIsAdminModalOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-50 hover:bg-gray-100 text-gray-500 flex items-center justify-center cursor-pointer transition-all border border-gray-150"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddOrEditProduct} className="space-y-5 text-right">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-black text-gray-700">اسم المنتج والموديل *</label>
                <input 
                  type="text" 
                  placeholder="مثال: Asus ROG Strix G16"
                  value={adminForm.title}
                  onChange={e => setAdminForm(prev => ({ ...prev, title: e.target.value }))}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500/20 bg-white focus:outline-none font-bold text-xs text-right"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-black text-gray-700">التصنيف الأساسي</label>
                  <select
                    value={adminForm.category}
                    onChange={e => setAdminForm(prev => ({ ...prev, category: e.target.value as any }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500/20 bg-white focus:outline-none font-bold text-xs text-right"
                  >
                    <option value="laptop">لابتوب</option>
                    <option value="accessory">إكسسوار</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-black text-gray-700">الفئة الفرعية *</label>
                  <select
                    value={adminForm.subcategory}
                    onChange={e => setAdminForm(prev => ({ ...prev, subcategory: e.target.value }))}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500/20 bg-white focus:outline-none font-bold text-xs text-right"
                  >
                    {categories
                      .filter(c => c.type === adminForm.category)
                      .map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))
                    }
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-black text-gray-700">السعر بالدولار ($) *</label>
                  <input 
                    type="number" 
                    placeholder="السعر النقدي"
                    value={adminForm.price}
                    onChange={e => setAdminForm(prev => ({ ...prev, price: e.target.value }))}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500/20 bg-white focus:outline-none font-bold text-xs text-right"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-black text-gray-700">الكمية المتوفرة بالمخزن *</label>
                  <input 
                    type="number" 
                    value={adminForm.stock}
                    onChange={e => setAdminForm(prev => ({ ...prev, stock: e.target.value }))}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500/20 bg-white focus:outline-none font-bold text-xs text-right"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-black text-gray-700">رابط صورة المعاينة للمنتج</label>
                <input 
                  type="text" 
                  placeholder="أدخل رابطاً مباشراً للصورة المعروضة"
                  value={adminForm.image_url}
                  onChange={e => setAdminForm(prev => ({ ...prev, image_url: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500/20 bg-white focus:outline-none font-bold text-xs text-right"
                />
              </div>

              {/* Dynamic Specification Key-Value Builder */}
              <div className="border-t border-gray-100 pt-4 space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-black text-gray-700">⚙️ المواصفات والميزات الفنية</label>
                  <button 
                    type="button" 
                    onClick={() => setSpecList(prev => [...prev, { key: '', value: '' }])}
                    className="text-[10px] font-black text-indigo-650 hover:underline flex items-center gap-1 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full cursor-pointer"
                  >
                    ➕ إضافة سطر مواصفة
                  </button>
                </div>

                <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                  {specList.map((spec, index) => {
                    const isStandard = ['المعالج (CPU)', 'كرت الشاشة (GPU)', 'الذاكرة (RAM)', 'التخزين (SSD)'].includes(spec.key);
                    return (
                      <div key={index} className="flex gap-3 items-center bg-gray-50/50 p-2 rounded-xl border border-gray-100/80">
                        {isStandard ? (
                          <div className="w-1/3 text-xs font-black text-gray-700 text-right pr-3 shrink-0">
                            {spec.key}
                          </div>
                        ) : (
                          <input 
                            type="text" 
                            placeholder="اسم المواصفة" 
                            value={spec.key}
                            onChange={e => {
                              const newSpecs = [...specList];
                              newSpecs[index].key = e.target.value;
                              setSpecList(newSpecs);
                            }}
                            className="w-1/3 px-3 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-indigo-500/20 bg-white focus:outline-none text-right font-bold"
                          />
                        )}
                        <input 
                          type="text" 
                          placeholder={isStandard ? `أدخل تفاصيل ${spec.key}` : "أدخل القيمة"} 
                          value={spec.value}
                          onChange={e => {
                            const newSpecs = [...specList];
                            newSpecs[index].value = e.target.value;
                            setSpecList(newSpecs);
                          }}
                          className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-indigo-500/20 bg-white focus:outline-none text-right font-bold"
                        />
                        {!isStandard && (
                          <button 
                            type="button" 
                            onClick={() => setSpecList(prev => prev.filter((_, idx) => idx !== index))}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-xl cursor-pointer border border-red-100"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button type="submit" className="flex-1 btn-premium-primary justify-center text-xs py-3.5 cursor-pointer shadow-lg shadow-indigo-150/20">
                  {editingProductId ? 'حفظ كافة التغييرات' : 'نشر وإضافة المنتج'}
                </button>
                <button 
                  type="button" 
                  onClick={() => setIsAdminModalOpen(false)}
                  className="btn-premium-glass text-xs py-3.5 px-6 cursor-pointer"
                >
                  إلغاء وتراجع
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Comparison Widget */}
      <AnimatePresence>
        {compareList.length === 2 && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900/95 backdrop-blur-md rounded-2xl px-6 py-4 flex flex-col md:flex-row items-center gap-4 md:gap-6 shadow-2xl text-white border border-gray-800"
            dir="rtl"
          >
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-gray-400">المقارنة:</span>
              <div className="flex items-center gap-3">
                {compareList.map(prod => (
                  <div key={prod.id} className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700">
                    <img src={prod.image_url} alt="" className="w-8 h-8 rounded-lg object-cover bg-white" />
                    <div className="text-right">
                      <span className="text-[10px] font-extrabold block text-gray-200 line-clamp-1 max-w-[120px]">{prod.title}</span>
                      <span className="text-xs font-black text-indigo-400">${prod.price}</span>
                    </div>
                    <button onClick={() => toggleCompare(prod)} className="text-gray-400 hover:text-red-500 mr-2 cursor-pointer transition-colors">
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsCompareModalOpen(true)}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black transition-all cursor-pointer shadow shadow-indigo-600/30 flex items-center gap-1.5"
              >
                <ArrowLeftRight size={14} />
                <span>قارن الآن</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Premium Side-by-Side Comparison Modal */}
      <AnimatePresence>
        {isCompareModalOpen && compareList.length === 2 && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            {/* Backdrop overlay */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/45 backdrop-blur-md cursor-pointer"
              onClick={() => setIsCompareModalOpen(false)}
            />

            {/* Modal Dialog Box */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl max-w-3xl w-full p-6 md:p-8 border shadow-2xl relative z-10 max-h-[90vh] overflow-y-auto space-y-6 text-right"
              dir="rtl"
            >
              {/* Header */}
              <div className="flex justify-between items-center border-b pb-4">
                <h3 className="text-base font-black text-gray-800 flex items-center gap-2">
                  <ArrowLeftRight size={18} className="text-indigo-650" />
                  <span>مقارنة المواصفات التفصيلية</span>
                </h3>
                <button 
                  onClick={() => setIsCompareModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-gray-50 hover:bg-gray-100 text-gray-500 flex items-center justify-center cursor-pointer transition-all border border-gray-200"
                >
                  ✕
                </button>
              </div>

              {/* Specification Grid Table */}
              <div className="border border-gray-100 rounded-2xl overflow-hidden bg-gray-50/50 shadow-inner" dir="rtl">
                <table className="w-full text-right border-collapse">
                  <thead>
                    <tr className="bg-white border-b border-gray-150/40">
                      <th className="p-4 text-xs font-black text-gray-400 w-1/4">المواصفات</th>
                      <th className="p-4 w-3/8 text-center border-r border-gray-150/30">
                        <img src={compareList[0].image_url} alt="" className="w-24 h-16 object-cover rounded-xl border mx-auto mb-2 bg-white" />
                        <span className="font-extrabold text-xs text-gray-900 block truncate max-w-[180px] mx-auto">{compareList[0].title}</span>
                      </th>
                      <th className="p-4 w-3/8 text-center border-r border-gray-150/30">
                        <img src={compareList[1].image_url} alt="" className="w-24 h-16 object-cover rounded-xl border mx-auto mb-2 bg-white" />
                        <span className="font-extrabold text-xs text-gray-900 block truncate max-w-[180px] mx-auto">{compareList[1].title}</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="text-xs font-bold text-gray-700 bg-white">
                    <tr className="border-b border-gray-100 hover:bg-gray-50/30">
                      <td className="p-4 text-gray-400 font-extrabold">السعر النقدي</td>
                      <td className="p-4 text-center border-r border-gray-100 text-indigo-650 font-black text-sm">${compareList[0].price}</td>
                      <td className="p-4 text-center border-r border-gray-100 text-indigo-650 font-black text-sm">${compareList[1].price}</td>
                    </tr>
                    <tr className="border-b border-gray-100 hover:bg-gray-50/30">
                      <td className="p-4 text-gray-400 font-extrabold">الفئة</td>
                      <td className="p-4 text-center border-r border-gray-100">{compareList[0].subcategory}</td>
                      <td className="p-4 text-center border-r border-gray-100">{compareList[1].subcategory}</td>
                    </tr>
                    <tr className="border-b border-gray-100 hover:bg-gray-50/30">
                      <td className="p-4 text-gray-400 font-extrabold">المعالج (CPU)</td>
                      <td className="p-4 text-center border-r border-gray-100">{compareList[0].specs['المعالج (CPU)'] || '-'}</td>
                      <td className="p-4 text-center border-r border-gray-100">{compareList[1].specs['المعالج (CPU)'] || '-'}</td>
                    </tr>
                    <tr className="border-b border-gray-100 hover:bg-gray-50/30">
                      <td className="p-4 text-gray-400 font-extrabold">كرت الشاشة (GPU)</td>
                      <td className="p-4 text-center border-r border-gray-100">{compareList[0].specs['كرت الشاشة (GPU)'] || '-'}</td>
                      <td className="p-4 text-center border-r border-gray-100">{compareList[1].specs['كرت الشاشة (GPU)'] || '-'}</td>
                    </tr>
                    <tr className="border-b border-gray-100 hover:bg-gray-50/30">
                      <td className="p-4 text-gray-400 font-extrabold">الذاكرة (RAM)</td>
                      <td className="p-4 text-center border-r border-gray-100">{compareList[0].specs['الذاكرة (RAM)'] || '-'}</td>
                      <td className="p-4 text-center border-r border-gray-100">{compareList[1].specs['الذاكرة (RAM)'] || '-'}</td>
                    </tr>
                    <tr className="border-b border-gray-100 hover:bg-gray-50/30">
                      <td className="p-4 text-gray-400 font-extrabold">التخزين (SSD)</td>
                      <td className="p-4 text-center border-r border-gray-100">{compareList[0].specs['التخزين (SSD)'] || '-'}</td>
                      <td className="p-4 text-center border-r border-gray-100">{compareList[1].specs['التخزين (SSD)'] || '-'}</td>
                    </tr>
                    <tr className="bg-gray-50/20">
                      <td className="p-4 text-gray-400 font-extrabold">إجراء الشراء</td>
                      <td className="p-4 text-center border-r border-gray-100">
                        <button 
                          onClick={() => { addToCart(compareList[0]); setIsCompareModalOpen(false); }}
                          className="w-full btn-premium-primary justify-center text-[10px] py-2"
                        >
                          إضافة للسلة <ShoppingCart size={12} />
                        </button>
                      </td>
                      <td className="p-4 text-center border-r border-gray-100">
                        <button 
                          onClick={() => { addToCart(compareList[1]); setIsCompareModalOpen(false); }}
                          className="w-full btn-premium-primary justify-center text-[10px] py-2"
                        >
                          إضافة للسلة <ShoppingCart size={12} />
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;

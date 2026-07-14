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
  const [activeTab, setActiveTab] = useState<'home' | 'laptops' | 'accessories' | 'smart-finder' | 'contact' | 'product-detail' | 'admin' | 'cart' | 'my-orders' | 'order-success'>('home');
  
  // Currency States
  const [currency, setCurrency] = useState<'USD' | 'IQD'>('IQD');
  const [exchangeRate, setExchangeRate] = useState<number>(1480);
  const [productPricingCurrency, setProductPricingCurrency] = useState<'USD' | 'IQD'>('IQD');
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
  const [isMyOrdersOpen, setIsMyOrdersOpen] = useState(false);
  const [myOrders, setMyOrders] = useState<any[]>([]);
  const [lastCompletedOrder, setLastCompletedOrder] = useState<any | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<any | null>(null);
  const [isCategoryDeleteModalOpen, setIsCategoryDeleteModalOpen] = useState(false);
  
  // Data States
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [stats, setStats] = useState({ total_sales: 0, orders_count: 0, products_count: 0 });
  const [dbStatus, setDbStatus] = useState<{ connected: boolean; message: string }>({ connected: false, message: 'جاري التحميل...' });

  // Admin States
  const [adminLoggedIn, setAdminLoggedIn] = useState(() => !!sessionStorage.getItem('adminToken'));
  const [adminPassword, setAdminPassword] = useState('');
  const [adminUsername, setAdminUsername] = useState('');
  const [adminSubTab, setAdminSubTab] = useState<'products' | 'orders' | 'categories' | 'shipping' | 'settings'>('products');
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState<number | null>(null);
  
  // Customizable Main Category Names
  const [mainCatLaptopName, setMainCatLaptopName] = useState('أجهزة اللابتوب');
  const [mainCatAccessoryName, setMainCatAccessoryName] = useState('الإكسسوارات والملحقات');
  const [mainCatHomeName, setMainCatHomeName] = useState('عروض الصفحة الرئيسية');
  
  // Store settings from DB (no localStorage)
  const [savedAdminUser, setSavedAdminUser] = useState('admin');
  const [savedAdminPass, setSavedAdminPass] = useState('alostora2025');
  const [newAdminUser, setNewAdminUser] = useState('');
  const [newAdminPass, setNewAdminPass] = useState('');
  const [newAdminPassConfirm, setNewAdminPassConfirm] = useState('');

  // Contact info from DB
  const [storeWhatsApp, setStoreWhatsApp] = useState('9647801814088');
  const [storePhone, setStorePhone] = useState('+964 780 181 4088');
  const [storeAddress, setStoreAddress] = useState('بغداد، شارع الصناعة، مجمع الحاسبات');
  // Edit states for contact info card
  const [editWhatsApp, setEditWhatsApp] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAddress, setEditAddress] = useState('');

  // Save admin credentials updates to DB
  const updateAdminCredentials = async (user: string, pass: string) => {
    const updates: Record<string, string> = {};
    if (user) { const u = user.trim(); setSavedAdminUser(u); updates['admin_user'] = u; }
    if (pass) { const p = pass.trim(); setSavedAdminPass(p); updates['admin_pass'] = p; }
    if (Object.keys(updates).length > 0) {
      try { await fetch('/api/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updates) }); }
      catch (e) { console.warn('Could not save credentials to DB'); }
    }
  };

  // Dynamic Budget Limits for Smart Finder (from DB)
  const [budgetLimitLow, setBudgetLimitLow] = useState<number>(900);
  const [budgetLimitHigh, setBudgetLimitHigh] = useState<number>(1300);

  const updateBudgetLimits = async (low: number, high: number) => {
    setBudgetLimitLow(low);
    setBudgetLimitHigh(high);
    try {
      await fetch('/api/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ budget_limit_low: low.toString(), budget_limit_high: high.toString() }) });
    } catch (e) { console.warn('Could not save budget limits to DB'); }
  };

  // Telegram Bot Settings from DB
  const [telegramBotToken, setTelegramBotToken] = useState('8716178157:AAF3XbstprNyL6Mt2aMNjatPLTogO_abfik');
  const [telegramChatId, setTelegramChatId] = useState('267707743');
  const [editTelegramBotToken, setEditTelegramBotToken] = useState('');
  const [editTelegramChatId, setEditTelegramChatId] = useState('');

  // Save contact info to DB
  const saveContactInfo = async (whatsapp: string, phone: string, address: string, botToken?: string, chatId?: string) => {
    const updates: Record<string, string> = {};
    if (whatsapp.trim()) { updates['whatsapp_number'] = whatsapp.trim(); setStoreWhatsApp(whatsapp.trim()); }
    if (phone.trim()) { updates['phone_number'] = phone.trim(); setStorePhone(phone.trim()); }
    if (address.trim()) { updates['store_address'] = address.trim(); setStoreAddress(address.trim()); }
    if (botToken && botToken.trim()) { updates['telegram_bot_token'] = botToken.trim(); setTelegramBotToken(botToken.trim()); }
    if (chatId && chatId.trim()) { updates['telegram_chat_id'] = chatId.trim(); setTelegramChatId(chatId.trim()); }
    if (Object.keys(updates).length > 0) {
      try { await fetch('/api/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updates) }); }
      catch (e) { console.warn('Could not save contact/telegram info to DB'); }
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
    discount_price: string;
    image_url: string;
    stock: string;
  }>({
    title: '',
    category: 'laptop',
    subcategory: 'gaming',
    price: '',
    discount_price: '',
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
    type: 'laptop' | 'accessory' | 'home';
  }[]>([]);

  // Category Edit / Add modal states
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<{
    id: string;
    name: string;
    type: 'laptop' | 'accessory' | 'home';
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

  const fallbackCategories: any[] = [
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

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      } else {
        throw new Error();
      }
    } catch (e) {
      console.warn("Could not fetch categories from server. Using fallback default categories.");
      setCategories(fallbackCategories);
    }
  };

  // Fetch store settings (replaces localStorage for all persistent config)
  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings');
      if (response.ok) {
        const data = await response.json();
        if (data.admin_user) setSavedAdminUser(data.admin_user);
        if (data.admin_pass) setSavedAdminPass(data.admin_pass);
        if (data.whatsapp_number) setStoreWhatsApp(data.whatsapp_number);
        if (data.phone_number) setStorePhone(data.phone_number);
        if (data.store_address) setStoreAddress(data.store_address);
        if (data.budget_limit_low) setBudgetLimitLow(parseInt(data.budget_limit_low, 10));
        if (data.budget_limit_high) setBudgetLimitHigh(parseInt(data.budget_limit_high, 10));
        if (data.telegram_bot_token) setTelegramBotToken(data.telegram_bot_token);
        if (data.telegram_chat_id) setTelegramChatId(data.telegram_chat_id);
        if (data.main_cat_laptop_name) setMainCatLaptopName(data.main_cat_laptop_name);
        if (data.main_cat_accessory_name) setMainCatAccessoryName(data.main_cat_accessory_name);
        if (data.main_cat_home_name) setMainCatHomeName(data.main_cat_home_name);
      }
    } catch (e) {
      console.warn('Could not fetch settings from DB, using defaults.');
    }
  };

  const saveMainCategoryName = async (key: string, newName: string) => {
    if (!newName.trim()) return;
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [key]: newName.trim() })
      });
      if (response.ok) {
        fetchSettings();
      }
    } catch (e) {
      alert("فشل تحديث اسم القسم الرئيسي.");
    }
  };

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
    const token = sessionStorage.getItem('adminToken');
    if (!token) return;
    try {
      const ordRes = await fetch('/api/orders', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const statsRes = await fetch('/api/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
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
    fetchCategories();
    fetchSettings();
    // Simple client-side router for admin path
    if (window.location.pathname === '/admin') {
      setActiveTab('admin');
    }
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

  const cartTotal = cart.reduce((sum: number, item: { product: Product; quantity: number }) => {
    const activePrice = item.product.discount_price && Number(item.product.discount_price) > 0 
      ? Number(item.product.discount_price) 
      : item.product.price;
    return sum + activePrice * item.quantity;
  }, 0);
  // shippingRates stored in IQD — all prices fully in IQD
  const deliveryCost = shippingRates[selectedProvince] || 0;
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

    const invoiceId = `AST-${Date.now().toString().slice(-6)}`;
    const orderPayload = {
      id: invoiceId,
      customer_name: checkoutForm.name,
      customer_phone: checkoutForm.phone,
      customer_address: `${selectedProvince} - ${checkoutForm.address}`,
      total_price: finalCartTotal,
      items: cart.map(item => ({
        id: item.product.id,
        title: item.product.title,
        price: item.product.discount_price && Number(item.product.discount_price) > 0
          ? Number(item.product.discount_price)
          : item.product.price,
        quantity: item.quantity
      }))
    };

    // حفظ الفاتورة في الـ localStorage للزبون
    try {
      const existingOrders = JSON.parse(localStorage.getItem('my_orders') || '[]');
      existingOrders.push({
        ...orderPayload,
        date: new Date().toLocaleDateString('ar-IQ'),
        status: 'pending'
      });
      localStorage.setItem('my_orders', JSON.stringify(existingOrders));
    } catch (err) {
      console.error("Failed to save to localStorage", err);
    }

    try {
      await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });
    } catch (e) {
      console.warn("Offline order submission.");
    }

    // إغلاق السلة وإعادة التعيين
    setCart([]);
    setIsCheckoutOpen(false);
    setIsCartOpen(false);
    fetchProducts();

    // حفظ الفاتورة الحالية لعرضها في صفحة النجاح
    setLastCompletedOrder({
      ...orderPayload,
      deliveryCost: deliveryCost,
      finalCartTotal: finalCartTotal
    });
    setActiveTab('order-success');
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
      budgetFilter = (p: Product) => p.price < budgetLimitLow;
    } else if (finderBudget === 'mid') {
      budgetFilter = (p: Product) => p.price >= budgetLimitLow && p.price <= budgetLimitHigh;
    } else if (finderBudget === 'high') {
      budgetFilter = (p: Product) => p.price > budgetLimitHigh;
    }

    let exactMatches = candidates.filter(budgetFilter);

    // Dynamic reason generator based on selected criteria
    const generateReason = (product: Product, matchesBudget: boolean) => {
      const parts = [];
      if (matchesBudget) {
        parts.push(`يتوافق تماماً مع ميزانيتك (${finderBudget === 'low' ? `أقل من ${formatProductPrice(budgetLimitLow)}` : finderBudget === 'mid' ? `${formatProductPrice(budgetLimitLow)} - ${formatProductPrice(budgetLimitHigh)}` : `أكثر من ${formatProductPrice(budgetLimitHigh)}`}).`);
      } else {
        parts.push(`يمثل أقرب بديل متاح للمواصفات المطلوبة بسعر ${formatProductPrice(product.price)}.`);
      }

      if (product.subcategory === 'gaming') {
        parts.push("يقدم كرت شاشة مخصص لتشغيل الألعاب الثقيلة وبرامج المونتاج بسلاسة.");
      } else if (product.subcategory === 'ultrabook') {
        parts.push("يتميز بوزن خفيف وتصميم نحيف جداً مثالي للتنقل المستمر وعمر بطارية طويل.");
      } else {
        parts.push("يلبي متطلبات الدراسة والعمل المكتبي اليومي بكفاءة عالية وبأفضل قيمة اقتصادية.");
      }
      return parts.join(' ');
    };

    if (exactMatches.length > 0) {
      // Sort exact matches: show best specifications first (highest price within budget)
      exactMatches.sort((a, b) => b.price - a.price);
      const chosen = exactMatches[0];
      setFinderResult({ ...chosen, justification: generateReason(chosen, true) } as any);
      setFinderAlternatives(exactMatches.slice(1));
    } else {
      // Fallback: search globally within the selected budget if subcategory matches are empty
      let budgetMatches = allLaptops.filter(budgetFilter);
      if (budgetMatches.length > 0) {
        budgetMatches.sort((a, b) => b.price - a.price);
        const chosen = budgetMatches[0];
        setFinderResult({ ...chosen, justification: `توصية بديلة تناسب ميزانيتك: ${generateReason(chosen, true)}` } as any);
        setFinderAlternatives(budgetMatches.slice(1));
      } else {
        // Ultimate fallback: get most affordable laptop closest to budget
        let fallbackCandidates = [...allLaptops];
        fallbackCandidates.sort((a, b) => a.price - b.price);
        if (fallbackCandidates.length > 0) {
          const chosen = fallbackCandidates[0];
          setFinderResult({ ...chosen, justification: generateReason(chosen, false) } as any);
          setFinderAlternatives(fallbackCandidates.slice(1));
        } else {
          setFinderResult(null);
          setFinderAlternatives([]);
        }
      }
    }
    setFinderStep(3);
  };

  // Admin Login with lockout using JWT token
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (lockoutUntil && Date.now() < lockoutUntil) {
      const remaining = Math.ceil((lockoutUntil - Date.now()) / 1000);
      alert(`تم تعطيل تسجيل الدخول مؤقتاً. حاول مرة أخرى بعد ${remaining} ثانية.`);
      return;
    }
    
    const inputUser = adminUsername.trim();
    const inputPass = adminPassword.trim();
    
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: inputUser, password: inputPass })
      });
      
      if (res.ok) {
        const data = await res.json();
        setAdminLoggedIn(true);
        sessionStorage.setItem('adminToken', data.token);
        setLoginAttempts(0);
        setLockoutUntil(null);
        setAdminUsername('');
        setAdminPassword('');
      } else {
        const data = await res.json();
        const newAttempts = loginAttempts + 1;
        setLoginAttempts(newAttempts);
        if (newAttempts >= 5) {
          setLockoutUntil(Date.now() + 60000);
          setLoginAttempts(0);
          alert('تم تأمين الدخول لمدة 60 ثانية بعد 5 محاولات خاطئة.');
        } else {
          alert(`${data.error || 'اسم المستخدم أو رمز المرور خاطئ'}. المحاولات المتبقية: ${5 - newAttempts}`);
        }
      }
    } catch (err) {
      alert("حدث خطأ أثناء الاتصال بخادم الأمان.");
    }
  };

  // Price formatting helper
  const formatPrice = (rawPrice: number | string | undefined) => {
    const usdPrice = Number(rawPrice) || 0;
    if (currency === 'IQD') {
      return `${Math.round(usdPrice * exchangeRate).toLocaleString('en-US')} د.ع`;
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

  // Helper to render price badge with discount (returns JSX)
  const renderProductPrice = (product: Product) => {
    const originalPrice = product.price;
    const discountPrice = product.discount_price;

    if (discountPrice && Number(discountPrice) > 0) {
      return (
        <div className="flex flex-col items-end gap-0.5">
          <span className="text-[10px] text-gray-400 line-through font-bold">
            {formatIQD(originalPrice)}
          </span>
          <span className="font-black text-red-500 text-base md:text-lg">
            {formatIQD(discountPrice)}
          </span>
        </div>
      );
    }

    return (
      <span className="font-black text-indigo-650 text-base md:text-lg">
        {formatIQD(originalPrice)}
      </span>
    );
  };

  // Format IQD value directly (for shipping rates which are stored in IQD)
  const formatIQD = (iqd: number) => `${Math.round(iqd).toLocaleString('en-US')} د.ع`;
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
      discount_price: adminForm.discount_price.trim() ? parseFloat(adminForm.discount_price) : null,
      image_url: adminForm.image_url || "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=600&q=80",
      specs: specsObj,
      stock: parseInt(adminForm.stock)
    };

    try {
      const url = editingProductId ? `/api/products/${editingProductId}` : '/api/products';
      const method = editingProductId ? 'PUT' : 'POST';

      const token = sessionStorage.getItem('adminToken') || '';
      const response = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        alert(editingProductId ? "تم تعديل مواصفات الجهاز!" : "تم إضافة المنتج للمتجر!");
        setAdminForm({
          title: '',
          category: 'laptop',
          subcategory: 'gaming',
          price: '',
          discount_price: '',
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
      discount_price: product.discount_price ? product.discount_price.toString() : '',
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

  const handleDeleteProduct = async () => {
    if (!productToDelete || !productToDelete.id) return;

    try {
      const token = sessionStorage.getItem('adminToken') || '';
      const response = await fetch(`/api/products/${productToDelete.id}`, { 
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setProductToDelete(null);
        setIsDeleteModalOpen(false);
        fetchProducts();
        fetchAdminData();
      }
    } catch (e) {
      alert("فشل حذف المنتج.");
    }
  };

  const handleDeleteCategory = async () => {
    if (!categoryToDelete || !categoryToDelete.id) return;
    try {
      const token = sessionStorage.getItem('adminToken') || '';
      const response = await fetch(`/api/categories/${categoryToDelete.id}`, { 
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setCategoryToDelete(null);
        setIsCategoryDeleteModalOpen(false);
        fetchCategories();
      } else {
        alert("فشل حذف التصنيف.");
      }
    } catch (e) {
      alert("حدث خطأ أثناء الاتصال بالخادم.");
    }
  };


  const renderProductCard = (product: Product) => {
    const isCompared = compareList.some((p: Product) => p.id === product.id);
    const hasDiscount = product.discount_price && Number(product.discount_price) > 0;
    const discountPercent = hasDiscount 
      ? Math.round(((product.price - Number(product.discount_price)) / product.price) * 100) 
      : 0;

    return (
      <div key={product.id} className={`card-glass flex flex-col justify-between overflow-hidden relative transition-all duration-300 ${hasDiscount ? 'ring-2 ring-red-500/20 border-red-100 hover:border-red-200 shadow-red-50/20' : ''}`}>
        <div className="absolute top-3.5 right-3.5 z-10 px-3 py-1 rounded-full text-[10px] font-bold text-white bg-indigo-600 shadow">
          {product.category === 'laptop' ? 'لابتوب' : 'ملحق'}
        </div>
        {hasDiscount && (
          <div className="absolute top-3.5 left-3.5 z-10 px-3 py-1 rounded-full text-[10px] font-black text-white bg-red-500 shadow animate-pulse flex items-center gap-1">
            <Flame size={10} />
            <span>خصم {discountPercent}%</span>
          </div>
        )}

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
            {renderProductPrice(product)}
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
      <nav className={`card-glass flat sticky top-4 z-40 mx-4 md:mx-12 my-4 px-6 py-4 flex flex-col border-white transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/45 backdrop-blur-[28px] shadow-lg shadow-indigo-100/10 border-indigo-100/30' 
          : 'bg-white/65'
      }`}>
        {/* Top Navbar Row */}
        <div className="w-full flex items-center justify-between">
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
                <div className="hidden lg:flex items-center gap-8">
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
                    <span className="hidden lg:inline font-bold text-xs">السلة</span>
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
                    className="lg:hidden flex flex-col justify-center items-center w-10 h-10 rounded-xl bg-white border border-gray-200 shadow-sm relative cursor-pointer"
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
        </div>

        {/* Integrated Mobile Menu Dropdown (Part of the Nav element) */}
        <div 
          className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out origin-top ${
            isMobileMenuOpen ? 'max-h-[350px] opacity-100 mt-4 pt-4 border-t border-gray-100' : 'max-h-0 opacity-0 pointer-events-none'
          }`}
          style={{ transformStyle: 'preserve-3d', backfaceVisibility: 'hidden' }}
        >
          <div className="flex flex-col gap-3 text-center items-center w-full">
            <button 
              onClick={() => { setActiveTab('home'); setSelectedSubcategory('all'); setIsMobileMenuOpen(false); }} 
              className={`py-2 text-sm font-extrabold text-gray-700 hover:text-indigo-650 transition-colors block text-center w-full cursor-pointer ${activeTab === 'home' ? 'text-indigo-650 font-black' : ''}`}
            >
              الرئيسية
            </button>
            <button 
              onClick={() => { setActiveTab('laptops'); setSelectedSubcategory('all'); setIsMobileMenuOpen(false); }} 
              className={`py-2 text-sm font-extrabold text-gray-700 hover:text-indigo-650 transition-colors block text-center w-full cursor-pointer ${activeTab === 'laptops' ? 'text-indigo-650 font-black' : ''}`}
            >
              أجهزة اللابتوب
            </button>
            <button 
              onClick={() => { setActiveTab('accessories'); setSelectedSubcategory('all'); setIsMobileMenuOpen(false); }} 
              className={`py-2 text-sm font-extrabold text-gray-700 hover:text-indigo-650 transition-colors block text-center w-full cursor-pointer ${activeTab === 'accessories' ? 'text-indigo-650 font-black' : ''}`}
            >
              الإكسسوارات
            </button>
            <button 
              onClick={() => { setActiveTab('smart-finder'); setFinderStep(1); setIsMobileMenuOpen(false); }} 
              className={`py-2 text-sm font-extrabold text-indigo-650 flex items-center gap-1.5 justify-center transition-colors block cursor-pointer w-full ${activeTab === 'smart-finder' ? 'font-black' : ''}`}
            >
              <Compass size={16} className="animate-spin-slow" />
              <span>المساعد الذكي</span>
            </button>
            <button 
              onClick={() => { setActiveTab('contact'); setIsMobileMenuOpen(false); }} 
              className={`py-2 text-sm font-extrabold text-gray-700 hover:text-indigo-650 transition-colors block text-center w-full cursor-pointer ${activeTab === 'contact' ? 'text-indigo-650 font-black' : ''}`}
            >
              اتصل بنا
            </button>
          </div>
        </div>
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
                  {categories
                    .filter(c => c.type === 'laptop')
                    .map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedSubcategory(cat.id)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${selectedSubcategory === cat.id ? 'bg-indigo-600 text-white shadow-md' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                      >
                        {cat.name}
                      </button>
                    ))
                  }
                </>
              )}
              {activeTab === 'accessories' && (
                <>
                  {categories
                    .filter(c => c.type === 'accessory')
                    .map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedSubcategory(cat.id)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${selectedSubcategory === cat.id ? 'bg-indigo-600 text-white shadow-md' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                      >
                        {cat.name}
                      </button>
                    ))
                  }
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
              {/* Render dynamic homepage category sections */}
              {(() => {
                const discountedProducts = filteredProducts.filter((p: Product) => p.discount_price && Number(p.discount_price) > 0);
                const homeCats = (categories as any[]).filter(c => c.type === 'home');
                
                return (
                  <>
                    {/* Automated Discounts Section */}
                    {discountedProducts.length > 0 && (
                      <div className="mb-16">
                        <div className="flex justify-between items-center mb-6 border-b pb-3 border-gray-150">
                          <h2 className="text-xl font-black flex items-center gap-2 text-gray-850">
                            <span className="text-red-500">🏷️</span>
                            <span>أقوى العروض والتخفيضات</span>
                            <span className="text-[10px] font-bold text-red-500 bg-red-50 border border-red-100/50 px-2.5 py-0.5 rounded-lg">
                              {discountedProducts.length} {discountedProducts.length === 1 ? 'عرض نشط' : 'عروض نشطة'}
                            </span>
                          </h2>
                        </div>
                        <div className="products-grid">
                          {discountedProducts.map((product: Product) => renderProductCard(product))}
                        </div>
                      </div>
                    )}

                    {homeCats.length > 0 && homeCats.map(cat => {
                      const catProducts = filteredProducts.filter((p: Product) => p.subcategory === cat.id);
                      if (catProducts.length === 0) return null; // Skip rendering empty custom sections
                      return (
                        <div key={cat.id} className="mb-16">
                          <div className="flex justify-between items-center mb-6 border-b pb-3 border-gray-150">
                            <h2 className="text-xl font-black flex items-center gap-2 text-gray-800">
                              <span>{cat.name}</span>
                              <span className="text-[10px] font-bold text-gray-500 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-lg">
                                {catProducts.length} منتج
                              </span>
                            </h2>
                          </div>
                          <div className="products-grid">
                            {catProducts.map((product: Product) => renderProductCard(product))}
                          </div>
                        </div>
                      );
                    })}

                    <div className="space-y-16">
                        {/* Laptops Showcase (Max 5 items) */}
                        {filteredProducts.filter((p: Product) => p.category === 'laptop').length > 0 && (
                          <div>
                            <div className="flex justify-between items-center mb-6 border-b pb-3 border-gray-200/40">
                              <h2 className="text-2xl font-black flex items-center gap-2">
                                <span>💻 أجهزة لابتوب مميزة</span>
                                <span className="text-xs font-extrabold text-gray-500 bg-white border border-gray-150 px-3 py-1 rounded-full shadow-sm">
                                  {filteredProducts.filter((p: Product) => p.category === 'laptop').length} جهاز متوفر
                                </span>
                              </h2>
                            </div>
                            <div className="products-grid">
                              {filteredProducts
                                .filter((p: Product) => p.category === 'laptop')
                                .slice(0, 5)
                                .map((product: Product) => renderProductCard(product))}
                            </div>
                            <div className="flex justify-center mt-8">
                              <button
                                onClick={() => { setActiveTab('laptops'); setSelectedSubcategory('all'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                className="btn-premium-glass text-xs py-3 px-8 flex items-center gap-2 shadow-sm font-black border-indigo-200 text-indigo-700 bg-indigo-50/50 hover:bg-indigo-50 cursor-pointer"
                              >
                                عرض جميع أجهزة اللابتوب ({filteredProducts.filter((p: Product) => p.category === 'laptop').length}) ←
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Accessories Showcase (Max 5 items) */}
                        {filteredProducts.filter((p: Product) => p.category === 'accessory').length > 0 && (
                          <div>
                            <div className="flex justify-between items-center mb-6 border-b pb-3 border-gray-200/40">
                              <h2 className="text-2xl font-black flex items-center gap-2">
                                <span>🎧 إكسسوارات وملحقات احترافية</span>
                                <span className="text-xs font-extrabold text-gray-500 bg-white border border-gray-150 px-3 py-1 rounded-full shadow-sm">
                                  {filteredProducts.filter((p: Product) => p.category === 'accessory').length} ملحق متوفر
                                </span>
                              </h2>
                            </div>
                            <div className="products-grid">
                              {filteredProducts
                                .filter((p: Product) => p.category === 'accessory')
                                .slice(0, 5)
                                .map((product: Product) => renderProductCard(product))}
                            </div>
                            <div className="flex justify-center mt-8">
                              <button
                                onClick={() => { setActiveTab('accessories'); setSelectedSubcategory('all'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                className="btn-premium-glass text-xs py-3 px-8 flex items-center gap-2 shadow-sm font-black border-indigo-200 text-indigo-700 bg-indigo-50/50 hover:bg-indigo-50 cursor-pointer"
                              >
                                عرض جميع الإكسسوارات والملحقات ({filteredProducts.filter((p: Product) => p.category === 'accessory').length}) ←
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                  </>
                );
              })()}
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
                    <span className="font-extrabold block text-base mb-1">أقل من {formatProductPrice(budgetLimitLow)}</span>
                    <span className="text-[11px] text-gray-400">حواسيب دراسية واقتصادية ممتازة</span>
                  </button>
                  <button 
                    onClick={() => { setFinderBudget('mid'); setFinderStep(2); }}
                    className="card-glass p-6 text-center cursor-pointer border-gray-100"
                  >
                    <span className="text-3xl block mb-2">💳</span>
                    <span className="font-extrabold block text-base mb-1">{formatProductPrice(budgetLimitLow)} - {formatProductPrice(budgetLimitHigh)}</span>
                    <span className="text-[11px] text-gray-400">أداء ممتاز جداً للألعاب الخفيفة والتصميم</span>
                  </button>
                  <button 
                    onClick={() => { setFinderBudget('high'); setFinderStep(2); }}
                    className="card-glass p-6 text-center cursor-pointer border-gray-100"
                  >
                    <span className="text-3xl block mb-2">💎</span>
                    <span className="font-extrabold block text-base mb-1">أكثر من {formatProductPrice(budgetLimitHigh)}</span>
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
                    <div className="lg:col-span-7 card-glass border-indigo-150 bg-indigo-50/10 p-8 relative flex flex-col gap-6">
                      <div className="flex justify-between items-center border-b pb-4 border-gray-100">
                        {(() => {
                          const matchesBudget = finderBudget === 'low' 
                            ? finderResult.price < 900 
                            : finderBudget === 'mid' 
                              ? (finderResult.price >= 900 && finderResult.price <= 1300) 
                              : finderResult.price > 1300;
                          return (
                            <span className={`px-3.5 py-1.5 rounded-full text-[10px] font-black text-white shadow-sm inline-block ${matchesBudget ? 'bg-indigo-600' : 'bg-amber-600'}`}>
                              {matchesBudget ? '⭐ التوصية المثالية لميزانيتك واحتياجاتك' : '💡 البديل الأقرب لميزانيتك واحتياجاتك'}
                            </span>
                          );
                        })()}
                      </div>

                      <div className="flex flex-col md:flex-row gap-6 items-start">
                        <img 
                          src={finderResult.image_url} 
                          alt={finderResult.title}
                          className="w-full md:w-44 h-40 object-cover rounded-2xl border bg-white shrink-0 shadow-sm"
                        />
                        <div className="flex-1 space-y-4 w-full">
                          <div>
                            <h4 className="text-lg font-black text-gray-900 mb-1 leading-snug">{finderResult.title}</h4>
                            <span className="text-2xl font-black text-indigo-650 block">{formatProductPrice(finderResult.price)}</span>
                          </div>

                          {/* Dynamic recommendation justification */}
                          {(finderResult as any).justification && (
                            <div className="bg-indigo-50/50 border border-indigo-100/60 p-4 rounded-xl text-xs text-gray-700 font-medium leading-relaxed">
                              🎯 <strong>سبب التوصية:</strong> {(finderResult as any).justification}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Technical specifications */}
                      <div className="bg-white/80 p-5 rounded-2xl text-xs space-y-3 border border-gray-100/60 shadow-inner">
                        <span className="font-black text-gray-800 block mb-2 text-xs border-b pb-2">⚙️ المواصفات التفصيلية:</span>
                        {Object.entries(finderResult.specs).map(([key, val]) => (
                          <div key={key} className="flex justify-between items-center py-1">
                            <span className="text-gray-400 font-bold">{key}:</span>
                            <span className="text-gray-800 font-extrabold text-left">{val}</span>
                          </div>
                        ))}
                      </div>

                      <div className="flex gap-4 pt-2">
                        <button 
                          onClick={() => addToCart(finderResult)}
                          className="flex-1 btn-premium-primary justify-center text-xs py-3.5"
                        >
                          أضف للسلة <ShoppingCart size={14} />
                        </button>
                        <button 
                          onClick={() => { setFinderStep(1); setFinderBudget(null); setFinderUsage(null); }}
                          className="btn-premium-glass text-xs py-3.5 px-6"
                        >
                          إعادة الفحص ↻
                        </button>
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
                                  <span className="text-[9px] font-bold text-gray-400 block mt-0.5">{formatProductPrice(alt.price)}</span>
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
                <span className="text-xs text-gray-800 font-black">{storeAddress}</span>
              </div>
            </div>

            {/* Phone */}
            <div className="card-glass p-5 bg-white/90 border-white shadow-sm flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <Phone size={18} />
              </div>
              <div>
                <span className="text-[10px] text-gray-400 font-bold block mb-0.5">الهاتف المباشر</span>
                <span className="text-xs text-gray-800 font-black" dir="ltr">{storePhone}</span>
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
                      href={`https://wa.me/${storeWhatsApp}`} 
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
                    {renderProductPrice(selectedProductDetail)}
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
          <div className="flex flex-col sm:flex-row justify-between items-end sm:items-center gap-4 mb-8 text-right" dir="rtl">
            <div>
              <h2 className="text-3xl font-black text-gray-900 flex items-center gap-3">
                <ShoppingBag size={30} className="text-indigo-650" />
                <span>سلة التسوق وإتمام الطلب</span>
              </h2>
              <p className="text-xs text-gray-400 mt-1">راجع الأجهزة والملحقات المختارة، حدد تفاصيل العنوان وأجور التوصيل لإكمال طلبك.</p>
            </div>
            
            {/* زر فواتيري السابقة */}
            <button 
              onClick={() => {
                const stored = JSON.parse(localStorage.getItem('my_orders') || '[]');
                setMyOrders(stored.slice(-5).reverse());
                setActiveTab('my-orders');
              }}
              className="px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100/70 border border-indigo-150 text-indigo-700 font-extrabold text-xs rounded-xl flex items-center gap-2 cursor-pointer transition-all shadow-sm"
            >
              <Receipt size={14} className="text-indigo-650" />
              <span>سجل الطلبات والمشتريات السابقة</span>
            </button>
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
                              <div className="mt-1">
                                {item.product.discount_price && Number(item.product.discount_price) > 0 ? (
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-red-500 font-black">{formatProductPrice(item.product.discount_price)}</span>
                                    <span className="text-[10px] text-gray-400 line-through font-bold">{formatProductPrice(item.product.price)}</span>
                                  </div>
                                ) : (
                                  <span className="text-xs text-indigo-650 font-black">{formatProductPrice(item.product.price)}</span>
                                )}
                              </div>
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
                              {(() => {
                                const activePrice = item.product.discount_price && Number(item.product.discount_price) > 0
                                  ? Number(item.product.discount_price)
                                  : item.product.price;
                                return formatProductPrice(activePrice * item.quantity);
                              })()}
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
                      <span>{formatIQD(deliveryCost)}</span>
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
                <button onClick={() => { setAdminLoggedIn(false); sessionStorage.removeItem('adminToken'); }} className="btn-premium-glass text-xs py-2 px-4 cursor-pointer">
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

              {/* Subtab Navigation (Responsive flex-wrap container) */}
              <div className="flex flex-wrap gap-3.5 border-b border-gray-250/20 pb-3">
                <button 
                  onClick={() => setAdminSubTab('products')} 
                  className={`pb-2 text-xs md:text-sm font-extrabold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                    adminSubTab === 'products' ? 'border-indigo-650 text-indigo-650' : 'border-transparent text-gray-450 hover:text-gray-700'
                  }`}
                >
                  <span>📦 إدارة معروضات المتجر</span>
                </button>
                <button 
                  onClick={() => setAdminSubTab('orders')} 
                  className={`pb-2 text-xs md:text-sm font-extrabold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
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
                  className={`pb-2 text-xs md:text-sm font-extrabold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                    adminSubTab === 'categories' ? 'border-indigo-650 text-indigo-650' : 'border-transparent text-gray-450 hover:text-gray-700'
                  }`}
                >
                  <span>📂 إدارة التصنيفات</span>
                </button>
                <button 
                  onClick={() => setAdminSubTab('shipping')} 
                  className={`pb-2 text-xs md:text-sm font-extrabold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                    adminSubTab === 'shipping' ? 'border-indigo-650 text-indigo-650' : 'border-transparent text-gray-450 hover:text-gray-700'
                  }`}
                >
                  <span>🚚 أجور التوصيل</span>
                </button>
                <button 
                  onClick={() => setAdminSubTab('settings')} 
                  className={`pb-2 text-xs md:text-sm font-extrabold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
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
                          discount_price: '',
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

                            <div className="border-t border-gray-100 my-1"></div>

                            <div className="px-3 py-1 text-[10px] font-black text-indigo-650 bg-indigo-50/40 rounded-md">🏠 أقسام الصفحة الرئيسية</div>
                            <div className="mr-1.5 space-y-0.5 border-r border-indigo-100 pr-1.5 mt-1">
                              {(categories as any[])
                                .filter(c => c.type === 'home')
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
                                <span className="text-[10px] text-gray-400 block font-bold">السعر الحالي</span>
                                <span className="font-black text-indigo-600 text-base">{formatIQD(p.price)}</span>
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
                                  onClick={() => { setProductToDelete(p); setIsDeleteModalOpen(true); }} 
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
                          `معك إدارة متجر الأسطورة للحاسبات بخصوص طلبك رقم #${o.id} بقيمة ${formatIQD(o.total_price * exchangeRate)}.\n` +
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
                                  <span className="text-base font-black text-indigo-600">{formatIQD(o.total_price * exchangeRate)}</span>
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

                            {/* Contact Action & Status Update */}
                            <div className="pt-2 space-y-2">
                              <div className="flex justify-between items-center bg-gray-50 p-2.5 rounded-xl border border-gray-150 text-xs font-bold mb-2">
                                <span className="text-gray-450">حالة الطلب:</span>
                                <span className={`px-2 py-0.5 rounded text-[10px] ${
                                  o.status === 'prepared' ? 'bg-green-50 text-green-700 border border-green-200' :
                                  o.status === 'delivered' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                                  'bg-amber-50 text-amber-700 border border-amber-200'
                                }`}>
                                  {o.status === 'prepared' ? '📦 تم التجهيز' : o.status === 'delivered' ? '✅ تم التوصيل' : '⏳ قيد الانتظار'}
                                </span>
                              </div>

                              <div className="flex gap-2">
                                <a 
                                  href={`https://wa.me/${cleanPhone}?text=${whatsAppMsg}`} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 text-white font-extrabold text-[11px] shadow-sm hover:shadow-md transition-all cursor-pointer text-center"
                                >
                                  <MessageSquare size={13} />
                                  <span>واتساب</span>
                                </a>

                                {o.status === 'pending' ? (
                                  <button
                                    onClick={async () => {
                                      const token = sessionStorage.getItem('adminToken') || '';
                                      try {
                                        const res = await fetch(`/api/orders/${o.id}/status`, {
                                          method: 'PUT',
                                          headers: {
                                            'Content-Type': 'application/json',
                                            'Authorization': `Bearer ${token}`
                                          },
                                          body: JSON.stringify({ status: 'prepared' })
                                        });
                                        if (res.ok) {
                                          fetchAdminData();
                                          // فتح واتساب مباشرة لإبلاغ الزبون
                                          const itemsList = Array.isArray(o.items)
                                            ? o.items.map((it: {title:string;quantity:number;price:number}) =>
                                                `• ${it.title} (${it.quantity} قطعة)`
                                              ).join('\n')
                                            : '';
                                          const waText = encodeURIComponent(
                                            `✅ تم تجهيز طلبك - متجر الأسطورة للحاسبات\n` +
                                            `━━━━━━━━━━━━━━━━━━━━\n\n` +
                                            `مرحباً أستاذ ${o.customer_name} 😊\n\n` +
                                            `يسعدنا إعلامك بأن طلبك رقم #${o.id} قد تم تجهيزه وتغليفه بنجاح! 📦\n\n` +
                                            `📋 تفاصيل طلبك:\n${itemsList}\n\n` +
                                            `📍 العنوان: ${o.customer_address}\n` +
                                            `💰 الإجمالي: ${Number(o.total_price).toLocaleString('en-US')} د.ع\n\n` +
                                            `━━━━━━━━━━━━━━━━━━━━\n` +
                                            `🚚 سيتم تسليمه قريباً عبر شركة التوصيل\n` +
                                            `شكراً لثقتك بنا! 🙏`
                                          );
                                          window.open(`https://wa.me/${cleanPhone}?text=${waText}`, '_blank');
                                        }
                                      } catch (err) {
                                        alert('خطأ أثناء التحديث');
                                      }
                                    }}
                                    className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-[11px] shadow-sm transition-all cursor-pointer text-center"
                                  >
                                    📦 تجهيز الطلب
                                  </button>
                                ) : o.status === 'prepared' ? (
                                  <div className="flex-1 py-2.5 rounded-xl bg-green-100 text-green-700 font-extrabold text-[11px] text-center border border-green-300">
                                    ✅ مُجهَّز
                                  </div>
                                ) : null}
                              </div>
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
                  <div className="flex flex-col sm:flex-row justify-between items-center bg-white/60 p-4 rounded-2xl border border-white shadow-sm gap-3">
                    <span className="text-xs font-black text-gray-800">📂 إدارة أقسام وتصنيفات المتجر</span>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => {
                          setEditingCategory({ id: '', name: '', type: 'laptop', isNew: true });
                          setIsCategoryModalOpen(true);
                        }}
                        className="btn-premium-primary text-[10px] py-2 px-3 cursor-pointer flex items-center gap-1.5 shadow-sm"
                      >
                        <span>➕ إضافة قسم لابتوب جديد</span>
                      </button>
                      <button
                        onClick={() => {
                          setEditingCategory({ id: '', name: '', type: 'accessory', isNew: true });
                          setIsCategoryModalOpen(true);
                        }}
                        className="btn-premium-glass text-[10px] py-2 px-3 cursor-pointer flex items-center gap-1.5 shadow-sm"
                      >
                        <span>➕ إضافة قسم ملحقات جديد</span>
                      </button>
                      <button
                        onClick={() => {
                          setEditingCategory({ id: '', name: '', type: 'home' as any, isNew: true });
                          setIsCategoryModalOpen(true);
                        }}
                        className="btn-premium-glass text-[10px] py-2 px-3 border-indigo-200 text-indigo-700 bg-indigo-50/50 hover:bg-indigo-50 cursor-pointer flex items-center gap-1.5 shadow-sm"
                      >
                        <span>➕ إضافة قسم للرئيسية جديد</span>
                      </button>
                    </div>
                  </div>

                  {/* Category stats dashboard overview */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Laptops Main Category Card */}
                    <div className="card-glass flat p-6 bg-white/95 border-indigo-100 shadow-sm space-y-4">
                      <div className="flex items-center gap-3 border-b pb-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-inner">
                          <Laptop size={22} />
                        </div>
                        <div className="flex-1 text-right">
                          <div className="flex items-center gap-1.5 justify-start">
                            <h3 className="font-black text-gray-900 text-base">{mainCatLaptopName}</h3>
                            <button
                              onClick={() => {
                                const newName = prompt("أدخل المسمى الجديد لقسم اللابتوبات:", mainCatLaptopName);
                                if (newName && newName.trim()) {
                                  saveMainCategoryName('main_cat_laptop_name', newName);
                                }
                              }}
                              className="p-1 text-indigo-600 hover:bg-indigo-50 rounded-lg cursor-pointer transition-all"
                              title="تعديل مسمى القسم الرئيسي"
                            >
                              <Edit3 size={12} />
                            </button>
                          </div>
                          <span className="text-[10px] text-gray-400 font-bold block mt-0.5">إجمالي المعروض: {products.filter(p => p.category === 'laptop').length} جهاز</span>
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
                                    className="text-[10px] font-bold text-indigo-650 hover:underline cursor-pointer"
                                    title="عرض الأجهزة المعروضة في هذا القسم"
                                  >
                                    عرض المعروضات
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
                                          alert(`لا يمكن حذف هذا القسم لأنه يحتوي على ${count} أجهزة معروضة حالياً! يرجى نقل أو حذف الأجهزة أولاً.`);
                                          return;
                                        }
                                        setCategoryToDelete({ id: sub.id, name: sub.name });
                                        setIsCategoryDeleteModalOpen(true);
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
                        <div className="flex-1 text-right">
                          <div className="flex items-center gap-1.5 justify-start">
                            <h3 className="font-black text-gray-900 text-base">{mainCatAccessoryName}</h3>
                            <button
                              onClick={() => {
                                const newName = prompt("أدخل المسمى الجديد لقسم الملحقات:", mainCatAccessoryName);
                                if (newName && newName.trim()) {
                                  saveMainCategoryName('main_cat_accessory_name', newName);
                                }
                              }}
                              className="p-1 text-indigo-600 hover:bg-indigo-50 rounded-lg cursor-pointer transition-all"
                              title="تعديل مسمى القسم الرئيسي"
                            >
                              <Edit3 size={12} />
                            </button>
                          </div>
                          <span className="text-[10px] text-gray-400 font-bold block mt-0.5">إجمالي المعروض: {products.filter(p => p.category === 'accessory').length} ملحق</span>
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
                                    className="text-[10px] font-bold text-indigo-650 hover:underline cursor-pointer"
                                    title="عرض الملحقات المعروضة في هذا القسم"
                                  >
                                    عرض المعروضات
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
                                        setCategoryToDelete({ id: sub.id, name: sub.name });
                                        setIsCategoryDeleteModalOpen(true);
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

                    {/* Home Main Category Card (New) */}
                    <div className="card-glass flat p-6 bg-white/95 border-indigo-100 shadow-sm space-y-4">
                      <div className="flex items-center gap-3 border-b pb-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-inner">
                          <Compass size={22} />
                        </div>
                        <div className="flex-1 text-right">
                          <div className="flex items-center gap-1.5 justify-start">
                            <h3 className="font-black text-gray-900 text-base">{mainCatHomeName}</h3>
                            <button
                              onClick={() => {
                                const newName = prompt("أدخل المسمى الجديد لقسم الرئيسية:", mainCatHomeName);
                                if (newName && newName.trim()) {
                                  saveMainCategoryName('main_cat_home_name', newName);
                                }
                              }}
                              className="p-1 text-indigo-600 hover:bg-indigo-50 rounded-lg cursor-pointer transition-all"
                              title="تعديل مسمى القسم الرئيسي"
                            >
                              <Edit3 size={12} />
                            </button>
                          </div>
                          <span className="text-[10px] text-gray-400 font-bold block mt-0.5">إجمالي الأقسام: {(categories as any[]).filter(c => c.type === 'home').length} قسم</span>
                        </div>
                      </div>

                      <div className="space-y-2.5">
                        {(categories as any[]).filter(c => c.type === 'home').length === 0 ? (
                          <div className="text-center py-6 text-gray-400 text-xs font-bold">لا توجد أقسام رئيسية مضافة للرئيسية بعد.</div>
                        ) : (
                          (categories as any[])
                            .filter(c => c.type === 'home')
                            .map(sub => {
                              const count = products.filter(p => p.subcategory === sub.id).length;
                              return (
                                <div key={sub.id} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-indigo-50/30 transition-all group">
                                  <span className="font-bold text-xs text-gray-800">{sub.name}</span>
                                  <div className="flex items-center gap-3">
                                    <span className="text-[10px] font-black text-indigo-650 bg-indigo-50 px-2 py-0.5 rounded-md">{count} منتج</span>
                                    <button
                                      onClick={() => {
                                        setAdminCategoryFilter(sub.id);
                                        setAdminSubTab('products');
                                      }}
                                      className="text-[10px] font-bold text-indigo-650 hover:underline cursor-pointer"
                                      title="عرض المنتجات التابعة لهذا القسم"
                                    >
                                      عرض المعروضات
                                    </button>
                                    <div className="flex gap-1 border-r pr-2 border-gray-200">
                                      <button
                                        onClick={() => {
                                          setEditingCategory({ id: sub.id, name: sub.name, type: 'home' as any, isNew: false });
                                          setIsCategoryModalOpen(true);
                                        }}
                                        className="p-1 text-indigo-650 hover:bg-indigo-50 rounded cursor-pointer transition-all"
                                        title="تعديل اسم القسم"
                                      >
                                        <Edit3 size={11} />
                                      </button>
                                      <button
                                        onClick={() => {
                                          if (count > 0) {
                                            alert(`لا يمكن حذف هذا القسم لأنه يحتوي على ${count} منتجات معروضة حالياً!`);
                                            return;
                                          }
                                          setCategoryToDelete({ id: sub.id, name: sub.name });
                                          setIsCategoryDeleteModalOpen(true);
                                        }}
                                        className="p-1 text-red-500 hover:bg-red-50 rounded cursor-pointer transition-all"
                                        title="حذف القسم"
                                      >
                                        <Trash2 size={11} />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              );
                            })
                        )}
                      </div>
                    </div>
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

                  {/* Contact Info */}
                  <div className="card-glass flat p-6 bg-white/90 border-white shadow-sm space-y-5">
                    <h3 className="font-extrabold text-sm text-gray-800 border-b pb-3">📞 معلومات التواصل والمتجر</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-1.5">
                        <label className="text-xs font-black text-gray-700">رقم واتساب المتجر (بدون +)</label>
                        <input
                          type="text"
                          placeholder={`الحالي: ${storeWhatsApp}`}
                          value={editWhatsApp}
                          onChange={e => setEditWhatsApp(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold text-xs bg-white"
                          dir="ltr"
                        />
                        <p className="text-[10px] text-gray-400">مثال: 9647801814088 (بدون + وبدون مسافات)</p>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-black text-gray-700">رقم الهاتف للعرض</label>
                        <input
                          type="text"
                          placeholder={`الحالي: ${storePhone}`}
                          value={editPhone}
                          onChange={e => setEditPhone(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold text-xs bg-white"
                          dir="ltr"
                        />
                        <p className="text-[10px] text-gray-400">الرقم الظاهر في صفحة اتصل بنا والفوتر.</p>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-gray-700">عنوان المتجر</label>
                      <input
                        type="text"
                        placeholder={`الحالي: ${storeAddress}`}
                        value={editAddress}
                        onChange={e => setEditAddress(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold text-xs bg-white"
                      />
                    </div>

                    <div className="border-t border-gray-100/50 pt-4">
                      <h4 className="font-extrabold text-xs text-gray-700 mb-3 flex items-center gap-1.5">🤖 إشعارات بوت تليغرام (Telegram Bot Notifications)</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                          <label className="text-xs font-black text-gray-700">رمز البوت (Telegram Bot Token)</label>
                          <input
                            type="password"
                            placeholder={telegramBotToken ? "••••••••••••••••••••••••" : "أدخل رمز توكن البوت"}
                            value={editTelegramBotToken}
                            onChange={e => setEditTelegramBotToken(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold text-xs bg-white"
                            dir="ltr"
                          />
                          <p className="text-[10px] text-gray-400">رمز التوكن الذي يمنحه لك BotFather عند إنشاء البوت.</p>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-black text-gray-700">معرّف المحادثة (Telegram Chat ID)</label>
                          <input
                            type="text"
                            placeholder={`الحالي: ${telegramChatId}`}
                            value={editTelegramChatId}
                            onChange={e => setEditTelegramChatId(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold text-xs bg-white"
                            dir="ltr"
                          />
                          <p className="text-[10px] text-gray-400">معرّف حساب التليغرام لتلقي إشعارات الطلبات المباشرة.</p>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={async () => {
                        if (!editWhatsApp && !editPhone && !editAddress && !editTelegramBotToken && !editTelegramChatId) {
                          alert('أدخل على الأقل قيمة واحدة للتحديث.');
                          return;
                        }
                        await saveContactInfo(editWhatsApp, editPhone, editAddress, editTelegramBotToken, editTelegramChatId);
                        setEditWhatsApp('');
                        setEditPhone('');
                        setEditAddress('');
                        setEditTelegramBotToken('');
                        setEditTelegramChatId('');
                        alert('✅ تم حفظ الإعدادات بنجاح!');
                      }}
                      className="btn-premium-primary text-xs py-3 px-6 cursor-pointer"
                    >
                      حفظ إعدادات التواصل والتنبيهات 💾
                    </button>
                  </div>

                  {/* Currency & Exchange Rate */}
                  <div className="card-glass flat p-6 bg-white/90 border-white shadow-sm space-y-5">
                    <h3 className="font-extrabold text-sm text-gray-800 border-b pb-3">💱 إعدادات سعر الصرف (الافتراضي دينار عراقي)</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-1.5">
                        <label className="text-xs font-black text-gray-700">عملة التسعير الحالية</label>
                        <select
                          disabled
                          value="IQD"
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold text-xs bg-gray-50 text-gray-500 cursor-not-allowed"
                        >
                          <option value="IQD">🇮🇶 دينار عراقي (IQD) - افتراضي بالكامل</option>
                        </select>
                        <p className="text-[10px] text-gray-400">تم تثبيت عملة الموقع على الدينار العراقي بالكامل.</p>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-black text-gray-700">سعر الصرف الداخلي (1 USD = ? IQD)</label>
                        <input
                          type="number"
                          min="1"
                          value={exchangeRate}
                          onChange={e => setExchangeRate(parseFloat(e.target.value) || 1480)}
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold text-xs bg-white"
                        />
                        <p className="text-[10px] text-gray-400">سعر الصرف الداخلي للتحويل إذا تم إدخال قيم خارجية: {exchangeRate.toLocaleString('en-US')} دينار</p>
                      </div>
                    </div>
                  </div>

                  {/* Smart Finder Budget Ranges Config */}
                  <div className="card-glass flat p-6 bg-white/90 border-white shadow-sm space-y-5">
                    <h3 className="font-extrabold text-sm text-gray-800 border-b pb-3">🧭 حدود الفئات السعرية للمساعد الذكي</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-1.5">
                        <label className="text-xs font-black text-gray-700">الحد الفاصل للفئة الاقتصادية (بالدولار $)</label>
                        <input
                          type="number"
                          min="10"
                          value={budgetLimitLow}
                          onChange={e => updateBudgetLimits(parseInt(e.target.value, 10) || 900, budgetLimitHigh)}
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold text-xs bg-white"
                        />
                        <p className="text-[10px] text-gray-400">أي جهاز سعره أقل من هذه القيمة يعتبر فئة اقتصادية.</p>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-black text-gray-700">الحد الفاصل للفئة العليا (بالدولار $)</label>
                        <input
                          type="number"
                          min="10"
                          value={budgetLimitHigh}
                          onChange={e => updateBudgetLimits(budgetLimitLow, parseInt(e.target.value, 10) || 1300)}
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold text-xs bg-white"
                        />
                        <p className="text-[10px] text-gray-400">أي جهاز سعره أعلى من هذه القيمة يعتبر فئة عليا.</p>
                      </div>
                    </div>

                    <div className="bg-indigo-50/50 text-indigo-900 rounded-xl p-3.5 text-[11px] font-bold space-y-1">
                      <div>💵 الفئة الاقتصادية: أقل من ${budgetLimitLow}</div>
                      <div>💳 الفئة المتوسطة: بين ${budgetLimitLow} و ${budgetLimitHigh}</div>
                      <div>💎 الفئة الاحترافية (العليا): أكثر من ${budgetLimitHigh}</div>
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
                      onClick={async () => {
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
                        await updateAdminCredentials(newAdminUser, newAdminPass);
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

      {/* My Orders Full Page Display */}
      {activeTab === 'my-orders' && (
        <main className="container mx-auto px-6 py-12 flex-1 max-w-4xl text-right" dir="rtl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 border-b pb-6 border-gray-200/40">
            <div>
              <h2 className="text-3xl font-black text-gray-900 flex items-center gap-2.5">
                <Receipt size={32} className="text-indigo-650" />
                <span>سجل المشتريات والطلبات السابقة</span>
              </h2>
              <p className="text-xs text-gray-400 mt-1.5">تُحفظ الفواتير محلياً في متصفحك لمتابعة عمليات الشراء والتجهيز بسهولة.</p>
            </div>
            
            <div className="flex gap-2.5">
              <button 
                onClick={() => setActiveTab('cart')}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl cursor-pointer transition-all shadow-md shadow-indigo-100"
              >
                الرجوع إلى السلة
              </button>
              <button 
                onClick={() => setActiveTab('home')}
                className="px-4 py-2.5 bg-white hover:bg-gray-50 border border-gray-250 text-gray-600 font-extrabold text-xs rounded-xl cursor-pointer transition-all"
              >
                الرئيسية
              </button>
            </div>
          </div>

          {myOrders.length === 0 ? (
            <div className="card-glass p-16 text-center text-gray-400 bg-white/70 max-w-xl mx-auto border-white/40 shadow-sm">
              <Receipt size={56} className="mx-auto mb-4 text-gray-300" />
              <h3 className="font-extrabold text-base text-gray-700 mb-2">لا توجد طلبات سابقة</h3>
              <p className="text-xs mb-6">لم تقم بإرسال أي طلبات شراء من هذا المتصفح بعد.</p>
              <button 
                onClick={() => setActiveTab('home')}
                className="btn-premium-primary inline-flex justify-center cursor-pointer mx-auto text-xs"
              >
                <span>ابدأ التسوق الآن</span>
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {myOrders.map((order, idx) => (
                <div key={idx} className="card-glass flat p-6 bg-white/90 border-white shadow-sm space-y-4">
                  {/* Order Head info */}
                  <div className="flex justify-between items-center border-b border-gray-150 pb-3">
                    <div className="flex items-center gap-3">
                      <span className="font-black text-sm text-gray-900">طلب رقم: {order.id}</span>
                    </div>
                    <span className="text-[11px] text-gray-400 font-bold">{order.date}</span>
                  </div>

                  {/* Customer info */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-gray-50/50 p-4 rounded-2xl border border-gray-150 text-xs font-bold text-gray-600">
                    <div>
                      <span className="text-[10px] text-gray-400 block mb-0.5">المستلم:</span>
                      <span className="text-gray-900">{order.customer_name}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 block mb-0.5">الهاتف:</span>
                      <span className="text-gray-900" dir="ltr">{order.customer_phone}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 block mb-0.5">عنوان التوصيل:</span>
                      <span className="text-gray-900">{order.customer_address}</span>
                    </div>
                  </div>

                  {/* Items List */}
                  <div className="space-y-2">
                    <span className="text-xs font-black text-gray-800 block">تفاصيل الفاتورة والمشتريات:</span>
                    <div className="border border-gray-150/70 rounded-2xl overflow-hidden">
                      <table className="w-full text-right text-xs" dir="rtl">
                        <thead>
                          <tr className="bg-gray-50/80 text-gray-500 font-black border-b border-gray-150">
                            <th className="p-3.5">المنتج</th>
                            <th className="p-3.5 text-center w-24">الكمية</th>
                            <th className="p-3.5 text-left w-36">السعر الإجمالي</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 font-bold text-gray-700">
                          {order.items?.map((it: any, itIdx: number) => (
                            <tr key={itIdx} className="hover:bg-gray-50/30">
                              <td className="p-3.5">{it.title}</td>
                              <td className="p-3.5 text-center">{it.quantity}</td>
                              <td className="p-3.5 text-left text-gray-900 font-black">
                                {formatIQD(it.price * it.quantity)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Summary Total */}
                  <div className="flex justify-between items-center pt-3 border-t border-dashed border-gray-200">
                    <span className="text-xs text-gray-400 font-extrabold">تم إرسال نسخة من الفاتورة إلى البوت وواتساب المتجر للمتابعة.</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xs font-bold text-gray-500">القيمة الإجمالية:</span>
                      <span className="text-indigo-600 font-black text-xl">{formatIQD(order.total_price)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      )}

      {/* Order Success Full Page Display */}
      {activeTab === 'order-success' && lastCompletedOrder && (
        <main className="container mx-auto px-6 py-12 flex-1 max-w-2xl text-right animate-fadeIn" dir="rtl">
          <div className="card-glass flat p-8 bg-white/95 border-white shadow-2xl space-y-6 text-center">
            {/* Success Animation / Icon */}
            <div className="w-20 h-20 mx-auto bg-green-50 rounded-full flex items-center justify-center border-2 border-green-200 shadow-sm">
              <CheckCircle size={44} className="text-green-600 animate-pulse" />
            </div>

            {/* Thank you statement */}
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-gray-900">❤️ شكراً لتسوقك من متجر الأسطورة!</h2>
              <p className="text-sm text-gray-600 font-bold max-w-md mx-auto leading-relaxed">
                طلبك الآن تحت المراجعة، وسيتم التواصل معك مباشرة على تطبيق واتساب لتأكيد موعد التوصيل وخطوات التسليم.
              </p>
            </div>

            {/* Invoice card */}
            <div className="border border-gray-200/80 rounded-3xl p-6 bg-gray-50/50 text-right space-y-4 shadow-sm">
              <div className="flex justify-between items-center border-b pb-3">
                <span className="font-extrabold text-sm text-gray-900">رقم الفاتورة: {lastCompletedOrder.id}</span>
                <span className="text-xs text-gray-400 font-bold">{new Date().toLocaleDateString('ar-IQ')}</span>
              </div>

              {/* Items Summary Table */}
              <div className="space-y-2">
                <span className="text-xs font-black text-gray-450 block">قائمة الأجهزة والملحقات المطلوبة:</span>
                <div className="border border-gray-150 rounded-2xl bg-white overflow-hidden text-xs">
                  <table className="w-full text-right" dir="rtl">
                    <thead>
                      <tr className="bg-gray-50 text-gray-500 font-bold border-b border-gray-150">
                        <th className="p-3">المنتج</th>
                        <th className="p-3 text-center w-20">الكمية</th>
                        <th className="p-3 text-left w-32">السعر</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 font-semibold text-gray-700">
                      {lastCompletedOrder.items?.map((it: any, idx: number) => (
                        <tr key={idx}>
                          <td className="p-3">{it.title}</td>
                          <td className="p-3 text-center">{it.quantity}</td>
                          <td className="p-3 text-left text-gray-950 font-black">{formatIQD(it.price * it.quantity)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Order total info */}
              <div className="border-t border-dashed pt-3 space-y-1.5 text-xs font-bold text-gray-600">
                <div className="flex justify-between">
                  <span>أجور التوصيل:</span>
                  <span className="text-gray-900">{lastCompletedOrder.deliveryCost > 0 ? formatIQD(lastCompletedOrder.deliveryCost) : 'توصيل مجاني'}</span>
                </div>
                <div className="flex justify-between text-sm font-black text-gray-950 pt-1 border-t">
                  <span>المبلغ الإجمالي المستحق:</span>
                  <span className="text-indigo-650 text-lg">{formatIQD(lastCompletedOrder.finalCartTotal)}</span>
                </div>
              </div>
            </div>

            {/* Back to Home Button */}
            <div className="pt-4">
              <button 
                onClick={() => {
                  setLastCompletedOrder(null);
                  setActiveTab('home');
                }}
                className="btn-premium-primary text-xs py-3.5 px-8 cursor-pointer shadow-md inline-flex items-center gap-1.5"
              >
                <span>العودة للرئيسية</span>
              </button>
            </div>
          </div>
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
              <li>📍 {storeAddress}</li>
              <li>📞 هاتف المتجر: {storePhone}</li>
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



      {/* Custom Delete Confirmation Modal */}
      {isDeleteModalOpen && productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" dir="rtl">
          <div className="card-glass max-w-sm w-full bg-white p-6 relative border-gray-100 shadow-2xl text-center space-y-5">
            {/* Warning icon */}
            <div className="w-14 h-14 mx-auto bg-red-50 rounded-full flex items-center justify-center border border-red-100">
              <Trash2 size={26} className="text-red-500" />
            </div>

            <div className="space-y-1 text-right">
              <h3 className="text-base font-black text-gray-900 text-center">تأكيد حذف المنتج</h3>
              <p className="text-xs text-gray-500 text-center leading-relaxed">
                هل أنت متأكد من إزالة <span className="font-extrabold text-gray-800">"{productToDelete.title}"</span> من قائمة معروضات المتجر نهائياً؟
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2.5 pt-2">
              <button 
                onClick={handleDeleteProduct}
                className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white font-extrabold text-xs rounded-xl cursor-pointer transition-all shadow-sm shadow-red-100"
              >
                تأكيد الحذف
              </button>
              <button 
                onClick={() => { setProductToDelete(null); setIsDeleteModalOpen(false); }}
                className="flex-1 py-2.5 bg-white hover:bg-gray-50 border border-gray-250 text-gray-600 font-extrabold text-xs rounded-xl cursor-pointer transition-all"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Category Delete Confirmation Modal */}
      {isCategoryDeleteModalOpen && categoryToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" dir="rtl">
          <div className="card-glass max-w-sm w-full bg-white p-6 relative border-gray-100 shadow-2xl text-center space-y-5">
            {/* Warning icon */}
            <div className="w-14 h-14 mx-auto bg-red-50 rounded-full flex items-center justify-center border border-red-100">
              <Trash2 size={26} className="text-red-500" />
            </div>

            <div className="space-y-1 text-right">
              <h3 className="text-base font-black text-gray-900 text-center">تأكيد حذف القسم</h3>
              <p className="text-xs text-gray-500 text-center leading-relaxed">
                هل أنت متأكد من حذف قسم <span className="font-extrabold text-gray-800">"{categoryToDelete.name}"</span> نهائياً؟
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2.5 pt-2">
              <button 
                onClick={handleDeleteCategory}
                className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white font-extrabold text-xs rounded-xl cursor-pointer transition-all shadow-sm shadow-red-100"
              >
                تأكيد الحذف
              </button>
              <button 
                onClick={() => { setCategoryToDelete(null); setIsCategoryDeleteModalOpen(false); }}
                className="flex-1 py-2.5 bg-white hover:bg-gray-50 border border-gray-250 text-gray-600 font-extrabold text-xs rounded-xl cursor-pointer transition-all"
              >
                إلغاء
              </button>
            </div>
          </div>
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
                  <div className="mb-4">{renderProductPrice(quickViewProduct)}</div>
                  
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
      )}      {isCategoryModalOpen && editingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          {/* Backdrop overlay */}
          <div 
            className="absolute inset-0 cursor-pointer"
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

            <form onSubmit={async (e) => {
              e.preventDefault();
              if (editingCategory.isNew) {
                // Check if ID already exists
                if (categories.some(c => c.id === editingCategory.id)) {
                  alert("معرف التصنيف هذا موجود بالفعل! يرجى استخدام معرف فريد.");
                  return;
                }
              }
              
              try {
                const response = await fetch('/api/categories', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    id: editingCategory.id,
                    name: editingCategory.name,
                    type: editingCategory.type
                  })
                });
                if (response.ok) {
                  alert("تم حفظ التصنيف بنجاح!");
                  fetchCategories();
                  setIsCategoryModalOpen(false);
                } else {
                  alert("فشل في حفظ التصنيف.");
                }
              } catch (err) {
                alert("حدث خطأ أثناء الاتصال بالخادم.");
              }
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
                  <option value="home">🏠 الرئيسية (عرض خاص)</option>
                </select>
              </div>

              <button type="submit" className="w-full btn-premium-primary justify-center py-3 text-xs flex items-center gap-2 cursor-pointer mt-4">
                <span>حفظ التصنيف</span>
              </button>
            </form>
          </div>
        </div>
      )}


      {/* Add/Edit Product Modal Overlay */}
      {isAdminModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          {/* Backdrop overlay */}
          <div 
            className="absolute inset-0 cursor-pointer"
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
                    {mainCatLaptopName && <option value="laptop">{mainCatLaptopName}</option>}
                    {mainCatAccessoryName && <option value="accessory">{mainCatAccessoryName}</option>}
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
                    {(categories as any[])
                      .filter(c => c.type === adminForm.category || c.type === 'home')
                      .map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name} ({cat.type === 'home' ? 'رئيسية' : 'عام'})</option>
                      ))
                    }
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-black text-gray-700">السعر بالدينار العراقي (د.ع) *</label>
                  <input 
                    type="number" 
                    placeholder="مثال: 1500000"
                    value={adminForm.price}
                    onChange={e => setAdminForm(prev => ({ ...prev, price: e.target.value }))}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500/20 bg-white focus:outline-none font-bold text-xs text-right"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-black text-gray-700">سعر الخصم / التخفيض (اختياري)</label>
                  <input 
                    type="number" 
                    placeholder="مثال: 1250000"
                    value={adminForm.discount_price}
                    onChange={e => setAdminForm(prev => ({ ...prev, discount_price: e.target.value }))}
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

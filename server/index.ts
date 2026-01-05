import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mock Data Store
const PRODUCTS = [
  {
    id: "p1",
    tenant_id: "t1",
    name: "プレミアムTシャツ",
    description: "最高級コットン100%使用。着心地抜群のTシャツです。",
    status: "public",
    category_id: "c1",
    sort_order: 100,
    base_price: 3500,
    shipping_rule: "global",
    stock_control_flg: true,
    images: [
      { id: "img1", product_id: "p1", image_url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80", sort_order: 1, created_at: new Date().toISOString() }
    ],
    variants: [
      { id: "v1", product_id: "p1", option_name: "サイズ", option_value: "S", price: 3500, stock: 10, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: "v2", product_id: "p1", option_name: "サイズ", option_value: "M", price: 3500, stock: 15, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: "v3", product_id: "p1", option_name: "サイズ", option_value: "L", price: 3500, stock: 5, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "p2",
    tenant_id: "t1",
    name: "オーガニックトートバッグ",
    description: "環境に優しい素材で作られた丈夫なトートバッグ。",
    status: "public",
    category_id: "c2",
    sort_order: 200,
    base_price: 2800,
    shipping_rule: "global",
    stock_control_flg: true,
    images: [
      { id: "img2", product_id: "p2", image_url: "https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&q=80", sort_order: 1, created_at: new Date().toISOString() }
    ],
    variants: [
      { id: "v4", product_id: "p2", option_name: "カラー", option_value: "ナチュラル", price: 2800, stock: 20, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: "v5", product_id: "p2", option_name: "カラー", option_value: "ブラック", price: 2800, stock: 8, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "p3",
    tenant_id: "t1",
    name: "セラミックマグカップ",
    description: "手作りの温かみのあるマグカップ。ギフトにも最適。",
    status: "public",
    category_id: "c3",
    sort_order: 300,
    base_price: 1800,
    shipping_rule: "global",
    stock_control_flg: true,
    images: [
      { id: "img3", product_id: "p3", image_url: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=800&q=80", sort_order: 1, created_at: new Date().toISOString() }
    ],
    variants: [
      { id: "v6", product_id: "p3", option_name: "カラー", option_value: "ブルー", price: 1800, stock: 30, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

let CARTS: any[] = [];
let ORDERS: any[] = [];
let PAYMENTS: any[] = [];

// Mock Pages
let STATIC_PAGES: any[] = [
  {
    id: "sp_1",
    tenant_id: "t1",
    title: "About Us",
    content: "<h1>私たちについて</h1><p>私たちは最高品質の商品をお届けすることに情熱を注いでいます。</p>",
    seo_title: "About Us - L-Cart Shop",
    seo_description: "L-Cart Shopの理念と歴史についてご紹介します。",
    handle: "about-us",
    status: "published",
    template_key: "default",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

let PAGES: any[] = [
  {
    id: "page_1",
    tenant_id: "t1",
    type: "SHOP",
    title: "サマーセール特設ページ",
    slug: "summer-sale",
    status: "PUBLISHED",
    template_key: "landing_page_v1",
    blocks: [
      {
        id: "blk_1",
        page_id: "page_1",
        block_type: "HERO_IMAGE",
        sort_order: 1,
        config_json: {
          image_url: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=1200&q=80",
          headline: "夏物最大50%OFF",
          subheadline: "今だけの特別価格でご提供"
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: "blk_2",
        page_id: "page_1",
        block_type: "TEXT",
        sort_order: 2,
        config_json: {
          content: "今年の夏は、涼しくて快適な素材にこだわりました。オーガニックコットンを使用したTシャツや、通気性抜群のリネンシャツなど、厳選したアイテムを取り揃えています。"
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: "blk_3",
        page_id: "page_1",
        block_type: "PRODUCT_LIST",
        sort_order: 3,
        config_json: {
          title: "おすすめ商品",
          count: 4
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// Integrations Mock Data
let INTEGRATION_SHOPIFY: any = {
  id: "int_shopify_1",
  tenant_id: "t1",
  shop_url: "",
  access_token: "",
  sync_products: false,
  sync_orders: false,
  status: "inactive",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

let INTEGRATION_LINE_OFFICIAL: any = {
  id: "int_line_official_1",
  tenant_id: "t1",
  channel_id: "",
  channel_secret: "",
  webhook_url: "https://api.l-cart.com/webhooks/line/t1",
  status: "inactive",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

let INTEGRATION_LINE_ADS: any = {
  id: "int_line_ads_1",
  tenant_id: "t1",
  line_tag_id: "",
  enable_conversion_tracking: false,
  enable_audience_sync: false,
  status: "inactive",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

async function startServer() {
  const app = express();
  app.use(express.json());
  const server = createServer(app);

  // API Routes
  const apiRouter = express.Router();

  // Products
  apiRouter.get("/products", (req, res) => {
    res.json(PRODUCTS);
  });

  apiRouter.post("/products", (req, res) => {
    const { name, description, status, base_price, images, variants, shipping_rule, stock_control_flg } = req.body;
    
    const newProduct = {
      id: `p_${Date.now()}`,
      tenant_id: "t1",
      name,
      description,
      status: status || "private",
      category_id: "c1",
      sort_order: PRODUCTS.length * 100 + 100,
      base_price: base_price || 0,
      shipping_rule: shipping_rule || "global",
      stock_control_flg: stock_control_flg ?? true,
      images: images || [],
      variants: variants || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Assign IDs to new variants if missing
    if (newProduct.variants) {
      newProduct.variants.forEach((v: any, index: number) => {
        if (!v.id) v.id = `v_${Date.now()}_${index}`;
        if (!v.product_id) v.product_id = newProduct.id;
      });
    }

    PRODUCTS.push(newProduct);
    res.status(201).json(newProduct);
  });

  apiRouter.get("/products/:id", (req, res) => {
    const product = PRODUCTS.find(p => p.id === req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
  });

  apiRouter.put("/products/:id", (req, res) => {
    const productIndex = PRODUCTS.findIndex(p => p.id === req.params.id);
    if (productIndex === -1) return res.status(404).json({ error: "Product not found" });
    
    const updates = req.body;
    const currentProduct = PRODUCTS[productIndex];

    // Update product fields
    const updatedProduct = {
      ...currentProduct,
      ...updates,
      updated_at: new Date().toISOString()
    };

    // Handle variants specifically if provided
    if (updates.variants && Array.isArray(updates.variants)) {
      // Ensure all variants have IDs and product_id
      updatedProduct.variants = updates.variants.map((v: any, index: number) => ({
        ...v,
        id: v.id || `v_${Date.now()}_${index}`,
        product_id: currentProduct.id,
        updated_at: new Date().toISOString(),
        created_at: v.created_at || new Date().toISOString()
      }));
    }

    PRODUCTS[productIndex] = updatedProduct;
    res.json(updatedProduct);
  });

  // Cart
  apiRouter.get("/cart", (req, res) => {
    // Mock user_id from header or default
    const userId = req.headers["x-user-id"] || "u1";
    let cart = CARTS.find(c => c.user_id === userId && c.is_active);
    
    if (!cart) {
      cart = {
        id: `c_${Date.now()}`,
        tenant_id: "t1",
        user_id: userId,
        is_active: true,
        items: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      CARTS.push(cart);
    }
    res.json(cart);
  });

  apiRouter.post("/cart/items", (req, res) => {
    const userId = req.headers["x-user-id"] || "u1";
    const { product_id, variant_id, quantity } = req.body;
    
    let cart = CARTS.find(c => c.user_id === userId && c.is_active);
    if (!cart) {
      cart = {
        id: `c_${Date.now()}`,
        tenant_id: "t1",
        user_id: userId,
        is_active: true,
        items: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      CARTS.push(cart);
    }

    const existingItem = cart.items.find((i: any) => i.variant_id === variant_id);
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({
        id: `ci_${Date.now()}`,
        cart_id: cart.id,
        product_id,
        variant_id,
        quantity,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }
    
    res.json(cart);
  });

  apiRouter.delete("/cart/items/:id", (req, res) => {
    const userId = req.headers["x-user-id"] || "u1";
    const cart = CARTS.find(c => c.user_id === userId && c.is_active);
    if (cart) {
      cart.items = cart.items.filter((i: any) => i.id !== req.params.id);
    }
    res.json(cart);
  });

  // Orders
  apiRouter.post("/orders", (req, res) => {
    const userId = req.headers["x-user-id"] || "u1";
    const { shipping_info, note } = req.body;
    
    const cart = CARTS.find(c => c.user_id === userId && c.is_active);
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    // Check stock and calculate totals
    let subtotal = 0;
    const orderItems = [];

    for (const item of cart.items) {
      const product = PRODUCTS.find(p => p.id === item.product_id);
      const variant = product?.variants.find(v => v.id === item.variant_id);
      
      if (!product || !variant) {
        return res.status(400).json({ error: "Invalid item in cart" });
      }

      if (variant.stock < item.quantity) {
        return res.status(409).json({ error: `Stock shortage for ${product.name} (${variant.option_value})` });
      }

      // Reduce stock
      variant.stock -= item.quantity;
      
      subtotal += variant.price * item.quantity;
      orderItems.push({
        id: `oi_${Date.now()}_${item.id}`,
        product_id: product.id,
        variant_id: variant.id,
        product_name: product.name,
        variant_name: variant.option_value,
        price: variant.price,
        quantity: item.quantity,
        tax_rate: 0.1
      });
    }

    const order = {
      id: `o_${Date.now()}`,
      tenant_id: "t1",
      order_no: `ORD-${Date.now()}`,
      user_id: userId,
      status: "awaiting_payment",
      subtotal,
      tax_total: Math.floor(subtotal * 0.1),
      shipping_fee: 500,
      discount_total: 0,
      grand_total: Math.floor(subtotal * 1.1) + 500,
      currency: "JPY",
      shipping_info_json: shipping_info,
      customer_note: note,
      items: orderItems,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    ORDERS.push(order);
    
    // Clear cart
    cart.items = [];

    res.status(201).json(order);
  });

  apiRouter.get("/orders", (req, res) => {
    res.json(ORDERS);
  });

  apiRouter.get("/orders/:id", (req, res) => {
    const order = ORDERS.find(o => o.id === req.params.id);
    if (!order) return res.status(404).json({ error: "Order not found" });
    res.json(order);
  });

  // Payments
  apiRouter.post("/payments", (req, res) => {
    const { order_id, provider, amount } = req.body;
    
    const payment = {
      id: `pay_${Date.now()}`,
      tenant_id: "t1",
      order_id,
      provider,
      status: "succeeded", // Mock success
      amount,
      currency: "JPY",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    PAYMENTS.push(payment);

    // Update order status
    const order = ORDERS.find(o => o.id === order_id);
    if (order) {
      order.status = "paid";
      order.paid_at = new Date().toISOString();
      order.updated_at = new Date().toISOString();
    }

    res.json(payment);
  });

  apiRouter.post("/webhooks/payment", (req, res) => {
    const { payment_id, status } = req.body;
    
    const payment = PAYMENTS.find(p => p.id === payment_id);
    if (!payment) return res.status(404).json({ error: "Payment not found" });

    payment.status = status;
    payment.updated_at = new Date().toISOString();

    if (status === "succeeded") {
      const order = ORDERS.find(o => o.id === payment.order_id);
      if (order) {
        order.status = "paid";
        order.paid_at = new Date().toISOString();
        order.updated_at = new Date().toISOString();
      }
    }

    res.json({ success: true });
  });

  // Pages (LP Builder)
  apiRouter.get("/admin/pages", (req, res) => {
    res.json(PAGES);
  });

  apiRouter.get("/admin/pages/:id", (req, res) => {
    const page = PAGES.find(p => p.id === req.params.id);
    if (!page) return res.status(404).json({ error: "Page not found" });
    res.json(page);
  });

  apiRouter.post("/admin/pages", (req, res) => {
    const { title, slug, template_key } = req.body;
    const newPage = {
      id: `page_${Date.now()}`,
      tenant_id: "t1",
      type: "SHOP",
      title,
      slug,
      status: "DRAFT",
      template_key: template_key || "top_default",
      blocks: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    PAGES.push(newPage);
    res.status(201).json(newPage);
  });

  apiRouter.put("/admin/pages/:id", (req, res) => {
    const pageIndex = PAGES.findIndex(p => p.id === req.params.id);
    if (pageIndex === -1) return res.status(404).json({ error: "Page not found" });
    
    const updates = req.body;
    PAGES[pageIndex] = { ...PAGES[pageIndex], ...updates, updated_at: new Date().toISOString() };
    res.json(PAGES[pageIndex]);
  });

  apiRouter.get("/s/:slug", (req, res) => {
    const page = PAGES.find(p => p.slug === req.params.slug && p.status === "PUBLISHED");
    if (!page) return res.status(404).json({ error: "Page not found" });
    res.json(page);
  });

  // Static Pages (Shopify-like)
  apiRouter.get("/admin/static-pages", (req, res) => {
    res.json(STATIC_PAGES);
  });

  apiRouter.get("/admin/static-pages/:id", (req, res) => {
    const page = STATIC_PAGES.find(p => p.id === req.params.id);
    if (!page) return res.status(404).json({ error: "Page not found" });
    res.json(page);
  });

  apiRouter.post("/admin/static-pages", (req, res) => {
    const { title } = req.body;
    // Simple handle generation
    const handle = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || `page-${Date.now()}`;
    
    const newPage = {
      id: `sp_${Date.now()}`,
      tenant_id: "t1",
      title,
      content: "",
      seo_title: title,
      seo_description: "",
      handle,
      status: "draft",
      template_key: "default",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    STATIC_PAGES.push(newPage);
    res.status(201).json(newPage);
  });

  apiRouter.put("/admin/static-pages/:id", (req, res) => {
    const pageIndex = STATIC_PAGES.findIndex(p => p.id === req.params.id);
    if (pageIndex === -1) return res.status(404).json({ error: "Page not found" });
    
    const updates = req.body;
    STATIC_PAGES[pageIndex] = { ...STATIC_PAGES[pageIndex], ...updates, updated_at: new Date().toISOString() };
    res.json(STATIC_PAGES[pageIndex]);
  });

  apiRouter.delete("/admin/static-pages/:id", (req, res) => {
    STATIC_PAGES = STATIC_PAGES.filter(p => p.id !== req.params.id);
    res.json({ success: true });
  });

  apiRouter.get("/pages/:handle", (req, res) => {
    const page = STATIC_PAGES.find(p => p.handle === req.params.handle);
    
    // Check visibility logic
    if (!page) return res.status(404).json({ error: "Page not found" });
    
    const now = new Date();
    const isPublished = page.status === "published";
    const isScheduled = page.status === "scheduled" && page.publish_at && new Date(page.publish_at) <= now;
    
    // In a real app, admin users could see drafts. For now, only public.
    if (!isPublished && !isScheduled) {
      return res.status(404).json({ error: "Page not found" });
    }
    
    res.json(page);
  });

  // Integrations API
  apiRouter.get("/admin/integrations/shopify", (req, res) => {
    res.json(INTEGRATION_SHOPIFY);
  });

  apiRouter.put("/admin/integrations/shopify", (req, res) => {
    INTEGRATION_SHOPIFY = { ...INTEGRATION_SHOPIFY, ...req.body, updated_at: new Date().toISOString() };
    if (INTEGRATION_SHOPIFY.shop_url && INTEGRATION_SHOPIFY.access_token) {
      INTEGRATION_SHOPIFY.status = "active";
    }
    res.json(INTEGRATION_SHOPIFY);
  });

  apiRouter.post("/admin/integrations/shopify/sync", (req, res) => {
    INTEGRATION_SHOPIFY.last_synced_at = new Date().toISOString();
    res.json({ success: true, message: "Sync started" });
  });

  apiRouter.get("/admin/integrations/line-official", (req, res) => {
    res.json(INTEGRATION_LINE_OFFICIAL);
  });

  apiRouter.put("/admin/integrations/line-official", (req, res) => {
    INTEGRATION_LINE_OFFICIAL = { ...INTEGRATION_LINE_OFFICIAL, ...req.body, updated_at: new Date().toISOString() };
    if (INTEGRATION_LINE_OFFICIAL.channel_id && INTEGRATION_LINE_OFFICIAL.channel_secret) {
      INTEGRATION_LINE_OFFICIAL.status = "active";
    }
    res.json(INTEGRATION_LINE_OFFICIAL);
  });

  apiRouter.get("/admin/integrations/line-ads", (req, res) => {
    res.json(INTEGRATION_LINE_ADS);
  });

  apiRouter.put("/admin/integrations/line-ads", (req, res) => {
    INTEGRATION_LINE_ADS = { ...INTEGRATION_LINE_ADS, ...req.body, updated_at: new Date().toISOString() };
    if (INTEGRATION_LINE_ADS.line_tag_id) {
      INTEGRATION_LINE_ADS.status = "active";
    }
    res.json(INTEGRATION_LINE_ADS);
  });

  app.use("/api", apiRouter);

  // Serve static files from dist/public in production
  const staticPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "dist", "public");

  app.use(express.static(staticPath));

  // Handle client-side routing - serve index.html for all routes
  app.get("*", (_req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });

  const port = process.env.PORT || 3000;

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);

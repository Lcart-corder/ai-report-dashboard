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
    images: ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80"],
    is_active: true,
    variants: [
      { id: "v1", product_id: "p1", sku: "TS-W-S", name: "ホワイト / S", price: 3500, stock_quantity: 10, is_active: true },
      { id: "v2", product_id: "p1", sku: "TS-W-M", name: "ホワイト / M", price: 3500, stock_quantity: 15, is_active: true },
      { id: "v3", product_id: "p1", sku: "TS-W-L", name: "ホワイト / L", price: 3500, stock_quantity: 5, is_active: true },
    ]
  },
  {
    id: "p2",
    tenant_id: "t1",
    name: "オーガニックトートバッグ",
    description: "環境に優しい素材で作られた丈夫なトートバッグ。",
    images: ["https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&q=80"],
    is_active: true,
    variants: [
      { id: "v4", product_id: "p2", sku: "TB-NAT", name: "ナチュラル", price: 2800, stock_quantity: 20, is_active: true },
      { id: "v5", product_id: "p2", sku: "TB-BLK", name: "ブラック", price: 2800, stock_quantity: 8, is_active: true },
    ]
  },
  {
    id: "p3",
    tenant_id: "t1",
    name: "セラミックマグカップ",
    description: "手作りの温かみのあるマグカップ。ギフトにも最適。",
    images: ["https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=800&q=80"],
    is_active: true,
    variants: [
      { id: "v6", product_id: "p3", sku: "MG-BLU", name: "ブルー", price: 1800, stock_quantity: 30, is_active: true },
    ]
  }
];

let CARTS: any[] = [];
let ORDERS: any[] = [];
let PAYMENTS: any[] = [];

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

  apiRouter.get("/products/:id", (req, res) => {
    const product = PRODUCTS.find(p => p.id === req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
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

    // Calculate totals
    let subtotal = 0;
    const orderItems = cart.items.map((item: any) => {
      const product = PRODUCTS.find(p => p.id === item.product_id);
      const variant = product?.variants.find(v => v.id === item.variant_id);
      if (!product || !variant) throw new Error("Invalid item");
      
      const price = variant.price;
      subtotal += price * item.quantity;
      
      return {
        id: `oi_${Date.now()}_${item.id}`,
        product_id: item.product_id,
        variant_id: item.variant_id,
        product_name: product.name,
        variant_name: variant.name,
        price: price,
        tax_rate: 0.1,
        quantity: item.quantity
      };
    });

    const shipping_fee = subtotal > 5000 ? 0 : 500;
    const tax_total = Math.floor(subtotal * 0.1);
    const grand_total = subtotal + tax_total + shipping_fee;

    const order = {
      id: `o_${Date.now()}`,
      tenant_id: "t1",
      order_no: `ORD-${Date.now()}`,
      user_id: userId,
      status: "awaiting_payment",
      subtotal,
      tax_total,
      shipping_fee,
      discount_total: 0,
      grand_total,
      currency: "JPY",
      shipping_info_json: shipping_info,
      customer_note: note,
      items: orderItems,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    ORDERS.push(order);
    
    // Clear cart
    cart.is_active = false;
    
    res.json(order);
  });

  apiRouter.get("/orders/:id", (req, res) => {
    const order = ORDERS.find(o => o.id === req.params.id);
    if (!order) return res.status(404).json({ error: "Order not found" });
    res.json(order);
  });

  apiRouter.get("/orders", (req, res) => {
    const userId = req.headers["x-user-id"] || "u1";
    const userOrders = ORDERS.filter(o => o.user_id === userId);
    res.json(userOrders);
  });

  // Payments
  apiRouter.post("/orders/:id/payments", (req, res) => {
    const order = ORDERS.find(o => o.id === req.params.id);
    if (!order) return res.status(404).json({ error: "Order not found" });

    const payment = {
      id: `pay_${Date.now()}`,
      tenant_id: order.tenant_id,
      order_id: order.id,
      provider: "stripe",
      status: "initiated",
      amount: order.grand_total,
      currency: order.currency,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    PAYMENTS.push(payment);
    
    // Mock payment URL
    res.json({
      payment_id: payment.id,
      pay_url: `/checkout/pay/${payment.id}`, // Internal mock page
      expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString()
    });
  });

  // Mock Webhook (for testing)
  apiRouter.post("/payments/webhook/mock", (req, res) => {
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

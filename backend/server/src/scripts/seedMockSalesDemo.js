import { db } from "../config/db.js";

const MOCK_PREFIX = "mock-demo-sales-full";
const PRODUCT_PREFIX = `[${MOCK_PREFIX}]`;

const MOCK_USERS = {
  buyer: {
    user_name: "Mock Buyer Sales Demo",
    user_email: "mock.demo.sales.buyer@unieed.local",
    role: "user",
  },
  sellers: [
    {
      user_name: "ร้าน Demo Uniform A",
      user_email: "mock.demo.sales.seller01@unieed.local",
      bank_account_number: "1111222233",
      bank_code: "kbank",
      bank_account_name: "เดโม ยูนิฟอร์ม เอ",
    },
    {
      user_name: "ร้าน Demo Uniform B",
      user_email: "mock.demo.sales.seller02@unieed.local",
      bank_account_number: "2222333344",
      bank_code: "scb",
      bank_account_name: "เดโม ยูนิฟอร์ม บี",
    },
    {
      user_name: "ร้าน Demo Uniform C",
      user_email: "mock.demo.sales.seller03@unieed.local",
      bank_account_number: "3333444455",
      bank_code: "bbl",
      bank_account_name: "เดโม ยูนิฟอร์ม ซี",
    },
  ],
};

const PROVIDER = {
  name: "Mock Demo Express",
  code: "mock-demo",
  description: "ขนส่งสำหรับข้อมูล mock dashboard",
  base_price: 35,
  est_days_min: 1,
  est_days_max: 3,
  price_per_item: 10,
};

const UNIFORM_TYPES = [
  { key: "shirt", category_name: "เสื้อ", type_name: "Mock Demo เสื้อ", gender: "unisex", uniform_category: "เสื้อ" },
  { key: "pants", category_name: "กางเกง", type_name: "Mock Demo กางเกง", gender: "male", uniform_category: "กางเกง" },
  { key: "skirt", category_name: "กระโปรง", type_name: "Mock Demo กระโปรง", gender: "female", uniform_category: "กระโปรง" },
];

const PRODUCT_TEMPLATES = [
  {
    sellerIndex: 0,
    uniformKey: "shirt",
    categoryName: "เสื้อ",
    title: "เสื้อเชิ้ตนักเรียนชาย A",
    gender: "male",
    size: '{"chest":"36","length":"24"}',
    level: "มัธยมต้น",
    price: 180,
    imageColor: "e8f0fe",
  },
  {
    sellerIndex: 0,
    uniformKey: "shirt",
    categoryName: "เสื้อ",
    title: "เสื้อคอบัวนักเรียนหญิง A",
    gender: "female",
    size: '{"chest":"34","length":"23"}',
    level: "ประถมศึกษา",
    price: 160,
    imageColor: "fef3c7",
  },
  {
    sellerIndex: 1,
    uniformKey: "pants",
    categoryName: "กางเกง",
    title: "กางเกงนักเรียนชาย B",
    gender: "male",
    size: '{"waist":"28","length":"36"}',
    level: "มัธยมต้น",
    price: 220,
    imageColor: "dcfce7",
  },
  {
    sellerIndex: 1,
    uniformKey: "skirt",
    categoryName: "กระโปรง",
    title: "กระโปรงนักเรียนหญิง B",
    gender: "female",
    size: '{"waist":"26","length":"22"}',
    level: "มัธยมปลาย",
    price: 210,
    imageColor: "fce7f3",
  },
  {
    sellerIndex: 2,
    uniformKey: "shirt",
    categoryName: "เสื้อ",
    title: "ชุดพละนักเรียน C",
    gender: "unisex",
    size: '{"chest":"38","waist":"30"}',
    level: "ประถมศึกษา",
    price: 250,
    imageColor: "e0f2fe",
  },
  {
    sellerIndex: 2,
    uniformKey: "shirt",
    categoryName: "เสื้อ",
    title: "เสื้อกันหนาวนักเรียน C",
    gender: "unisex",
    size: '{"chest":"40","length":"26"}',
    level: "มัธยมปลาย",
    price: 300,
    imageColor: "ede9fe",
  },
];

const THAI_PROVINCES = ["กรุงเทพมหานคร", "นครปฐม", "นนทบุรี", "ปทุมธานี", "เชียงใหม่"];

function pad2(value) {
  return String(value).padStart(2, "0");
}

function formatDate(date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

function formatDateTime(date) {
  return `${formatDate(date)} ${pad2(date.getHours())}:${pad2(date.getMinutes())}:${pad2(date.getSeconds())}`;
}

function parseDate(dateText) {
  const [year, month, day] = dateText.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function addMinutes(date, minutes) {
  const next = new Date(date);
  next.setMinutes(next.getMinutes() + minutes);
  return next;
}

function atTime(date, hour, minute, second = 0) {
  const next = new Date(date);
  next.setHours(hour, minute, second, 0);
  return next;
}

function monthDate(base, monthOffset, day, hour, minute) {
  return new Date(base.getFullYear(), base.getMonth() + monthOffset, day, hour, minute, 0, 0);
}

function makeDateSlots(today) {
  const slots = [];

  for (let i = 0; i < 8; i += 1) {
    slots.push(atTime(today, 8 + i, 10 + (i % 4) * 8));
  }

  const currentMonthDays = [2, 4, 6, 8, 10, 12, 14, 15, 16, 17, 18, 20, 22, 24, 26, 28];
  currentMonthDays.forEach((day, i) => {
    slots.push(new Date(today.getFullYear(), today.getMonth(), day, 9 + (i % 8), 12 + (i % 4) * 9, 0));
  });

  const olderSpecs = [
    [-1, 4], [-1, 8], [-1, 12], [-1, 18], [-1, 24], [-1, 28],
    [-2, 5], [-2, 11], [-2, 16], [-2, 22], [-2, 27],
    [-3, 7], [-3, 15], [-3, 23],
    [-5, 6], [-5, 18], [-5, 27],
    [-8, 9], [-8, 21],
    [-10, 10], [-10, 24],
    [-11, 8], [-11, 22],
    [-12, 6], [-12, 18], [-12, 26],
  ];

  olderSpecs.forEach(([offset, day], i) => {
    slots.push(monthDate(today, offset, day, 9 + (i % 8), 20 + (i % 4) * 6));
  });

  return slots.slice(0, 50);
}

function makeStatusPlans() {
  const plans = [
    ...Array.from({ length: 6 }, () => ({ order_status: "pending", payment_status: "paid", payout_status: "pending" })),
    ...Array.from({ length: 6 }, () => ({ order_status: "confirmed", payment_status: "paid", payout_status: "pending" })),
    ...Array.from({ length: 8 }, () => ({ order_status: "shipping", payment_status: "paid", payout_status: "pending" })),
    ...Array.from({ length: 18 }, () => ({ order_status: "delivered", payment_status: "paid", payout_status: "pending" })),
    ...Array.from({ length: 10 }, () => ({ order_status: "delivered", payment_status: "paid", payout_status: "paid" })),
    ...Array.from({ length: 2 }, () => ({ order_status: "cancelled", payment_status: "unpaid", payout_status: "pending" })),
  ];

  const order = [
    0, 6, 12, 20, 38, 1, 7, 13, 21, 39,
    2, 8, 14, 22, 40, 3, 9, 15, 23, 41,
    4, 10, 16, 24, 42, 5, 11, 17, 25, 43,
    18, 26, 44, 19, 27, 45, 28, 46, 29, 47,
    30, 48, 31, 49, 32, 33, 34, 35, 36, 37,
  ];

  return order.map((index) => plans[index]);
}

function calculateAmounts(product, quantity, provider) {
  const itemSubtotal = Number(product.price) * quantity;
  const shippingPrice =
    Number(provider.base_price || 0) + Math.max(0, quantity - 1) * Number(provider.price_per_item || 0);
  const platformFee = itemSubtotal > 0 ? Math.max(Math.round(itemSubtotal * 0.15 * 100) / 100, 20) : 0;

  return {
    itemSubtotal,
    shippingPrice,
    totalPrice: itemSubtotal + shippingPrice,
    platformFee,
    sellerPayoutAmount: itemSubtotal + shippingPrice - platformFee,
  };
}

function payoutCycleKey(orderDate) {
  const payoutDate = new Date(orderDate.getFullYear(), orderDate.getMonth() + 1, 1);
  return `${payoutDate.getFullYear()}-${pad2(payoutDate.getMonth() + 1)}`;
}

function payoutCycleDate(orderDate, seed = 0) {
  return new Date(orderDate.getFullYear(), orderDate.getMonth() + 1, 2 + (seed % 5), 10 + (seed % 3), 30, 0, 0);
}

async function cleanupMockData(conn) {
  const [orders] = await conn.query(
    "SELECT order_id FROM orders WHERE omise_charge_id LIKE ?",
    [`${MOCK_PREFIX}-%`]
  );
  const orderIds = orders.map((row) => row.order_id);

  if (orderIds.length) {
    await conn.query("DELETE FROM donation_record WHERE order_id IN (?)", [orderIds]);
    await conn.query(
      `DELETE FROM notifications
       WHERE ref_id IN (?)
         AND type IN ('seller_new_order','order_paid_pending_ship','order_cancel_warning',
                      'order_auto_cancelled','order_auto_cancelled_seller',
                      'order_auto_delivered','order_delivered','order_shipped')`,
      [orderIds]
    );
    await conn.query("DELETE FROM order_shipping WHERE order_id IN (?)", [orderIds]);
    await conn.query("DELETE FROM order_items WHERE order_id IN (?)", [orderIds]);
    await conn.query("DELETE FROM orders WHERE order_id IN (?)", [orderIds]);
  }

  const [payouts] = await conn.query(
    "SELECT payout_id FROM payouts WHERE omise_transfer_id LIKE ?",
    [`${MOCK_PREFIX}-%`]
  );
  const payoutIds = payouts.map((row) => row.payout_id);

  if (payoutIds.length) {
    await conn.query("DELETE FROM notifications WHERE ref_id IN (?) AND type = 'payout_completed'", [payoutIds]);
    await conn.query("DELETE FROM payouts WHERE payout_id IN (?)", [payoutIds]);
  }

  const [products] = await conn.query(
    "SELECT product_id FROM products WHERE product_title LIKE ?",
    [`${PRODUCT_PREFIX}%`]
  );
  const productIds = products.map((row) => row.product_id);

  if (productIds.length) {
    await conn.query("DELETE FROM cart_item WHERE product_id IN (?)", [productIds]);
    await conn.query("DELETE FROM product_shipping WHERE product_id IN (?)", [productIds]);
    await conn.query("DELETE FROM product_images WHERE product_id IN (?)", [productIds]);
    await conn.query("DELETE FROM products WHERE product_id IN (?)", [productIds]);
  }
}

async function upsertUsers(conn) {
  await conn.query(
    `INSERT INTO users
      (user_name, user_email, role, status, bank_account_number, bank_code,
       bank_account_name, bank_account_verified, email_verified)
     VALUES (?, ?, 'user', 'active', NULL, NULL, NULL, 0, 1)
     ON DUPLICATE KEY UPDATE
       user_name = VALUES(user_name),
       role = 'user',
       status = 'active',
       email_verified = 1`,
    [MOCK_USERS.buyer.user_name, MOCK_USERS.buyer.user_email]
  );

  for (const seller of MOCK_USERS.sellers) {
    await conn.query(
      `INSERT INTO users
        (user_name, user_email, role, status, bank_account_number, bank_code,
         bank_account_name, bank_account_verified, email_verified)
       VALUES (?, ?, 'seller', 'active', ?, ?, ?, 1, 1)
       ON DUPLICATE KEY UPDATE
         user_name = VALUES(user_name),
         role = 'seller',
         status = 'active',
         bank_account_number = VALUES(bank_account_number),
         bank_code = VALUES(bank_code),
         bank_account_name = VALUES(bank_account_name),
         bank_account_verified = 1,
         email_verified = 1`,
      [
        seller.user_name,
        seller.user_email,
        seller.bank_account_number,
        seller.bank_code,
        seller.bank_account_name,
      ]
    );
  }

  const [[buyer]] = await conn.query("SELECT user_id FROM users WHERE user_email = ? LIMIT 1", [
    MOCK_USERS.buyer.user_email,
  ]);

  const sellerIds = [];
  for (const seller of MOCK_USERS.sellers) {
    const [[row]] = await conn.query("SELECT user_id FROM users WHERE user_email = ? LIMIT 1", [seller.user_email]);
    sellerIds.push(row.user_id);
  }

  return { buyerId: buyer.user_id, sellerIds };
}

async function getCategories(conn) {
  const names = UNIFORM_TYPES.map((type) => type.category_name);
  const [rows] = await conn.query(
    "SELECT category_id, category_name FROM category_item WHERE category_name IN (?)",
    [names]
  );

  const categories = new Map(rows.map((row) => [row.category_name, row.category_id]));
  const missing = names.filter((name) => !categories.has(name));
  if (missing.length) {
    throw new Error(`ไม่พบ category_item: ${missing.join(", ")} กรุณามี category หลัก เสื้อ/กางเกง/กระโปรง ก่อน`);
  }

  return categories;
}

async function upsertUniformTypes(conn, categories) {
  const typeIds = new Map();

  for (const type of UNIFORM_TYPES) {
    const categoryId = categories.get(type.category_name);
    const [[existing]] = await conn.query(
      `SELECT uniform_type_id
       FROM uniform_type
       WHERE type_name = ? AND category_id = ?
       ORDER BY uniform_type_id ASC
       LIMIT 1`,
      [type.type_name, categoryId]
    );

    if (existing) {
      await conn.query(
        `UPDATE uniform_type
         SET gender = ?, uniform_category = ?, is_default = 1
         WHERE uniform_type_id = ?`,
        [type.gender, type.uniform_category, existing.uniform_type_id]
      );
      typeIds.set(type.key, existing.uniform_type_id);
    } else {
      const [result] = await conn.query(
        `INSERT INTO uniform_type
          (category_id, type_name, gender, uniform_category, is_default)
         VALUES (?, ?, ?, ?, 1)`,
        [categoryId, type.type_name, type.gender, type.uniform_category]
      );
      typeIds.set(type.key, result.insertId);
    }
  }

  return typeIds;
}

async function upsertProvider(conn) {
  await conn.query(
    `INSERT INTO shipping_provider
      (name, code, description, base_price, est_days_min, est_days_max, is_active, price_per_item)
     VALUES (?, ?, ?, ?, ?, ?, 1, ?)
     ON DUPLICATE KEY UPDATE
      name = VALUES(name),
      description = VALUES(description),
      base_price = VALUES(base_price),
      est_days_min = VALUES(est_days_min),
      est_days_max = VALUES(est_days_max),
      is_active = 1,
      price_per_item = VALUES(price_per_item)`,
    [
      PROVIDER.name,
      PROVIDER.code,
      PROVIDER.description,
      PROVIDER.base_price,
      PROVIDER.est_days_min,
      PROVIDER.est_days_max,
      PROVIDER.price_per_item,
    ]
  );

  const [[provider]] = await conn.query(
    `SELECT provider_id, name, base_price, price_per_item
     FROM shipping_provider
     WHERE code = ?
     LIMIT 1`,
    [PROVIDER.code]
  );

  return provider;
}

async function createProducts(conn, { sellerIds, categories, uniformTypeIds, provider }) {
  const products = [];

  for (let i = 0; i < PRODUCT_TEMPLATES.length; i += 1) {
    const item = PRODUCT_TEMPLATES[i];
    const sellerId = sellerIds[item.sellerIndex];
    const categoryId = categories.get(item.categoryName);
    const uniformTypeId = uniformTypeIds.get(item.uniformKey);
    const title = `${PRODUCT_PREFIX} ${item.title}`;

    const [result] = await conn.query(
      `INSERT INTO products
        (seller_id, uniform_type_id, category_id, gender, product_title, product_description,
         size, level, school_name, condition_percent, condition_label, price, quantity,
         status, weight, education_level)
       VALUES (?, ?, ?, ?, ?, 'mock sales demo', ?, ?, 'โรงเรียนเดโม',
         90, 'สภาพดี', ?, 100, 'available', 0.50, ?)`,
      [sellerId, uniformTypeId, categoryId, item.gender, title, item.size, item.level, item.price, item.level]
    );

    const productId = result.insertId;
    await conn.query("INSERT INTO product_shipping (product_id, provider_id) VALUES (?, ?)", [
      productId,
      provider.provider_id,
    ]);
    await conn.query(
      `INSERT INTO product_images
        (product_id, image_url, public_id, is_cover, sort_order)
       VALUES (?, ?, ?, 1, 0)`,
      [
        productId,
        `https://placehold.co/600x600/${item.imageColor}/1f2937?text=Demo+${i + 1}`,
        `${MOCK_PREFIX}/p${i + 1}`,
      ]
    );

    products.push({
      product_id: productId,
      seller_id: sellerId,
      title,
      price: item.price,
    });
  }

  return products;
}

async function createOrders(conn, { buyerId, products, provider }) {
  const [[dbClock]] = await conn.query("SELECT DATE_FORMAT(CURDATE(), '%Y-%m-%d') AS db_today");
  const today = parseDate(dbClock.db_today);
  const dateSlots = makeDateSlots(today);
  const statusPlans = makeStatusPlans();
  const paidDeliveredOrders = [];

  for (let i = 0; i < 50; i += 1) {
    const product = products[i % products.length];
    const quantity = i % 5 === 0 ? 2 : 1;
    const plan = { ...statusPlans[i] };
    const createdAt = dateSlots[i];
    const isShipped = ["shipping", "delivered"].includes(plan.order_status);
    const isDelivered = plan.order_status === "delivered";
    const amounts = calculateAmounts(product, quantity, provider);
    const paymentIsPaid = plan.payment_status === "paid";
    const platformFee = paymentIsPaid ? amounts.platformFee : 0;
    const sellerPayoutAmount = paymentIsPaid ? amounts.sellerPayoutAmount : 0;
    const totalPrice = paymentIsPaid ? amounts.totalPrice : amounts.itemSubtotal;
    const shippingPrice = paymentIsPaid ? amounts.shippingPrice : 0;
    const statusChangedAt = addMinutes(createdAt, 120 + (i % 5) * 25);
    const completedAt = isDelivered ? addDays(createdAt, 2 + (i % 3)) : null;
    const trackingNumber = isShipped ? `DEMO${String(i + 1).padStart(5, "0")}TH` : null;

    const [orderResult] = await conn.query(
      `INSERT INTO orders
        (buyer_id, seller_id, total_price, platform_fee, seller_payout_amount,
         order_status, tracking_number, shipping_provider, shipping_date,
         created_at, completed_at, recipient_name, shipping_address,
         shipping_province, shipping_postcode, shipping_phone, payment_status,
         payout_status, order_type, payment_method, omise_charge_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'purchase', ?, ?)`,
      [
        buyerId,
        product.seller_id,
        totalPrice,
        platformFee,
        sellerPayoutAmount,
        plan.order_status,
        trackingNumber,
        isShipped ? provider.name : null,
        isShipped ? formatDateTime(statusChangedAt) : null,
        formatDateTime(createdAt),
        completedAt ? formatDateTime(completedAt) : null,
        `ลูกค้าเดโม ${String(i + 1).padStart(2, "0")}`,
        `${100 + i}/${(i % 9) + 1} หมู่ ${(i % 12) + 1} ตำบลตัวอย่าง อำเภอเมือง`,
        THAI_PROVINCES[i % THAI_PROVINCES.length],
        String(73000 + (i % 90)).padStart(5, "0"),
        `08${String(80000000 + i * 137).slice(-8)}`,
        plan.payment_status,
        plan.payout_status,
        paymentIsPaid ? "card" : null,
        `${MOCK_PREFIX}-${String(i + 1).padStart(3, "0")}`,
      ]
    );

    const orderId = orderResult.insertId;
    await conn.query(
      "INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase) VALUES (?, ?, ?, ?)",
      [orderId, product.product_id, quantity, product.price]
    );
    await conn.query(
      "INSERT INTO order_shipping (order_id, seller_id, provider_id, shipping_price) VALUES (?, ?, ?, ?)",
      [orderId, product.seller_id, provider.provider_id, shippingPrice]
    );

    if (isDelivered && plan.payout_status === "paid") {
      paidDeliveredOrders.push({
        order_id: orderId,
        seller_id: product.seller_id,
        net: sellerPayoutAmount,
        fee: platformFee,
        completedAt,
        payoutDate: payoutCycleDate(completedAt, i),
        cycle: payoutCycleKey(completedAt),
      });
    }
  }

  return paidDeliveredOrders;
}

async function createPayouts(conn, paidDeliveredOrders) {
  const payoutGroups = new Map();

  for (const order of paidDeliveredOrders) {
    const key = `${order.seller_id}-${order.cycle}`;
    const group = payoutGroups.get(key) || { sellerId: order.seller_id, cycle: order.cycle, orders: [] };
    group.orders.push(order);
    payoutGroups.set(key, group);
  }

  for (const group of payoutGroups.values()) {
    const { sellerId, cycle, orders } = group;
    const latestPayoutDate = orders
      .map((order) => order.payoutDate)
      .sort((a, b) => b.getTime() - a.getTime())[0];
    const netAmount = orders.reduce((sum, order) => sum + Number(order.net || 0), 0);
    const feeAmount = orders.reduce((sum, order) => sum + Number(order.fee || 0), 0);

    const [payoutResult] = await conn.query(
      `INSERT INTO payouts
        (seller_id, net_amount, fee_amount, order_count, status,
         omise_transfer_id, created_at, completed_at)
       VALUES (?, ?, ?, ?, 'completed', ?, ?, ?)`,
      [
        Number(sellerId),
        netAmount,
        feeAmount,
        orders.length,
        `${MOCK_PREFIX}-transfer-${sellerId}-${cycle}`,
        formatDateTime(latestPayoutDate),
        formatDateTime(latestPayoutDate),
      ]
    );

    await conn.query("UPDATE orders SET payout_id = ?, payout_date = ? WHERE order_id IN (?)", [
      payoutResult.insertId,
      formatDateTime(latestPayoutDate),
      orders.map((order) => order.order_id),
    ]);

    await conn.query(
      `INSERT INTO notifications (user_id, type, title, body, ref_id, is_read, created_at)
       VALUES (?, 'payout_completed', 'โอนเงินเข้าบัญชีแล้ว', ?, ?, 0, ?)`,
      [
        Number(sellerId),
        `ยอดโอน ฿${Math.round(netAmount).toLocaleString()} จาก mock demo sales`,
        payoutResult.insertId,
        formatDateTime(latestPayoutDate),
      ]
    );
  }
}

async function summarize() {
  const [[orders]] = await db.query(
    `SELECT
       COUNT(*) AS total_orders,
       SUM(order_status = 'pending') AS pending,
       SUM(order_status = 'confirmed') AS confirmed,
       SUM(order_status = 'shipping') AS shipping,
       SUM(order_status = 'delivered' AND payout_status = 'pending') AS delivered_pending_payout,
       SUM(order_status = 'delivered' AND payout_status = 'paid') AS delivered_paid,
       SUM(order_status = 'cancelled') AS cancelled
     FROM orders
     WHERE omise_charge_id LIKE ?`,
    [`${MOCK_PREFIX}-%`]
  );
  const [[payouts]] = await db.query(
    `SELECT COUNT(*) AS payout_count, COALESCE(SUM(net_amount), 0) AS paid_total
     FROM payouts
     WHERE omise_transfer_id LIKE ?`,
    [`${MOCK_PREFIX}-%`]
  );
  const [sellers] = await db.query(
    `SELECT u.user_id, u.user_name, u.user_email,
            COUNT(o.order_id) AS order_count,
            COALESCE(SUM(o.seller_payout_amount), 0) AS seller_payout_amount
     FROM users u
     LEFT JOIN orders o ON o.seller_id = u.user_id AND o.omise_charge_id LIKE ?
     WHERE u.user_email LIKE 'mock.demo.sales.seller%@unieed.local'
     GROUP BY u.user_id, u.user_name, u.user_email
     ORDER BY u.user_id`,
    [`${MOCK_PREFIX}-%`]
  );

  return { orders, payouts, sellers };
}

async function main() {
  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();
    await cleanupMockData(conn);

    const users = await upsertUsers(conn);
    const categories = await getCategories(conn);
    const uniformTypeIds = await upsertUniformTypes(conn, categories);
    const provider = await upsertProvider(conn);
    const products = await createProducts(conn, {
      sellerIds: users.sellerIds,
      categories,
      uniformTypeIds,
      provider,
    });
    const paidDeliveredOrders = await createOrders(conn, {
      buyerId: users.buyerId,
      products,
      provider,
    });
    await createPayouts(conn, paidDeliveredOrders);

    await conn.commit();

    console.log(JSON.stringify(await summarize(), null, 2));
  } catch (error) {
    await conn.rollback();
    console.error(error.message);
    process.exitCode = 1;
  } finally {
    conn.release();
    await db.end();
  }
}

main();

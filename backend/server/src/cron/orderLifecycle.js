import { db } from "../config/db.js";
import { sendNotification } from "../lib/notify.js";

// ── Constants ──────────────────────────────────────────────
const AUTO_CANCEL_DAYS  = 3;  // ยกเลิกอัตโนมัติถ้าผู้ขายไม่จัดส่งภายใน 3 วัน
const WARN_AT_DAY       = 2;  // แจ้งเตือนผู้ขายเมื่อครบ 2 วัน (เหลือ 1 วัน)
const AUTO_CONFIRM_DAYS = 7;  // ยืนยันรับอัตโนมัติถ้าผู้ซื้อไม่กดภายใน 7 วันหลังจัดส่ง
const PAYOUT_DEADLINE_DAYS = 7; // โอนเงินภายใน 7 วันหลังสิ้นรอบ

// ── Entry point ────────────────────────────────────────────
export async function runOrderLifecycleCron() {
  try {
    await warnPendingOrders();
    await autoCancelPendingOrders();
    await autoConfirmShippedOrders();
    await warnMissingBankBeforePayout();
  } catch (err) {
    console.error("[Cron] orderLifecycle error:", err.message);
  }
}

// ── 1. แจ้งเตือนผู้ขายเมื่อออเดอร์รอจัดส่งครบ 2 วัน ──────
// เงื่อนไข: pending/confirmed, created_at ระหว่าง 2-3 วันที่แล้ว
// และยังไม่เคยส่ง warning ให้ order นี้มาก่อน (ตรวจจาก notifications)
async function warnPendingOrders() {
  const [rows] = await db.query(
    `SELECT o.order_id, o.seller_id, o.created_at
     FROM orders o
     WHERE o.order_status IN ('pending', 'confirmed')
       AND o.created_at <= DATE_SUB(NOW(), INTERVAL ? DAY)
       AND o.created_at >  DATE_SUB(NOW(), INTERVAL ? DAY)
       AND NOT EXISTS (
         SELECT 1 FROM notifications n
         WHERE n.ref_id  = o.order_id
           AND n.user_id = o.seller_id
           AND n.type    = 'order_cancel_warning'
       )`,
    [WARN_AT_DAY, AUTO_CANCEL_DAYS]
  );

  for (const order of rows) {
    const deadline = new Date(
      new Date(order.created_at).getTime() + AUTO_CANCEL_DAYS * 24 * 60 * 60 * 1000
    );
    const deadlineStr = deadline.toLocaleDateString("th-TH", {
      day: "2-digit", month: "short", year: "2-digit",
      hour: "2-digit", minute: "2-digit",
    });

    await sendNotification(order.seller_id, {
      type:   "order_cancel_warning",
      title:  "⚠️ กรุณาจัดส่งสินค้าก่อนออเดอร์ถูกยกเลิก",
      body:   `ออเดอร์ #${order.order_id} ยังไม่ได้จัดส่ง กรุณาจัดส่งและกรอกเลขพัสดุภายใน ${deadlineStr} มิฉะนั้นระบบจะยกเลิกออเดอร์อัตโนมัติ`,
      ref_id: order.order_id,
    }).catch(() => {});
  }

  if (rows.length > 0)
    console.log(`[Cron] warned ${rows.length} seller(s) about overdue pending orders`);
}

// ── 2. ยกเลิกออเดอร์ที่ผู้ขายไม่จัดส่งเกิน 3 วัน ──────────
// • เปลี่ยน order_status → 'cancelled'
// • คืนสต็อกสินค้า (quantity + status → available)
// • แจ้งเตือนทั้งผู้ซื้อและผู้ขาย
async function autoCancelPendingOrders() {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const [toCancel] = await conn.execute(
      `SELECT order_id, seller_id, buyer_id
       FROM orders
       WHERE order_status IN ('pending', 'confirmed')
         AND created_at <= DATE_SUB(NOW(), INTERVAL ? DAY)`,
      [AUTO_CANCEL_DAYS]
    );

    if (toCancel.length === 0) {
      await conn.commit();
      return;
    }

    const ids = toCancel.map(r => r.order_id);
    const ph  = ids.map(() => "?").join(",");

    // อัปเดต order → cancelled
    await conn.execute(
      `UPDATE orders SET order_status = 'cancelled' WHERE order_id IN (${ph})`,
      ids
    );

    // คืนสต็อกสินค้าทุก order
    for (const orderId of ids) {
      const [items] = await conn.execute(
        `SELECT product_id, quantity FROM order_items WHERE order_id = ?`,
        [orderId]
      );
      for (const item of items) {
        await conn.execute(
          `UPDATE products
           SET quantity = quantity + ?,
               status   = 'available'
           WHERE product_id = ?
             AND status IN ('sold', 'available')`,
          [item.quantity, item.product_id]
        );
      }
    }

    await conn.commit();

    // ส่ง notification หลัง commit สำเร็จ
    for (const order of toCancel) {
      // แจ้งผู้ซื้อ
      await sendNotification(order.buyer_id, {
        type:   "order_auto_cancelled",
        title:  "ออเดอร์ถูกยกเลิกอัตโนมัติ",
        body:   `ออเดอร์ #${order.order_id} ถูกยกเลิกเนื่องจากผู้ขายไม่ได้จัดส่งสินค้าภายใน ${AUTO_CANCEL_DAYS} วัน`,
        ref_id: order.order_id,
      }).catch(() => {});

      // แจ้งผู้ขาย
      await sendNotification(order.seller_id, {
        type:   "order_auto_cancelled_seller",
        title:  "ออเดอร์ถูกยกเลิกอัตโนมัติ",
        body:   `ออเดอร์ #${order.order_id} ถูกยกเลิกเนื่องจากไม่ได้จัดส่งสินค้าภายใน ${AUTO_CANCEL_DAYS} วัน สินค้าได้ถูกคืนสู่ตลาดเรียบร้อยแล้ว`,
        ref_id: order.order_id,
      }).catch(() => {});
    }

    console.log(`[Cron] auto-cancelled ${toCancel.length} pending order(s), stock restored`);
  } catch (e) {
    await conn.rollback();
    console.error("[Cron] autoCancelPendingOrders error:", e.message);
  } finally {
    conn.release();
  }
}

// ── 3. ยืนยันรับสินค้าอัตโนมัติหลังจัดส่งเกิน 7 วัน ────────
// เงื่อนไข: shipping + มีเลขพัสดุ + shipping_date เกิน 7 วัน
// • เปลี่ยน order_status → 'delivered', payout_status → 'pending'
// • แจ้งเตือนผู้ซื้อและผู้ขาย
async function autoConfirmShippedOrders() {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const [toConfirm] = await conn.execute(
      `SELECT order_id, buyer_id, seller_id
       FROM orders
       WHERE order_status   = 'shipping'
         AND shipping_date  IS NOT NULL
         AND tracking_number IS NOT NULL
         AND tracking_number <> ''
         AND shipping_date  <= DATE_SUB(NOW(), INTERVAL ? DAY)`,
      [AUTO_CONFIRM_DAYS]
    );

    if (toConfirm.length === 0) {
      await conn.commit();
      return;
    }

    const ids = toConfirm.map(r => r.order_id);
    const ph  = ids.map(() => "?").join(",");

    await conn.execute(
      `UPDATE orders
       SET order_status  = 'delivered',
           payout_status = 'pending',
           completed_at  = NOW()
       WHERE order_id IN (${ph})`,
      ids
    );

    await conn.commit();

    // ส่ง notification หลัง commit สำเร็จ
    for (const order of toConfirm) {
      await sendNotification(order.buyer_id, {
        type:   "order_auto_delivered",
        title:  "ออเดอร์ได้รับการยืนยันอัตโนมัติ",
        body:   `ออเดอร์ #${order.order_id} ได้รับการยืนยันรับสินค้าอัตโนมัติ เนื่องจากผ่าน ${AUTO_CONFIRM_DAYS} วันหลังจัดส่งแล้ว`,
        ref_id: order.order_id,
      }).catch(() => {});

      await sendNotification(order.seller_id, {
        type:   "order_delivered",
        title:  "ออเดอร์สำเร็จแล้ว",
        body:   `ออเดอร์ #${order.order_id} ได้รับการยืนยันรับสินค้าอัตโนมัติ ยอดเงินจะถูกโอนในรอบถัดไป`,
        ref_id: order.order_id,
      }).catch(() => {});
    }

    console.log(`[Cron] auto-confirmed ${toConfirm.length} shipped order(s)`);
  } catch (e) {
    await conn.rollback();
    console.error("[Cron] autoConfirmShippedOrders error:", e.message);
  } finally {
    conn.release();
  }
}

// ── 4. แจ้งเตือนผู้ขายที่มีเงินรอโอน แต่ยังไม่กรอกบัญชีรับเงิน ────────
// เงื่อนไข: delivered + payout pending, ผ่านวันตัดรอบแล้ว และยังอยู่ในกรอบ 7 วันโอนเงิน
// ส่งซ้ำได้วันละครั้งเพื่อเตือนก่อนหลุดรอบโอน
async function warnMissingBankBeforePayout() {
  const [rows] = await db.query(
    `SELECT
       COALESCE(o.seller_id, seller_map.seller_id) AS seller_id,
       COUNT(*) AS order_count,
       COALESCE(SUM(o.seller_payout_amount), 0) AS pending_amount,
       MIN(TIMESTAMP(LAST_DAY(COALESCE(o.completed_at, o.created_at)), '23:59:59')) AS cutoff_at,
       MIN(DATE_ADD(TIMESTAMP(LAST_DAY(COALESCE(o.completed_at, o.created_at)), '23:59:59'), INTERVAL ? DAY)) AS payout_deadline_at
     FROM orders o
     LEFT JOIN (
       SELECT oi.order_id, MIN(p.seller_id) AS seller_id
       FROM order_items oi
       JOIN products p ON p.product_id = oi.product_id
       GROUP BY oi.order_id
     ) seller_map ON seller_map.order_id = o.order_id
     LEFT JOIN users u ON u.user_id = COALESCE(o.seller_id, seller_map.seller_id)
     WHERE o.order_status = 'delivered'
       AND o.payout_status = 'pending'
       AND COALESCE(o.seller_id, seller_map.seller_id) IS NOT NULL
       AND NOW() > TIMESTAMP(LAST_DAY(COALESCE(o.completed_at, o.created_at)), '23:59:59')
       AND NOW() <= DATE_ADD(TIMESTAMP(LAST_DAY(COALESCE(o.completed_at, o.created_at)), '23:59:59'), INTERVAL ? DAY)
       AND (
         u.bank_code IS NULL OR u.bank_code = ''
         OR u.bank_account_number IS NULL OR u.bank_account_number = ''
         OR u.bank_account_name IS NULL OR u.bank_account_name = ''
       )
       AND NOT EXISTS (
         SELECT 1 FROM notifications n
         WHERE n.user_id = COALESCE(o.seller_id, seller_map.seller_id)
           AND n.type = 'payout_bank_account_required'
           AND DATE(n.created_at) = CURDATE()
       )
     GROUP BY COALESCE(o.seller_id, seller_map.seller_id)`,
    [PAYOUT_DEADLINE_DAYS, PAYOUT_DEADLINE_DAYS]
  ).catch(() => [[]]);

  for (const row of rows || []) {
    const deadline = new Date(row.payout_deadline_at);
    const deadlineStr = Number.isNaN(deadline.getTime())
      ? "รอบโอนนี้"
      : deadline.toLocaleDateString("th-TH", { day: "numeric", month: "long", year: "numeric" });
    const amount = Math.round(Number(row.pending_amount || 0)).toLocaleString("th-TH");

    await sendNotification(row.seller_id, {
      type: "payout_bank_account_required",
      title: "กรุณาเพิ่มบัญชีธนาคารเพื่อรับเงิน",
      body: `คุณมียอดรอโอน ฿${amount} (${Number(row.order_count || 0)} รายการ) กรุณาเพิ่มข้อมูลบัญชีธนาคารก่อน ${deadlineStr} เพื่อรับเงินในรอบนี้`,
      ref_id: row.seller_id,
    }).catch(() => {});
  }

  if (rows.length > 0)
    console.log(`[Cron] warned ${rows.length} seller(s) to add payout bank account`);
}

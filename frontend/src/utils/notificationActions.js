/** Parse notification body (JSON object or plain string) */
export function parseNotifBody(notif) {
  const raw = notif?.body;
  if (raw == null || raw === "") return {};
  if (typeof raw === "object") return raw;
  try {
    const parsed = JSON.parse(raw);
    return typeof parsed === "object" && parsed !== null ? parsed : { message: String(raw) };
  } catch {
    return { message: String(raw) };
  }
}

const POPUP_TYPES = new Set([
  "certificate",
  "donation_issue",
  "suspension",
  "strike_reset",
  "strike_appeal",
  "wrong_item_report",
  "donation_clarify",
]);

const CHIP_LABELS = {
  certificate:            "ดูใบประกาศนียบัตร →",
  donation_issue:         "ชี้แจง / ดูรายละเอียด →",
  suspension:             "ดูรายละเอียด →",
  strike_reset:           "รับทราบ →",
  strike_appeal:          "ไปตรวจสอบ →",
  wrong_item_report:      "ไปตรวจสอบ →",
  donation_clarify:       "ไปตรวจสอบ →",
  school_join_request:    "ตรวจสอบโรงเรียน →",
  donation_request_pending: "ตรวจสอบคำขอ →",
  order_paid_pending_ship: "จัดการออเดอร์ →",
  payout_due:             "โอนเงินให้ผู้ขาย →",
  donation_overdue:       "ตรวจสอบบริจาคค้างนาน →",
  wrong_items:            "ตรวจสอบของไม่ตรง →",
  system_warning:         "ดูรายละเอียด →",
  admin_approved:         "ดูรายการบริจาค →",
  donation_received:      "ตรวจสอบบริจาค →",
  donation_shipped:       "ดูประวัติการบริจาค →",
  seller_new_order:       "จัดการออเดอร์ →",
  order_shipped:          "ดูออเดอร์ →",
  order_delivered:        "ดูออเดอร์ →",
  order_auto_delivered:   "ดูออเดอร์ →",
  order_auto_cancelled:   "ดูออเดอร์ →",
  order_cancel_warning:   "จัดการออเดอร์ →",
  order_auto_cancelled_seller: "จัดการออเดอร์ →",
  payout_completed:       "ดูยอดโอน →",
};

export const NOTIF_ICONS = {
  certificate:            "mdi:certificate-outline",
  donation_issue:         "mdi:alert-circle-outline",
  suspension:             "mdi:account-cancel",
  strike_reset:           "mdi:shield-check-outline",
  strike_appeal:          "mdi:file-document-edit-outline",
  wrong_item_report:      "mdi:swap-horizontal",
  donation_clarify:       "mdi:message-reply-outline",
  school_join_request:    "mdi:school-outline",
  donation_request_pending: "mdi:hand-heart-outline",
  order_paid_pending_ship: "mdi:truck-fast-outline",
  payout_due:             "mdi:bank-transfer-out",
  donation_overdue:       "mdi:clock-alert-outline",
  wrong_items:            "mdi:swap-horizontal-circle-outline",
  system_warning:         "mdi:alert-outline",
  admin_approved:         "mdi:check-circle-outline",
  donation_received:      "mdi:gift-outline",
  donation_shipped:       "mdi:truck-delivery-outline",
  seller_new_order:       "mdi:receipt-text-outline",
  order_shipped:          "mdi:package-variant-closed",
  order_delivered:        "mdi:check-decagram-outline",
  order_auto_delivered:   "mdi:check-decagram-outline",
  order_auto_cancelled:   "mdi:close-circle-outline",
  order_cancel_warning:   "mdi:clock-alert-outline",
  order_auto_cancelled_seller: "mdi:close-circle-outline",
  payout_completed:       "mdi:cash-check",
  default:                "mdi:bell-outline",
};

export const NOTIF_ICON_CLASS = {
  certificate:            "nb-item-icon--cert",
  suspension:             "nb-item-icon--suspension",
  admin_approved:           "nb-item-icon--approved",
  donation_received:        "nb-item-icon--approved",
  order_delivered:          "nb-item-icon--approved",
  seller_new_order:         "nb-item-icon--cert",
  order_shipped:            "nb-item-icon--cert",
  payout_completed:         "nb-item-icon--approved",
  donation_issue:           "nb-item-icon--default",
  wrong_item_report:        "nb-item-icon--default",
  donation_clarify:         "nb-item-icon--default",
  school_join_request:      "nb-item-icon--school",
  donation_request_pending: "nb-item-icon--donation",
  order_paid_pending_ship:  "nb-item-icon--order",
  payout_due:               "nb-item-icon--payout",
  donation_overdue:         "nb-item-icon--warning",
  wrong_items:              "nb-item-icon--warning",
  system_warning:           "nb-item-icon--warning",
  order_cancel_warning:     "nb-item-icon--default",
  default:                  "nb-item-icon--default",
};

/**
 * Resolve click action for a notification.
 * @returns {{ mode: 'popup'|'navigate'|'none', path?: string, state?: object, chip?: string }}
 */
export function getNotifAction(notif, role) {
  const type = notif?.type;
  const refId = notif?.ref_id != null ? Number(notif.ref_id) : null;
  const chip = CHIP_LABELS[type] || "ดูรายละเอียด →";

  if (POPUP_TYPES.has(type)) {
    return { mode: "popup", chip };
  }

  if (type === "admin_approved" || type === "donation_received") {
    return {
      mode: "navigate",
      path: "/school/donations",
      state: refId ? { openDonationId: refId } : undefined,
      chip: CHIP_LABELS[type],
    };
  }

  if (role === "admin") {
    if (type === "school_join_request") {
      return { mode: "navigate", path: "/admin/schools?status=pending", chip: CHIP_LABELS[type] };
    }
    if (type === "donation_request_pending") {
      return { mode: "navigate", path: "/admin/donations?status=pending", chip: CHIP_LABELS[type] };
    }
    if (type === "order_paid_pending_ship") {
      return { mode: "navigate", path: "/admin/orders?status=pending", chip: CHIP_LABELS[type] };
    }
    if (type === "payout_due") {
      return { mode: "navigate", path: "/admin/payouts", chip: CHIP_LABELS[type] };
    }
    if (type === "donation_overdue") {
      return { mode: "navigate", path: "/admin/donations", chip: CHIP_LABELS[type] };
    }
    if (type === "wrong_items") {
      return { mode: "navigate", path: "/admin/wrong-items", chip: CHIP_LABELS[type] };
    }
    if (type === "system_warning") {
      return { mode: "navigate", path: "/admin/backoffice", chip: CHIP_LABELS[type] };
    }
  }

  if (type === "donation_shipped") {
    return { mode: "navigate", path: "/donations/history", chip: CHIP_LABELS[type] };
  }

  if (type === "payout_completed") {
    return { mode: "navigate", path: "/seller/payouts", chip: CHIP_LABELS[type] };
  }

  const sellerOrderTypes = new Set([
    "seller_new_order",
    "order_cancel_warning",
    "order_auto_cancelled_seller",
  ]);
  if (sellerOrderTypes.has(type)) {
    return { mode: "navigate", path: "/seller/orders", chip: CHIP_LABELS[type] };
  }

  if (type === "order_delivered" && role === "seller") {
    return {
      mode: "navigate",
      path: refId ? `/seller/orders` : "/seller/orders",
      chip: CHIP_LABELS[type],
    };
  }

  const buyerOrderTypes = new Set([
    "order_shipped",
    "order_auto_cancelled",
    "order_auto_delivered",
  ]);
  if (buyerOrderTypes.has(type) || (type === "order_delivered" && role !== "seller")) {
    if (refId) {
      return { mode: "navigate", path: `/orders/${refId}`, chip: CHIP_LABELS[type] || "ดูออเดอร์ →" };
    }
    return { mode: "navigate", path: "/orders", chip: "ดูออเดอร์ →" };
  }

  if (refId) {
    if (role === "school_admin") {
      return { mode: "navigate", path: "/school/donations", state: { openDonationId: refId }, chip };
    }
    if (role === "seller") {
      return { mode: "navigate", path: "/seller/orders", chip };
    }
    return { mode: "navigate", path: `/orders/${refId}`, chip };
  }

  return { mode: "none", chip: null };
}

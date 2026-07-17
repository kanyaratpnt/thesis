import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import "../styles/admin.css";
import { Icon } from "@iconify/react";
import { request } from "../../../api/http.js";

function MenuBadge({ count }) {
  const value = Number(count || 0);
  if (value <= 0) return null;
  return <span className="boMenuBadge">{value > 99 ? "99+" : value}</span>;
}

export default function AdminLayout() {
  const location = useLocation();
  const tradeActive =
    location.pathname.includes("/admin/orders") ||
    location.pathname.includes("/admin/payouts");
  const donationActive =
    location.pathname.includes("/admin/donations") ||
    location.pathname.includes("/admin/wrong-items");
  const [tradeOpen,    setTradeOpen]    = useState(tradeActive);
  const [donationOpen, setDonationOpen] = useState(donationActive);
  const [menuOpen, setMenuOpen] = useState(false);
  const [pendingCounts, setPendingCounts] = useState({
    schools: 0,
    donations: 0,
    donationOverdue: 0,
    wrongItems: 0,
    trade: 0,
    orders: 0,
    payouts: 0,
    total: 0,
  });

  useEffect(() => {
    let cancelled = false;
    const loadPendingCounts = async () => {
      try {
        const data = await request("/admin/pending-tasks", { method: "GET", auth: true });
        if (cancelled) return;
        const schools = Number(data?.pending_schools || 0);
        const donations = Number(data?.pending_donations || 0);
        const donationOverdue = Number(data?.overdue_donations || 0);
        const wrongItems = Number(data?.wrong_item_reviews || 0);
        const orders = Number(data?.pending_shipments || 0);
        const payouts = Number(data?.payout_due || 0);
        const systemWarnings = Number(data?.system_warnings || 0);
        const donationTotal = donations + donationOverdue + wrongItems;
        const tradeTotal = orders + payouts;
        setPendingCounts({
          schools,
          donations,
          donationOverdue,
          wrongItems,
          trade: tradeTotal,
          orders,
          payouts,
          total: schools + donationTotal + tradeTotal + systemWarnings,
        });
      } catch {
        if (!cancelled) {
          setPendingCounts({
            schools: 0,
            donations: 0,
            donationOverdue: 0,
            wrongItems: 0,
            trade: 0,
            orders: 0,
            payouts: 0,
            total: 0,
          });
        }
      }
    };

    loadPendingCounts();
    const interval = setInterval(loadPendingCounts, 60000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [location.pathname]);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [menuOpen]);

  return (
    <div className={`boShell${menuOpen ? " boShell--menuOpen" : ""}`}>
      <button
        type="button"
        className="boMobileMenuBtn"
        onClick={() => setMenuOpen(true)}
        aria-label="เปิดเมนูผู้ดูแลระบบ"
        aria-controls="admin-navigation"
        aria-expanded={menuOpen}
      >
        <Icon icon="mdi:menu" />
      </button>

      <button
        type="button"
        className="boSideBackdrop"
        onClick={() => setMenuOpen(false)}
        aria-label="ปิดเมนูผู้ดูแลระบบ"
        tabIndex={menuOpen ? 0 : -1}
      />

      <aside className="boSide" id="admin-navigation">
        <div className="boBrand">
          <div className="boBrandName">
            <img src="/unieed_pic/logo.png" alt="Unieed Logo" />
          </div>
          <button
            type="button"
            className="boSideClose"
            onClick={() => setMenuOpen(false)}
            aria-label="ปิดเมนู"
          >
            <Icon icon="mdi:close" />
          </button>
        </div>

        <div className="boSideLine" />

        <nav
          className="boMenu"
          onClick={(event) => {
            if (event.target.closest("a")) setMenuOpen(false);
          }}
        >
          <NavLink
            to="/admin/backoffice"
            className={({ isActive }) => (isActive ? "boItem active" : "boItem")}
          >
            <span className="boMenuIcon" /><Icon icon="wordpress:category" />
            <span className="boItemText">ภาพรวมของระบบ</span>
            <MenuBadge count={pendingCounts.total} />
          </NavLink>

          <NavLink
            to="/admin/schools"
            className={({ isActive }) => (isActive ? "boItem active" : "boItem")}
          >
            <span className="boMenuIcon" /><Icon icon="fa-regular:edit" />
            <span className="boItemText">จัดการโรงเรียน</span>
            <MenuBadge count={pendingCounts.schools} />
          </NavLink>

          {/* จัดการการบริจาค (collapsible) */}
          <div>
            <div
              onClick={() => setDonationOpen(o => !o)}
              className={`boTradeToggle${donationActive ? " active" : ""}`}
            >
              <Icon icon="mdi:package-variant-closed" className="boTradeToggle__icon" />
              <span className="boTradeToggle__label">จัดการการบริจาค</span>
              <MenuBadge count={pendingCounts.donations + pendingCounts.donationOverdue + pendingCounts.wrongItems} />
              <Icon
                icon={donationOpen ? "mdi:chevron-up" : "mdi:chevron-down"}
                className="boTradeToggle__chevron"
              />
            </div>

            {donationOpen && (
              <div className="boTradeSubmenu">
                <NavLink
                  to="/admin/donations"
                  className={({ isActive }) => (isActive ? "boItem boItem--sub active" : "boItem boItem--sub")}
                >
                  <Icon icon="mdi:clock-alert-outline" className="boItem--sub__icon" />
                  <span className="boItemText">รายการค้างนาน</span>
                  <MenuBadge count={pendingCounts.donations + pendingCounts.donationOverdue} />
                </NavLink>

                <NavLink
                  to="/admin/wrong-items"
                  className={({ isActive }) => (isActive ? "boItem boItem--sub active" : "boItem boItem--sub")}
                >
                  <Icon icon="mdi:swap-horizontal-circle-outline" className="boItem--sub__icon" />
                  <span className="boItemText">ตรวจสอบของไม่ตรง</span>
                  <MenuBadge count={pendingCounts.wrongItems} />
                </NavLink>
              </div>
            )}
          </div>

          {/* จัดการซื้อ-ขาย (collapsible) */}
          <div>
            <div
              onClick={() => setTradeOpen(o => !o)}
              className={`boTradeToggle${tradeActive ? " active" : ""}`}
            >
              <Icon icon="mdi:shopping-outline" className="boTradeToggle__icon" />
              <span className="boTradeToggle__label">จัดการซื้อ-ขาย</span>
              <MenuBadge count={pendingCounts.trade} />
              <Icon
                icon={tradeOpen ? "mdi:chevron-up" : "mdi:chevron-down"}
                className="boTradeToggle__chevron"
              />
            </div>

            {tradeOpen && (
              <div className="boTradeSubmenu">
                <NavLink
                  to="/admin/orders"
                  className={({ isActive }) => (isActive ? "boItem boItem--sub active" : "boItem boItem--sub")}
                >
                  <Icon icon="lets-icons:order" className="boItem--sub__icon" />
                  <span className="boItemText">จัดการออเดอร์</span>
                  <MenuBadge count={pendingCounts.orders} />
                </NavLink>

                <NavLink
                  to="/admin/payouts"
                  className={({ isActive }) => (isActive ? "boItem boItem--sub active" : "boItem boItem--sub")}
                >
                  <Icon icon="mdi:bank-transfer-out" className="boItem--sub__icon" />
                  <span className="boItemText">โอนเงินให้ผู้ขาย</span>
                  <MenuBadge count={pendingCounts.payouts} />
                </NavLink>
              </div>
            )}
          </div>
        </nav>
      </aside>

      <main className="boMain">
        <Outlet />
      </main>
    </div>
  );
}

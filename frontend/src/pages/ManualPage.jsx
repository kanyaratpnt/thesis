import { useMemo, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import Navbar from "./Navbar.jsx";
import Footer from "./Footer.jsx";
import "./styles/ManualPage.css";

const manuals = [
  {
    id: "buyer",
    title: "ผู้ซื้อ",
    subtitle: "เลือกสินค้า เพิ่มลงตะกร้า ชำระเงิน และติดตามคำสั่งซื้อ",
    image: "/manual/2.png",
    accent: "#2563eb",
    soft: "#dbeafe",
    icon: "mdi:cart-outline",
  },
  {
    id: "buyer-donate",
    title: "ผู้ซื้อเพื่อบริจาค",
    subtitle: "เลือกโครงการ เลือกสินค้าที่ตรงกับความต้องการ และส่งต่อให้โรงเรียน",
    image: "/manual/3.png",
    accent: "#0f766e",
    soft: "#ccfbf1",
    icon: "mdi:gift-outline",
  },
  {
    id: "seller",
    title: "ผู้ขาย",
    subtitle: "ลงสินค้า จัดการคำสั่งซื้อ ตรวจสอบยอดขาย และรับรายได้",
    image: "/manual/4.png",
    accent: "#dc2626",
    soft: "#fee2e2",
    icon: "mdi:storefront-outline",
  },
  {
    id: "donor",
    title: "ผู้บริจาค",
    subtitle: "เลือกโครงการ ส่งของให้โรงเรียน ติดตามสถานะ และรับใบเกียรติบัตร",
    image: "/manual/5.png?v=donor-20260712",
    accent: "#f59e0b",
    soft: "#fef3c7",
    icon: "mdi:hand-heart-outline",
  },
];

export default function ManualPage() {
  const [selectedId, setSelectedId] = useState("buyer");
  const [zoom, setZoom] = useState(100);
  const viewerRef = useRef(null);

  const selectedManual = useMemo(
    () => manuals.find((manual) => manual.id === selectedId) || manuals[0],
    [selectedId]
  );

  const selectManual = (id) => {
    setSelectedId(id);
    setZoom(100);
    window.requestAnimationFrame(() => {
      viewerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  return (
    <div className="manualPage">
      <Navbar activeLink="manual" />

      <main className="manualMain">
        <section className="manualHero">
          <div className="manualHeroCopy">
            <span className="manualEyebrow">Unieed Guidebook</span>
            <h1>คู่มือการใช้</h1>
            <p>
              เลือกประเภทผู้ใช้งานที่ต้องการ ระบบจะแสดงคู่มือภาพสำหรับขั้นตอนนั้นให้ทันที
            </p>
          </div>
          <div className="manualHeroPanel" aria-hidden="true">
            <Icon icon="mdi:book-open-page-variant-outline" />
            <span>4 คู่มือ</span>
          </div>
        </section>

        <section className="manualPicker" aria-label="เลือกประเภทคู่มือ">
          {manuals.map((manual) => {
            const active = manual.id === selectedId;
            return (
              <button
                key={manual.id}
                type="button"
                className={`manualTypeCard${active ? " manualTypeCardActive" : ""}`}
                onClick={() => selectManual(manual.id)}
                style={{ "--manual-accent": manual.accent, "--manual-soft": manual.soft }}
              >
                <span className="manualTypeIcon">
                  <Icon icon={manual.icon} />
                </span>
                <span className="manualTypeText">
                  <strong>{manual.title}</strong>
                  <small>{manual.subtitle}</small>
                </span>
                <Icon className="manualTypeArrow" icon="mdi:chevron-right" />
              </button>
            );
          })}
        </section>

        <section className="manualViewerSection" ref={viewerRef}>
          <div
            className="manualViewerHeader"
            style={{ "--manual-accent": selectedManual.accent, "--manual-soft": selectedManual.soft }}
          >
            <div>
              <span className="manualViewerBadge">คู่มือสำหรับ</span>
              <h2>{selectedManual.title}</h2>
              <p>{selectedManual.subtitle}</p>
            </div>

            <div className="manualTools" aria-label="เครื่องมือดูคู่มือ">
              <button type="button" onClick={() => setZoom((value) => Math.max(70, value - 10))} aria-label="ย่อภาพ">
                <Icon icon="mdi:magnify-minus-outline" />
              </button>
              <span>{zoom}%</span>
              <button type="button" onClick={() => setZoom((value) => Math.min(130, value + 10))} aria-label="ขยายภาพ">
                <Icon icon="mdi:magnify-plus-outline" />
              </button>
              <a href={selectedManual.image} target="_blank" rel="noreferrer" aria-label="เปิดภาพเต็ม">
                <Icon icon="mdi:open-in-new" />
              </a>
            </div>
          </div>

          <div className="manualImageShell">
            <img
              src={selectedManual.image}
              alt={`คู่มือการใช้ Unieed สำหรับ${selectedManual.title}`}
              style={{ width: `${zoom}%` }}
            />
          </div>

          <div className="manualThumbs" aria-label="เลือกคู่มือจากภาพตัวอย่าง">
            {manuals.map((manual) => (
              <button
                key={manual.id}
                type="button"
                className={manual.id === selectedId ? "manualThumbActive" : ""}
                onClick={() => selectManual(manual.id)}
              >
                <img src={manual.image} alt="" />
                <span>{manual.title}</span>
              </button>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

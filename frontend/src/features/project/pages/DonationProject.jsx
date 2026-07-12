import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext.jsx";
import { getJson } from "../../../api/http.js";
import { Icon } from "@iconify/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass, faFilter } from "@fortawesome/free-solid-svg-icons";
import "../../../pages/styles/Homepage.css";
import "../styles/DonationProject.css";
import Navbar from "../../../pages/Navbar.jsx";
import Footer from "../../../pages/Footer.jsx";

const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

// ===== ข้อมูลไซส์ตามประเภทชุดและระดับชั้น =====
const SIZE_BY_TYPE = {
  เสื้อนักเรียน: { label: "รอบอก (นิ้ว)", sizes: [] },
  กางเกง: { label: "รอบเอว (นิ้ว)", sizes: [] },
  กระโปรง: { label: "รอบเอว (นิ้ว)", sizes: [] },
};

const SIZE_RANGES = {
  อนุบาล:     { chest: ["20","22","24","26","28"], waist: ["18","20","22","24","26"] },
  ประถมศึกษา: { chest: ["26","28","30","32","34","36"], waist: ["22","24","26","28","30","32"] },
  มัธยมศึกษา:   { chest: ["32","34","36","38","40","42","46","48","50","52"], waist: ["26","28","30","32","34","36","38","40","42","44"] },
  // มัธยมปลาย:  { chest: ["36","38","40","42","44","46"], waist: ["28","30","32","34","36","38"] },
};

const UNIFORM_TYPES = [
  { key: "เสื้อนักเรียน", icon: <svg width="34" height="34" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M34 30.2222C34 32.3085 32.3085 34 30.2222 34H3.77778C1.6915 34 0 32.3085 0 30.2222V3.77778C0 1.6915 1.6915 0 3.77778 0H30.2222C32.3085 0 34 1.6915 34 3.77778V30.2222Z" fill="white"/>
<path d="M18.2668 33.4857C17.5698 34.1713 16.4308 34.1713 15.7347 33.4857L9.47022 27.3194C8.77417 26.6337 8.59 25.4003 9.06033 24.5767L16.1437 7.15456C16.6149 6.33194 17.3856 6.33194 17.8559 7.15456L24.9393 24.5767C25.4096 25.3993 25.2254 26.6337 24.5294 27.3184L18.2668 33.4857Z" fill="#053F5C"/>
<path d="M16.9996 13.8535C17.8959 13.8535 18.8923 12.9544 19.7376 11.7842L17.8553 7.15456C17.384 6.33194 16.6134 6.33194 16.143 7.15456L14.2607 11.7842C15.1079 12.9544 16.1034 13.8535 16.9996 13.8535Z" fill="#292F33"/>
<path d="M21.7228 5.45667C21.7228 7.31156 19.0868 12.1736 17.0005 12.1736C14.9143 12.1736 12.2783 7.31156 12.2783 5.45667C12.2783 3.77273 14.9143 2.83301 17.0005 2.83301C19.0868 2.83301 21.7228 3.77273 21.7228 5.45667Z" fill="#053F5C"/>
<path d="M0 3.77778V5.90656C1.95878 8.52267 6.40239 13.2269 7.55555 13.2269C9.64183 13.2269 17.9444 3.03072 17.9444 0.944444C17.9444 0 17 0 16.0556 0H3.77778C1.6915 0 0 1.6915 0 3.77778Z" fill="#D9D9D9"/>
<path d="M16.0547 0.944444C16.0547 3.03072 24.3573 13.2269 26.4436 13.2269C27.5967 13.2269 32.0404 8.52267 33.9991 5.90656V3.77778C33.9991 1.6915 32.3076 0 30.2214 0H17.9436C16.9991 0 16.0547 0 16.0547 0.944444Z" fill="#D9D9D9"/>
<path d="M3.77677 0C3.5246 0 3.27999 0.0273889 3.04199 0.0746111C4.15927 1.63956 9.97421 2.83333 16.999 2.83333C24.0238 2.83333 29.8387 1.63956 30.956 0.0746111C30.718 0.0273889 30.4734 0 30.2212 0H3.77677Z" fill="#181818" fill-opacity="0.533333"/>
</svg>
, label: "เสื้อนักเรียน" },
  { key: "กางเกง",       icon: <svg width="34" height="34" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
<g clip-path="url(#clip0_2847_991)">
<path d="M29.2778 5.66656V1.84628C29.2778 1.34856 28.8736 0.944336 28.3758 0.944336H5.62417C5.12644 0.944336 4.72222 1.34856 4.72222 1.84628V5.66656L0 29.2777L13.2222 33.0554L17 23.0963L20.7778 33.0554L34 29.2777L29.2778 5.66656Z" fill="#8C5543"/>
<path d="M4.72259 3.77783H29.2782V5.66672H4.72259V3.77783ZM13.0167 5.66672H11.0579C9.75648 9.54556 5.90126 10.7658 3.62515 11.1511L3.22754 13.1411C6.63321 12.7557 11.6331 10.8716 13.0167 5.66672Z" fill="#662113"/>
<path d="M30.7729 13.1408L30.3753 11.1509C28.0992 10.7656 24.2449 9.54439 22.9426 5.6665H20.9838C22.3664 10.8713 27.3673 12.7555 30.7729 13.1408ZM16.0557 5.6665V25.5858L17.0001 23.0962L17.9446 25.5858V5.6665H16.0557Z" fill="#662113"/>
<path d="M17.1407 21.7222H17V19.8333H17.1407C18.6263 19.8333 19.8333 18.6263 19.8333 17.1407V4.72217H21.7222V17.1407C21.7222 19.6671 19.6671 21.7222 17.1407 21.7222Z" fill="#662113"/>
</g>
<defs>
<clipPath id="clip0_2847_991">
<rect width="34" height="34" fill="white"/>
</clipPath>
</defs>
</svg>
, label: "กางเกง" },
  { key: "กระโปรง",     icon:<svg width="46" height="46" viewBox="0 0 46 46" fill="none" xmlns="http://www.w3.org/2000/svg">
<path opacity="0.8" d="M19.1667 10.5415H26.8334L30.5901 41.5493C28.0822 41.9699 25.543 42.1763 23.0001 42.1665C20.1347 42.1665 17.6085 41.9269 15.4062 41.5493L19.1667 10.5415Z" fill="#053F5C"/>
<path opacity="0.5" d="M11.1897 10.5415L3.98683 34.4098C3.57283 35.7821 3.98875 37.256 5.24033 38.0054C7.12633 39.1382 10.4479 40.6964 15.4063 41.5493L19.1649 10.5415H11.1897Z" fill="#053F5C"/>
<path opacity="0.9" d="M40.7595 38.0073C42.0092 37.256 42.427 35.7821 42.013 34.4098L34.8102 10.5415H26.833L30.5897 41.5493C35.5481 40.6983 38.8697 39.1401 40.7595 38.0073Z" fill="#053F5C"/>
<path d="M30.8755 3.8335H15.1263C13.271 3.8335 12.3433 3.8335 11.7664 4.39508C11.1895 4.95666 11.1895 5.85941 11.1895 7.66683V10.5418H34.8124V7.66683C34.8124 5.85941 34.8124 4.95666 34.2355 4.39508C33.6605 3.8335 32.7309 3.8335 30.8755 3.8335Z" fill="#053F5C"/>
</svg>
, label: "กระโปรง" },
];

const GENDERS = ["ชาย", "หญิง"];
const LEVELS  = ["อนุบาล", "ประถมศึกษา", "มัธยมตอนต้น", "มัธยมตอนปลาย"];
const CONDITIONS = ["90%", "80%", "70%", "60%", "50% ขึ้นไป"];

const PROVINCES = [
  "กระบี่","กรุงเทพมหานคร","กาญจนบุรี","กาฬสินธุ์","กำแพงเพชร",
  "ขอนแก่น",
  "จันทบุรี",
  "ฉะเชิงเทรา",
  "ชลบุรี","ชัยนาท","ชัยภูมิ","ชุมพร","เชียงราย","เชียงใหม่",
  "ตรัง","ตราด","ตาก",
  "นครนายก","นครปฐม","นครพนม","นครราชสีมา","นครศรีธรรมราช","นครสวรรค์","นนทบุรี","นราธิวาส","น่าน",
  "บึงกาฬ","บุรีรัมย์",
  "ปทุมธานี","ประจวบคีรีขันธ์","ปราจีนบุรี","ปัตตานี",
  "พระนครศรีอยุธยา","พะเยา","พังงา","พัทลุง","พิจิตร","พิษณุโลก","เพชรบุรี","เพชรบูรณ์","แพร่",
  "ภูเก็ต",
  "มหาสารคาม","มุกดาหาร","แม่ฮ่องสอน",
  "ยโสธร","ยะลา",
  "ร้อยเอ็ด","ระนอง","ระยอง","ราชบุรี",
  "ลพบุรี","ลำปาง","ลำพูน","เลย",
  "ศรีสะเกษ",
  "สกลนคร","สงขลา","สตูล","สมุทรปราการ","สมุทรสงคราม","สมุทรสาคร","สระแก้ว","สระบุรี","สิงห์บุรี","สุโขทัย","สุพรรณบุรี","สุราษฎร์ธานี","สุรินทร์",
  "หนองคาย","หนองบัวลำภู",
  "อ่างทอง","อำนาจเจริญ","อุดรธานี","อุตรดิตถ์","อุทัยธานี","อุบลราชธานี",
];

const TYPE_COLORS = {
  "เสื้อนักเรียน": {bg: "#87c7eb", hover: "#5285E8"},
  "กางเกง": {bg:"#E6FFBB", hover: "#5285E8"},
  "กระโปรง": {bg:"#FFEDBF", hover: "#5285E8"},
};

function UniformIcon({ name }) {
  if (name?.includes("เสื้อ")) return (
    <svg width="34" height="34" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M34 30.2222C34 32.3085 32.3085 34 30.2222 34H3.77778C1.6915 34 0 32.3085 0 30.2222V3.77778C0 1.6915 1.6915 0 3.77778 0H30.2222C32.3085 0 34 1.6915 34 3.77778V30.2222Z" fill="white"/>
      <path d="M18.2668 33.4857C17.5698 34.1713 16.4308 34.1713 15.7347 33.4857L9.47022 27.3194C8.77417 26.6337 8.59 25.4003 9.06033 24.5767L16.1437 7.15456C16.6149 6.33194 17.3856 6.33194 17.8559 7.15456L24.9393 24.5767C25.4096 25.3993 25.2254 26.6337 24.5294 27.3184L18.2668 33.4857Z" fill="#053F5C"/>
      <path d="M16.9996 13.8535C17.8959 13.8535 18.8923 12.9544 19.7376 11.7842L17.8553 7.15456C17.384 6.33194 16.6134 6.33194 16.143 7.15456L14.2607 11.7842C15.1079 12.9544 16.1034 13.8535 16.9996 13.8535Z" fill="#292F33"/>
      <path d="M21.7228 5.45667C21.7228 7.31156 19.0868 12.1736 17.0005 12.1736C14.9143 12.1736 12.2783 7.31156 12.2783 5.45667C12.2783 3.77273 14.9143 2.83301 17.0005 2.83301C19.0868 2.83301 21.7228 3.77273 21.7228 5.45667Z" fill="#053F5C"/>
      <path d="M0 3.77778V5.90656C1.95878 8.52267 6.40239 13.2269 7.55555 13.2269C9.64183 13.2269 17.9444 3.03072 17.9444 0.944444C17.9444 0 17 0 16.0556 0H3.77778C1.6915 0 0 1.6915 0 3.77778Z" fill="#D9D9D9"/>
      <path d="M16.0547 0.944444C16.0547 3.03072 24.3573 13.2269 26.4436 13.2269C27.5967 13.2269 32.0404 8.52267 33.9991 5.90656V3.77778C33.9991 1.6915 32.3076 0 30.2214 0H17.9436C16.9991 0 16.0547 0 16.0547 0.944444Z" fill="#D9D9D9"/>
    </svg>
  );
  if (name?.includes("กางเกง")) return (
    <svg width="34" height="34" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g clipPath="url(#clip0_2847_991)">
        <path d="M29.2778 5.66656V1.84628C29.2778 1.34856 28.8736 0.944336 28.3758 0.944336H5.62417C5.12644 0.944336 4.72222 1.34856 4.72222 1.84628V5.66656L0 29.2777L13.2222 33.0554L17 23.0963L20.7778 33.0554L34 29.2777L29.2778 5.66656Z" fill="#8C5543"/>
        <path d="M4.72259 3.77783H29.2782V5.66672H4.72259V3.77783ZM13.0167 5.66672H11.0579C9.75648 9.54556 5.90126 10.7658 3.62515 11.1511L3.22754 13.1411C6.63321 12.7557 11.6331 10.8716 13.0167 5.66672Z" fill="#662113"/>
        <path d="M30.7729 13.1408L30.3753 11.1509C28.0992 10.7656 24.2449 9.54439 22.9426 5.6665H20.9838C22.3664 10.8713 27.3673 12.7555 30.7729 13.1408ZM16.0557 5.6665V25.5858L17.0001 23.0962L17.9446 25.5858V5.6665H16.0557Z" fill="#662113"/>
      </g>
    </svg>
  );
  // กระโปรง (default)
  return (
    <svg width="34" height="34" viewBox="0 0 46 46" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path opacity="0.8" d="M19.1667 10.5415H26.8334L30.5901 41.5493C28.0822 41.9699 25.543 42.1763 23.0001 42.1665C20.1347 42.1665 17.6085 41.9269 15.4062 41.5493L19.1667 10.5415Z" fill="#053F5C"/>
      <path opacity="0.5" d="M11.1897 10.5415L3.98683 34.4098C3.57283 35.7821 3.98875 37.256 5.24033 38.0054C7.12633 39.1382 10.4479 40.6964 15.4063 41.5493L19.1649 10.5415H11.1897Z" fill="#053F5C"/>
      <path opacity="0.9" d="M40.7595 38.0073C42.0092 37.256 42.427 35.7821 42.013 34.4098L34.8102 10.5415H26.833L30.5897 41.5493C35.5481 40.6983 38.8697 39.1401 40.7595 38.0073Z" fill="#053F5C"/>
      <path d="M30.8755 3.8335H15.1263C13.271 3.8335 12.3433 3.8335 11.7664 4.39508C11.1895 4.95666 11.1895 5.85941 11.1895 7.66683V10.5418H34.8124V7.66683C34.8124 5.85941 34.8124 4.95666 34.2355 4.39508C33.6605 3.8335 32.7309 3.8335 30.8755 3.8335Z" fill="#053F5C"/>
    </svg>
  );
}

// ── helper: จัดกลุ่ม items ตามประเภท (name) รวมจำนวน + เก็บรูปแรก
function groupItems(items = []) {
  const map = {};
  items.forEach(item => {
    const key = item.name || "อื่นๆ";
    if (!map[key]) {
      map[key] = { name: key, total: 0, needed: 0, image_url: item.image_url || item.uniform_image_url || null };
    }
    map[key].total  += Number(item.quantity_remaining ?? item.quantity_needed ?? item.quantity ?? 0);
    map[key].needed += Number(item.quantity_needed ?? item.quantity ?? 0);
    if (!map[key].image_url) map[key].image_url = item.image_url || item.uniform_image_url || null;
  });
  return Object.values(map);
}

const COLLECTION_BADGE_CONFIG = {
  "แนะนำ":               { bg: "#ef4444", color: "#fff", label: "ต้องการความช่วยเหลือ", icon: <Icon icon="mdi:hand-heart-outline" width="24" height="24" /> },
  "ใหม่ล่าสุด":          { bg: "#3b82f6", color: "#fff", icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 36 36"><path fill="currentColor" d="m34.11 24.49l-3.92-6.62l3.88-6.35a1 1 0 0 0-.85-1.52H2a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h31.25a1 1 0 0 0 .86-1.51m-23.6-3.31H9.39l-3.26-4.34v4.35H5V15h1.13l3.27 4.35V15h1.12ZM16.84 16h-3.53v1.49h3.2v1h-3.2v1.61h3.53v1h-4.66V15h4.65Zm8.29 5.16H24l-1.55-4.59l-1.55 4.61h-1.12l-2-6.18H19l1.32 4.43L21.84 15h1.22l1.46 4.43L25.85 15h1.23Z"/><path fill="none" d="M0 0h36v36H0z"/></svg> },
  "ใกล้เวลาปิด":         { bg: "#f97316", color: "#fff", icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> },
  "ใกล้ถึงเป้าหมาย":    { bg: "#10b981", color: "#fff", icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8a8 8 0 0 1-8 8zm0-12a4 4 0 1 0 4 4a4 4 0 0 0-4-4zm0 6a2 2 0 1 1 2-2a2 2 0 0 1-2 2z"/></svg> },
  "ปิดโครงการ":          { bg: "#6b7280", color: "#fff", icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 14 14"><path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" d="M2.5.5v13m0-13l9 4.5l-9 4.5" strokeWidth="1"/></svg> },
};

function ProjectCard({ p, navigate, details, style, collectionLabel }) {
  const [hovered, setHovered] = useState(false);
  const [popupPos, setPopupPos] = useState({ top: 0, left: 0 });
  const cardRef = useRef(null);

  useEffect(() => {
  const handleScroll = () => setHovered(false);
  window.addEventListener("scroll", handleScroll, { passive: true });
  return () => window.removeEventListener("scroll", handleScroll);
}, []);

  const items    = details || [];
  const grouped  = useMemo(() => groupItems(items).filter(g => g.total > 0).slice(0, 3), [items]);

  const itemsTotalNeeded = items.length > 0
    ? items.reduce((sum, item) => sum + Number(item.quantity ?? 0), 0)
    : Number(p.total_needed || 0);
  // ถ้า items โหลดแล้ว ใช้ quantity_remaining จาก getProjectByIdPublic (snapshot-based, แม่นยำกว่า)
  // ถ้ายังไม่โหลด ใช้ total_fulfilled จาก list api เป็น fallback
  const totalNeeded = items.length > 0
    ? items.reduce((sum, item) => sum + Number(item.quantity_remaining ?? item.quantity ?? 0), 0)
    : Math.max(itemsTotalNeeded - Number(p.total_fulfilled || 0), 0);
  const totalFulfilled  = Math.max(itemsTotalNeeded - totalNeeded, 0);
  const goalMet         = totalNeeded === 0 && itemsTotalNeeded > 0;

  const handleMouseEnter = () => {
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      const popupW = Math.min(360, Math.max(260, rect.width - 20));
      const rawLeft = rect.left + rect.width / 2;
      const clampedLeft = Math.max(popupW / 2 + 8, Math.min(window.innerWidth - popupW / 2 - 8, rawLeft));
      setPopupPos({ top: rect.top, left: clampedLeft, width: popupW });
    }
    setHovered(true);
  };

  return (
    <div
      ref={cardRef}
      className="dpCard"
      onClick={() => navigate(`/projects/${p.request_id}`)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setHovered(false)}
      style={{ position: "relative", ...style }}
    >
      <div className="dpCardImg" style={{ position: "relative" }}>
        {p.request_image_url
          ? <img src={p.request_image_url} alt={p.request_title} />
          : <div className="dpCardImgPlaceholder" />}
        {items.length > 0 && goalMet && (
          <div className="dpSliderTag" style={{ background: "#f0fdf4", color: "#4ade80", border: "1.5px solid #86efac", borderRadius: 6, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"><path fill="currentColor" fillRule="evenodd" d="M12 21a9 9 0 1 0 0-18a9 9 0 0 0 0 18m-.232-5.36l5-6l-1.536-1.28l-4.3 5.159l-2.225-2.226l-1.414 1.414l3 3l.774.774z" clipRule="evenodd"/></svg>
            ได้รับครบแล้ว
          </div>
        )}
        {/* top-left: collection badge */}
        {collectionLabel && COLLECTION_BADGE_CONFIG[collectionLabel] && (
          <div style={{ position: "absolute", top: 10, left: 10, background: COLLECTION_BADGE_CONFIG[collectionLabel].bg, color: COLLECTION_BADGE_CONFIG[collectionLabel].color, borderRadius: 20, padding: "4px 10px", fontSize: 14, fontWeight: 600, display: "flex", alignItems: "center", gap: 5 }}>
            {COLLECTION_BADGE_CONFIG[collectionLabel].icon}
            {COLLECTION_BADGE_CONFIG[collectionLabel].label || collectionLabel}
          </div>
        )}
        {/* top-right: countdown badge */}
        {p.end_date && (() => {
          const d = Math.ceil((new Date(p.end_date) - new Date()) / 86400000);
          if (d < 0 || d > 30) return null;
          const bg = d <= 3 ? "#ef4444" : d <= 7 ? "#FC8D1F" : "#34d399";
          const label = d === 0 ? "วันสุดท้าย!" : `เหลือ ${d} วัน`;
          return (
            <div style={{ position: "absolute", top: 10, right: 10, background: bg, color: "#fff", borderRadius: 20, padding: "4px 10px", fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 5 }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              {label}
            </div>
          );
        })()}
      </div>

      <div className="dpCardBody">
        <div className="dpCardBadge">โครงการ</div>
        <div className="dpCardTitle">{p.request_title}</div>
        <div className="dpCardSchool">{p.school_name}</div>
        <div className="dpCardAddr">
          <span className="dpCardAddrIcon">
            <Icon icon="fluent:location-20-filled" width="14" height="14" style={{ display: "block" }} />
          </span>
          {p.school_address}
        </div>
        <div className="dpCardBottom">
          <div className="dpCardFulfilled"
            style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 7L5.5 10.5L12 3.5" stroke="currentColor"
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            ส่งถึงโรงเรียนแล้ว <strong>{totalFulfilled}</strong> ตัว
          </div>
          <button
            className="dpCardBtn"
            onClick={e => { e.stopPropagation(); navigate(`/projects/${p.request_id}`); }}
          >
            ส่งต่อ
          </button>
        </div>
      </div>

      {/* Popup fixed — rendered via portal to escape transform stacking context */}
      {hovered && createPortal(
        <div
          onClick={e => e.stopPropagation()}
          style={{
            position: "fixed",
            top:  popupPos.top,
            left: popupPos.left,
            transform: "translate(-50%, -100%)",
            width: `${popupPos.width || 360}px`,
            background: "#fff",
            borderRadius: "16px",
            boxShadow: "0 12px 40px rgba(0,0,0,0.25)",
            padding: "16px",
            zIndex: 9999,
            pointerEvents: "auto",
            animation: "dpHoverIn 0.15s ease",
          }}
        >
          <div className="dpHoverHeader">
            <div className="dpHoverSchool">{p.school_name}</div>
            <div className="dpHoverMeta">
              {goalMet ? (
                <span style={{ color: "#16a34a", fontWeight: 700, fontSize: 13, display: "inline-flex", alignItems: "center", gap: 4 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  ครบเป้าหมายแล้ว · ได้ {totalFulfilled} ชิ้น
                </span>
              ) : (
                <>
                  <span className="dpHoverNeed">ต้องการอีก {totalNeeded} ชิ้น</span>
                  <span className="dpHoverSep">·</span>
                  <span className="dpHoverGot">ได้รับแล้ว {totalFulfilled} ชิ้น</span>
                  <span className="dpHoverSep">·</span>
                  <span style={{ color: "#64748b" }}>ทั้งหมด {itemsTotalNeeded} ชิ้น</span>
                </>
              )}
            </div>
          </div>
          <div className="dpHoverLine" />
          <div className="dpHoverSection">รายละเอียดชุดที่ต้องการ</div>
          <div className="dpHoverImgRow">
            {grouped.length > 0 ? grouped.map((g, i) => (
              <div key={i} className="dpHoverImgItem">
                <div className="dpHoverImgBox">
                  {g.image_url
                    ? <img src={g.image_url} alt={g.name} />
                    : <div className="dpHoverImgPlaceholder">{g.name?.charAt(0)}</div>}
                </div>
                <div className="dpHoverImgName">{g.name}</div>
                <div className="dpHoverImgQty">{g.needed - g.total}/{g.needed} ชิ้น</div>
              </div>
            )) : <div className="dpHoverEmpty">ยังไม่มีข้อมูล</div>}
          </div>
          <button
            className="dpHoverDetailBtn"
            onClick={e => { e.stopPropagation(); navigate(`/projects/${p.request_id}#uniform-details`); }}
          >
            ดูรายละเอียด →
          </button>
        </div>,
        document.body
      )}
    </div>
  );
}

const KEYWORD_DETECTORS = [
  { patterns: ["เสื้อนักเรียน", "เสื้อนร.", "เสื้อ"],  token: "เสื้อนักเรียน" },
  { patterns: ["กางเกง"],                                token: "กางเกง" },
  { patterns: ["กระโปรง"],                               token: "กระโปรง" },
  { patterns: ["หญิง", "ผู้หญิง"],                       token: "female" },
  { patterns: ["ชาย", "ผู้ชาย"],                         token: "male" },
  { patterns: ["ประถม"],                                  token: "ประถมศึกษา" },
  { patterns: ["มัธยม"],                                  token: "มัธยมศึกษา" },
  { patterns: ["อนุบาล"],                                 token: "อนุบาล" },
  { patterns: ["อก", "รอบอก"],                            token: "chest" },
  { patterns: ["เอว", "รอบเอว"],                          token: "waist" },
];

function normalizeAndTokenize(query) {
  const q = query.toLowerCase().trim();
  const tokens = new Set();

  // ตรวจ keyword ที่รู้จักทั้งแบบติดกันและเว้นวรรค
  for (const { patterns, token } of KEYWORD_DETECTORS) {
    if (patterns.some(kw => q.includes(kw))) tokens.add(token);
  }

  // ดึงตัวเลข (size)
  const nums = q.match(/\d+/g);
  if (nums) nums.forEach(n => tokens.add(n));

  // เก็บคำที่เหลือจากการ split ด้วย space (สำหรับค้นชื่อโรงเรียน/ชื่อโครงการ)
  q.split(/\s+/).filter(w => w.length > 1).forEach(w => tokens.add(w));

  return [...tokens];
}

function getSizeValues(item) {
  try {
    const s = typeof item.size === "string" ? JSON.parse(item.size) : item.size;
    return Object.values(s || {}).map(String);
  } catch {
    return [String(item.size || "")];
  }
}

export default function DonationProject() {
  const { token, userName, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const searchSectionRef = useRef(null);
  const gridRef = useRef(null);

  const [projects, setProjects] = useState([]);
  const [closedProjects, setClosedProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilter, setShowFilter] = useState(false);
  const [sortBy, setSortBy] = useState("newest");

  // ===== filter state =====
  const [selType, setSelType]       = useState("");
  const [selGender, setSelGender]   = useState("");
  const [selLevel, setSelLevel]     = useState("");
  const [selSize, setSelSize]       = useState("");
  const [selCond, setSelCond]       = useState("");
  const [selProvince, setSelProvince] = useState("");
  const [searchQ, setSearchQ]         = useState("");
  const [meiliHits, setMeiliHits]     = useState(null); // null = offline/not searched
  const [meiliLoading, setMeiliLoading] = useState(false);
  const [hoveredType, setHoveredType] = useState("");
  const [selCollections, setSelCollections] = useState([]);

  const toggleCollection = (col) =>
    setSelCollections(prev => {
      if (prev.includes(col)) return prev.filter(c => c !== col);
      // ปิดโครงการ exclusive — deselect collection อื่นเมื่อเลือก และ deselect ปิดโครงการเมื่อเลือก collection อื่น
      if (col === "ปิดโครงการ") return ["ปิดโครงการ"];
      return [...prev.filter(c => c !== "ปิดโครงการ"), col];
    });

  // ===== โหลดโครงการ =====
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await getJson("/home", false);
        setProjects(Array.isArray(data.projects) ? data.projects : []);
        setClosedProjects(Array.isArray(data.closed_projects) ? data.closed_projects : []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ===== pre-select collection + scroll to grid ถ้ามาจาก tab link หน้าหลัก =====
  const pendingScrollRef = useRef(false);
  useEffect(() => {
    const col = location.state?.collection;
    if (!col) return;
    setSelCollections([col]);
    pendingScrollRef.current = true;
  }, [location.state]);

  useEffect(() => {
    if (!pendingScrollRef.current || loading) return;
    pendingScrollRef.current = false;
    setTimeout(() => {
      gridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  }, [loading]);

  // ===== scroll to search ถ้ามาจากหน้าหลัก =====
  useEffect(() => {
    if (location.state?.focusSearch && searchSectionRef.current) {
      setTimeout(() => {
        searchSectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
        const input = searchSectionRef.current.querySelector("input");
        if (input) input.focus();
      }, 300);
    }
  }, [location.state]);

 // ===== โหลด uniform_items ของแต่ละโครงการ =====
const [projectDetails, setProjectDetails] = useState({});
const detailsFetchedRef = useRef(false);

useEffect(() => {
  if (projects.length === 0 || detailsFetchedRef.current) return;
  detailsFetchedRef.current = true;

  const BATCH = 8;
  const fetchDetails = async () => {
    let map = {};
    for (let i = 0; i < projects.length; i += BATCH) {
      const batch = projects.slice(i, i + BATCH);
      const results = await Promise.allSettled(
        batch.map(p => getJson(`/school/projects/public/${p.request_id}`, false))
      );
      results.forEach(r => {
        if (r.status === "fulfilled" && r.value?.request_id) {
          map[r.value.request_id] = r.value.uniform_items || [];
        }
      });
      setProjectDetails({ ...map });
    }
  };

  fetchDetails();
}, [projects]);

  // ===== คำนวณ search query อัตโนมัติ =====
  const autoQuery = useMemo(() => {
    const parts = [];
    if (selType)     parts.push(selType);
    if (selGender)   parts.push(selGender);
    if (selLevel)    parts.push(selLevel);
    if (selSize) {
      const sizeLabel = selType === "เสื้อนักเรียน" ? `รอบอก ${selSize}"` : `รอบเอว ${selSize}"`;
      parts.push(sizeLabel);
    }
    if (selCond)     parts.push(`สภาพ ${selCond}`);
    if (selProvince) parts.push(selProvince);
    return parts.join(" ");
  }, [selType, selGender, selLevel, selSize, selCond, selProvince]);

  // ===== Meilisearch: debounced full-text search =====
  const MEILI_BASE = (import.meta?.env?.VITE_API_BASE_URL || (import.meta.env.PROD ? window.location.origin : "http://localhost:3000"));

  const runMeiliSearch = useCallback(async (q, province) => {
    if (!q.trim()) { setMeiliHits(null); return; }
    setMeiliLoading(true);
    try {
      const params = new URLSearchParams({ q, limit: "100" });
      if (province) params.set("province", province);
      const res = await fetch(`${MEILI_BASE}/api/search/projects?${params}`);
      if (!res.ok) throw new Error("search unavailable");
      const data = await res.json();
      // hits may be empty if Meilisearch is offline (routes return { hits: [] })
      if (Array.isArray(data.hits)) {
        setMeiliHits(data.hits.map(h => h.request_id));
      } else {
        setMeiliHits(null); // offline fallback
      }
    } catch {
      setMeiliHits(null); // graceful fallback to client-side filter
    } finally {
      setMeiliLoading(false);
    }
  }, [MEILI_BASE]);

  useEffect(() => {
    if (!searchQ.trim()) { setMeiliHits(null); return; }
    const t = setTimeout(() => runMeiliSearch(searchQ, selProvince), 300); // 300ms debounce
    return () => clearTimeout(t);
  }, [searchQ, selProvince, runMeiliSearch]);

  // ===== ไซส์ที่แสดงตามประเภท+ระดับชั้น =====
  const availableSizes = useMemo(() => {
    if (!selLevel) {
      if (!selType) return [];
      // รวมทุกระดับ
      const all = new Set();
      Object.values(SIZE_RANGES).forEach(r => {
        const arr = selType === "เสื้อนักเรียน" ? r.chest : r.waist;
        arr.forEach(s => all.add(s));
      });
      return [...all].sort((a,b) => Number(a)-Number(b));
    }
    const r = SIZE_RANGES[selLevel];
    if (!r) return [];
    return selType === "เสื้อนักเรียน" ? r.chest : r.waist;
  }, [selType, selLevel]);

  const sizeLabel = selType === "เสื้อนักเรียน" ? "รอบอก (นิ้ว)" : selType ? "รอบเอว (นิ้ว)" : "ไซส์";

  const availableProvinces = useMemo(() => {
    const set = new Set();
    projects.forEach(p => { if (p.school_province) set.add(p.school_province); });
    return [...set].sort((a, b) => a.localeCompare(b, "th"));
  }, [projects]);

  // ===== fairness score =====
  const fairProjects = useMemo(() => {
    if (!projects.length) return [];
    const today = new Date();
    const top80 = [...projects]
      .filter(p => {
        const totalNeeded    = Number(p.total_needed)    || 0;
        const totalFulfilled = Number(p.total_fulfilled) || 0;
        if (totalNeeded > 0 && totalFulfilled >= totalNeeded) return false;
        return true;
      })
      .map(p => {
        const totalNeeded    = Number(p.total_needed)    || 0;
        const totalFulfilled = Number(p.total_fulfilled) || 0;

        // ปัจจัย 1: สัดส่วนความต้องการที่ยังไม่ได้รับการช่วยเหลือ (35%)
        const deficitRatio = totalNeeded > 0
          ? Math.max((totalNeeded - totalFulfilled) / totalNeeded, 0)
          : 0;

        // ปัจจัย 2: จำนวนชุดที่ยังขาด (25%)=
        const remaining = totalNeeded - totalFulfilled;
        const absoluteDeficit = remaining > 40 ? 1.0 : remaining >= 10 ? 0.5 : 0;

        // ปัจจัย 3: ระยะเวลาคงเหลือก่อนปิดโครงการ (20%) — binary
        let deadlineScore = 0;
        if (p.end_date) {
          const daysLeft = Math.ceil((new Date(p.end_date) - today) / 86400000);
          if (daysLeft >= 0 && daysLeft <= 7) deadlineScore = 1.0;
        }

        // ปัจจัย 4: ระยะเวลาที่ไม่มีการบริจาค (10%)
        let neglectScore = 0;
        if (p.last_donation_at) {
          const daysSince = Math.ceil((today - new Date(p.last_donation_at)) / 86400000);
          if (daysSince > 14)     neglectScore = 1.0;
          else if (daysSince >= 7) neglectScore = 0.5;
        }

        // ปัจจัย 5: จำนวนนักเรียนที่ต้องการชุด (10%)
        const studentCount = Number(p.student_count) || 0;
        const studentScore = studentCount > 30 ? 1.0 : studentCount >= 10 ? 0.5 : 0;

        const score = (deficitRatio    * 0.35)
          + (absoluteDeficit * 0.25)
          + (deadlineScore   * 0.20)
          + (neglectScore    * 0.10)
          + (studentScore    * 0.10);

        return { ...p, _fairScore: score };
      })
      .sort((a, b) => b._fairScore - a._fairScore)
      .slice(0, 80);

    const groupA = shuffle(top80.filter(p => p._fairScore >= 0.7));
    const groupB = shuffle(top80.filter(p => p._fairScore >= 0.4 && p._fairScore < 0.7));
    const groupC = shuffle(top80.filter(p => p._fairScore < 0.4));
    return [...groupA, ...groupB, ...groupC];
  }, [projects]);

  // ===== collection membership per project (all collections a project belongs to) =====
  const projectAllCollections = useMemo(() => {
    const today = new Date();
    const fairIds = new Set(fairProjects.map(p => p.request_id));
    const newestIds = new Set(
      projects.filter(p => {
        const ref = p.start_date || p.created_at;
        if (!ref) return false;
        return Math.ceil((today - new Date(ref)) / 86400000) <= 30;
      }).map(p => p.request_id)
    );
    const closingIds = new Set(
      projects.filter(p => {
        if (!p.end_date) return false;
        const d = Math.ceil((new Date(p.end_date) - today) / 86400000);
        return d >= 0 && d <= 7;
      }).map(p => p.request_id)
    );
    const nearGoalIds = new Set(
      projects.filter(p => {
        const needed = Number(p.total_needed);
        const fulfilled = Number(p.total_fulfilled);
        return needed > 0 && fulfilled / needed >= 0.7;
      }).map(p => p.request_id)
    );
    const map = {};
    projects.forEach(p => {
      const id = p.request_id;
      // แต่ละโครงการติด collection เดียวตาม priority
      if (closingIds.has(id))       map[id] = ["ใกล้เวลาปิด"];
      else if (nearGoalIds.has(id)) map[id] = ["ใกล้ถึงเป้าหมาย"];
      else if (newestIds.has(id))   map[id] = ["ใหม่ล่าสุด"];
      else if (fairIds.has(id))     map[id] = ["แนะนำ"];
    });
    return map;
  }, [projects, fairProjects]);

  // ===== filter + sort projects =====
  const displayProjects = useMemo(() => {
  let list = [...projects];

  // filter ด้วย search/autoQuery
  const rawQ = (searchQ || autoQuery).trim();
  if (rawQ) {
    if (searchQ.trim() && meiliHits !== null) {
      // ── Meilisearch ranked results ─────────────────────────────────
      const hitSet = new Set(meiliHits);
      // Preserve Meilisearch ranking order
      const ranked = meiliHits
        .map(id => list.find(p => p.request_id === id))
        .filter(Boolean);
      const rest = list.filter(p => !hitSet.has(p.request_id));
      list = [...ranked, ...rest.filter(() => false)]; // only show Meilisearch hits
    } else {
      // ── Client-side fallback (Meilisearch offline or autoQuery) ────
      const tokens = searchQ
        ? normalizeAndTokenize(searchQ)
        : autoQuery.toLowerCase().split(" ").filter(w => w.length > 0);

      list = list.filter(p => {
        const basicMatch = tokens.some(token =>
          (p.school_name || "").toLowerCase().includes(token) ||
          (p.request_title || "").toLowerCase().includes(token) ||
          (p.school_address || "").toLowerCase().includes(token)
        );
        const items = projectDetails[p.request_id] || [];
        const uniformMatch = tokens.some(token =>
          items.some(item =>
            (item.name || "").toLowerCase().includes(token) ||
            (item.education_level || "").toLowerCase().includes(token) ||
            (item.gender || "").toLowerCase().includes(token) ||
            getSizeValues(item).some(v => v.includes(token))
          )
        );
        return basicMatch || uniformMatch;
      });
    }
  }

  // filter จังหวัด
  if (selProvince) {
    list = list.filter(p => p.school_province === selProvince);
  }

 // ✅ filter แบบ AND — item เดียวต้องผ่านทุกเงื่อนไขพร้อมกัน
  if (selType || selGender || selLevel || selSize) {
    const genderMap = { "ชาย": "male", "หญิง": "female" };
    list = list.filter(p => {
      const items = projectDetails[p.request_id] || [];
      return items.some(item => {
        // เช็ค type
        if (selType && !(item.name || "").includes(selType)) return false;
        // เช็ค gender
        if (selGender) {
          const genderEn = genderMap[selGender];
          if (item.gender && item.gender !== genderEn) return false;
        }
        // เช็ค level
        if (selLevel && !(item.education_level || "").includes(selLevel)) return false;
        // เช็ค size
        if (selSize) {
          if (!item.size) return false;
          try {
            const sizeObj = typeof item.size === "string"
              ? JSON.parse(item.size)
              : item.size;
            const sizeKey = selType === "เสื้อนักเรียน" ? "chest" : "waist";
            if (String(sizeObj?.[sizeKey] || "") !== String(selSize)) return false;
          } catch {
            return false;
          }
        }
        return true;
      });
    });
  }

  // ── ปิดโครงการ: แสดง closedProjects แทน open projects ──
  if (selCollections.includes("ปิดโครงการ")) {
    const rawQ2 = searchQ.trim().toLowerCase();
    return closedProjects.filter(p =>
      !rawQ2 ||
      (p.school_name || "").toLowerCase().includes(rawQ2) ||
      (p.request_title || "").toLowerCase().includes(rawQ2) ||
      (p.school_address || "").toLowerCase().includes(rawQ2)
    );
  }

  // ── collection filter — ใช้ projectAllCollections เพื่อให้สอดคล้องกับ badge ──
  if (selCollections.length > 0) {
    list = list.filter(p => {
      const cols = projectAllCollections[p.request_id] || [];
      return selCollections.some(c => cols.includes(c));
    });
  }

  if (sortBy === "most_needed") {
    const getRemainingItems = (p) => {
      const items = projectDetails[p.request_id] || [];
      if (items.length > 0)
        return items.reduce((sum, item) => sum + Number(item.quantity_remaining ?? item.quantity_needed ?? 0), 0);
      return Math.max(Number(p.total_needed || 0) - Number(p.total_fulfilled || 0), 0);
    };
    list = [...list].sort((a, b) => getRemainingItems(b) - getRemainingItems(a));
  } else if (sortBy === "newest") {
    const badge      = p => (projectAllCollections[p.request_id] || [])[0];
    const isClosing  = p => badge(p) === "ใกล้เวลาปิด";
    const isNew      = p => badge(p) === "ใหม่ล่าสุด";
    const isNearGoal = p => badge(p) === "ใกล้ถึงเป้าหมาย";
    const isUrgent   = p => badge(p) === "แนะนำ";

    const sortedClosing  = list.filter(isClosing).sort((a, b) => new Date(a.end_date) - new Date(b.end_date));
    const sortedNew      = list.filter(isNew).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    const sortedNearGoal = list.filter(isNearGoal).sort((a, b) => {
      const ra = Number(a.total_needed) > 0 ? Number(a.total_fulfilled) / Number(a.total_needed) : 0;
      const rb = Number(b.total_needed) > 0 ? Number(b.total_fulfilled) / Number(b.total_needed) : 0;
      return rb - ra;
    });
    const sortedUrgent = list.filter(isUrgent);
    const rest         = list.filter(p => !isClosing(p) && !isNew(p) && !isNearGoal(p) && !isUrgent(p));

    if (selCollections.includes("ใหม่ล่าสุด")) {
      list = [...sortedNew, ...sortedClosing, ...sortedNearGoal, ...sortedUrgent, ...rest];
    } else {
      list = [...sortedClosing, ...sortedNew, ...sortedNearGoal, ...sortedUrgent, ...rest];
    }
  }

  if (selCollections.includes("ปิดโครงการ") || sortBy === "most_needed") {
    return list;
  }
  return shuffle(list);
}, [projects, closedProjects, projectDetails, searchQ, autoQuery, meiliHits, selType, selGender, selLevel, selSize, selProvince, selCollections, fairProjects, sortBy, projectAllCollections]);

  // ===== reset size เมื่อเปลี่ยนประเภท/ระดับ =====
  useEffect(() => { setSelSize(""); }, [selType, selLevel]);
  // ── Random section ที่จะแสดง (สุ่มทุก session) ──
const [shownSection] = useState(() => {
  const saved = sessionStorage.getItem("dpShownSection");
  if (saved) return saved;
  const pick = Math.random() < 0.5 ? "urgent" : "zero";
  sessionStorage.setItem("dpShownSection", pick);
  return pick;
});

// ── urgent projects (sort by ต้องการมากที่สุด) ──
const urgentProjects = useMemo(() => {
  return [...projects]
    .sort((a, b) => {
      const ratioA = (a.total_needed - a.total_fulfilled) / (a.student_count || 1);
      const ratioB = (b.total_needed - b.total_fulfilled) / (b.student_count || 1);
      return ratioB - ratioA;
    })
    .slice(0, 10);
}, [projects]);

// ── hero slideshow state ──
const [heroIdx, setHeroIdx] = useState(0);
const heroTimerRef = useRef(null);

// ── zero projects (ยังไม่ได้รับบริจาคเลย) ──
// ── zero projects (ยังไม่ได้รับบริจาคเลย) ──
const zeroProjects = useMemo(() => {
  return projects.filter(p => 
    (p.total_fulfilled || 0) === 0 && 
    (p.total_needed || 0) > 0  // ← มั่นใจว่าเป็นโครงการจริงๆ ที่ต้องการของ
  ).slice(0, 10);
}, [projects]);
// ── slider state ──
const [slideIndex, setSlideIndex] = useState(0);

const slideList = useMemo(() => {
  if (!projects.length) return [];

  const urgentPool = projects.filter(p =>
    Number(p.very_urgent_count) > 0 || Number(p.urgent_count) > 0
  );
  const pool = urgentPool.length > 0 ? urgentPool : projects;

  // urgent 2 slides
  const urgentSlides = shuffle(pool)
    .slice(0, 2)
    .map(p => ({ ...p, _tag: "urgent" }));

  const urgentIds = new Set(urgentSlides.map(p => p.request_id));

  // most 2 slides (ไม่ซ้ำกับ urgent)
  const mostSlides = shuffle(
    [...projects]
      .filter(p => !urgentIds.has(p.request_id))
      .sort((a, b) => Number(b.total_needed) - Number(a.total_needed))
  )
    .slice(0, 2)
    .map(p => ({ ...p, _tag: "most" }));

  return [...urgentSlides, ...mostSlides];
}, [projects]);

// const sectionTitle = "💙 โรงเรียนที่ต้องการความช่วยเหลือ";

// ── auto slide (main) ──
useEffect(() => {
  if (!slideList.length) return;
  const timer = setInterval(() => {
    setSlideIndex(i => (i + 1) % slideList.length);
  }, 3000);
  return () => clearInterval(timer);
}, [slideList.length]);

// ── hero slides: ใกล้เวลาปิด x2, ใหม่ล่าสุด x1, แนะนำ x1 ──
const heroSlides = useMemo(() => {
  if (!projects.length) return [];
  const today = new Date();

  const closingPool = projects.filter(p => {
    if (!p.end_date) return false;
    const d = Math.ceil((new Date(p.end_date) - today) / 86400000);
    return d >= 0 && d <= 7;
  });
  const closingSlides = shuffle(closingPool).slice(0, 2).map(p => ({ ...p, _heroTag: "closing" }));
  const usedIds = new Set(closingSlides.map(p => p.request_id));

  const newestPool = projects.filter(p => {
    if (usedIds.has(p.request_id)) return false;
    const ref = p.start_date || p.created_at;
    if (!ref) return false;
    return Math.ceil((today - new Date(ref)) / 86400000) <= 30;
  });
  const newestSlides = shuffle(newestPool).slice(0, 1).map(p => ({ ...p, _heroTag: "newest" }));
  newestSlides.forEach(p => usedIds.add(p.request_id));

  const fairPool = fairProjects.filter(p => !usedIds.has(p.request_id));
  const fairSlides = shuffle(fairPool).slice(0, 1).map(p => ({ ...p, _heroTag: "recommended" }));

  return [...closingSlides, ...newestSlides, ...fairSlides];
}, [projects, fairProjects]);

// ── hero auto-slide ──
useEffect(() => {
  const total = heroSlides.length;
  if (total <= 1) return;
  heroTimerRef.current = setInterval(() => setHeroIdx(i => (i + 1) % total), 4000);
  return () => clearInterval(heroTimerRef.current);
}, [heroSlides.length]);

  return (
    <div className="homePage">
      {/* ===== Header ===== */}
      <Navbar activeLink="projects" />

      {/* ===== Hero Banner ===== */}
      <div className="dpHero">
        {/* Slide backgrounds */}
        {heroSlides.map((p, i) => (
          <div key={p.request_id} style={{ position: "absolute", inset: 0, backgroundImage: `url(${p.request_image_url || "/unieed_pic/BannerDonation.png"})`, backgroundSize: "cover", backgroundPosition: "center", opacity: i === heroIdx ? 1 : 0, transition: "opacity 0.8s ease" }} />
        ))}
        {(!heroSlides.length || loading) && (
          <div style={{ position: "absolute", inset: 0, backgroundImage: "url(/unieed_pic/BannerDonation.png)", backgroundSize: "cover", backgroundPosition: "center top" }} />
        )}
        <div className="dpHeroOverlay" />
        {/* Content */}
        {!loading && heroSlides.length > 0 ? (() => {
          const cur = heroSlides[heroIdx];
          const tagMap = {
            closing:     { label: "ใกล้เวลาปิด", bg: "#f97316", icon: <Icon icon="mdi:clock-alert-outline" width={24} /> },
            newest:      { label: "ใหม่ล่าสุด",   bg: "#2563eb", icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 36 36"><path fill="currentColor" d="m34.11 24.49l-3.92-6.62l3.88-6.35a1 1 0 0 0-.85-1.52H2a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h31.25a1 1 0 0 0 .86-1.51m-23.6-3.31H9.39l-3.26-4.34v4.35H5V15h1.13l3.27 4.35V15h1.12ZM16.84 16h-3.53v1.49h3.2v1h-3.2v1.61h3.53v1h-4.66V15h4.65Zm8.29 5.16H24l-1.55-4.59l-1.55 4.61h-1.12l-2-6.18H19l1.32 4.43L21.84 15h1.22l1.46 4.43L25.85 15h1.23Z"/><path fill="none" d="M0 0h36v36H0z"/></svg> },
            recommended: { label: "ต้องการความช่วยเหลือ", bg: "#ef4444", icon: <Icon icon="mdi:hand-heart-outline" width={24} /> },
          };
          const tag = tagMap[cur?._heroTag] || tagMap.recommended;
          return (
            <div className="dpHeroContent">
              <div style={{ display: "inline-flex", alignItems: "center", gap: 5, background: tag.bg, color: "#fff", borderRadius: 20, padding: "3px 12px", fontSize: 14, fontWeight: 600, marginBottom: 10 }}>
                {tag.icon}{tag.label}
              </div>
              <h1 className="dpHeroTitle">{cur?.school_name}</h1>
              <p className="dpHeroSub">{cur?.request_title}</p>
              <button onClick={() => navigate(`/projects/${cur?.request_id}`)} className="dpHeroCTA">
                ดูโครงการ →
              </button>
            </div>
          );
        })() : (
          <div className="dpHeroContent">
            <h1 className="dpHeroTitle">เริ่มต้นการเปลี่ยนแปลง</h1>
            <p className="dpHeroSub">สร้างโอกาสทางการศึกษา ผ่านการส่งต่อชุดนักเรียน</p>
          </div>
        )}
        {/* Dots */}
        {!loading && heroSlides.length > 1 && (
          <div style={{ position: "absolute", bottom: 20, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 6, zIndex: 2 }}>
            {heroSlides.map((_, i) => (
              <button key={i} onClick={() => { clearInterval(heroTimerRef.current); setHeroIdx(i); heroTimerRef.current = setInterval(() => setHeroIdx(j => (j + 1) % heroSlides.length), 4000); }} style={{ width: i === heroIdx ? 20 : 8, height: 8, borderRadius: 99, background: i === heroIdx ? "#fff" : "rgba(255,255,255,0.5)", border: "none", cursor: "pointer", transition: "all 0.3s", padding: 0 }} />
            ))}
          </div>
        )}
      </div>

      {/* ===== Search + Filter ===== */}
      <div className="dpSearchSection" ref={searchSectionRef}>
        {/* Search bar */}
        <div className="dpSearchRow">
          <div className="dpSearchBox">
            <FontAwesomeIcon icon={faMagnifyingGlass} className="dpSearchIcon" />
            <input
              value={searchQ || autoQuery}
              onChange={e => {
                setSearchQ(e.target.value);
                if (!e.target.value) {
                  setSelType(""); setSelGender(""); setSelLevel("");
                  setSelSize(""); setSelCond(""); setSelProvince("");
                }
              }}
              placeholder="ค้นหาโครงการ ระบุประเภท ขนาด ที่ต้องการส่งต่อ..."
            />
            {meiliLoading && (
              <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)" }}>
                <Icon icon="ph:circle-notch" width={16} style={{ color: "#0F6E56", animation: "spin 0.8s linear infinite" }} />
              </span>
            )}
          </div>
          <button
            className={`dpFilterBtn ${showFilter ? "dpFilterBtnActive" : ""}`}
            onClick={() => setShowFilter(f => !f)}
          >
            <FontAwesomeIcon icon={faFilter} />
          </button>
          
        </div>

        {/* Smart filter */}
        <div className={`dpFilterPanel ${showFilter ? "dpFilterPanelOpen" : ""}`}>
          <div className="dpFilterLabel">คุณต้องการบริจาคอะไร?</div>
          <div className="dpFilterGrid">

            {/* ประเภทชุด */}
            <div className="dpFilterGroup">
              <div className="dpFilterGroupLabel">ประเภทชุด</div>
              <div className="dpTypeRow">
                {UNIFORM_TYPES.map(t => (
                 <div className="dpTypeBtnWrap">
  <button
  key={t.key}
 style={{ 
  background: selType === t.key
    ? TYPE_COLORS[t.key]?.hover  // ← active ใช้สี hover
    : hoveredType === t.key 
      ? TYPE_COLORS[t.key]?.hover 
      : TYPE_COLORS[t.key]?.bg || "#87c7eb" 
}}
  className={`dpTypeBtn ${selType === t.key ? "dpTypeBtnActive" : ""}`}
  onMouseEnter={() => setHoveredType(t.key)}
  onMouseLeave={() => setHoveredType("")}
  onClick={() => {
    const newType = selType === t.key ? "" : t.key;
    setSelType(newType);
    if (newType === "กระโปรง") setSelGender("หญิง");
    else if (newType === "กางเกง") setSelGender("ชาย");
    else setSelGender("");
  }}
>
  <span className="dpTypeIcon">{t.icon}</span>
</button>
  <span className="dpTypeLabel">{t.label}</span>
</div>
                ))}
              </div>
            </div>

            {/* เพศ */}
            <div className="dpFilterGroup">
              <div className="dpFilterGroup dpFilterGroupNarrow">
                  <div className="dpFilterGroupLabel">เพศ</div>
              </div>
              <select
                className="dpSelect"
                value={selGender}
                onChange={e => setSelGender(e.target.value)}
              >
                <option value="">เพศ</option>
                {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>

            {/* ระดับชั้น */}
            <div className="dpFilterGroup">
              <div className="dpFilterGroup dpFilterGroupNarrow">
              <div className="dpFilterGroupLabel">ระดับชั้น</div>
              </div>
              <select
                className="dpSelect"
                value={selLevel}
                onChange={e => setSelLevel(e.target.value)}
              >
                <option value="">ระดับชั้น</option>
                {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>

            {/* ไซส์ */}
            <div className="dpFilterGroup">
              <div className="dpFilterGroup dpFilterGroupNarrow">
              <div className="dpFilterGroupLabel">{sizeLabel}</div>
              </div>
              <select
              
                className="dpSelect"
                value={selSize}
                onChange={e => setSelSize(e.target.value)}
                disabled={!selType}
              >
                <option value="">{selType ? sizeLabel : "เลือกประเภทก่อน"}</option>
                {availableSizes.map(s => <option key={s} value={s}>{s}"</option>)}
              </select>
            </div>

            {/* จังหวัด */}
            <div className="dpFilterGroup">
              <div className="dpFilterGroup dpFilterGroupNarrow">
                <div className="dpFilterGroupLabel">จังหวัด</div>
              </div>
              <select
                className="dpSelect"
                value={selProvince}
                onChange={e => setSelProvince(e.target.value)}
              >
                <option value="">ทุกจังหวัด</option>
                {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>

            {/* สภาพ
            <div className="dpFilterGroup">
              <div className="dpFilterGroup dpFilterGroupNarrow">
              <div className="dpFilterGroupLabel">สภาพ</div>
              </div>
              <select
                className="dpSelect"
                value={selCond}
                onChange={e => setSelCond(e.target.value)}
              >
                <option value="">สภาพ</option>
                {CONDITIONS.map(c => <option key={c} value={c}>สภาพ {c}</option>)}
              </select>
            </div> */}

          </div>

          {/* ── เรียงตาม ── */}
          <div className="dpFilterSubLabel dpFilterSectionLabel" style={{ marginBottom: 10, marginTop: 16 }}>เรียงตาม</div>
          <div className="dpFilterBtnRow" style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20, marginLeft: 200 }}>
            {[{ key: "newest", label: "ล่าสุด" }, { key: "most_needed", label: "ยังขาดมากที่สุด" }].map(({ key, label }) => (
              <label key={key} style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", background: sortBy === key ? "#053f5c" : "#f3f4f6", color: sortBy === key ? "#fff" : "#374151", borderRadius: 20, padding: "6px 14px", fontSize: 13, fontWeight: 500, userSelect: "none", transition: "all 0.2s" }}>
                <input type="radio" name="sortBy" checked={sortBy === key} onChange={() => setSortBy(key)} style={{ display: "none" }} />
                {label}
              </label>
            ))}
          </div>

          {/* ── คอลเลคชัน ── */}
          <div className="dpFilterSubLabel dpFilterSectionLabel" style={{ marginBottom: 10, marginTop: 16 }}>กรองโครงการ</div>
          <div className="dpFilterBtnRow" style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20, marginLeft: 200 }}>
            {[
              { key: "แนะนำ",          label: "ต้องการความช่วยเหลือ", color: "#ef4444", icon: <Icon icon="mdi:hand-heart-outline" width="14" height="14" /> },
              { key: "ใหม่ล่าสุด",      label: "ใหม่ล่าสุด",            color: "#3b82f6", icon: <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 36 36"><path fill="currentColor" d="m34.11 24.49l-3.92-6.62l3.88-6.35a1 1 0 0 0-.85-1.52H2a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h31.25a1 1 0 0 0 .86-1.51m-23.6-3.31H9.39l-3.26-4.34v4.35H5V15h1.13l3.27 4.35V15h1.12ZM16.84 16h-3.53v1.49h3.2v1h-3.2v1.61h3.53v1h-4.66V15h4.65Zm8.29 5.16H24l-1.55-4.59l-1.55 4.61h-1.12l-2-6.18H19l1.32 4.43L21.84 15h1.22l1.46 4.43L25.85 15h1.23Z"/><path fill="none" d="M0 0h36v36H0z"/></svg> },
              { key: "ใกล้เวลาปิด",     label: "ใกล้เวลาปิด",           color: "#f97316", icon: <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> },
              { key: "ใกล้ถึงเป้าหมาย", label: "ใกล้ถึงเป้าหมาย",       color: "#10b981", icon: <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8a8 8 0 0 1-8 8zm0-12a4 4 0 1 0 4 4a4 4 0 0 0-4-4zm0 6a2 2 0 1 1 2-2a2 2 0 0 1-2 2z"/></svg> },
              { key: "ปิดโครงการ",      label: "ปิดโครงการ",            color: "#6b7280", icon: <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg> },
            ].map(({ key, label, color, icon }) => {
              const active = selCollections.includes(key);
              return (
                <label key={key} style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", background: active ? color : "#f3f4f6", color: active ? "#fff" : "#374151", border: `1.5px solid ${active ? color : "transparent"}`, borderRadius: 20, padding: "6px 14px", fontSize: 13, fontWeight: 500, userSelect: "none", transition: "all 0.2s" }}>
                  <input type="checkbox" checked={active} onChange={() => toggleCollection(key)} style={{ display: "none" }} />
                  {icon}{label}
                </label>
              );
            })}
          </div>

          {/* reset */}
          {(selType || selGender || selLevel || selSize || selCond || selProvince || selCollections.length > 0 || sortBy !== "newest") && (
            <button className="dpResetBtn" onClick={() => {
              setSelType(""); setSelGender(""); setSelLevel("");
              setSelSize(""); setSelCond(""); setSelProvince(""); setSearchQ("");
              setSelCollections([]); setSortBy("newest");
            }}>
              ล้างตัวกรอง
            </button>
          )}
        </div>
      </div>

      {/* ===== Project List ===== */}
      <div className="dpMain">
        <div className="dpListHeader">
          <h2 className="dpListTitle">
            โครงการโรงเรียนขอรับบริจาคทั้งหมด
            {!loading && (searchQ || autoQuery || selCollections.length > 0) && (
              <span className="dpListCount" style={{ fontSize: 16, fontWeight: 500, color: "#64748b", marginLeft: 12 }}>
                (สิ่งที่คุณค้นหามี <strong style={{ color: "#1d4ed8" }}>{displayProjects.length}</strong> รายการ)
              </span>
            )}
          </h2>
        </div>

        {loading ? (
    <div className="muted" style={{ textAlign: "center", padding: "60px" }}>กำลังโหลด…</div>
  ) : !displayProjects.length ? (
    <div className="muted" style={{ textAlign: "center", padding: "60px" }}>ไม่พบโครงการที่ตรงกับเงื่อนไข</div>
  ) : (
    <div className="dpGrid" ref={gridRef}>
      {displayProjects.map(p => {
        const isClosed = selCollections.includes("ปิดโครงการ");
        const cols = projectAllCollections[p.request_id] || [];
        const PRIORITY = ["ใกล้เวลาปิด", "ใกล้ถึงเป้าหมาย", "ใหม่ล่าสุด", "แนะนำ"];
        const badgeLabel = isClosed
          ? "ปิดโครงการ"
          : selCollections.length > 0
            ? PRIORITY.find(c => selCollections.includes(c) && cols.includes(c)) ?? null
            : PRIORITY.find(c => cols.includes(c)) ?? null;
        return (
          <ProjectCard key={p.request_id} p={p} navigate={navigate} details={projectDetails[p.request_id]} collectionLabel={badgeLabel} />
        );
      })}
    </div>
  )}

        {/* {displayProjects.length > 0 && (
          <div style={{ textAlign: "center", margin: "40px 0" }}>
            <button className="btnGhost" style={{ padding: "0 40px", height: "48px", fontSize: "18px" }}>
              ดูทั้งหมด
            </button>
          </div>
        )} */}
      </div>
      <Footer />
    </div>
  );
}

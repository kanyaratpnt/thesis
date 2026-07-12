import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import { useAuth } from "../../../context/AuthContext.jsx";
import { BASE_URL, getJson } from "../../../api/http.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass, faFilter } from "@fortawesome/free-solid-svg-icons";
import Navbar from "../../../pages/Navbar.jsx";
import Footer from "../../../pages/Footer.jsx";
import "../../../pages/styles/Homepage.css";
import "../styles/MarketPage.css";
import { useAddToCart } from "../hooks/useAddToCart.js";
import marketHeroBgRight from "../../../unieed_pic/Banmarket1.png";
import marketHeroBgLeft  from "../../../unieed_pic/Banmarket2.png";


const UNIFORM_TYPES = [
  { key: "shirt_m", category_id: 1, gender: "male",   type_name: "เสื้อนักเรียนชาย",  icon: <svg width="34" height="34" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M34 30.2222C34 32.3085 32.3085 34 30.2222 34H3.77778C1.6915 34 0 32.3085 0 30.2222V3.77778C0 1.6915 1.6915 0 3.77778 0H30.2222C32.3085 0 34 1.6915 34 3.77778V30.2222Z" fill="white"/>
<path d="M18.2668 33.4857C17.5698 34.1713 16.4308 34.1713 15.7347 33.4857L9.47022 27.3194C8.77417 26.6337 8.59 25.4003 9.06033 24.5767L16.1437 7.15456C16.6149 6.33194 17.3856 6.33194 17.8559 7.15456L24.9393 24.5767C25.4096 25.3993 25.2254 26.6337 24.5294 27.3184L18.2668 33.4857Z" fill="#053F5C"/>
<path d="M16.9996 13.8535C17.8959 13.8535 18.8923 12.9544 19.7376 11.7842L17.8553 7.15456C17.384 6.33194 16.6134 6.33194 16.143 7.15456L14.2607 11.7842C15.1079 12.9544 16.1034 13.8535 16.9996 13.8535Z" fill="#292F33"/>
<path d="M21.7228 5.45667C21.7228 7.31156 19.0868 12.1736 17.0005 12.1736C14.9143 12.1736 12.2783 7.31156 12.2783 5.45667C12.2783 3.77273 14.9143 2.83301 17.0005 2.83301C19.0868 2.83301 21.7228 3.77273 21.7228 5.45667Z" fill="#053F5C"/>
<path d="M0 3.77778V5.90656C1.95878 8.52267 6.40239 13.2269 7.55555 13.2269C9.64183 13.2269 17.9444 3.03072 17.9444 0.944444C17.9444 0 17 0 16.0556 0H3.77778C1.6915 0 0 1.6915 0 3.77778Z" fill="#D9D9D9"/>
<path d="M16.0547 0.944444C16.0547 3.03072 24.3573 13.2269 26.4436 13.2269C27.5967 13.2269 32.0404 8.52267 33.9991 5.90656V3.77778C33.9991 1.6915 32.3076 0 30.2214 0H17.9436C16.9991 0 16.0547 0 16.0547 0.944444Z" fill="#D9D9D9"/>
<path d="M3.77677 0C3.5246 0 3.27999 0.0273889 3.04199 0.0746111C4.15927 1.63956 9.97421 2.83333 16.999 2.83333C24.0238 2.83333 29.8387 1.63956 30.956 0.0746111C30.718 0.0273889 30.4734 0 30.2212 0H3.77677Z" fill="#181818" fill-opacity="0.533333"/>
</svg> },
  { key: "shirt_f", category_id: 1, gender: "female", type_name: "เสื้อนักเรียนหญิง", icon: <svg width="34" height="34" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M34 30.2222C34 32.3085 32.3085 34 30.2222 34H3.77778C1.6915 34 0 32.3085 0 30.2222V3.77778C0 1.6915 1.6915 0 3.77778 0H30.2222C32.3085 0 34 1.6915 34 3.77778V30.2222Z" fill="#FBF0F0"/>
<path d="M18.2665 33.4853C17.5695 34.1709 16.4305 34.1709 15.7344 33.4853L9.46994 27.319C8.77389 26.6333 8.58972 25.3999 9.06005 24.5763L16.1434 7.15417C16.6147 6.33156 17.3853 6.33156 17.8557 7.15417L24.939 24.5763C25.4093 25.3989 25.2252 26.6333 24.5291 27.3181L18.2665 33.4853Z" fill="#FF88C2"/>
<path d="M17 13.8531C17.8963 13.8531 18.8927 12.954 19.7379 11.7838L17.8557 7.15417C17.3844 6.33156 16.6137 6.33156 16.1434 7.15417L14.2611 11.7838C15.1083 12.954 16.1037 13.8531 17 13.8531Z" fill="#A0041E"/>
<path d="M21.7222 5.457C21.7222 7.31189 19.0863 12.1739 17 12.1739C14.9137 12.1739 12.2778 7.31189 12.2778 5.457C12.2778 3.77305 14.9137 2.83333 17 2.83333C19.0863 2.83333 21.7222 3.77305 21.7222 5.457Z" fill="#FF88C2"/>
<path d="M0 3.77778V5.90656C1.95878 8.52267 6.40239 13.2269 7.55556 13.2269C9.64183 13.2269 17.9444 3.03072 17.9444 0.944444C17.9444 0 17 0 16.0556 0H3.77778C1.6915 0 0 1.6915 0 3.77778Z" fill="#B5B5B5"/>
<path d="M16.0556 0.944444C16.0556 3.03072 24.3582 13.2269 26.4444 13.2269C27.5976 13.2269 32.0412 8.52267 34 5.90656V3.77778C34 1.6915 32.3085 0 30.2222 0H17.9444C17 0 16.0556 0 16.0556 0.944444Z" fill="#B5B5B5"/>
<path d="M3.77778 0C3.52561 0 3.281 0.0273889 3.043 0.0746111C4.16028 1.63956 9.97522 2.83333 17 2.83333C24.0248 2.83333 29.8397 1.63956 30.957 0.0746111C30.719 0.0273889 30.4744 0 30.2222 0H3.77778Z" fill="#383838"/>
</svg>
 },
  { key: "pants",   category_id: 2, gender: null,     type_name: "กางเกงนักเรียน",     icon: <svg width="34" height="34" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
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
</svg> },
  { key: "skirt",   category_id: 3, gender: null,     type_name: "กระโปรงนักเรียน",    icon: <svg width="46" height="46" viewBox="0 0 46 46" fill="none" xmlns="http://www.w3.org/2000/svg">
<path opacity="0.8" d="M19.1667 10.5415H26.8334L30.5901 41.5493C28.0822 41.9699 25.543 42.1763 23.0001 42.1665C20.1347 42.1665 17.6085 41.9269 15.4062 41.5493L19.1667 10.5415Z" fill="#053F5C"/>
<path opacity="0.5" d="M11.1897 10.5415L3.98683 34.4098C3.57283 35.7821 3.98875 37.256 5.24033 38.0054C7.12633 39.1382 10.4479 40.6964 15.4063 41.5493L19.1649 10.5415H11.1897Z" fill="#053F5C"/>
<path opacity="0.9" d="M40.7595 38.0073C42.0092 37.256 42.427 35.7821 42.013 34.4098L34.8102 10.5415H26.833L30.5897 41.5493C35.5481 40.6983 38.8697 39.1401 40.7595 38.0073Z" fill="#053F5C"/>
<path d="M30.8755 3.8335H15.1263C13.271 3.8335 12.3433 3.8335 11.7664 4.39508C11.1895 4.95666 11.1895 5.85941 11.1895 7.66683V10.5418H34.8124V7.66683C34.8124 5.85941 34.8124 4.95666 34.2355 4.39508C33.6605 3.8335 32.7309 3.8335 30.8755 3.8335Z" fill="#053F5C"/>
</svg> },
];
const SORT_OPTIONS = [
  { value: "newest",     label: "ใหม่ล่าสุด" },
  { value: "price_asc",  label: "ราคา: น้อย → มาก" },
  { value: "price_desc", label: "ราคา: มาก → น้อย" },
];
const LEVELS = ["","อนุบาล","ประถมศึกษา","มัธยมต้น","มัธยมปลาย"];

const TYPE_COLORS = {
  "เสื้อนักเรียนชาย": {bg: "#87c7eb", hover: "#5285E8"},
  "เสื้อนักเรียนหญิง": {bg: "#FFB6C1", hover: "#5285E8"},
  "กางเกงนักเรียน": {bg:"#E6FFBB", hover: "#5285E8"},
  "กระโปรงนักเรียน": {bg:"#FFEDBF", hover: "#5285E8"},
};

// ── Image Carousel ────────────────────────────────────
function CardCarousel({ images = [], title, quantity }) {
  console.log('CardCarousel quantity:', quantity, 'images:', images.length);
  const [idx, setIdx] = useState(0);
  useEffect(() => setIdx(0), [images]);

  // ← ย้าย badge ออกมานอก เพื่อแสดงแม้ไม่มีรูป
  const stockBadge = quantity > 0 && (
    <span className="mkStockBadge">{quantity} ชิ้น</span>
  );

  if (!images.length) return (
    <div className="mkCarouselWrap">
      <div className="mkCarouselMain" style={{ position: 'relative' }}>
        <div className="mkCardThumbPlaceholder" />
        {stockBadge}
      </div>
    </div>
  );

  return (
    <div className="mkCarouselWrap" style={{ position: 'relative' }}>
       {quantity > 0 && (
      <span className="mkStockBadge">{quantity} ชิ้น</span>
    )}
      <div className="mkCarouselMain" >
      
        <img
          src={images[idx]?.image_url}
          alt={title}
          className="mkCarouselImg"
          loading="lazy"
        />
        {stockBadge}
        {images.length > 1 && (
          <>
            <button className="mkCarouselArrow mkCarouselArrowLeft"
              onClick={e => { e.preventDefault(); e.stopPropagation(); setIdx(i => (i - 1 + images.length) % images.length); }}>
              <Icon icon="mdi:chevron-left" />
            </button>
            <button className="mkCarouselArrow mkCarouselArrowRight"
              onClick={e => { e.preventDefault(); e.stopPropagation(); setIdx(i => (i + 1) % images.length); }}>
              <Icon icon="mdi:chevron-right" />
            </button>
          </>
        )}
      </div>
      {images.length > 1 && (
        <div className="mkCarouselThumbs">
          {images.map((img, i) => (
            <div key={i}
              className={`mkCarouselThumb${i === idx ? ' mkCarouselThumbActive' : ''}`}
              onClick={e => { e.preventDefault(); e.stopPropagation(); setIdx(i); }}>
              <img src={img.image_url} alt={`${title} ${i + 1}`} loading="lazy" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
// ── Product Card ──────────────────────────────────────
function SizeDisplay({ size, categoryId }) {
  if (!size) return null;
  try {
    const s    = JSON.parse(size);
    const cid  = Number(categoryId);
    const parts = [];
    if (cid === 1) {
      if (s.chest  && s.chest  !== '0') parts.push({ label: 'อก',  val: s.chest });
      if (s.length && s.length !== '0') parts.push({ label: 'ยาว', val: s.length });
    } else {
      if (s.waist  && s.waist  !== '0') parts.push({ label: 'เอว', val: s.waist });
      if (s.length && s.length !== '0') parts.push({ label: 'ยาว', val: s.length });
    }
    if (!parts.length) return null;
    return (
      <div className="mkMetaRow">
        <span className="mkMetaLabel">ขนาด</span>
        <span className="mkMetaVal">
          {parts.map((p, i) => (
            <span key={i}>
              {i > 0 && <span className="mkMetaSep">|</span>}
              {p.label} {p.val}
            </span>
          ))}
        </span>
      </div>
    );
  } catch {
    return (
      <div className="mkMetaRow">
        <span className="mkMetaLabel">ขนาด</span>
        <span className="mkMetaVal">{size}</span>
      </div>
    );
  }
}

function ProductCard({ product, donationNeededLabels }) {
  const navigate = useNavigate();
   const { addToCart, loadingId } = useAddToCart();
  const isLoading            = loadingId === product.product_id;
  const images = product.images?.length
    ? product.images
    : product.cover_image
      ? [{ image_url: product.cover_image }]
      : [];

  const categoryLabel = (() => {
  const cid = Number(product.category_id);
  if (cid === 1) return product.gender === 'male' ? 'เสื้อนักเรียนชาย' : 'เสื้อนักเรียนหญิง';
  if (cid === 2) return 'กางเกงนักเรียน';
  if (cid === 3) return 'กระโปรงนักเรียน';
  if (cid === 4) return 'ชุดนักเรียน';
  return 'ชุดนักเรียน';
})();

const typePart = product.type_name?.trim() || product.custom_type_name?.trim();
const displayTitle = typePart
  ? `${categoryLabel}: ${typePart}`
  : categoryLabel;

   const isDonationMatch = donationNeededLabels?.size > 0 && donationNeededLabels.has(product.product_id);

  return (
    <div className="mkCard" style={{ position: 'relative' }}>
      {/* donation badge */}
      {isDonationMatch && (
        <div className="mkDonateBadge">
          <Icon icon="tabler:heart-handshake" style={{ fontSize: '15px', flexShrink: 0 }} />
          ซื้อเพื่อร่วมบริจาคได้
        </div>
      )}
      {/* carousel ไม่มี Link ห่อ → กดลูกศรไม่เด้ง */}
      <div className="mkCardThumb">
        <CardCarousel images={images} title={displayTitle} quantity={product.quantity} />
      </div>
      {/* body คลิกแล้วไปหน้าสินค้า */}
      <div
        className="mkCardBody"
        onClick={() => navigate(`/market/${product.product_id}`)}
        style={{ cursor: 'pointer' }}
      >
        <div className="mkCardTitle">{displayTitle}</div>
        {product.school_name && (
          <div className="mkCardSchool">
            <Icon icon="mdi:school-outline" /> {product.school_name}
          </div>
        )}
        <div className="mkMeta">
          {product.level && (
            <div className="mkMetaRow">
              <span className="mkMetaLabel">ระดับ</span>
              <span className="mkMetaVal">
                <span className="mkBadgeLevel">{product.level}</span>
              </span>
            </div>
          )}
          <SizeDisplay size={product.size} categoryId={product.category_id} />
          {(product.condition_percent || product.condition_label) && (
            <div className="mkMetaRow">
              <span className="mkMetaLabel">สภาพ</span>
              <span className="mkMetaVal">
                <span className="mkBadgeCond">
                  {[
                    product.condition_percent ? `${product.condition_percent}%` : null,
                    product.condition_label
                  ].filter(Boolean).join(' · ')}
                </span>
              </span>
            </div>
          )}
        </div>
        <div className="mkCardDivider" />
        <div className="mkCardBottom">
          <div className="mkCardPrice">
            {Number(product.price).toLocaleString()}<span> บาท</span>
          </div>
          <button
            className="mkCartBtn"
            onClick={e => {
  e.stopPropagation();
  addToCart(product.product_id);
}}
            disabled={isLoading || product.quantity === 0}
            aria-label="เพิ่มลงตะกร้า"
          >
            <Icon icon={isLoading ? "mdi:loading" : "mdi:cart-plus"}
              className={isLoading ? "mkSpinner" : ""} />
          </button>
        </div>
      </div>
    </div>
  );
}


// ── Main Page ─────────────────────────────────────────
export default function MarketPage() {
  const { token, role, userName } = useAuth();
  const location   = useLocation();

  const [toast,         setToast]         = useState(location.state?.successMsg || "");
  const [search,        setSearch]        = useState("");
  const [activeFilter, setActiveFilter] = useState(null);
  const [level,         setLevel]         = useState("");
  const [minPrice,      setMinPrice]      = useState("");
  const [maxPrice,      setMaxPrice]      = useState("");
  const [sort,          setSort]          = useState("newest");
  const [filterOpen,    setFilterOpen]    = useState(false);
  const [products,      setProducts]      = useState([]);
  const [loading,       setLoading]       = useState(false);
  const [totalCount,    setTotalCount]    = useState(0);
  const [donationNeededLabels, setDonationNeededLabels] = useState(new Set());

  const [displaySearch, setDisplaySearch] = useState("");
  const [typedKeyword,  setTypedKeyword]  = useState("");
  const [meiliHits,     setMeiliHits]     = useState(null); // null = offline/empty
  const [meiliLoading,  setMeiliLoading]  = useState(false);
  const searchRequestRef = useRef(0);

  // The backend selects Meilisearch locally and ranked SQL in production.
  const runMeiliSearch = useCallback(async (q, filter, lvl) => {
    if (!q.trim()) { setMeiliHits(null); return; }
    const requestId = ++searchRequestRef.current;
    setMeiliLoading(true);
    try {
      const params = new URLSearchParams({ q: q.trim(), limit: 60 });
      if (filter?.category_id) params.set("category_id", filter.category_id);
      if (filter?.gender)      params.set("gender", filter.gender);
      const res  = await fetch(`${BASE_URL}/api/search/products?${params}`);
      if (!res.ok) throw new Error("search unavailable");
      const data = await res.json();
      if (requestId !== searchRequestRef.current) return;
      const hits = (data.hits || []).map(h => h.product_id);
      setMeiliHits(hits);
      // Fetch those exact products from /api/market by ID (preserves images etc.)
      if (hits.length) {
        fetchProductsRef.current(1, { ids: hits, search: "" });
      } else {
        // Meili returned no hits — show empty
        productRequestRef.current += 1;
        setProducts([]);
        setTotalCount(0);
      }
    } catch {
      if (requestId !== searchRequestRef.current) return;
      setMeiliHits(null);
      await fetchProductsRef.current(1, {
        activeFilter: filter,
        level: lvl,
        search: q,
      });
    } finally {
      if (requestId === searchRequestRef.current) setMeiliLoading(false);
    }
  }, []);

  const buildDisplayText = useCallback((filter, lvl, typed) => {
  const parts = [];
  // ถ้ามีการเลือกประเภทปุ่มวงกลม


  if (filter) {
    const typeObj = UNIFORM_TYPES.find(t => t.key === filter.key);
    if (typeObj) parts.push(typeObj.type_name);
  }
  // ถ้ามีการเลือกระดับชั้นใน select
  if (lvl) parts.push(lvl);
  // สิ่งที่ user พิมพ์เอง
  if (typed) parts.push(typed);
  
  return parts.join(' ').trim();
}, []);

  // const handleTypeToggle = (typeObj) => {
  // const isSame = activeFilter?.key === typeObj.key;
  // const newFilter = isSame ? null : typeObj;
  const handleTypeToggle = (typeObj) => {
  const isSame = activeFilter?.key === typeObj.key;
  const newFilter = isSame ? null : typeObj;
  setActiveFilter(newFilter);

  const newDisplay = buildDisplayText(newFilter, level, typedKeyword);
  setDisplaySearch(newDisplay);

  if (typedKeyword.trim()) runMeiliSearch(typedKeyword, newFilter, level);
  else fetchProducts(1, { activeFilter: newFilter });
};

const handleLevelChange = (e) => {
  const newLevel = e.target.value;
  setLevel(newLevel);

  const newDisplay = buildDisplayText(activeFilter, newLevel, typedKeyword);
  setDisplaySearch(newDisplay);

  if (typedKeyword.trim()) runMeiliSearch(typedKeyword, activeFilter, newLevel);
  else fetchProducts(1, { level: newLevel });
};
const handleSearchInput = (e) => {
  const val = e.target.value;
  setDisplaySearch(val);
  setTypedKeyword(val);
  setSearch(val);

  if (!val.trim()) {
    searchRequestRef.current += 1;
    setMeiliHits(null);
    fetchProducts(1, { search: "" }); // reset to full list
    return;
  }

  clearTimeout(debounceRef.current);
  debounceRef.current = setTimeout(() => {
    runMeiliSearch(val, activeFilter, level);
  }, 300);
};

  const LIMIT = 100;
  const productRequestRef = useRef(0);

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(""), 4000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  // GET /api/market
const fetchProductsRef = useRef(null);

fetchProductsRef.current = async (p = 1, overrides = {}) => {
  void p;
  const requestId = ++productRequestRef.current;
  setLoading(true);
  setProducts([]);
  try {
    const currentFilter   = overrides.activeFilter !== undefined ? overrides.activeFilter : activeFilter;
    const currentLevel    = overrides.level    !== undefined ? overrides.level    : level;
    const currentSearch   = overrides.search   !== undefined ? overrides.search   : search;
    const currentMinPrice = overrides.minPrice !== undefined ? overrides.minPrice : minPrice;
    const currentMaxPrice = overrides.maxPrice !== undefined ? overrides.maxPrice : maxPrice;
    const currentSort     = overrides.sort     !== undefined ? overrides.sort     : sort;
    const currentIds      = overrides.ids; // product_id[] from Meilisearch

    const makeParams = (pageNumber) => new URLSearchParams({
      page: pageNumber,
      limit: currentIds?.length ? Math.min(currentIds.length, 100) : LIMIT,
      sort: currentSort,
      ...(currentIds?.length
        ? { ids: currentIds.join(',') }
        : currentSearch && { search: currentSearch }),
      ...(currentFilter?.category_id && { category_id: currentFilter.category_id }),
      ...(currentFilter && currentFilter.gender !== null && { gender: currentFilter.gender }),
      ...(currentLevel    && { level: currentLevel }),
      ...(currentMinPrice && { min_price: currentMinPrice }),
      ...(currentMaxPrice && { max_price: currentMaxPrice }),
    });

    const fetchPage = async (pageNumber) => {
      const res = await fetch(`${BASE_URL}/api/market?${makeParams(pageNumber)}`);
      if (!res.ok) throw new Error("โหลดสินค้าไม่สำเร็จ");
      return res.json();
    };

    const firstPage = await fetchPage(1);
    const pages = Math.max(1, Number(firstPage.pagination?.pages || 1));
    const remainingPages = pages > 1
      ? await Promise.all(Array.from({ length: pages - 1 }, (_, index) => fetchPage(index + 2)))
      : [];

    if (requestId !== productRequestRef.current) return;

    const allProducts = [firstPage, ...remainingPages].flatMap(data => data.products || []);
    setProducts(allProducts);
    setTotalCount(Number(firstPage.pagination?.total ?? allProducts.length));
  } catch (e) {
    console.error("Fetch Error:", e);
  } finally {
    if (requestId === productRequestRef.current) setLoading(false);
  }
};

const fetchProducts = useCallback((...args) => fetchProductsRef.current(...args), []);


  useEffect(() => { fetchProducts(1); }, []);


  // ดึง product_id ทั้งหมดที่ backend match กับโครงการ (ใช้เกณฑ์เดียวกับ DonateMarketPage)
  useEffect(() => {
    const fetchMatchedIds = async () => {
      try {
        // ใช้ getJson เพื่อให้ request ไปที่ BASE_URL (localhost:3000) โดยตรง
        // ไม่ใช้ fetch("/home") เพราะ Vite proxy ไม่ได้ map /home
        const data = await getJson("/home", false);
        const projectList = Array.isArray(data?.projects) ? data.projects : [];
        if (!projectList.length) return;

        const ids = new Set();
        await Promise.all(projectList.map(async (p) => {
          try {
            const detail = await getJson(`/api/market/matched?project_id=${p.request_id}`, false);
            (detail?.products || []).forEach(prod => ids.add(prod.product_id));
          } catch (e) { /* ignore per-project errors */ }
        }));
        if (ids.size > 0) setDonationNeededLabels(ids);
      } catch (e) { /* graceful degradation */ }
    };
    fetchMatchedIds();
  }, []);

  const debounceRef = useRef(null);
  const normalizeStr = (s) => (s || '').replace(/\s+/g, '').toLowerCase();

const fuzzyMatch = (text, query) => {
  if (!query) return true;
  const t = normalizeStr(text);
  const q = normalizeStr(query);
  if (t.includes(q)) return true;
  const words = query.trim().split(/\s+/);
  return words.every(w => t.includes(normalizeStr(w)));
};

  const handleReset = () => {
  setActiveFilter(null);
  setLevel("");
  setMinPrice("");
  setMaxPrice("");
  setSearch("");
  setDisplaySearch("");
  setTypedKeyword("");
  searchRequestRef.current += 1;
  setMeiliHits(null);
  fetchProducts(1, {
    activeFilter: null,
    level: "",
    search: "",
    minPrice: "",
    maxPrice: "",
  });
};

const handleMinPriceChange = (e) => {
  const val = e.target.value;
  setMinPrice(val);
  clearTimeout(debounceRef.current);
  debounceRef.current = setTimeout(() => fetchProducts(1, { minPrice: val }), 400);
};

const handleMaxPriceChange = (e) => {
  const val = e.target.value;
  setMaxPrice(val);
  clearTimeout(debounceRef.current);
  debounceRef.current = setTimeout(() => fetchProducts(1, { maxPrice: val }), 400);
};

// ── Reorder products: Meilisearch ranking + donation products first ─────────
const hasImages = (p) => !!(p.images?.length || p.cover_image);

const displayedProducts = useMemo(() => {
  let list = products;

  // When Meilisearch is active, reorder by meili ranking
  if (search.trim() && meiliHits !== null) {
    const hitSet = new Set(meiliHits);
    const ranked = meiliHits.map(id => products.find(p => p.product_id === id)).filter(Boolean);
    const rest   = products.filter(p => !hitSet.has(p.product_id));
    list = [...ranked, ...rest];
  }

  // Priority: 1) donation, 2) complete (has images), 3) mock-up (no images)
  const donation  = list.filter(p =>  donationNeededLabels.has(p.product_id));
  const complete  = list.filter(p => !donationNeededLabels.has(p.product_id) &&  hasImages(p));
  const mockup    = list.filter(p => !donationNeededLabels.has(p.product_id) && !hasImages(p));
  return [...donation, ...complete, ...mockup];
}, [products, search, meiliHits, donationNeededLabels]);


  return (
    <div className="homePage">
    {/* วางไว้ตรงนี้ได้เลยครับ */}
    <datalist id="price-suggestions">
      <option value="50" />
      <option value="100" />
      <option value="150" />
      <option value="200" />
      <option value="300" />
      <option value="500" />
    </datalist>
      {toast && (
        <div className="mkToast">
          <Icon icon="mdi:check-circle" /> {toast}
        </div>
      )}

      <Navbar activeLink="market" />

      <section className="mkHero">
        <img className="mkHeroBgLeft"  src={marketHeroBgLeft}  alt="" />
        <div className="mkHeroContent">
          <h1 className="mkHeroTitle">ตลาดชุดนักเรียนมือสอง</h1>
          <p className="mkHeroSub">ซื้อ-ขายราคาประหยัด เข้าถึงชุดนักเรียนได้อย่างเท่าเทียม</p>
          <div className="mkHeroBtns">
            <a href="#market-main" className="mkHeroBtn mkHeroBtnYellow">
              <Icon icon="mdi:cart-outline" /> เลือกซื้อราคาประหยัด
            </a>
            <Link to="/sell" className="mkHeroBtn mkHeroBtnWhite">
              <Icon icon="mdi:tag-outline" /> ลงขายสินค้าที่นี่
            </Link>
          </div>
        </div>
        <img className="mkHeroBgRight" src={marketHeroBgRight} alt="" />
      </section>

      <div className="mkSearchSection">
        <div className="mkSearchRow">
          <div className="mkSearchBox">
            {meiliLoading
              ? <Icon icon="mdi:loading" className="mkSearchIcon" style={{ animation: "spin 0.8s linear infinite" }} />
              : <Icon icon="mdi:magnify" className="mkSearchIcon" />
            }
            <input
              placeholder="ค้นหาสินค้า โรงเรียน..."
              value={displaySearch}
              onChange={handleSearchInput}
            />
          </div>
          <button 
  className={`mkFilterBtn ${filterOpen ? "mkFilterBtnActive" : ""}`}
  onClick={() => setFilterOpen(o => !o)}
>
  {/* เปลี่ยนจาก <Icon ... /> เป็นตัวนี้ */}
  <FontAwesomeIcon icon={faFilter} style={{ }} />
</button>
        </div>

        <div className={`mkFilterPanel ${filterOpen ? "mkFilterPanelOpen" : ""}`}>
          <div className="mkFilterLabel">คุณต้องการซื้อสินค้าอะไร ?</div>
          <div className="mkFilterGroupLabel">ประเภทชุด</div>
        <div className="mkFilterRowContent">
          <div className="mkTypeRow">
            {UNIFORM_TYPES.map(t => {
  const colors = TYPE_COLORS[t.type_name] || {};
  const isActive = activeFilter?.key === t.key;
  return (
    <div key={t.key} className="mkTypeBtnWrap">
      <button
        className={`mkTypeBtn ${isActive ? "mkTypeBtnActive" : ""}`}
        onClick={() => handleTypeToggle(t)}
        style={{
          backgroundColor: isActive ? colors.hover : colors.bg,
        }}
      >
        <span className="mkTypeIcon">{t.icon}</span>
      </button>
      <span className="mkTypeLabel">{t.type_name}</span>
    </div>
  );
})}
          </div>

          <div className="mkFilterGrid" style={{ marginTop: 16 }}>
  {/* ระดับชั้น (คงเดิม) */}
  <div className="mkFilterGroup">
    <span className="mkFilterGroupLabel" style={{ marginLeft: 0 }}>ระดับชั้น</span>
    <select className="mkSelect" value={level} onChange={handleLevelChange}>
      <option value="">ทั้งหมด</option>
      {LEVELS.filter(Boolean).map(l => <option key={l}>{l}</option>)}
    </select>
  </div>
           {/* ราคาต่ำสุด */}
  <div className="mkFilterGroup">
    <span className="mkFilterGroupLabel" style={{ marginLeft: 0 }}>ราคาต่ำสุด (บาท)</span>
    <input 
      type="text" 
      list="price-suggestions" 
      className="mkSelect mkPriceInput" 
      placeholder="0" 
      value={minPrice} 
      onChange={handleMinPriceChange} 
    />
  </div>
            {/* ราคาสูงสุด - แก้ไข value และ onChange ตรงนี้ครับ! */}
  <div className="mkFilterGroup">
    <span className="mkFilterGroupLabel" style={{ marginLeft: 0 }}>ราคาสูงสุด (บาท)</span>
    <input 
      type="text" 
      list="price-suggestions" 
      className="mkSelect mkPriceInput" 
      placeholder="ไม่จำกัด" 
      value={maxPrice}             // เปลี่ยนจาก minPrice เป็น maxPrice
      onChange={handleMaxPriceChange} // เปลี่ยนจาก handleMin เป็น handleMax
    />
  </div>
          </div>
          </div> 
          <button className="mkResetBtn" onClick={handleReset}>ล้างตัวกรอง</button>
        </div>
      </div>

      <main id="market-main" className="mkMain">
        <div className="mkListHeader">
          <h2 className="mkListTitle">
            สินค้าทั้งหมด
            {!loading && <span className="mkListCount"> ({totalCount.toLocaleString()} รายการ)</span>}
          </h2>
          <select 
  className="mkSortSelect" 
  value={sort} 
  onChange={e => {
    const newSort = e.target.value;
    setSort(newSort);
    // เรียกดึงข้อมูลใหม่ทันทีโดยส่งค่า sort ตัวใหม่เข้าไป override
    fetchProducts(1, { sort: newSort }); 
  }}
>
  {SORT_OPTIONS.map(o => (
    <option key={o.value} value={o.value}>{o.label}</option>
  ))}
</select>
        </div>

        {loading && products.length === 0 ? (
          <div className="mkLoadingGrid">
            {Array.from({ length: 6 }).map((_, i) => <div key={i} className="mkCardSkeleton" />)}
          </div>
        ) : displayedProducts.length === 0 ? (
          <div className="mkEmpty">
            <Icon icon="mdi:package-variant-remove" fontSize={56} />
            <p>ไม่พบสินค้าที่ตรงกับเงื่อนไข</p>
            <button className="mkResetBtn" onClick={handleReset} style={{ display:"inline-block" }}>ล้างตัวกรอง</button>
          </div>
        ) : (
          <div className="mkGrid">
                        {displayedProducts.map(p => <ProductCard key={p.product_id} product={p} donationNeededLabels={donationNeededLabels} />)}
          </div>
        )}

      </main>
      <Footer />

    </div>

  );
}

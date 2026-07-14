// frontend/src/modules/market/pages/PostProductPage.jsx
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext.jsx";
import { Icon } from "@iconify/react";
import "../../../pages/styles/Homepage.css";
import "../styles/PostProductPage.css";
import Navbar from "../../../pages/Navbar.jsx";
import Footer from "../../../pages/Footer.jsx";
 
const SIZE_LABELS = { chest: "อก", waist: "เอว", length: "ยาว" };
 
const MAIN_CATEGORIES = [
  { key: "shirt_m", category_id: 1, gender: "male",   label: "เสื้อ (ชาย)",  icon: "mdi:tshirt-crew",                   sizeKeys: ["chest", "length"] },
  { key: "shirt_f", category_id: 1, gender: "female", label: "เสื้อ (หญิง)", icon: "mdi:tshirt-crew-outline",            sizeKeys: ["chest", "length"] },
  { key: "pants_m", category_id: 2, gender: "male",   label: "กางเกง",        icon: "mdi:hanger",                         sizeKeys: ["waist", "length"] },
  { key: "skirt_f", category_id: 3, gender: "female", label: "กระโปรง",       icon: "mdi:skirt",                          sizeKeys: ["waist", "length"] },
  { key: "other",   category_id: 4, gender: null,     label: "อื่นๆ",         icon: "mdi:dots-horizontal-circle-outline", sizeKeys: ["chest"] },
];
 
const LEVELS           = ["ทุกระดับชั้น", "อนุบาล", "ประถมศึกษา", "มัธยมต้น", "มัธยมปลาย"];
const CONDITION_PERCENTS = ["10","20","30","40","50","60","70","80","90","100"];
const CONDITION_LABELS   = ["มีตำหนิ","พอใช้ได้","สภาพดี","สภาพดีมาก","ใหม่มาก"];
const MAX_IMAGES         = 4;
 
// โลโก้ขนส่ง — ใช้ URL จาก CDN สาธารณะ (fallback เป็น icon ถ้าโหลดไม่ได้)
const SHIPPING_LOGOS = {
  "ไปรษณีย์ไทย":   "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Thailand_Post_logo.svg/200px-Thailand_Post_logo.svg.png",
  "Kerry Express":  "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Kerry_Express_logo.svg/200px-Kerry_Express_logo.svg.png",
  "Flash Express":  "https://companieslogo.com/img/orig/FLASH.BK-5e0d2d86.png",
  "J&T Express":    "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/J%26T_Express_logo.svg/200px-J%26T_Express_logo.svg.png",
  "Ninja Van":      "https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/Ninjavan-logo.svg/200px-ninjavan-logo.svg.png",
  "Shopee Express": "https://deo.shopeemobile.com/shopee/shopee-pcmall-live-sg/assets/cb0479f3c6a5e4e82b56.png",
  "Lazada Express": "https://lzd-img-global.slatic.net/g/tsp/tb/img/logo/lazada_logo_160.png",
};
 
const makeItem = () => ({
  _id:              Math.random().toString(36).slice(2),
  category_id:      1,
  gender:           "male",
  uniform_type_id:  null,
  custom_type_name: "",
  school_name:      "",
  level:            "",
  sizes:            { chest: "", waist: "", length: "" },
  condition:        "80",
  conditionLabel:   "สภาพดี",
  price:            "",
  quantity:         1,
  description:      "",
  images:           [],
});
 
// ── ShippingLogo component ────────────────────────────────
function ShippingLogo({ name, size = 36 }) {
  const [error, setError] = useState(false);
  const src = SHIPPING_LOGOS[name];
  if (!src || error) {
    return (
      <div style={{
        width: size, height: size,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: size * 0.55,
      }}>
        🚚
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={name}
      onError={() => setError(true)}
      style={{ width: size, height: size, objectFit: "contain" }}
    />
  );
}

function calcShippingEstimate(provider, qty = 1, subtotal = 0) {
  const basePrice = Number(provider?.base_price || 0);
  const perItem = Number(provider?.price_per_item || 0);
  const maxPrice = provider?.max_price ? Number(provider.max_price) : null;
  const freeThreshold = provider?.free_threshold ? Number(provider.free_threshold) : null;

  let price = basePrice + (perItem * Math.max(Number(qty) || 1, 1));
  if (maxPrice !== null && price > maxPrice) price = maxPrice;
  if (freeThreshold !== null && Number(subtotal) >= freeThreshold) price = 0;
  return Math.round(price * 100) / 100;
}

function formatBaht(value) {
  const num = Number(value || 0);
  return `${num.toLocaleString(undefined, { maximumFractionDigits: 2 })} บาท`;
}
 
export default function PostProductPage() {
  const { token, updateRole } = useAuth();
  const navigate = useNavigate();
 
  const [uniformTypes, setUniformTypes]   = useState([]);
  const [typesLoading, setTypesLoading]   = useState(true);
  const [shippingProviders, setShippingProviders] = useState([]);
 
  useEffect(() => {
    fetch("/api/checkout/shipping")
      .then(res => res.json())
      .then(data => setShippingProviders(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);
 
  useEffect(() => {
    fetch("/api/market/uniform-types")
      .then(r => r.json())
      .then(rows => setUniformTypes(Array.isArray(rows) ? rows : []))
      .catch(() => {})
      .finally(() => setTypesLoading(false));
  }, []);
 
  const [step,              setStep]              = useState(1);
  const [items,             setItems]             = useState([makeItem()]);
  const [openIdx,           setOpenIdx]           = useState(0);
  // selectedProviders: provider_id[] — เลือกร่วมกันทุกสินค้า
  const [selectedProviders, setSelectedProviders] = useState([]);
  const [submitting,        setSubmitting]        = useState(false);
  const [err,               setErr]               = useState("");
  const fileInputRefs = useRef({});
  const totalItemQty = items.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);
  const subtotalEstimate = items.reduce((sum, item) => {
    return sum + ((Number(item.price) || 0) * (Number(item.quantity) || 1));
  }, 0);
 
  const updateItem = (idx, patch) =>
    setItems(prev => prev.map((it, i) => i === idx ? { ...it, ...patch } : it));
 
  const addItem = () => {
    setItems(prev => [...prev, makeItem()]);
    setOpenIdx(items.length);
  };
 
  const removeItem = (idx) => {
    items[idx].images.forEach(img => img?.url && URL.revokeObjectURL(img.url));
    setItems(prev => prev.filter((_, i) => i !== idx));
    setOpenIdx(prev => (prev >= idx ? Math.max(0, prev - 1) : prev));
  };
 
  const handleCategoryChange = (idx, catId, gender) => {
    updateItem(idx, { category_id: catId, gender, uniform_type_id: null, custom_type_name: "" });
  };
 
  const handleFileDrop = (itemIdx, files) => {
    const remaining = MAX_IMAGES - items[itemIdx].images.length;
    if (remaining <= 0) return;
    const toAdd = Array.from(files).slice(0, remaining).map(file => ({
      file, url: URL.createObjectURL(file),
    }));
    updateItem(itemIdx, { images: [...items[itemIdx].images, ...toAdd] });
  };
 
  const removeImage = (itemIdx, imgIdx) => {
    URL.revokeObjectURL(items[itemIdx].images[imgIdx]?.url);
    updateItem(itemIdx, { images: items[itemIdx].images.filter((_, i) => i !== imgIdx) });
  };
 
  const triggerFileInput = (itemIdx) =>
    fileInputRefs.current[`item_${itemIdx}`]?.click();
 
  const getSizeKeys = (catId, gender) =>
    MAIN_CATEGORIES.find(c => c.category_id === catId && (c.gender === gender || c.gender === null))?.sizeKeys || ["chest"];
 
  const getItemSummary = (item) => {
    const typeObj  = uniformTypes.find(t => t.uniform_type_id === item.uniform_type_id);
    const sizeKeys = getSizeKeys(item.category_id, item.gender);
    const sizeStr  = sizeKeys.map(k => `${SIZE_LABELS[k]}${item.sizes[k]}`).join(" / ");
    const typeName = item.custom_type_name?.trim() || typeObj?.type_name || "ยังไม่เลือกประเภท";
    return { typeName, sizeStr };
  };
 
  // ── validate step 1 ──────────────────────────────────────
  const goToStep2 = () => {
    setErr("");
    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      const label = `รายการที่ ${i + 1}`;
      if (!it.uniform_type_id && !it.custom_type_name?.trim())
        return setErr(`${label}: กรุณาเลือกหรือกรอกประเภทชุด`);
      if (!it.price || isNaN(Number(it.price)))
        return setErr(`${label}: กรุณากรอกราคา`);
      if (Number(it.price) <= 0)
        return setErr(`${label}: ราคาต้องมากกว่า 0 บาท`);
      if (!it.quantity || Number(it.quantity) < 1 || Number(it.quantity) > 99)
        return setErr(`${label}: จำนวนสินค้าต้องอยู่ระหว่าง 1-99`);
      if (!it.images || it.images.length === 0)
        return setErr(`${label}: กรุณาอัปโหลดรูปภาพอย่างน้อย 1 รูป`);
    }
    setStep(2);
    setOpenIdx(0);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
 
  // ── submit ───────────────────────────────────────────────
  const handleSubmit = async () => {
    setErr("");
    if (!selectedProviders.length)
      return setErr("กรุณาเลือกขนส่งอย่างน้อย 1 รายการ");
 
    setSubmitting(true);
    try {
      const formData = new FormData();
      const itemsMeta = items.map(item => {
        const typeObj = uniformTypes.find(t => t.uniform_type_id === item.uniform_type_id);
        const sizeObj = {};
        const cid     = Number(item.category_id);
        if (cid === 1) {
          if (item.sizes.chest)  sizeObj.chest  = item.sizes.chest;
          if (item.sizes.length) sizeObj.length = item.sizes.length;
        } else {
          if (item.sizes.waist)  sizeObj.waist  = item.sizes.waist;
          if (item.sizes.length) sizeObj.length = item.sizes.length;
        }
        return {
          uniform_type_id:       item.uniform_type_id,
          type_name:             item.custom_type_name?.trim() || typeObj?.type_name || "",
          school_name:           item.school_name || "",
          level:                 item.level,
          category_id:           item.category_id,
          gender:                item.gender,
          sizes:                 sizeObj,
          condition:             item.condition,
          conditionLabel:        item.conditionLabel,
          price:                 item.price,
          quantity:              item.quantity,
          description:           item.description,
          // ✅ ส่ง provider_ids ที่เลือกร่วมกันจาก step 2
          shipping_provider_ids: selectedProviders,
        };
      });
 
      formData.append("items", JSON.stringify(itemsMeta));
      items.forEach((item, i) => {
        item.images.forEach(img => {
          if (img?.file) formData.append(`item${i}_images`, img.file);
        });
      });
 
      const res  = await fetch("/api/market/batch", {
        method:  "POST",
        headers: { Authorization: `Bearer ${token}` },
        body:    formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "เกิดข้อผิดพลาด");
 
      if (data.newRole && typeof updateRole === "function") updateRole(data.newRole);
      navigate("/market", { state: { successMsg: `ลงขายสำเร็จ ${data.products.length} รายการ! 🎉` } });
    } catch (e) {
      setErr(e.message);
    } finally {
      setSubmitting(false);
    }
  };
 
  return (
    <div className="homePage">
      {/* Header */}
      <Navbar activeLink="sell" />
 
      <div className="ppAccentBar" />
 
      <div className="ppWrapper">
 
        {/* ── Step Indicator ── */}
        <div className="ppStepBar">
          <div className={`ppStep ${step >= 1 ? "ppStepDone" : ""} ${step === 1 ? "ppStepActive" : ""}`}>
            <div className="ppStepCircle">
              {step > 1 ? <Icon icon="mdi:check" /> : <Icon icon="mdi:tag-multiple-outline" />}
            </div>
            <div className="ppStepInfo">
              <span className="ppStepNum">ขั้นตอนที่ 1</span>
              <span className="ppStepName">ข้อมูลสินค้า</span>
            </div>
          </div>
          <div className={`ppStepLine ${step >= 2 ? "ppStepLineDone" : ""}`} />
          <div className={`ppStep ${step >= 2 ? "ppStepActive" : ""}`}>
            <div className="ppStepCircle">
              <Icon icon="mdi:truck-delivery-outline" />
            </div>
            <div className="ppStepInfo">
              <span className="ppStepNum">ขั้นตอนที่ 2</span>
              <span className="ppStepName">การจัดส่ง</span>
            </div>
          </div>
        </div>
 
        {/* ══════════════════════════════════════
            STEP 1 — ข้อมูลสินค้า
        ══════════════════════════════════════ */}
        {step === 1 && (
          <>
            <div className="ppPageHeader">
              <h1 className="ppPageTitle">
                <Icon icon="mdi:tag-multiple-outline" style={{ marginRight: 8, verticalAlign: "middle" }} />
                ข้อมูลสินค้า
              </h1>
              <p className="ppPageSub">กรอกข้อมูลสินค้าที่ต้องการลงขาย — แต่ละรายการจะแสดงเป็นการ์ดแยกกันในตลาด</p>
            </div>
 
            <div className="ppItemsArea">
              {items.map((item, idx) => {
                const isOpen   = openIdx === idx;
                const sizeKeys = getSizeKeys(item.category_id, item.gender);
                const summary  = getItemSummary(item);
 
                const filteredTypes = (() => {
                  const filtered = uniformTypes.filter(t =>
                    t.category_id === item.category_id &&
                    (item.gender === null || t.gender === item.gender || !t.gender)
                  );
                  const uniqueMap = new Map();
                  filtered.forEach(t => {
                    const key = t.type_name.trim();
                    if (!uniqueMap.has(key)) uniqueMap.set(key, t);
                  });
                  return Array.from(uniqueMap.values()).sort((a, b) =>
                    a.type_name.localeCompare(b.type_name, "th")
                  );
                })();
 
                return (
                  <div key={item._id} className={`ppItemCard ${isOpen ? "ppItemCardOpen" : ""}`}>
 
                    {/* Card header */}
                    <div className="ppItemHeader" onClick={() => setOpenIdx(isOpen ? -1 : idx)}>
                      <div className="ppItemHeaderLeft">
                        <div className="ppItemNumBadge">{idx + 1}</div>
                        <div>
                          {isOpen ? (
                            <span className="ppItemLabel">รายการที่ {idx + 1}</span>
                          ) : (
                            <>
                              <div className="ppItemSummaryName">{summary.typeName}</div>
                              <div className="ppItemSummaryMeta">
                                {summary.sizeStr}
                                {item.price && ` · ${Number(item.price).toLocaleString()} บาท`}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="ppItemHeaderRight">
                        {items.length > 1 && (
                          <button className="ppRemoveBtn" onClick={e => { e.stopPropagation(); removeItem(idx); }}>
                            <Icon icon="mdi:trash-can-outline" />
                          </button>
                        )}
                        <Icon icon={isOpen ? "mdi:chevron-up" : "mdi:chevron-down"} className="ppItemChevron" />
                      </div>
                    </div>
 
                    {/* Card body */}
                    {isOpen && (
                      <div className="ppItemBody">
 
                        {/* ══ ① รูปภาพ ══ */}
                        <div className="ppSection">
                          <div className="ppSectionHeader">
                            <span className="ppSectionDot ppDotBlue" />
                            <span className="ppSectionTitle">รูปภาพสินค้า</span>
                            <span className="ppImgCount">{item.images.length}/{MAX_IMAGES}</span>
                            <span className="ppOptionalBadge">ภาพแรก = ภาพปก</span>
                          </div>
                          {item.images.length === 0 ? (
                            <div
                              className="ppDropZone"
                              onDragOver={e => e.preventDefault()}
                              onDrop={e => { e.preventDefault(); handleFileDrop(idx, e.dataTransfer.files); }}
                              onClick={() => triggerFileInput(idx)}
                            >
                              <Icon icon="mdi:image-plus-outline" className="ppDropIcon" />
                              <span className="ppDropText">คลิกหรือลากรูปมาวาง</span>
                              <small className="ppDropHint">JPG / PNG / WEBP ไม่เกิน 5MB ต่อภาพ</small>
                            </div>
                          ) : (
                            <div className="ppImgRow">
                              {item.images.map((img, imgIdx) => (
                                <div key={imgIdx} className={`ppImgSlot ${imgIdx === 0 ? "ppImgCover" : ""}`}>
                                  <img src={img.url} alt="" className="ppImgPreview" />
                                  {imgIdx === 0 && <span className="ppCoverBadge">ปก</span>}
                                  <button className="ppImgRemove" onClick={e => { e.stopPropagation(); removeImage(idx, imgIdx); }}>
                                    <Icon icon="mdi:close" />
                                  </button>
                                </div>
                              ))}
                              {item.images.length < MAX_IMAGES && (
                                <div className="ppImgAddSlot" onClick={() => triggerFileInput(idx)}>
                                  <Icon icon="mdi:plus" />
                                </div>
                              )}
                            </div>
                          )}
                          <input
                            type="file" accept="image/*" multiple style={{ display: "none" }}
                            ref={el => fileInputRefs.current[`item_${idx}`] = el}
                            onChange={e => handleFileDrop(idx, e.target.files)}
                          />
                        </div>
 
                        {/* ══ ② ประเภทชุด ══ */}
                        <div className="ppSection">
                          <div className="ppSectionHeader">
                            <span className="ppSectionDot ppDotPurple" />
                            <span className="ppSectionTitle">ประเภทชุด</span>
                            <span className="ppReqBadge">จำเป็น</span>
                          </div>
 
                          <div className="ppFieldBlock">
                            <label className="ppFieldLabel"><Icon icon="mdi:shape-outline" /> หมวดหมู่</label>
                            <div className="ppCatTabs">
                              {MAIN_CATEGORIES.map(cat => {
                                const isActive = item.category_id === cat.category_id && item.gender === cat.gender;
                                return (
                                  <button
                                    key={cat.key}
                                    className={`ppCatTab ${isActive ? "ppCatTabActive" : ""}`}
                                    onClick={() => handleCategoryChange(idx, cat.category_id, cat.gender)}
                                  >
                                    <Icon icon={cat.icon} />
                                    {cat.label}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
 
                          <div className="ppFieldBlock">
                            <label className="ppFieldLabel"><Icon icon="mdi:format-list-bulleted" /> เลือกจากระบบ</label>
                            {typesLoading ? (
                              <p className="ppLoadingHint">กำลังโหลดประเภทชุด...</p>
                            ) : (
                              <div className="ppSelectWrap">
                                <select
                                  className="ppSelect"
                                  value={item.uniform_type_id || ""}
                                  onChange={e => {
                                    const selId = e.target.value ? Number(e.target.value) : null;
                                    updateItem(idx, {
                                      uniform_type_id:  selId,
                                      custom_type_name: selId ? "" : item.custom_type_name,
                                    });
                                  }}
                                >
                                  <option value="">— เลือกประเภทชุดที่มีในระบบ —</option>
                                  {filteredTypes.length === 0 && <option disabled>ไม่มีประเภทชุดในหมวดนี้</option>}
                                  {filteredTypes.map(t => (
                                    <option key={t.uniform_type_id} value={t.uniform_type_id}>
                                      {t.type_name}
                                      {t.gender === "male" ? " (ชาย)" : t.gender === "female" ? " (หญิง)" : ""}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            )}
                            <div className="ppOrDivider"><span />หรือกรอกชื่อประเภทเอง<span /></div>
                            <input
                              className="ppInput"
                              placeholder="เช่น คอฮาวาย, ชุดพละ, รุ่นพิเศษ..."
                              value={item.custom_type_name || ""}
                              disabled={!!item.uniform_type_id}
                              onChange={e => updateItem(idx, { custom_type_name: e.target.value, uniform_type_id: null })}
                            />
                            {item.uniform_type_id && <p className="ppHint">ล้างตัวเลือก dropdown ก่อนถึงจะกรอกเองได้</p>}
                          </div>
                        </div>
 
                        {/* ══ ③ ระดับชั้น & ไซส์ ══ */}
                        <div className="ppSection">
                          <div className="ppSectionHeader">
                            <span className="ppSectionDot ppDotGreen" />
                            <span className="ppSectionTitle">ระดับชั้นและขนาด</span>
                          </div>
 
                          <div className="ppFieldBlock">
                            <label className="ppFieldLabel"><Icon icon="mdi:school-outline" /> ระดับชั้น</label>
                            <div className="ppChipGroup">
                              {LEVELS.map(l => (
                                <button
                                  key={l}
                                  className={`ppChip ${item.level === l ? "ppChipActive ppChipBlue" : ""}`}
                                  onClick={() => updateItem(idx, { level: item.level === l ? "" : l })}
                                >
                                  {l}
                                </button>
                              ))}
                            </div>
                          </div>
 
                          <div className="ppFieldBlock">
                            <label className="ppFieldLabel"><Icon icon="mdi:ruler" /> ไซส์ (นิ้ว)</label>
                            <div className="ppSizesRow">
                              {sizeKeys.map(key => (
                                <div key={key} className="ppSizeBox">
                                  <span className="ppSizeLabel">{SIZE_LABELS[key]}</span>
                                  <input
                                    className="ppSizeInput"
                                    type="number"
                                    value={item.sizes[key] || ""}
                                    placeholder="—"
                                    onChange={e => updateItem(idx, { sizes: { ...item.sizes, [key]: e.target.value } })}
                                  />
                                  <span className="ppSizeUnit">นิ้ว</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
 
                        {/* ══ ④ สภาพและราคา ══ */}
                        <div className="ppSection">
                          <div className="ppSectionHeader">
                            <span className="ppSectionDot ppDotOrange" />
                            <span className="ppSectionTitle">สภาพและราคา</span>
                          </div>
 
                          <div className="ppFieldRow2">
                            <div className="ppFieldBlock">
                              <label className="ppFieldLabel"><Icon icon="mdi:percent-outline" /> สภาพสินค้า (%)</label>
                              <div className="ppSelectWrap">
                                <select
                                  className="ppSelect"
                                  value={item.condition}
                                  onChange={e => updateItem(idx, { condition: e.target.value })}
                                >
                                  {CONDITION_PERCENTS.map(c => (
                                    <option key={c} value={c}>{c}%</option>
                                  ))}
                                </select>
                              </div>
                              <div className="ppChipGroup ppChipGroupSm" style={{ marginTop: 6 }}>
                                {CONDITION_LABELS.map(c => (
                                  <button
                                    key={c}
                                    className={`ppChip ppChipSm ${item.conditionLabel === c ? "ppChipActive ppChipBlue" : ""}`}
                                    onClick={() => updateItem(idx, { conditionLabel: c })}
                                  >
                                    {c}
                                  </button>
                                ))}
                              </div>
                            </div>
 
                            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                              <div className="ppFieldBlock">
                                <label className="ppFieldLabel">
                                  <Icon icon="mdi:currency-usd" /> ราคา <span className="ppReq">*</span>
                                </label>
                                <div className="ppPriceWrap">
                                  <input
                                    className="ppInput ppPriceInput"
                                    type="number" min="0" placeholder="0"
                                    value={item.price}
                                    onChange={e => updateItem(idx, { price: e.target.value })}
                                  />
                                  <span className="ppUnit">บาท</span>
                                </div>
                              </div>
                              <div className="ppFieldBlock">
                                <label className="ppFieldLabel">
                                  <Icon icon="mdi:package-variant-closed" /> จำนวน
                                </label>
                                <div className="ppQtyWrap">
                                  <button className="ppQtyBtn" onClick={() => updateItem(idx, { quantity: Math.max(1, item.quantity - 1) })}>−</button>
                                  <span className="ppQtyVal">{item.quantity}</span>
                                  <button className="ppQtyBtn" onClick={() => updateItem(idx, { quantity: Math.min(99, item.quantity + 1) })}>+</button>
                                  <span className="ppUnit">ชิ้น</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
 
                        {/* ══ ⑤ รายละเอียดเพิ่มเติม (optional) ══ */}
                        <div className="ppSection ppSectionOptional">
                          <div className="ppSectionHeader">
                            <span className="ppSectionDot ppDotGray" />
                            <span className="ppSectionTitle">รายละเอียดเพิ่มเติม</span>
                            <span className="ppOptionalBadge">ไม่บังคับ</span>
                          </div>
                          <div className="ppFieldRow2">
                            <div className="ppFieldBlock">
                              <label className="ppFieldLabel">โรงเรียน</label>
                              <input
                                className="ppInput" type="text"
                                placeholder="ระบุชื่อโรงเรียน..."
                                value={item.school_name}
                                onChange={e => updateItem(idx, { school_name: e.target.value })}
                              />
                            </div>
                            <div className="ppFieldBlock">
                              <label className="ppFieldLabel">หมายเหตุ / คำอธิบาย</label>
                              <textarea
                                className="ppTextarea" rows={2}
                                placeholder="อธิบายเพิ่มเติม เช่น ตำหนิเล็กน้อย..."
                                value={item.description}
                                onChange={e => updateItem(idx, { description: e.target.value })}
                              />
                            </div>
                          </div>
                        </div>
 
                      </div>
                    )}
                  </div>
                );
              })}
 
              <button className="ppAddItemBtn" onClick={addItem}>
                <Icon icon="mdi:plus-circle-outline" /> เพิ่มรายการสินค้า
              </button>
            </div>
 
            {err && (
              <div className="ppErr">
                <Icon icon="mdi:alert-circle-outline" /> {err}
              </div>
            )}
 
            <div className="ppSubmitArea">
              <button className="ppSubmitBtn" onClick={goToStep2}>
                <Icon icon="mdi:arrow-right" />
                ถัดไป: ตั้งค่าการจัดส่ง
              </button>
            </div>
          </>
        )}
 
        {/* ══════════════════════════════════════
            STEP 2 — การจัดส่ง
            เลือก provider ร่วมกันทุกสินค้า (ไม่ต้องกรอกค่าส่งเอง)
        ══════════════════════════════════════ */}
        {step === 2 && (
          <>
            <div className="ppPageHeader">
              <h1 className="ppPageTitle">
                <Icon icon="mdi:truck-delivery-outline" style={{ marginRight: 8, verticalAlign: "middle" }} />
                การจัดส่ง
              </h1>
              <p className="ppPageSub">เลือกบริการขนส่งที่รองรับสำหรับสินค้าของคุณ — ค่าจัดส่งจะคำนวณจากน้ำหนักโดยอัตโนมัติ</p>
            </div>
 
            {/* Summary chips */}
            <div className="ppShipSummaryRow">
              {items.map((item, idx) => {
                const summary = getItemSummary(item);
                return (
                  <div key={item._id} className="ppShipSummaryChip">
                    <div className="ppShipSummaryNum">{idx + 1}</div>
                    <div>
                      <div className="ppShipSummaryName">{summary.typeName}</div>
                      <div className="ppShipSummaryPrice">
                        {item.price ? `${Number(item.price).toLocaleString()} บาท` : "—"}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
 
            {/* ── Provider selection ── */}
            <div className="ppSection" style={{ background: "var(--color-surface)", borderRadius: 16, padding: "24px", marginBottom: 24 }}>
              <div className="ppSectionHeader" style={{ marginBottom: 16 }}>
                <span className="ppSectionDot ppDotBlue" />
                <span className="ppSectionTitle">เลือกขนส่งที่รองรับ</span>
                <span className="ppReqBadge">จำเป็น — เลือกได้หลายรายการ</span>
              </div>
 
              <p className="ppHint" style={{ marginBottom: 16 }}>
                <Icon icon="mdi:information-outline" style={{ verticalAlign: "middle", marginRight: 4 }} />
                ผู้ซื้อจะเห็นตัวเลือกขนส่งเหล่านี้ โดยค่าจัดส่งคิดตามประเภทขนส่งและยอดคำสั่งซื้อ
              </p>
 
              {shippingProviders.length === 0 ? (
                <div className="ppLoadingHint">
                  <Icon icon="mdi:loading" className="ppSpinner" /> กำลังโหลดรายการขนส่ง...
                </div>
              ) : (
                <div className="ppShipGrid">
                  {shippingProviders.map(p => {
                    const active = selectedProviders.includes(p.provider_id);
                    return (
                      <div
                        key={p.provider_id}
                        className={`ppShipCard ${active ? "ppShipCardActive" : ""}`}
                        onClick={() =>
                          setSelectedProviders(prev =>
                            prev.includes(p.provider_id)
                              ? prev.filter(id => id !== p.provider_id)
                              : [...prev, p.provider_id]
                          )
                        }
                      >
                        <div className="ppShipCardIcon">
                          <ShippingLogo name={p.name} size={38} />
                        </div>
                        <div className="ppShipCardName">{p.name}</div>
                        <div className="ppShipCardPrice">
                          ประมาณ {formatBaht(calcShippingEstimate(p, totalItemQty, subtotalEstimate))}
                        </div>
                        {active && (
                          <div className="ppShipCardCheck">
                            <Icon icon="mdi:check-circle" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
 
              {selectedProviders.length > 0 && (
                <div className="ppShipSelectedSummary">
                  <Icon icon="mdi:check-circle-outline" style={{ color: "#22c55e", marginRight: 6 }} />
                  เลือกแล้ว {selectedProviders.length} รายการ:{" "}
                  {shippingProviders
                    .filter(p => selectedProviders.includes(p.provider_id))
                    .map(p => p.name)
                    .join(", ")}
                </div>
              )}
            </div>
 
            {err && (
              <div className="ppErr">
                <Icon icon="mdi:alert-circle-outline" /> {err}
              </div>
            )}
 
            <div className="ppSubmitArea">
              <button className="ppBackBtn" onClick={() => { setStep(1); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
                <Icon icon="mdi:arrow-left" /> ย้อนกลับ
              </button>
              <p className="ppSubmitNote">
                แต่ละรายการจะแสดงเป็นการ์ดแยกกัน · ลงขายครั้งแรกจะอัปเดตสถานะเป็น "ผู้ขาย" โดยอัตโนมัติ
              </p>
              <button className="ppSubmitBtn" onClick={handleSubmit} disabled={submitting}>
                {submitting
                  ? <><Icon icon="mdi:loading" className="ppSpinner" /> กำลังส่ง...</>
                  : <><Icon icon="mdi:tag-outline" /> ลงขาย {items.length} รายการ</>
                }
              </button>
            </div>
          </>
        )}
 
      </div>
      <Footer />

    </div>
  );
}

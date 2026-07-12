import { useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getJson } from "../api/http.js";
import Navbar from "./Navbar.jsx";
import Footer from "./Footer.jsx";
import { Icon } from "@iconify/react";
import "./styles/AboutPage.css";

// ── Count-up hook ──────────────────────────────────────────────────────────────
function useCountUp(target, duration = 1800, started = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!started || !target) return;
    let start = 0;
    const step = Math.ceil(target / (duration / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(start);
    }, 16);
    return () => clearInterval(timer);
  }, [started, target, duration]);
  return count;
}

// ── Impact Card ────────────────────────────────────────────────────────────────
function ImpactCard({ icon, value, label, color, started }) {
  const count = useCountUp(value, 1600, started);
  return (
    <div className="ab-impact-card">
      <div className="ab-impact-icon" style={{ background: color + "18", color }}>
        <Icon icon={icon} width={32} />
      </div>
      <div className="ab-impact-value" style={{ color }}>{count.toLocaleString()}</div>
      <div className="ab-impact-label">{label}</div>
    </div>
  );
}

const heroImages = [
  "https://www.unicef.org/thailand/sites/unicef.org.thailand/files/styles/hero_extended/public/PF4C%20Technical%20Paper.webp?itok=Zswnoyta",
  "/unieed_pic/PY-1-scaled.jpg",
  "/unieed_pic/bannerabout.jpg",
];

export default function AboutPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [testimonials, setTestimonials] = useState([]);
  const [impactVisible, setImpactVisible] = useState(false);
  const [tIdx, setTIdx] = useState(0);
  const [heroIdx, setHeroIdx] = useState(0);
  const impactRef = useRef(null);

  useEffect(() => {
    getJson("/home", false).then(d => {
      setStats(d.stats || null);
      setTestimonials(Array.isArray(d.testimonials) ? d.testimonials : []);
    }).catch(() => {});
  }, []);

  // trigger count-up เมื่อ scroll มาถึง impact section
  useEffect(() => {
    const el = impactRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setImpactVisible(true); }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // testimonial auto-slide
  useEffect(() => {
    if (testimonials.length <= 1) return;
    const t = setInterval(() => setTIdx(i => (i + 1) % testimonials.length), 5000);
    return () => clearInterval(t);
  }, [testimonials.length]);

  // hero background slideshow
  useEffect(() => {
    const t = setInterval(() => setHeroIdx(i => (i + 1) % heroImages.length), 5000);
    return () => clearInterval(t);
  }, []);

  const impactCards = [
    { icon: "mdi:tshirt-crew-outline", value: Number(stats?.uniforms_fulfilled || 0), label: "ชุดที่ส่งต่อแล้ว",        color: "#3b82f6" },
    { icon: "mdi:account-school",    value: Number(stats?.students_total     || 0), label: "นักเรียนในระบบ",          color: "#10b981" },
    { icon: "mdi:school",            value: Number(stats?.schools_approved   || 0), label: "โรงเรียนที่เข้าร่วม",     color: "#f97316" },
    { icon: "mdi:heart",             value: Number(stats?.donations_total    || 0), label: "การบริจาคทั้งหมด",        color: "#ef4444" },
  ];

  return (
    <div className="ab-page">
      <Navbar activeLink="about" />

      {/* ── 1. Hero ─────────────────────────────────────────────────────────── */}
      <section className="ab-hero">
        {heroImages.map((src, i) => (
          <img
            key={src}
            src={src}
            alt="เด็กนักเรียน"
            className={`ab-hero-img${i === heroIdx ? " ab-hero-img--active" : ""}`}
          />
        ))}
        <div className="ab-hero-overlay" />
        <div className="ab-hero-content">
          <p className="ab-hero-eyebrow">เกี่ยวกับเรา</p>
          <h1 className="ab-hero-title">
            เพราะชุดนักเรียนหนึ่งตัว<br />
            <span style={{ color: "#e4691a" }}>อาจเปลี่ยนอนาคต</span><br />
            ของเด็กคนหนึ่ง
          </h1>
          <p className="ab-hero-sub">
            Unieed เชื่อมชุดนักเรียนที่ไม่ได้ใช้แล้ว ไปสู่เด็กที่ต้องการ
          </p>
        </div>
      </section>

      {/* ── 2. Our Story ────────────────────────────────────────────────────── */}
      <section className="ab-section ab-story">
        <div className="ab-story-text">
          <span className="ab-eyebrow">จุดเริ่มต้นของ Unieed</span>
          <h2 className="ab-section-title">ปัญหาที่ซ่อนอยู่<br />ในชุดนักเรียนทุกตัว</h2>
          <p className="ab-story-body">
            ในประเทศไทย การศึกษาคือสิทธิพื้นฐาน แต่ <strong>ชุดนักเรียนคือค่าใช้จ่าย</strong>ที่แพงกว่าที่หลายคนคิด
            ผู้ปกครองต้องจ่ายค่าเครื่องแบบหลักพันถึงหลักหมื่นบาทต่อปี
            ขณะที่เงินอุดหนุนจากรัฐยังไม่ครอบคลุมถึงต้นทุนจริง
          </p>
          <p className="ab-story-body">
            ผลที่ตามมาคือ นักเรียนกว่า <strong>3.48 ล้านคน</strong> หรือกว่าครึ่งของนักเรียนสังกัด สพฐ.
            ต้องเผชิญกับการขาดแคลนเครื่องแบบ บางคนไม่ได้ไปโรงเรียนเพราะไม่มีชุด
            บางครอบครัวต้องเลือกระหว่างค่าชุดกับค่าอาหาร
          </p>
          <p className="ab-story-body">
            แต่ในเวลาเดียวกัน ชุดนักเรียนสภาพดีอีกจำนวนมากกลับถูกทิ้งไว้ในตู้โดยไม่ได้ใช้
            เพราะเด็กโตขึ้น เปลี่ยนโรงเรียน หรือเลื่อนชั้น
            ของที่ยังมีประโยชน์ กลายเป็นของที่ไม่มีใครรู้ว่าจะส่งต่อไปที่ไหน
          </p>
          <p className="ab-story-body">
            Unieed เกิดขึ้นเพื่อเปลี่ยนสิ่งนั้น โดยเชื่อมชุดที่ไม่ได้ใช้แล้วกับเด็กที่รออยู่
            อย่างโปร่งใส ตรวจสอบได้ และมีความหมายสำหรับทุกฝ่าย
          </p>
        </div>
        <div className="ab-story-img-wrap">
          <img src="/unieed_pic/BannerDonation.png" alt="การบริจาค" className="ab-story-img" />
        </div>
      </section>

      {/* ── 3. Impact ───────────────────────────────────────────────────────── */}
      <section className="ab-section ab-impact-section" ref={impactRef}>
        <span className="ab-eyebrow ab-eyebrow-center">ผลกระทบที่เกิดขึ้นจริง</span>
        <h2 className="ab-section-title ab-center">ตัวเลขที่บอกเล่าทุกอย่าง</h2>
        <div className="ab-impact-grid">
          {impactCards.map(c => (
            <ImpactCard key={c.label} {...c} started={impactVisible} />
          ))}
        </div>
      </section>

      {/* ── 4. How It Works ─────────────────────────────────────────────────── */}
      <section className="ab-how-section">
        <div className="ab-how-inner">
          <span className="ab-eyebrow ab-eyebrow-center">วิธีที่เราทำงาน</span>
          <h2 className="ab-section-title ab-center">3 เส้นทางสู่การเปลี่ยนแปลง</h2>
          <p className="ab-how-subtitle">เราออกแบบให้ทุกขั้นตอนง่าย โปร่งใส และติดตามได้ตั้งแต่บ้านคุณถึงโรงเรียนปลายทาง</p>
          <div className="ab-how-grid">
            {[
              {
                icon: "mdi:gift-outline",
                color: "#3b82f6",
                gradientFrom: "#eff6ff",
                gradientTo: "#dbeafe",
                title: "บริจาคชุดนักเรียน",
                desc: "เลือกโครงการที่ต้องการ ส่งชุดตรงถึงโรงเรียนโดยไม่ผ่านคนกลาง ติดตามสถานะได้ทุกขั้นตอน",
                step: "01",
                cta: "เริ่มบริจาค",
                link: "/projects",
                tags: ["ฟรี", "โปร่งใส", "ติดตามได้"],
              },
              {
                icon: "mdi:shopping-outline",
                color: "#10b981",
                gradientFrom: "#f0fdf4",
                gradientTo: "#dcfce7",
                title: "ซื้อ-ขายชุดมือสอง",
                desc: "ชุดนักเรียนสภาพดีในราคาที่จับต้องได้ คุ้มค่าสำหรับผู้ซื้อ มีรายได้สำหรับผู้ขาย",
                step: "02",
                cta: "ดูร้านค้า",
                link: "/market",
                tags: ["ราคาดี", "สภาพดี", "มีรายได้"],
              },
              {
                icon: "mdi:school-outline",
                color: "#f97316",
                gradientFrom: "#fff7ed",
                gradientTo: "#ffedd5",
                title: "โรงเรียนขอรับการสนับสนุน",
                desc: "โรงเรียนลงทะเบียนและเปิดโครงการระบุจำนวนชุดที่ต้องการได้เอง ตรวจสอบของที่ได้รับ และยืนยันผลการบริจาคโปร่งใส",
                step: "03",
                cta: "สำหรับโรงเรียน",
                link: "/register/school",
                tags: ["ลงทะเบียนฟรี", "ยืนยันผล", "ตรวจสอบได้"],
              },
            ].map((h, i) => (
              <div key={h.step} className="ab-how-card" style={{ '--hw-color': h.color, '--hw-from': h.gradientFrom, '--hw-to': h.gradientTo }}>
                {/* top accent bar */}
                <div className="ab-how-accent" style={{ background: h.color }} />
                {/* step badge */}
                <div className="ab-how-step-badge" style={{ color: h.color, background: h.color + '14' }}>{h.step}</div>
                {/* icon */}
                <div className="ab-how-icon-wrap" style={{ background: `linear-gradient(135deg, ${h.gradientFrom}, ${h.gradientTo})`, color: h.color }}>
                  <Icon icon={h.icon} width={34} />
                </div>
                <h3 className="ab-how-title">{h.title}</h3>
                <p className="ab-how-desc">{h.desc}</p>
                {/* tags */}
                <div className="ab-how-tags">
                  {h.tags.map(tag => (
                    <span key={tag} className="ab-how-tag" style={{ color: h.color, background: h.color + '12', border: `1px solid ${h.color}28` }}>{tag}</span>
                  ))}
                </div>
                {/* CTA */}
                <Link to={h.link} className="ab-how-cta" style={{ '--cta-color': h.color }}>
                  {h.cta}
                  <Icon icon="mdi:arrow-right" width={16} className="ab-how-cta-arrow" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. Mission & Values ─────────────────────────────────────────────── */}
      <section className="ab-section ab-values">
        <span className="ab-eyebrow ab-eyebrow-center">พันธกิจและค่านิยม</span>
        <h2 className="ab-section-title ab-center">สิ่งที่เราเชื่อ</h2>
        <div className="ab-values-grid">
          {[
            { icon: "mdi:magnify", color: "#3b82f6", title: "โปร่งใสทุกขั้นตอน", desc: "ติดตามได้ว่าของถึงโรงเรียนไหน เมื่อไหร่ และสภาพเป็นอย่างไร" },
            { icon: "mdi:account-group-outline", color: "#10b981", title: "เข้าถึงได้ทุกคน", desc: "ไม่ว่าจะบริจาคชุดเดียวหรือร้อยตัว ทุกการกระทำมีความหมาย" },
            { icon: "mdi:recycle", color: "#f97316", title: "ส่งต่อ ไม่ทิ้ง", desc: "ชุดที่ไม่ได้ใช้แล้วยังมีคุณค่า — เราแค่พาไปถูกที่" },
            { icon: "mdi:account-heart-outline", color: "#8b5cf6", title: "ชุมชนที่แบ่งปัน", desc: "Unieed ไม่ใช่แค่เว็บแอปพลิเคชัน แต่คือชุมชนของคนที่เชื่อว่าโอกาสควรเท่าเทียม" },
          ].map(v => (
            <div key={v.title} className="ab-value-card">
              <div className="ab-value-icon" style={{ color: v.color, background: v.color + "15" }}>
                <Icon icon={v.icon} width={28} />
              </div>
              <h3 className="ab-value-title">{v.title}</h3>
              <p className="ab-value-desc">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── 6. Testimonials ─────────────────────────────────────────────────── */}
      {testimonials.length > 0 && (
        <section className="ab-section ab-testimonials">
          <span className="ab-eyebrow ab-eyebrow-center">เสียงจากโรงเรียน</span>
          <h2 className="ab-section-title ab-center">ความประทับใจที่ได้รับ</h2>
          <div className="ab-testi-wrap">
            {testimonials.map((t, i) => (
              <div
                key={t.testimonial_id}
                className="ab-testi-card"
                style={{ opacity: i === tIdx ? 1 : 0, pointerEvents: i === tIdx ? "auto" : "none", position: i === 0 ? "relative" : "absolute", top: 0, left: 0, right: 0 }}
              >
                {t.image_url && (
                  <img src={t.image_url} alt={t.school_name} className="ab-testi-img" />
                )}
                <div className="ab-testi-quote">
                  <Icon icon="mdi:format-quote-open" width={32} className="ab-testi-quote-icon" />
                  <h3 className="ab-testi-title">{t.review_title}</h3>
                  <p className="ab-testi-text">{t.review_text}</p>
                  <div className="ab-testi-meta">
                    <span className="ab-testi-school">{t.school_name}</span>
                    <span className="ab-testi-date">{t.review_date}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {testimonials.length > 1 && (
            <div className="ab-testi-dots">
              {testimonials.map((_, i) => (
                <button key={i} className={`ab-testi-dot${i === tIdx ? " active" : ""}`} onClick={() => setTIdx(i)} />
              ))}
            </div>
          )}
        </section>
      )}

      {/* ── 7. CTA ──────────────────────────────────────────────────────────── */}
      <section className="ab-cta">
        <img src="https://www.unicef.org/thailand/sites/unicef.org.thailand/files/styles/hero_extended/public/PF4C%20Technical%20Paper.webp?itok=Zswnoyta" alt="" className="ab-cta-bg" />
        <div className="ab-cta-overlay" />
        <div className="ab-cta-content">
          <h2 className="ab-cta-title">ร่วมเป็นส่วนหนึ่งของการเปลี่ยนแปลง</h2>
          <p className="ab-cta-sub">
            ทุกชุดที่คุณส่งต่อ คือโอกาสที่เด็กคนหนึ่งจะได้ไปโรงเรียนอย่างมั่นใจ
          </p>
          <div className="ab-cta-btns">
            <button className="ab-cta-btn-primary" onClick={() => navigate("/projects")}>
              ดูโครงการทั้งหมด
            </button>
            <button className="ab-cta-btn-secondary" onClick={() => navigate("/projects")}>
              บริจาคเลย
            </button>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}

const LOCAL_SHIPPING_LOGOS = [
  { src: "/unieed_pic/ship5.png", terms: ["kex"] },
  { src: "/unieed_pic/ship4.png", terms: ["kerry"] },
  { src: "/unieed_pic/ship2.png", terms: ["flash", "flx"] },
  { src: "/unieed_pic/ship3.png", terms: ["j&t", "jnt", "jt"] },
  { src: "/unieed_pic/ship1.png", terms: ["thai", "thp", "thaipost", "post", "ems", "ไปรษณีย์"] },
];

export function getShippingLogoSrc(code, name) {
  const text = `${code || ""} ${name || ""}`.toLowerCase();
  const match = LOCAL_SHIPPING_LOGOS.find(({ terms }) =>
    terms.some(term => text.includes(term))
  );
  return match?.src || null;
}

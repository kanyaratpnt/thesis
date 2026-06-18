import { db } from "../../config/db.js";

const segmenter = typeof Intl.Segmenter === "function"
  ? new Intl.Segmenter("th", { granularity: "word" })
  : null;

const QUERY_SYNONYMS = new Map([
  ["ชาย", ["male", "เด็กชาย", "นักเรียนชาย"]],
  ["หญิง", ["female", "เด็กหญิง", "นักเรียนหญิง"]],
  ["อนุบาล", ["kindergarten", "kg"]],
  ["ประถม", ["ประถมศึกษา"]],
  ["มัธยมต้น", ["มัธยมตอนต้น"]],
  ["มัธยมปลาย", ["มัธยมตอนปลาย"]],
  ["มือสอง", ["สินค้ามือสอง", "ใช้แล้ว"]],
]);

function normalize(value) {
  return String(value ?? "")
    .normalize("NFKC")
    .toLocaleLowerCase("th-TH")
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function words(value) {
  const text = normalize(value);
  if (!text) return [];

  const segmented = segmenter
    ? [...segmenter.segment(text)].filter(part => part.isWordLike).map(part => part.segment)
    : text.split(" ");

  return [...new Set([...text.split(" "), ...segmented].map(normalize).filter(Boolean))];
}

function queryTokens(query) {
  const text = normalize(query);
  const segmented = segmenter
    ? [...segmenter.segment(text)].filter(part => part.isWordLike).map(part => normalize(part.segment))
    : text.split(" ");

  return [...new Set(segmented.filter(Boolean))].slice(0, 16).map(token => ({
    token,
    alternatives: [token, ...(QUERY_SYNONYMS.get(token) || [])].map(normalize),
  }));
}

function editDistance(a, b, maxDistance) {
  if (Math.abs(a.length - b.length) > maxDistance) return maxDistance + 1;
  const previous = Array.from({ length: b.length + 1 }, (_, index) => index);

  for (let i = 1; i <= a.length; i += 1) {
    const current = [i];
    let rowMinimum = current[0];
    for (let j = 1; j <= b.length; j += 1) {
      current[j] = Math.min(
        current[j - 1] + 1,
        previous[j] + 1,
        previous[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
      rowMinimum = Math.min(rowMinimum, current[j]);
    }
    if (rowMinimum > maxDistance) return maxDistance + 1;
    previous.splice(0, previous.length, ...current);
  }
  return previous[b.length];
}

function matchesToken(text, textWords, alternatives) {
  for (const alternative of alternatives) {
    if (text.includes(alternative)) return { matched: true, exact: true };
    if (alternative.length < 4) continue;

    const tolerance = alternative.length >= 8 ? 2 : 1;
    if (textWords.some(word => editDistance(alternative, word, tolerance) <= tolerance)) {
      return { matched: true, exact: false };
    }
  }
  return { matched: false, exact: false };
}

function scoreRow(row, query, fields) {
  const phrase = normalize(query);
  const tokens = queryTokens(query);
  if (!tokens.length) return 1;

  const normalizedFields = fields.map(({ value, weight }) => ({
    text: normalize(value),
    weight,
  }));
  const allText = normalizedFields.map(field => field.text).join(" ");
  const allWords = words(allText);

  let score = allText.includes(phrase) ? 180 : 0;
  for (const field of normalizedFields) {
    if (field.text.includes(phrase)) score += field.weight * 3;
  }

  for (const { alternatives } of tokens) {
    const overallMatch = matchesToken(allText, allWords, alternatives);
    if (!overallMatch.matched) return null;

    score += overallMatch.exact ? 20 : 8;
    for (const field of normalizedFields) {
      const match = matchesToken(field.text, words(field.text), alternatives);
      if (match.matched) score += field.weight * (match.exact ? 2 : 1);
    }
  }

  return score;
}

function rankRows(rows, query, getFields, limit) {
  if (!normalize(query)) {
    return { hits: rows.slice(0, limit), estimatedTotalHits: rows.length };
  }

  const ranked = rows
    .map(row => ({ row, score: scoreRow(row, query, getFields(row)) }))
    .filter(item => item.score !== null)
    .sort((a, b) => b.score - a.score || Number(b.row.created_at_ms || 0) - Number(a.row.created_at_ms || 0));

  return {
    hits: ranked.slice(0, limit).map(item => item.row),
    estimatedTotalHits: ranked.length,
  };
}

function jsonSizeLabel(raw) {
  if (!raw) return "";
  try {
    const value = typeof raw === "string" ? JSON.parse(raw) : raw;
    if (!value || typeof value !== "object") return String(raw);
    const labels = { chest: "อก รอบอก", waist: "เอว รอบเอว", length: "ยาว ความยาว", hip: "สะโพก" };
    return Object.entries(value)
      .map(([key, item]) => `${labels[key] || key} ${item}`)
      .join(" ");
  } catch {
    return String(raw);
  }
}

function cleanInternalFields(row) {
  const { created_at_ms, search_uniform_details, ...hit } = row;
  return hit;
}

export async function searchProjectsWithSql(query, { province, status = "open", limit = 30 } = {}) {
  const where = ["s.verification_status = 'approved'"];
  const params = [];
  if (status) {
    where.push("dr.status = ?");
    params.push(status);
  }
  if (province) {
    where.push("s.province = ?");
    params.push(province);
  }

  const [rows] = await db.query(`
    SELECT
      dr.request_id,
      dr.request_title,
      dr.status,
      dr.request_description AS description,
      dr.request_image_url,
      dr.created_at,
      UNIX_TIMESTAMP(dr.created_at) AS created_at_ms,
      s.school_name,
      s.province AS school_province,
      s.school_address,
      GROUP_CONCAT(DISTINCT ut.type_name ORDER BY ut.type_name SEPARATOR ' ') AS uniform_types,
      GROUP_CONCAT(DISTINCT ut.uniform_category ORDER BY ut.uniform_category SEPARATOR ' ') AS uniform_category,
      GROUP_CONCAT(DISTINCT CONCAT_WS(' ',
        ut.type_name,
        ut.uniform_category,
        CASE ut.gender WHEN 'male' THEN 'ชาย นักเรียนชาย' WHEN 'female' THEN 'หญิง นักเรียนหญิง' ELSE ut.gender END,
        st.education_level_group,
        sn.size
      ) SEPARATOR ' ') AS search_uniform_details,
      COALESCE(SUM(sn.quantity_needed - COALESCE(sn.quantity_received, 0)), 0) AS total_needed
    FROM donation_request dr
    JOIN schools s ON s.school_id = dr.school_id
    LEFT JOIN students st ON st.request_id = dr.request_id
    LEFT JOIN student_need sn ON sn.student_id = st.student_id
    LEFT JOIN uniform_type ut ON ut.uniform_type_id = sn.uniform_type_id
    WHERE ${where.join(" AND ")}
    GROUP BY dr.request_id, dr.request_title, dr.status, dr.request_description,
      dr.request_image_url, dr.created_at, s.school_name, s.province, s.school_address
    ORDER BY dr.created_at DESC
    LIMIT 1000
  `, params);

  const ranked = rankRows(rows, query, row => [
    { value: row.request_title, weight: 35 },
    { value: row.school_name, weight: 30 },
    { value: row.description, weight: 18 },
    { value: `${row.school_address || ""} ${row.school_province || ""}`, weight: 16 },
    { value: `${row.uniform_types || ""} ${row.uniform_category || ""} ${row.search_uniform_details || ""}`, weight: 22 },
  ], limit);

  return { ...ranked, hits: ranked.hits.map(cleanInternalFields) };
}

export async function searchProductsWithSql(query, {
  gender,
  uniform_type_id,
  category_id,
  school_id,
  limit = 40,
} = {}) {
  const where = ["p.status = 'available'"];
  const params = [];
  if (gender) {
    where.push("COALESCE(p.gender, ut.gender) = ?");
    params.push(gender);
  }
  if (uniform_type_id) {
    where.push("p.uniform_type_id = ?");
    params.push(Number(uniform_type_id));
  }
  if (category_id) {
    where.push("COALESCE(p.category_id, ut.category_id) = ?");
    params.push(Number(category_id));
  }
  if (school_id) {
    where.push("p.school_name IN (SELECT school_name FROM schools WHERE school_id = ?)");
    params.push(Number(school_id));
  }

  const [rows] = await db.query(`
    SELECT
      p.product_id,
      p.product_title,
      p.product_description AS description,
      p.price,
      p.status,
      COALESCE(p.gender, ut.gender) AS gender,
      p.uniform_type_id,
      p.school_name,
      p.level,
      p.condition_label,
      p.condition_percent,
      p.custom_type_name,
      p.size,
      p.created_at,
      UNIX_TIMESTAMP(p.created_at) AS created_at_ms,
      ut.type_name,
      ut.uniform_category,
      ci.category_name,
      u.user_name AS seller_name
    FROM products p
    LEFT JOIN uniform_type ut ON ut.uniform_type_id = p.uniform_type_id
    LEFT JOIN category_item ci ON ci.category_id = COALESCE(p.category_id, ut.category_id)
    LEFT JOIN users u ON u.user_id = p.seller_id
    WHERE ${where.join(" AND ")}
    ORDER BY p.created_at DESC
    LIMIT 3000
  `, params);

  const ranked = rankRows(rows, query, row => [
    { value: row.product_title, weight: 35 },
    { value: `${row.type_name || ""} ${row.custom_type_name || ""} ${row.category_name || ""} ${row.uniform_category || ""}`, weight: 28 },
    { value: row.description, weight: 20 },
    { value: `${row.school_name || ""} ${row.seller_name || ""}`, weight: 16 },
    { value: `${row.level || ""} ${row.condition_label || ""} ${row.condition_percent || ""}`, weight: 18 },
    { value: `${jsonSizeLabel(row.size)} ${row.size || ""}`, weight: 22 },
    { value: row.gender === "male" ? "male ชาย นักเรียนชาย" : row.gender === "female" ? "female หญิง นักเรียนหญิง" : row.gender, weight: 18 },
    { value: `${row.price || ""} บาท`, weight: 8 },
  ], limit);

  return { ...ranked, hits: ranked.hits.map(cleanInternalFields) };
}

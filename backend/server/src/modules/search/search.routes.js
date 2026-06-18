// src/modules/search/search.routes.js
import { Router } from "express";
import { searchProjects, searchProducts } from "./search.service.js";

const r = Router();

/**
 * GET /api/search/projects?q=...&province=...&status=open&limit=30
 */
r.get("/projects", async (req, res, next) => {
  try {
    const { q = "", province, status, limit } = req.query;
    const result = await searchProjects(q, {
      province,
      status:  status || "open",
      limit:   Math.min(Number(limit) || 30, 100),
    });
    res.json(result);
  } catch (err) {
    console.error("[search] project search failed:", err.message);
    next(err);
  }
});

/**
 * GET /api/search/products?q=...&gender=...&category_id=...&uniform_type_id=...&limit=40
 */
r.get("/products", async (req, res, next) => {
  try {
    const { q = "", gender, uniform_type_id, category_id, school_id, limit } = req.query;
    const result = await searchProducts(q, {
      gender,
      uniform_type_id: uniform_type_id ? Number(uniform_type_id) : undefined,
      category_id:     category_id     ? Number(category_id)     : undefined,
      school_id:       school_id       ? Number(school_id)       : undefined,
      limit:           Math.min(Number(limit) || 40, 200),
    });
    res.json(result);
  } catch (err) {
    console.error("[search] product search failed:", err.message);
    next(err);
  }
});

export default r;

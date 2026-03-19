import { Router } from "express";
import Category from "../models/Category.js";
import { authRequired, adminOnly } from "../middleware/auth.js";

const router = Router();

// ดูหมวดหมู่ทั้งหมด
router.get("/", async (req, res) => {
  const list = await Category.findAll({ where: { active: true } });
  res.json(list);
});

// Admin สร้างหมวดหมู่
router.post("/", authRequired, adminOnly, async (req, res) => {
  const { name } = req.body;
  const c = await Category.create({ name });
  res.status(201).json(c);
});

export default router;
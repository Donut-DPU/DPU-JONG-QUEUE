import { Router } from "express";
import Category from "../models/Category.js";
import { authRequired, adminOnly } from "../middleware/auth.js";

const router = Router();

// GET all categories
router.get("/", async (req, res) => {
  const list = await Category.findAll({
    order: [["id", "ASC"]],
  });
  res.json(list);
});

// CREATE category (admin)
router.post("/", authRequired, adminOnly, async (req, res) => {
  try {
    const { name } = req.body;
    const c = await Category.create({ name });
    res.json(c);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

export default router;
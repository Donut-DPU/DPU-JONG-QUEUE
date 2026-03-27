import { Router } from "express";
import Category from "../models/Category.js";
import { authRequired, adminOnly } from "../middleware/auth.js";

const router = Router();

// GET
router.get("/", async (req, res) => {
  const list = await Category.findAll({ order: [["id","ASC"]] });
  res.json(list);
});

// CREATE
router.post("/", authRequired, adminOnly, async (req, res) => {
  const c = await Category.create({ name: req.body.name });
  res.json(c);
});

// UPDATE
router.put("/:id", authRequired, adminOnly, async (req, res) => {
  const c = await Category.findByPk(req.params.id);
  if (!c) return res.status(404).json({ message: "not found" });

  await c.update({ name: req.body.name });
  res.json(c);
});

// DELETE
router.delete("/:id", authRequired, adminOnly, async (req, res) => {
  const c = await Category.findByPk(req.params.id);
  if (!c) return res.status(404).json({ message: "not found" });

  await c.destroy();
  res.json({ message: "deleted" });
});

export default router;
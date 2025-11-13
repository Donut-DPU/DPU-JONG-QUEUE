import { Router } from "express";
import { authRequired, adminOnly } from "../middleware/auth.js";
import Service from "../models/Service.js";

const router = Router();

// ADMIN: create service
router.post("/", authRequired, adminOnly, async (req, res) => {
  try {
    const s = await Service.create(req.body);
    res.status(201).json(s);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

// ADMIN: update service
router.put("/:id", authRequired, adminOnly, async (req, res) => {
  try {
    const s = await Service.findByPk(req.params.id);
    if (!s) return res.status(404).json({ message: "Not found" });
    await s.update(req.body);
    res.json(s);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

// ADMIN: delete service
router.delete("/:id", authRequired, adminOnly, async (req, res) => {
  const s = await Service.findByPk(req.params.id);
  if (!s) return res.status(404).json({ message: "Not found" });
  await s.destroy();
  res.json({ message: "Deleted" });
});

// USER/ADMIN: list active (หรือทั้งหมดถ้ามีพารามิเตอร์)
router.get("/", async (req, res) => {
  const { all } = req.query;
  const where = all ? {} : { active: true };
  const list = await Service.findAll({ where, order:[["id","ASC"]] });
  res.json(list);
});

export default router;

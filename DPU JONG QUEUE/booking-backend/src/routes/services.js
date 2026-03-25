import { Router } from "express";
import { authRequired, adminOnly } from "../middleware/auth.js";
import Service from "../models/Service.js";
import Category from "../models/Category.js";

const router = Router();

/**
 * =========================
 * GET /api/services
 * =========================
 * ดึงบริการทั้งหมด + หมวดหมู่
 */
router.get("/", async (req, res) => {
  try {
    const list = await Service.findAll({
      include: [
        {
          model: Category,
          attributes: ["id", "name"],
        },
      ],
      order: [["id", "ASC"]],
    });

    res.json(list);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

/**
 * =========================
 * GET /api/services/:id
 * =========================
 */
router.get("/:id", async (req, res) => {
  try {
    const s = await Service.findByPk(req.params.id, {
      include: [
        {
          model: Category,
          attributes: ["id", "name"],
        },
      ],
    });

    if (!s) return res.status(404).json({ message: "Not found" });

    res.json(s);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

/**
 * =========================
 * POST /api/services
 * =========================
 * สร้างบริการ (Admin)
 */
router.post("/", authRequired, adminOnly, async (req, res) => {
  try {
    const {
      name,
      description,
      categoryId,
      dailyStartTime,
      dailyEndTime,
      slotDurationMin,
      slotCapacity,
    } = req.body;

    const s = await Service.create({
      name,
      description,
      category_id: categoryId,
      dailyStartTime,
      dailyEndTime,
      slotDurationMin,
      slotCapacity,
    });

    res.json(s);
  } catch (e) {
    console.error("CREATE SERVICE ERROR:", e);
    res.status(500).json({ message: e.message });
  }
});

/**
 * =========================
 * PUT /api/services/:id
 * =========================
 * แก้ไขบริการ (Admin)
 */
router.put("/:id", authRequired, adminOnly, async (req, res) => {
  try {
    const s = await Service.findByPk(req.params.id);
    if (!s) return res.status(404).json({ message: "Not found" });

    const {
      name,
      description,
      categoryId,
      dailyStartTime,
      dailyEndTime,
      slotDurationMin,
      slotCapacity,
      active,
    } = req.body;

    await s.update({
      name,
      description,
      category_id: categoryId,
      dailyStartTime,
      dailyEndTime,
      slotDurationMin,
      slotCapacity,
      active,
    });

    res.json(s);
  } catch (e) {
    console.error("UPDATE SERVICE ERROR:", e);
    res.status(500).json({ message: e.message });
  }
});

/**
 * =========================
 * DELETE /api/services/:id
 * =========================
 * ลบบริการ (Admin)
 */
router.delete("/:id", authRequired, adminOnly, async (req, res) => {
  try {
    const s = await Service.findByPk(req.params.id);
    if (!s) return res.status(404).json({ message: "Not found" });

    await s.destroy();

    res.json({ message: "Deleted" });
  } catch (e) {
    console.error("DELETE SERVICE ERROR:", e);
    res.status(500).json({ message: e.message });
  }
});

export default router;

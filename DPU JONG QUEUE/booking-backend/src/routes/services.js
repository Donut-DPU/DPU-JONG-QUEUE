import { Router } from "express";
import { authRequired, adminOnly } from "../middleware/auth.js";
import Service from "../models/Service.js";
import Category from "../models/Category.js";
import ServiceWeeklyOff from "../models/ServiceWeeklyOff.js";
import ServiceHoliday from "../models/ServiceHoliday.js";

const router = Router();

/**
 * =========================
 * GET /api/services
 * =========================
 */
router.get("/", async (req, res) => {
  try {
    const { categoryId } = req.query;

    const where = {};
    if (categoryId) {
      where.category_id = categoryId;
    }

    const services = await Service.findAll({
      where,
      order: [["id", "ASC"]],
    });

    res.json(services);
  } catch (e) {
    console.error("GET SERVICES ERROR:", e);
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
      include: [{ model: Category, attributes: ["id", "name"] }],
    });

    if (!s) return res.status(404).json({ message: "Not found" });

    res.json(s);
  } catch (e) {
    console.error("GET SERVICE ERROR:", e);
    res.status(500).json({ message: e.message });
  }
});

/**
 * =========================
 * POST /api/services
 * =========================
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

/**
 * =========================
 * POST /api/services/:id/holiday
 * =========================
 * เพิ่มวันหยุด (Admin)
 */
router.post("/:id/holiday", authRequired, adminOnly, async (req, res) => {
  try {
    const { date } = req.body;

    if (!date) {
      return res.status(400).json({ message: "date required" });
    }

    console.log("ADD HOLIDAY:", req.params.id, date);

    const h = await ServiceHoliday.create({
      service_id: req.params.id,
      date,
    });

    console.log("CREATED HOLIDAY:", h.toJSON());

    res.json(h);
  } catch (e) {
    console.error("HOLIDAY ERROR:", e);
    res.status(500).json({ message: e.message });
  }
});

/**
 * =========================
 * POST /api/services/:id/weekly-off
 * =========================
 * เพิ่มวันหยุดรายสัปดาห์ (Admin)
 */
router.post("/:id/weekly-off", authRequired, adminOnly, async (req, res) => {
  try {
    const { day } = req.body;

    if (day === undefined) {
      return res.status(400).json({ message: "day required (0-6)" });
    }

    console.log("ADD WEEKLY OFF:", req.params.id, day);

    const w = await ServiceWeeklyOff.create({
      service_id: req.params.id,
      day_of_week: day,
    });

    console.log("CREATED WEEKLY:", w.toJSON());

    res.json(w);
  } catch (e) {
    console.error("WEEKLY OFF ERROR:", e);
    res.status(500).json({ message: e.message });
  }
});

/**
 * =========================
 * GET /api/services/:id/holidays
 * =========================
 */
router.get("/:id/holidays", authRequired, adminOnly, async (req, res) => {
  try {
    const holidays = await ServiceHoliday.findAll({
      where: { service_id: req.params.id },
    });

    const weekly = await ServiceWeeklyOff.findAll({
      where: { service_id: req.params.id },
    });

    res.json({ holidays, weekly });
  } catch (e) {
    console.error("GET HOLIDAYS ERROR:", e);
    res.status(500).json({ message: e.message });
  }
});

export default router;
// booking-backend/src/routes/services.js
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
      include: [
        {
          model: Category,
          attributes: ["id", "name"]
        }
      ],
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
 * 🔥 RESET HOLIDAYS (สำคัญมาก)
 * =========================
 */
router.post("/:id/reset-holidays", authRequired, adminOnly, async (req, res) => {
  try {
    const { holidays = [], weekly = [] } = req.body;
    const serviceId = req.params.id;

    // ✅ ลบของเก่าทั้งหมด
    await ServiceHoliday.destroy({
      where: { service_id: serviceId }
    });

    await ServiceWeeklyOff.destroy({
      where: { service_id: serviceId }
    });

    // ✅ เพิ่มใหม่ (กันซ้ำ)
    const uniqueHolidays = [...new Set(holidays)];

    for (const d of uniqueHolidays) {
      await ServiceHoliday.create({
        service_id: serviceId,
        date: d,
      });
    }

    const uniqueWeekly = [...new Set(weekly)];

    for (const d of uniqueWeekly) {
      await ServiceWeeklyOff.create({
        service_id: serviceId,
        day_of_week: d,
      });
    }

    res.json({ message: "updated" });

  } catch (e) {
    console.error("RESET HOLIDAY ERROR:", e);
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
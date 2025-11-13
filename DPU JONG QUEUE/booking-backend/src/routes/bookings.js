// booking-backend/src/routes/bookings.js
import { Router } from "express";
import { authRequired, adminOnly } from "../middleware/auth.js";
import Service from "../models/Service.js";
import Booking from "../models/Booking.js";
import { generateSlots, toMinutes } from "../utils/time.js";
import { Op } from "sequelize";

const router = Router();

// เวลาไทย: YYYY-MM-DD และ HH:mm ปัจจุบัน (Bangkok)
function nowBangkok() {
  const f = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Bangkok",
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
  const parts = Object.fromEntries(f.formatToParts(new Date()).map(p => [p.type, p.value]));
  const date = `${parts.year}-${parts.month}-${parts.day}`; // YYYY-MM-DD
  const time = `${parts.hour}:${parts.minute}`;              // HH:mm
  return { date, time };
}
const ACTIVE_STATUSES = ["pending","confirmed","checked_in"];

/**
 * GET /api/bookings/slots?serviceId=1&date=YYYY-MM-DD
 * คืน slot ทั้งวัน + remaining; ถ้าวันนี้ → slot ก่อนเวลาปัจจุบัน = remaining 0
 */
router.get("/slots", authRequired, async (req, res) => {
  try {
    const { serviceId, date } = req.query;
    if (!serviceId || !date) return res.status(400).json({ message: "serviceId & date required" });

    const service = await Service.findByPk(serviceId);
    if (!service || !service.active) return res.status(404).json({ message: "Service not available" });

    const slots = generateSlots(service.dailyStartTime, service.dailyEndTime, service.slotDurationMin);

    // นับที่ถูกจองแล้ว
    const counts = await Booking.findAll({
      attributes: ["time", [Booking.sequelize.fn("COUNT", Booking.sequelize.col("id")), "count"]],
      where: { service_id: serviceId, date, status: { [Op.in]: ACTIVE_STATUSES } },
      group: ["time"],
      raw: true,
    });
    const mapCount = new Map(counts.map(c => [c.time, Number(c.count)]));

    // ถ้าวันนี้ → ปิด slot ที่ผ่านมาแล้ว
    const { date: today, time: nowHHMM } = nowBangkok();
    const nowMin = toMinutes(nowHHMM);
    const isToday = date === today;

    const result = slots.map(t => {
      const booked = mapCount.get(t) || 0;
      let remaining = Math.max(0, service.slotCapacity - booked);
      if (isToday && toMinutes(t) <= nowMin) remaining = 0; // ปิด slot ที่ผ่านมาแล้ว
      return { time: t, capacity: service.slotCapacity, booked, remaining };
    });

    res.json({ serviceId: service.id, date, slots: result });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

/**
 * POST /api/bookings
 * body: { serviceId, date, time, note? }
 * บล็อก: ย้อนหลัง, เวลาที่ผ่านแล้ว (ของวันเดียวกัน), จองซ้ำ user เดิม
 */
router.post("/", authRequired, async (req, res) => {
  try {
    const userId = req.user.id;
    const { serviceId, date, time, note } = req.body;
    if (!serviceId || !date || !time) return res.status(400).json({ message: "serviceId, date, time required" });

    const service = await Service.findByPk(serviceId);
    if (!service || !service.active) return res.status(404).json({ message: "Service not available" });

    const { date: today, time: nowHHMM } = nowBangkok();
    if (date < today) return res.status(400).json({ message: "Cannot book in the past date" });
    if (date === today && toMinutes(time) <= toMinutes(nowHHMM)) {
      return res.status(400).json({ message: "Cannot book a past time today" });
    }

    // เวลาในคำขอต้องตรงกับ slot จริง
    const slots = generateSlots(service.dailyStartTime, service.dailyEndTime, service.slotDurationMin);
    if (!slots.includes(time)) return res.status(400).json({ message: "Invalid time slot" });

    // กัน user จองซ้ำ slot เดิม (ยังไม่นับคิวเสร็จ/ยกเลิก)
    const existsMine = await Booking.findOne({
      where: { user_id: userId, service_id: serviceId, date, time, status: { [Op.in]: ACTIVE_STATUSES } },
    });
    if (existsMine) return res.status(409).json({ message: "You already booked this slot" });

    // เช็ค capacity
    const bookedCount = await Booking.count({
      where: { service_id: serviceId, date, time, status: { [Op.in]: ACTIVE_STATUSES } },
    });
    if (bookedCount >= service.slotCapacity) return res.status(409).json({ message: "Slot is full" });

    const b = await Booking.create({
      user_id: userId,
      service_id: serviceId,
      date, time, note,
      status: "pending",
    });

    res.status(201).json(b);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

/**
 * ของเดิม: /mine, /:id/status, /admin ... (คงเดิมตามที่ทำก่อนหน้า)
 */
router.get("/mine", authRequired, async (req, res) => {
  const list = await Booking.findAll({
    where: { user_id: req.user.id },
    order: [["date","ASC"],["time","ASC"]],
  });
  res.json(list);
});

router.patch("/:id/status", authRequired, adminOnly, async (req, res) => {
  const { status } = req.body;
  if (!["pending","confirmed","checked_in","completed","cancelled","no_show"].includes(status))
    return res.status(400).json({ message: "Invalid status" });

  const b = await Booking.findByPk(req.params.id);
  if (!b) return res.status(404).json({ message: "Not found" });

  b.status = status;
  await b.save();
  res.json(b);
});

router.get("/admin", authRequired, adminOnly, async (req, res) => {
  const { date, serviceId, status } = req.query;
  const where = {};
  if (date) where.date = date;
  if (serviceId) where.service_id = serviceId;
  if (status) where.status = status;

  const list = await Booking.findAll({
    where,
    include: [{ model: Service, attributes: ["id","name"] }],
    order: [["date","ASC"],["time","ASC"]],
  });
  res.json(list);
});

export default router;

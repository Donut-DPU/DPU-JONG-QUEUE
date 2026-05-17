// booking-backend/src/routes/bookings.js

import { Router } from "express";
import { authRequired, adminOnly } from "../middleware/auth.js";
import Service from "../models/Service.js";
import Booking from "../models/Booking.js";
import { generateSlots, toMinutes } from "../utils/time.js";
import { Op } from "sequelize";
import User from "../models/User.js";
import ServiceHoliday from "../models/ServiceHoliday.js";
import ServiceWeeklyOff from "../models/ServiceWeeklyOff.js";

const router = Router();

// เวลาไทย
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

  const parts = Object.fromEntries(
    f.formatToParts(new Date()).map((p) => [p.type, p.value])
  );

  const date = `${parts.year}-${parts.month}-${parts.day}`;
  const time = `${parts.hour}:${parts.minute}`;

  return { date, time };
}

const ACTIVE_STATUSES = [
  "pending",
  "confirmed",
  "checked_in"
];

/**
 * =========================================================
 * GET /slots
 * =========================================================
 */
router.get("/slots", authRequired, async (req, res) => {
  try {
    const { serviceId, date } = req.query;

    if (!serviceId || !date) {
      return res.status(400).json({
        message: "serviceId & date required"
      });
    }

    const service = await Service.findByPk(serviceId);

    if (!service || !service.active) {
      return res.status(404).json({
        message: "Service not available"
      });
    }

    // ✅ เช็ควันหยุด
    const isHoliday = await ServiceHoliday.findOne({
      where: {
        service_id: serviceId,
        date,
      },
    });

    const day = new Date(date).getDay();

    const isWeeklyOff = await ServiceWeeklyOff.findOne({
      where: {
        service_id: serviceId,
        day_of_week: day,
      },
    });

    if (isHoliday) {
      return res.json({
        serviceId,
        date,
        slots: [],
        reason: "holiday",
      });
    }

    if (isWeeklyOff) {
      return res.json({
        serviceId,
        date,
        slots: [],
        reason: "weekly_off",
      });
    }

    // ✅ generate slot
    const slots = generateSlots(
      service.dailyStartTime,
      service.dailyEndTime,
      service.slotDurationMin
    );

    // ✅ นับจำนวน booking
    const counts = await Booking.findAll({
      attributes: [
        "time",
        [
          Booking.sequelize.fn(
            "COUNT",
            Booking.sequelize.col("id")
          ),
          "count"
        ]
      ],

      where: {
        service_id: serviceId,
        date,

        status: {
          [Op.in]: ACTIVE_STATUSES
        }
      },

      group: ["time"],
      raw: true,
    });

    const mapCount = new Map(
      counts.map(c => [
        c.time,
        Number(c.count)
      ])
    );

    // ✅ เวลาไทย
    const {
      date: today,
      time: nowHHMM
    } = nowBangkok();

    const nowMin = toMinutes(nowHHMM);

    const isToday = date === today;

    const result = slots.map((t) => {

      const booked =
        mapCount.get(t) || 0;

      let remaining = Math.max(
        0,
        service.slotCapacity - booked
      );

      // ✅ ปิดเวลาที่ผ่านแล้ว
      if (
        isToday &&
        toMinutes(t) <= nowMin
      ) {
        remaining = 0;
      }

      return {
        time: t,
        capacity: service.slotCapacity,
        booked,
        remaining,
      };
    });

    res.json({
      serviceId: service.id,
      date,
      slots: result,
    });

  } catch (e) {

    console.error(e);

    res.status(500).json({
      message: e.message
    });
  }
});

/**
 * =========================================================
 * POST /bookings
 * =========================================================
 */
router.post("/", authRequired, async (req, res) => {

  try {

    const userId = req.user.id;

    const {
      serviceId,
      date,
      time,
      note
    } = req.body;

    // =====================================================
    // VALIDATE
    // =====================================================

    if (!serviceId || !date || !time) {
      return res.status(400).json({
        message: "serviceId, date, time required"
      });
    }

    // =====================================================
    // SERVICE
    // =====================================================

    const service = await Service.findByPk(serviceId);

    if (!service || !service.active) {
      return res.status(404).json({
        message: "Service not available"
      });
    }

    // =====================================================
    // HOLIDAY
    // =====================================================

    const isHoliday = await ServiceHoliday.findOne({
      where: {
        service_id: serviceId,
        date,
      },
    });

    const day = new Date(date).getDay();

    const isWeeklyOff =
      await ServiceWeeklyOff.findOne({
        where: {
          service_id: serviceId,
          day_of_week: day,
        },
      });

    if (isHoliday) {
      return res.status(400).json({
        message: "วันนี้บริการปิด (holiday)",
      });
    }

    if (isWeeklyOff) {
      return res.status(400).json({
        message: "วันนี้เป็นวันหยุดประจำ",
      });
    }

    // =====================================================
    // เวลาไทย
    // =====================================================

    const {
      date: today,
      time: nowHHMM
    } = nowBangkok();

    // ห้ามจองย้อนหลัง
    if (date < today) {
      return res.status(400).json({
        message: "Cannot book in the past date"
      });
    }

    // ห้ามจองเวลาย้อนหลัง
    if (
      date === today &&
      toMinutes(time) <= toMinutes(nowHHMM)
    ) {
      return res.status(400).json({
        message: "Cannot book a past time today"
      });
    }

    // =====================================================
    // SLOT
    // =====================================================

    const slots = generateSlots(
      service.dailyStartTime,
      service.dailyEndTime,
      service.slotDurationMin
    );

    if (!slots.includes(time)) {
      return res.status(400).json({
        message: "Invalid time slot"
      });
    }

    // =====================================================
    // CHECK DUPLICATE
    // =====================================================

    const existsMine = await Booking.findOne({
      where: {
        user_id: userId,
        service_id: serviceId,
        date,
        time,

        status: {
          [Op.in]: ACTIVE_STATUSES
        }
      },
    });

    if (existsMine) {
      return res.status(409).json({
        message: "You already booked this slot"
      });
    }

    // =====================================================
    // CHECK FULL
    // =====================================================

    const bookedCount = await Booking.count({
      where: {
        service_id: serviceId,
        date,
        time,

        status: {
          [Op.in]: ACTIVE_STATUSES
        }
      },
    });

    if (bookedCount >= service.slotCapacity) {
      return res.status(409).json({
        message: "Slot is full"
      });
    }

    // =====================================================
    // 🔥 AUTO CONFIRM
    // =====================================================

    let bookingStatus = "pending";

    if (service.autoConfirmEnabled) {
      bookingStatus = "confirmed";
    }

    // =====================================================
    // CREATE BOOKING
    // =====================================================

    const b = await Booking.create({

      user_id: userId,

      service_id: serviceId,

      date,

      time,

      note,

      // ✅ auto confirm
      status: bookingStatus,
    });

    res.status(201).json(b);

  } catch (e) {

    console.error(e);

    res.status(500).json({
      message: e.message
    });
  }
});

/**
 * =========================================================
 * GET /mine
 * =========================================================
 */
router.get("/mine", authRequired, async (req, res) => {

  const list = await Booking.findAll({

    where: {
      user_id: req.user.id
    },

    include: [
      {
        model: Service,
        attributes: ["id", "name"]
      },
    ],

    order: [
      ["date", "DESC"],
      ["time", "DESC"]
    ],
  });

  res.json(list);
});

/**
 * =========================================================
 * PATCH /:id/status
 * =========================================================
 */
router.patch(
  "/:id/status",
  authRequired,
  adminOnly,
  async (req, res) => {

    const { status } = req.body;

    if (
      ![
        "pending",
        "confirmed",
        "checked_in",
        "completed",
        "cancelled",
        "no_show"
      ].includes(status)
    ) {
      return res.status(400).json({
        message: "Invalid status"
      });
    }

    const b = await Booking.findByPk(
      req.params.id
    );

    if (!b) {
      return res.status(404).json({
        message: "Not found"
      });
    }

    b.status = status;

    await b.save();

    res.json(b);
  }
);

/**
 * =========================================================
 * GET /admin
 * =========================================================
 */
router.get(
  "/admin",
  authRequired,
  adminOnly,
  async (req, res) => {

    const {
      date,
      serviceId,
      status
    } = req.query;

    const where = {};

    if (date) {
      where.date = date;
    }

    if (serviceId) {
      where.service_id = serviceId;
    }

    if (status) {
      where.status = status;
    }

    const list = await Booking.findAll({

      where,

      include: [
        {
          model: Service,
          attributes: ["id", "name"]
        },
        {
          model: User,
          attributes: [
            "id",
            "full_name"
          ]
        }
      ],

      order: [
        ["date", "DESC"],
        ["time", "DESC"]
      ],
    });

    res.json(list);
  }
);

export default router;
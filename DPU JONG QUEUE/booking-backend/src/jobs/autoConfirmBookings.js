import cron from "node-cron";
import { Op } from "sequelize";

import Booking from "../models/Booking.js";
import Service from "../models/Service.js";

// รันทุก 1 นาที
cron.schedule("* * * * *", async () => {

  try {

    console.log("AUTO CONFIRM JOB RUNNING");

    // หา booking pending ทั้งหมด
    const bookings = await Booking.findAll({
      where: {
        status: "pending"
      },

      include: [
        {
          model: Service
        }
      ]
    });

    for (const booking of bookings) {

      const service = booking.Service;

      // ไม่เปิด auto confirm
      if (!service?.autoConfirmEnabled) {
        continue;
      }

      // นาทีที่ตั้งไว้
      const confirmMinutes =
        service.autoConfirmMinutes || 0;

      // เวลาสร้าง booking
      const createdAt =
        new Date(booking.createdAt);

      // เวลาปัจจุบัน
      const now = new Date();

      // ต่างกันกี่นาที
      const diffMinutes =
        (now - createdAt) / 1000 / 60;

      // ครบเวลาแล้ว
      if (diffMinutes >= confirmMinutes) {

        booking.status = "confirmed";

        await booking.save();

        console.log(
          `AUTO CONFIRMED #${booking.id}`
        );
      }
    }

  } catch (e) {

    console.error(
      "AUTO CONFIRM ERROR:",
      e
    );
  }
});
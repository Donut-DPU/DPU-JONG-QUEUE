import cron from "node-cron";
import { Op } from "sequelize";

import Booking from "../models/Booking.js";
import Service from "../models/Service.js";

export default function startAutoConfirmJob() {

  console.log("✅ Auto Confirm Job Started");

  cron.schedule("* * * * *", async () => {

    try {

      console.log("⏰ AUTO CONFIRM WORKING");

      const bookings = await Booking.findAll({
        where: {
          status: "pending"
        },

        include: [
          {
            model: Service,
            required: true
          }
        ]
      });

      const now = new Date();

      for (const booking of bookings) {

        const service = booking.Service;

        // ปิดอยู่
        if (!service.autoConfirmEnabled) {
          continue;
        }

        const minutes =
          service.autoConfirmMinutes || 0;

        // เวลาสร้าง booking
        const createdAt =
          new Date(booking.createdAt);

        // เวลาที่ต้อง confirm
        const confirmTime =
          new Date(
            createdAt.getTime() +
            minutes * 60 * 1000
          );

        // ถึงเวลาแล้ว
        if (now >= confirmTime) {

          booking.status = "confirmed";

          await booking.save();

          console.log(
            `✅ AUTO CONFIRMED #${booking.id}`
          );
        }
      }

    } catch (e) {

      console.error(
        "AUTO CONFIRM ERROR:",
        e.message
      );
    }

  });

}
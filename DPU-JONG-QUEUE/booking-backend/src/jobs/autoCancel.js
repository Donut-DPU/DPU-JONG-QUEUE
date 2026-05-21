import { Op } from "sequelize";
import Booking from "../models/Booking.js";
import Service from "../models/Service.js";

export default function startAutoCancelJob() {
  setInterval(async () => {
    try {
      const now = new Date();

      const today = now.toISOString().slice(0, 10); // YYYY-MM-DD
      const currentMinutes = now.getHours() * 60 + now.getMinutes();

      const list = await Booking.findAll({
        where: {
          date: { [Op.lte]: today },
          status: { [Op.in]: ["pending", "confirmed"] },
        },
        include: [{ model: Service }],
      });

      for (const b of list) {
        try {
          // ❌ ไม่มี service → ข้าม
          if (!b.Service) continue;

          // ❌ ไม่เปิด auto cancel → ข้าม
          if (!b.Service.autoCancelEnabled) continue;

          const cancelMin = b.Service.autoCancelMinutes || 10;

          // ✅ กรณี "วันก่อนหน้า" → no_show ทันที
          if (b.date < today) {
            b.status = "no_show";
            await b.save();
            continue;
          }

          // ❌ ไม่มีเวลา → ข้ามกันพัง
          if (!b.time) continue;

          const [h, m] = b.time.split(":").map(Number);

          // ❌ parse ไม่ได้ → ข้าม
          if (isNaN(h) || isNaN(m)) continue;

          const bookingMinutes = h * 60 + m;
          const expireMinutes = bookingMinutes + cancelMin;

          // ✅ เลทเกิน → ยกเลิก
          if (currentMinutes > expireMinutes) {
            b.status = "no_show";
            await b.save();
          }
        } catch (err) {
          console.error("booking loop error:", err.message);
        }
      }
    } catch (e) {
      console.error("autoCancel error:", e.message);
    }
  }, 60 * 1000);
}
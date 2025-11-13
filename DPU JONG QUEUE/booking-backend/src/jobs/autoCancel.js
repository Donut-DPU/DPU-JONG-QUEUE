import { Op } from "sequelize";
import Booking from "../models/Booking.js";
import Service from "../models/Service.js";

// ทำทุก 1 นาที: ถ้าเวลานัด + 10 นาที < ตอนนี้ และสถานะยังไม่เข้าใช้งาน → no_show
export default function startAutoCancelJob() {
  setInterval(async () => {
    try {
      const now = new Date();
      const today = now.toISOString().slice(0,10); // YYYY-MM-DD
      const hh = now.getHours().toString().padStart(2,'0');
      const mm = now.getMinutes().toString().padStart(2,'0');
      const currentHHMM = `${hh}:${mm}`;

      // หา booking วันนี้ที่ยังไม่นับว่าเสร็จ และยังไม่ได้ cancel
      const list = await Booking.findAll({
        where: {
          date: { [Op.lte]: today },
          status: { [Op.in]: ["pending","confirmed"] }
        },
        include: [{ model: Service }],
      });

      for (const b of list) {
        // ถ้านัดหมายเป็นวันก่อนหน้า → ถือว่า no_show ทันที
        if (b.date < today) {
          b.status = "no_show";
          await b.save();
          continue;
        }
        // ถ้าวันนี้: เช็คว่าเลยเวลา slot + 10 นาที
        const [h, m] = b.time.split(":").map(Number);
        const slotEndMin = h*60 + m + 10; // 10 นาที grace
        const curMin = Number(hh)*60 + Number(mm);
        if (curMin > slotEndMin) {
          b.status = "no_show";
          await b.save();
        }
      }
    } catch (e) {
      console.error("autoCancel error:", e.message);
    }
  }, 60 * 1000);
}

export function toMinutes(hhmm) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}
export function toHHMM(mins) {
  const h = Math.floor(mins / 60).toString().padStart(2, "0");
  const m = (mins % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}

// สร้าง slot รายวันจาก start..end ด้วยความยาว slotDurationMin
export function generateSlots(dailyStartTime, dailyEndTime, slotDurationMin) {
  const start = toMinutes(dailyStartTime);
  const end   = toMinutes(dailyEndTime);
  const out = [];
  for (let t = start; t + slotDurationMin <= end; t += slotDurationMin) {
    out.push(toHHMM(t)); // เวลาเริ่มต้นของ slot
  }
  return out;
}

<!-- src/pages/admin/AdminWeekViewPage.vue -->
<template>
  <div>
    <!-- หัวข้อ + ตัวเลือกสัปดาห์ -->
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-2xl font-bold">ตรวจสอบคิวว่าง</h2>

      <div class="flex items-center gap-2">
        <v-btn variant="text" @click="changeWeek(-1)">
          สัปดาห์ก่อนหน้า
        </v-btn>

        <div class="font-medium">
          {{ formatWeekRange(weekStart, weekEnd) }}
        </div>

        <v-btn variant="text" @click="changeWeek(1)">
          สัปดาห์ถัดไป
        </v-btn>

        <!-- เลือกวันที่ (เพื่อกระโดดไปเดือน/สัปดาห์อื่น) -->
        <v-menu v-model="dateMenu" :close-on-content-click="false">
          <template #activator="{ props }">
            <v-btn v-bind="props" variant="outlined" size="small">
              เลือกวันที่
            </v-btn>
          </template>
          <v-card>
            <v-date-picker
              v-model="pickerDate"
              @update:model-value="onPickDate"
              title="เลือกวันที่ในสัปดาห์ที่ต้องการ"
            />
          </v-card>
        </v-menu>
      </div>
    </div>

    <v-alert
      v-if="errorMsg"
      type="error"
      variant="tonal"
      class="mb-3"
      :text="errorMsg"
      closable
      @click:close="errorMsg = ''"
    />

    <v-progress-linear
      v-if="loading"
      indeterminate
      class="mb-3"
    />

    <!-- แท็บ 7 วันในสัปดาห์ -->
    <v-tabs
      v-model="activeDayIndex"
      class="mb-3"
      grow
      density="comfortable"
    >
      <v-tab
        v-for="(d, idx) in daysOfWeek"
        :key="d.iso"
        :value="idx"
      >
        {{ d.labelShort }} {{ d.day }}
      </v-tab>
    </v-tabs>

    <!-- เนื้อหาของแต่ละวัน -->
    <v-window v-model="activeDayIndex">
      <v-window-item
        v-for="(d, idx) in daysOfWeek"
        :key="d.iso"
        :value="idx"
      >
        <v-card elevation="1">
          <v-card-title class="text-base font-bold px-4 py-3">
            ตารางคิววันที่ {{ formatThaiDate(d.date) }}
          </v-card-title>

          <v-card-text class="px-0 pt-0 pb-4">
            <v-table density="comfortable" class="queue-table">
              <thead>
                <tr>
                  <th class="sticky-col-left">บริการ</th>
                  <th
                    v-for="t in timeSlotsForDay(d.iso)"
                    :key="t"
                    class="text-center"
                  >
                    {{ t }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="s in services" :key="s.id">
                  <td class="sticky-col-left service-cell">
                    {{ s.name }}
                  </td>

                  <td
                    v-for="t in timeSlotsForDay(d.iso)"
                    :key="t"
                    class="text-center slot-cell"
                  >
                    <span v-if="slotInfo(d.iso, s.id, t)">
                      <span
                        :class="[
                          'badge',
                          badgeClass(slotInfo(d.iso, s.id, t))
                        ]"
                      >
                        {{
                          slotLabel(slotInfo(d.iso, s.id, t))
                        }}
                      </span>
                    </span>
                    <span v-else class="text-muted">—</span>
                  </td>
                </tr>

                <tr v-if="!services.length">
                  <td colspan="99" class="text-center py-4">
                    ยังไม่มีบริการ
                  </td>
                </tr>
              </tbody>
            </v-table>
          </v-card-text>
        </v-card>
      </v-window-item>
    </v-window>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { api } from '@/api/http'

/* ---------- state หลัก ---------- */
const loading = ref(false)
const errorMsg = ref('')

const services = ref([])   // รายการบริการทั้งหมด
const weekStart = ref(startOfWeek(new Date())) // Date object
const dateMenu = ref(false)
const pickerDate = ref(new Date())
const activeDayIndex = ref(0)

// slotsMap[ '2025-11-23' ][ serviceId ] = array slots
const slotsMap = ref({})

/* ---------- โหลดบริการ + slot รายสัปดาห์ ---------- */

async function loadServices () {
  services.value = await api('/api/services?all=1')
}

async function loadWeekSlots () {
  loading.value = true
  errorMsg.value = ''
  slotsMap.value = {}

  try {
    // เตรียมวันทั้งสัปดาห์
    const days = daysOfWeekComputed.value

    // เรียก API /slots สำหรับวัน x service ทุกตัว
    const tasks = []
    for (const d of days) {
      const iso = d.iso
      for (const s of services.value) {
        const url = `/api/bookings/slots?serviceId=${s.id}&date=${iso}`
        tasks.push(
          api(url).then(res => {
            if (!slotsMap.value[iso]) slotsMap.value[iso] = {}
            slotsMap.value[iso][s.id] = res.slots || []
          })
        )
      }
    }
    await Promise.all(tasks)
  } catch (e) {
    errorMsg.value = e.message || 'ไม่สามารถโหลดข้อมูลตารางคิวได้'
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await loadServices()
  await loadWeekSlots()
})

/* ---------- คำนวณวันในสัปดาห์ ---------- */

const daysOfWeekComputed = computed(() => {
  const start = weekStart.value
  const days = []
  for (let i = 0; i < 7; i++) {
    const d = addDays(start, i)
    days.push({
      date: d,
      iso: toIsoDate(d),
      day: d.getDate().toString().padStart(2, '0'),
      labelShort: thaiWeekdayShort(d.getDay())
    })
  }
  return days
})

const daysOfWeek = daysOfWeekComputed

const weekEnd = computed(() => addDays(weekStart.value, 6))

/* ---------- slot & time header ---------- */

// รวม time slot ของวันหนึ่ง ๆ จากทุก service
function timeSlotsForDay (iso) {
  const mapByService = slotsMap.value[iso] || {}
  const set = new Set()
  for (const sid of Object.keys(mapByService)) {
    for (const slot of mapByService[sid] || []) {
      set.add(slot.time) // HH:mm
    }
  }
  // เรียงเวลา
  return Array.from(set).sort()
}

function slotInfo (iso, serviceId, time) {
  const dayMap = slotsMap.value[iso]
  if (!dayMap) return null
  const arr = dayMap[serviceId] || []
  return arr.find(s => s.time === time) || null
}

function slotLabel (slot) {
  if (!slot) return ''
  if (slot.remaining === 0) return 'เต็ม'
  if (slot.booked === 0) return 'ว่าง'
  return `เหลือ ${slot.remaining}`
}

function badgeClass (slot) {
  if (!slot) return ''
  if (slot.remaining === 0) return 'badge-full'
  if (slot.booked === 0) return 'badge-free'
  return 'badge-part'
}

/* ---------- เปลี่ยนสัปดาห์ / เลือกวันที่ ---------- */

function changeWeek (delta) {
  weekStart.value = addDays(weekStart.value, delta * 7)
  activeDayIndex.value = 0
  loadWeekSlots()
  pickerDate.value = weekStart.value
}

function onPickDate (val) {
  // val เป็น Date หรือ string แล้วแต่ Vuetify config
  const d = val instanceof Date ? val : new Date(val)
  weekStart.value = startOfWeek(d)
  activeDayIndex.value = 0
  dateMenu.value = false
  loadWeekSlots()
}

function formatWeekRange (start, end) {
  return `${formatThaiDate(start)} - ${formatThaiDate(end)}`
}

/* ---------- helper วันที่ ---------- */

function startOfWeek (date) {
  // กำหนดให้วันจันทร์เป็นวันแรกของสัปดาห์
  const d = new Date(date)
  const day = d.getDay() || 7 // Sunday=0 → 7
  if (day !== 1) {
    d.setDate(d.getDate() - (day - 1))
  }
  d.setHours(0, 0, 0, 0)
  return d
}

function addDays (date, num) {
  const d = new Date(date)
  d.setDate(d.getDate() + num)
  return d
}

function toIsoDate (date) {
  const y = date.getFullYear()
  const m = (date.getMonth() + 1).toString().padStart(2, '0')
  const d = date.getDate().toString().padStart(2, '0')
  return `${y}-${m}-${d}`
}

function formatThaiDate (date) {
  const d = date instanceof Date ? date : new Date(date)
  return d.toLocaleDateString('th-TH', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

function thaiWeekdayShort (w) {
  // 0=Sun
  const arr = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส']
  return arr[w] ?? ''
}
</script>

<style scoped>
.flex { display: flex; }
.items-center { align-items: center; }
.justify-between { justify-content: space-between; }
.gap-2 { gap: 0.5rem; }
.mb-3 { margin-bottom: .75rem; }
.mb-4 { margin-bottom: 1rem; }
.text-2xl { font-size: 1.5rem; }
.font-bold { font-weight: 700; }
.font-medium { font-weight: 500; }

.queue-table {
  white-space: nowrap;
  font-size: 13px;
}

/* ทำให้คอลัมน์ “บริการ” ติดซ้ายเวลาสกรอลล์แนวนอน (ถ้าตารางกว้าง) */
.sticky-col-left {
  position: sticky;
  left: 0;
  background: #ffffff;
  z-index: 1;
}

/* cell บริการ */
.service-cell {
  font-weight: 500;
}

/* ช่อง slot */
.slot-cell {
  min-width: 72px;
}

/* badge สถานะ */
.badge {
  display: inline-block;
  padding: 2px 6px;
  border-radius: 999px;
  font-size: 12px;
}

.badge-free {
  background: #e0f7e9;
  color: #166534;
}

.badge-part {
  background: #e0ecff;
  color: #1d4ed8;
}

.badge-full {
  background: #fee2e2;
  color: #b91c1c;
}

.text-muted {
  color: #9ca3af;
}
</style>

<!-- src/pages/admin/AdminWeekViewPage.vue -->
<template>
  <div>

    <!-- ================= LOADING OVERLAY ================= -->
    <transition name="fade">
      <div
        v-if="loading"
        class="loading-overlay"
      >
        <div class="loading-card">

          <v-progress-circular
            indeterminate
            size="70"
            width="6"
            color="primary"
          />

          <div class="loading-title">
            กำลังโหลดข้อมูลคิว
          </div>

          <div class="loading-subtitle">
            กรุณารอสักครู่...
          </div>

        </div>
      </div>
    </transition>

    <!-- หัวข้อ + ตัวเลือกสัปดาห์ -->
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-2xl font-bold">
        ตรวจสอบคิวว่าง
      </h2>

      <div class="flex items-center gap-2">

        <v-btn
          variant="text"
          @click="changeWeek(-1)"
        >
          สัปดาห์ก่อนหน้า
        </v-btn>

        <div class="font-medium">
          {{ formatWeekRange(weekStart, weekEnd) }}
        </div>

        <v-btn
          variant="text"
          @click="changeWeek(1)"
        >
          สัปดาห์ถัดไป
        </v-btn>

        <!-- เลือกวันที่ -->
        <v-menu
          v-model="dateMenu"
          :close-on-content-click="false"
        >
          <template #activator="{ props }">

            <v-btn
              v-bind="props"
              variant="outlined"
              size="small"
            >
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

    <!-- แท็บวัน -->
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
        {{ d.labelShort }}
        {{ d.day }}
      </v-tab>

    </v-tabs>

    <!-- ตาราง -->
    <v-window v-model="activeDayIndex">

      <v-window-item
        v-for="(d, idx) in daysOfWeek"
        :key="d.iso"
        :value="idx"
      >

        <v-card
          elevation="1"
          class="table-card"
        >

          <v-card-title class="text-base font-bold px-4 py-3">
            ตารางคิววันที่
            {{ formatThaiDate(d.date) }}
          </v-card-title>

          <v-card-text class="px-0 pt-0 pb-4">

            <v-table
              density="comfortable"
              class="queue-table"
            >

              <thead>
                <tr>

                  <th class="sticky-col-left">
                    บริการ
                  </th>

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

                <tr
                  v-for="s in services"
                  :key="s.id"
                >

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
                          badgeClass(
                            slotInfo(d.iso, s.id, t),
                            d.iso
                          )
                        ]"
                      >
                        {{
                          slotLabel(
                            slotInfo(d.iso, s.id, t),
                            d.iso
                          )
                        }}
                      </span>

                    </span>

                    <span
                      v-else
                      class="text-muted"
                    >
                      —
                    </span>

                  </td>

                </tr>

                <tr v-if="!services.length">

                  <td
                    colspan="99"
                    class="text-center py-4"
                  >
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
import {
  ref,
  computed,
  onMounted
} from 'vue'

import { api } from '@/api/http'

/* ---------- state ---------- */

const loading = ref(false)

const errorMsg = ref('')

const services = ref([])

const weekStart = ref(
  startOfWeek(new Date())
)

const dateMenu = ref(false)

const pickerDate = ref(new Date())

const activeDayIndex = ref(0)

// slotsMap[date][serviceId]
const slotsMap = ref({})

/* ---------- โหลดข้อมูล ---------- */

async function loadServices () {

  services.value =
    await api('/api/services?all=1')
}

async function loadWeekSlots () {

  loading.value = true

  errorMsg.value = ''

  slotsMap.value = {}

  try {

    const days =
      daysOfWeekComputed.value

    const tasks = []

    for (const d of days) {

      const iso = d.iso

      for (const s of services.value) {

        const url =
          `/api/bookings/slots?serviceId=${s.id}&date=${iso}`

        tasks.push(

          api(url).then(res => {

            if (!slotsMap.value[iso]) {

              slotsMap.value[iso] = {}
            }

            slotsMap.value[iso][s.id] =
              res.slots || []
          })

        )
      }
    }

    await Promise.all(tasks)

  } catch (e) {

    errorMsg.value =
      e.message ||
      'ไม่สามารถโหลดข้อมูลตารางคิวได้'

  } finally {

    loading.value = false
  }
}

onMounted(async () => {

  await loadServices()

  await loadWeekSlots()

})

/* ---------- วันในสัปดาห์ ---------- */

const daysOfWeekComputed = computed(() => {

  const start = weekStart.value

  const days = []

  for (let i = 0; i < 7; i++) {

    const d = addDays(start, i)

    days.push({
      date: d,
      iso: toIsoDate(d),
      day: d
        .getDate()
        .toString()
        .padStart(2, '0'),
      labelShort:
        thaiWeekdayShort(d.getDay())
    })
  }

  return days
})

const daysOfWeek =
  daysOfWeekComputed

const weekEnd = computed(() => {

  return addDays(
    weekStart.value,
    6
  )
})

/* ---------- time slots ---------- */

function timeSlotsForDay (iso) {

  const mapByService =
    slotsMap.value[iso] || {}

  const set = new Set()

  for (const sid of Object.keys(mapByService)) {

    for (
      const slot of mapByService[sid] || []
    ) {

      set.add(slot.time)
    }
  }

  return Array
    .from(set)
    .sort()
}

function slotInfo (
  iso,
  serviceId,
  time
) {

  const dayMap =
    slotsMap.value[iso]

  if (!dayMap) return null

  const arr =
    dayMap[serviceId] || []

  return arr.find(
    s => s.time === time
  ) || null
}

/* ---------- label ---------- */

function slotLabel (
  slot,
  isoDate
) {

  if (!slot) return ''

  const total =
    slot.max ||
    slot.capacity ||
    (
      slot.booked +
      slot.remaining
    )

  const current =
    `${slot.booked}/${total}`

  const passed =
    isPastSlot(
      isoDate,
      slot.time
    )

  // เลยเวลาจอง
  if (
    passed &&
    slot.booked === 0
  ) {

    return `${current} เลยเวลาจอง`
  }

  // เต็ม
  if (slot.remaining === 0) {

    return `${current} เต็ม`
  }

  // ว่าง
  return `${current} ว่าง`
}

/* ---------- สี ---------- */

function badgeClass (
  slot,
  isoDate
) {

  if (!slot) return ''

  const passed =
    isPastSlot(
      isoDate,
      slot.time
    )

  // เลยเวลาจอง
  if (
    passed &&
    slot.booked === 0
  ) {

    return 'badge-expired'
  }

  // เต็ม
  if (slot.remaining === 0) {

    return 'badge-full'
  }

  // ว่าง
  return 'badge-free'
}

/* ---------- ตรวจเวลา ---------- */

function isPastSlot (
  isoDate,
  time
) {

  const now = new Date()

  const slotDate =
    new Date(
      `${isoDate}T${time}:00`
    )

  return slotDate < now
}

/* ---------- เปลี่ยนสัปดาห์ ---------- */

function changeWeek (delta) {

  weekStart.value =
    addDays(
      weekStart.value,
      delta * 7
    )

  activeDayIndex.value = 0

  loadWeekSlots()

  pickerDate.value =
    weekStart.value
}

function onPickDate (val) {

  const d =
    val instanceof Date
      ? val
      : new Date(val)

  weekStart.value =
    startOfWeek(d)

  activeDayIndex.value = 0

  dateMenu.value = false

  loadWeekSlots()
}

function formatWeekRange (
  start,
  end
) {

  return `${formatThaiDate(start)} - ${formatThaiDate(end)}`
}

/* ---------- helper ---------- */

function startOfWeek (date) {

  const d =
    new Date(date)

  const day =
    d.getDay() || 7

  if (day !== 1) {

    d.setDate(
      d.getDate() - (day - 1)
    )
  }

  d.setHours(0, 0, 0, 0)

  return d
}

function addDays (
  date,
  num
) {

  const d =
    new Date(date)

  d.setDate(
    d.getDate() + num
  )

  return d
}

function toIsoDate (date) {

  const y =
    date.getFullYear()

  const m =
    (date.getMonth() + 1)
      .toString()
      .padStart(2, '0')

  const d =
    date
      .getDate()
      .toString()
      .padStart(2, '0')

  return `${y}-${m}-${d}`
}

function formatThaiDate (date) {

  const d =
    date instanceof Date
      ? date
      : new Date(date)

  return d.toLocaleDateString(
    'th-TH',
    {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }
  )
}

function thaiWeekdayShort (w) {

  const arr = [
    'อา',
    'จ',
    'อ',
    'พ',
    'พฤ',
    'ศ',
    'ส'
  ]

  return arr[w] ?? ''
}
</script>

<style scoped>
.flex {
  display: flex;
}

.items-center {
  align-items: center;
}

.justify-between {
  justify-content: space-between;
}

.gap-2 {
  gap: 0.5rem;
}

.mb-3 {
  margin-bottom: .75rem;
}

.mb-4 {
  margin-bottom: 1rem;
}

.text-2xl {
  font-size: 1.5rem;
}

.font-bold {
  font-weight: 700;
}

.font-medium {
  font-weight: 500;
}

/* ================= LOADING ================= */

.loading-overlay {
  position: fixed;
  inset: 0;

  background:
    rgba(255,255,255,0.82);

  backdrop-filter: blur(5px);

  display: flex;
  align-items: center;
  justify-content: center;

  z-index: 9999;
}

.loading-card {
  background: white;

  padding: 32px 42px;

  border-radius: 24px;

  box-shadow:
    0 10px 35px rgba(0,0,0,0.12);

  display: flex;
  flex-direction: column;
  align-items: center;

  min-width: 260px;
}

.loading-title {
  margin-top: 18px;

  font-size: 18px;
  font-weight: 700;

  color: #111827;
}

.loading-subtitle {
  margin-top: 6px;

  font-size: 14px;

  color: #6b7280;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity .2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* ================= TABLE ================= */

.table-card {
  border-radius: 18px;
  overflow: hidden;
}

.queue-table {
  white-space: nowrap;
  font-size: 13px;
}

/* sticky */
.sticky-col-left {
  position: sticky;

  left: 0;

  background: #ffffff;

  z-index: 1;
}

/* service */
.service-cell {
  font-weight: 500;
}

/* slot */
.slot-cell {
  min-width: 150px;
}

/* badge */
.badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;

  min-width: 115px;

  padding: 5px 12px;

  border-radius: 999px;

  font-size: 12px;
  font-weight: 700;

  text-align: center;

  transition: all .2s ease;
}

/* ว่าง */
.badge-free {
  background: #dcfce7;
  color: #166534;
}

/* เต็ม */
.badge-full {
  background: #fee2e2;
  color: #b91c1c;
}

/* เลยเวลาจอง */
.badge-expired {
  background: #fef3c7;
  color: #92400e;
}

.text-muted {
  color: #9ca3af;
}
</style>
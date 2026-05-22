<template>
  <v-dialog v-model="visible" max-width="560" persistent>
    <v-card class="booking-card">

      <v-card-title class="text-h6 font-weight-bold">
        จองบริการ: {{ service?.name }}
      </v-card-title>

      <v-card-text>

        <!-- SERVICE INFO -->
        <div class="service-info mb-3">
          <div>
            <v-icon size="18">mdi-clock-outline</v-icon>
            เวลาให้บริการ:
            {{ service.dailyStartTime }} - {{ service.dailyEndTime }}
          </div>

          <div>
            <v-icon size="18">mdi-timer-outline</v-icon>
            ระยะต่อคิว {{ service.slotDurationMin }} นาที
          </div>

          <div>
            <v-icon size="18">mdi-account-group-outline</v-icon>
            รับต่อ slot {{ service.slotCapacity }} คน
          </div>
        </div>

        <!-- DATE -->
        <v-text-field
          v-model="date"
          type="date"
          :min="today"
          label="เลือกวันที่"
          density="comfortable"
          class="mb-3"
          hint="เลือกย้อนหลังไม่ได้ และเวลาที่ผ่านมาแล้วของวันนี้จะถูกปิด"
          persistent-hint
          prepend-inner-icon="mdi-calendar"
          variant="outlined"
        />

        <!-- LOAD SLOT -->
        <div class="flex items-center gap mb-3">

          <v-btn
            @click="loadSlots"
            :loading="loading"
            color="primary"
            class="reload-btn"
          >
            <v-icon start>
              mdi-refresh
            </v-icon>

            ตรวจสอบคิวว่าง
          </v-btn>

          <span
            v-if="!slots.length && !loading && !isHoliday"
            class="text-gray-600"
          >
            เลือกวันที่แล้วกด “ตรวจสอบคิวว่าง”
          </span>

        </div>

        <!-- HOLIDAY -->
        <div v-if="isHoliday" class="holiday-box mb-3">
          <v-icon color="error">
            mdi-calendar-remove
          </v-icon>

          {{ holidayMessage }}
        </div>

        <!-- SLOT -->
        <div v-if="slots.length && !isHoliday">

          <div class="slot-title mb-2">
            เลือกเวลานัดหมาย
          </div>

          <!-- SLOT GRID -->
          <div class="slot-grid">

            <div
              v-for="s in slotsSorted"
              :key="s.time"
              class="slot-card"
              :class="{
                active: time === s.time,
                full: s.remaining <= 0,
                expired: s.remaining <= 0
              }"
              @click="selectSlot(s)"
            >

              <!-- TIME -->
              <div class="slot-time">
                <v-icon size="18">
                  mdi-clock-time-four-outline
                </v-icon>

                {{ s.time }}
              </div>

              <!-- STATUS -->
              <div
                v-if="s.remaining > 0"
                class="slot-available"
              >
                <v-icon size="16">
                  mdi-check-circle
                </v-icon>

                คิวว่าง {{ s.remaining }}
              </div>

              <div
                v-else
                class="slot-full"
              >
                <v-icon size="16">
                  mdi-close-circle
                </v-icon>

                คิวเต็ม / เลยเวลานัด
              </div>

            </div>

          </div>

        </div>

        <!-- NOTE -->
        <v-textarea
          v-model="note"
          label="หมายเหตุ (ถ้ามี)"
          auto-grow
          rows="2"
          class="mt-3"
          variant="outlined"
        />

      </v-card-text>

      <v-card-actions class="justify-end">

        <v-btn
          variant="text"
          @click="$emit('close')"
        >
          ปิด
        </v-btn>

        <v-btn
          color="primary"
          :disabled="!time || isHoliday"
          :loading="booking"
          @click="book"
        >
          ยืนยันการจอง
        </v-btn>

      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- ✅ CUSTOM ERROR DIALOG -->
  <v-dialog
    v-model="errorDialog"
    max-width="420"
  >
    <v-card class="rounded-xl">

      <v-card-title class="text-h6 text-error">
        แจ้งเตือน
      </v-card-title>

      <v-card-text>
        {{ errorMessage }}
      </v-card-text>

      <v-card-actions class="justify-end">
        <v-btn
          color="primary"
          @click="errorDialog = false"
        >
          ตกลง
        </v-btn>
      </v-card-actions>

    </v-card>
  </v-dialog>
</template>

<script setup>
import {
  ref,
  computed,
  watch
} from 'vue'

import { api } from '@/api/http'

const props = defineProps({
  service: {
    type: Object,
    required: true
  }
})

const emit = defineEmits([
  'close',
  'booked'
])

const visible = ref(true)

/* =========================
   CUSTOM DIALOG
========================= */

const errorDialog = ref(false)
const errorMessage = ref('')

function showError(message) {
  errorMessage.value = message
  errorDialog.value = true
}

/* =========================
   HOLIDAY STATE
========================= */

const isHoliday = ref(false)
const holidayMessage = ref("")

/* =========================
   เวลาไทย
========================= */

function todayBangkok() {

  const f = new Intl.DateTimeFormat(
    'en-GB',
    {
      timeZone: 'Asia/Bangkok',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }
  )

  const parts = Object.fromEntries(
    f.formatToParts(new Date())
      .map(p => [p.type, p.value])
  )

  return `${parts.year}-${parts.month}-${parts.day}`
}

const today = todayBangkok()

/* =========================
   STATE
========================= */

const date = ref(today)

const time = ref(null)

const note = ref('')

const slots = ref([])

const loading = ref(false)

const booking = ref(false)

/* =========================
   WATCH SERVICE
========================= */

watch(
  () => props.service,
  async () => {

    date.value = today

    time.value = null

    note.value = ''

    slots.value = []

    isHoliday.value = false

    holidayMessage.value = ""

    await loadSlots()
  },
  {
    immediate: true
  }
)

/* =========================
   SORT SLOT
========================= */

const slotsSorted = computed(() =>
  [...slots.value]
    .sort((a, b) =>
      a.time.localeCompare(b.time)
    )
)

/* =========================
   SELECT SLOT
========================= */

function selectSlot(slot) {

  if (slot.remaining <= 0) {
    return
  }

  time.value = slot.time
}

/* =========================
   LOAD SLOT
========================= */

async function loadSlots() {

  if (!date.value) {
    return showError('โปรดเลือกวันที่')
  }

  if (date.value < today) {
    return showError('เลือกย้อนหลังไม่ได้')
  }

  loading.value = true

  time.value = null

  try {

    const res = await api(
      `/api/bookings/slots?serviceId=${props.service.id}&date=${date.value}`
    )

    slots.value = res.slots || []

    // holiday
    if (res.reason === "holiday") {

      isHoliday.value = true

      holidayMessage.value =
        "❌ วันนี้เป็นวันหยุดพิเศษ"

    }
    else if (res.reason === "weekly_off") {

      isHoliday.value = true

      holidayMessage.value =
        "❌ วันนี้เป็นวันหยุดประจำ"

    }
    else {

      isHoliday.value = false

      holidayMessage.value = ""
    }

  } catch (e) {

    if (
      (e.message || '').includes('401') ||
      (e.message || '')
        .toLowerCase()
        .includes('unauthorized')
    ) {

      showError(
        'เซสชันหมดอายุ โปรดเข้าสู่ระบบใหม่'
      )

      window.location.href = '/login'

      return
    }

    showError(
      e.message || 'โหลดเวลาไม่สำเร็จ'
    )

  } finally {

    loading.value = false
  }
}

/* =========================
   BOOK
========================= */

async function book() {

  if (!time.value) {
    return showError('โปรดเลือกเวลา')
  }

  if (date.value < today) {
    return showError('เลือกย้อนหลังไม่ได้')
  }

  if (isHoliday.value) {
    return showError('วันนี้ไม่สามารถจองได้')
  }

  booking.value = true

  try {

    const b = await api(
      '/api/bookings',
      {
        method: 'POST',
        body: {
          serviceId: props.service.id,
          date: date.value,
          time: time.value,
          note: note.value || undefined
        }
      }
    )

    await loadSlots()

    emit('booked', b)

    emit('close')

  } catch (e) {

    if (
      (e.message || '').includes('401') ||
      (e.message || '')
        .toLowerCase()
        .includes('unauthorized')
    ) {

      showError(
        'เซสชันหมดอายุ โปรดเข้าสู่ระบบใหม่'
      )

      window.location.href = '/login'

      return
    }

    showError(
      e.message || 'จองไม่สำเร็จ'
    )

  } finally {

    booking.value = false
  }
}
</script>

<style scoped>
.booking-card{
  border-radius:20px;
  overflow:hidden;
}

.w-full{
  width:100%;
}

.text-gray-600{
  color:#6b7280;
}

.text-red{
  color:#dc2626;
}

.justify-end{
  justify-content:flex-end;
  display:flex;
}

.mb-1{
  margin-bottom:.25rem;
}

.mb-2{
  margin-bottom:.5rem;
}

.mb-3{
  margin-bottom:.75rem;
}

.mt-3{
  margin-top:.75rem;
}

.flex{
  display:flex;
}

.items-center{
  align-items:center;
}

.gap{
  gap:12px;
}

/* SERVICE INFO */
.service-info{
  background:#f8fafc;
  border:1px solid #e2e8f0;
  border-radius:14px;
  padding:14px;
  display:flex;
  flex-direction:column;
  gap:8px;
  font-size:14px;
}

/* HOLIDAY */
.holiday-box{
  background:#fef2f2;
  border:1px solid #fecaca;
  color:#dc2626;
  border-radius:12px;
  padding:14px;
  display:flex;
  align-items:center;
  gap:10px;
  font-weight:600;
}

/* TITLE */
.slot-title{
  font-weight:700;
  font-size:15px;
  color:#111827;
}

/* GRID */
.slot-grid{
  display:grid;
  grid-template-columns:repeat(2, 1fr);
  gap:12px;
}

/* SLOT CARD */
.slot-card{
  border:2px solid #e5e7eb;
  border-radius:16px;
  padding:14px;
  cursor:pointer;
  transition:all .2s ease;
  background:#fff;
}

.slot-card:hover{
  transform:translateY(-2px);
  border-color:#2563eb;
  box-shadow:0 6px 18px rgba(37,99,235,.12);
}

/* ACTIVE */
.slot-card.active{
  border-color:#2563eb;
  background:#eff6ff;
  box-shadow:0 0 0 3px rgba(37,99,235,.15);
}

/* FULL */
.slot-card.full{
  opacity:.7;
  cursor:not-allowed;
  background:#f9fafb;
  border-color:#e5e7eb;
}

.slot-card.full:hover{
  transform:none;
  box-shadow:none;
}

/* TIME */
.slot-time{
  font-size:18px;
  font-weight:700;
  color:#111827;
  display:flex;
  align-items:center;
  gap:6px;
  margin-bottom:8px;
}

/* AVAILABLE */
.slot-available{
  display:flex;
  align-items:center;
  gap:6px;
  color:#16a34a;
  font-weight:600;
  font-size:14px;
}

/* FULL TEXT */
.slot-full{
  display:flex;
  align-items:center;
  gap:6px;
  color:#dc2626;
  font-weight:600;
  font-size:14px;
}

/* BUTTON */
.reload-btn{
  text-transform:none;
  font-weight:600;
}

@media (max-width:600px){

  .slot-grid{
    grid-template-columns:1fr;
  }

}
</style>
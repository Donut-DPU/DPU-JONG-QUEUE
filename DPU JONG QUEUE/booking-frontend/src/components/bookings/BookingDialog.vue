<template>
  <v-dialog v-model="visible" max-width="560" persistent>
    <v-card>
      <v-card-title class="text-h6">
        จองบริการ: {{ service?.name }}
      </v-card-title>

      <v-card-text>

        <div class="text-gray-600 mb-3">
          เวลาให้บริการ:
          {{ service.dailyStartTime }} - {{ service.dailyEndTime }}
          · ระยะต่อคิว {{ service.slotDurationMin }} นาที
          · รับต่อ slot {{ service.slotCapacity }} คน
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
        />

        <!-- LOAD SLOT -->
        <div class="flex items-center gap mb-3">
          <v-btn @click="loadSlots" :loading="loading">
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
        <div v-if="isHoliday" class="text-red mb-3">
          {{ holidayMessage }}
        </div>

        <!-- SLOT -->
        <div v-if="slots.length && !isHoliday">

          <div class="mb-2">
            เลือกเวลา:
          </div>

          <v-radio-group
            v-model="time"
            :mandatory="true"
            class="w-full"
          >
            <div
              v-for="s in slotsSorted"
              :key="s.time"
              class="mb-1"
            >
              <v-radio
                :label="`${s.time} — ${remainingLabel(s.remaining)}`"
                :value="s.time"
                :disabled="s.remaining <= 0"
                density="comfortable"
              />
            </div>
          </v-radio-group>

        </div>

        <!-- NOTE -->
        <v-textarea
          v-model="note"
          label="หมายเหตุ (ถ้ามี)"
          auto-grow
          rows="2"
          class="mt-3"
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
    <v-card>

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
   LABEL
========================= */

function remainingLabel(n) {

  if (n <= 0) {
    return 'เต็มแล้ว'
  }

  if (n === 1) {
    return 'คิวว่าง 1'
  }

  return `คิวว่าง ${n}`
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

    // ✅ ตรงนี้คือจุดสำคัญ
    // ไม่ใช้ alert แล้ว

    showError(
      e.message || 'จองไม่สำเร็จ'
    )

  } finally {

    booking.value = false
  }
}
</script>

<style scoped>
.w-full {
  width: 100%;
}

.text-gray-600 {
  color:#6b7280;
}

.text-red {
  color:#dc2626;
}

.justify-end {
  justify-content: flex-end;
  display:flex;
}

.mb-1 {
  margin-bottom: .25rem;
}

.mb-3 {
  margin-bottom: .75rem;
}

.mt-3 {
  margin-top: .75rem;
}

.flex {
  display:flex;
}

.items-center {
  align-items:center;
}

.gap {
  gap: 12px;
}
</style>
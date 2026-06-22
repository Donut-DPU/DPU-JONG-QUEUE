<!-- booking-frontend/src/components/bookings/TimeSlotPicker.vue -->

<template>
  <div>
    <!-- วันที่ -->
    <v-text-field
      v-model="date"
      type="date"
      :min="today"
      label="เลือกวันที่"
      density="comfortable"
      class="mb-3"
    />

    <!-- โหลดสล็อต -->
    <v-btn
      class="mb-4"
      @click="loadSlots"
      :loading="loading"
    >
      ตรวจสอบคิวว่าง
    </v-btn>

    <!-- SLOT -->
    <div v-if="slots.length">
      <v-radio-group
        v-model="time"
        :mandatory="true"
        class="w-full"
      >
        <div
          v-for="s in slotsSorted"
          :key="s.time"
          class="mb-2"
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

    <!-- ปุ่มจอง -->
    <v-btn
      class="mt-4"
      color="primary"
      :disabled="!time"
      :loading="booking"
      @click="book"
    >
      จองคิวนี้
    </v-btn>

    <!-- ========================================= -->
    <!-- SUCCESS DIALOG -->
    <!-- ========================================= -->

    <v-dialog
      v-model="successDialog"
      width="420"
    >
      <v-card rounded="xl">

        <v-card-title class="text-h6 font-weight-bold">
          จองคิวสำเร็จ 🎉
        </v-card-title>

        <v-card-text>

          <div class="mb-2">
            บริการ:
            <strong>{{ props.service.name }}</strong>
          </div>

          <div class="mb-2">
            วันที่:
            <strong>{{ date }}</strong>
          </div>

          <div>
            เวลา:
            <strong>{{ time }}</strong>
          </div>

        </v-card-text>

        <v-card-actions class="justify-end pa-4">

          <v-btn
            color="primary"
            variant="flat"
            @click="closeSuccess"
          >
            ตกลง
          </v-btn>

        </v-card-actions>

      </v-card>
    </v-dialog>

    <!-- ========================================= -->
    <!-- ERROR DIALOG -->
    <!-- ========================================= -->

    <v-dialog
      v-model="errorDialog"
      width="420"
    >
      <v-card rounded="xl">

        <v-card-title class="text-h6 font-weight-bold text-error">
          ไม่สามารถจองได้
        </v-card-title>

        <v-card-text>
          {{ errorMessage }}
        </v-card-text>

        <v-card-actions class="justify-end pa-4">

          <v-btn
            color="error"
            variant="flat"
            @click="errorDialog = false"
          >
            ตกลง
          </v-btn>

        </v-card-actions>

      </v-card>
    </v-dialog>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { api } from '@/api/http'

const props = defineProps({
  service: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['booked'])

const today = new Date()
  .toISOString()
  .slice(0, 10)

const date = ref(today)

const time = ref(null)

const slots = ref([])

const loading = ref(false)

const booking = ref(false)

/* =========================
   DIALOG
========================= */

const successDialog = ref(false)

const errorDialog = ref(false)

const errorMessage = ref('')

/* =========================
   SORT SLOT
========================= */

const slotsSorted = computed(() =>
  [...slots.value].sort((a, b) =>
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

    errorMessage.value = 'โปรดเลือกวันที่'
    errorDialog.value = true

    return
  }

  if (date.value < today) {

    errorMessage.value = 'เลือกย้อนหลังไม่ได้'
    errorDialog.value = true

    return
  }

  loading.value = true

  time.value = null

  try {

    const res = await api(
      `/api/bookings/slots?serviceId=${props.service.id}&date=${date.value}`
    )

    slots.value = res.slots

    if (!slots.value.length) {

      errorMessage.value =
        'วันนี้ไม่มีเวลาให้บริการ'

      errorDialog.value = true
    }

  } catch (e) {

    errorMessage.value =
      e.message ||
      'โหลดเวลาไม่สำเร็จ'

    errorDialog.value = true

  } finally {

    loading.value = false
  }
}

/* =========================
   BOOK
========================= */

async function book() {

  if (!time.value) {

    errorMessage.value = 'โปรดเลือกเวลา'
    errorDialog.value = true

    return
  }

  if (date.value < today) {

    errorMessage.value = 'เลือกย้อนหลังไม่ได้'
    errorDialog.value = true

    return
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
          time: time.value
        }
      }
    )

    emit('booked', b)

    // ✅ popup success
    successDialog.value = true

  } catch (e) {

    errorMessage.value =
      e.message || 'จองไม่สำเร็จ'

    errorDialog.value = true

  } finally {

    booking.value = false
  }
}

/* =========================
   CLOSE SUCCESS
========================= */

function closeSuccess() {

  successDialog.value = false

  // reset เวลา
  time.value = null

  // reload slot ใหม่
  loadSlots()
}
</script>

<style scoped>
.w-full {
  width: 100%;
}
</style>
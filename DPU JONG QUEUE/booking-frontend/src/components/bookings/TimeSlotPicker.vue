<!-- booking-frontend/src/components/bookings/TimeSlotPicker.vue -->
<template>
  <div>
    <!-- วันที่: บล็อกย้อนหลังด้วย min -->
    <v-text-field
      v-model="date"
      type="date"
      :min="today"
      label="เลือกวันที่"
      density="comfortable"
      class="mb-3"
    />

    <v-btn class="mb-4" @click="loadSlots" :loading="loading">
      โหลดเวลาให้บริการ
    </v-btn>

    <!-- รายการเวลาแบบเรียงยาวลงมา -->
    <div v-if="slots.length">
      <v-radio-group v-model="time" :mandatory="true" class="w-full">
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

    <v-btn
      class="mt-4"
      color="primary"
      :disabled="!time"
      :loading="booking"
      @click="book"
    >
      จองคิวนี้
    </v-btn>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { api } from '@/api/http'

const props = defineProps({ service: { type: Object, required: true } })
const emit = defineEmits(['booked'])

const today = new Date().toISOString().slice(0, 10) // YYYY-MM-DD
const date = ref(today)
const time = ref(null)
const slots = ref([])
const loading = ref(false)
const booking = ref(false)

const slotsSorted = computed(() =>
  [...slots.value].sort((a, b) => a.time.localeCompare(b.time))
)

function remainingLabel(n) {
  if (n <= 0) return 'เต็มแล้ว'
  if (n === 1) return 'คิวว่าง 1'
  return `คิวว่าง ${n}`
}

async function loadSlots() {
  if (!date.value) return alert('โปรดเลือกวันที่')
  if (date.value < today) return alert('เลือกย้อนหลังไม่ได้')

  loading.value = true
  time.value = null
  try {
    const res = await api(
      `/api/bookings/slots?serviceId=${props.service.id}&date=${date.value}`
    )
    slots.value = res.slots
    if (!slots.value.length) alert('วันนี้ไม่มีเวลาให้บริการ')
  } catch (e) {
    alert(e.message || 'โหลดเวลาไม่สำเร็จ (อาจยังไม่ได้เข้าสู่ระบบ)')
  } finally {
    loading.value = false
  }
}

async function book() {
  if (!time.value) return alert('โปรดเลือกเวลา')
  if (date.value < today) return alert('เลือกย้อนหลังไม่ได้')

  booking.value = true
  try {
    const b = await api('/api/bookings', {
      method: 'POST',
      body: { serviceId: props.service.id, date: date.value, time: time.value }
    })
    emit('booked', b)
  } catch (e) {
    alert(e.message || 'จองไม่สำเร็จ')
  } finally {
    booking.value = false
  }
}
</script>

<style scoped>
.w-full { width: 100%; }
</style>

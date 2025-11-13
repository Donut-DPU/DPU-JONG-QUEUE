<template>
  <v-dialog v-model="visible" max-width="560" persistent>
    <v-card>
      <v-card-title class="text-h6">
        จองบริการ: {{ service?.name }}
      </v-card-title>

      <v-card-text>
        <div class="text-gray-600 mb-3">
          เวลาให้บริการ: {{ service.dailyStartTime }} - {{ service.dailyEndTime }}
          · ระยะต่อคิว {{ service.slotDurationMin }} นาที
          · รับต่อ slot {{ service.slotCapacity }} คน
        </div>

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

        <div class="flex items-center gap mb-3">
          <v-btn @click="loadSlots" :loading="loading">โหลดเวลาให้บริการ</v-btn>
          <span v-if="!slots.length && !loading" class="text-gray-600">
            เลือกวันที่แล้วกด “โหลดเวลาให้บริการ”
          </span>
        </div>

        <div v-if="slots.length">
          <div class="mb-2">เลือกเวลา:</div>
          <v-radio-group v-model="time" :mandatory="true" class="w-full">
            <div v-for="s in slotsSorted" :key="s.time" class="mb-1">
              <v-radio
                :label="`${s.time} — ${remainingLabel(s.remaining)}`"
                :value="s.time"
                :disabled="s.remaining <= 0"
                density="comfortable"
              />
            </div>
          </v-radio-group>
        </div>

        <v-textarea
          v-model="note"
          label="หมายเหตุ (ถ้ามี)"
          auto-grow
          rows="2"
          class="mt-3"
        />
      </v-card-text>

      <v-card-actions class="justify-end">
        <v-btn variant="text" @click="$emit('close')">ปิด</v-btn>
        <v-btn color="primary" :disabled="!time" :loading="booking" @click="book">
          ยืนยันการจอง
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { api } from '@/api/http'

const props = defineProps({
  service: { type: Object, required: true }
})
const emit = defineEmits(['close','booked'])

const visible = ref(true)

// ===== เวลาไทย (Asia/Bangkok) =====
function todayBangkok() {
  const f = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Bangkok',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: false
  })
  const parts = Object.fromEntries(f.formatToParts(new Date()).map(p => [p.type, p.value]))
  return `${parts.year}-${parts.month}-${parts.day}` // YYYY-MM-DD
}
const today = todayBangkok()

const date = ref(today)
const time = ref(null)
const note = ref('')
const slots = ref([])
const loading = ref(false)
const booking = ref(false)

watch(() => props.service, async () => {
  // reset เมื่อเปลี่ยนบริการ แล้วโหลด slot วันนี้อัตโนมัติ
  date.value = today
  time.value = null
  note.value = ''
  slots.value = []
  await loadSlots()
}, { immediate: true })

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
    const res = await api(`/api/bookings/slots?serviceId=${props.service.id}&date=${date.value}`)
    slots.value = res.slots
    if (!slots.value.length) {
      // ไม่มีสล็อตในวันนั้น
      // ไม่ alert ก็ได้ แต่ให้คงข้อความช่วยเหลือไว้
    }
  } catch (e) {
    if ((e.message || '').includes('401') || (e.message || '').toLowerCase().includes('unauthorized')) {
      alert('เซสชันหมดอายุ โปรดเข้าสู่ระบบใหม่')
      window.location.href = '/login'
      return
    }
    alert(e.message || 'โหลดเวลาไม่สำเร็จ')
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
      body: {
        serviceId: props.service.id,
        date: date.value,
        time: time.value,
        note: note.value || undefined
      }
    })

    // รีโหลด slot หลังจอง เพื่ออัปเดตจำนวนคิว (ให้เวลาเพิ่งจองแสดงว่าเต็ม/เหลือลดลงทันที)
    await loadSlots()

    // ส่งข้อมูลจองกลับ และปิด dialog
    emit('booked', b)
    emit('close')
  } catch (e) {
    if ((e.message || '').includes('401') || (e.message || '').toLowerCase().includes('unauthorized')) {
      alert('เซสชันหมดอายุ โปรดเข้าสู่ระบบใหม่')
      window.location.href = '/login'
      return
    }
    alert(e.message || 'จองไม่สำเร็จ')
  } finally {
    booking.value = false
  }
}
</script>

<style scoped>
.w-full { width: 100%; }
.text-gray-600 { color:#6b7280; }
.justify-end { justify-content: flex-end; display:flex; }
.mb-1 { margin-bottom: .25rem; }
.mb-3 { margin-bottom: .75rem; }
.mt-3 { margin-top: .75rem; }
.flex { display:flex; }
.items-center { align-items:center; }
.gap { gap: 12px; }
</style>

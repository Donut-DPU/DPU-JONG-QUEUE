<!-- src/pages/UserAppointmentsPage.vue -->
<template>
  <div>
    <h2 class="text-2xl font-bold mb-4">นัดหมายของคุณ</h2>

    <v-alert
      v-if="errorMsg"
      type="error"
      variant="tonal"
      class="mb-3"
      :text="errorMsg"
      closable
      @click:close="errorMsg = ''"
    />

    <!-- ถ้าไม่มีนัดหมาย -->
    <v-alert
      v-if="!loading && upcoming.length === 0"
      type="info"
      variant="tonal"
    >
      ตอนนี้คุณไม่มีนัดหมายที่กำลังจะมาถึง
    </v-alert>

    <!-- การ์ดนัดหมาย -->
    <v-row v-if="upcoming.length">
      <v-col
        v-for="b in upcoming"
        :key="b.id"
        cols="12"
        md="6"
        lg="4"
      >
        <v-card class="appointment-card" elevation="1">
          <v-card-title class="text-h6 mb-1">
            {{ serviceNameOf(b) }}
          </v-card-title>

          <v-card-subtitle class="mb-3 text-gray-600">
            Booking #{{ b.id }}
          </v-card-subtitle>

          <v-card-text class="card-body">
            <div class="row">
              <span class="label">วันที่</span>
              <span class="value">{{ fmtDate(b.date) }}</span>
            </div>

            <div class="row">
              <span class="label">เวลา</span>
              <span class="value">{{ b.time }}</span>
            </div>

            <div class="row">
              <span class="label">หมายเหตุ</span>
              <span class="value">{{ b.note || '—' }}</span>
            </div>

            <div class="row status-row">
              <span class="label">สถานะ</span>
              <span class="value">
                <v-chip
                  size="small"
                  class="status-chip"
                  :color="statusColor(b.status)"
                  variant="flat"
                >
                  {{ statusLabel(b.status) }}
                </v-chip>
              </span>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { api } from '@/api/http'

const loading = ref(false)
const errorMsg = ref('')
const items = ref([])        // booking ทั้งหมดของ user
const serviceMap = ref({})   // map id -> name (กรณี backend ไม่ส่ง service มา)

// โหลดบริการไว้ map ชื่อ
function toArray (res) {
  if (Array.isArray(res)) return res
  if (res && Array.isArray(res.items)) return res.items
  return []
}

async function loadServicesMap () {
  try {
    const res = await api('/api/services', { auth: false })
    const arr = toArray(res)
    const map = {}
    for (const s of arr) map[s.id] = s.name
    serviceMap.value = map
  } catch {
    // เงียบไว้
  }
}

function serviceNameOf (b) {
  return (
    b.service?.name ||
    b.serviceName ||
    (b.service_id != null ? serviceMap.value[b.service_id] : '-') ||
    '-'
  )
}

async function load () {
  loading.value = true
  errorMsg.value = ''
  try {
    const res = await api('/api/bookings/mine')
    items.value = toArray(res)

    // ถ้าไม่มีชื่อบริการแนบมา → โหลด map service
    if (items.value.some(b => !b.service?.name && !b.serviceName && b.service_id)) {
      await loadServicesMap()
    }
  } catch (e) {
    errorMsg.value = e.message || 'โหลดนัดหมายไม่สำเร็จ'
  } finally {
    loading.value = false
  }
}
onMounted(load)

/* ---------- เงื่อนไข “นัดหมายที่จะถึง” ---------- */
// แปลง date+time เป็น Date object เพื่อเทียบกับตอนนี้
function bookingDateTime (b) {
  try {
    // b.date = 'YYYY-MM-DD', b.time = 'HH:mm'
    return new Date(`${b.date}T${b.time}:00`)
  } catch {
    return null
  }
}

function isUpcoming (b) {
  const dt = bookingDateTime(b)
  if (!dt) return false

  const now = new Date()

  // เฉพาะสถานะที่ยังไม่ใช้ / ยังไม่จบ
  const st = (b.status || 'pending')
  const activeStatuses = ['pending', 'confirmed'] // ใช้งานหน้า "นัดหมาย" เท่านี้พอ
  if (!activeStatuses.includes(st)) return false

  // เวลาในอนาคต หรือภายในวันนี้แต่ยังไม่ถึงเวลา
  return dt.getTime() >= now.getTime()
}

const upcoming = computed(() =>
  items.value.filter(isUpcoming).sort((a, b) => {
    const da = bookingDateTime(a)?.getTime() || 0
    const db = bookingDateTime(b)?.getTime() || 0
    return da - db
  })
)

/* ---------- helper แสดงสถานะ / สี ---------- */
function statusLabel (st) {
  switch ((st || 'pending')) {
    case 'pending': return 'รอยืนยัน'
    case 'confirmed': return 'ยืนยันแล้ว'
    case 'checked_in': return 'เข้ารับบริการแล้ว'
    case 'completed': return 'เสร็จสิ้น'
    case 'cancelled': return 'ยกเลิก'
    case 'no_show': return 'ไม่มารับบริการ'
    default: return st
  }
}

function statusColor (st) {
  switch ((st || 'pending')) {
    case 'pending': return 'grey'
    case 'confirmed': return 'primary'
    case 'checked_in': return 'success'
    case 'completed': return 'success'
    case 'cancelled': return 'error'
    case 'no_show': return 'warning'
    default: return 'grey'
  }
}

function fmtDate (d) {
  try {
    const [y, m, day] = d.split('-')
    return `${day}-${m}-${y}` // 22-11-2025
  } catch {
    return d
  }
}
</script>

<style scoped>
.text-2xl { font-size: 1.5rem; }
.font-bold { font-weight: 700; }
.mb-4 { margin-bottom: 1rem; }
.mb-3 { margin-bottom: .75rem; }
.text-gray-600 { color: #6b7280; }

/* การ์ดให้ดูคล้ายตัวอย่าง */
.appointment-card {
  border-radius: 14px;
  border: 1px solid #e5e7eb;
}

.card-body {
  font-size: 14px;
}

.row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
}

.label {
  color: #6b7280;
}

.value {
  font-weight: 500;
}

.status-row {
  margin-top: 12px;
}

.status-chip {
  min-width: 80px;
  justify-content: center;
}

/* Vuetify grid ช่วยให้:
   - มือถือ: cols=12 → 1 card ต่อแถว
   - Tablet/PC: md=6, lg=4 → 2 หรือ 3 card ต่อแถว */
</style>

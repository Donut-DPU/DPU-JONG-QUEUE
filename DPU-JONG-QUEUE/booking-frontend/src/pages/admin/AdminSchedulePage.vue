<!-- src/pages/admin/AdminSchedulePage.vue -->
<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-2xl font-bold">ตารางคิวนัดหมาย</h2>
    </div>

    <!-- ฟิลเตอร์ด้านบน -->
    <v-card class="mb-4 pa-4">
      <div class="flex flex-wrap gap items-end">
        <v-text-field
          v-model="date"
          type="date"
          label="วันที่"
          density="comfortable"
          style="max-width: 200px"
        />

        <v-select
          v-model="serviceId"
          :items="serviceOptions"
          item-title="name"
          item-value="id"
          label="บริการ"
          density="comfortable"
          style="min-width: 220px"
          :loading="loadingServices"
        />

        <v-btn
          color="primary"
          :loading="loading"
          @click="loadData"
        >
          ค้นหาข้อมูล
        </v-btn>
      </div>
    </v-card>

    <v-alert
      v-if="errorMsg"
      type="error"
      variant="tonal"
      class="mb-3"
      :text="errorMsg"
      closable
      @click:close="errorMsg = ''"
    />

    <!-- ถ้ายังไม่เลือก service -->
    <v-alert
      v-if="!serviceId"
      type="info"
      variant="tonal"
    >
      กรุณาเลือกบริการที่ต้องการดูตารางคิว
    </v-alert>

    <!-- ตาราง slot + สถานะ -->
    <v-card v-else>
      <v-card-title class="text-h6">
        ตารางคิวของบริการ:
        <span class="font-bold">
          {{ currentServiceName || '-' }}
        </span>
        <span class="text-gray-600">
          · วันที่ {{ fmtDate(date) }}
        </span>
      </v-card-title>

      <v-divider />

      <v-card-text>
        <v-table>
          <thead>
            <tr>
              <th style="width:120px;">เวลา</th>
              <th style="width:140px;">สถานะ</th>
              <th>รายละเอียดการจอง</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="slot in slots" :key="slot.time">
              <td>{{ slot.time }}</td>
              <td>
                <v-chip
                  size="small"
                  :color="slotChipColor(slot)"
                  variant="flat"
                >
                  {{ slotStatusText(slot) }}
                </v-chip>
                <div class="text-xs text-gray-600">
                  คิวว่าง {{ slot.remaining }} / {{ slot.capacity }}
                </div>
              </td>
              <td>
                <div v-if="bookingsByTime[slot.time]?.length">
                  <div
                    v-for="b in bookingsByTime[slot.time]"
                    :key="b.id"
                    class="mb-1"
                  >
                    • #{{ b.id }}
                    - {{ b.User?.full_name || 'ไม่ทราบชื่อ' }}
                    ({{ b.status }})
                    <span v-if="b.note">
                      · {{ b.note }}
                    </span>
                  </div>
                </div>
                <div v-else class="text-gray-500">
                  – ยังไม่มีการจองในช่วงเวลานี้ –
                </div>
              </td>
            </tr>

            <tr v-if="!loading && slots.length === 0">
              <td colspan="3" class="text-center py-6 text-gray-600">
                วันนี้ไม่มีการตั้งเวลาให้บริการ
              </td>
            </tr>
          </tbody>
        </v-table>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { api } from '@/api/http'

const services = ref([])
const loadingServices = ref(false)

const date = ref(new Date().toISOString().slice(0, 10))
const serviceId = ref(null)

const loading = ref(false)
const errorMsg = ref('')

const slots = ref([])     // จาก /api/bookings/slots
const bookings = ref([])  // จาก /api/bookings/admin

// ตัวเลือกบริการ
const serviceOptions = computed(() => services.value)

// ชื่อบริการปัจจุบัน
const currentServiceName = computed(() => {
  const s = services.value.find(s => s.id === serviceId.value)
  return s ? s.name : ''
})

// group booking ตาม time
const bookingsByTime = computed(() => {
  const map = {}
  for (const b of bookings.value) {
    if (!map[b.time]) map[b.time] = []
    map[b.time].push(b)
  }
  return map
})

async function loadServices () {
  loadingServices.value = true
  try {
    services.value = await api('/api/services?all=1')
    if (!serviceId.value && services.value.length > 0) {
      serviceId.value = services.value[0].id
    }
  } catch (e) {
    console.error(e)
  } finally {
    loadingServices.value = false
  }
}

async function loadData () {
  if (!serviceId.value || !date.value) return
  loading.value = true
  errorMsg.value = ''
  try {
    // 1) โหลด slot ทั้งวัน (พร้อม remaining)
    const s = await api(`/api/bookings/slots?serviceId=${serviceId.value}&date=${date.value}`)
    slots.value = s.slots || []

    // 2) โหลด booking ของวันนั้นสำหรับ service นั้น
    const q = new URLSearchParams()
    q.set('date', date.value)
    q.set('serviceId', serviceId.value)
    bookings.value = await api(`/api/bookings/admin?${q.toString()}`)
  } catch (e) {
    errorMsg.value = e.message || 'โหลดตารางคิวไม่สำเร็จ'
  } finally {
    loading.value = false
  }
}

// ข้อความสถานะของ slot
function slotStatusText (slot) {
  if (slot.remaining <= 0) return 'เต็มแล้ว'
  if (slot.booked > 0 && slot.remaining > 0) return 'จองบางส่วน'
  return 'ว่าง'
}

// สี chip ตามสถานะ
function slotChipColor (slot) {
  if (slot.remaining <= 0) return 'error'
  if (slot.booked > 0 && slot.remaining > 0) return 'warning'
  return 'success'
}

// แสดงวันที่แบบไทย
function fmtDate (d) {
  try {
    return new Date(d).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  } catch {
    return d
  }
}

onMounted(async () => {
  await loadServices()
  await loadData()
})
</script>

<style scoped>
.flex { display:flex; }
.flex-wrap { flex-wrap: wrap; }
.items-end { align-items:flex-end; }
.items-center { align-items:center; }
.justify-between { justify-content:space-between; }
.mb-4 { margin-bottom:1rem; }
.gap { gap:12px; }
.text-2xl { font-size:1.5rem; }
.font-bold { font-weight:700; }
.text-gray-600 { color:#6b7280; }
.text-gray-500 { color:#9ca3af; }
.text-xs { font-size:0.75rem; }
.py-6 { padding-top:1.5rem; padding-bottom:1.5rem; }
</style>

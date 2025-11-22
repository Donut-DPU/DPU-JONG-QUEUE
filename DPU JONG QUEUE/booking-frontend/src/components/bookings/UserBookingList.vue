<template>
  <div>
    <div class="flex items-center justify-between mb-3">
      <h3 class="text-xl font-bold">ประวัติการจองของฉัน</h3>

      <div class="flex items-center">
        <v-select
          v-model="statusFilter"
          :items="statusOptions"
          label="สถานะ"
          density="comfortable"
          variant="outlined"
          style="max-width: 180px"
          :menu-props="{ location: 'bottom' }"
        />
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

    <!-- Card ครอบทั้งหมด -->
    <v-card elevation="1" class="pa-4">

      <!-- 🌐 PC / Tablet: แสดงเป็นตาราง -->
      <div class="desktop-only">
        <v-table>
          <thead>
            <tr>
              <th>บริการ</th>
              <th>วันที่</th>
              <th>เวลา</th>
              <th>หมายเหตุ</th>
              <th>สถานะ</th>
              <th style="width:150px;"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="b in paged" :key="b.id">
              <td>{{ b.service?.name || b.serviceName || serviceName(b.service_id) || '-' }}</td>
              <td>{{ fmtDate(b.date) }}</td>
              <td>{{ b.time }}</td>
              <td>{{ b.note || '—' }}</td>
              <td>
                <v-chip :color="statusColor(b.status)" size="small">
                  {{ statusLabel(b.status) }}
                </v-chip>
              </td>
              <td></td>
            </tr>

            <tr v-if="!loading && filtered.length === 0">
              <td colspan="6" class="text-gray-600 py-6 text-center">
                ยังไม่มีรายการจอง
              </td>
            </tr>
          </tbody>
        </v-table>
      </div>

      <!-- 📱 Mobile: แสดงเป็น Card ทีละรายการ -->
      <div class="mobile-only">
        <v-row>
          <v-col cols="12" v-for="b in paged" :key="b.id">
            <v-card class="mobile-booking-card" variant="outlined">
              <v-card-title class="mobile-title">
                {{ b.service?.name || b.serviceName || serviceName(b.service_id) || '-' }}
              </v-card-title>

              <v-card-text>
                <div class="mobile-line">
                  <span class="mobile-label">วันที่</span>
                  <span>{{ fmtDate(b.date) }}</span>
                </div>
                <div class="mobile-line">
                  <span class="mobile-label">เวลา</span>
                  <span>{{ b.time }}</span>
                </div>
                <div class="mobile-line">
                  <span class="mobile-label">หมายเหตุ</span>
                  <span>{{ b.note || '—' }}</span>
                </div>
                <div class="mobile-line status-line">
                  <span class="mobile-label">สถานะ</span>
                  <v-chip :color="statusColor(b.status)" size="small">
                    {{ statusLabel(b.status) }}
                  </v-chip>
                </div>
              </v-card-text>
            </v-card>
          </v-col>

          <v-col cols="12" v-if="!loading && filtered.length === 0">
            <div class="text-gray-600 py-6 text-center">
              ยังไม่มีรายการจอง
            </div>
          </v-col>
        </v-row>
      </div>

      <!-- Pagination: ใช้ร่วมกันทั้ง PC + Mobile -->
      <div
        v-if="pageCount > 1"
        class="pagination-row"
      >
        <span class="page-text">
          หน้าที่ {{ page }} / {{ pageCount }}
        </span>

        <div>
          <v-btn
            icon="mdi-chevron-left"
            variant="text"
            density="comfortable"
            :disabled="page <= 1"
            @click="page--"
          />
          <v-btn
            icon="mdi-chevron-right"
            variant="text"
            density="comfortable"
            :disabled="page >= pageCount"
            @click="page++"
          />
        </div>
      </div>
    </v-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { api } from '@/api/http'

const loading = ref(false)
const errorMsg = ref('')
const items = ref([])
const statusFilter = ref('all')
const serviceMap = ref({})

const statusOptions = [
  { title: 'ทั้งหมด', value: 'all' },
  { title: 'รอยืนยัน', value: 'pending' },
  { title: 'ยืนยันแล้ว', value: 'confirmed' },
  { title: 'เข้ารับบริการแล้ว', value: 'checked_in' },
  { title: 'ยกเลิก', value: 'cancelled' }
]

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
    // เงียบไว้ก่อน
  }
}

function serviceName (id) {
  return id != null ? serviceMap.value[id] : undefined
}

async function load () {
  loading.value = true
  errorMsg.value = ''
  try {
    const res = await api('/api/bookings/mine')
    const data = toArray(res)
    items.value = data

    if (items.value.some(b => !b.service?.name && !b.serviceName && b.service_id)) {
      await loadServicesMap()
    }
  } catch (e) {
    errorMsg.value = e.message || 'โหลดประวัติการจองไม่สำเร็จ'
  } finally {
    loading.value = false
  }
}
onMounted(load)

const filtered = computed(() => {
  if (statusFilter.value === 'all') return items.value
  return items.value.filter(b => (b.status || 'pending') === statusFilter.value)
})

// -------- Pagination --------
const page = ref(1)
const perPage = 10

const pageCount = computed(() =>
  Math.ceil(filtered.value.length / perPage)
)

const paged = computed(() => {
  const start = (page.value - 1) * perPage
  return filtered.value.slice(start, start + perPage)
})
// ----------------------------

function statusLabel (st) {
  switch ((st || 'pending')) {
    case 'pending': return 'รอยืนยัน'
    case 'confirmed': return 'ยืนยันแล้ว'
    case 'checked_in': return 'เข้ารับบริการแล้ว'
    case 'completed': return 'เสร็จสิ้น'
    case 'cancelled': return 'ยกเลิก'
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
    default: return 'grey'
  }
}

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

// ให้ parent เรียก reload ได้
defineExpose({ load })
</script>

<style scoped>
.flex{display:flex;}
.items-center{align-items:center;}
.justify-between{justify-content:space-between;}
.mb-3{margin-bottom:.75rem;}
.text-xl{font-size:1.25rem;}
.font-bold{font-weight:700;}
.text-gray-600{color:#6b7280;}
.py-6{padding-top:1.5rem;padding-bottom:1.5rem;}
.mr-2{margin-right:.5rem;}

/* แสดง/ซ่อนตามขนาดหน้าจอ */
.desktop-only { display:block; }
.mobile-only { display:none; }

@media (max-width: 768px) {
  .desktop-only { display:none; }
  .mobile-only { display:block; }
}

/* การ์ดบนมือถือ */
.mobile-booking-card {
  border-radius: 14px;
  margin-bottom: 10px;
}

.mobile-title {
  font-size: 16px;
  font-weight: 700;
  padding-bottom: 4px;
}

.mobile-line {
  display:flex;
  justify-content:space-between;
  align-items:center;
  font-size:13px;
  margin-bottom:4px;
}

.mobile-label {
  font-weight:600;
  color:#4b5563;
  margin-right:8px;
}

.status-line {
  margin-top:6px;
}

/* แถว pagination */
.pagination-row {
  display:flex;
  justify-content:space-between;
  align-items:center;
  padding: 10px 4px 0;
  margin-top: 8px;
}

.page-text {
  font-size: 14px;
  color:#374151;
}
</style>

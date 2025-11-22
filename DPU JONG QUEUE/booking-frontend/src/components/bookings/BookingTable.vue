<template>
  <div class="booking-wrapper">
    <v-card flat class="booking-card">
      <v-card-text>

        <!-- ฟิลเตอร์ด้านบน -->
        <div class="flex gap mb-3 filters-row">
          <v-text-field
            v-model="filter.date"
            type="date"
            label="วันที่"
            density="comfortable"
          />
          <v-select
            v-model="filter.serviceId"
            :items="serviceOptions"
            item-title="name"
            item-value="id"
            label="บริการ"
            density="comfortable"
            clearable
          />
          <v-select
            v-model="filter.status"
            :items="statusOptions"
            label="สถานะ"
            density="comfortable"
            clearable
          />
          <v-btn @click="load" :loading="loading">
            ค้นหา
          </v-btn>
        </div>

        <v-divider class="mb-3" />

        <!-- ตารางรายการจอง -->
        <v-table class="booking-table" density="comfortable">
          <thead>
            <tr>
              <th>วันที่</th>
              <th>เวลา</th>
              <th>บริการ</th>
              <th>ผู้จอง</th>
              <th>สถานะ</th>
              <th style="width: 220px;">จัดการนัดหมาย</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="b in pagedRows" :key="b.id">
              <td>{{ formatDate(b.date) }}</td>
              <td>{{ b.time }}</td>
              <td>{{ b.Service?.name || '-' }}</td>
              <td>{{ b.User?.full_name || '-' }}</td>
              <td>{{ b.status }}</td>
              <td>
                <!-- ปุ่มจัดการนัดหมายแบบดรอปดาวน์ -->
                <v-menu location="bottom">
                  <template #activator="{ props }">
                    <v-btn
                      v-bind="props"
                      variant="outlined"
                      size="small"
                      class="manage-btn"
                    >
                      จัดการนัดหมาย
                      <v-icon icon="mdi-menu-down" size="18" class="ml-1" />
                    </v-btn>
                  </template>

                  <v-list density="compact">
                    <v-list-item @click="setStatus(b, 'confirmed')">
                      <v-list-item-title>ยืนยัน</v-list-item-title>
                    </v-list-item>
                    <v-list-item @click="setStatus(b, 'checked_in')">
                      <v-list-item-title>เข้ารับบริการ</v-list-item-title>
                    </v-list-item>
                    <v-list-item @click="setStatus(b, 'completed')">
                      <v-list-item-title>เสร็จสิ้น</v-list-item-title>
                    </v-list-item>
                    <v-list-item @click="setStatus(b, 'cancelled')">
                      <v-list-item-title class="text-error">
                        ยกเลิก
                      </v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-menu>
              </td>
            </tr>

            <tr v-if="!pagedRows.length">
              <td colspan="6" class="text-center text-gray">
                ยังไม่มีรายการจอง
              </td>
            </tr>
          </tbody>
        </v-table>

        <!-- แสดงหน้า / เปลี่ยนหน้า – ครั้งละ 10 รายการ -->
        <div v-if="totalPages > 1" class="pagination-row">
          <span class="page-info">
            หน้าที่ {{ page }} / {{ totalPages }}
          </span>
          <v-pagination
            v-model="page"
            :length="totalPages"
            density="comfortable"
          />
        </div>

      </v-card-text>
    </v-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { api } from '@/api/http'

const props = defineProps({
  services: { type: Array, default: () => [] }
})

const loading = ref(false)
const rows = ref([])

const filter = ref({
  date: new Date().toISOString().slice(0, 10),
  serviceId: null,
  status: null
})

const serviceOptions = computed(() => props.services)
const statusOptions = ['pending', 'confirmed', 'checked_in', 'completed', 'cancelled', 'no_show']

// --- pagination ---
const page = ref(1)
const itemsPerPage = 10

const totalPages = computed(() => {
  if (!rows.value.length) return 1
  return Math.ceil(rows.value.length / itemsPerPage)
})

const pagedRows = computed(() => {
  const start = (page.value - 1) * itemsPerPage
  return rows.value.slice(start, start + itemsPerPage)
})

// โหลดข้อมูลจาก backend ตาม filter
async function load () {
  loading.value = true
  try {
    const q = new URLSearchParams()
    if (filter.value.date) q.set('date', filter.value.date)
    if (filter.value.serviceId) q.set('serviceId', filter.value.serviceId)
    if (filter.value.status) q.set('status', filter.value.status)

    rows.value = await api(`/api/bookings/admin?${q.toString()}`)
    page.value = 1 // เปลี่ยนชุดข้อมูลใหม่ ให้กลับไปหน้าแรกเสมอ
  } catch (e) {
    alert(e.message)
  } finally {
    loading.value = false
  }
}

function formatDate (d) {
  if (!d) return '-'
  const [y, m, day] = d.split('-')
  return `${day}-${m}-${y}`
}

async function setStatus (b, status) {
  try {
    await api(`/api/bookings/${b.id}/status`, {
      method: 'PATCH',
      body: { status }
    })
    await load()
  } catch (e) {
    alert(e.message)
  }
}

onMounted(load)
</script>

<style scoped>
.booking-wrapper {
  padding: 0;
}

.booking-card {
  border: 1px solid #e5e7eb; /* เส้นขอบอ่อน ๆ */
  border-radius: 12px;
  background: #ffffff;
}

.filters-row {
  padding-bottom: 8px;
}

.booking-table {
  font-size: 14px;
}

/* แถว pagination ด้านล่าง */
.pagination-row {
  margin-top: 12px;
  padding-top: 8px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.page-info {
  font-size: 13px;
  color: #6b7280;
}

.text-center {
  text-align: center;
}

.text-gray {
  color: #9ca3af;
}

.flex {
  display: flex;
}
.gap {
  gap: 12px;
}
.mb-3 {
  margin-bottom: 0.75rem;
}

.manage-btn {
  text-transform: none;
  font-size: 13px;
}

.ml-1 {
  margin-left: 4px;
}
</style>

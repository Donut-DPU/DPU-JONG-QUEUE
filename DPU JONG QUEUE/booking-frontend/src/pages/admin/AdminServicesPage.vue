<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-2xl font-bold">บริการ</h2>
      <v-btn color="primary" @click="openCreate">+ เพิ่มบริการ</v-btn>
    </div>

    <!-- 🔹 กรอบ card ครอบตาราง + pagination -->
    <v-card class="services-card" elevation="1">
      <v-card-text>
        <v-table>
          <thead>
            <tr>
              <th>ชื่อบริการ</th>
              <th>เวลาเปิด-ปิด</th>
              <th>คิว/สล็อต</th>
              <th>ระยะ/นาที</th>
              <th>สถานะ</th>
              <th style="width:180px;"></th>
            </tr>
          </thead>
          <tbody>
            <!-- ใช้ pagedServices แทน services เพื่อจำกัดทีละ 10 แถว -->
            <tr v-for="s in pagedServices" :key="s.id">
              <td>{{ s.name }}</td>
              <td>{{ s.dailyStartTime }} - {{ s.dailyEndTime }}</td>
              <td>{{ s.slotCapacity }}</td>
              <td>{{ s.slotDurationMin }}</td>
              <td>
                <v-chip size="small" :color="s.active ? 'success' : 'grey'">
                  {{ s.active ? 'เปิด' : 'ปิด' }}
                </v-chip>
              </td>
              <td>
                <v-btn size="small" class="mr-2" @click="openEdit(s)">แก้ไข</v-btn>
                <v-btn size="small" color="error" @click="remove(s)">ลบ</v-btn>
              </td>
            </tr>

            <!-- กรณีไม่มีข้อมูล -->
            <tr v-if="!services.length">
              <td colspan="6" class="text-center text-muted">ยังไม่มีบริการ</td>
            </tr>
          </tbody>
        </v-table>
      </v-card-text>

      <!-- เส้นคั่น + pagination ด้านล่างการ์ด -->
      <v-divider />

      <div v-if="pageCount > 1" class="pagination-wrap">
        <div class="pagination-info">
          แสดง {{ rangeStart }}–{{ rangeEnd }} จาก {{ services.length }} รายการ
        </div>
        <v-pagination
          v-model="page"
          :length="pageCount"
          density="comfortable"
          prev-icon="mdi-chevron-left"
          next-icon="mdi-chevron-right"
        />
      </div>
    </v-card>

    <ServiceEditor
      v-if="dialog"
      :service="editing"
      @close="dialog=false; editing=null"
      @saved="onSaved"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { api } from '@/api/http'
import ServiceEditor from '@/components/services/ServiceEditor.vue'

const services = ref([])
const dialog = ref(false)
const editing = ref(null)

/* 🔹 pagination state */
const page = ref(1)
const itemsPerPage = 10

const pageCount = computed(() =>
  Math.max(1, Math.ceil(services.value.length / itemsPerPage))
)

const pagedServices = computed(() => {
  const start = (page.value - 1) * itemsPerPage
  return services.value.slice(start, start + itemsPerPage)
})

const rangeStart = computed(() => {
  if (!services.value.length) return 0
  return (page.value - 1) * itemsPerPage + 1
})

const rangeEnd = computed(() => {
  return Math.min(page.value * itemsPerPage, services.value.length)
})

// ถ้า reload ข้อมูลแล้วจำนวนหน้าเปลี่ยน ให้กลับไปหน้าแรกป้องกัน page เกิน
watch(services, () => {
  if (page.value > pageCount.value) page.value = 1
})

async function loadServices() {
  services.value = await api('/api/services?all=1')
}
function openCreate(){ editing.value = null; dialog.value = true }
function openEdit(s){ editing.value = { ...s }; dialog.value = true }
async function remove(s){
  if (!confirm(`ลบบริการ "${s.name}" ?`)) return
  await api(`/api/services/${s.id}`, { method: 'DELETE' })
  await loadServices()
}
async function onSaved(){
  dialog.value = false
  editing.value = null
  await loadServices()
}
onMounted(loadServices)
</script>

<style scoped>
.flex { display:flex; }
.items-center { align-items:center; }
.justify-between { justify-content:space-between; }
.mb-4 { margin-bottom:1rem; }
.text-2xl { font-size:1.5rem; }
.font-bold { font-weight:700; }
.mr-2 { margin-right:.5rem; }

/* 🔹 card + table style */
.services-card {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}

.text-center { text-align:center; }
.text-muted { color:#9ca3af; }

/* 🔹 pagination style */
.pagination-wrap {
  display:flex;
  justify-content:space-between;
  align-items:center;
  padding: 8px 16px 12px;
}
.pagination-info {
  font-size: 13px;
  color:#6b7280;
}
</style>

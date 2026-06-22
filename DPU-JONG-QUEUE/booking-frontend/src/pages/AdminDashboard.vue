<template>
  <div class="p-6">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-3xl font-bold">Admin Dashboard</h2>
      <div>
        <v-btn class="mr-2" @click="goServices">ไปหน้า User Services</v-btn>
        <v-btn color="error" @click="logout">ออกจากระบบ</v-btn>
      </div>
    </div>

    <v-alert
      v-if="errorMsg"
      type="error"
      variant="tonal"
      class="mb-4"
      :text="errorMsg"
      closable
      @click:close="errorMsg = ''"
    />

    <v-tabs v-model="tab" fixed-tabs>
      <v-tab value="services">บริการ</v-tab>
      <v-tab value="bookings">รายการจอง</v-tab>
    </v-tabs>

    <v-window v-model="tab" class="mt-4">
      <!-- แท็บบริการ -->
      <v-window-item value="services">
        <div class="mb-4 flex items-center">
          <v-btn color="primary" @click="openCreate" :disabled="loading">+ เพิ่มบริการ</v-btn>
          <v-spacer />
          <v-progress-circular
            v-if="loading"
            indeterminate
            size="22"
            class="ml-2"
          />
        </div>

        <template v-if="!loading && services.length">
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
              <tr v-for="s in services" :key="s.id">
                <td>{{ s.name }}</td>
                <td>{{ s.dailyStartTime }} - {{ s.dailyEndTime }}</td>
                <td>{{ s.slotCapacity }}</td>
                <td>{{ s.slotDurationMin }}</td>
                <td>{{ s.active ? 'เปิด' : 'ปิด' }}</td>
                <td>
                  <v-btn size="small" class="mr-2" @click="openEdit(s)">แก้ไข</v-btn>
                  <v-btn size="small" color="error" @click="removeService(s)">ลบ</v-btn>
                </td>
              </tr>
            </tbody>
          </v-table>
        </template>

        <v-alert
          v-else-if="!loading && !services.length"
          type="info"
          variant="tonal"
          text="ยังไม่มีบริการในระบบ กรุณาเพิ่มบริการใหม่"
        />

        <ServiceEditor
          v-if="dialog"
          :service="editing"
          @close="dialog=false; editing=null"
          @saved="onSaved"
        />
      </v-window-item>

      <!-- แท็บรายการจอง -->
      <v-window-item value="bookings">
        <BookingTable :services="services" />
      </v-window-item>
    </v-window>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { api } from '@/api/http'
import ServiceEditor from '@/components/services/ServiceEditor.vue'
import BookingTable from '@/components/bookings/BookingTable.vue'

const tab = ref('services')
const services = ref([])
const dialog = ref(false)
const editing = ref(null)
const loading = ref(false)
const errorMsg = ref('')

// ===== helper =====
function ensureAdmin() {
  const raw = localStorage.getItem('user')
  const me = raw ? JSON.parse(raw) : null
  const role = (me?.role || '').toLowerCase()
  if (!localStorage.getItem('token')) {
    window.location.href = '/login'
    return false
  }
  if (role !== 'admin') {
    // ถ้าไม่ใช่แอดมิน ส่งไปหน้า user
    window.location.href = '/services'
    return false
  }
  return true
}

async function loadServices() {
  loading.value = true
  errorMsg.value = ''
  try {
    // ถ้า backend ของคุณไม่มีพารามิเตอร์ ?all=1 ให้เปลี่ยนเป็น '/api/services'
    services.value = await api('/api/services?all=1')
  } catch (e) {
    errorMsg.value = e.message || 'โหลดบริการไม่สำเร็จ'
    services.value = []
  } finally {
    loading.value = false
  }
}

function openCreate() {
  editing.value = null
  dialog.value = true
}

function openEdit(s) {
  editing.value = { ...s }
  dialog.value = true
}

async function removeService(s) {
  if (!confirm(`ลบบริการ "${s.name}" ?`)) return
  loading.value = true
  errorMsg.value = ''
  try {
    await api(`/api/services/${s.id}`, { method: 'DELETE' })
    await loadServices()
  } catch (e) {
    errorMsg.value = e.message || 'ลบบริการไม่สำเร็จ'
  } finally {
    loading.value = false
  }
}

async function onSaved() {
  dialog.value = false
  editing.value = null
  await loadServices()
}

function logout() {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  window.location.href = '/login'
}

function goServices() {
  window.location.href = '/services'
}

onMounted(async () => {
  if (!ensureAdmin()) return
  await loadServices()
})
</script>

<style scoped>
.flex { display:flex; }
.items-center { align-items:center; }
.justify-between { justify-content:space-between; }
.mb-4 { margin-bottom:1rem; }
.text-3xl { font-size:1.875rem; font-weight:700; }
.font-bold { font-weight:700; }
.mr-2 { margin-right:.5rem; }

.p-6{padding:1.5rem;}
.text-gray-600{color:#6b7280;}
.ml-2{margin-left:.5rem;}
</style>

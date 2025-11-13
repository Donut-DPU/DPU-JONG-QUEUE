<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-2xl font-bold">บริการ</h2>
      <v-btn color="primary" @click="openCreate">+ เพิ่มบริการ</v-btn>
    </div>

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
      </tbody>
    </v-table>

    <ServiceEditor
      v-if="dialog"
      :service="editing"
      @close="dialog=false; editing=null"
      @saved="onSaved"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { api } from '@/api/http'
import ServiceEditor from '@/components/services/ServiceEditor.vue'

const services = ref([])
const dialog = ref(false)
const editing = ref(null)

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
</style>

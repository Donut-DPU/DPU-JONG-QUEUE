<template>
  <div>
    <div class="flex gap mb-3">
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
      <v-btn @click="load" :loading="loading">ค้นหา</v-btn>
    </div>

    <v-table>
      <thead>
        <tr>
          <th>วันที่</th>
          <th>เวลา</th>
          <th>บริการ</th>
          <th>ผู้จอง</th>
          <th>สถานะ</th>
          <th>จัดการนัดหมาย</th>
          <th style="width:260px;"></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="b in rows" :key="b.id">
          <td>{{ formatDate(b.date) }}</td>
          <td>{{ b.time }}</td>
          <td>{{ b.Service?.name || '-' }}</td>
          <td>{{ b.User?.full_name || '-' }}</td>
          <td>{{ b.status }}</td>
          <td>
            <v-menu>
              <template #activator="{ props }">
                <v-btn
                  v-bind="props"
                  size="small"
                  variant="outlined"
                  append-icon="mdi-chevron-down"
                >
                  จัดการนัดหมาย
                </v-btn>
              </template>

              <v-list>
                  <v-list-item @click="setStatus(b,'confirmed')">
                    <v-list-item-title>ยืนยัน</v-list-item-title>
                  </v-list-item>

                <v-list-item @click="setStatus(b,'checked_in')">
                  <v-list-item-title>เข้ารับบริการ</v-list-item-title>
                </v-list-item>

                <v-list-item @click="setStatus(b,'completed')">
                  <v-list-item-title>เสร็จสิ้น</v-list-item-title>
                </v-list-item>

                <v-list-item @click="setStatus(b,'cancelled')">
                  <v-list-item-title class="text-error">ยกเลิก</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </td>
        </tr>
      </tbody>
    </v-table>
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
  date: new Date().toISOString().slice(0,10),
  serviceId: null,
  status: null
})

const serviceOptions = computed(() => props.services)
const statusOptions = ['pending','confirmed','checked_in','completed','cancelled','no_show']

async function load() {
  loading.value = true
  try {
    const q = new URLSearchParams()
    if (filter.value.date) q.set('date', filter.value.date)
    if (filter.value.serviceId) q.set('serviceId', filter.value.serviceId)
    if (filter.value.status) q.set('status', filter.value.status)
    rows.value = await api(`/api/bookings/admin?${q.toString()}`)
  } catch (e) {
    alert(e.message)
  } finally {
    loading.value = false
  }
}

function formatDate(d) {
  if (!d) return '-'
  const [y, m, day] = d.split('-')
  return `${day}-${m}-${y}`
}


async function setStatus(b, status) {
  try {
    await api(`/api/bookings/${b.id}/status`, { method:'PATCH', body: { status } })
    await load()
  } catch (e) {
    alert(e.message)
  }
}

onMounted(load)
</script>

<style scoped>
.flex { display:flex; }
.gap { gap: 12px; }
.mb-3 { margin-bottom: .75rem; }
.mr-2 { margin-right: .5rem; }
</style>

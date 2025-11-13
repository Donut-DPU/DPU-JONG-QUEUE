<template>
  <div>
    <h2 class="text-3xl font-bold mb-4">เลือกบริการที่ต้องการ</h2>

    <v-row>
      <v-col cols="12" md="6" v-for="s in services" :key="s.id">
        <v-card>
          <v-card-title class="text-h6">{{ s.name }}</v-card-title>
          <v-card-subtitle class="mb-2">
            เวลาให้บริการ: {{ s.dailyStartTime }} - {{ s.dailyEndTime }}
            · ระยะต่อคิว {{ s.slotDurationMin }} นาที
            · รับต่อ slot {{ s.slotCapacity }} คน
          </v-card-subtitle>
          <v-card-text class="text-gray-600">
            {{ s.description || '—' }}
          </v-card-text>
          <v-card-actions>
            <v-btn color="primary" @click="openBooking(s)">เลือกบริการ</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <!-- Dialog จอง -->
    <BookingDialog
      v-if="dialog"
      :service="selectedService"
      @close="dialog=false; selectedService=null"
      @booked="onBooked"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { api } from '@/api/http'
import BookingDialog from '@/components/bookings/BookingDialog.vue'

const services = ref([])
const dialog = ref(false)
const selectedService = ref(null)

onMounted(async () => {
  const token = localStorage.getItem('token')
  if (!token) {
    window.location.href = '/login'
    return
  }
  try {
    services.value = await api('/api/services')
  } catch (e) {
    alert(e.message || 'ไม่สามารถโหลดรายการบริการได้')
  }
})

function openBooking(s) {
  selectedService.value = s
  dialog.value = true
}

function onBooked(b) {
  dialog.value = false
  selectedService.value = null
  alert(`จองสำเร็จ: #${b.id} วันที่ ${b.date} เวลา ${b.time}`)
}
</script>

<style scoped>
.mb-2 { margin-bottom: .5rem; }
.mb-4 { margin-bottom: 1rem; }
.text-3xl { font-size: 1.875rem; font-weight: 700; }
.font-bold { font-weight: 700; }
.text-gray-600 { color: #6b7280; }
</style>

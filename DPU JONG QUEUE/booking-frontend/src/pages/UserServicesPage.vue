<template>
  <div>
    <h2 class="text-3xl font-bold mb-4">เลือกบริการที่ต้องการ</h2>

    <v-row>
      <v-col cols="12" md="6" lg="4" v-for="s in services" :key="s.id">
        <v-card class="service-card" elevation="2">

          <v-card-text>
            <h3 class="service-title">{{ s.name }}</h3>

            <p class="service-line">
              เวลาให้บริการ:
              <span class="strong">{{ s.dailyStartTime }} - {{ s.dailyEndTime }}</span>
            </p>

            <p class="service-line">
              ระยะต่อคิว:
              <span class="strong">{{ s.slotDurationMin }} นาที</span> · รับต่อ slot
              <span class="strong">{{ s.slotCapacity }} คน</span>
            </p>

            <p class="service-desc">
              {{ s.description || "—" }}
            </p>
          </v-card-text>

          <v-card-actions class="service-footer">
            <v-btn block class="service-btn" @click="openBooking(s)">
              เลือกบริการ
            </v-btn>
          </v-card-actions>

        </v-card>
      </v-col>
    </v-row>

    <!-- Dialog เดิม -->
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
.service-card {
  border-radius: 16px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.service-title {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 6px;
  color: #111827;
}

.service-line {
  font-size: 14px;
  color: #4b5563;
  margin-bottom: 4px;
}

.service-desc {
  font-size: 13px;
  color: #6b7280;
  margin-top: 8px;
}

.strong {
  font-weight: 600;
  color: #111827;
}

.service-footer {
  margin-top: auto;
  padding: 0 16px 16px;
}

.service-btn {
  border-radius: 999px;
  background: linear-gradient(90deg, #2563eb, #4f46e5);
  color: #fff;
  font-weight: 600;
  text-transform: none;
  height: 44px;
}

.service-btn:hover {
  filter: brightness(1.06);
}
</style>

<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-2xl font-bold">รายการจอง</h2>
    </div>

    <BookingTable :services="services" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { api } from '@/api/http'
import BookingTable from '@/components/bookings/BookingTable.vue'

const services = ref([])

async function loadServices(){
  // ใช้ใน BookingTable เพื่อแสดงชื่อบริการ/ตัวกรอง
  services.value = await api('/api/services?all=1')
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
</style>

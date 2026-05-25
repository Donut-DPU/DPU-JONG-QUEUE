<template>
  <div class="booking-page">

    <!-- LOADING -->
    <transition name="fade">

      <div
        v-if="loading"
        class="loading-overlay"
      >

        <div class="loading-card">

          <div class="loader-ring"></div>

          <div class="loading-title">
            กำลังโหลดรายการจอง
          </div>

          <div class="loading-subtitle">
            กรุณารอสักครู่...
          </div>

        </div>

      </div>

    </transition>

    <div class="flex items-center justify-between mb-4">

      <h2 class="text-2xl font-bold">
        รายการจอง
      </h2>

    </div>

    <BookingTable :services="services" />

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { api } from '@/api/http'
import BookingTable from '@/components/bookings/BookingTable.vue'

const services = ref([])

const loading = ref(false)

async function loadServices(){

  loading.value = true

  try {

    // ใช้ใน BookingTable เพื่อแสดงชื่อบริการ/ตัวกรอง
    services.value = await api('/api/services?all=1')

  } catch (err) {

    console.error(err)

  } finally {

    loading.value = false

  }
}

onMounted(loadServices)
</script>

<style scoped>
.booking-page {
  position: relative;
}

.flex {
  display:flex;
}

.items-center {
  align-items:center;
}

.justify-between {
  justify-content:space-between;
}

.mb-4 {
  margin-bottom:1rem;
}

.text-2xl {
  font-size:1.5rem;
}

.font-bold {
  font-weight:700;
}

/* LOADING */
.loading-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;

  display: flex;
  align-items: center;
  justify-content: center;

  background: rgba(255,255,255,0.78);
  backdrop-filter: blur(5px);
}

.loading-card {
  width: 280px;

  background: white;

  border-radius: 26px;

  padding: 34px 28px;

  display: flex;
  flex-direction: column;
  align-items: center;

  box-shadow:
    0 15px 40px rgba(99,102,241,0.18);
}

.loader-ring {
  width: 76px;
  height: 76px;

  border-radius: 999px;

  border: 6px solid #e0e7ff;
  border-top: 6px solid #4f46e5;

  animation: spin 1s linear infinite;
}

.loading-title {
  margin-top: 18px;

  font-size: 18px;
  font-weight: 700;

  color: #312e81;
}

.loading-subtitle {
  margin-top: 8px;

  font-size: 14px;

  color: #6b7280;
}

@keyframes spin {

  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }

}

.fade-enter-active,
.fade-leave-active {
  transition: all .25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
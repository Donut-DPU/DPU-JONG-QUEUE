<template>
  <div class="history-page">

    <!-- HEADER -->
    <div class="header-wrap mb-4">

      <div>
        <h2 class="text-3xl font-bold">
          ประวัติการจองของฉัน
        </h2>

        <div class="sub-text">
          ตรวจสอบรายการจองย้อนหลังทั้งหมด
        </div>
      </div>

      <!-- LOADING BADGE -->
      <div
        v-if="loading"
        class="loading-badge"
      >
        <v-progress-circular
          indeterminate
          size="18"
          width="2"
          color="white"
        />

        <span>
          กำลังโหลดข้อมูล...
        </span>
      </div>

    </div>

    <!-- TOP LOADING -->
    <v-progress-linear
      v-if="loading"
      indeterminate
      color="primary"
      rounded
      class="mb-4"
    />

    <!-- SKELETON -->
    <div
      v-if="loading"
      class="skeleton-wrap"
    >

      <v-card
        v-for="n in 3"
        :key="n"
        class="skeleton-card mb-4"
      >

        <div class="pa-4">

          <v-skeleton-loader
            type="heading"
            class="mb-3"
          />

          <v-skeleton-loader
            type="text"
            class="mb-2"
          />

          <v-skeleton-loader
            type="text"
            class="mb-2"
          />

          <v-skeleton-loader
            type="button"
            width="120"
          />

        </div>

      </v-card>

    </div>

    <!-- CONTENT -->
    <div
      v-else
      class="fade-in"
    >
      <UserBookingList />
    </div>

  </div>
</template>

<script setup>
import {
  ref,
  onMounted
} from 'vue'

import UserBookingList
  from '@/components/bookings/UserBookingList.vue'

/* LOADING */
const loading = ref(true)

/* MOCK LOADING */
onMounted(() => {

  setTimeout(() => {

    loading.value = false

  }, 900)

})
</script>

<style scoped>
/* PAGE */
.history-page {
  position: relative;
}

/* HEADER */
.header-wrap {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

/* SUB */
.sub-text {
  color: #6b7280;
  margin-top: 4px;
  font-size: 14px;
}

/* LOADING BADGE */
.loading-badge {
  display: flex;
  align-items: center;
  gap: 8px;

  background:
    linear-gradient(
      135deg,
      #2563eb,
      #1d4ed8
    );

  color: white;

  padding: 10px 16px;

  border-radius: 999px;

  font-size: 13px;
  font-weight: 600;

  box-shadow:
    0 6px 18px
    rgba(37,99,235,0.25);
}

/* SKELETON */
.skeleton-wrap {
  display: flex;
  flex-direction: column;
}

.skeleton-card {
  border-radius: 18px;
  border: 1px solid #e5e7eb;
  overflow: hidden;
}

/* FADE */
.fade-in {
  animation: fade .25s ease;
}

@keyframes fade {
  from {
    opacity: 0;
    transform: translateY(6px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* UTIL */
.mb-2 {
  margin-bottom: .5rem;
}

.mb-3 {
  margin-bottom: .75rem;
}

.mb-4 {
  margin-bottom: 1rem;
}

.pa-4 {
  padding: 1rem;
}

.text-3xl {
  font-size: 1.875rem;
}

.font-bold {
  font-weight: 700;
}
</style>
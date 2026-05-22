<template>
  <div>
    <!-- <h2 class="text-3xl font-bold mb-4">ประวัติการจองของฉัน</h2> -->
    <UserBookingList />
  </div>
</template>

<script setup>
import UserBookingList from '@/components/bookings/UserBookingList.vue'
</script>

<style scoped>
.mb-4 { margin-bottom: 1rem; }
.text-3xl { font-size: 1.875rem; font-weight: 700; }
.font-bold { font-weight: 700; }
</style>

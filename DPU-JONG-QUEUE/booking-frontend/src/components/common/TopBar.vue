<template>
  <v-app-bar app color="white" elevation="1">
    <!-- โลโก้ + ชื่อระบบ -->
    <div class="brand-wrap" @click="go('/services')" style="cursor:pointer;">
      <img :src="logo" alt="logo" class="brand-logo" />
      <div class="brand-text">
        <div class="brand-title">DPU JONG QUEUE</div>
        <div class="brand-sub">Queue Booking</div>
      </div>
    </div>

    <!-- เมนู user -->
    <div class="nav ml-8">
      <v-btn
        variant="text"
        :color="isOn('/services') ? 'primary' : undefined"
        class="nav-btn"
        @click="go('/services')"
      >
        บริการ
      </v-btn>
      <v-btn
        variant="text"
        :color="isOn('/my-bookings') ? 'primary' : undefined"
        class="nav-btn"
        @click="go('/my-bookings')"
      >
        ประวัติการจอง
      </v-btn>
    </div>

    <v-spacer />

    <!-- ถ้าหน้าไหนอยากใส่ปุ่มเพิ่มด้านขวา ให้ใช้ slot นี้ -->
    <slot name="right" />

    <v-btn color="error" variant="flat" class="ml-2" @click="logout">
      ออกจากระบบ
    </v-btn>
  </v-app-bar>
</template>

<script setup>
import { useRouter, useRoute } from 'vue-router'
import logo from '@/assets/images/Logo.png'

const router = useRouter()
const route = useRoute()

function go(path) {
  if (route.path !== path) router.push(path)
}

function isOn(path) {
  return route.path.startsWith(path)
}

function logout() {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  router.push('/login')
}
</script>

<style scoped>
.brand-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
}
.brand-logo {
  width: 32px;
  height: 32px;
  object-fit: contain;
}
.brand-text {
  display: flex;
  flex-direction: column;
}
.brand-title {
  font-weight: 800;
  font-size: 15px;
  color: #0b2b62;
}
.brand-sub {
  font-size: 11px;
  color: #6b7280;
}

.nav {
  display: flex;
  align-items: center;
  gap: 4px;
}
.nav-btn {
  text-transform: none;
  font-weight: 600;
}

.ml-2 { margin-left: .5rem; }
.ml-8 { margin-left: 2rem; }

@media (max-width: 600px) {
  .brand-sub { display: none; }
  .ml-8 { margin-left: 1rem; }
  .nav-btn { font-size: 13px; padding-inline: 8px; }
}
</style>

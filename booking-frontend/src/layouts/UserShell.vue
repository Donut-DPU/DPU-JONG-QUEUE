<template>
  <v-app>

    <!-- Drawer ด้านซ้าย -->
    <v-navigation-drawer
      v-model="drawer"
      app
      width="260"
      color="white"
    >
      <!-- โลโก้ + ชื่อระบบ -->
      <div class="brand-wrap">
        <img :src="logo" class="brand-logo" alt="logo" />

        <div class="brand-text">
          <div class="brand-title">
            DPU JONG QUEUE
          </div>

          <div class="brand-sub">
            User Panel
          </div>
        </div>
      </div>

      <v-divider class="mb-2" />

      <!-- เมนูหลัก -->
      <v-list density="comfortable" nav>

        <v-list-item
          prepend-icon="mdi-chair-rolling"
          title="บริการ"
          :active="isOn('/services')"
          @click="go('/services')"
        />

        <v-list-item
          prepend-icon="mdi-history"
          title="นัดหมายของคุณ"
          :active="isOn('/my-appointments')"
          @click="go('/my-appointments')"
        />

        <v-list-item
          prepend-icon="mdi-history"
          title="ประวัติการจอง"
          :active="isOn('/my-bookings')"
          @click="go('/my-bookings')"
        />

      </v-list>

      <!-- ปุ่มด้านล่าง -->
      <template #append>

        <div class="drawer-footer">

          <v-btn
            v-if="isAdmin"
            block
            variant="tonal"
            color="primary"
            class="mb-2"
            @click="go('/admin/services')"
          >
            ไปหน้าแอดมิน
          </v-btn>

          <v-btn
            block
            color="error"
            variant="flat"
            @click="logout"
          >
            ออกจากระบบ
          </v-btn>

        </div>

      </template>
    </v-navigation-drawer>

    <!-- Top bar -->
    <v-app-bar
      app
      color="white"
      elevation="1"
    >
      <v-app-bar-nav-icon
        @click="drawer = !drawer"
      />

      <v-toolbar-title class="font-bold text-primary">
        บริการสำหรับผู้ใช้
      </v-toolbar-title>
    </v-app-bar>

    <!-- ✅ ล็อกไม่ให้หน้าเลื่อน -->
    <v-main class="main-fixed">

      <!-- เฉพาะเนื้อหาเลื่อน -->
      <div class="page-scroll">

        <div class="page">
          <router-view />
        </div>

      </div>

    </v-main>

  </v-app>
</template>

<script setup>
import {
  ref,
  computed
} from 'vue'

import {
  useRouter,
  useRoute
} from 'vue-router'

import logo from '@/assets/images/Logo.png'

const router = useRouter()

const route = useRoute()

// ✅ เปิด drawer ค้างเหมือน admin
const drawer = ref(true)

// อ่าน role จาก localStorage
const user = ref(null)

try {

  const raw = localStorage.getItem('user')

  user.value = raw
    ? JSON.parse(raw)
    : null

} catch (e) {

  user.value = null
}

const isAdmin = computed(() => {

  return (
    user.value?.role || ''
  ).toLowerCase() === 'admin'

})

function go(path) {

  if (route.path !== path) {

    router.push(path)
  }
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

/* =========================
   MAIN FIXED
========================= */

.main-fixed{
  height:100vh;
  overflow:hidden;
  background:#f8fafc;
}

/* =========================
   SCROLL AREA
========================= */

.page-scroll{
  height:100%;
  overflow-y:auto;
  overflow-x:hidden;
}

/* =========================
   PAGE
========================= */

.page{
  max-width:1200px;
  margin:0 auto;
  padding:24px;
}

/* =========================
   BRAND
========================= */

.brand-wrap{
  display:flex;
  align-items:center;
  gap:12px;
  padding:18px 16px 10px;
}

.brand-logo{
  width:42px;
  height:42px;
  object-fit:contain;
}

.brand-text{
  display:flex;
  flex-direction:column;
}

.brand-title{
  font-weight:800;
  font-size:15px;
  letter-spacing:.3px;
  color:#0b2b62;
}

.brand-sub{
  font-size:12px;
  color:#6b7280;
}

/* =========================
   FOOTER
========================= */

.drawer-footer{
  padding:12px 16px 16px;
}

/* =========================
   UTILITY
========================= */

.text-primary{
  color:#0b2b62;
}

.font-bold{
  font-weight:700;
}

.mb-2{
  margin-bottom:.5rem;
}

/* =========================
   SCROLLBAR
========================= */

.page-scroll::-webkit-scrollbar{
  width:8px;
}

.page-scroll::-webkit-scrollbar-thumb{
  background:#cbd5e1;
  border-radius:999px;
}

.page-scroll::-webkit-scrollbar-thumb:hover{
  background:#94a3b8;
}

/* =========================
   MOBILE
========================= */

@media (max-width:768px){

  .page{
    padding:16px;
  }

}

</style>
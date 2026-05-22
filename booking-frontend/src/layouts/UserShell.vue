<template>
  <v-app class="user-layout">

    <!-- Drawer ด้านซ้าย -->
    <v-navigation-drawer
      v-model="drawer"
      app
      width="260"
      color="white"
      class="user-drawer"
      elevation="0"
    >

      <!-- โลโก้ + ชื่อระบบ -->
      <div class="brand-wrap">

        <div class="logo-box">
          <img
            :src="logo"
            alt="logo"
            class="brand-logo"
          />
        </div>

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
      <v-list
        density="comfortable"
        nav
        class="menu-list"
      >

        <v-list-item
          prepend-icon="mdi-chair-rolling"
          title="บริการ"
          :active="isOn('/services')"
          @click="go('/services')"
          rounded="xl"
          class="menu-item"
        />

        <v-list-item
          prepend-icon="mdi-calendar-check"
          title="นัดหมายของคุณ"
          :active="isOn('/my-appointments')"
          @click="go('/my-appointments')"
          rounded="xl"
          class="menu-item"
        />

        <v-list-item
          prepend-icon="mdi-history"
          title="ประวัติการจอง"
          :active="isOn('/my-bookings')"
          @click="go('/my-bookings')"
          rounded="xl"
          class="menu-item"
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
            class="switch-btn"
            @click="go('/admin/services')"
          >
            <v-icon start size="18">
              mdi-shield-crown
            </v-icon>

            ไปหน้าแอดมิน
          </v-btn>

          <v-btn
            block
            color="error"
            variant="flat"
            class="logout-btn"
            @click="logout"
          >
            <v-icon start size="18">
              mdi-logout
            </v-icon>

            ออกจากระบบ
          </v-btn>

        </div>

      </template>
    </v-navigation-drawer>

    <!-- Top bar -->
    <v-app-bar
      app
      color="white"
      elevation="0"
      class="topbar"
    >

      <v-app-bar-nav-icon
        @click="drawer = !drawer"
      />

      <v-toolbar-title class="font-bold text-primary">

        <div class="toolbar-wrap">

          <div>
            ระบบจองคิวสำหรับผู้ใช้
          </div>

          <div class="toolbar-sub">
            ตรวจสอบบริการ · จองคิว · ดูนัดหมาย
          </div>

        </div>

      </v-toolbar-title>

    </v-app-bar>

    <!-- MAIN -->
    <v-main class="main-fixed">

      <div class="page-scroll">

        <div class="page">

          <!-- HERO -->
          <div class="hero-card">

            <div>

              <div class="hero-title">
                ยินดีต้อนรับเข้าสู่ระบบจองคิว
              </div>

              <div class="hero-subtitle">
                จองบริการออนไลน์ · ตรวจสอบสถานะ · จัดการนัดหมายของคุณ
              </div>

            </div>

            <div class="hero-icon">
              <v-icon size="42">
                mdi-account-circle
              </v-icon>
            </div>

          </div>

          <router-view />

        </div>

      </div>

    </v-main>

  </v-app>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import logo from '@/assets/images/Logo.png'

const router = useRouter()
const route = useRoute()

const drawer = ref(true)

const user = ref(null)

try {
  const raw = localStorage.getItem('user')
  user.value = raw ? JSON.parse(raw) : null
} catch {
  user.value = null
}

const isAdmin = computed(() =>
  (user.value?.role || '').toLowerCase() === 'admin'
)

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

/* =========================
   ACTIVE FIX
========================= */

:deep(.v-list-item--active){

  background: linear-gradient(
    135deg,
    #7c3aed,
    #9333ea
  ) !important;

  color: white !important;

  box-shadow: 0 8px 20px rgba(124,58,237,.25);
}

:deep(.v-list-item--active .v-icon){
  color: white !important;
}

:deep(.v-list-item--active .v-list-item-title){
  color: white !important;
  font-weight: 700;
}

/* =========================
   APP
========================= */

.user-layout{
  background:#f5f3ff;
}

.user-drawer{
  border-right:1px solid #ede9fe;
}

/* main */
.main-fixed{
  height:100vh;
  overflow:hidden;
  background: linear-gradient(180deg,#faf5ff 0%,#f5f3ff 100%);
}

.page-scroll{
  height:100%;
  overflow-y:auto;
}

.page{
  max-width:1200px;
  margin:0 auto;
  padding:24px;
}

/* brand */
.brand-wrap{
  display:flex;
  align-items:center;
  gap:14px;
  padding:20px 18px 14px;
}

.logo-box{
  width:52px;
  height:52px;

  border-radius:16px;

  background:#ffffff;

  display:flex;
  align-items:center;
  justify-content:center;

  border:1px solid #ede9fe;

  /* ลด shadow ให้เนียน */
  box-shadow: 0 4px 12px rgba(0,0,0,.06);

  transition: all .2s ease;
}

/* hover เล็กน้อยให้มีชีวิต */
.logo-box:hover{
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(0,0,0,.08);
}

.brand-logo{
  width:36px;
  height:36px;
  object-fit:contain;

  /* ทำให้โลโก้ดูคมขึ้น */
  filter: drop-shadow(0 2px 2px rgba(0,0,0,.08));
}

.brand-title{
  font-weight:800;
  font-size:15px;
  color:#581c87;
}

.brand-sub{
  font-size:12px;
  color:#8b5cf6;
}

/* menu */
.menu-item{
  margin-bottom:6px;
  transition:.2s;
}

.menu-item:hover{
  transform:translateX(2px);
}

/* topbar */
.topbar{
  background: rgba(255,255,255,.92) !important;
  backdrop-filter: blur(10px);
}

/* hero */
.hero-card{
  background: linear-gradient(135deg,#7c3aed,#9333ea);
  border-radius:26px;
  padding:26px;
  margin-bottom:24px;
  color:white;
  display:flex;
  justify-content:space-between;
  align-items:center;
}

.hero-title{
  font-size:28px;
  font-weight:800;
}

.hero-subtitle{
  font-size:14px;
  opacity:.9;
}

.hero-icon{
  width:76px;
  height:76px;
  background:rgba(255,255,255,.14);
  border-radius:24px;
  display:flex;
  align-items:center;
  justify-content:center;
}

/* =========================
   BUTTON FIX (เท่ากันกับ Admin)
========================= */

.switch-btn,
.logout-btn{

  height:44px;
  min-height:44px;

  border-radius:14px;

  font-weight:700;

  text-transform:none;

  font-size:14px;

  padding:0 14px;
}

/* icon ให้บาลานซ์ */
.switch-btn .v-icon,
.logout-btn .v-icon{
  font-size:18px;
}

/* spacing footer */
.drawer-footer{
  padding:14px 16px 18px;
  display:flex;
  flex-direction:column;
  gap:8px;
}

/* util */
.mb-2{ margin-bottom:.5rem; }
.text-primary{ color:#581c87; }

</style>
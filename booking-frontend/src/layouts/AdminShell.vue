<template>
  <v-app class="admin-layout">

    <!-- Sidebar -->
    <v-navigation-drawer
      v-model="drawer"
      app
      width="255"
      class="admin-drawer"
      elevation="0"
    >

      <div class="drawer-inner">

        <!-- BRAND -->
        <div class="brand-wrap">

          <div class="logo-box">
            <img :src="logo" alt="logo" class="brand-logo" />
          </div>

          <div class="brand-text">

            <div class="brand-title">
              DPU JONG QUEUE
            </div>

            <div class="brand-sub">
              Admin Panel
            </div>

          </div>

        </div>

        <div class="brand-divider"></div>

        <!-- MENU -->
        <v-list
          density="comfortable"
          nav
          class="menu-list"
        >

          <v-list-item
            v-for="it in items"
            :key="it.to"
            :to="it.to"
            :title="it.title"
            :prepend-icon="it.icon"
            :active="route.path === it.to"
            rounded="xl"
            class="menu-item"
          />

        </v-list>

        <!-- FOOTER -->
        <div class="drawer-footer">

          <v-btn
            block
            variant="tonal"
            class="switch-btn"
            @click="go('/services')"
          >
            <v-icon start size="18">mdi-account</v-icon>
            ไปหน้าผู้ใช้
          </v-btn>

          <v-btn
            block
            class="logout-btn mt-2"
            @click="logout"
          >
            <v-icon start size="18">mdi-logout</v-icon>
            ออกจากระบบ
          </v-btn>

        </div>

      </div>

    </v-navigation-drawer>

    <!-- TOPBAR -->
    <v-app-bar
      app
      elevation="0"
      color="white"
      class="topbar"
    >

      <v-app-bar-nav-icon @click="drawer = !drawer" />

      <v-toolbar-title class="font-bold text-primary">

        <div class="toolbar-wrap">
          <div class="toolbar-title">แดชบอร์ดผู้ดูแลระบบ</div>
        </div>

      </v-toolbar-title>

    </v-app-bar>

    <!-- MAIN -->
    <v-main class="main-bg">
      <div class="page-scroll">
        <div class="page">

          <div class="hero-card">

            <div>
              <div class="hero-title">ระบบจัดการคิวออนไลน์</div>
              <div class="hero-subtitle">
                ตรวจสอบคิว · จัดการบริการ · ดูตารางนัดหมาย
              </div>
            </div>

            <div class="hero-icon">
              <v-icon size="42">mdi-view-dashboard</v-icon>
            </div>

          </div>

          <router-view />

        </div>
      </div>
    </v-main>

  </v-app>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import logo from '@/assets/images/Logo.png'

const drawer = ref(true)

const router = useRouter()
const route = useRoute()

const items = [
  { title: 'บริการ', to: '/admin/services', icon: 'mdi-wrench' },
  { title: 'การจอง', to: '/admin/bookings', icon: 'mdi-calendar-check' },
  { title: 'ตารางคิวนัดหมาย', to: '/admin/schedule', icon: 'mdi-table' },
  { title: 'ตรวจสอบคิวว่าง', to: '/admin/schedule-week', icon: 'mdi-calendar-week' },
  { title: 'จัดการ Admin', to: '/admin/admins', icon: 'mdi-account-cog' }
]

function go(path) {
  router.push(path)
}

function logout() {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  router.push('/login')
}
</script>

<style scoped>

/* =========================
   DRAWER BRAND FIX (ปรับ spacing)
========================= */

.brand-wrap{
  display:flex;
  align-items:center;
  gap:12px; /* เดิม 14 -> ให้กระชับขึ้น */
  padding:18px 18px 10px;
}

.brand-text{
  display:flex;
  flex-direction:column;
}

/* 🔥 FIX: ทำให้ DPU JONG / QUEUE ชิดขึ้น */
.brand-title{
  font-weight:800;
  font-size:15px;
  color:#581c87;
  line-height:1.05;     /* สำคัญ */
  margin:0;
  padding:0;
}

/* Admin Panel */
.brand-sub{
  font-size:12px;
  color:#8b5cf6;
  margin-top:2px;
}

/* divider */
.brand-divider{
  height:1px;
  margin:8px 16px;
  background:#ede9fe;
}

/* =========================
   TOPBAR DIVIDER FIX
========================= */

/* 🔥 เส้นใต้แดชบอร์ดผู้ดูแลระบบ */
.topbar{
  border-bottom:1px solid #d8d5e6;
}

/* =========================
   ORIGINAL STYLE (คงเดิม)
========================= */

.admin-drawer :deep(.v-navigation-drawer__content){
  height: 100%;
}

.drawer-inner{
  height: 100%;
  display: flex;
  flex-direction: column;
}

.menu-list{
  flex: 1;
  overflow-y: auto;
  padding: 10px;
}

.drawer-footer{
  margin-top: auto;
  padding: 14px 16px 18px;
}

.logo-box{
  width:54px;
  height:54px;
  border-radius:16px;
  background:#fff;
  border:1px solid #ede9fe;
  display:flex;
  align-items:center;
  justify-content:center;
  box-shadow:0 4px 12px rgba(0,0,0,.06);
}

.brand-logo{
  width:36px;
  height:36px;
  object-fit:contain;
}

:deep(.v-list-item--active){
  background:linear-gradient(135deg,#7c3aed,#9333ea) !important;
  color:white !important;
}

:deep(.v-list-item--active .v-icon){
  color:white !important;
}

.switch-btn,
.logout-btn{
  height:44px;
  border-radius:14px;
  font-weight:700;
  text-transform:none;
  font-size:14px;
}

.switch-btn{
  background:#ede9fe !important;
  color:#6d28d9 !important;
}

.logout-btn{
  background:linear-gradient(135deg,#dc2626,#ef4444) !important;
  color:white !important;
}

.admin-layout{
  background:#f5f3ff;
}

.admin-drawer{
  border-right:1px solid #ede9fe;
}

.main-bg{
  height:100vh;
  overflow:hidden;
}

.page-scroll{
  height:100%;
  overflow-y:auto;
}

.page{
  max-width:1600px;
  margin:0 auto;
  padding:24px;
}

.hero-card{
  background:linear-gradient(135deg,#6d28d9,#8b5cf6);
  border-radius:28px;
  padding:30px;
  margin-bottom:24px;
  color:white;
  display:flex;
  justify-content:space-between;
  align-items:center;
}

.hero-title{
  font-size:30px;
  font-weight:900;
}

.hero-subtitle{
  font-size:14px;
  opacity:.92;
}

.hero-icon{
  width:78px;
  height:78px;
  border-radius:24px;
  background:rgba(255,255,255,.14);
  display:flex;
  align-items:center;
  justify-content:center;
}

.text-primary{ color:#4c1d95; }

</style>
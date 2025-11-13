<template>
  <v-app>
    <!-- Sidebar แบบกดแล้วค้าง -->
    <v-navigation-drawer
      v-model="drawer"
      app
      color="white"
      width="260"
    >
      <!-- Logo + Brand -->
      <div class="brand-wrap">
        <img :src="logo" alt="logo" class="brand-logo" />
        <div class="brand-text">
          <div class="brand-title">DPU JONG QUEUE</div>
          <div class="brand-sub">Admin Panel</div>
        </div>
      </div>

      <v-divider class="mb-2" />

      <!-- Menu -->
      <v-list density="comfortable" nav>
        <v-list-item
          v-for="it in items"
          :key="it.to"
          :to="it.to"
          :title="it.title"
          :prepend-icon="it.icon"
          :active="route.path.startsWith(it.to)"
        />
      </v-list>

      <template #append>
        <div class="drawer-footer">
          <v-btn block variant="tonal" color="primary" @click="go('/services')">
            ไปหน้าผู้ใช้
          </v-btn>

          <v-btn block variant="flat" class="mt-2" color="error" @click="logout">
            ออกจากระบบ
          </v-btn>
        </div>
      </template>
    </v-navigation-drawer>

    <!-- Top bar -->
    <v-app-bar app elevation="1" color="white">
      <v-app-bar-nav-icon @click="drawer = !drawer" />
      <v-toolbar-title class="font-bold text-primary">
        แดชบอร์ดผู้ดูแลระบบ
      </v-toolbar-title>
    </v-app-bar>

    <v-main>
      <div class="page">
        <router-view />
      </div>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import logo from '@/assets/images/Logo.png'

const drawer = ref(true)   // 👈 เปิดค้างเป็นค่าเริ่มต้น

const router = useRouter()
const route = useRoute()

const items = [
  { title: 'บริการ', to: '/admin/services', icon: 'mdi-wrench' },
  { title: 'การจอง', to: '/admin/bookings', icon: 'mdi-calendar-check' },
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
.page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

/* Brand */
.brand-wrap {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 18px 16px 10px;
}
.brand-logo {
  width: 42px;
  height: 42px;
  object-fit: contain;
}
.brand-title {
  font-weight: 800;
  font-size: 15px;
  letter-spacing: .3px;
  color: #0b2b62;
}
.brand-sub {
  font-size: 12px;
  color: #6b7280;
}

.text-primary {
  color: #0b2b62;
}

.drawer-footer {
  padding: 12px 16px 16px;
}

.mt-2 { margin-top: .5rem; }
.mb-2 { margin-bottom: .5rem; }
.font-bold { font-weight: 700; }
</style>

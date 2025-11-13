// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'

// Public
import LoginPage from '@/pages/LoginPage.vue'
import RegisterPage from '@/pages/RegisterPage.vue'

// User pages
import UserShell from '@/layouts/UserShell.vue'
import UserServicesPage from '@/pages/UserServicesPage.vue'
import UserBookingsPage from '@/pages/UserBookingsPage.vue'

// Admin pages + layout
import AdminShell from '@/layouts/AdminShell.vue'
import AdminServicesPage from '@/pages/admin/AdminServicesPage.vue'
import AdminBookingsPage from '@/pages/admin/AdminBookingsPage.vue'

const routes = [
  // 🔓 public
  { path: '/login', component: LoginPage },
  { path: '/register', component: RegisterPage },

  // 👉 root เปล่า ส่งไป login
  { path: '/', redirect: '/login' },

  // 👤 USER LAYOUT + children
  {
    path: '/',
    component: UserShell,
    children: [
      { path: 'services', component: UserServicesPage },
      { path: 'my-bookings', component: UserBookingsPage }
    ]
  },

  // 🛠 ADMIN LAYOUT + children
  {
    path: '/admin',
    component: AdminShell,
    beforeEnter: (_, __, next) => {
      const raw = localStorage.getItem('user')
      const me = raw ? JSON.parse(raw) : null
      if (!me || (me.role || '').toLowerCase() !== 'admin') {
        return next('/services')
      }
      next()
    },
    children: [
      { path: '', redirect: '/admin/services' },
      { path: 'services', component: AdminServicesPage },
      { path: 'bookings', component: AdminBookingsPage }
    ]
  },

  // unknown routes → login
  { path: '/:pathMatch(.*)*', redirect: '/login' }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// ✅ หน้า public ที่ไม่ต้องมี token
const PUBLIC_PATHS = ['/login', '/register']

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')

  // ถ้าเป็นหน้า public
  if (PUBLIC_PATHS.includes(to.path)) {
    // มี token แล้ว → เด้งไปหน้า services
    if (token) return next('/services')
    return next()
  }

  // หน้าอื่นต้องมี token
  if (!token) return next('/login')

  next()
})

export default router

import { createRouter, createWebHistory } from 'vue-router'

// Public
import LoginPage from '@/pages/LoginPage.vue'
import RegisterPage from '@/pages/RegisterPage.vue'

// User
import UserShell from '@/layouts/UserShell.vue'
import UserServicesPage from '@/pages/UserServicesPage.vue'
import UserBookingsPage from '@/pages/UserBookingsPage.vue'
import UserAppointmentsPage from '@/pages/UserAppointmentsPage.vue'

// Admin
import AdminShell from '@/layouts/AdminShell.vue'
import AdminServicesPage from '@/pages/admin/AdminServicesPage.vue'
import AdminBookingsPage from '@/pages/admin/AdminBookingsPage.vue'
import AdminSchedulePage from '@/pages/admin/AdminSchedulePage.vue'
import AdminWeekViewPage from '@/pages/admin/AdminWeekViewPage.vue'
import CreateAdmin from '@/pages/admin/CreateAdmin.vue'
import AdminManagement from '@/pages/admin/AdminManagement.vue'

const routes = [
  { path: '/login', component: LoginPage },
  { path: '/register', component: RegisterPage },

  { path: '/', redirect: '/login' },

  {
    path: '/',
    component: UserShell,
    children: [
      { path: 'services', component: UserServicesPage },
      { path: 'my-bookings', component: UserBookingsPage },
      { path: 'my-appointments', component: UserAppointmentsPage }
    ]
  },

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
      { path: 'bookings', component: AdminBookingsPage },
      { path: 'schedule', component: AdminSchedulePage },
      { path: 'schedule-week', component: AdminWeekViewPage },
      { path: 'create-admin', component: CreateAdmin },
      { path: 'admins', component: AdminManagement }
    ]
  },

  { path: '/:pathMatch(.*)*', redirect: '/login' }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

const PUBLIC_PATHS = ['/login', '/register']

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')

  if (PUBLIC_PATHS.includes(to.path)) {
    if (token) return next('/services')
    return next()
  }

  if (!token) return next('/login')

  next()
})

export default router
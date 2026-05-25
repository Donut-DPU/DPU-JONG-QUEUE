<template>
  <div class="p-6">

    <!-- ================= LOADING OVERLAY ================= -->
    <transition name="fade">
      <div
        v-if="loading"
        class="loading-overlay"
      >
        <div class="loading-card">

          <v-progress-circular
            indeterminate
            size="72"
            width="6"
            color="primary"
          />

          <div class="loading-title">
            กำลังโหลดข้อมูล
          </div>

          <div class="loading-subtitle">
            กรุณารอสักครู่...
          </div>

        </div>
      </div>
    </transition>

    <!-- HEADER -->
    <div class="flex items-center justify-between mb-4">

      <h2 class="text-3xl font-bold">
        Admin Dashboard
      </h2>

      <div>

        <v-btn
          class="mr-2"
          @click="goServices"
        >
          ไปหน้า User Services
        </v-btn>

        <v-btn
          color="error"
          @click="logout"
        >
          ออกจากระบบ
        </v-btn>

      </div>

    </div>

    <!-- ERROR -->
    <v-alert
      v-if="errorMsg"
      type="error"
      variant="tonal"
      class="mb-4"
      :text="errorMsg"
      closable
      @click:close="errorMsg = ''"
    />

    <!-- TABS -->
    <v-tabs
      v-model="tab"
      fixed-tabs
      class="dashboard-tabs"
    >

      <v-tab value="services">
        บริการ
      </v-tab>

      <v-tab value="bookings">
        รายการจอง
      </v-tab>

    </v-tabs>

    <v-window
      v-model="tab"
      class="mt-4"
    >

      <!-- ================= SERVICES ================= -->
      <v-window-item value="services">

        <v-card
          class="dashboard-card"
          elevation="2"
        >

          <div class="mb-4 flex items-center">

            <v-btn
              color="primary"
              class="add-btn"
              @click="openCreate"
              :disabled="loading"
            >
              + เพิ่มบริการ
            </v-btn>

            <v-spacer />

            <v-chip
              color="primary"
              variant="tonal"
              class="service-count"
            >
              ทั้งหมด {{ services.length }} บริการ
            </v-chip>

          </div>

          <template v-if="!loading && services.length">

            <v-table class="service-table">

              <thead>
                <tr>

                  <th>ชื่อบริการ</th>

                  <th>เวลาเปิด-ปิด</th>

                  <th>คิว/สล็อต</th>

                  <th>ระยะ/นาที</th>

                  <th>สถานะ</th>

                  <th style="width:180px;"></th>

                </tr>
              </thead>

              <tbody>

                <tr
                  v-for="s in services"
                  :key="s.id"
                >

                  <td class="font-medium">
                    {{ s.name }}
                  </td>

                  <td>
                    {{ s.dailyStartTime }}
                    -
                    {{ s.dailyEndTime }}
                  </td>

                  <td>
                    {{ s.slotCapacity }}
                  </td>

                  <td>
                    {{ s.slotDurationMin }}
                  </td>

                  <td>

                    <v-chip
                      size="small"
                      :color="s.active ? 'success' : 'grey'"
                    >
                      {{ s.active ? 'เปิด' : 'ปิด' }}
                    </v-chip>

                  </td>

                  <td>

                    <div class="action-wrap">

                      <v-btn
                        size="small"
                        class="edit-btn"
                        @click="openEdit(s)"
                      >
                        แก้ไข
                      </v-btn>

                      <v-btn
                        size="small"
                        color="error"
                        @click="removeService(s)"
                      >
                        ลบ
                      </v-btn>

                    </div>

                  </td>

                </tr>

              </tbody>

            </v-table>

          </template>

          <!-- EMPTY -->
          <v-alert
            v-else-if="!loading && !services.length"
            type="info"
            variant="tonal"
            text="ยังไม่มีบริการในระบบ กรุณาเพิ่มบริการใหม่"
          />

        </v-card>

        <!-- SERVICE EDITOR -->
        <ServiceEditor
          v-if="dialog"
          :service="editing"
          @close="dialog=false; editing=null"
          @saved="onSaved"
        />

      </v-window-item>

      <!-- ================= BOOKINGS ================= -->
      <v-window-item value="bookings">

        <v-card
          class="dashboard-card"
          elevation="2"
        >

          <BookingTable :services="services" />

        </v-card>

      </v-window-item>

    </v-window>

  </div>
</template>

<script setup>
import {
  ref,
  onMounted
} from 'vue'

import { api } from '@/api/http'

import ServiceEditor
  from '@/components/services/ServiceEditor.vue'

import BookingTable
  from '@/components/bookings/BookingTable.vue'

const tab = ref('services')

const services = ref([])

const dialog = ref(false)

const editing = ref(null)

const loading = ref(false)

const errorMsg = ref('')

/* ===== helper ===== */

function ensureAdmin() {

  const raw =
    localStorage.getItem('user')

  const me =
    raw ? JSON.parse(raw) : null

  const role =
    (me?.role || '').toLowerCase()

  if (!localStorage.getItem('token')) {

    window.location.href = '/login'

    return false
  }

  if (role !== 'admin') {

    // ถ้าไม่ใช่ admin
    window.location.href = '/services'

    return false
  }

  return true
}

/* ===== LOAD SERVICES ===== */

async function loadServices() {

  loading.value = true

  errorMsg.value = ''

  try {

    services.value =
      await api('/api/services?all=1')

  } catch (e) {

    errorMsg.value =
      e.message || 'โหลดบริการไม่สำเร็จ'

    services.value = []

  } finally {

    loading.value = false
  }
}

/* ===== CREATE ===== */

function openCreate() {

  editing.value = null

  dialog.value = true
}

/* ===== EDIT ===== */

function openEdit(s) {

  editing.value = { ...s }

  dialog.value = true
}

/* ===== DELETE ===== */

async function removeService(s) {

  if (
    !confirm(`ลบบริการ "${s.name}" ?`)
  ) return

  loading.value = true

  errorMsg.value = ''

  try {

    await api(
      `/api/services/${s.id}`,
      {
        method: 'DELETE'
      }
    )

    await loadServices()

  } catch (e) {

    errorMsg.value =
      e.message || 'ลบบริการไม่สำเร็จ'

  } finally {

    loading.value = false
  }
}

/* ===== SAVE ===== */

async function onSaved() {

  dialog.value = false

  editing.value = null

  await loadServices()
}

/* ===== LOGOUT ===== */

function logout() {

  localStorage.removeItem('token')

  localStorage.removeItem('user')

  window.location.href = '/login'
}

/* ===== GO USER PAGE ===== */

function goServices() {

  window.location.href = '/services'
}

/* ===== INIT ===== */

onMounted(async () => {

  if (!ensureAdmin()) return

  await loadServices()

})
</script>

<style scoped>
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

.mt-4 {
  margin-top:1rem;
}

.text-3xl {
  font-size:1.875rem;
}

.font-bold {
  font-weight:700;
}

.font-medium {
  font-weight:500;
}

.mr-2 {
  margin-right:.5rem;
}

.ml-2 {
  margin-left:.5rem;
}

.p-6 {
  padding:1.5rem;
}

/* ================= LOADING ================= */

.loading-overlay {
  position: fixed;
  inset: 0;

  background:
    rgba(255,255,255,0.82);

  backdrop-filter: blur(6px);

  display:flex;
  align-items:center;
  justify-content:center;

  z-index:9999;
}

.loading-card {
  background:white;

  border-radius:24px;

  padding:36px 42px;

  min-width:280px;

  display:flex;
  flex-direction:column;
  align-items:center;

  box-shadow:
    0 15px 40px rgba(0,0,0,0.12);
}

.loading-title {
  margin-top:18px;

  font-size:20px;
  font-weight:700;

  color:#111827;
}

.loading-subtitle {
  margin-top:6px;

  font-size:14px;

  color:#6b7280;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity .2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* ================= CARD ================= */

.dashboard-card {
  border-radius:20px;

  padding:18px;

  border:1px solid #eef2f7;
}

.dashboard-tabs {
  background:white;

  border-radius:14px;

  border:1px solid #e5e7eb;
}

/* ================= BUTTON ================= */

.add-btn {
  border-radius:12px;

  font-weight:600;

  height:42px;
}

.edit-btn {
  background:#f3f4f6;
}

.action-wrap {
  display:flex;
  align-items:center;
  gap:8px;
}

.service-count {
  font-weight:600;
}

/* ================= TABLE ================= */

.service-table {
  border-radius:14px;

  overflow:hidden;
}

.service-table thead th {
  font-weight:700;

  color:#374151;

  background:#f9fafb;
}
</style>
<template>
  <div>

    <!-- HEADER -->
    <div class="header-wrap mb-4">

      <div>
        <h2 class="text-2xl font-bold">
          นัดหมายของคุณ
        </h2>

        <div class="sub-text">
          ตรวจสอบนัดหมายที่กำลังจะมาถึง
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
          กำลังโหลดนัดหมาย...
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

    <!-- ERROR -->
    <v-alert
      v-if="errorMsg"
      type="error"
      variant="tonal"
      class="mb-3"
      :text="errorMsg"
      closable
      @click:close="errorMsg = ''"
    />

    <!-- SKELETON -->
    <v-row v-if="loading">

      <v-col
        v-for="n in 6"
        :key="n"
        cols="12"
        md="6"
        lg="4"
      >

        <v-card
          class="appointment-card skeleton-card"
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
              type="text"
              class="mb-2"
            />

            <v-skeleton-loader
              type="chip"
              width="100"
            />

          </div>

        </v-card>

      </v-col>

    </v-row>

    <!-- EMPTY -->
    <v-alert
      v-else-if="upcoming.length === 0"
      type="info"
      variant="tonal"
      border="start"
      class="empty-alert"
    >
      ตอนนี้คุณไม่มีนัดหมายที่กำลังจะมาถึง
    </v-alert>

    <!-- APPOINTMENTS -->
    <v-row v-else>

      <v-col
        v-for="b in upcoming"
        :key="b.id"
        cols="12"
        md="6"
        lg="4"
      >

        <v-card
          class="appointment-card fade-in"
          elevation="1"
        >

          <v-card-title class="text-h6 mb-1">
            {{ serviceNameOf(b) }}
          </v-card-title>

          <v-card-subtitle
            class="mb-3 text-gray-600"
          >
            {{
              formatBookingCode(
                b.bookingCode
              ) || `#${b.id}`
            }}
          </v-card-subtitle>

          <v-card-text class="card-body">

            <div class="row">
              <span class="label">
                วันที่
              </span>

              <span class="value">
                {{ fmtDate(b.date) }}
              </span>
            </div>

            <div class="row">
              <span class="label">
                เวลา
              </span>

              <span class="value">
                {{ b.time }}
              </span>
            </div>

            <div class="row">
              <span class="label">
                หมายเหตุ
              </span>

              <span class="value">
                {{ b.note || '—' }}
              </span>
            </div>

            <div class="row status-row">

              <span class="label">
                สถานะ
              </span>

              <span class="value">

                <v-chip
                  size="small"
                  class="status-chip"
                  :color="statusColor(b.status)"
                  variant="flat"
                >
                  {{ statusLabel(b.status) }}
                </v-chip>

              </span>

            </div>

          </v-card-text>

        </v-card>

      </v-col>

    </v-row>

  </div>
</template>

<script setup>
import {
  ref,
  computed,
  onMounted
} from 'vue'

import { api } from '@/api/http'

/* STATE */
const loading = ref(false)

const errorMsg = ref('')

const items = ref([])

const serviceMap = ref({})

/* ARRAY */
function toArray(res) {

  if (Array.isArray(res)) {
    return res
  }

  if (
    res &&
    Array.isArray(res.items)
  ) {

    return res.items
  }

  return []
}

/* LOAD SERVICE MAP */
async function loadServicesMap() {

  try {

    const res =
      await api(
        '/api/services',
        { auth: false }
      )

    const arr = toArray(res)

    const map = {}

    for (const s of arr) {

      map[s.id] = s.name
    }

    serviceMap.value = map

  } catch {

    // ignore

  }
}

/* SERVICE NAME */
function serviceNameOf(b) {

  return (
    b.service?.name ||
    b.serviceName ||
    (
      b.service_id != null
        ? serviceMap.value[b.service_id]
        : '-'
    ) ||
    '-'
  )
}

/* LOAD */
async function load() {

  loading.value = true

  errorMsg.value = ''

  try {

    const res =
      await api('/api/bookings/mine')

    items.value = toArray(res)

    if (
      items.value.some(
        b =>
          !b.service?.name &&
          !b.serviceName &&
          b.service_id
      )
    ) {

      await loadServicesMap()
    }

  } catch (e) {

    errorMsg.value =
      e.message ||
      'โหลดนัดหมายไม่สำเร็จ'

  } finally {

    loading.value = false
  }
}

onMounted(load)

/* DATETIME */
function bookingDateTime(b) {

  try {

    return new Date(
      `${b.date}T${b.time}:00`
    )

  } catch {

    return null
  }
}

/* UPCOMING */
function isUpcoming(b) {

  const dt =
    bookingDateTime(b)

  if (!dt) return false

  const now = new Date()

  const st =
    (b.status || 'pending')

  const activeStatuses = [
    'pending',
    'confirmed'
  ]

  if (
    !activeStatuses.includes(st)
  ) {

    return false
  }

  return (
    dt.getTime() >= now.getTime()
  )
}

const upcoming = computed(() =>

  items.value
    .filter(isUpcoming)
    .sort((a, b) => {

      const da =
        bookingDateTime(a)
          ?.getTime() || 0

      const db =
        bookingDateTime(b)
          ?.getTime() || 0

      return da - db
    })

)

/* STATUS */
function statusLabel(st) {

  switch (
    (st || 'pending')
  ) {

    case 'pending':
      return 'รอยืนยัน'

    case 'confirmed':
      return 'ยืนยันแล้ว'

    case 'checked_in':
      return 'เข้ารับบริการแล้ว'

    case 'completed':
      return 'เสร็จสิ้น'

    case 'cancelled':
      return 'ยกเลิก'

    case 'no_show':
      return 'ไม่มารับบริการ'

    default:
      return st
  }
}

function statusColor(st) {

  switch (
    (st || 'pending')
  ) {

    case 'pending':
      return 'grey'

    case 'confirmed':
      return 'primary'

    case 'checked_in':
      return 'success'

    case 'completed':
      return 'success'

    case 'cancelled':
      return 'error'

    case 'no_show':
      return 'warning'

    default:
      return 'grey'
  }
}

/* DATE */
function fmtDate(d) {

  try {

    const [y, m, day] =
      d.split('-')

    return `${day}-${m}-${y}`

  } catch {

    return d
  }
}

/* BOOKING CODE */
function formatBookingCode(code) {

  if (!code) return '-'

  const parts = code.split('-')

  if (parts.length !== 4) {
    return code
  }

  const [
    bk,
    year,
    month,
    run
  ] = parts

  return (
    `${bk}-${year}-${month}-` +
    `${String(run).padStart(4, '0')}`
  )
}
</script>

<style scoped>
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

/* BADGE */
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

/* CARD */
.appointment-card {
  border-radius: 16px;
  border: 1px solid #e5e7eb;

  transition: .25s ease;
}

.appointment-card:hover {
  transform: translateY(-4px);

  box-shadow:
    0 10px 24px
    rgba(0,0,0,0.10);
}

/* SKELETON */
.skeleton-card {
  overflow: hidden;
}

/* BODY */
.card-body {
  font-size: 14px;
}

/* ROW */
.row {
  display: flex;
  justify-content: space-between;

  margin-bottom: 8px;
}

.label {
  color: #6b7280;
}

.value {
  font-weight: 500;
}

/* STATUS */
.status-row {
  margin-top: 14px;
}

.status-chip {
  min-width: 90px;
  justify-content: center;
}

/* EMPTY */
.empty-alert {
  border-radius: 14px;
}

/* FADE */
.fade-in {
  animation: fade .25s ease;
}

@keyframes fade {

  from {
    opacity: 0;
    transform: translateY(8px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* UTIL */
.text-2xl {
  font-size: 1.5rem;
}

.font-bold {
  font-weight: 700;
}

.mb-1 {
  margin-bottom: .25rem;
}

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

.text-gray-600 {
  color: #6b7280;
}
</style>
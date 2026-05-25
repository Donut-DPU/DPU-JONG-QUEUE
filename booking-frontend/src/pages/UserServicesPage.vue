<template>
  <div>
    <!-- HEADER -->
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-2xl font-bold">
        เลือกบริการ
      </h2>

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
        <span>กำลังโหลดบริการ...</span>
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

    <!-- หมวด -->
    <div class="mb-4">
      <div class="font-bold mb-2">
        หมวดหมู่
      </div>

      <v-chip-group
        v-model="selectedCategory"
        mandatory
      >
        <v-chip value="all">
          ทั้งหมด
        </v-chip>

        <v-chip
          v-for="c in categories"
          :key="c.id"
          :value="c.id"
          filter
        >
          {{ c.name }}
        </v-chip>
      </v-chip-group>
    </div>

    <!-- ชื่อหมวด -->
    <div class="mb-3 text-gray-600">
      หมวด:
      {{ currentCategoryName }}
    </div>

    <!-- SKELETON -->
    <v-row v-if="loading">
      <v-col
        v-for="n in 6"
        :key="n"
        cols="12"
        md="6"
        lg="4"
      >
        <v-card class="service-card skeleton-card">
          <v-skeleton-loader
            type="image"
            height="180"
          />

          <div class="pa-4">
            <v-skeleton-loader
              type="heading"
              class="mb-2"
            />

            <v-skeleton-loader
              type="text"
              class="mb-2"
            />

            <v-skeleton-loader
              type="paragraph"
            />

            <v-skeleton-loader
              type="button"
              class="mt-4"
            />
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- SERVICES -->
    <v-row
      v-else-if="services.length"
    >
      <v-col
        v-for="s in services"
        :key="s.id"
        cols="12"
        md="6"
        lg="4"
      >
        <v-card class="service-card">

          <!-- รูป -->
          <v-img
            v-if="s.image_url"
            :src="s.image_url"
            height="180"
            cover
          />

          <v-img
            v-else
            src="https://via.placeholder.com/400x300"
            height="180"
            cover
          />

          <!-- ชื่อ -->
          <v-card-title class="title-text">
            {{ s.name }}
          </v-card-title>

          <!-- เวลา -->
          <v-card-subtitle>
            {{ s.dailyStartTime }}
            -
            {{ s.dailyEndTime }}
          </v-card-subtitle>

          <!-- รายละเอียด -->
          <v-card-text class="description-text">
            {{
              s.description ||
              "ไม่มีรายละเอียด"
            }}
          </v-card-text>

          <!-- ปุ่ม -->
          <v-card-actions class="mt-auto">
            <v-btn
              color="primary"
              block
              @click="openBooking(s)"
            >
              จอง
            </v-btn>
          </v-card-actions>

        </v-card>
      </v-col>
    </v-row>

    <!-- EMPTY -->
    <v-alert
      v-else
      type="info"
      variant="tonal"
      border="start"
      class="empty-alert"
    >
      ไม่มีบริการในหมวดหมู่นี้
    </v-alert>

    <!-- Dialog -->
    <BookingDialog
      v-if="selectedService"
      :service="selectedService"
      @close="selectedService = null"
      @booked="reload"
    />
  </div>
</template>

<script setup>
import {
  ref,
  watch,
  onMounted,
  computed
} from "vue";

import { api } from "@/api/http";

import BookingDialog
  from "@/components/bookings/BookingDialog.vue";

/* DATA */
const categories = ref([]);
const services = ref([]);

const selectedCategory = ref("all");
const selectedService = ref(null);

const loading = ref(false);

/* LOAD CATEGORY */
async function loadCategories() {

  try {

    categories.value =
      await api("/api/categories");

  } catch (err) {

    console.error(err);
  }
}

/* LOAD SERVICES */
async function loadServices() {

  loading.value = true;

  try {

    let url = "/api/services";

    if (
      selectedCategory.value !== "all"
    ) {

      url +=
        `?categoryId=${selectedCategory.value}`;
    }

    services.value =
      await api(url);

  } catch (err) {

    console.error(err);

    services.value = [];

  } finally {

    loading.value = false;
  }
}

/* CATEGORY NAME */
const currentCategoryName = computed(() => {

  if (
    selectedCategory.value === "all"
  ) {

    return "ทั้งหมด";
  }

  const c =
    categories.value.find(
      (c) =>
        c.id === selectedCategory.value
    );

  return c ? c.name : "-";
});

/* OPEN BOOKING */
function openBooking(service) {

  selectedService.value = service;
}

/* RELOAD */
function reload() {

  loadServices();
}

/* WATCH */
watch(
  selectedCategory,
  loadServices
);

/* INIT */
onMounted(async () => {

  loading.value = true;

  await loadCategories();

  await loadServices();

  loading.value = false;
});
</script>

<style scoped>
/* CARD */
.service-card {
  height: 100%;
  display: flex;
  flex-direction: column;

  border-radius: 16px;

  border: 1px solid #e5e7eb;

  overflow: hidden;

  transition: 0.25s ease;
}

.service-card:hover {
  transform: translateY(-4px);

  box-shadow:
    0 10px 24px
    rgba(0,0,0,0.12);
}

/* SKELETON */
.skeleton-card {
  overflow: hidden;
}

/* TITLE */
.title-text {
  display: -webkit-box;

  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;

  overflow: hidden;
}

/* DESC */
.description-text {
  display: -webkit-box;

  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;

  overflow: hidden;

  min-height: 60px;
}

/* LOADING BADGE */
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

  padding: 8px 14px;

  border-radius: 999px;

  font-size: 13px;
  font-weight: 600;

  box-shadow:
    0 4px 12px
    rgba(37,99,235,0.25);
}

/* EMPTY */
.empty-alert {
  border-radius: 14px;
}

/* TEXT */
.text-gray-600 {
  color: #6b7280;
}

/* FLEX */
.flex {
  display: flex;
}

.items-center {
  align-items: center;
}

.justify-between {
  justify-content: space-between;
}

.mb-2 {
  margin-bottom: 0.5rem;
}

.mb-3 {
  margin-bottom: 0.75rem;
}

.mb-4 {
  margin-bottom: 1rem;
}

.font-bold {
  font-weight: 700;
}

.text-2xl {
  font-size: 1.5rem;
}
</style>
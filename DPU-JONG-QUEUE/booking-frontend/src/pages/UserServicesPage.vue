<template>
  <div>
    <h2 class="text-2xl font-bold mb-4">เลือกบริการ</h2>

    <!-- หมวด -->
    <div class="mb-4">
      <div class="font-bold mb-2">หมวดหมู่</div>

      <v-chip-group v-model="selectedCategory" mandatory>
        <v-chip value="all">ทั้งหมด</v-chip>

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
      หมวด: {{ currentCategoryName }}
    </div>

    <!-- services -->
    <v-row v-if="services.length">
      <v-col
        v-for="s in services"
        :key="s.id"
        cols="12"
        md="6"
        lg="4"
      >
        <v-card class="service-card">

          <!-- รูปเต็มขอบ -->
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
            {{ s.dailyStartTime }} - {{ s.dailyEndTime }}
          </v-card-subtitle>

          <!-- รายละเอียด -->
          <v-card-text class="description-text">
            {{ s.description || "ไม่มีรายละเอียด" }}
          </v-card-text>

          <!-- ปุ่ม -->
          <v-card-actions class="mt-auto">
            <v-btn color="primary" block @click="openBooking(s)">
              จอง
            </v-btn>
          </v-card-actions>

        </v-card>
      </v-col>
    </v-row>

    <!-- ไม่มีบริการ -->
    <v-alert v-else type="info" variant="tonal">
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
import { ref, watch, onMounted, computed } from "vue";
import { api } from "@/api/http";
import BookingDialog from "@/components/bookings/BookingDialog.vue";

const categories = ref([]);
const services = ref([]);

const selectedCategory = ref("all");
const selectedService = ref(null);

async function loadCategories() {
  categories.value = await api("/api/categories");
}

async function loadServices() {
  let url = "/api/services";
  if (selectedCategory.value !== "all") {
    url += `?categoryId=${selectedCategory.value}`;
  }
  services.value = await api(url);
}

const currentCategoryName = computed(() => {
  if (selectedCategory.value === "all") return "ทั้งหมด";
  const c = categories.value.find(
    (c) => c.id === selectedCategory.value
  );
  return c ? c.name : "-";
});

function openBooking(service) {
  selectedService.value = service;
}

function reload() {
  loadServices();
}

watch(selectedCategory, loadServices);

onMounted(async () => {
  await loadCategories();
  await loadServices();
});
</script>

<style scoped>
.service-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  overflow: hidden;
  transition: 0.2s;
}

.service-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0,0,0,0.1);
}

.title-text {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.description-text {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 60px;
}

.text-gray-600 {
  color: #6b7280;
}
</style>
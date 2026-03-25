<template>
  <div>
    <h2 class="text-2xl font-bold mb-4">เลือกบริการ</h2>

    <!-- 🔴 ADMIN: เพิ่มหมวด -->
    <div v-if="isAdmin" class="mb-4">
      <div class="font-bold mb-2">เพิ่มหมวดหมู่</div>

      <div class="flex gap">
        <v-text-field
          v-model="newCategory"
          label="ชื่อหมวด"
          density="comfortable"
          hide-details
        />

        <v-btn
          color="primary"
          @click="createCategory"
          :loading="creating"
        >
          เพิ่ม
        </v-btn>
      </div>
    </div>

    <!-- 🔵 หมวด -->
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

    <!-- 🟣 แสดงชื่อหมวด -->
    <div class="mb-3 text-gray-600">
      หมวด: {{ currentCategoryName }}
    </div>

    <!-- 🟢 services -->
    <v-row v-if="services.length">
      <v-col
        v-for="s in services"
        :key="s.id"
        cols="12"
        md="6"
        lg="4"
      >
        <v-card class="service-card">
          <v-card-title>{{ s.name }}</v-card-title>

          <v-card-subtitle>
            {{ s.dailyStartTime }} - {{ s.dailyEndTime }}
          </v-card-subtitle>

          <v-card-text>
            {{ s.description || "ไม่มีรายละเอียด" }}
          </v-card-text>

          <v-card-actions>
            <v-btn color="primary" @click="openBooking(s)">
              จอง
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <!-- 🔴 ไม่มีบริการ -->
    <v-alert v-else type="info" variant="tonal">
      ไม่มีบริการในหมวดหมู่นี้
    </v-alert>

    <!-- 🔵 Dialog -->
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

/* ---------- STATE ---------- */
const categories = ref([]);
const services = ref([]);

const selectedCategory = ref("all");
const selectedService = ref(null);

/* ---------- ADMIN ---------- */
const newCategory = ref("");
const creating = ref(false);

const isAdmin = computed(() => {
  return localStorage.getItem("role") === "admin";
});

/* ---------- LOAD CATEGORY ---------- */
async function loadCategories() {
  try {
    const res = await api("/api/categories");
    categories.value = res;
  } catch (e) {
    alert("โหลดหมวดไม่สำเร็จ");
  }
}

/* ---------- LOAD SERVICE ---------- */
async function loadServices() {
  try {
    if (selectedCategory.value === "all") {
      services.value = await api("/api/services");
      return;
    }

    services.value = await api(
      `/api/services?categoryId=${selectedCategory.value}`
    );
  } catch (e) {
    alert("โหลดบริการไม่สำเร็จ");
  }
}

/* ---------- CREATE CATEGORY ---------- */
async function createCategory() {
  if (!newCategory.value) return alert("กรอกชื่อหมวด");

  creating.value = true;
  try {
    await api("/api/categories", {
      method: "POST",
      body: {
        name: newCategory.value,
      },
    });

    newCategory.value = "";

    await loadCategories();
    await loadServices();
  } catch (e) {
    alert(e.message || "สร้างหมวดไม่สำเร็จ");
  } finally {
    creating.value = false;
  }
}

/* ---------- COMPUTED ---------- */
const currentCategoryName = computed(() => {
  if (selectedCategory.value === "all") return "ทั้งหมด";

  const c = categories.value.find(
    (c) => c.id === selectedCategory.value
  );

  return c ? c.name : "-";
});

/* ---------- ACTION ---------- */
function openBooking(service) {
  selectedService.value = service;
}

function reload() {
  loadServices();
}

/* ---------- WATCH ---------- */
watch(selectedCategory, loadServices);

/* ---------- START ---------- */
onMounted(async () => {
  await loadCategories();
  await loadServices();
});
</script>

<style scoped>
.service-card {
  border-radius: 12px;
  border: 1px solid #e5e7eb;
}

.text-gray-600 {
  color: #6b7280;
}

.flex {
  display: flex;
}

.gap {
  gap: 10px;
}
</style>
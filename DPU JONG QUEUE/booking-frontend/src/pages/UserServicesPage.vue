<template>
  <div>
    <h2 class="text-2xl font-bold mb-4">เลือกบริการ</h2>

    <!-- 🔵 เลือกหมวดหมู่ -->
    <div class="mb-4">
      <div class="font-bold mb-2">หมวดหมู่</div>

      <v-chip-group v-model="selectedCategory" mandatory>
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

    <!-- 🟣 รายการบริการ -->
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
import { ref, watch, onMounted } from "vue"
import { api } from "@/api/http"
import BookingDialog from "@/components/bookings/BookingDialog.vue"

const categories = ref([])
const services = ref([])

const selectedCategory = ref(null)
const selectedService = ref(null)

/* ---------- โหลดหมวดหมู่ ---------- */
async function loadCategories() {
  const res = await api("/api/categories")
  categories.value = res

  if (categories.value.length) {
    selectedCategory.value = categories.value[0].id
  }
}

/* ---------- โหลดบริการตามหมวด ---------- */
async function loadServices() {
  if (!selectedCategory.value) return

  const res = await api(`/api/services?categoryId=${selectedCategory.value}`)
  services.value = res
}

/* ---------- เปิด dialog ---------- */
function openBooking(service) {
  selectedService.value = service
}

/* ---------- reload ---------- */
function reload() {
  loadServices()
}

/* ---------- watch ---------- */
watch(selectedCategory, loadServices)

/* ---------- start ---------- */
onMounted(async () => {
  await loadCategories()
  await loadServices()
})
</script>

<style scoped>
.service-card {
  border-radius: 12px;
  border: 1px solid #e5e7eb;
}
</style>

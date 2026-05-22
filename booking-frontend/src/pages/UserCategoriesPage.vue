<template>
  <div>
    <h2 class="text-2xl font-bold mb-4">เลือกหมวดหมู่</h2>

    <v-row>
      <v-col
        v-for="c in categories"
        :key="c.id"
        cols="12"
        md="6"
        lg="4"
      >
        <v-card class="category-card" @click="go(c)">
          <v-card-title>{{ c.name }}</v-card-title>
        </v-card>
      </v-col>
    </v-row>

    <v-alert v-if="!categories.length" type="info" variant="tonal">
      ยังไม่มีหมวดหมู่
    </v-alert>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue"
import { useRouter } from "vue-router"
import { api } from "@/api/http"

const router = useRouter()
const categories = ref([])

async function load() {
  try {
    categories.value = await api("/api/categories")
  } catch {
    alert("โหลดหมวดไม่สำเร็จ")
  }
}

function go(c) {
  router.push(`/services/${c.id}`)
}

onMounted(load)
</script>

<style scoped>
.category-card {
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  cursor: pointer;
  transition: 0.2s;
}
.category-card:hover {
  transform: translateY(-3px);
}
</style>
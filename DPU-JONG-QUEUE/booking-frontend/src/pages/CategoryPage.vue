<template>
  <div>
    <h2 class="text-2xl font-bold mb-4">หมวดหมู่บริการ</h2>

    <v-row>
      <v-col
        v-for="c in categories"
        :key="c.id"
        cols="12"
        md="4"
      >
        <v-card class="category-card" @click="go(c.id)">
          <v-card-title>{{ c.name }}</v-card-title>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { api } from '@/api/http'
import { useRouter } from 'vue-router'

const router = useRouter()
const categories = ref([])

async function load() {
  const res = await api('/api/categories')
  categories.value = res
}

function go(id) {
  router.push(`/services?categoryId=${id}`)
}

onMounted(load)
</script>

<style scoped>
.category-card {
  cursor: pointer;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
}
</style>
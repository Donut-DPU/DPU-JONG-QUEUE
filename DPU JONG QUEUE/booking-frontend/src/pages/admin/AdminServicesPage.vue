<template>
  <div>
    <!-- 🔹 HEADER -->
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-2xl font-bold">บริการ</h2>

      <div class="flex gap">
        <v-btn color="secondary" @click="categoryDialog = true">
          + เพิ่มหมวดหมู่
        </v-btn>

        <v-btn color="primary" @click="openCreate">
          + เพิ่มบริการ
        </v-btn>
      </div>
    </div>

    <!-- ✅ FILTER หมวด -->
    <div class="flex gap mb-4">
      <v-select
        v-model="selectedCategory"
        :items="categories"
        item-title="name"
        item-value="id"
        label="เลือกหมวดหมู่"
        clearable
        style="max-width:250px"
      />
    </div>

    <!-- 🔹 TABLE -->
    <v-card class="services-card" elevation="1">
      <v-card-text>
        <v-table>
          <thead>
            <tr>
              <th>ชื่อบริการ</th>
              <th>หมวดหมู่</th>
              <th>เวลาเปิด-ปิด</th>
              <th>คิว/สล็อต</th>
              <th>ระยะ/นาที</th>
              <th>สถานะ</th>
              <th style="width:180px;"></th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="s in pagedServices" :key="s.id">
              <td>{{ s.name }}</td>
              <td>{{ s.Category?.name || '-' }}</td>
              <td>{{ s.dailyStartTime }} - {{ s.dailyEndTime }}</td>
              <td>{{ s.slotCapacity }}</td>
              <td>{{ s.slotDurationMin }}</td>

              <td>
                <v-chip size="small" :color="s.active ? 'success' : 'grey'">
                  {{ s.active ? 'เปิด' : 'ปิด' }}
                </v-chip>
              </td>

              <td>
                <v-btn size="small" class="mr-2" @click="openEdit(s)">
                  แก้ไข
                </v-btn>
                <v-btn size="small" color="error" @click="remove(s)">
                  ลบ
                </v-btn>
              </td>
            </tr>

            <tr v-if="!services.length">
              <td colspan="7" class="text-center text-muted">
                ยังไม่มีบริการ
              </td>
            </tr>
          </tbody>
        </v-table>
      </v-card-text>

      <v-divider />

      <!-- 🔹 PAGINATION -->
      <div v-if="pageCount > 1" class="pagination-wrap">
        <div class="pagination-info">
          แสดง {{ rangeStart }}–{{ rangeEnd }} จาก {{ services.length }} รายการ
        </div>

        <v-pagination
          v-model="page"
          :length="pageCount"
        />
      </div>
    </v-card>

    <!-- 🔵 Dialog สร้าง/แก้ service -->
    <ServiceEditor
      v-if="dialog"
      :service="editing"
      @close="dialog=false; editing=null"
      @saved="onSaved"
    />

    <!-- 🟣 Dialog เพิ่มหมวด -->
    <v-dialog v-model="categoryDialog" max-width="400">
      <v-card>
        <v-card-title>เพิ่มหมวดหมู่</v-card-title>

        <v-card-text>
          <v-text-field
            v-model="categoryName"
            label="ชื่อหมวด"
          />
        </v-card-text>

        <v-card-actions class="justify-end">
          <v-btn text @click="categoryDialog=false">
            ยกเลิก
          </v-btn>

          <v-btn color="primary" @click="createCategory">
            บันทึก
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { api } from '@/api/http'
import ServiceEditor from '@/components/services/ServiceEditor.vue'

const services = ref([])
const dialog = ref(false)
const editing = ref(null)

/* ✅ หมวด */
const categories = ref([])
const selectedCategory = ref(null)

const categoryDialog = ref(false)
const categoryName = ref('')

/* 🔹 pagination */
const page = ref(1)
const itemsPerPage = 10

const pageCount = computed(() =>
  Math.max(1, Math.ceil(services.value.length / itemsPerPage))
)

const pagedServices = computed(() => {
  const start = (page.value - 1) * itemsPerPage
  return services.value.slice(start, start + itemsPerPage)
})

const rangeStart = computed(() => {
  if (!services.value.length) return 0
  return (page.value - 1) * itemsPerPage + 1
})

const rangeEnd = computed(() => {
  return Math.min(page.value * itemsPerPage, services.value.length)
})

watch(services, () => {
  if (page.value > pageCount.value) page.value = 1
})

/* ---------- API ---------- */
async function loadServices() {
  let url = '/api/services?all=1'

  if (selectedCategory.value) {
    url += `&categoryId=${selectedCategory.value}`
  }

  services.value = await api(url)
}

async function loadCategories() {
  categories.value = await api('/api/categories')
}

/* 🔥 filter เมื่อเปลี่ยนหมวด */
watch(selectedCategory, () => {
  loadServices()
})

/* ---------- SERVICE ---------- */
function openCreate(){
  editing.value = null
  dialog.value = true
}

function openEdit(s){
  editing.value = { ...s }
  dialog.value = true
}

async function remove(s){
  if (!confirm(`ลบบริการ "${s.name}" ?`)) return
  await api(`/api/services/${s.id}`, { method: 'DELETE' })
  await loadServices()
}

async function onSaved(){
  dialog.value = false
  editing.value = null
  await loadServices()
}

/* ---------- CATEGORY ---------- */
async function createCategory(){
  if (!categoryName.value) return alert('กรอกชื่อหมวด')

  try {
    await api('/api/categories', {
      method: 'POST',
      body: { name: categoryName.value }
    })

    categoryDialog.value = false
    categoryName.value = ''
    await loadCategories()
    alert('เพิ่มหมวดสำเร็จ')

  } catch (e) {
    alert(e.message || 'สร้างหมวดไม่สำเร็จ')
  }
}

/* ---------- INIT ---------- */
onMounted(() => {
  loadServices()
  loadCategories()
})
</script>

<style scoped>
.flex { display:flex; }
.items-center { align-items:center; }
.justify-between { justify-content:space-between; }
.mb-4 { margin-bottom:1rem; }
.text-2xl { font-size:1.5rem; }
.font-bold { font-weight:700; }
.mr-2 { margin-right:.5rem; }
.gap { gap: 10px; }

.services-card {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}

.text-center { text-align:center; }
.text-muted { color:#9ca3af; }

.pagination-wrap {
  display:flex;
  justify-content:space-between;
  align-items:center;
  padding: 8px 16px 12px;
}

.pagination-info {
  font-size: 13px;
  color:#6b7280;
}
</style>
<template>
  <div>
    <!-- HEADER -->
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-2xl font-bold">บริการ</h2>

      <div class="flex gap">
        <v-btn color="secondary" @click="categoryDialog = true">
          + จัดการหมวดหมู่
        </v-btn>

        <v-btn color="primary" @click="openCreate">
          + เพิ่มบริการ
        </v-btn>
      </div>
    </div>

    <!-- FILTER -->
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

    <!-- TABLE -->
    <v-card class="services-card">
      <v-card-text>
        <v-table>
          <thead>
            <tr>
              <th>ชื่อบริการ</th>
              <th>หมวดหมู่</th>
              <th>เวลา</th>
              <th>สล็อต</th>
              <th>นาที</th>
              <th>สถานะ</th>
              <th></th>
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
                <v-btn size="small" @click="openEdit(s)">แก้ไข</v-btn>
                <v-btn size="small" color="error" @click="openDeleteService(s)">
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

      <!-- PAGINATION -->
      <div v-if="pageCount > 1" class="pagination-wrap">
        <div>{{ rangeStart }}–{{ rangeEnd }} / {{ services.length }}</div>
        <v-pagination v-model="page" :length="pageCount" />
      </div>
    </v-card>

    <!-- SERVICE EDITOR -->
    <ServiceEditor
      v-if="dialog"
      :service="editing"
      @close="dialog=false; editing=null"
      @saved="onSaved"
    />

    <!-- CATEGORY MANAGER -->
    <v-dialog v-model="categoryDialog" max-width="500">
      <v-card>
        <v-card-title>จัดการหมวดหมู่</v-card-title>

        <v-card-text>

          <!-- ADD -->
          <div class="flex gap mb-3">
            <v-text-field v-model="categoryName" label="ชื่อหมวดใหม่"/>
            <v-btn color="primary" @click="createCategory">เพิ่ม</v-btn>
          </div>

          <!-- LIST -->
          <div v-for="c in categories" :key="c.id" class="category-item">
            <span>{{ c.name }}</span>

            <div class="flex gap">
              <v-tooltip text="แก้ไข">
                <template #activator="{ props }">
                  <v-btn v-bind="props" size="x-small" icon @click="openEditDialog(c)">
                    ✏️
                  </v-btn>
                </template>
              </v-tooltip>

              <v-tooltip text="ลบ">
                <template #activator="{ props }">
                  <v-btn v-bind="props" size="x-small" icon color="error" @click="openDeleteCategory(c)">
                    🗑️
                  </v-btn>
                </template>
              </v-tooltip>
            </div>
          </div>

        </v-card-text>

        <v-card-actions class="justify-end">
          <v-btn text @click="categoryDialog=false">ปิด</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- EDIT CATEGORY -->
    <v-dialog v-model="editDialog" max-width="400">
      <v-card>
        <v-card-title>แก้ไขหมวด</v-card-title>
        <v-card-text>
          <v-text-field v-model="editName"/>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn text @click="editDialog=false">ยกเลิก</v-btn>
          <v-btn color="primary" @click="saveEdit">บันทึก</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- DELETE SERVICE -->
    <v-dialog v-model="deleteServiceDialog" max-width="400">
      <v-card>
        <v-card-title>ยืนยันลบบริการ</v-card-title>
        <v-card-text>
          ลบ "{{ deleteServiceItem?.name }}" ?
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn text @click="deleteServiceDialog=false">ยกเลิก</v-btn>
          <v-btn color="error" @click="confirmDeleteService">ลบ</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- DELETE CATEGORY -->
    <v-dialog v-model="deleteCategoryDialog" max-width="400">
      <v-card>
        <v-card-title>ยืนยันลบหมวด</v-card-title>
        <v-card-text>
          ลบ "{{ deleteCategoryItem?.name }}" ?
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn text @click="deleteCategoryDialog=false">ยกเลิก</v-btn>
          <v-btn color="error" @click="confirmDeleteCategory">ลบ</v-btn>
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
const categories = ref([])

const dialog = ref(false)
const editing = ref(null)

const selectedCategory = ref(null)

const categoryDialog = ref(false)
const categoryName = ref('')

/* EDIT */
const editDialog = ref(false)
const editItem = ref(null)
const editName = ref('')

/* DELETE SERVICE */
const deleteServiceDialog = ref(false)
const deleteServiceItem = ref(null)

/* DELETE CATEGORY */
const deleteCategoryDialog = ref(false)
const deleteCategoryItem = ref(null)

/* pagination */
const page = ref(1)
const itemsPerPage = 10

const pageCount = computed(() =>
  Math.ceil(services.value.length / itemsPerPage) || 1
)

const pagedServices = computed(() => {
  const start = (page.value - 1) * itemsPerPage
  return services.value.slice(start, start + itemsPerPage)
})

const rangeStart = computed(() =>
  services.value.length ? (page.value - 1) * itemsPerPage + 1 : 0
)

const rangeEnd = computed(() =>
  Math.min(page.value * itemsPerPage, services.value.length)
)

/* LOAD */
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

watch(selectedCategory, loadServices)

/* SERVICE */
function openCreate() {
  editing.value = null
  dialog.value = true
}

function openEdit(s) {
  editing.value = { ...s }
  dialog.value = true
}

function openDeleteService(s) {
  deleteServiceItem.value = s
  deleteServiceDialog.value = true
}

async function confirmDeleteService() {
  await api(`/api/services/${deleteServiceItem.value.id}`, { method: 'DELETE' })
  deleteServiceDialog.value = false
  loadServices()
}

async function onSaved() {
  dialog.value = false
  loadServices()
}

/* CATEGORY */
async function createCategory() {
  if (!categoryName.value) return
  await api('/api/categories', {
    method: 'POST',
    body: { name: categoryName.value }
  })
  categoryName.value = ''
  loadCategories()
}

function openEditDialog(c) {
  editItem.value = c
  editName.value = c.name
  editDialog.value = true
}

async function saveEdit() {
  await api(`/api/categories/${editItem.value.id}`, {
    method: 'PUT',
    body: { name: editName.value }
  })
  editDialog.value = false
  loadCategories()
}

function openDeleteCategory(c) {
  deleteCategoryItem.value = c
  deleteCategoryDialog.value = true
}

async function confirmDeleteCategory() {
  await api(`/api/categories/${deleteCategoryItem.value.id}`, {
    method: 'DELETE'
  })
  deleteCategoryDialog.value = false
  loadCategories()
}

/* INIT */
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
.gap { gap:10px; }

.services-card {
  border:1px solid #e5e7eb;
  border-radius:8px;
}

.text-center { text-align:center; }
.text-muted { color:#9ca3af; }

.pagination-wrap {
  display:flex;
  justify-content:space-between;
  padding:10px;
}

.category-item {
  display:flex;
  justify-content:space-between;
  padding:8px 0;
}
</style>
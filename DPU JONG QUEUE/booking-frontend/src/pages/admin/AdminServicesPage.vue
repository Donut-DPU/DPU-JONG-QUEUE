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
              <th>Auto Cancel</th>
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

              <!-- AUTO CANCEL -->
              <td>
                <v-chip
                  v-if="s.autoCancelEnabled"
                  size="small"
                  color="orange"
                >
                  เปิด ({{ s.autoCancelMinutes }} นาที)
                </v-chip>

                <v-chip
                  v-else
                  size="small"
                  color="grey"
                  variant="outlined"
                >
                  ปิด
                </v-chip>
              </td>

              <!-- STATUS -->
              <td>
                <v-chip size="small" :color="s.active ? 'success' : 'grey'">
                  {{ s.active ? 'เปิด' : 'ปิด' }}
                </v-chip>
              </td>

              <!-- ACTION BUTTONS -->
              <td>
                <div class="action-wrap">

                  <!-- EDIT -->
                  <v-tooltip text="แก้ไข" location="top">
                    <template #activator="{ props }">
                      <v-btn
                        v-bind="props"
                        icon
                        class="action-btn edit"
                        @click="openEdit(s)"
                      >
                        <v-icon>mdi-pencil</v-icon>
                      </v-btn>
                    </template>
                  </v-tooltip>

                  <!-- DELETE -->
                  <v-tooltip text="ลบ" location="top">
                    <template #activator="{ props }">
                      <v-btn
                        v-bind="props"
                        icon
                        class="action-btn delete"
                        @click="openDeleteService(s)"
                      >
                        <v-icon>mdi-delete</v-icon>
                      </v-btn>
                    </template>
                  </v-tooltip>

                </div>
              </td>
            </tr>

            <tr v-if="!services.length">
              <td colspan="8" class="text-center text-muted">
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

    <!-- DELETE CONFIRM -->
    <v-dialog v-model="deleteDialog" max-width="400">
      <v-card>
        <v-card-title>ยืนยันลบ</v-card-title>
        <v-card-text>
          ลบ "{{ deleteItem?.name }}" ?
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn text @click="deleteDialog=false">ยกเลิก</v-btn>
          <v-btn color="error" @click="confirmDelete">ลบ</v-btn>
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

const deleteDialog = ref(false)
const deleteItem = ref(null)

const selectedCategory = ref(null)

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

/* DELETE */
function openDeleteService(s) {
  deleteItem.value = s
  deleteDialog.value = true
}

async function confirmDelete() {
  await api(`/api/services/${deleteItem.value.id}`, {
    method: 'DELETE'
  })
  deleteDialog.value = false
  loadServices()
}

async function onSaved() {
  dialog.value = false
  loadServices()
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

/* ===== ACTION BUTTON STYLE ===== */

.action-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
}

.action-btn {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  min-width: 42px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.15);
  transition: all 0.2s ease;
}

/* edit */
.action-btn.edit {
  background: #ffffff;
  color: #374151;
}

/* delete */
.action-btn.delete {
  background: #dc2626;
  color: white;
}

.action-btn:hover {
  transform: scale(1.1);
}
</style>
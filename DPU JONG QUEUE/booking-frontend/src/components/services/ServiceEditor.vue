<template>
  <v-dialog v-model="visible" max-width="900">
    <v-card class="rounded-xl">

      <v-card-title class="text-h6 font-weight-bold">
        {{ form.id ? 'แก้ไขบริการ' : 'เพิ่มบริการ' }}
      </v-card-title>

      <v-divider />

      <v-card-text>
        <v-row>

          <!-- LEFT -->
          <v-col cols="12" md="4">
            <div class="panel left-panel">

              <div class="section-title">วันหยุดประจำ</div>

              <v-select
                v-model="selectedDays"
                :items="days"
                item-title="title"
                item-value="value"
                multiple
                chips
                label="เลือกหลายวัน"
                variant="outlined"
              />

              <v-divider class="my-3"/>

              <div class="section-title">เลือกวันหยุด</div>

              <v-date-picker
                v-model="calendarDate"
                :allowed-dates="allowedDates"
                class="calendar-small"
              />

              <v-btn block color="error" class="mt-2" @click="addHoliday">
                + เพิ่มวันหยุด
              </v-btn>

              <div class="mt-3">
                <div class="sub-title">วันหยุดทั้งหมด</div>

                <div class="holiday-list">
                  <v-chip
                    v-for="(h, i) in holidays"
                    :key="i"
                    closable
                    size="small"
                    color="red"
                    @click:close="confirmRemoveHoliday(i)"
                  >
                    {{ formatDate(h) }}
                  </v-chip>
                </div>
              </div>

            </div>
          </v-col>

          <!-- RIGHT -->
          <v-col cols="12" md="8">
            <div class="panel right-panel">

              <div class="section-title">ข้อมูลบริการ</div>
              
              <!-- Upload -->
              <v-file-input
                label="รูปบริการ"
                accept="image/*"
                @update:modelValue="uploadImage"
                :loading="uploading"
                class="mt-3 rounded-lg"
              />

              <div class="section-title">รูป preview</div>

              <div class="image-preview">
                <v-img
                  v-if="form.image_url"
                  :src="form.image_url"
                  contain
                  max-height="80%"
                  max-width="80%"
                />
              </div>

              <div class="warning-text">
                แนะนำ 800x600 ขนาดไม่เกิน 200KB
              </div>

              <v-text-field v-model="form.name" label="ชื่อบริการ"/>
              <v-select v-model="form.categoryId" :items="categories" item-title="name" item-value="id" label="หมวดหมู่"/>

              <v-row>
                <v-col cols="6">
                  <v-text-field v-model="form.dailyStartTime" label="เวลาเริ่ม"/>
                </v-col>
                <v-col cols="6">
                  <v-text-field v-model="form.dailyEndTime" label="เวลาสิ้นสุด"/>
                </v-col>
              </v-row>

              <v-row>
                <v-col cols="6">
                  <v-text-field v-model.number="form.slotCapacity" type="number" label="จำนวนคน"/>
                </v-col>
                <v-col cols="6">
                  <v-text-field v-model.number="form.slotDurationMin" type="number" label="นาที"/>
                </v-col>
              </v-row>

              <v-textarea v-model="form.description" label="รายละเอียด"/>
              <v-switch v-model="form.active" label="เปิดใช้งาน"/>

              <!-- 🔥 AUTO CANCEL (เพิ่มใหม่) -->
              <v-divider class="my-4"/>

              <div class="section-title">ตั้งค่า Auto Cancel</div>

              <v-switch
                v-model="form.autoCancelEnabled"
                label="เปิดใช้งาน Auto Cancel"
              />

              <v-text-field
                v-if="form.autoCancelEnabled"
                v-model.number="form.autoCancelMinutes"
                type="number"
                label="มาสายเกิน (นาที)"
                min="1"
              />

            </div>
          </v-col>

        </v-row>
      </v-card-text>

      <v-divider />

      <v-card-actions class="justify-end">
        <v-btn text @click="$emit('close')">ยกเลิก</v-btn>
        <v-btn color="primary" :disabled="uploading" @click="save">บันทึก</v-btn>
      </v-card-actions>

    </v-card>

    <!-- DELETE -->
    <v-dialog v-model="deleteDialog" max-width="350">
      <v-card>
        <v-card-title>ยืนยันลบ</v-card-title>
        <v-card-actions class="justify-end">
          <v-btn text @click="deleteDialog=false">ยกเลิก</v-btn>
          <v-btn color="error" @click="removeHoliday">ลบ</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

  </v-dialog>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { api } from '@/api/http'

const props = defineProps({ service: Object })
const emit = defineEmits(['close','saved'])

const visible = ref(true)

const categories = ref([])
const holidays = ref([])
const selectedDays = ref([])
const calendarDate = ref(null)

const deleteDialog = ref(false)
const deleteIndex = ref(null)

const uploading = ref(false)

const form = ref({
  name: '',
  categoryId: null,
  dailyStartTime: '09:00',
  dailyEndTime: '17:00',
  slotCapacity: 1,
  slotDurationMin: 60,
  description: '',
  active: true,
  image_url: '',

  // 🔥 AUTO CANCEL
  autoCancelEnabled: false,
  autoCancelMinutes: 10
})

const days = [
  { title: "อาทิตย์", value: 0 },
  { title: "จันทร์", value: 1 },
  { title: "อังคาร", value: 2 },
  { title: "พุธ", value: 3 },
  { title: "พฤหัส", value: 4 },
  { title: "ศุกร์", value: 5 },
  { title: "เสาร์", value: 6 },
]

async function loadCategories(){
  categories.value = await api('/api/categories')
}

async function loadHoliday(){
  if (!props.service?.id) return

  const res = await api(`/api/services/${props.service.id}/holidays`)

  holidays.value = (res.holidays || []).map(h => h.date)
  selectedDays.value = (res.weekly || []).map(w => w.day_of_week)
}

watch(() => props.service, async (s) => {
  if (s) {
    form.value = {
      ...s,
      categoryId: s.category_id || s.categoryId,
      image_url: s.image_url || '',

      autoCancelEnabled: s.autoCancelEnabled ?? false,
      autoCancelMinutes: s.autoCancelMinutes ?? 10
    }
    await loadHoliday()
  }
}, { immediate: true })

function allowedDates(val){
  const day = new Date(val).getDay()
  return !selectedDays.value.includes(day)
}

function formatDate(d){
  const date = new Date(d)
  return `${String(date.getDate()).padStart(2,'0')}-${String(date.getMonth()+1).padStart(2,'0')}-${date.getFullYear()}`
}

function addHoliday(){
  if (!calendarDate.value) return
  if (!holidays.value.includes(calendarDate.value)) {
    holidays.value.push(calendarDate.value)
  }
}

function confirmRemoveHoliday(i){
  deleteIndex.value = i
  deleteDialog.value = true
}

function removeHoliday(){
  holidays.value.splice(deleteIndex.value, 1)
  deleteDialog.value = false
}

async function uploadImage(files){
  try {
    const file = Array.isArray(files) ? files[0] : files
    if (!file) return

    uploading.value = true

    const formData = new FormData()
    formData.append("image", file)

    const res = await fetch("http://localhost:5000/api/upload", {
      method: "POST",
      body: formData
    })

    const data = await res.json()
    form.value.image_url = data.url

  } finally {
    uploading.value = false
  }
}

async function save(){
  try {
    if (!form.value.name) return alert('กรอกชื่อบริการ')

    let serviceId = form.value.id

    if (serviceId) {
      await api(`/api/services/${serviceId}`, {
        method: 'PUT',
        body: form.value
      })
    } else {
      const res = await api('/api/services', {
        method: 'POST',
        body: form.value
      })
      serviceId = res.id
    }

    await api(`/api/services/${serviceId}/reset-holidays`, {
      method: 'POST',
      body: {
        holidays: holidays.value,
        weekly: selectedDays.value
      }
    })

    emit('saved')

  } catch (e) {
    console.error(e)
    alert(e?.message || 'บันทึกไม่สำเร็จ')
  }
}

onMounted(loadCategories)
</script>

<style scoped>
.panel {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 16px;
}
.left-panel { background: #fafafa; }
.right-panel { background: #fff; }

.section-title { font-weight: 600; margin-bottom: 10px; }
.sub-title { font-size: 13px; color: #6b7280; }

.calendar-small {
  transform: scale(0.7);
  transform-origin: top left;
}

.holiday-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.image-preview {
  height: 250px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  background-color: #f9fafb;
  display: flex;
  justify-content: center;
  align-items: center;
}

.warning-text {
  color: #dc2626;
  font-size: 14px;
  font-weight: 600;
}
</style>
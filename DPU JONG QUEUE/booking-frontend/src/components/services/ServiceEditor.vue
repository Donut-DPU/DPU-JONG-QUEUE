<template>
  <v-dialog v-model="visible" max-width="900">
    <v-card class="rounded-xl">

      <!-- HEADER -->
      <v-card-title class="text-h6 font-weight-bold d-flex align-center">
        <span>{{ form.id ? 'แก้ไขบริการ' : 'เพิ่มบริการ' }}</span>
      </v-card-title>

      <v-divider />

      <v-card-text>
        <v-row class="mt-2">

          <!-- 🔴 LEFT -->
          <v-col cols="12" md="4">
            <div class="panel left-panel">

              <!-- WEEKLY -->
              <div class="section-title">วันหยุดประจำ</div>

              <v-select
                v-model="selectedDays"
                :items="days"
                item-title="title"
                item-value="value"
                label="เลือกหลายวัน"
                multiple
                chips
                density="compact"
                variant="outlined"
              />

              <v-divider class="my-3"/>

              <!-- CALENDAR -->
              <div class="section-title">เลือกวันหยุด</div>

              <v-date-picker
                v-model="calendarDate"
                :allowed-dates="allowedDates"
                class="calendar-small"
              />

              <v-btn
                block
                color="error"
                variant="flat"
                class="mt-2"
                @click="addHoliday"
              >
                + เพิ่มวันหยุด
              </v-btn>

              <!-- LIST -->
              <div class="mt-4">
                <div class="sub-title">วันหยุดทั้งหมด</div>

                <div class="holiday-list">
                  <v-chip
                    v-for="(h, i) in holidays"
                    :key="i"
                    closable
                    size="small"
                    class="chip"
                    color="red"
                    @click:close="confirmRemoveHoliday(i)"
                  >
                    {{ formatDate(h) }}
                  </v-chip>
                </div>
              </div>

            </div>
          </v-col>

          <!-- 🟢 RIGHT -->
          <v-col cols="12" md="8">
            <div class="panel right-panel">

              <div class="section-title">ข้อมูลบริการ</div>

              <v-text-field
                v-model="form.name"
                label="ชื่อบริการ"
                variant="outlined"
                density="comfortable"
              />

              <v-select
                v-model="form.categoryId"
                :items="categories"
                item-title="name"
                item-value="id"
                label="หมวดหมู่"
                variant="outlined"
                density="comfortable"
              />

              <v-row>
                <v-col cols="6">
                  <v-text-field
                    v-model="form.dailyStartTime"
                    label="เวลาเริ่ม"
                    variant="outlined"
                  />
                </v-col>
                <v-col cols="6">
                  <v-text-field
                    v-model="form.dailyEndTime"
                    label="เวลาสิ้นสุด"
                    variant="outlined"
                  />
                </v-col>
              </v-row>

              <v-row>
                <v-col cols="6">
                  <v-text-field
                    v-model.number="form.slotCapacity"
                    type="number"
                    label="จำนวนคน"
                    variant="outlined"
                  />
                </v-col>
                <v-col cols="6">
                  <v-text-field
                    v-model.number="form.slotDurationMin"
                    type="number"
                    label="นาที"
                    variant="outlined"
                  />
                </v-col>
              </v-row>

              <v-textarea
                v-model="form.description"
                label="รายละเอียด"
                rows="3"
                variant="outlined"
              />

              <v-switch
                v-model="form.active"
                label="เปิดใช้งาน"
                color="primary"
              />

            </div>
          </v-col>

        </v-row>
      </v-card-text>

      <v-divider />

      <!-- ACTION -->
      <v-card-actions class="justify-end px-4 pb-4">
        <v-btn variant="text" @click="$emit('close')">ยกเลิก</v-btn>
        <v-btn color="primary" variant="flat" @click="save">
          บันทึก
        </v-btn>
      </v-card-actions>

    </v-card>

    <!-- DELETE CONFIRM -->
    <v-dialog v-model="deleteDialog" max-width="350">
      <v-card class="rounded-lg">
        <v-card-title class="text-h6">ยืนยันลบ</v-card-title>

        <v-card-text>
          ต้องการลบวันหยุดนี้ใช่หรือไม่?
        </v-card-text>

        <v-card-actions class="justify-end">
          <v-btn variant="text" @click="deleteDialog=false">ยกเลิก</v-btn>
          <v-btn color="error" variant="flat" @click="removeHoliday">
            ลบ
          </v-btn>
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

const form = ref({
  name: '',
  categoryId: null,
  dailyStartTime: '09:00',
  dailyEndTime: '17:00',
  slotCapacity: 1,
  slotDurationMin: 60,
  description: '',
  active: true
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
      categoryId: s.category_id || s.categoryId
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
  const dd = String(date.getDate()).padStart(2,'0')
  const mm = String(date.getMonth()+1).padStart(2,'0')
  const yyyy = date.getFullYear()
  return `${dd}-${mm}-${yyyy}`
}

function addHoliday(){
  if (!calendarDate.value) return alert('เลือกวัน')
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

async function save(){
  try {
    if (!form.value.name) return alert('กรอกชื่อ')

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

    for (const d of holidays.value){
      await api(`/api/services/${serviceId}/holiday`, {
        method: 'POST',
        body: { date: d }
      })
    }

    for (const d of selectedDays.value){
      await api(`/api/services/${serviceId}/weekly-off`, {
        method: 'POST',
        body: { day: d }
      })
    }

    emit('saved')

  } catch (e) {
    alert('บันทึกไม่สำเร็จ')
  }
}

onMounted(loadCategories)
</script>

<style scoped>
.panel {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 16px;
  background: #ffffff;
}

.left-panel {
  background: #fafafa;
}

.right-panel {
  background: #ffffff;
}

.section-title {
  font-weight: 600;
  margin-bottom: 10px;
}

.sub-title {
  font-size: 13px;
  color: #6b7280;
  margin-bottom: 6px;
}

.calendar-small {
  transform: scale(0.7);
  transform-origin: top left;
}

.holiday-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.chip {
  font-size: 12px;
}
</style>
<template>
  <v-dialog v-model="visible" max-width="500">
    <v-card>
      <v-card-title>
        {{ form.id ? 'แก้ไขบริการ' : 'เพิ่มบริการ' }}
      </v-card-title>

      <v-card-text>

        <!-- ✅ ชื่อ -->
        <v-text-field
          v-model="form.name"
          label="ชื่อบริการ"
        />

        <!-- ✅ หมวดหมู่ (เพิ่มใหม่) -->
        <v-select
          v-model="form.categoryId"
          :items="categories"
          item-title="name"
          item-value="id"
          label="หมวดหมู่"
          density="comfortable"
          class="mb-3"
        />

        <!-- เวลา -->
        <v-text-field
          v-model="form.dailyStartTime"
          label="เวลาเริ่ม (HH:mm)"
        />

        <v-text-field
          v-model="form.dailyEndTime"
          label="เวลาสิ้นสุด (HH:mm)"
        />

        <!-- slot -->
        <v-text-field
          v-model.number="form.slotCapacity"
          label="จำนวนคนต่อสล็อต"
          type="number"
        />

        <v-text-field
          v-model.number="form.slotDurationMin"
          label="ระยะเวลา (นาที)"
          type="number"
        />

        <!-- active -->
        <v-switch
          v-model="form.active"
          label="เปิดใช้งาน"
        />

      </v-card-text>

      <v-card-actions class="justify-end">
        <v-btn text @click="$emit('close')">ยกเลิก</v-btn>

        <v-btn color="primary" @click="save">
          บันทึก
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { api } from '@/api/http'

const props = defineProps({
  service: Object
})

const emit = defineEmits(['close','saved'])

const visible = ref(true)

/* ✅ หมวด */
const categories = ref([])

/* ✅ form */
const form = ref({
  name: '',
  categoryId: null,
  dailyStartTime: '09:00',
  dailyEndTime: '17:00',
  slotCapacity: 1,
  slotDurationMin: 60,
  active: true
})

/* ---------- โหลดหมวด ---------- */
async function loadCategories(){
  try {
    const res = await api('/api/categories')
    categories.value = res
  } catch (e) {
    alert('โหลดหมวดไม่สำเร็จ')
  }
}

/* ---------- โหลดข้อมูลเดิม ---------- */
watch(() => props.service, (s) => {
  if (s) {
    form.value = {
      ...s,
      categoryId: s.category_id || s.categoryId || null
    }
  }
}, { immediate: true })

/* ---------- save ---------- */
async function save(){
  try {

    if (!form.value.name) return alert('กรอกชื่อบริการ')
    if (!form.value.categoryId) return alert('เลือกหมวดหมู่')

    if (form.value.id) {
      await api(`/api/services/${form.value.id}`, {
        method: 'PUT',
        body: form.value
      })
    } else {
      await api('/api/services', {
        method: 'POST',
        body: form.value
      })
    }

    emit('saved')

  } catch (e) {
    alert(e.message || 'บันทึกไม่สำเร็จ')
  }
}

onMounted(loadCategories)
</script>

<style scoped>
.mb-3 { margin-bottom: .75rem; }
.justify-end { display:flex; justify-content:flex-end; }
</style>

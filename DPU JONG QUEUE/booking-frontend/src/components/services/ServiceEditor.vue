<template>
  <v-dialog v-model="visible" max-width="520">
    <v-card>
      <v-card-title class="text-h6">
        {{ form.id ? 'แก้ไขบริการ' : 'เพิ่มบริการ' }}
      </v-card-title>
      <v-card-text>
        <v-form v-model="valid" @submit.prevent="save">
          <v-text-field v-model="form.name" label="ชื่อบริการ" :rules="[r]" class="mb-3" />
          <v-textarea v-model="form.description" label="รายละเอียด" class="mb-3" />

          <div class="flex gap">
            <v-text-field v-model="form.dailyStartTime" label="เวลาเริ่ม (HH:mm)" class="mb-3" />
            <v-text-field v-model="form.dailyEndTime" label="เวลาสิ้นสุด (HH:mm)" class="mb-3" />
          </div>

          <div class="flex gap">
            <v-text-field v-model.number="form.slotDurationMin" label="ระยะ/นาที" type="number" class="mb-3" />
            <v-text-field v-model.number="form.slotCapacity" label="คน/สล็อต" type="number" class="mb-3" />
          </div>

          <v-switch v-model="form.active" label="เปิดใช้งาน" inset class="mb-3" />

          <v-btn type="submit" :disabled="!valid || loading" :loading="loading" color="primary" block>
            บันทึก
          </v-btn>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-btn variant="text" @click="$emit('close')">ปิด</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { reactive, ref, watch, computed } from 'vue'
import { api } from '@/api/http'

const props = defineProps({
  service: { type: Object, default: null }
})
const emit = defineEmits(['close','saved'])

const visible = ref(true)
const loading = ref(false)
const valid = ref(false)
const r = (v)=> !!v || 'จำเป็น'

const defaults = {
  name: '', description: '',
  dailyStartTime: '09:00', dailyEndTime: '18:00',
  slotDurationMin: 30, slotCapacity: 1,
  active: true
}
const form = reactive({ ...defaults })

watch(() => props.service, (val) => {
  Object.assign(form, val ? { ...val } : { ...defaults })
}, { immediate: true })

async function save() {
  loading.value = true
  try {
    if (form.id) {
      await api(`/api/services/${form.id}`, { method:'PUT', body: form })
    } else {
      await api('/api/services', { method:'POST', body: form })
    }
    emit('saved')
  } catch (e) {
    alert(e.message)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.flex { display:flex; }
.gap { gap: 12px; }
.mb-3 { margin-bottom: .75rem; }
</style>

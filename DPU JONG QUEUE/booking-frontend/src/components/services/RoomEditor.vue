<template>
  <v-dialog v-model="visible" max-width="560">
    <v-card>
      <v-card-title class="text-h6">
        {{ form.id ? 'แก้ไขห้อง/ทรัพยากร' : 'เพิ่มห้อง/ทรัพยากร' }}
      </v-card-title>

      <v-card-text>
        <v-form v-model="valid" @submit.prevent="save">
          <v-text-field
            v-model="form.name"
            label="ชื่อห้อง/ทรัพยากร"
            :rules="[r]"
            class="mb-3"
          />

          <v-textarea
            v-model="form.description"
            label="รายละเอียด (ถ้ามี)"
            class="mb-3"
          />

          <div class="flex gap">
            <v-text-field
              v-model="form.dailyStartTime"
              label="เวลาเริ่ม (HH:mm)"
              placeholder="09:00"
              class="mb-3"
            />
            <v-text-field
              v-model="form.dailyEndTime"
              label="เวลาสิ้นสุด (HH:mm)"
              placeholder="17:00"
              class="mb-3"
            />
          </div>

          <div class="flex gap">
            <v-text-field
              v-model.number="form.slotDurationMin"
              type="number"
              label="ระยะ/นาที"
              class="mb-3"
            />
            <v-text-field
              v-model.number="form.slotCapacity"
              type="number"
              label="คน/สล็อต"
              class="mb-3"
            />
          </div>

          <v-switch v-model="form.active" label="เปิดใช้งาน" inset class="mb-2" />

          <v-btn
            type="submit"
            color="primary"
            block
            :disabled="!valid || loading"
            :loading="loading"
          >
            บันทึก
          </v-btn>
        </v-form>
      </v-card-text>

      <v-card-actions>
        <v-btn variant="text" @click="close">ปิด</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { reactive, ref, watch } from 'vue'

const props = defineProps({
  serviceId: { type: Number, required: true },
  room: { type: Object, default: null }, // ถ้าเป็น null = create
})

const emit = defineEmits(['close','saved'])

const visible = ref(true)
const loading = ref(false)
const valid = ref(false)
const r = (v) => !!v || 'จำเป็น'

const defaults = {
  id: null,
  service_id: null,
  name: '',
  description: '',
  dailyStartTime: '09:00',
  dailyEndTime: '17:00',
  slotDurationMin: 30,
  slotCapacity: 1,
  active: true,
}

const form = reactive({ ...defaults })

watch(
  () => props.room,
  (val) => {
    Object.assign(form, val ? { ...defaults, ...val } : { ...defaults })
    form.service_id = props.serviceId
  },
  { immediate: true }
)

// ❗ UI-only: จุดนี้คุณค่อยไปผูก API จริงทีหลัง
async function save() {
  loading.value = true
  try {
    // แทนที่ด้วย API จริงของคุณ เช่น:
    // if (form.id) await api(`/api/rooms/${form.id}`, { method:'PUT', body: form })
    // else await api(`/api/rooms`, { method:'POST', body: form })

    emit('saved', { ...form })
  } catch (e) {
    alert(e.message || 'บันทึกไม่สำเร็จ')
  } finally {
    loading.value = false
  }
}

function close() {
  visible.value = false
  emit('close')
}
</script>

<style scoped>
.flex { display:flex; }
.gap { gap: 12px; }
.mb-2 { margin-bottom: .5rem; }
.mb-3 { margin-bottom: .75rem; }
</style>

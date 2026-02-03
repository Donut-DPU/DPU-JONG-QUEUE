<template>
  <v-dialog v-model="visible" max-width="760">
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
            บันทึกบริการ
          </v-btn>
        </v-form>

        <!-- ✅ Section ห้อง/ทรัพยากร (แสดงเมื่อเป็น "แก้ไข" เท่านั้น) -->
        <div v-if="form.id" class="mt-6">
          <div class="flex items-center justify-between mb-3">
            <div>
              <div class="text-lg font-bold">ห้อง/ทรัพยากรของบริการนี้</div>
              <div class="text-muted">เช่น ห้อง A / ห้อง B / EV-01 / EV-02</div>
            </div>

            <v-btn color="primary" variant="tonal" @click="openRoomCreate">
              + เพิ่มห้อง
            </v-btn>
          </div>

          <v-card elevation="0" class="rooms-card">
            <v-table>
              <thead>
                <tr>
                  <th>ชื่อห้อง</th>
                  <th>เวลาเปิด-ปิด</th>
                  <th>คิว/สล็อต</th>
                  <th>ระยะ/นาที</th>
                  <th>สถานะ</th>
                  <th style="width:180px;"></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="room in rooms" :key="room.id">
                  <td>{{ room.name }}</td>
                  <td>{{ room.dailyStartTime }} - {{ room.dailyEndTime }}</td>
                  <td>{{ room.slotCapacity }}</td>
                  <td>{{ room.slotDurationMin }}</td>
                  <td>
                    <v-chip size="small" :color="room.active ? 'success' : 'grey'">
                      {{ room.active ? 'เปิด' : 'ปิด' }}
                    </v-chip>
                  </td>
                  <td>
                    <v-btn size="small" class="mr-2" @click="openRoomEdit(room)">แก้ไข</v-btn>
                    <v-btn size="small" color="error" @click="removeRoom(room)">ลบ</v-btn>
                  </td>
                </tr>

                <tr v-if="rooms.length === 0">
                  <td colspan="6" class="text-center text-muted py-4">
                    ยังไม่มีห้อง — กด “เพิ่มห้อง” เพื่อเริ่มใช้งาน
                  </td>
                </tr>
              </tbody>
            </v-table>
          </v-card>
        </div>

        <!-- RoomEditor -->
        <RoomEditor
          v-if="roomDialog"
          :service-id="form.id"
          :room="editingRoom"
          @close="roomDialog=false; editingRoom=null"
          @saved="onRoomSaved"
        />
      </v-card-text>

      <v-card-actions>
        <v-btn variant="text" @click="$emit('close')">ปิด</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { reactive, ref, watch } from 'vue'
import { api } from '@/api/http'
import RoomEditor from '@/components/services/RoomEditor.vue'

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
  // เมื่อเปิดแก้ไข service → โหลด rooms ของ service นั้น
  if (form.id) loadRooms()
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

/* ----------------- Rooms UI (ผูก API ทีหลังได้) ----------------- */
const rooms = ref([])
const roomDialog = ref(false)
const editingRoom = ref(null)

async function loadRooms(){
  try {
    // 🔧 เมื่อคุณทำ backend แล้ว ให้เปลี่ยนเป็น endpoint จริง เช่น:
    // rooms.value = await api(`/api/rooms?serviceId=${form.id}`)
    rooms.value = rooms.value || []
  } catch {
    rooms.value = []
  }
}

function openRoomCreate(){
  editingRoom.value = null
  roomDialog.value = true
}

function openRoomEdit(room){
  editingRoom.value = { ...room }
  roomDialog.value = true
}

async function removeRoom(room){
  if (!confirm(`ลบห้อง "${room.name}" ?`)) return
  try {
    // 🔧 ผูก API จริงทีหลัง:
    // await api(`/api/rooms/${room.id}`, { method:'DELETE' })
    rooms.value = rooms.value.filter(r => r.id !== room.id)
  } catch (e) {
    alert(e.message || 'ลบไม่สำเร็จ')
  }
}

function onRoomSaved(room){
  // ✅ UI-only: ถ้ายังไม่มี id ให้สร้างชั่วคราว
  if (!room.id) room.id = Date.now()

  const idx = rooms.value.findIndex(r => r.id === room.id)
  if (idx >= 0) rooms.value[idx] = room
  else rooms.value.unshift(room)

  roomDialog.value = false
  editingRoom.value = null
}
/* --------------------------------------------------------------- */
</script>

<style scoped>
.flex { display:flex; }
.gap { gap: 12px; }
.mb-3 { margin-bottom: .75rem; }
.mr-2 { margin-right:.5rem; }
.mt-6 { margin-top: 1.5rem; }
.text-lg { font-size: 18px; }
.font-bold { font-weight:700; }
.text-muted { color:#6b7280; }
.text-center { text-align:center; }
.py-4 { padding-top: 1rem; padding-bottom: 1rem; }

.rooms-card{
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  overflow: hidden;
}
</style>

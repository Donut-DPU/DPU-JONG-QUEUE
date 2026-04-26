<template>
  <v-card>
    <v-card-title class="d-flex justify-space-between">
      <span>จัดการ Admin</span>

      <v-btn color="primary" @click="openCreate">
        เพิ่ม Admin
      </v-btn>
    </v-card-title>

    <!-- ตาราง -->
    <v-data-table :items="admins" :headers="headers">
      <template #item.fullname="{ item }">
        {{ item.firstName }} {{ item.lastName }}
      </template>

      <template #item.actions="{ item }">
        <v-btn size="small" @click="openEdit(item.raw)">
          แก้ไข
        </v-btn>
      </template>
    </v-data-table>

    <!-- Dialog -->
    <v-dialog v-model="dialog" max-width="500">
      <v-card>
        <v-card-title>
          {{ isEdit ? 'แก้ไข Admin' : 'เพิ่ม Admin' }}
        </v-card-title>

        <v-card-text>
          <v-text-field v-model="form.firstName" label="ชื่อ" />
          <v-text-field v-model="form.lastName" label="นามสกุล" />
          <v-text-field v-model="form.email" label="Email" />
          <v-text-field v-model="form.password" label="Password" type="password" />
        </v-card-text>

        <v-card-actions>
          <v-btn text @click="dialog = false">ยกเลิก</v-btn>
          <v-btn color="primary" @click="openConfirm">
            บันทึก
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Confirm -->
    <v-dialog v-model="confirmDialog" max-width="400">
      <v-card>
        <v-card-title>ยืนยัน</v-card-title>
        <v-card-text>
          คุณต้องการ{{ isEdit ? 'แก้ไข' : 'สร้าง' }} Admin ใช่หรือไม่?
        </v-card-text>

        <v-card-actions>
          <v-btn text @click="confirmDialog = false">ยกเลิก</v-btn>
          <v-btn color="primary" @click="submit">
            ยืนยัน
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

  </v-card>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const admins = ref([])
const dialog = ref(false)
const confirmDialog = ref(false)
const isEdit = ref(false)

const form = ref({
  id: null,
  firstName: '',
  lastName: '',
  email: '',
  password: ''
})

const headers = [
  { title: 'ID', value: 'id' },
  { title: 'ชื่อ-นามสกุล', value: 'fullname' },
  { title: 'Email', value: 'email' },
  { title: 'Actions', value: 'actions' }
]

// โหลดข้อมูล
const fetchAdmins = async () => {
  const token = localStorage.getItem('token')

  const res = await axios.get('http://localhost:5000/api/admin/users', {
    headers: { Authorization: `Bearer ${token}` }
  })

  admins.value = res.data
}

// เปิด create
const openCreate = () => {
  isEdit.value = false
  form.value = {
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  }
  dialog.value = true
}

// เปิด edit
const openEdit = (item) => {
  isEdit.value = true
  form.value = { ...item, password: '' }
  dialog.value = true
}

// confirm
const openConfirm = () => {
  confirmDialog.value = true
}

// submit
const submit = async () => {
  confirmDialog.value = false

  const token = localStorage.getItem('token')

  try {
    if (!form.value.firstName || !form.value.lastName || !form.value.email) {
      alert("กรอกข้อมูลให้ครบ")
      return
    }

    await axios.post(
      'http://localhost:5000/api/admin/users/create-admin',
      form.value,
      { headers: { Authorization: `Bearer ${token}` } }
    )

    dialog.value = false
    fetchAdmins()

  } catch (err) {
    console.error(err)
    alert(err.response?.data?.message || "เกิดข้อผิดพลาด")
  }
}

onMounted(fetchAdmins)
</script>
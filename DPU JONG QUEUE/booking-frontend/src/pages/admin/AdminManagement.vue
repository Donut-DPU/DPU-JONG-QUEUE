<template>
  <v-card>
    <v-card-title class="d-flex justify-space-between">
      <span>จัดการ Admin</span>

      <!-- ✅ ปุ่มเพิ่ม -->
      <v-btn color="primary" @click="openCreate">
        เพิ่ม Admin
      </v-btn>
    </v-card-title>

    <!-- ✅ ตาราง -->
    <v-data-table :items="admins" :headers="headers">
      <template #item.actions="{ item }">
        <v-btn size="small" @click="openEdit(item)">
          แก้ไข
        </v-btn>
      </template>
    </v-data-table>

    <!-- ✅ Dialog -->
    <v-dialog v-model="dialog" max-width="500">
      <v-card>
        <v-card-title>
          {{ isEdit ? 'แก้ไข Admin' : 'เพิ่ม Admin' }}
        </v-card-title>

        <v-card-text>
          <v-text-field v-model="form.username" label="Username" />
          <v-text-field v-model="form.email" label="Email" />
          <v-text-field v-model="form.password" label="Password" type="password" />
        </v-card-text>

        <v-card-actions>
          <v-btn text @click="dialog = false">ยกเลิก</v-btn>
          <v-btn color="primary" @click="submit">
            บันทึก
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
const isEdit = ref(false)

const form = ref({
  id: null,
  username: '',
  email: '',
  password: ''
})

const headers = [
  { title: 'ID', value: 'id' },
  { title: 'Username', value: 'username' },
  { title: 'Email', value: 'email' },
  { title: 'Actions', value: 'actions' }
]

// 🔄 โหลด admin ทั้งหมด
const fetchAdmins = async () => {
  const token = localStorage.getItem('token')

  const res = await axios.get('http://localhost:5000/api/admin/users', {
    headers: { Authorization: `Bearer ${token}` }
  })

  admins.value = res.data
}

// ➕ เปิด create
const openCreate = () => {
  isEdit.value = false
  form.value = { username: '', email: '', password: '' }
  dialog.value = true
}

// ✏️ เปิด edit
const openEdit = (item) => {
  isEdit.value = true
  form.value = { ...item, password: '' }
  dialog.value = true
}

// 💾 submit
const submit = async () => {
  const token = localStorage.getItem('token')

  if (isEdit.value) {
    await axios.put(
      `http://localhost:5000/api/admin/users/${form.value.id}`,
      form.value,
      { headers: { Authorization: `Bearer ${token}` } }
    )
  } else {
    await axios.post(
      'http://localhost:5000/api/admin/users/create-admin',
      form.value,
      { headers: { Authorization: `Bearer ${token}` } }
    )
  }

  dialog.value = false
  fetchAdmins()
}

onMounted(fetchAdmins)
</script>
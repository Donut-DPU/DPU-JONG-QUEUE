<template>
  <v-card elevation="3" rounded="xl">

    <!-- HEADER -->
    <v-card-title class="d-flex justify-space-between align-center">

      <span class="text-h6 font-weight-bold">
        จัดการ Admin
      </span>

      <v-btn
        color="primary"
        prepend-icon="mdi-plus"
        @click="openCreate"
      >
        เพิ่ม Admin
      </v-btn>

    </v-card-title>

    <!-- TABLE -->
    <v-data-table
      :items="admins"
      :headers="headers"
    >

      <!-- FULL NAME -->
      <template #item.fullname="{ item }">

        {{
          getFullName(item)
        }}

      </template>

      <!-- ACTION -->
      <template #item.actions="{ item }">

        <div class="d-flex ga-2">

          <!-- EDIT -->
          <v-tooltip location="top">

            <template #activator="{ props }">

              <v-btn
                icon
                size="small"
                v-bind="props"
                @click="openEdit(
                  normalizeItem(item)
                )"
              >
                <v-icon>
                  mdi-pencil
                </v-icon>
              </v-btn>

            </template>

            <span>
              แก้ไข
            </span>

          </v-tooltip>

          <!-- DELETE -->
          <v-tooltip location="top">

            <template #activator="{ props }">

              <v-btn
                icon
                size="small"
                color="error"
                v-bind="props"
                :disabled="normalizeItem(item).id === currentUser?.id"
                @click="openDelete(
                  normalizeItem(item)
                )"
              >
                <v-icon>
                  mdi-delete
                </v-icon>
              </v-btn>

            </template>

            <span>
              ลบ
            </span>

          </v-tooltip>

          <!-- RESET -->
          <v-tooltip location="top">

            <template #activator="{ props }">

              <v-btn
                icon
                size="small"
                color="warning"
                v-bind="props"
                @click="openReset(
                  normalizeItem(item).id
                )"
              >
                <v-icon>
                  mdi-lock-reset
                </v-icon>
              </v-btn>

            </template>

            <span>
              รีเซ็ตรหัส
            </span>

          </v-tooltip>

        </div>

      </template>

    </v-data-table>

    <!-- ================= FORM ================= -->
    <v-dialog
      v-model="dialog"
      max-width="500"
    >

      <v-card rounded="xl">

        <v-card-title>
          {{ isEdit ? 'แก้ไข Admin' : 'เพิ่ม Admin' }}
        </v-card-title>

        <v-card-text>

         <v-text-field
            v-model="form.fullName"
            label="ชื่อ - นามสกุล"
          />

          <v-text-field
            v-model="form.email"
            label="Email"
          />

          <v-text-field
            v-if="!isEdit"
            v-model="form.password"
            label="Password"
            type="password"
          />

        </v-card-text>

        <v-card-actions>

          <v-spacer />

          <v-btn
            text
            @click="dialog = false"
          >
            ยกเลิก
          </v-btn>

          <v-btn
            color="primary"
            @click="openConfirm"
          >
            บันทึก
          </v-btn>

        </v-card-actions>

      </v-card>

    </v-dialog>

    <!-- ================= CONFIRM SAVE ================= -->
    <v-dialog
      v-model="confirmDialog"
      max-width="400"
    >

      <v-card>

        <v-card-title>
          ยืนยัน
        </v-card-title>

        <v-card-text>

          คุณต้องการ
          {{ isEdit ? 'แก้ไข' : 'สร้าง' }}
          Admin ใช่หรือไม่?

        </v-card-text>

        <v-card-actions>

          <v-spacer />

          <v-btn
            text
            @click="confirmDialog = false"
          >
            ยกเลิก
          </v-btn>

          <v-btn
            color="primary"
            @click="submit"
          >
            ยืนยัน
          </v-btn>

        </v-card-actions>

      </v-card>

    </v-dialog>

    <!-- ================= DELETE ================= -->
    <v-dialog
      v-model="deleteDialog"
      max-width="400"
    >

      <v-card>

        <v-card-title>
          ยืนยันการลบ
        </v-card-title>

        <v-card-text>
          คุณต้องการลบ Admin นี้ใช่หรือไม่?
        </v-card-text>

        <v-card-actions>

          <v-spacer />

          <v-btn
            text
            @click="deleteDialog = false"
          >
            ยกเลิก
          </v-btn>

          <v-btn
            color="error"
            @click="submitDelete"
          >
            ลบ
          </v-btn>

        </v-card-actions>

      </v-card>

    </v-dialog>

    <!-- ================= RESET ================= -->
    <v-dialog
      v-model="resetDialog"
      max-width="400"
    >

      <v-card>

        <v-card-title>
          รีเซ็ตรหัสผ่าน
        </v-card-title>

        <v-card-text>

          <v-text-field
            v-model="newPassword"
            label="รหัสผ่านใหม่"
            type="password"
          />

        </v-card-text>

        <v-card-actions>

          <v-spacer />

          <v-btn
            text
            @click="resetDialog = false"
          >
            ยกเลิก
          </v-btn>

          <v-btn
            color="warning"
            @click="submitReset"
          >
            บันทึก
          </v-btn>

        </v-card-actions>

      </v-card>

    </v-dialog>

    <!-- ================= SNACKBAR ================= -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      timeout="2500"
    >
      {{ snackbar.text }}
    </v-snackbar>

  </v-card>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const API =
  'https://dpu-jong-queue.onrender.com'

const admins = ref([])

const dialog = ref(false)
const confirmDialog = ref(false)
const deleteDialog = ref(false)
const resetDialog = ref(false)

const isEdit = ref(false)

const deleteId = ref(null)

const resetUserId = ref(null)

const newPassword = ref('')

const currentUser = ref(null)

const snackbar = ref({
  show: false,
  text: '',
  color: 'success'
})

const form = ref({
  id: null,
  fullName: '',
  email: '',
  password: ''
})

const headers = [
  {
    title: 'ID',
    value: 'id'
  },
  {
    title: 'ชื่อ-นามสกุล',
    value: 'fullname'
  },
  {
    title: 'Email',
    value: 'email'
  },
  {
    title: 'Actions',
    value: 'actions'
  }
]

/* NORMALIZE */
const normalizeItem = (item) => {

  return item.raw || item
}

/* GET FULL NAME */
const getFullName = (item) => {

  const row = item.raw || item

  return (
    row.fullName ||
    row.full_name ||
    row.name ||
    row.fullname ||
    (
      row.firstName && row.lastName
        ? `${row.firstName} ${row.lastName}`
        : ''
    ) ||
    '-'
  )
}

/* SNACKBAR */
const showSnack = (
  text,
  color = 'success'
) => {

  snackbar.value = {
    show: true,
    text,
    color
  }
}

/* LOAD ADMINS */
const fetchAdmins = async () => {

  try {

    const token =
      localStorage.getItem('token')

    const res = await axios.get(
      `${API}/api/admin/users?role=admin`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )

    console.log(
      'ADMINS:',
      res.data
    )

    admins.value = res.data

    const payload =
      JSON.parse(
        atob(token.split('.')[1])
      )

    currentUser.value = payload

  } catch (err) {

    console.error(err)

    showSnack(
      'โหลดข้อมูลไม่สำเร็จ',
      'error'
    )
  }
}

/* CREATE */
const openCreate = () => {

  isEdit.value = false

  form.value = {
    id: null,
    fullname: '',
    email: '',
    password: ''
  }

  dialog.value = true
}

/* EDIT */
const openEdit = (item) => {

  isEdit.value = true

  form.value = {
    ...item,
    password: ''
  }

  dialog.value = true
}

/* DELETE */
const openDelete = (item) => {

  if (item.id === currentUser.value?.id) {

    showSnack(
      'ไม่สามารถลบตัวเองได้',
      'error'
    )

    return
  }

  deleteId.value = item.id

  deleteDialog.value = true
}

/* RESET */
const openReset = (id) => {

  resetUserId.value = id

  newPassword.value = ''

  resetDialog.value = true
}

/* CONFIRM */
const openConfirm = () => {
  confirmDialog.value = true
}

/* SUBMIT */
const submit = async () => {

  confirmDialog.value = false

  const token =
    localStorage.getItem('token')

  try {

    if (isEdit.value) {

      await axios.put(
        `${API}/api/admin/users/${form.value.id}`,
        form.value,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      showSnack('แก้ไขสำเร็จ')

    } else {

      await axios.post(
        `${API}/api/admin/users/create-admin`,
        form.value,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      showSnack('เพิ่ม Admin สำเร็จ')
    }

    dialog.value = false

    fetchAdmins()

  } catch (err) {

    console.error(err)

    showSnack(
      err.response?.data?.message ||
      'ผิดพลาด',
      'error'
    )
  }
}

/* DELETE SUBMIT */
const submitDelete = async () => {

  const token =
    localStorage.getItem('token')

  try {

    await axios.delete(
      `${API}/api/admin/users/${deleteId.value}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )

    showSnack('ลบสำเร็จ')

    deleteDialog.value = false

    fetchAdmins()

  } catch (err) {

    console.error(err)

    showSnack(
      err.response?.data?.message ||
      'ลบไม่สำเร็จ',
      'error'
    )
  }
}

/* RESET PASSWORD */
const submitReset = async () => {

  if (!newPassword.value) {

    showSnack(
      'กรุณาใส่รหัสผ่าน',
      'error'
    )

    return
  }

  const token =
    localStorage.getItem('token')

  try {

    await axios.put(
      `${API}/api/admin/users/${resetUserId.value}/reset-password`,
      {
        newPassword: newPassword.value
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )

    showSnack(
      'รีเซ็ตรหัสสำเร็จ'
    )

    resetDialog.value = false

  } catch (err) {

    console.error(err)

    showSnack(
      'เกิดข้อผิดพลาด',
      'error'
    )
  }
}

onMounted(fetchAdmins)
</script>
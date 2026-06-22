<template>
  <v-card max-width="500" class="mx-auto pa-4">
    <v-card-title>เพิ่ม Admin</v-card-title>

    <v-card-text>
      <v-text-field v-model="form.username" label="Username" />
      <v-text-field v-model="form.email" label="Email" />
      <v-text-field v-model="form.password" label="Password" type="password" />

      <v-btn color="primary" block class="mt-4" @click="submit">
        สร้าง Admin
      </v-btn>

      <v-alert v-if="message" class="mt-3" type="info">
        {{ message }}
      </v-alert>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'

const form = ref({
  username: '',
  email: '',
  password: ''
})

const message = ref('')

const submit = async () => {
  try {
    const token = localStorage.getItem('token')

    const res = await axios.post(
      'http://localhost:5000/api/admin/users/create-admin',
      form.value,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )

    message.value = res.data.message

    form.value = {
      username: '',
      email: '',
      password: ''
    }

  } catch (err) {
    message.value = err.response?.data?.message || 'เกิดข้อผิดพลาด'
  }
}
</script>
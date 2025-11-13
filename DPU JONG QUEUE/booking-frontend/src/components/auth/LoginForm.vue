<template>
  <v-form @submit.prevent="onSubmit" v-model="valid" validate-on="input">
    <v-text-field
      v-model="email"
      label="อีเมล"
      prepend-inner-icon="mdi-email"
      type="email"
      :rules="[rules.required, rules.email]"
      variant="outlined"
      class="mb-3"
      density="comfortable"
    />
    <v-text-field
      v-model="password"
      :type="showPassword ? 'text' : 'password'"
      label="รหัสผ่าน"
      prepend-inner-icon="mdi-lock"
      :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
      @click:append-inner="showPassword = !showPassword"
      :rules="[rules.required, rules.min]"
      variant="outlined"
      class="mb-4"
      density="comfortable"
    />

    <v-btn
      type="submit"
      :disabled="loading"
      :loading="loading"
      class="btn-primary"
      size="large"
      block
    >
      เข้าสู่ระบบ
    </v-btn>
  </v-form>
</template>

<script setup>
import { ref } from 'vue'
import { api } from '@/api/http'
import { setAuth } from '@/store/auth'
import { useRouter } from 'vue-router'

const router = useRouter()
const valid = ref(false)
const loading = ref(false)
const email = ref('')
const password = ref('')
const showPassword = ref(false)

const rules = {
  required: v => !!v || 'กรุณากรอก.',
  email: v => /.+@.+\..+/.test(v) || 'อีเมลไม่ถูกต้อง',
  min: v => (v && v.length >= 6) || 'รหัสผ่านอย่างน้อย 6 ตัว',
}

const onSubmit = async () => {
  if (!valid.value) return
  loading.value = true
  try {
    const data = await api('/api/auth/login', {
      method: 'POST',
      auth: false,
      body: { email: email.value.trim(), password: password.value }
    })
    const role = (data.user?.role || 'user').toLowerCase()
    setAuth({ token: data.token, user: { ...data.user, role } })
    router.push(role === 'admin' ? '/admin' : '/services')
  } catch (e) {
    alert(e.message || 'เข้าสู่ระบบไม่สำเร็จ')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.mb-3{margin-bottom:12px;}
.mb-4{margin-bottom:16px;}
.btn-primary{
  background:#691bff; color:#fff; font-weight:700; height:48px;
  font-size:16px; letter-spacing:.3px; text-transform:none; border-radius:6px;
}
.btn-primary:hover{filter:brightness(1.05);}
</style>

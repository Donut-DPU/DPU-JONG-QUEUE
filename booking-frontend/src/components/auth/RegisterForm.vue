<template>
  <v-form @submit.prevent="onSubmit" v-model="valid" validate-on="input">
    <v-alert
      v-if="errorText"
      type="error"
      variant="tonal"
      class="mb-3"
      :text="errorText"
      closable
      @click:close="errorText = ''"
    />

    <!-- ชื่อ-สกุล -->
    <v-text-field
      v-model="name"
      label="ชื่อ-สกุล"
      prepend-inner-icon="mdi-account"
      :rules="[rules.required, rules.nameMin]"
      variant="outlined"
      class="mb-3"
      density="comfortable"
    />

    <!-- อีเมล -->
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

    <!-- รหัสผ่าน -->
    <v-text-field
      v-model="password"
      :type="showPassword ? 'text' : 'password'"
      label="รหัสผ่าน"
      prepend-inner-icon="mdi-lock"
      :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
      @click:append-inner="showPassword = !showPassword"
      :rules="[rules.required, rules.passMin]"
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
      สมัครสมาชิก
    </v-btn>

    <!-- Popup Success -->
    <v-dialog v-model="successDialog" max-width="420">
      <v-card class="rounded-xl pa-4 text-center">
        <v-card-text>
          <v-icon
            size="70"
            color="success"
            class="mb-3"
          >
            mdi-check-circle
          </v-icon>

          <div class="text-h6 font-weight-bold mb-2">
            สมัครสมาชิกสำเร็จ
          </div>

          <div class="text-body-1 text-medium-emphasis">
            กรุณาเข้าสู่ระบบเพื่อใช้งานระบบ
          </div>
        </v-card-text>

        <v-card-actions class="justify-center">
          <v-btn
            color="primary"
            variant="flat"
            class="px-8"
            @click="goToLogin"
          >
            ไปหน้าเข้าสู่ระบบ
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
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
const name = ref('')
const email = ref('')
const password = ref('')
const showPassword = ref(false)
const errorText = ref('')

/* เพิ่ม popup */
const successDialog = ref(false)

const rules = {
  required: v => !!v || 'กรุณากรอก',
  email: v => /.+@.+\..+/.test(v) || 'อีเมลไม่ถูกต้อง',
  nameMin: v => (v && v.trim().length >= 2) || 'อย่างน้อย 2 ตัวอักษร',
  passMin: v => (v && v.length >= 6) || 'รหัสผ่านอย่างน้อย 6 ตัว',
}

const goToLogin = () => {
  successDialog.value = false
  router.push('/login')
}

const onSubmit = async () => {
  errorText.value = ''
  if (!valid.value) return

  const n = (name.value || '').trim()
  const e = (email.value || '').trim()
  const p = password.value || ''

  if (!n || !e || !p) {
    errorText.value = 'กรอกชื่อ อีเมล และรหัสผ่านให้ครบถ้วน'
    return
  }

  loading.value = true
  try {
    // ส่งหลายฟิลด์ให้ครอบคลุมแบ็กเอนด์ที่คาดหวังคีย์ต่างกัน
    const body = {
      name: n,
      fullName: n,
      username: e,   // เผื่อแบ็กเอนด์ใช้ username แทนอีเมล
      email: e,
      password: p,
      role: 'user'
    }

    const res = await api('/api/auth/register', {
      method: 'POST',
      auth: false,
      body
    })

    if (res?.token && res?.user) {
      const role = (res.user.role || 'user').toLowerCase()
      setAuth({ token: res.token, user: { ...res.user, role } })
      router.push('/services')
    } else {
      // เปลี่ยนจาก alert เป็น popup
      successDialog.value = true
    }
  } catch (e) {
    errorText.value = e.message || 'สมัครสมาชิกไม่สำเร็จ'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.mb-3{
  margin-bottom:12px;
}

.mb-4{
  margin-bottom:16px;
}

.btn-primary{
  background:#082a66;
  color:#fff;
  font-weight:700;
  height:48px;
  font-size:16px;
  letter-spacing:.3px;
  text-transform:none;
  border-radius:6px;
}

.btn-primary:hover{
  filter:brightness(1.05);
}
</style>
<template>
  <AuthSplit>
    <div class="reg">
      <h1 class="title">สมัครสมาชิก</h1>
      <p class="subtitle">กรอกข้อมูลเพื่อสร้างบัญชีของคุณ</p>

      <v-card flat class="form-card">
        <v-card-text class="pad">
          <RegisterForm />
        </v-card-text>
      </v-card>

      <div class="links">
        <RouterLink to="/login" class="link">
          มีบัญชีอยู่แล้ว? <span class="underline">ไปที่เข้าสู่ระบบ</span>
        </RouterLink>
      </div>
    </div>
  </AuthSplit>
</template>

<script setup>
import AuthSplit from '@/layouts/AuthSplit.vue'
import RegisterForm from '@/components/auth/RegisterForm.vue'
</script>

<style scoped>
.reg{ text-align:center; }
.title{ font-size:30px; font-weight:800; color:#0b2b62; }
.subtitle{ margin-top:6px; color:#5b7083; }
.form-card{
  margin-top:18px; border-radius:14px; border:1px solid #eef2f7;
  box-shadow:0 8px 24px rgba(11,43,98,.1);
}
.pad{ padding:18px; }
.links{ margin-top:18px; }
.link{ font-size:14px; color:#0b2b62; }
.underline{ text-decoration:underline; }
</style>

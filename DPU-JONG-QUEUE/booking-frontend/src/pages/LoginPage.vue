<template>
  <AuthSplit>
    <div class="login">
      <h1 class="title">เข้าสู่ระบบ <br> <span class="brand">DPU JONG QUEUE</span></h1>
      <p class="subtitle">ลงชื่อเข้าใช้บัญชีของคุณ</p>

      <v-card flat class="form-card">
        <v-card-text class="form-pad">
          <!-- ใช้ฟอร์มเดิมของเรา -->
          <LoginForm />
        </v-card-text>
      </v-card>

      <div class="links">
        <!-- เอาลิงก์ลืมรหัสผ่านออกตามที่ขอ -->
        <div class="link">
          คุณได้ลงทะเบียนแล้วหรือยัง?
          <RouterLink to="/register"><span class="underline">ลงทะเบียน!</span></RouterLink>
        </div>
      </div>
    </div>
  </AuthSplit>
</template>

<script setup>
import AuthSplit from '@/layouts/AuthSplit.vue'
import LoginForm from '@/components/auth/LoginForm.vue'
</script>

<style scoped>
.login{ text-align:center; }

.title{
  font-size: 32px;
  font-weight: 800;
  color: #0b2b62;
  line-height: 1.25;
  margin-top: 6px;
}
.brand{ color:#0b2b62; }
.subtitle{
  color:#5b7083;
  margin-top: 6px;
}

.form-card{
  margin-top: 18px;
  border-radius: 14px;
  border: 1px solid #eef2f7;
  box-shadow: 0 8px 24px rgba(11,43,98,.10);
}
.form-pad{ padding: 18px; }

.links{
  margin-top: 18px;
  display:flex; flex-direction:column; gap:8px;
  align-items:center; color:#0b2b62;
}
.link{ font-size:14px; }
.underline{ text-decoration: underline; }

/* มือถือ */
@media (max-width: 767px){
  .login{ padding: 0 12px 24px; }
}
</style>

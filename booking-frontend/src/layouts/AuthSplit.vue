<template>
  <div class="min-h-screen flex">
    <!-- ซ้าย: มาสคอตใหญ่ -->
    <div class="hidden md:flex flex-1 items-center justify-center side">
      <img src="@/assets/images/mascot.png" alt="mascot" class="mascot" />
    </div>

    <!-- ขวา: ฟอร์ม (กึ่งกลางคอลัมน์ขวา) -->
    <div class="right">
      <div class="right-inner">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup>
// layout-only
</script>

<style scoped>
.min-h-screen{min-height:100vh;}
.flex{display:flex;}
.flex-1{flex:1 1 0%;}
.items-center{align-items:center;}
.justify-center{justify-content:center;}
.hidden{display:none;}

.side{
  background: linear-gradient(180deg, #eaf5ff 0%, #f5fbff 100%);
  padding: 32px;
}
.mascot{
  width: min(720px, 95%);
  height: auto;
  object-fit: contain;
}

/* คอลัมน์ขวา */
.right{
  width: 100%;
  max-width: 720px;              /* กรอบฝั่งขวา */
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  padding: 24px clamp(16px, 6vw, 64px);
}
.right-inner{
  width: 100%;
  max-width: 560px;              /* ความกว้างเนื้อหาจริง */
  margin: 0 auto;
}

/* แสดงคอลัมน์ซ้ายบนจอ md ขึ้นไป */
@media (min-width: 768px){ .hidden{display:none;} .md\:flex{display:flex;} }
</style>

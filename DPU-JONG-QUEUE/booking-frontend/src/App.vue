<!-- src/App.vue -->
<template>
  <v-app>
    <!-- v-main จะคำนวณระยะห่างจาก v-app-bar ที่มี prop "app" ให้เอง -->
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script setup>
</script>

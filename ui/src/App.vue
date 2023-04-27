<script setup lang="ts">
import LoginMain from './components/LoginMain.vue';
import { darkTheme } from 'naive-ui';
</script>

<template>
  <NConfigProvider :theme="darkTheme">
    <div class="root">
      <LoginMain></LoginMain>
    </div>
  </NConfigProvider>
</template>
<style scoped>
.root {
  background: rgb(100, 101, 106);
  color: white;
  height: 100vh;
  width: 100vw;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>

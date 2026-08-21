<script setup>
import UnitToggler from '@/components/exercise/UnitToggler.vue'
import ThemeToggler from '@/components/exercise/ThemeToggler.vue'
</script>

<template>
  <div class="app-shell">
    <h2 class="dashboard-title">과제: 날씨</h2>

    <nav class="navigation-bar">
      <RouterLink to="/">날씨 대시보드</RouterLink>
      <RouterLink to="/about">서비스 소개</RouterLink>
      <RouterLink to="/delivery-guide">배달 안내</RouterLink>

      <UnitToggler />
      <ThemeToggler />
    </nav>

    <main class="main-content">
      <RouterView />
    </main>
  </div>
</template>

<style>
/* ⚠️ 외부 스타일 파일(예: 버튼 디자인 뭉치)을 이 방 안으로 쏙 가리켜 가져옵니다 */
@import '@/assets/exercise.css';

.dashboard-title {
  width: 100%;
  max-width: 800px;
  margin: 0 auto 16px;
}
.main-content {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
}
</style>

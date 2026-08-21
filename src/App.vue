<script setup>
import UnitToggler from '@/components/exercise/UnitToggler.vue'
</script>

<template>
  <div id="app">
    <h2 class="dashboard-title">과제 2: 날씨 (라우터 적용)</h2>

    <nav class="navigation-bar">
      <RouterLink to="/">날씨 대시보드</RouterLink>
      <RouterLink to="/about">서비스 소개</RouterLink>
      <RouterLink to="/delivery-guide">배달 안내</RouterLink>

      <UnitToggler />
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
  width: 600px;
  margin: 0 auto 16px;
}
</style>

<template>
  <div class="base-dashboard-card">
    <slot>
      <p>표시할 내용이 없습니다.</p>
    </slot>
  </div>
</template>

<style scoped>
.base-dashboard-card {
  background: var(--color-background-soft);
  padding: 15px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  margin-bottom: 15px;
  color: var(--color-text);
}
</style>

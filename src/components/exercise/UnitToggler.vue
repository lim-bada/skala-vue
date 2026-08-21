<script setup>
import { useConfigStore } from '@/stores/configStore'

const configStore = useConfigStore()
</script>

<template>
  <div class="unit-toggler">
    <span>현재 단위: {{ configStore.unitSymbol }}</span>

    <el-button type="primary" plain @click="configStore.toggleUnit">
      {{ configStore.unit === 'celsius' ? '화씨로 변경' : '섭씨로 변경' }}
    </el-button>
  </div>
</template>

<style scoped>
.unit-toggler {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>

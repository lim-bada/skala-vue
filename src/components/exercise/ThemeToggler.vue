<script setup>
import { useConfigStore } from '@/stores/configStore'

const configStore = useConfigStore()
</script>

<template>
  <el-button
    :type="configStore.isDarkMode ? 'warning' : 'info'"
    plain
    @click="configStore.toggleDarkMode"
  >
    {{ configStore.isDarkMode ? '☀️' : '🌙' }}
    {{ configStore.themeButtonLabel }}
  </el-button>
</template>

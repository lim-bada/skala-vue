<script setup>
import DeliveryInfo from './DeliveryInfo.vue'
import { computed } from 'vue'
import { useConfigStore } from '@/stores/configStore'

const props = defineProps({
  weather: {
    type: Object,
    required: true,
  },
})

const configStore = useConfigStore()

const displayTemp = computed(() => {
  const rawTemp = props.weather.temp

  if (configStore.unit === 'fahrenheit') {
    return Math.round((rawTemp * 9) / 5 + 32)
  }

  return rawTemp
})

const emit = defineEmits(['select-card', 'click-detail'])

const handleCardClick = () => {
  emit('select-card', props.weather)
}

const handleDetailClick = () => {
  emit('click-detail', props.weather.name, props.weather.status)
}
</script>

<template>
  <div class="weather-card" @click="handleCardClick">
    <h3>{{ weather.name }}</h3>

    <p>온도: {{ displayTemp }}{{ configStore.unitSymbol }}</p>

    <p>날씨 상태: {{ weather.status }}</p>

    <el-tag v-if="weather.temp >= 28" type="danger"> 더움 (28도 이상) </el-tag>

    <el-tag v-else-if="weather.temp >= 23" type="success"> 선선함 (23도 이상 28도 미만) </el-tag>

    <el-tag v-else type="info"> 쌀쌀함 (23도 미만) </el-tag>

    <el-button type="primary" plain size="small" class="btn-detail" @click.stop="handleDetailClick">
      상세보기
    </el-button>

    <DeliveryInfo :weather="weather" />
  </div>
</template>

<style scoped>
.weather-card {
  position: relative;
  padding: 12px;
  margin-bottom: 10px;
  background-color: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  color: var(--color-text);
  cursor: pointer;
}

.btn-detail {
  position: absolute;
  top: 15px;
  right: 12px;
}
</style>

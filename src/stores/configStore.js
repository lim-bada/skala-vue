import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useConfigStore = defineStore('config', () => {
  // state
  const unit = ref('celsius')
  const sortOrder = ref('default')

  // getter
  const unitSymbol = computed(() => {
    return unit.value === 'celsius' ? '℃' : '℉'
  })
  const sortButtonLabel = computed(() => {
    return sortOrder.value === 'default' ? '기온 높은 순으로 정렬' : '기본 순서로 정렬'
  })

  // action
  const toggleUnit = () => {
    unit.value = unit.value === 'celsius' ? 'fahrenheit' : 'celsius'
  }
  const toggleSortOrder = () => {
    sortOrder.value = sortOrder.value === 'default' ? 'temperatureDesc' : 'default'
  }

  return {
    unit,
    unitSymbol,
    toggleUnit,
    sortOrder,
    sortButtonLabel,
    toggleSortOrder,
  }
})

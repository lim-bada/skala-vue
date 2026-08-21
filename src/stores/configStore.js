import { ref, computed, watch } from 'vue'
import { defineStore } from 'pinia'

export const useConfigStore = defineStore('config', () => {
  const systemDarkMode = window.matchMedia('(prefers-color-scheme: dark)')

  // state
  const unit = ref('celsius')
  const sortOrder = ref('default')
  const isDarkMode = ref(systemDarkMode.matches)

  // getter
  const unitSymbol = computed(() => {
    return unit.value === 'celsius' ? '℃' : '℉'
  })
  const sortButtonLabel = computed(() => {
    return sortOrder.value === 'default' ? '기온 높은 순으로 정렬' : '기본 순서로 정렬'
  })
  const themeButtonLabel = computed(() => {
    return isDarkMode.value ? '라이트 모드로 변경' : '다크 모드로 변경'
  })

  // action
  const toggleUnit = () => {
    unit.value = unit.value === 'celsius' ? 'fahrenheit' : 'celsius'
  }
  const toggleSortOrder = () => {
    sortOrder.value = sortOrder.value === 'default' ? 'temperatureDesc' : 'default'
  }
  const toggleDarkMode = () => {
    isDarkMode.value = !isDarkMode.value
  }

  watch(
    isDarkMode,
    (darkMode) => {
      document.documentElement.classList.toggle('dark', darkMode)
    },
    { immediate: true },
  )

  systemDarkMode.addEventListener('change', (event) => {
    isDarkMode.value = event.matches
  })

  return {
    unit,
    unitSymbol,
    toggleUnit,
    sortOrder,
    sortButtonLabel,
    toggleSortOrder,
    isDarkMode,
    themeButtonLabel,
    toggleDarkMode,
  }
})

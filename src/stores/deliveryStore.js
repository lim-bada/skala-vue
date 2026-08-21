import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useDeliveryStore = defineStore('delivery', () => {
  // state
  const selectedDeliveryCity = ref(null)

  // getter
  const expectedDeliveryTime = computed(() => {
    const weather = selectedDeliveryCity.value

    if (!weather) {
      return 0
    }

    const isRain =
      weather.status === '비' || ['Rain', 'Drizzle', 'Thunderstorm'].includes(weather.condition)

    if (isRain) {
      return weather.delivery.baseTime + 15
    }

    if (weather.temp >= 28) {
      return weather.delivery.baseTime + 5
    }

    return weather.delivery.baseTime
  })

  // action
  const selectDeliveryCity = (weather) => {
    selectedDeliveryCity.value = weather
  }

  return {
    selectedDeliveryCity,
    expectedDeliveryTime,
    selectDeliveryCity,
  }
})

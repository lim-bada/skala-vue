import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { calculateDeliveryEstimate } from '@/utils/deliveryCalculator'

export const useDeliveryStore = defineStore('delivery', () => {
  // state
  const selectedDeliveryCity = ref(null)

  // getter
  const expectedDeliveryTime = computed(() => {
    return calculateDeliveryEstimate(selectedDeliveryCity.value).totalTime
  })

  // action
  const selectDeliveryCity = (weather) => {
    selectedDeliveryCity.value = weather
  }
  const clearDeliveryCity = () => {
    selectedDeliveryCity.value = null
  }

  return {
    selectedDeliveryCity,
    expectedDeliveryTime,
    selectDeliveryCity,
    clearDeliveryCity,
  }
})

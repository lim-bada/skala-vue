import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { calculateDeliveryEstimate } from '@/utils/deliveryCalculator'

export const DELIVERY_MENU_OPTIONS = [
  { id: 'tteokbokki', name: '떡볶이', baseTime: 25 },
  { id: 'chicken', name: '치킨', baseTime: 30 },
  { id: 'pork-soup', name: '돼지국밥', baseTime: 20 },
  { id: 'makchang', name: '막창', baseTime: 35 },
  { id: 'tteokgalbi', name: '떡갈비', baseTime: 28 },
]

export const useDeliveryStore = defineStore('delivery', () => {
  // state
  const selectedDeliveryCity = ref(null)
  const selectedMenuId = ref('')
  const deliveryOrigin = ref(null)
  const deliveryDestination = ref(null)
  const deliveryRoute = ref(null)

  // getter
  const selectedMenu = computed(() => {
    return DELIVERY_MENU_OPTIONS.find((menu) => menu.id === selectedMenuId.value) ?? null
  })
  const deliveryOrder = computed(() => {
    if (selectedMenu.value && deliveryRoute.value) {
      return {
        menu: selectedMenu.value.name,
        baseTime: selectedMenu.value.baseTime,
        distance: deliveryRoute.value.distanceKm,
        routeDurationMinutes: deliveryRoute.value.durationMinutes,
      }
    }

    return selectedDeliveryCity.value?.delivery ?? null
  })
  const deliveryEstimate = computed(() => {
    return calculateDeliveryEstimate(selectedDeliveryCity.value, deliveryOrder.value)
  })
  const expectedDeliveryTime = computed(() => {
    return deliveryEstimate.value.totalTime
  })
  const isOrderReady = computed(() => {
    return Boolean(
      selectedDeliveryCity.value &&
      selectedMenu.value &&
      deliveryOrigin.value &&
      deliveryDestination.value &&
      deliveryRoute.value,
    )
  })

  // action
  const clearDeliveryRoute = () => {
    deliveryOrigin.value = null
    deliveryDestination.value = null
    deliveryRoute.value = null
  }
  const selectDeliveryCity = (weather) => {
    const isDifferentCity = selectedDeliveryCity.value?.id !== weather?.id
    selectedDeliveryCity.value = weather

    if (isDifferentCity) {
      clearDeliveryRoute()
    }
  }
  const clearDeliveryCity = () => {
    selectedDeliveryCity.value = null
    clearDeliveryRoute()
  }
  const setDeliveryOrigin = (origin) => {
    deliveryOrigin.value = origin
    deliveryRoute.value = null
  }
  const setDeliveryDestination = (destination) => {
    deliveryDestination.value = destination
    deliveryRoute.value = null
  }
  const setDeliveryRoute = (route) => {
    deliveryRoute.value = route
  }
  const resetDeliveryOrder = () => {
    selectedMenuId.value = ''
    clearDeliveryRoute()
  }

  return {
    selectedDeliveryCity,
    selectedMenuId,
    selectedMenu,
    deliveryOrigin,
    deliveryDestination,
    deliveryRoute,
    deliveryOrder,
    deliveryEstimate,
    expectedDeliveryTime,
    isOrderReady,
    selectDeliveryCity,
    clearDeliveryCity,
    setDeliveryOrigin,
    setDeliveryDestination,
    setDeliveryRoute,
    clearDeliveryRoute,
    resetDeliveryOrder,
  }
})

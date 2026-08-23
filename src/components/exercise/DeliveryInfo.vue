<script setup>
import { computed } from 'vue'
import { calculateDeliveryEstimate } from '@/utils/deliveryCalculator'

const props = defineProps({
  weather: {
    type: Object,
    required: true,
  },
  order: {
    type: Object,
    default: null,
  },
})

const orderInfo = computed(() => props.order ?? props.weather.delivery)
const deliveryEstimate = computed(() => calculateDeliveryEstimate(props.weather, orderInfo.value))
</script>

<template>
  <div class="delivery-info">
    <h4>🛵 배달 예상 정보</h4>

    <p>주문 메뉴: {{ orderInfo.menu }}</p>
    <p>도로 기준 배달 거리: {{ orderInfo.distance }}km</p>
    <p>조리·배차 기본 시간: {{ deliveryEstimate.baseTime }}분</p>
    <p>도로 기준 예상 이동 시간: {{ deliveryEstimate.travelTime }}분</p>

    <p v-if="deliveryEstimate.weatherDelay > 0" class="delivery-delay">
      현재 날씨 지연: +{{ deliveryEstimate.weatherDelay }}분
    </p>

    <p v-if="deliveryEstimate.windDelay > 0" class="delivery-delay">
      강풍 지연: +{{ deliveryEstimate.windDelay }}분
    </p>

    <p class="delivery-total">최종 예상 배달 시간: 약 {{ deliveryEstimate.totalTime }}분</p>

    <p v-if="deliveryEstimate.usesRouteApi" class="delivery-basis">
      openrouteservice의 도로 경로에 현재 날씨 지연을 더한 예상치입니다.
    </p>
    <p v-else class="delivery-basis">
      도로 경로 정보가 없어 이동 시간은 포함되지 않은 Mock 예상치입니다.
    </p>
  </div>
</template>

<style scoped>
.delivery-info {
  margin-top: 12px;
  padding: 10px;
  background-color: var(--color-background-soft);
  border: 1px solid var(--color-border);
  border-radius: 6px;
}

.delivery-delay {
  color: #e67e22;
  font-weight: bold;
}

.delivery-total {
  margin-top: 8px;
  color: var(--el-color-primary);
  font-weight: bold;
}

.delivery-basis {
  color: var(--el-text-color-secondary);
  font-size: 12px;
}
</style>

<script setup>
defineProps({
  weather: {
    type: Object,
    required: true,
  },
})
</script>

<template>
  <div class="delivery-info">
    <h4>🛵 배달 예상 정보</h4>

    <p>주문 메뉴: {{ weather.delivery.menu }}</p>
    <p>배달 거리: {{ weather.delivery.distance }}km</p>
    <p>기본 배달 시간: {{ weather.delivery.baseTime }}분</p>

    <p
      v-if="
        weather.status === '비' || ['Rain', 'Drizzle', 'Thunderstorm'].includes(weather.condition)
      "
      class="delivery-danger"
    >
      예상 배달 시간: 약 {{ weather.delivery.baseTime + 15 }}분
      <br />
      ☔ 비로 인해 배달이 지연될 수 있습니다.
    </p>

    <p v-else-if="weather.temp >= 28" class="delivery-warning">
      예상 배달 시간: 약 {{ weather.delivery.baseTime + 5 }}분
      <br />
      🥵 더운 날씨로 인해 조금 지연될 수 있습니다.
    </p>

    <p v-else class="delivery-normal">
      예상 배달 시간: 약 {{ weather.delivery.baseTime }}분
      <br />
      ✅ 정상적으로 배달될 예정입니다.
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

.delivery-danger {
  color: #e74c3c;
  font-weight: bold;
}

.delivery-warning {
  color: #e67e22;
  font-weight: bold;
}

.delivery-normal {
  color: #27ae60;
  font-weight: bold;
}
</style>

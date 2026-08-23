<script setup>
const deliveryRules = [
  {
    id: 'base',
    condition: '메뉴별 조리·배차 기본 시간',
    calculation: '선택한 메뉴의 baseTime',
    message: '선택한 메뉴에 설정된 기본 조리·배차 시간입니다.',
  },
  {
    id: 'distance',
    condition: '도로 경로 이동 시간',
    calculation: 'openrouteservice의 예상 이동 시간',
    message: '지도에서 선택한 출발지와 도착지 사이의 실제 도로 경로를 기준으로 계산합니다.',
  },
  {
    id: 'drizzle',
    condition: '현재 이슬비',
    calculation: '+5분',
    message: 'OpenWeather의 실제 현재 날씨가 Drizzle일 때만 적용합니다.',
  },
  {
    id: 'rain',
    condition: '현재 비',
    calculation: '+10분',
    message: 'OpenWeather의 실제 현재 날씨가 Rain일 때만 적용합니다.',
  },
  {
    id: 'severe-weather',
    condition: '현재 뇌우 또는 눈',
    calculation: '+15분',
    message: '현재 날씨가 Thunderstorm 또는 Snow일 때 적용합니다.',
  },
  {
    id: 'wind',
    condition: '강풍',
    calculation: '풍속 10m/s 이상이면 +5분',
    message: '실시간 풍속이 기준 이상일 때 추가 지연 시간을 반영합니다.',
  },
  {
    id: 'rounding',
    condition: '최종 안내 시간',
    calculation: '5분 단위 올림',
    message: '계산된 총 시간을 사용자가 보기 쉽게 5분 단위로 올림합니다.',
  },
]
</script>

<template>
  <section class="delivery-guide">
    <h2>날씨별 배달 안내</h2>
    <p>실제 도로 경로의 이동 시간과 현재 날씨를 반영해 예상 배달 시간을 계산합니다.</p>

    <div v-for="rule in deliveryRules" :key="rule.id" class="delivery-rule">
      <h3>{{ rule.condition }}</h3>
      <p>계산 기준: {{ rule.calculation }}</p>
      <p>{{ rule.message }}</p>
    </div>

    <RouterLink to="/">메인 대시보드로 돌아가기</RouterLink>
  </section>
</template>

<style scoped>
.delivery-guide {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.delivery-guide > h2,
.delivery-guide > p {
  margin: 0;
}

.delivery-rule {
  padding: 16px;
  background-color: var(--color-background-soft);
  border: 1px solid var(--color-border);
  border-radius: 8px;
}

.delivery-rule h3 {
  margin: 0 0 10px;
}

.delivery-rule p {
  margin: 4px 0;
}
</style>

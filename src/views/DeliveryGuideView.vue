<script setup>
const deliveryRules = [
  {
    id: 'base',
    condition: '조리·배차 기본 시간',
    calculation: '도시별 Mock Data의 baseTime',
    message: '메뉴 준비와 배달원 배차에 필요한 기본 시간입니다.',
  },
  {
    id: 'distance',
    condition: '거리 이동 시간',
    calculation: '배달 거리 ÷ 시속 20km × 60',
    message: '평균 시속 20km를 기준으로 예상 이동 시간을 계산합니다.',
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
    <p>거리와 실시간 날씨를 반영해 Mock 예상 배달 시간을 계산합니다.</p>

    <div v-for="rule in deliveryRules" :key="rule.id" class="delivery-rule">
      <h3>{{ rule.condition }}</h3>
      <p>계산 기준: {{ rule.calculation }}</p>
      <p>{{ rule.message }}</p>
    </div>

    <RouterLink to="/">메인 대시보드로 돌아가기</RouterLink>
  </section>
</template>

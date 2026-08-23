<script setup>
const serviceFeatures = [
  {
    id: 'weather',
    title: '실시간 날씨',
    description: 'OpenWeather API로 도시별 현재 기온, 날씨, 습도와 풍속을 조회합니다.',
  },
  {
    id: 'search',
    title: '외부 도시 검색',
    description: 'Open-Meteo에서 국내 도시를 검색하고 날씨 대시보드에 추가할 수 있습니다.',
  },
  {
    id: 'detail',
    title: '날씨·대기질 상세정보',
    description: '선택한 도시의 상세 날씨와 PM2.5, PM10, 대기질 지수를 제공합니다.',
  },
  {
    id: 'delivery',
    title: '배달시간 시뮬레이션',
    description:
      '메뉴를 고르고 지도에서 출발지와 도착지를 선택하면 실제 도로 경로와 현재 날씨를 반영해 배달시간을 계산합니다.',
  },
  {
    id: 'setting',
    title: '사용자 설정',
    description: '섭씨·화씨 변환, 기온순 정렬과 라이트·다크 모드를 지원합니다.',
  },
]
</script>

<template>
  <section class="weather-about">
    <h2>날씨 대시보드 서비스 소개</h2>

    <p class="service-summary">
      실시간 기상 정보와 사용자 주문 조건을 결합한 Vue 기반 날씨·배달 시뮬레이션 서비스입니다.
    </p>

    <div class="feature-list">
      <el-card
        v-for="feature in serviceFeatures"
        :key="feature.id"
        class="feature-card"
        shadow="hover"
      >
        <h3>{{ feature.title }}</h3>
        <p>{{ feature.description }}</p>
      </el-card>
    </div>

    <el-alert
      title="실제 도로 경로는 반영하지만 실시간 교통 상황과 주문량은 포함하지 않은 예상치입니다."
      type="info"
      show-icon
      :closable="false"
    />

    <RouterLink class="home-link" to="/">날씨 대시보드로 돌아가기</RouterLink>
  </section>
</template>

<style scoped>
.weather-about {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.weather-about h2,
.weather-about p {
  margin: 0;
}

.service-summary {
  line-height: 1.7;
  color: var(--el-text-color-secondary);
}

.feature-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.feature-card h3 {
  margin: 0 0 8px;
}

.feature-card p {
  line-height: 1.6;
}

.home-link {
  align-self: flex-start;
}

@media (max-width: 600px) {
  .feature-list {
    grid-template-columns: 1fr;
  }
}
</style>

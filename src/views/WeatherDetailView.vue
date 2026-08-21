<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useConfigStore } from '@/stores/configStore'

const route = useRoute()
const configStore = useConfigStore()
const selectedWeather = ref(null)
const displayTemp = computed(() => {
  if (!selectedWeather.value) {
    return 0
  }

  const rawTemp = selectedWeather.value.temp

  if (configStore.unit === 'fahrenheit') {
    return Math.round((rawTemp * 9) / 5 + 32)
  }

  return rawTemp
})
const weatherList = [
  {
    id: 'city_01',
    name: '서울',
    temp: 28,
    status: '맑음',
    humidity: 55,
    windSpeed: 2.1,
  },
  {
    id: 'city_02',
    name: '수원',
    temp: 23,
    status: '비',
    humidity: 82,
    windSpeed: 3.4,
  },
  {
    id: 'city_03',
    name: '부산',
    temp: 26,
    status: '구름',
    humidity: 68,
    windSpeed: 4.2,
  },
  {
    id: 'city_04',
    name: '대구',
    temp: 30,
    status: '맑음',
    humidity: 48,
    windSpeed: 1.8,
  },
  {
    id: 'city_05',
    name: '광주',
    temp: 22,
    status: '흐림',
    humidity: 72,
    windSpeed: 2.7,
  },
]
onMounted(() => {
  selectedWeather.value = weatherList.find((weather) => weather.id === route.params.cityId) || null
})
</script>

<template>
  <section class="weather-detail">
    <h2>지역별 상세 기상관측 정보</h2>

    <div v-if="selectedWeather" class="detail-card">
      <h3>{{ selectedWeather.name }}</h3>
      <p>도시 코드: {{ selectedWeather.id }}</p>
      <p>현재 온도: {{ displayTemp }}{{ configStore.unitSymbol }}</p>
      <p>날씨 상태: {{ selectedWeather.status }}</p>
      <p>습도: {{ selectedWeather.humidity }}%</p>
      <p>풍속: {{ selectedWeather.windSpeed }}m/s</p>
    </div>

    <p v-else>해당 도시의 날씨 정보를 찾을 수 없습니다.</p>

    <RouterLink to="/">날씨 대시보드로 돌아가기</RouterLink>
  </section>
</template>

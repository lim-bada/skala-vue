<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useConfigStore } from '@/stores/configStore'
import axios from 'axios'

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY
const AIR_POLLUTION_API_URL = 'https://api.openweathermap.org/data/2.5/air_pollution'
const route = useRoute()
const configStore = useConfigStore()
const selectedWeather = ref(null)
const airPollutionData = ref(null)
const isAirLoading = ref(false)
const airErrorMessage = ref('')
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

const airQualityLabel = computed(() => {
  const aqi = airPollutionData.value?.main.aqi

  const labels = {
    1: '좋음',
    2: '양호',
    3: '보통',
    4: '나쁨',
    5: '매우 나쁨',
  }

  return labels[aqi] || '정보 없음'
})

const weatherList = [
  {
    id: 'city_01',
    name: '서울',
    lat: 37.5665,
    lon: 126.978,
    temp: 28,
    status: '맑음',
    humidity: 55,
    windSpeed: 2.1,
  },
  {
    id: 'city_02',
    name: '수원',
    lat: 37.2636,
    lon: 127.0286,
    temp: 23,
    status: '비',
    humidity: 82,
    windSpeed: 3.4,
  },
  {
    id: 'city_03',
    name: '부산',
    lat: 35.1796,
    lon: 129.0756,
    temp: 26,
    status: '구름',
    humidity: 68,
    windSpeed: 4.2,
  },
  {
    id: 'city_04',
    name: '대구',
    lat: 35.8714,
    lon: 128.6014,
    temp: 30,
    status: '맑음',
    humidity: 48,
    windSpeed: 1.8,
  },
  {
    id: 'city_05',
    name: '광주',
    lat: 35.1595,
    lon: 126.8526,
    temp: 22,
    status: '흐림',
    humidity: 72,
    windSpeed: 2.7,
  },
]

const fetchAirPollution = async (city) => {
  if (!API_KEY) {
    airErrorMessage.value = 'OpenWeather API 키가 설정되지 않았습니다.'
    return
  }

  isAirLoading.value = true
  airErrorMessage.value = ''

  try {
    const response = await axios.get(AIR_POLLUTION_API_URL, {
      params: {
        lat: city.lat,
        lon: city.lon,
        appid: API_KEY,
      },
    })

    airPollutionData.value = response.data.list[0]
  } catch (error) {
    console.error('대기질 조회 실패:', error)
    airErrorMessage.value = '대기질 정보를 가져오지 못했습니다.'
  } finally {
    isAirLoading.value = false
  }
}

onMounted(async () => {
  selectedWeather.value = weatherList.find((weather) => weather.id === route.params.cityId) || null

  if (selectedWeather.value) {
    await fetchAirPollution(selectedWeather.value)
  }
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
      <div class="air-quality">
        <h4>실시간 대기질</h4>

        <p v-if="isAirLoading">대기질 정보를 불러오는 중입니다.</p>

        <p v-else-if="airErrorMessage">
          {{ airErrorMessage }}
        </p>

        <div v-else-if="airPollutionData">
          <p>
            대기질 지수:
            <strong>
              {{ airPollutionData.main.aqi }}
              ({{ airQualityLabel }})
            </strong>
          </p>

          <p>
            초미세먼지(PM2.5):
            {{ airPollutionData.components.pm2_5 }}㎍/㎥
          </p>

          <p>
            미세먼지(PM10):
            {{ airPollutionData.components.pm10 }}㎍/㎥
          </p>
        </div>

        <p v-else>대기질 정보가 없습니다.</p>
      </div>
    </div>

    <p v-else>해당 도시의 날씨 정보를 찾을 수 없습니다.</p>

    <RouterLink to="/">날씨 대시보드로 돌아가기</RouterLink>
  </section>
</template>

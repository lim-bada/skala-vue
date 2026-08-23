<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useConfigStore } from '@/stores/configStore'
import { useWeatherStore } from '@/stores/weatherStore'
import axios from 'axios'

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY
const AIR_POLLUTION_API_URL = 'https://api.openweathermap.org/data/2.5/air_pollution'
const route = useRoute()
const configStore = useConfigStore()
const weatherStore = useWeatherStore()
const selectedWeather = computed(() => weatherStore.getWeatherById(route.params.cityId))
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

watch(
  selectedWeather,
  async (weather) => {
    airPollutionData.value = null
    airErrorMessage.value = ''

    if (weather) {
      await fetchAirPollution(weather)
    }
  },
  { immediate: true },
)
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

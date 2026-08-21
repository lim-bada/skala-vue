<!-- Weather UI Library도 진행함. -->
<script setup>
import { ref, computed, watch, watchEffect } from 'vue'
import { useRouter } from 'vue-router'
import BaseDashboardCard from './BaseDashboardCard.vue'
import SearchBar from './SearchBar.vue'
import WeatherCard from './WeatherCard.vue'
import { storeToRefs } from 'pinia'
import { useDeliveryStore } from '@/stores/deliveryStore'
import { useConfigStore } from '@/stores/configStore'
import axios from 'axios'

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY
const WEATHER_API_URL = 'https://api.openweathermap.org/data/2.5/weather'

const router = useRouter()
const deliveryStore = useDeliveryStore()
const configStore = useConfigStore()

const { selectedDeliveryCity, expectedDeliveryTime } = storeToRefs(deliveryStore)
const weatherList = ref([
  {
    id: 'city_01',
    name: '서울',
    lat: 37.5665,
    lon: 126.978,
    temp: 28,
    status: '맑음',
    delivery: { menu: '떡볶이', distance: 2.1, baseTime: 25 },
  },
  {
    id: 'city_02',
    name: '수원',
    lat: 37.2636,
    lon: 127.0286,
    temp: 23,
    status: '비',
    delivery: { menu: '치킨', distance: 3.4, baseTime: 30 },
  },
  {
    id: 'city_03',
    name: '부산',
    lat: 35.1796,
    lon: 129.0756,
    temp: 26,
    status: '구름',
    delivery: { menu: '돼지국밥', distance: 1.8, baseTime: 20 },
  },
  {
    id: 'city_04',
    name: '대구',
    lat: 35.8714,
    lon: 128.6014,
    temp: 30,
    status: '맑음',
    delivery: { menu: '막창', distance: 4.2, baseTime: 35 },
  },
  {
    id: 'city_05',
    name: '광주',
    lat: 35.1595,
    lon: 126.8526,
    temp: 22,
    status: '흐림',
    delivery: { menu: '떡갈비', distance: 2.6, baseTime: 28 },
  },
])
const searchQuery = ref('')
const selectedCityInfo = ref('카드를 클릭하거나 검색해 보세요.')

const isLoading = ref(false)
const errorMessage = ref('')

const selectCity = (weather) => {
  selectedCityInfo.value = `${weather.name}이 선택되었습니다.`
  deliveryStore.selectDeliveryCity(weather)
}

const showDetail = (cityName) => {
  const selectedWeather = weatherList.value.find((weather) => weather.name === cityName)

  if (selectedWeather) {
    router.push('/weather/' + selectedWeather.id)
  }
}

const handleUpdateQuery = (newQuery) => {
  searchQuery.value = newQuery
}

const handleFetchWeather = async () => {
  if (!API_KEY) {
    errorMessage.value = 'OpenWeather API 키가 설정되지 않았습니다.'
    return
  }

  isLoading.value = true
  errorMessage.value = ''

  try {
    const requests = weatherList.value.map((city) =>
      axios.get(WEATHER_API_URL, {
        params: {
          lat: city.lat,
          lon: city.lon,
          appid: API_KEY,
          units: 'metric',
          lang: 'kr',
        },
      }),
    )

    const responses = await axios.all(requests)

    weatherList.value = weatherList.value.map((city, index) => {
      const data = responses[index].data

      return {
        ...city,
        temp: Math.round(data.main.temp),
        status: data.weather[0].description,
        condition: data.weather[0].main,
        humidity: data.main.humidity,
        windSpeed: data.wind.speed,
        icon: data.weather[0].icon,
      }
    })
  } catch (error) {
    console.error('실시간 날씨 조회 실패:', error)
    errorMessage.value = '날씨 데이터를 가져오지 못했습니다. API 키와 네트워크 상태를 확인하세요.'
  } finally {
    isLoading.value = false
  }
}

// computed
const filteredWeatherList = computed(() => {
  const query = searchQuery.value.trim()

  let result = weatherList.value

  if (query) {
    result = weatherList.value.filter((item) => item.name.includes(query))
  }

  if (configStore.sortOrder === 'temperatureDesc') {
    return [...result].sort((a, b) => b.temp - a.temp)
  }

  return result
})

// watch
watch(selectedCityInfo, (newInfo) => {
  console.log(`[watch 감지] 상태 바 문구가 업데이트되었습니다 -> "${newInfo}"`)
})

watch(selectedDeliveryCity, (newCity, oldCity) => {
  if (!newCity) {
    return
  }
  const oldCityName = oldCity ? oldCity.name : '선택 없음'

  console.log(
    `[배달 도시 변경] ${oldCityName} → ${newCity.name}, 예상 배달 시간: ${expectedDeliveryTime.value}분`,
  )
})

// watchEffect
watchEffect(() => {
  console.log(
    `[watchEffect 자동 호출] 현재 검색어 '${searchQuery.value}'에 매칭되는 API 데이터를 필터링합니다.`,
  )
})
</script>

<template>
  <div class="dashboard-wrapper">
    <BaseDashboardCard>
      <SearchBar :search-query="searchQuery" @update-query="handleUpdateQuery" />
      <el-button type="primary" :loading="isLoading" @click="handleFetchWeather">
        {{ isLoading ? '실시간 날씨 불러오는 중...' : '실시간 날씨 새로고침' }}
      </el-button>

      <el-button type="success" plain @click="configStore.toggleSortOrder">
        {{ configStore.sortButtonLabel }}
      </el-button>
      <el-alert
        v-if="errorMessage"
        :title="errorMessage"
        type="error"
        show-icon
        :closable="false"
      />
    </BaseDashboardCard>
    <BaseDashboardCard>
      <div class="weather-list">
        <h3>지역별 날씨 현황</h3>
        <el-empty
          v-if="filteredWeatherList.length === 0"
          description="검색 결과와 일치하는 도시가 없습니다."
          :image-size="80"
        />
        <WeatherCard
          v-for="weather in filteredWeatherList"
          :key="weather.id"
          :weather="weather"
          @select-card="selectCity"
          @click-detail="showDetail"
        />
      </div>
    </BaseDashboardCard>
    <div class="status-bar">{{ selectedCityInfo }}</div>
    <div v-if="selectedDeliveryCity" class="delivery-info">
      <h4>📦 선택한 주문 정보</h4>
      <p>도시: {{ selectedDeliveryCity.name }}</p>
      <p>메뉴: {{ selectedDeliveryCity.delivery.menu }}</p>
      <p>
        최종 예상 배달 시간:
        <strong>{{ expectedDeliveryTime }}분</strong>
      </p>
    </div>
  </div>
</template>

<style scoped>
.dashboard-wrapper {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
}

.status-bar {
  padding: 10px;
  background-color: #e8f5e9;
  border-radius: 6px;
  color: #2e7d32;
  font-weight: bold;
  text-align: center;
}

.delivery-info {
  margin-top: 12px;
  padding: 10px;
  background-color: var(--color-background-soft);
  border: 1px solid var(--color-border);
  border-radius: 6px;
}

:global(.dark) .status-bar {
  background-color: #1e3a2a;
  color: #9be7ad;
}
</style>

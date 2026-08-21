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
const GEOCODING_API_URL = 'https://geocoding-api.open-meteo.com/v1/search'

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

// 외부 도시 검색 상태
const locationResults = ref([])
const searchedWeather = ref(null)
const isCitySearchLoading = ref(false)
const citySearchError = ref('')

const selectCity = (weather) => {
  selectedCityInfo.value = `${weather.name}이 선택되었습니다.`

  if (weather.delivery) {
    deliveryStore.selectDeliveryCity(weather)
  } else {
    deliveryStore.clearDeliveryCity()
  }
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

const handleSearchLocation = async () => {
  const query = searchQuery.value.trim()

  if (query.length < 2) {
    citySearchError.value = '도시 이름을 두 글자 이상 입력해 주세요.'
    return
  }

  isCitySearchLoading.value = true
  citySearchError.value = ''
  locationResults.value = []
  searchedWeather.value = null

  try {
    const requestLocations = async (name) => {
      const response = await axios.get(GEOCODING_API_URL, {
        params: {
          name,
          count: 5,
          language: 'ko',
          countryCode: 'KR',
          format: 'json',
        },
      })

      return response.data.results ?? []
    }

    // 입력한 도시명으로 먼저 검색
    let results = await requestLocations(query)

    // 결과가 없고 '시'로 끝나지 않으면 '시'를 붙여 재검색
    if (results.length === 0 && !query.endsWith('시')) {
      results = await requestLocations(`${query}시`)
    }

    if (results.length === 0) {
      citySearchError.value = `'${query}'에 해당하는 국내 도시를 찾지 못했습니다.`
      return
    }

    locationResults.value = results
  } catch (error) {
    console.error('외부 도시 검색 실패:', error)
    citySearchError.value = '도시 검색에 실패했습니다. 잠시 후 다시 시도해 주세요.'
  } finally {
    isCitySearchLoading.value = false
  }
}

const handleSelectLocation = async (location) => {
  if (!API_KEY) {
    citySearchError.value = 'OpenWeather API 키가 설정되지 않았습니다.'
    return
  }

  isCitySearchLoading.value = true
  citySearchError.value = ''
  searchedWeather.value = null

  try {
    const response = await axios.get(WEATHER_API_URL, {
      params: {
        lat: location.latitude,
        lon: location.longitude,
        appid: API_KEY,
        units: 'metric',
        lang: 'kr',
      },
    })

    const data = response.data

    searchedWeather.value = {
      id: `external_${location.id}`,
      name: location.name,
      region: [location.admin1, location.admin2].filter(Boolean).join(' '),
      country: location.country,
      lat: location.latitude,
      lon: location.longitude,
      temp: Math.round(data.main.temp),
      status: data.weather[0].description,
      condition: data.weather[0].main,
      humidity: data.main.humidity,
      windSpeed: data.wind.speed,
      icon: data.weather[0].icon,
    }
  } catch (error) {
    console.error('외부 도시 날씨 조회 실패:', error)
    citySearchError.value = '선택한 도시의 날씨를 가져오지 못했습니다.'
  } finally {
    isCitySearchLoading.value = false
  }
}

const addSearchedWeather = () => {
  const weather = searchedWeather.value

  if (!weather) {
    return
  }

  const isAlreadyAdded = weatherList.value.some((city) => {
    const sameName = city.name === weather.name
    const sameLocation =
      Math.abs(city.lat - weather.lat) < 0.01 && Math.abs(city.lon - weather.lon) < 0.01

    return sameName || sameLocation
  })

  if (isAlreadyAdded) {
    citySearchError.value = `${weather.name}은 이미 대시보드에 등록된 도시입니다.`
    return
  }

  weatherList.value.push({
    ...weather,
    isExternal: true,
    delivery: null,
  })

  selectedCityInfo.value = `${weather.name}이 대시보드에 추가되었습니다.`

  searchQuery.value = ''
  locationResults.value = []
  searchedWeather.value = null
  citySearchError.value = ''
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

const searchedWeatherTemp = computed(() => {
  if (!searchedWeather.value) {
    return null
  }

  const temp = searchedWeather.value.temp

  if (configStore.unit === 'fahrenheit') {
    return Math.round((temp * 9) / 5 + 32)
  }

  return temp
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

watch(searchQuery, () => {
  locationResults.value = []
  searchedWeather.value = null
  citySearchError.value = ''
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
          v-if="
            filteredWeatherList.length === 0 && locationResults.length === 0 && !searchedWeather
          "
          description="등록된 도시 중 검색 결과가 없습니다."
          :image-size="80"
        >
          <el-button type="primary" :loading="isCitySearchLoading" @click="handleSearchLocation">
            ‘{{ searchQuery.trim() }}’ 실제 도시 검색
          </el-button>
        </el-empty>

        <el-alert
          v-if="citySearchError"
          :title="citySearchError"
          type="error"
          show-icon
          :closable="false"
        />

        <div v-if="locationResults.length > 0" class="location-results">
          <h4>검색된 지역을 선택해 주세요.</h4>

          <el-button
            v-for="location in locationResults"
            :key="location.id"
            class="location-button"
            type="primary"
            plain
            :disabled="isCitySearchLoading"
            @click="handleSelectLocation(location)"
          >
            {{ location.name }}
            <span v-if="location.admin1"> / {{ location.admin1 }}</span>
            <span v-if="location.admin2"> / {{ location.admin2 }}</span>
          </el-button>
        </div>
        <el-card v-if="searchedWeather" class="searched-weather-card" shadow="never">
          <template #header>
            <div class="searched-weather-header">
              <div>
                <h3>{{ searchedWeather.name }}</h3>
                <p>
                  <span v-if="searchedWeather.region">
                    {{ searchedWeather.region }}
                  </span>
                  <span v-if="searchedWeather.country">
                    {{ searchedWeather.country }}
                  </span>
                </p>
              </div>

              <img
                v-if="searchedWeather.icon"
                class="searched-weather-icon"
                :src="`https://openweathermap.org/img/wn/${searchedWeather.icon}@2x.png`"
                :alt="`${searchedWeather.status} 날씨 아이콘`"
              />
            </div>
          </template>

          <el-descriptions :column="2" border>
            <el-descriptions-item label="현재 온도">
              {{ searchedWeatherTemp }}{{ configStore.unitSymbol }}
            </el-descriptions-item>

            <el-descriptions-item label="날씨 상태">
              {{ searchedWeather.status }}
            </el-descriptions-item>

            <el-descriptions-item label="습도">
              {{ searchedWeather.humidity }}%
            </el-descriptions-item>

            <el-descriptions-item label="풍속">
              {{ searchedWeather.windSpeed }}m/s
            </el-descriptions-item>
          </el-descriptions>

          <el-alert
            class="external-weather-notice"
            title="외부 검색 도시는 실제 기상 정보만 제공하며 배달 Mock Data에는 포함되지 않습니다."
            type="info"
            show-icon
            :closable="false"
          />
          <div class="external-weather-actions">
            <el-button type="success" @click="addSearchedWeather"> 대시보드에 추가 </el-button>
          </div>
        </el-card>
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

.location-results {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 12px 0;
}

.location-results h4 {
  margin-bottom: 4px;
}

.location-results .location-button {
  width: 100%;
  margin-left: 0;
  justify-content: flex-start;
}

.searched-weather-card {
  margin: 12px 0;
}

.searched-weather-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.searched-weather-header p {
  color: var(--el-text-color-secondary);
}

.searched-weather-icon {
  width: 64px;
  height: 64px;
}

.external-weather-notice {
  margin-top: 12px;
}

.external-weather-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
}
</style>

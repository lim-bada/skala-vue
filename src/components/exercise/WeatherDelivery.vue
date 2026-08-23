<!-- Weather UI Library도 진행함. -->
<script setup>
import { ref, computed, watch, watchEffect } from 'vue'
import { useRouter } from 'vue-router'
import BaseDashboardCard from './BaseDashboardCard.vue'
import DeliveryInfo from './DeliveryInfo.vue'
import DeliveryRouteMap from './DeliveryRouteMap.vue'
import SearchBar from './SearchBar.vue'
import WeatherCard from './WeatherCard.vue'
import { storeToRefs } from 'pinia'
import { DELIVERY_MENU_OPTIONS, useDeliveryStore } from '@/stores/deliveryStore'
import { useConfigStore } from '@/stores/configStore'
import { useWeatherStore } from '@/stores/weatherStore'
import { fetchDeliveryRoute } from '@/services/routeService'
import axios from 'axios'

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY
const ROUTING_API_KEY = import.meta.env.VITE_OPENROUTESERVICE_API_KEY
const WEATHER_API_URL = 'https://api.openweathermap.org/data/2.5/weather'
const GEOCODING_API_URL = 'https://geocoding-api.open-meteo.com/v1/search'

const router = useRouter()
const deliveryStore = useDeliveryStore()
const configStore = useConfigStore()
const weatherStore = useWeatherStore()

const {
  selectedDeliveryCity,
  selectedMenuId,
  deliveryOrigin,
  deliveryDestination,
  deliveryRoute,
  deliveryOrder,
  expectedDeliveryTime,
  isOrderReady,
} = storeToRefs(deliveryStore)
const { weatherList } = storeToRefs(weatherStore)
const deliveryMenuOptions = DELIVERY_MENU_OPTIONS
const searchQuery = ref('')
const selectedCityInfo = ref('카드를 클릭하거나 검색해 보세요.')

const isLoading = ref(false)
const errorMessage = ref('')
const isRouteLoading = ref(false)
const routeError = ref('')
const routeSelectionMode = ref('origin')

// 외부 도시 검색 상태
const locationResults = ref([])
const searchedWeather = ref(null)
const isCitySearchLoading = ref(false)
const citySearchError = ref('')

const selectCity = (weather) => {
  const isDifferentCity = selectedDeliveryCity.value?.id !== weather.id
  selectedCityInfo.value = `${weather.name}이 선택되었습니다.`
  deliveryStore.selectDeliveryCity(weather)
  routeError.value = ''

  if (isDifferentCity) {
    routeSelectionMode.value = 'origin'
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

const handleSelectOrigin = (origin) => {
  deliveryStore.setDeliveryOrigin(origin)
  routeError.value = ''
}

const handleSelectDestination = (destination) => {
  deliveryStore.setDeliveryDestination(destination)
  routeError.value = ''
}

const handleCalculateRoute = async () => {
  if (!ROUTING_API_KEY) {
    routeError.value = 'openrouteservice API 키가 설정되지 않았습니다.'
    return
  }

  if (!deliveryOrigin.value || !deliveryDestination.value) {
    routeError.value = '지도에서 출발지와 도착지를 먼저 선택해 주세요.'
    return
  }

  isRouteLoading.value = true
  routeError.value = ''

  try {
    const route = await fetchDeliveryRoute({
      origin: deliveryOrigin.value,
      destination: deliveryDestination.value,
      apiKey: ROUTING_API_KEY,
    })

    if (route.distanceKm > 30) {
      routeError.value = `도로 기준 ${route.distanceKm}km입니다. 배달 가능 거리인 30km 안쪽을 선택해 주세요.`
      return
    }

    deliveryStore.setDeliveryRoute(route)
  } catch (error) {
    console.error('배달 경로 조회 실패:', error)

    if (error.response?.status === 401 || error.response?.status === 403) {
      routeError.value = '길찾기 API 키를 확인해 주세요.'
    } else {
      routeError.value = error.message || '배달 경로를 계산하지 못했습니다.'
    }
  } finally {
    isRouteLoading.value = false
  }
}

const handleResetDeliveryOrder = () => {
  deliveryStore.resetDeliveryOrder()
  routeError.value = ''
  routeSelectionMode.value = 'origin'
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

  const isAdded = weatherStore.addWeather({
    ...weather,
    isExternal: true,
  })

  if (!isAdded) {
    citySearchError.value = `${weather.name}은 이미 대시보드에 등록된 도시입니다.`
    return
  }

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

    if (selectedDeliveryCity.value) {
      const refreshedCity = weatherList.value.find(
        (city) => city.id === selectedDeliveryCity.value.id,
      )

      if (refreshedCity) {
        deliveryStore.selectDeliveryCity(refreshedCity)
      }
    }
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

const routeCoordinates = computed(() => deliveryRoute.value?.coordinates ?? [])
const canCalculateRoute = computed(() => {
  return Boolean(
    selectedMenuId.value && deliveryOrigin.value && deliveryDestination.value && ROUTING_API_KEY,
  )
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

  console.log(`[배달 도시 변경] ${oldCityName} → ${newCity.name}`)
})

watch(expectedDeliveryTime, (newTime) => {
  if (isOrderReady.value) {
    console.log(`[배달 예상 시간] 사용자 주문 조건 기준 ${newTime}분`)
  }
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
            title="대시보드에 추가한 뒤 카드를 선택하면 배달 예상 시간을 계산할 수 있습니다."
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
          :show-delivery-info="false"
          @select-card="selectCity"
          @click-detail="showDetail"
        />
      </div>
    </BaseDashboardCard>
    <div class="status-bar">{{ selectedCityInfo }}</div>

    <BaseDashboardCard v-if="selectedDeliveryCity">
      <section class="delivery-order">
        <div class="delivery-order-header">
          <div>
            <h4>📦 배달 주문 조건</h4>
            <p>
              선택 도시: <strong>{{ selectedDeliveryCity.name }}</strong>
            </p>
          </div>

          <el-button plain @click="handleResetDeliveryOrder">입력 초기화</el-button>
        </div>

        <el-form label-position="top">
          <el-form-item class="menu-form-item" label="주문 메뉴">
            <el-select v-model="selectedMenuId" placeholder="메뉴를 선택해 주세요">
              <el-option
                v-for="menu in deliveryMenuOptions"
                :key="menu.id"
                :label="`${menu.name} (기본 ${menu.baseTime}분)`"
                :value="menu.id"
              />
            </el-select>
          </el-form-item>
        </el-form>

        <el-alert
          v-if="!ROUTING_API_KEY"
          title="openrouteservice API 키가 없어 경로를 계산할 수 없습니다."
          type="warning"
          show-icon
          :closable="false"
        />

        <DeliveryRouteMap
          v-model:selection-mode="routeSelectionMode"
          :center="selectedDeliveryCity"
          :origin="deliveryOrigin"
          :destination="deliveryDestination"
          :route-coordinates="routeCoordinates"
          :loading="isRouteLoading"
          :can-calculate="canCalculateRoute"
          @select-origin="handleSelectOrigin"
          @select-destination="handleSelectDestination"
          @calculate-route="handleCalculateRoute"
        />

        <el-alert
          v-if="routeError"
          class="route-message"
          :title="routeError"
          type="error"
          show-icon
          :closable="false"
        />

        <el-alert
          v-else-if="!selectedMenuId"
          class="route-message"
          title="메뉴를 선택해 주세요."
          type="info"
          show-icon
          :closable="false"
        />

        <el-alert
          v-else-if="!deliveryOrigin"
          class="route-message"
          title="출발지 선택 모드에서 음식점 위치를 선택해 주세요."
          type="info"
          show-icon
          :closable="false"
        />

        <el-alert
          v-else-if="!deliveryDestination"
          class="route-message"
          title="도착지 선택 모드에서 배달받을 위치를 선택해 주세요."
          type="info"
          show-icon
          :closable="false"
        />

        <el-alert
          v-else-if="!isOrderReady"
          class="route-message"
          title="경로 계산 버튼을 누르면 예상 배달 시간이 계산됩니다."
          type="info"
          show-icon
          :closable="false"
        />

        <DeliveryInfo v-else :weather="selectedDeliveryCity" :order="deliveryOrder" />
      </section>
    </BaseDashboardCard>
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

.delivery-order-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}

.delivery-order-header h4,
.delivery-order-header p {
  margin: 0;
}

.delivery-order-header p {
  margin-top: 6px;
}

.menu-form-item {
  max-width: 360px;
}

.menu-form-item :deep(.el-select) {
  width: 100%;
}

.route-message {
  margin-top: 12px;
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

@media (max-width: 600px) {
  .menu-form-item {
    max-width: none;
  }
}
</style>

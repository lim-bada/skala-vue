<script setup>
import { ref, computed, watch, watchEffect } from 'vue'
const weatherList = ref([
  {
    id: 'city_01',
    name: '서울',
    temp: 28,
    status: '맑음',
    delivery: { menu: '떡볶이', distance: 2.1, baseTime: 25 },
  },
  {
    id: 'city_02',
    name: '수원',
    temp: 23,
    status: '비',
    delivery: { menu: '치킨', distance: 3.4, baseTime: 30 },
  },
  {
    id: 'city_03',
    name: '부산',
    temp: 26,
    status: '구름',
    delivery: { menu: '돼지국밥', distance: 1.8, baseTime: 20 },
  },
  {
    id: 'city_04',
    name: '대구',
    temp: 30,
    status: '맑음',
    delivery: { menu: '막창', distance: 4.2, baseTime: 35 },
  },
  {
    id: 'city_05',
    name: '광주',
    temp: 22,
    status: '흐림',
    delivery: { menu: '떡갈비', distance: 2.6, baseTime: 28 },
  },
])
const searchQuery = ref('')
const selectedCityInfo = ref('카드를 클릭하거나 검색해 보세요.')
const selectedDeliveryCity = ref(null)
const selectCity = (weather) => {
  selectedCityInfo.value = `${weather.name}이 선택되었습니다.`
  selectedDeliveryCity.value = weather
}
const showDetail = (cityName, status) => {
  window.alert(`${cityName}의 현재 날씨는 [${status}] 상태입니다.`)
}
const temperatureUnit = ref('celsius')
const expectedDeliveryTime = computed(() => {
  const weather = selectedDeliveryCity.value

  if (!weather) {
    return 0
  }
  if (weather.status === '비') {
    return weather.delivery.baseTime + 15
  }
  if (weather.temp >= 28) {
    return weather.delivery.baseTime + 5
  }
  return weather.delivery.baseTime
})

// computed
const filteredWeatherList = computed(() => {
  const query = searchQuery.value.trim()

  if (!query) {
    return weatherList.value
  }
  return weatherList.value.filter((item) => item.name.includes(query))
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
    <h2>과제 2: 날씨 (컴포지션)</h2>
    <section class="search-box">
      <div class="search-city">
        <h3>도시 검색</h3>
        <input
          type="text"
          :value="searchQuery"
          @input="(e) => (searchQuery = e.target.value)"
          placeholder="검색할 도시 이름 입력"
        />
        <p>검색 중인 도시: {{ searchQuery }}</p>
        <label>
          온도 단위:
          <select v-model="temperatureUnit">
            <option value="celsius">섭씨(°C)</option>
            <option value="fahrenheit">화씨(°F)</option>
          </select>
        </label>
      </div>
    </section>
    <section class="list-box">
      <div class="weather-list">
        <h3>지역별 날씨 현황</h3>
        <p
          v-if="filteredWeatherList.length === 0"
          style="text-align: center; color: #e74c3c; padding: 10px 0"
        >
          검색 결과와 일치하는 도시가 없습니다.
        </p>
        <div
          v-for="weather in filteredWeatherList"
          :key="weather.id"
          class="weather-card"
          @click="selectCity(weather)"
        >
          <h3>{{ weather.name }}</h3>
          <p v-if="temperatureUnit === 'celsius'">온도: {{ weather.temp }}°C</p>
          <p v-else>온도: {{ Math.round((weather.temp * 9) / 5 + 32) }}°F</p>
          <p>날씨 상태: {{ weather.status }}</p>
          <p v-if="weather.temp >= 28" style="color: red">더움 (28도 이상)</p>
          <p v-else-if="weather.temp >= 23" style="color: green">선선함 (23도 이상 28도 미만)</p>
          <p v-else style="color: blue">쌀쌀함 (23도 미만)</p>
          <button
            type="button"
            class="btn-detail"
            @click.stop="showDetail(weather.name, weather.status)"
          >
            상세보기
          </button>
          <div class="delivery-info">
            <h4>🛵 배달 예상 정보</h4>

            <p>주문 메뉴: {{ weather.delivery.menu }}</p>
            <p>배달 거리: {{ weather.delivery.distance }}km</p>
            <p>기본 배달 시간: {{ weather.delivery.baseTime }}분</p>

            <p v-if="weather.status === '비'" class="delivery-danger">
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
        </div>
      </div>
    </section>
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

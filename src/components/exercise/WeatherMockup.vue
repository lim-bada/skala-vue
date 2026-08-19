<script setup>
import { ref } from 'vue'

const weatherList = ref([
  { id: 'city_01', name: '서울', temp: 28, status: '맑음' },
  { id: 'city_02', name: '수원', temp: 23, status: '비' },
  { id: 'city_03', name: '부산', temp: 26, status: '구름' },
  { id: 'city_04', name: '대구', temp: 30, status: '맑음' },
  { id: 'city_05', name: '광주', temp: 22, status: '흐림' },
])
const searchedCity = ref('')

const selectedMessage = ref('도시를 선택해 주세요.')

const selectCity = (cityName) => {
  selectedMessage.value = `${cityName}이 선택되었습니다.`
}

const showDetail = (cityName, status) => {
  window.alert(`${cityName}의 현재 날씨는 [${status}] 상태입니다.`)
}
</script>

<template>
  <div class="weather-mockup">
    <h2>과제 1: 날씨 (Mockup)</h2>
    <section class="search-box">
      <div class="search-city">
        <h3>도시 검색</h3>
        <input
          type="text"
          :value="searchedCity"
          @input="(e) => (searchedCity = e.target.value)"
          placeholder="검색할 도시 이름 입력"
        />
        <p>검색 중인 도시: {{ searchedCity }}</p>
      </div>
    </section>
    <section class="list-box">
      <div class="weather-list">
        <h3>지역별 날씨 현황</h3>
        <p class="status-bar">{{ selectedMessage }}</p>
        <div
          v-for="weather in weatherList"
          :key="weather.id"
          class="weather-card"
          @click="selectCity(weather.name)"
        >
          <h3>{{ weather.name }}</h3>
          <p>온도: {{ weather.temp }}°C</p>
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
        </div>
      </div>
    </section>
  </div>
</template>

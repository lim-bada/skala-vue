import { ref, computed, watch } from 'vue'
import { defineStore } from 'pinia'

const EXTERNAL_CITIES_STORAGE_KEY = 'weather-dashboard-external-cities'

const initialWeatherList = [
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

const isValidExternalCity = (city) => {
  return (
    city &&
    city.isExternal === true &&
    typeof city.id === 'string' &&
    typeof city.name === 'string' &&
    Number.isFinite(Number(city.lat)) &&
    Number.isFinite(Number(city.lon))
  )
}

const loadExternalCities = () => {
  try {
    const savedCities = JSON.parse(localStorage.getItem(EXTERNAL_CITIES_STORAGE_KEY) ?? '[]')

    if (!Array.isArray(savedCities)) {
      return []
    }

    return savedCities.filter(isValidExternalCity).filter((city, index, cities) => {
      const duplicatesInitialCity = initialWeatherList.some((initialCity) => {
        const sameName = initialCity.name === city.name
        const sameLocation =
          Math.abs(initialCity.lat - city.lat) < 0.01 &&
          Math.abs(initialCity.lon - city.lon) < 0.01

        return sameName || sameLocation
      })
      const firstSavedIndex = cities.findIndex((savedCity) => {
        return savedCity.id === city.id || savedCity.name === city.name
      })

      return !duplicatesInitialCity && firstSavedIndex === index
    })
  } catch (error) {
    console.warn('저장된 외부 도시 정보를 불러오지 못했습니다:', error)
    return []
  }
}

export const useWeatherStore = defineStore('weather', () => {
  // state
  const weatherList = ref([...initialWeatherList, ...loadExternalCities()])

  watch(
    weatherList,
    (cities) => {
      try {
        const externalCities = cities.filter((city) => city.isExternal)
        localStorage.setItem(EXTERNAL_CITIES_STORAGE_KEY, JSON.stringify(externalCities))
      } catch (error) {
        console.warn('외부 도시 정보를 저장하지 못했습니다:', error)
      }
    },
    { deep: true },
  )

  // getter
  const getWeatherById = computed(() => {
    return (cityId) => weatherList.value.find((weather) => weather.id === cityId) ?? null
  })

  // action
  const addWeather = (weather) => {
    const isAlreadyAdded = weatherList.value.some((city) => {
      const sameName = city.name === weather.name
      const sameLocation =
        Math.abs(city.lat - weather.lat) < 0.01 && Math.abs(city.lon - weather.lon) < 0.01

      return sameName || sameLocation
    })

    if (isAlreadyAdded) {
      return false
    }

    weatherList.value.push(weather)
    return true
  }

  return {
    weatherList,
    getWeatherById,
    addWeather,
  }
})

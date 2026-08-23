const ROUND_UNIT_MINUTES = 5

const calculateWeatherDelay = (weather) => {
  const condition = weather.condition

  if (condition === 'Thunderstorm' || condition === 'Snow') {
    return 15
  }

  if (condition === 'Rain' || weather.status === '비') {
    return 10
  }

  if (condition === 'Drizzle') {
    return 5
  }

  return 0
}

export const calculateDeliveryEstimate = (weather, order = weather?.delivery) => {
  if (!weather || !order) {
    return {
      baseTime: 0,
      travelTime: 0,
      weatherDelay: 0,
      windDelay: 0,
      totalTime: 0,
    }
  }

  const baseTime = Number(order.baseTime) || 0
  const routeDurationMinutes = Number(order.routeDurationMinutes) || 0
  const windSpeed = Number(weather.windSpeed) || 0

  const travelTime = Math.ceil(routeDurationMinutes)
  const weatherDelay = calculateWeatherDelay(weather)
  const windDelay = windSpeed >= 10 ? 5 : 0
  const rawTotalTime = baseTime + travelTime + weatherDelay + windDelay
  const totalTime = Math.ceil(rawTotalTime / ROUND_UNIT_MINUTES) * ROUND_UNIT_MINUTES

  return {
    baseTime,
    travelTime,
    weatherDelay,
    windDelay,
    totalTime,
    usesRouteApi: routeDurationMinutes > 0,
  }
}

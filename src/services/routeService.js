import axios from 'axios'

const ROUTING_API_URL = 'https://api.openrouteservice.org/v2/directions/driving-car/geojson'

const toRouteCoordinate = (point) => {
  const lat = Number(point?.lat)
  const lon = Number(point?.lon)

  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    throw new Error('경로를 계산할 좌표가 올바르지 않습니다.')
  }

  return [lon, lat]
}

export const fetchDeliveryRoute = async ({ origin, destination, apiKey }) => {
  if (!apiKey) {
    throw new Error('openrouteservice API 키가 설정되지 않았습니다.')
  }

  const response = await axios.post(
    ROUTING_API_URL,
    {
      coordinates: [toRouteCoordinate(origin), toRouteCoordinate(destination)],
      preference: 'fastest',
      instructions: false,
    },
    {
      headers: {
        Authorization: apiKey,
        'Content-Type': 'application/json',
      },
    },
  )

  const routeFeature = response.data.features?.[0]
  const summary = routeFeature?.properties?.summary
  const coordinates = routeFeature?.geometry?.coordinates

  if (!summary || !Array.isArray(coordinates)) {
    throw new Error('길찾기 결과에서 경로 정보를 확인하지 못했습니다.')
  }

  return {
    distanceKm: Number((summary.distance / 1000).toFixed(1)),
    durationMinutes: Math.max(1, Math.ceil(summary.duration / 60)),
    coordinates: coordinates.map(([lon, lat]) => [lat, lon]),
  }
}

<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const props = defineProps({
  center: {
    type: Object,
    required: true,
  },
  origin: {
    type: Object,
    default: null,
  },
  destination: {
    type: Object,
    default: null,
  },
  routeCoordinates: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
  canCalculate: {
    type: Boolean,
    default: false,
  },
  selectionMode: {
    type: String,
    default: 'origin',
    validator: (value) => ['origin', 'destination'].includes(value),
  },
})

const emit = defineEmits([
  'select-origin',
  'select-destination',
  'calculate-route',
  'update:selection-mode',
])

const mapElement = ref(null)
let map = null
let originMarker = null
let destinationMarker = null
let routeLine = null

const removeLayer = (layer) => {
  if (map && layer) {
    map.removeLayer(layer)
  }
}

const renderOrigin = () => {
  removeLayer(originMarker)
  originMarker = null

  if (!map || !props.origin) {
    return
  }

  originMarker = L.circleMarker([props.origin.lat, props.origin.lon], {
    radius: 9,
    color: '#1d4ed8',
    fillColor: '#3b82f6',
    fillOpacity: 1,
    weight: 3,
  })
    .addTo(map)
    .bindTooltip('선택한 배달점', {
      permanent: true,
      direction: 'top',
      offset: [0, -8],
    })
}

const renderDestination = () => {
  removeLayer(destinationMarker)
  destinationMarker = null

  if (!map || !props.destination) {
    return
  }

  destinationMarker = L.circleMarker([props.destination.lat, props.destination.lon], {
    radius: 9,
    color: '#b91c1c',
    fillColor: '#ef4444',
    fillOpacity: 1,
    weight: 3,
  })
    .addTo(map)
    .bindTooltip('선택한 배달지', {
      permanent: true,
      direction: 'top',
      offset: [0, -8],
    })
}

const renderRoute = () => {
  removeLayer(routeLine)
  routeLine = null

  if (!map || props.routeCoordinates.length < 2) {
    return
  }

  routeLine = L.polyline(props.routeCoordinates, {
    color: '#16a34a',
    weight: 6,
    opacity: 0.85,
  }).addTo(map)

  map.fitBounds(routeLine.getBounds(), {
    padding: [35, 35],
    maxZoom: 16,
  })
}

const handleMapClick = (event) => {
  const selectedPoint = {
    lat: Number(event.latlng.lat.toFixed(6)),
    lon: Number(event.latlng.lng.toFixed(6)),
  }

  if (props.selectionMode === 'origin') {
    emit('select-origin', selectedPoint)
    emit('update:selection-mode', 'destination')
    return
  }

  emit('select-destination', selectedPoint)
}

onMounted(() => {
  map = L.map(mapElement.value).setView([props.center.lat, props.center.lon], 13)

  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors',
  }).addTo(map)

  map.on('click', handleMapClick)
  renderOrigin()
  renderDestination()
  renderRoute()
})

watch(
  () => props.center,
  (center) => {
    if (!map || !center) {
      return
    }

    map.setView([center.lat, center.lon], 13)
  },
  { deep: true },
)

watch(
  () => props.origin,
  () => {
    renderOrigin()
  },
  { deep: true },
)

watch(
  () => props.destination,
  () => {
    renderDestination()
  },
  { deep: true },
)

watch(
  () => props.routeCoordinates,
  () => {
    renderRoute()
  },
  { deep: true },
)

onBeforeUnmount(() => {
  if (map) {
    map.off('click', handleMapClick)
    map.remove()
    map = null
  }
})
</script>

<template>
  <section class="delivery-route-map">
    <div class="route-map-header">
      <div>
        <h4>배달 위치 선택</h4>
        <p>
          {{
            selectionMode === 'origin'
              ? '지도에서 음식점 출발 위치를 클릭해 주세요.'
              : '지도에서 배달받을 위치를 클릭해 주세요.'
          }}
        </p>
      </div>

      <div class="route-map-actions">
        <el-button-group>
          <el-button
            :type="selectionMode === 'origin' ? 'primary' : 'default'"
            @click="emit('update:selection-mode', 'origin')"
          >
            출발지 선택
          </el-button>
          <el-button
            :type="selectionMode === 'destination' ? 'danger' : 'default'"
            @click="emit('update:selection-mode', 'destination')"
          >
            도착지 선택
          </el-button>
        </el-button-group>

        <el-button
          type="success"
          :loading="loading"
          :disabled="!canCalculate"
          @click="emit('calculate-route')"
        >
          {{ loading ? '경로 계산 중...' : '경로 계산' }}
        </el-button>
      </div>
    </div>

    <div ref="mapElement" class="route-map" aria-label="배달 경로 선택 지도"></div>
  </section>
</template>

<style scoped>
.delivery-route-map {
  margin-top: 4px;
}

.route-map-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 12px;
}

.route-map-header h4,
.route-map-header p {
  margin: 0;
}

.route-map-actions {
  display: flex;
  flex-shrink: 0;
  gap: 8px;
}

.route-map-header p {
  margin-top: 6px;
  color: var(--el-text-color-secondary);
  font-size: 13px;
}

.route-map {
  width: 100%;
  height: 360px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  cursor: crosshair;
  overflow: hidden;
}

:global(.dark) .route-map {
  filter: brightness(0.8) contrast(1.1);
}

@media (max-width: 600px) {
  .route-map-header {
    flex-direction: column;
  }

  .route-map-header :deep(.el-button) {
    flex: 1;
  }

  .route-map-actions,
  .route-map-actions :deep(.el-button-group) {
    display: flex;
    width: 100%;
  }

  .route-map {
    height: 300px;
  }
}
</style>

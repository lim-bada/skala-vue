# 날씨 기반 배달 예상 시간 서비스

사용자가 지역과 메뉴를 선택하고 지도에서 음식점과 배달지를 정하면 실제 도로 경로와 현재 날씨를 반영한 예상 배달 시간을 확인할 수 있도록 만들었습니다.

## 추가 내용

- 기본 도시 외에 대구와 광주를 추가하고, 온도 상태를 더움·선선함·쌀쌀함으로 구분했습니다. ([weatherStore.js](src/stores/weatherStore.js), [WeatherCard.vue](src/components/exercise/WeatherCard.vue))

- 도시 이름 검색과 기온순 정렬 기능을 추가했습니다. ([WeatherDelivery.vue](src/components/exercise/WeatherDelivery.vue), [configStore.js](src/stores/configStore.js))

- 섭씨·화씨 변환과 다크 모드를 전역 설정으로 관리했습니다. ([configStore.js](src/stores/configStore.js), [UnitToggler.vue](src/components/exercise/UnitToggler.vue), [ThemeToggler.vue](src/components/exercise/ThemeToggler.vue))

- OpenWeather를 이용해 현재 날씨와 도시별 대기질을 조회했습니다. ([WeatherDelivery.vue](src/components/exercise/WeatherDelivery.vue), [WeatherDetailView.vue](src/views/WeatherDetailView.vue))

- 처음 화면에 표시되는 서울, 수원, 부산, 대구, 광주의 날씨는 화면 구성을 위해 직접 작성한 기본 데이터입니다. 실제 현재 날씨는 `실시간 날씨 새로고침` 버튼을 눌렀을 때 OpenWeather API를 통해 반영되므로, 배달 예상 시간을 계산하기 전에 날씨를 한 번 새로고침해야 합니다. ([weatherStore.js](src/stores/weatherStore.js), [WeatherDelivery.vue](src/components/exercise/WeatherDelivery.vue))

- Open-Meteo를 이용해 대시보드에 없는 국내 지역도 검색할 수 있게 했습니다. ([WeatherDelivery.vue](src/components/exercise/WeatherDelivery.vue))

- 검색한 지역을 대시보드에 추가하고 상세 화면으로 이동할 수 있게 했습니다. ([weatherStore.js](src/stores/weatherStore.js), [WeatherDetailView.vue](src/views/WeatherDetailView.vue))

- 지도에서 음식점 출발지와 배달 도착지를 직접 선택하면 실제 도로 경로를 지도에 표시하고, 메뉴와 현재 날씨를 반영한 예상 배달 시간을 계산합니다. 30km를 넘는 경로는 배달 범위 밖으로 처리했습니다. ([DeliveryRouteMap.vue](src/components/exercise/DeliveryRouteMap.vue), [WeatherDelivery.vue](src/components/exercise/WeatherDelivery.vue), [routeService.js](src/services/routeService.js), [deliveryCalculator.js](src/utils/deliveryCalculator.js))

- 외부에서 추가한 도시는 `localStorage`에 저장해 새로고침 후에도 유지되도록 했습니다. ([weatherStore.js](src/stores/weatherStore.js))

- 날씨와 도로 경로에 따른 배달 계산 기준을 별도의 안내 페이지로 만들었습니다. ([DeliveryGuideView.vue](src/views/DeliveryGuideView.vue), [index.js](src/router/index.js))

## 배달 예상 시간

날씨 카드를 선택하면 지도가 해당 도시로 이동합니다. 메뉴를 고른 다음 지도에서 음식점 출발지와 배달 도착지를 차례로 클릭하고 경로 계산 버튼을 누르면 예상 시간이 계산됩니다. 선택할 수 있는 메뉴는 떡볶이, 치킨, 돼지국밥, 막창, 떡갈비 총 5개입니다.

계산할 때는 메뉴마다 정해 둔 기본 조리·배차 시간에 이동 시간과 날씨 지연 시간을 더했습니다.

도로 거리와 이동 시간은 openrouteservice에서 가져오고, 최종 결과는 5분 단위로 올림합니다. 이슬비는 5분, 비는 10분, 눈이나 뇌우는 15분을 추가하며 풍속이 10m/s 이상이면 5분을 더합니다.

실제 도로 경로는 사용하지만 실시간 교통 상황이나 주문량까지 반영한 값은 아니기 때문에 화면에서도 예상치임을 안내하고 있습니다.

## 코드 구성

상태는 용도에 따라 나눴습니다. 화면 설정은 `configStore`, 도시 목록은 `weatherStore`, 주문 조건과 계산 결과는 `deliveryStore`에서 관리합니다. 배달 시간 계산식은 컴포넌트 안에 넣지 않고 `deliveryCalculator.js`로 분리했습니다.

## API 키 설정

OpenWeather와 openrouteservice에서 발급받은 API 키를 프로젝트 루트의 `.env.local`에 입력합니다.

```env
VITE_OPENWEATHER_API_KEY=발급받은_API_키
VITE_OPENROUTESERVICE_API_KEY=발급받은_API_키
```

## 실행 방법

```bash
npm install
npm run dev
```
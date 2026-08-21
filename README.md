# Weather Dashboard Hands-on

Vue.js 수업의 날씨 대시보드 실습을 바탕으로, 각 실습의 마지막 요구사항에서 개인 기능을 추가하고 수업 진도에 맞춰 구조를 발전시킨 프로젝트입니다.

## 개인 기능 발전 과정

```text
배달 Mock Data
→ Composition API를 이용한 반응형 계산
→ 자식 컴포넌트 분리
→ 별도 Router View 추가
→ Pinia 전역 Store와 다크 모드 적용
→ Axios를 이용한 실시간 날씨·대기질·외부 도시 검색
```

## 실습별 추가 구현 사항

| 실습                        | 개인 추가 내용                   | 활용 기술                            |
| --------------------------- | -------------------------------- | ------------------------------------ |
| Weather Mockup (116페이지)  | 도시·온도 구간·배달 데이터 확장  | 배열, `v-for`, `v-if`, `v-else-if`   |
| Composition API (145페이지) | 선택 도시의 최종 배달 시간 계산  | `ref`, `computed`, `watch`           |
| Component (178페이지)       | 배달 정보를 별도 컴포넌트로 분리 | Props, Component, Scoped CSS         |
| Vue Router (196페이지)      | 날씨별 배달 안내 페이지 추가     | View, Route, `RouterLink`            |
| Pinia (212페이지)           | 배달 Store, 도시 정렬, 다크 모드 추가 | state, getter, action, `watch`, `storeToRefs` |
| Axios (230페이지)           | 실제 날씨·대기질·외부 도시 검색 | Axios, `async/await`, API 연계      |

### 1. 도시 및 날씨 데이터 확장

- 기본 도시 외에 대구와 광주 데이터를 추가했습니다.
- 온도 상태를 다음 세 단계로 구분했습니다.
  - 28도 이상: 더움
  - 23도 이상 28도 미만: 선선함
  - 23도 미만: 쌀쌀함
- `v-else-if`를 활용해 온도 구간별 안내 문구를 표시했습니다.
- 도시 검색은 이후 Composition API 실습에서 `computed` 기반 실시간 필터링으로 구현했습니다.

### 2. 섭씨·화씨 변환

- 초기 Mockup에서는 로컬 `ref`와 `<select>`를 이용해 섭씨·화씨를 선택하도록 구현했습니다.
- 화씨 변환에는 다음 계산식을 적용했습니다.

```js
Math.round((celsius * 9) / 5 + 32)
```

- Pinia 실습에서는 로컬 상태를 제거하고 `configStore`로 이전했습니다.
- Navigation Bar의 `UnitToggler`에서 단위를 변경하면 메인 날씨 카드와 상세 페이지가 동시에 변경됩니다.

### 3. 날씨별 배달 예상 시간 Mockup

각 도시 객체에 주문 메뉴, 배달 거리, 기본 배달 시간을 추가했습니다.

```js
delivery: {
  menu: '떡볶이',
  distance: 2.1,
  baseTime: 25,
}
```

도시별 주문 메뉴는 다음과 같습니다.

- 서울: 떡볶이
- 수원: 치킨
- 부산: 돼지국밥
- 대구: 막창
- 광주: 떡갈비

초기 Mockup에서는 다음과 같은 간단한 날씨 규칙으로 계산했습니다.

```text
비: 기본 배달 시간 + 15분
28도 이상: 기본 배달 시간 + 5분
그 외: 기본 배달 시간
```

이후 실시간 날씨 API를 연결한 뒤에는 거리와 실제 악천후를 반영하는 계산식으로 개선했습니다.

### 4. 배달 기능의 반응형 처리

Composition API 실습에서는 배달 Mockup을 사용자 선택에 반응하도록 확장했습니다.

- `selectedDeliveryCity`: 사용자가 선택한 도시
- `expectedDeliveryTime`: 선택 도시의 최종 예상 배달 시간
- `watch(selectedDeliveryCity)`: 선택 도시 변경 감지 및 로그 출력
- 선택한 도시, 주문 메뉴, 최종 예상 배달 시간을 별도 영역에 표시

### 5. 배달 컴포넌트 분리

컴포넌트 실습에서는 배달 정보 영역을 `DeliveryInfo.vue`로 분리했습니다.

- `weather` 객체를 Props로 전달
- 배달 예상 정보 템플릿 분리
- 배달 관련 CSS를 `<style scoped>`로 분리
- `WeatherCard.vue` 내부에서 재사용

### 6. 배달 안내 Router View

교안에서 정의한 View 외에 개인 View인 `DeliveryGuideView.vue`를 추가했습니다.

- 비·고온·일반 날씨별 배달 규칙 배열 작성
- `v-for`를 사용해 규칙 목록 출력
- `/delivery-guide` Route 등록
- Navigation Bar에 배달 안내 링크 추가
- 메인 대시보드 복귀 링크 추가

### 7. 배달 전역 Store

`deliveryStore.js`를 추가해 기존 로컬 배달 상태와 계산을 Pinia로 이전했습니다.

- state: `selectedDeliveryCity`
- getter: `expectedDeliveryTime`
- action: `selectDeliveryCity()`
- `storeToRefs()`를 사용해 Store의 state와 getter를 반응형으로 유지

### 8. 도시 기온순 정렬

`configStore.js`에 도시 정렬 설정을 추가했습니다.

- state: `sortOrder`
- getter: `sortButtonLabel`
- action: `toggleSortOrder()`
- 기본 도시 순서와 기온이 높은 순서를 버튼으로 전환
- 검색 결과에 정렬을 함께 적용
- `[...result]`로 배열을 복사한 뒤 정렬해 원본 `weatherList` 순서 보존

### 9. Pinia 전역 다크 모드

`configStore.js`에 전역 테마 설정을 추가해 모든 Router View와 컴포넌트가 같은 테마 상태를 사용하도록 구현했습니다.

- state: `isDarkMode`
- getter: `themeButtonLabel`
- action: `toggleDarkMode()`
- `window.matchMedia()`로 운영체제의 초기 테마와 실행 중 변경을 감지
- `watch(isDarkMode)`로 `<html>`의 `dark` 클래스를 자동 추가·제거
- `ThemeToggler.vue`를 통해 라이트·다크 모드를 수동으로 전환
- Element Plus 다크 테마와 기존 CSS 변수가 같은 `dark` 클래스를 기준으로 동작하도록 통일

### 10. OpenWeather 현재 날씨 조회

OpenWeather Current Weather API와 Axios를 사용해 기존 도시들의 실제 날씨를 조회했습니다.

- `.env.local`에 API 키를 분리해 관리
- 각 도시의 위도·경도를 이용해 날씨 요청
- `axios.all()`로 여러 도시의 날씨를 병렬 조회
- 온도, 날씨 상태, 습도, 풍속, 아이콘 데이터를 기존 도시 객체에 반영
- `isLoading`을 이용한 로딩 상태 표시
- `try-catch-finally`를 이용한 요청 성공·실패 처리
- 새로고침 버튼을 누르면 기존 Mock Data를 실제 날씨로 갱신

```text
weatherList의 위도·경도
→ OpenWeather API 병렬 호출
→ 응답 데이터 가공
→ 기존 도시 객체 갱신
→ 화면 자동 업데이트
```

### 11. 상세 페이지 실시간 대기질 조회

OpenWeather Air Pollution API를 사용해 도시 상세 페이지에 실시간 대기질 정보를 추가했습니다.

- 현재 날씨와 동일한 OpenWeather API 키 사용
- 상세 페이지가 열리면 `onMounted()`에서 대기질 조회
- 도시의 위도·경도로 대기질 데이터 요청
- AQI를 좋음·양호·보통·나쁨·매우 나쁨으로 변환
- 초미세먼지(PM2.5)와 미세먼지(PM10) 표시
- 대기질 전용 로딩 상태와 오류 메시지 처리

### 12. Open-Meteo 실제 도시 검색

[Open-Meteo Geocoding API](https://open-meteo.com/en/docs/geocoding-api)를 추가로 사용해 기존 배열에 없는 국내 도시도 검색할 수 있도록 구현했습니다.

```text
사용자가 도시명 입력
→ 기존 weatherList를 computed로 검색
→ 등록된 도시가 없으면 외부 도시 검색 버튼 표시
→ Open-Meteo에서 실제 지역 후보 조회
→ 사용자가 지역 선택
→ 해당 좌표로 OpenWeather 현재 날씨 조회
```

- 최대 5개의 국내 지역 후보와 행정구역 표시
- `제주`처럼 검색되지 않는 한글 도시명은 `제주시`로 자동 재검색
- 후보 선택 후 온도, 날씨 상태, 습도, 풍속, 아이콘 표시
- 전역 섭씨·화씨 설정을 외부 검색 결과에도 적용
- 검색어가 변경되면 이전 후보·날씨·오류 상태 초기화
- 외부 도시 검색 전용 로딩과 오류 상태 처리

### 13. 외부 도시 대시보드 추가

외부 API로 검색한 도시를 기존 날씨 카드 목록에 추가할 수 있도록 구현했습니다.

- `대시보드에 추가` 버튼 제공
- 이름과 좌표를 비교해 중복 도시 추가 방지
- `isExternal`로 외부 도시를 구분하고 전용 태그 표시
- 기존 검색, 기온순 정렬, 섭씨·화씨 변환, 실시간 날씨 새로고침에 포함
- 외부 도시에 없는 배달 Mock Data를 임의로 생성하지 않음
- 외부 도시에서 배달 정보와 고정 상세보기 버튼 제외
- 외부 도시 선택 시 이전 배달 Store 상태 초기화

추가된 외부 도시는 메모리에만 저장되므로 브라우저를 새로고침하면 초기화됩니다.

### 14. 거리·실시간 날씨 기반 배달 시간

기존의 단순한 온도 구간 계산을 제거하고, 거리와 OpenWeather의 실제 현재 날씨를 반영하는 Mock 예상 시간으로 개선했습니다.

```text
최종 예상 시간
= 조리·배차 기본 시간
+ 거리 이동 시간
+ 실제 악천후 지연
+ 강풍 지연
```

- 평균 시속 20km를 기준으로 `(거리 ÷ 20) × 60`으로 이동 시간 계산
- 이슬비 `Drizzle`: 5분 추가
- 비 `Rain`: 10분 추가
- 뇌우 `Thunderstorm` 또는 눈 `Snow`: 15분 추가
- 풍속 10m/s 이상: 5분 추가
- 계산된 총시간을 5분 단위로 올림
- `deliveryCalculator.js`에 계산식을 분리해 `deliveryStore.js`와 `DeliveryInfo.vue`가 공동으로 사용
- 기본 시간, 이동 시간, 날씨·강풍 지연, 최종 예상 시간을 화면에 나누어 표시

실제 교통 경로와 주문량은 포함하지 않으므로 결과를 Mock 예상치로 명시했습니다.

## 핵심 학습 흐름

동일한 개인 기능을 단순 Mockup에 머무르게 하지 않고 수업 진도에 맞춰 다음과 같이 발전시켰습니다.

```text
Template Directive
→ Composition API
→ Component & Props
→ Vue Router
→ Pinia Store
→ Axios & External API
```

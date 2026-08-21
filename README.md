# Weather Dashboard Hands-on

Vue.js 수업의 날씨 대시보드 실습을 바탕으로, 각 실습의 마지막 요구사항에서 개인 기능을 추가하고 수업 진도에 맞춰 구조를 발전시킨 프로젝트입니다.

## 개인 기능 발전 과정

```text
배달 Mock Data
→ Composition API를 이용한 반응형 계산
→ 자식 컴포넌트 분리
→ 별도 Router View 추가
→ Pinia 전역 Store와 다크 모드 적용
```

## 실습별 추가 구현 사항

| 실습                        | 개인 추가 내용                   | 활용 기술                            |
| --------------------------- | -------------------------------- | ------------------------------------ |
| Weather Mockup (116페이지)  | 도시·온도 구간·배달 데이터 확장  | 배열, `v-for`, `v-if`, `v-else-if`   |
| Composition API (145페이지) | 선택 도시의 최종 배달 시간 계산  | `ref`, `computed`, `watch`           |
| Component (178페이지)       | 배달 정보를 별도 컴포넌트로 분리 | Props, Component, Scoped CSS         |
| Vue Router (196페이지)      | 날씨별 배달 안내 페이지 추가     | View, Route, `RouterLink`            |
| Pinia (212페이지)           | 배달 Store, 도시 정렬, 다크 모드 추가 | state, getter, action, `watch`, `storeToRefs` |

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

예상 배달 시간은 날씨에 따라 다음 규칙으로 계산합니다.

```text
비: 기본 배달 시간 + 15분
28도 이상: 기본 배달 시간 + 5분
그 외: 기본 배달 시간
```

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

## 핵심 학습 흐름

동일한 개인 기능을 단순 Mockup에 머무르게 하지 않고 수업 진도에 맞춰 다음과 같이 발전시켰습니다.

```text
Template Directive
→ Composition API
→ Component & Props
→ Vue Router
→ Pinia Store
```

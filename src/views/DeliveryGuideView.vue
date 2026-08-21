<script setup>
const deliveryRules = [
  {
    id: 'rain',
    condition: '비',
    delayTime: 15,
    message: '도로 상황으로 인해 배달이 지연될 수 있습니다.',
  },
  {
    id: 'hot',
    condition: '28도 이상',
    delayTime: 5,
    message: '더운 날씨로 인해 배달이 조금 지연될 수 있습니다.',
  },
  {
    id: 'normal',
    condition: '일반 날씨',
    delayTime: 0,
    message: '기본 예상 시간에 맞춰 배달될 예정입니다.',
  },
]
</script>

<template>
  <section class="delivery-guide">
    <h2>날씨별 배달 안내</h2>
    <p>날씨 상태에 따라 예상 배달 시간이 달라질 수 있습니다.</p>

    <div v-for="rule in deliveryRules" :key="rule.id" class="delivery-rule">
      <h3>{{ rule.condition }}</h3>
      <p>추가 예상 시간: {{ rule.delayTime }}분</p>
      <p>{{ rule.message }}</p>
    </div>

    <RouterLink to="/">메인 대시보드로 돌아가기</RouterLink>
  </section>
</template>

<script setup>
defineProps({
  searchQuery: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['update-query'])

const handleInput = (event) => {
  emit('update-query', event.target.value)
}
</script>

<template>
  <div class="search-city">
    <h3>도시 검색</h3>

    <input
      type="text"
      :value="searchQuery"
      @input="handleInput"
      placeholder="검색할 도시 이름 입력"
    />

    <p>검색 중인 도시: {{ searchQuery }}</p>
  </div>
</template>

<style scoped>
input {
  padding: 8px;
  width: 90%;
  font-size: 14px;
  background-color: var(--color-background);
  border-color: var(--color-border);
  color: var(--color-text);
}
</style>

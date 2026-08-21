<script setup>
defineProps({
  searchQuery: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['update-query'])

const handleInput = (value) => {
  emit('update-query', value)
}
</script>

<template>
  <div class="search-city">
    <h3>도시 검색</h3>

    <el-input
      class="city-search-input"
      :model-value="searchQuery"
      @update:model-value="handleInput"
      placeholder="검색할 도시 이름 입력"
      clearable
    />

    <p>검색 중인 도시: {{ searchQuery }}</p>
  </div>
</template>

<style scoped>
.city-search-input {
  width: 100%;
}
</style>

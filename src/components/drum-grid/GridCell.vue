<template>
  <button 
    class="grid-cell" 
    :class="{ active }"
    @click="$emit('toggle')"
  />
</template>

<script setup lang="ts">
defineProps<{
  active: boolean
}>()

defineEmits<{
  (e: 'toggle'): void
}>()
</script>

<style scoped lang="scss">
.grid-cell {
  aspect-ratio: 1;
  border: 1px solid #ddd;
  background: white;
  border-radius: 2px;
  cursor: pointer;
  padding: 0;
  transition: all 0.1s ease;

  &:hover {
    background: #e9e9e9;
  }

  &.active {
    background: var(--primary-color);
    border-color: var(--primary-color);
  }
}
</style>

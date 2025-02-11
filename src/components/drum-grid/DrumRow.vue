<template>
  <div class="drum-row">
    <div class="instrument-label">
      {{ instrument.name }}
    </div>
    
    <div class="beats-container">
      <div 
        v-for="beatIndex in totalBeats" 
        :key="beatIndex"
        class="beat-container"
      >
        <GridCell
          v-for="subdivision in subdivisions"
          :key="`${beatIndex}-${subdivision}`"
          :active="isNoteActive(beatIndex - 1, subdivision - 1)"
          @toggle="toggleNote(beatIndex - 1, subdivision - 1)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue'
import { useGrooveStore } from '@/stores/groove'
import GridCell from './GridCell.vue'

interface Instrument {
  id: string
  name: string
  soundFile: string
}

const props = defineProps<{
  instrument: Instrument
  totalBeats: number
  subdivisions: number
}>()

const store = useGrooveStore()

const isNoteActive = (beatIndex: number, subdivisionIndex: number): boolean => {
  return store.isNoteActive(props.instrument.id, beatIndex, subdivisionIndex)
}

const toggleNote = (beatIndex: number, subdivisionIndex: number) => {
  store.toggleNote({
    instrumentId: props.instrument.id,
    beatIndex,
    subdivisionIndex
  })
}
</script>

<style scoped lang="scss">
.drum-row {
  display: grid;
  grid-template-columns: 100px 1fr;
  gap: 8px;
  margin-bottom: 4px;
}

.instrument-label {
  display: flex;
  align-items: center;
  padding: 0 1rem;
  background: var(--secondary-color);
  color: white;
  border-radius: 4px;
  font-weight: 500;
}

.beats-container {
  display: grid;
  grid-template-columns: repeat(var(--total-beats), 1fr);
  gap: 2px;
}

.beat-container {
  display: grid;
  grid-template-columns: repeat(var(--subdivisions), 1fr);
  gap: 1px;
  padding: 1px;
  background: #f5f5f5;
  border-radius: 2px;
}

:root {
  --total-beats: v-bind(totalBeats);
  --subdivisions: v-bind(subdivisions);
}
</style>

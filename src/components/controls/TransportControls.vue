<template>
  <div class="transport-controls">
    <div class="main-controls">
      <button 
        class="transport-button"
        :class="{ active: isPlaying }"
        @click="togglePlay"
      >
        {{ isPlaying ? '⏹' : '▶' }}
      </button>

      <div class="tempo-control">
        <button 
          class="tempo-adjust"
          @click="adjustTempo(-5)"
        >-</button>
        
        <input
          type="number"
          v-model="tempo"
          min="30"
          max="300"
          @change="updateTempo"
        >
        <span class="bpm">BPM</span>
        
        <button 
          class="tempo-adjust"
          @click="adjustTempo(5)"
        >+</button>
      </div>
    </div>

    <div class="time-signature">
      <select v-model="timeSignature.numerator">
        <option v-for="n in 12" :key="n" :value="n">{{ n }}</option>
      </select>
      <span>/</span>
      <select v-model="timeSignature.denominator">
        <option value="4">4</option>
        <option value="8">8</option>
        <option value="16">16</option>
      </select>
    </div>

    <MetronomeControls />
    <SwingControls />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useGrooveStore } from '@/stores/groove'
import MetronomeControls from './MetronomeControls.vue'
import SwingControls from './SwingControls.vue'

const store = useGrooveStore()

const isPlaying = ref(false)
const tempo = ref(120)
const timeSignature = reactive({
  numerator: 4,
  denominator: 4
})

const togglePlay = () => {
  isPlaying.value = !isPlaying.value
  if (isPlaying.value) {
    store.startPlayback()
  } else {
    store.stopPlayback()
  }
}

const updateTempo = () => {
  // Ensure tempo stays within valid range
  tempo.value = Math.max(30, Math.min(300, tempo.value))
  store.setTempo(tempo.value)
}

const adjustTempo = (amount: number) => {
  tempo.value = Math.max(30, Math.min(300, tempo.value + amount))
  updateTempo()
}
</script>

<style scoped lang="scss">
.transport-controls {
  display: flex;
  gap: 2rem;
  align-items: center;
  padding: 1rem;
  background: var(--secondary-color);
  border-radius: 8px;
  color: white;
}

.main-controls {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.transport-button {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: none;
  background: var(--primary-color);
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: scale(1.05);
  }

  &.active {
    background: #ff5252;
  }
}

.tempo-control {
  display: flex;
  align-items: center;
  gap: 0.5rem;

  input {
    width: 60px;
    padding: 0.5rem;
    border: none;
    border-radius: 4px;
    text-align: center;
    font-size: 1rem;
  }

  .bpm {
    font-size: 0.8rem;
    opacity: 0.8;
  }
}

.tempo-adjust {
  padding: 0.25rem 0.5rem;
  border: none;
  border-radius: 4px;
  background: var(--primary-color);
  color: white;
  cursor: pointer;

  &:hover {
    opacity: 0.9;
  }
}

.time-signature {
  display: flex;
  align-items: center;
  gap: 0.5rem;

  select {
    padding: 0.5rem;
    border: none;
    border-radius: 4px;
    background: white;
    font-size: 1rem;
  }
}
</style>

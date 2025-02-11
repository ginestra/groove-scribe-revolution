<template>
  <div class="metronome-controls">
    <button 
      class="metronome-toggle"
      :class="{ active: metronomeSettings.enabled }"
      @click="toggleMetronome"
    >
      <span class="icon">🎯</span>
      Metronome
    </button>

    <div class="metronome-settings" v-if="metronomeSettings.enabled">
      <div class="volume-control">
        <label>Volume</label>
        <input 
          type="range" 
          min="0" 
          max="1" 
          step="0.1"
          :value="metronomeSettings.volume"
          @input="e => setMetronomeVolume(parseFloat(e.target.value))"
        />
      </div>

      <label class="accent-toggle">
        <input 
          type="checkbox"
          :checked="metronomeSettings.accent"
          @change="toggleMetronomeAccent"
        />
        Accent First Beat
      </label>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAudioEngine } from '@/composables/useAudioEngine'

const { 
  metronomeSettings, 
  toggleMetronome, 
  setMetronomeVolume, 
  toggleMetronomeAccent 
} = useAudioEngine()
</script>

<style scoped lang="scss">
.metronome-controls {
  display: flex;
  gap: 1rem;
  align-items: center;
  padding: 0.5rem;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 4px;
}

.metronome-toggle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  background: var(--secondary-color);
  color: white;
  cursor: pointer;

  &.active {
    background: var(--primary-color);
  }

  .icon {
    font-size: 1.2em;
  }
}

.metronome-settings {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.volume-control {
  display: flex;
  align-items: center;
  gap: 0.5rem;

  input[type="range"] {
    width: 100px;
  }
}

.accent-toggle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;

  input[type="checkbox"] {
    cursor: pointer;
  }
}
</style> 
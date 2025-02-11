<template>
  <div class="swing-controls">
    <div class="swing-presets">
      <label>Swing Feel</label>
      <div class="preset-buttons">
        <button
          v-for="preset in swingPresets"
          :key="preset.name"
          class="preset-button"
          :class="{ active: isActivePreset(preset.amount) }"
          @click="setSwingAmount(preset.amount)"
          :title="preset.description"
        >
          {{ preset.name }}
        </button>
      </div>
    </div>

    <div class="swing-amount">
      <div class="swing-slider">
        <input 
          type="range" 
          min="0" 
          max="1" 
          step="0.01"
          :value="swingSettings.amount"
          @input="e => setSwingAmount(parseFloat(e.target.value))"
        />
        <div class="swing-ticks">
          <span v-for="i in 5" :key="i">
            {{ (i - 1) * 25 }}%
          </span>
        </div>
      </div>
      <div class="swing-value">
        {{ Math.round(swingSettings.amount * 100) }}%
      </div>
    </div>

    <div class="swing-resolution">
      <label>Resolution</label>
      <select 
        :value="swingSettings.resolution"
        @change="e => setSwingResolution(e.target.value as '8n' | '16n')"
      >
        <option value="8n">1/8 Notes</option>
        <option value="16n">1/16 Notes</option>
      </select>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAudioEngine } from '@/composables/useAudioEngine'

const { 
  swingSettings, 
  setSwingAmount,
  swingPresets,
  setSwingResolution 
} = useAudioEngine()

const isActivePreset = (amount: number): boolean => {
  return Math.abs(swingSettings.amount - amount) < 0.01
}
</script>

<style scoped lang="scss">
.swing-controls {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 4px;
}

.swing-presets {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  label {
    font-weight: 500;
  }
}

.preset-buttons {
  display: flex;
  gap: 0.5rem;
}

.preset-button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  background: var(--secondary-color);
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    opacity: 0.9;
  }

  &.active {
    background: var(--primary-color);
    transform: scale(1.05);
  }
}

.swing-amount {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.swing-slider {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;

  input[type="range"] {
    width: 100%;
    margin: 0;
  }
}

.swing-ticks {
  display: flex;
  justify-content: space-between;
  padding: 0 10px;
  font-size: 0.8rem;
  color: var(--secondary-color);
}

.swing-value {
  min-width: 4em;
  padding: 0.5rem;
  background: var(--secondary-color);
  color: white;
  border-radius: 4px;
  text-align: center;
  font-weight: 500;
}

.swing-resolution {
  display: flex;
  align-items: center;
  gap: 0.5rem;

  select {
    padding: 0.25rem;
    border-radius: 4px;
    border: 1px solid #ccc;
  }
}
</style> 
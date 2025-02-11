<template>
  <div v-if="isLoading || loadingError" class="audio-loader">
    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <div class="loading-text">
        Loading sounds...
        <div class="sound-status">
          <div 
            v-for="(loaded, sound) in soundsLoaded" 
            :key="sound"
            :class="{ loaded }"
          >
            {{ sound }}
          </div>
        </div>
      </div>
    </div>

    <div v-if="loadingError" class="error-state">
      <div class="error-icon">⚠️</div>
      <div class="error-message">{{ loadingError }}</div>
      <button @click="retryLoading" class="retry-button">
        Retry Loading
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAudioEngine } from '@/composables/useAudioEngine'

const { 
  isLoading, 
  loadingError, 
  soundsLoaded 
} = useAudioEngine()

const retryLoading = async () => {
  window.location.reload()
}
</script>

<style scoped lang="scss">
.audio-loader {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  color: white;
}

.loading-state {
  text-align: center;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid var(--primary-color);
  border-radius: 50%;
  margin: 0 auto 1rem;
  animation: spin 1s linear infinite;
}

.sound-status {
  margin-top: 1rem;
  display: flex;
  gap: 1rem;
  justify-content: center;

  div {
    padding: 0.5rem;
    border-radius: 4px;
    background: rgba(255, 255, 255, 0.1);
    
    &.loaded {
      background: var(--primary-color);
    }
  }
}

.error-state {
  text-align: center;
  
  .error-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
  }
  
  .error-message {
    margin-bottom: 1rem;
    color: #ff5252;
  }
}

.retry-button {
  padding: 0.5rem 1rem;
  background: var(--primary-color);
  border: none;
  border-radius: 4px;
  color: white;
  cursor: pointer;
  
  &:hover {
    opacity: 0.9;
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style> 
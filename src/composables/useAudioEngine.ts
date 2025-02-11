import * as Tone from 'tone'
import { ref, onMounted, onUnmounted } from 'vue'
import { useGrooveStore } from '@/stores/groove'

interface ActiveNote {
  instrumentId: string
  subdivision: number
}

interface SoundLoadingState {
  kick: boolean
  snare: boolean
  hihat: boolean
}

interface MetronomeSettings {
  volume: number
  enabled: boolean
  accent: boolean // Whether to accent the first beat
}

interface SwingSettings {
  amount: number;    // 0 to 1 (0 = straight, 1 = max swing)
  resolution: '8n' | '16n';  // Swing resolution (eighth or sixteenth notes)
}

interface SwingPreset {
  name: string;
  amount: number;
  description: string;
}

export function useAudioEngine() {
  const store = useGrooveStore()
  const isInitialized = ref(false)
  const isLoading = ref(true)
  const loadingError = ref<string | null>(null)
  const soundsLoaded = ref<SoundLoadingState>({
    kick: false,
    snare: false,
    hihat: false
  })
  
  // Add metronome sampler and settings
  const metronomeSettings = ref<MetronomeSettings>({
    volume: 0.5,
    enabled: true,
    accent: true
  })

  const swingSettings = ref<SwingSettings>({
    amount: 0,
    resolution: '8n'
  })

  const swingPresets: SwingPreset[] = [
    { name: 'Straight', amount: 0, description: 'No swing' },
    { name: 'Light', amount: 0.25, description: 'Subtle swing feel' },
    { name: 'Medium', amount: 0.5, description: 'Classic swing' },
    { name: 'Heavy', amount: 0.75, description: 'Strong swing feel' },
    { name: 'Max', amount: 1, description: 'Maximum swing' }
  ]

  // Create samplers with loading handlers
  const samplers = {
    kick: new Tone.Sampler({
      urls: {
        'C2': '/sounds/kick.wav',
      },
      onload: () => {
        soundsLoaded.value.kick = true
        checkAllSoundsLoaded()
      },
      onerror: (error) => {
        loadingError.value = `Failed to load kick drum: ${error}`
      }
    }).toDestination(),
    
    snare: new Tone.Sampler({
      urls: {
        'C2': '/sounds/snare.wav',
      },
      onload: () => {
        soundsLoaded.value.snare = true
        checkAllSoundsLoaded()
      },
      onerror: (error) => {
        loadingError.value = `Failed to load snare drum: ${error}`
      }
    }).toDestination(),
    
    hihat: new Tone.Sampler({
      urls: {
        'C2': '/sounds/hihat.wav',
      },
      onload: () => {
        soundsLoaded.value.hihat = true
        checkAllSoundsLoaded()
      },
      onerror: (error) => {
        loadingError.value = `Failed to load hi-hat: ${error}`
      }
    }).toDestination()
  }

  // Replace the metronome sampler with oscillators
  const metronome = {
    high: new Tone.Oscillator({
      frequency: 1000,
      type: "sine"
    }).toDestination(),
    low: new Tone.Oscillator({
      frequency: 800,
      type: "sine"
    }).toDestination()
  }

  const checkAllSoundsLoaded = () => {
    if (Object.values(soundsLoaded.value).every(loaded => loaded)) {
      isLoading.value = false
    }
  }

  // Create a loop for playback
  const loop = new Tone.Loop((time) => {
    const activeNotes = store.getActiveNotes(store.currentBeat)
    const swingOffset = calculateSwingOffset(store.currentBeat)
    
    // Play metronome with swing
    if (metronomeSettings.value.enabled) {
      const isFirstBeat = store.currentBeat % store.timeSignature.numerator === 0
      const metronomeSound = isFirstBeat && metronomeSettings.value.accent
        ? metronome.high
        : metronome.low

      metronomeSound.volume.value = metronomeSettings.value.volume
      metronomeSound.start(time + swingOffset).stop(time + swingOffset + 0.05) // Short 50ms beep
    }
    
    // Play active notes with swing
    activeNotes.forEach(({ instrumentId, subdivision }) => {
      const noteSwingOffset = calculateSwingOffset(subdivision)
      const offset = (subdivision * Tone.Time('16n').toSeconds()) + noteSwingOffset
      samplers[instrumentId as keyof typeof samplers]
        .triggerAttack('C2', time + offset)
    })
    
    store.advanceBeat()
  }, '4n')

  // Calculate swing offset based on beat position
  const calculateSwingOffset = (position: number): number => {
    const { amount, resolution } = swingSettings.value
    
    if (amount === 0) return 0
    
    const isSwingBeat = resolution === '8n' 
      ? position % 2 === 1  // Every other eighth note
      : position % 1 === 0.5  // Every other sixteenth note
      
    if (!isSwingBeat) return 0
    
    const maxOffset = resolution === '8n'
      ? Tone.Time('8n').toSeconds() / 3  // Max triplet feel for eighth notes
      : Tone.Time('16n').toSeconds() / 3  // Max triplet feel for sixteenth notes
      
    return maxOffset * amount
  }

  const initializeAudio = async () => {
    try {
      if (!isInitialized.value) {
        await Tone.start()
        isInitialized.value = true
      }

      // Check if we have any loading errors
      if (loadingError.value) {
        throw new Error(loadingError.value)
      }

      // Wait for all sounds to load
      if (isLoading.value) {
        await new Promise((resolve, reject) => {
          const checkInterval = setInterval(() => {
            if (!isLoading.value) {
              clearInterval(checkInterval)
              resolve(true)
            }
            if (loadingError.value) {
              clearInterval(checkInterval)
              reject(new Error(loadingError.value))
            }
          }, 100)
        })
      }
    } catch (error: any) {
      loadingError.value = `Audio initialization failed: ${error.message}`
      throw error
    }
  }

  const startPlayback = async () => {
    try {
      await initializeAudio()
      Tone.Transport.bpm.value = store.currentTempo
      loop.start(0)
      Tone.Transport.start()
    } catch (error: any) {
      loadingError.value = `Playback failed: ${error.message}`
      throw error
    }
  }

  const stopPlayback = () => {
    loop.stop()
    Tone.Transport.stop()
    Tone.Transport.position = 0
  }

  const updateTempo = (newTempo: number) => {
    Tone.Transport.bpm.value = newTempo
  }

  // Preview sound when clicking grid cells
  const previewSound = (instrumentId: string) => {
    if (!isInitialized.value) return
    
    samplers[instrumentId as keyof typeof samplers]
      .triggerAttackRelease('C2', '16n')
  }

  // Add metronome controls
  const toggleMetronome = () => {
    metronomeSettings.value.enabled = !metronomeSettings.value.enabled
  }

  const setMetronomeVolume = (volume: number) => {
    metronomeSettings.value.volume = Math.max(0, Math.min(1, volume))
  }

  const toggleMetronomeAccent = () => {
    metronomeSettings.value.accent = !metronomeSettings.value.accent
  }

  // Add swing controls
  const setSwingAmount = (amount: number) => {
    swingSettings.value.amount = Math.max(0, Math.min(1, amount))
  }

  const setSwingResolution = (resolution: '8n' | '16n') => {
    swingSettings.value.resolution = resolution
  }

  // Cleanup
  onUnmounted(() => {
    loop.dispose()
    Object.values(samplers).forEach(sampler => sampler.dispose())
  })

  return {
    isInitialized,
    isLoading,
    loadingError,
    soundsLoaded,
    startPlayback,
    stopPlayback,
    updateTempo,
    previewSound,
    metronomeSettings,
    toggleMetronome,
    setMetronomeVolume,
    toggleMetronomeAccent,
    swingSettings,
    setSwingAmount,
    setSwingResolution,
    swingPresets
  }
}

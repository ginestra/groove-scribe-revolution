import { defineStore } from 'pinia'
import type { Ref } from 'vue'
import { useAudioEngine } from '@/composables/useAudioEngine'

interface Note {
  active: boolean
  velocity: number
}

interface TimeSignature {
  numerator: number
  denominator: number
}

interface GridState {
  notes: Record<string, Note[][]> // instrumentId -> beats -> subdivisions
  tempo: number
  timeSignature: TimeSignature
  isPlaying: boolean
  currentBeat: number
}

export const useGrooveStore = defineStore('groove', {
  state: (): GridState => ({
    notes: {},
    tempo: 120,
    timeSignature: {
      numerator: 4,
      denominator: 4
    },
    isPlaying: false,
    currentBeat: 0
  }),

  actions: {
    initializeInstrument(instrumentId: string) {
      if (!this.$state.notes[instrumentId]) {
        // Initialize empty notes for the instrument
        this.$state.notes[instrumentId] = Array(this.timeSignature.numerator)
          .fill(null)
          .map(() => 
            Array(4).fill(null).map(() => ({
              active: false,
              velocity: 100
            }))
          )
      }
    },

    toggleNote({ instrumentId, beatIndex, subdivisionIndex }: {
      instrumentId: string
      beatIndex: number
      subdivisionIndex: number
    }) {
      const { previewSound } = useAudioEngine()
      
      if (!this.$state.notes[instrumentId]) {
        this.initializeInstrument(instrumentId)
      }
      
      const note = this.$state.notes[instrumentId][beatIndex][subdivisionIndex]
      note.active = !note.active
      
      // Preview sound when toggling note
      if (note.active) {
        previewSound(instrumentId)
      }
    },

    isNoteActive(instrumentId: string, beatIndex: number, subdivisionIndex: number): boolean {
      return this.notes[instrumentId]?.[beatIndex]?.[subdivisionIndex]?.active || false
    },

    setTempo(newTempo: number) {
      const { updateTempo } = useAudioEngine()
      this.tempo = Math.max(30, Math.min(300, newTempo))
      updateTempo(this.tempo)
    },

    setTimeSignature(numerator: number, denominator: number) {
      this.timeSignature = { numerator, denominator }
      
      // Resize all instrument patterns when time signature changes
      Object.keys(this.notes).forEach(instrumentId => {
        const currentNotes = this.notes[instrumentId]
        const newNotes = Array(numerator)
          .fill(null)
          .map((_, i) => 
            i < currentNotes.length 
              ? currentNotes[i] 
              : Array(4).fill(null).map(() => ({
                  active: false,
                  velocity: 100
                }))
          )
        this.notes[instrumentId] = newNotes
      })
    },

    async startPlayback() {
      const { startPlayback: startAudio } = useAudioEngine()
      this.isPlaying = true
      this.currentBeat = 0
      await startAudio()
    },

    stopPlayback() {
      const { stopPlayback: stopAudio } = useAudioEngine()
      this.isPlaying = false
      this.currentBeat = 0
      stopAudio()
    },

    advanceBeat() {
      this.currentBeat = (this.currentBeat + 1) % (this.timeSignature.numerator * 4)
    },

    // Helper method to get all active notes for a given beat
    getActiveNotes(beat: number): Array<{ instrumentId: string; subdivision: number }> {
      const activeNotes: Array<{ instrumentId: string; subdivision: number }> = []
      
      Object.entries(this.notes).forEach(([instrumentId, beats]) => {
        beats[beat].forEach((note, subdivision) => {
          if (note.active) {
            activeNotes.push({ instrumentId, subdivision })
          }
        })
      })
      
      return activeNotes
    }
  },

  getters: {
    totalSubdivisions(): number {
      return this.timeSignature.numerator * 4
    },
    
    currentTempo(): number {
      return this.tempo
    }
  }
})

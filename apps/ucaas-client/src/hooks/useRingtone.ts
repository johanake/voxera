import { useEffect, useRef } from 'react'

/**
 * Hook to play a ringing sound using Web Audio API
 * Creates a traditional phone ringing sound (dual-tone)
 */
export function useRingtone(shouldPlay: boolean) {
  const audioContextRef = useRef<AudioContext | null>(null)
  const oscillator1Ref = useRef<OscillatorNode | null>(null)
  const oscillator2Ref = useRef<OscillatorNode | null>(null)
  const gainNodeRef = useRef<GainNode | null>(null)
  const intervalRef = useRef<number | null>(null)

  useEffect(() => {
    // Initialize audio context
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    }

    const audioContext = audioContextRef.current

    const startRinging = () => {
      // Stop any existing ringing
      stopRinging()

      // Create gain node for volume control
      const gainNode = audioContext.createGain()
      gainNode.gain.value = 0.3 // 30% volume
      gainNode.connect(audioContext.destination)
      gainNodeRef.current = gainNode

      let isPlaying = false

      // Create ringing pattern (2 seconds on, 4 seconds off)
      intervalRef.current = setInterval(() => {
        if (isPlaying) {
          // Stop the tone
          if (oscillator1Ref.current) {
            oscillator1Ref.current.stop()
            oscillator1Ref.current = null
          }
          if (oscillator2Ref.current) {
            oscillator2Ref.current.stop()
            oscillator2Ref.current = null
          }
          isPlaying = false
        } else {
          // Start the tone - traditional phone ring uses 440Hz and 480Hz
          const oscillator1 = audioContext.createOscillator()
          oscillator1.type = 'sine'
          oscillator1.frequency.value = 440 // A4 note
          oscillator1.connect(gainNode)
          oscillator1.start()
          oscillator1Ref.current = oscillator1

          const oscillator2 = audioContext.createOscillator()
          oscillator2.type = 'sine'
          oscillator2.frequency.value = 480 // Slightly higher for classic ring tone
          oscillator2.connect(gainNode)
          oscillator2.start()
          oscillator2Ref.current = oscillator2

          isPlaying = true

          // Stop after 2 seconds
          setTimeout(() => {
            if (oscillator1Ref.current) {
              oscillator1Ref.current.stop()
              oscillator1Ref.current = null
            }
            if (oscillator2Ref.current) {
              oscillator2Ref.current.stop()
              oscillator2Ref.current = null
            }
            isPlaying = false
          }, 2000)
        }
      }, 2000) // Ring every 2 seconds

      // Start immediately
      const oscillator1 = audioContext.createOscillator()
      oscillator1.type = 'sine'
      oscillator1.frequency.value = 440
      oscillator1.connect(gainNode)
      oscillator1.start()
      oscillator1Ref.current = oscillator1

      const oscillator2 = audioContext.createOscillator()
      oscillator2.type = 'sine'
      oscillator2.frequency.value = 480
      oscillator2.connect(gainNode)
      oscillator2.start()
      oscillator2Ref.current = oscillator2

      setTimeout(() => {
        if (oscillator1Ref.current) {
          oscillator1Ref.current.stop()
          oscillator1Ref.current = null
        }
        if (oscillator2Ref.current) {
          oscillator2Ref.current.stop()
          oscillator2Ref.current = null
        }
      }, 2000)
    }

    const stopRinging = () => {
      // Stop interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }

      // Stop oscillators
      if (oscillator1Ref.current) {
        try {
          oscillator1Ref.current.stop()
        } catch (e) {
          // Oscillator may already be stopped
        }
        oscillator1Ref.current = null
      }

      if (oscillator2Ref.current) {
        try {
          oscillator2Ref.current.stop()
        } catch (e) {
          // Oscillator may already be stopped
        }
        oscillator2Ref.current = null
      }

      // Disconnect gain node
      if (gainNodeRef.current) {
        gainNodeRef.current.disconnect()
        gainNodeRef.current = null
      }
    }

    if (shouldPlay) {
      startRinging()
    } else {
      stopRinging()
    }

    // Cleanup on unmount or when shouldPlay changes
    return () => {
      stopRinging()
    }
  }, [shouldPlay])
}

import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import type { ReactNode } from 'react'
import type { Call, CallState } from '@ucaas/shared'
import type { CallHistoryEntry } from '@ucaas/api-client'
import { useCallHistory, useCreateCallHistory } from '../hooks/useCallHistory'
import { WebRTCService } from '../services/webrtcService'
import { socketService } from '../services/socketService'
import { useAuth } from './AuthContext'

interface SoftphoneContextType {
  currentCall: Call | null
  callState: CallState
  isInCall: boolean
  isMuted: boolean
  callHistory: CallHistoryEntry[]

  initiateCall: (extension: string) => Promise<void>
  answerCall: () => Promise<void>
  rejectCall: (reason?: string) => void
  endCall: () => void
  toggleMute: () => void

  localStreamRef: React.MutableRefObject<MediaStream | null>
  remoteStreamRef: React.MutableRefObject<MediaStream | null>

  error: string | null
  clearError: () => void
}

const SoftphoneContext = createContext<SoftphoneContextType | undefined>(undefined)

export const SoftphoneProvider = ({ children }: { children: ReactNode }) => {
  const { currentUser } = useAuth()
  const [currentCall, setCurrentCall] = useState<Call | null>(null)
  const [callState, setCallState] = useState<CallState>('idle')
  const [isMuted, setIsMuted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const localStreamRef = useRef<MediaStream | null>(null)
  const remoteStreamRef = useRef<MediaStream | null>(null)
  const webrtcServiceRef = useRef<WebRTCService | null>(null)
  const currentCallRef = useRef<Call | null>(null)

  // Fetch call history from backend using React Query
  const { data: callHistoryData } = useCallHistory(currentUser?.id || '')
  const createCallHistoryMutation = useCreateCallHistory()

  // Extract call history from query response
  const callHistory = callHistoryData?.data || []

  // Keep currentCallRef in sync
  useEffect(() => {
    currentCallRef.current = currentCall
  }, [currentCall])

  // Cleanup function
  const cleanup = useCallback(() => {
    console.log('Cleaning up call resources')

    // Close WebRTC
    if (webrtcServiceRef.current) {
      webrtcServiceRef.current.close()
      webrtcServiceRef.current = null
    }

    // Clear streams
    localStreamRef.current = null
    remoteStreamRef.current = null

    // Reset state
    setCurrentCall(null)
    setCallState('idle')
    setIsMuted(false)
  }, [])

  // Save call to history (backend)
  const saveToHistory = useCallback(() => {
    const call = currentCallRef.current
    if (!call || !currentUser) return

    const duration = call.answeredAt && call.endedAt
      ? Math.floor((call.endedAt.getTime() - call.answeredAt.getTime()) / 1000)
      : undefined

    const entry: Omit<CallHistoryEntry, 'id'> = {
      userId: currentUser.id,
      contactName: call.direction === 'outbound' ? call.toName : call.fromName,
      contactExtension: call.direction === 'outbound' ? call.toExtension : call.fromExtension,
      direction: call.direction,
      timestamp: call.startedAt,
      duration,
      answered: !!call.answeredAt,
    }

    // Save to backend via React Query mutation
    createCallHistoryMutation.mutate(entry)
  }, [currentUser, createCallHistoryMutation])

  /**
   * Initiate outbound call
   */
  const initiateCall = useCallback(async (extension: string) => {
    if (!currentUser?.extension) {
      setError('You do not have an extension assigned')
      return
    }

    if (callState !== 'idle') {
      setError('You are already in a call')
      return
    }

    try {
      setError(null)

      // Create WebRTC service
      webrtcServiceRef.current = new WebRTCService()

      // Get user media
      const stream = await webrtcServiceRef.current.getUserMedia()
      localStreamRef.current = stream

      // Create peer connection
      webrtcServiceRef.current.createPeerConnection()

      // Set up ICE candidate handler
      webrtcServiceRef.current.onIceCandidate((candidate) => {
        if (currentCallRef.current) {
          socketService.sendIceCandidate(currentCallRef.current.id, candidate)
        }
      })

      // Set up remote track handler
      webrtcServiceRef.current.onTrack((stream) => {
        console.log('Remote stream received')
        remoteStreamRef.current = stream
      })

      // Generate call ID
      const callId = `call-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

      // Create call object
      const call: Call = {
        id: callId,
        fromUserId: currentUser.id,
        fromExtension: currentUser.extension,
        fromName: `${currentUser.firstName} ${currentUser.lastName}`,
        toUserId: '',
        toExtension: extension,
        toName: '',
        state: 'dialing',
        direction: 'outbound',
        startedAt: new Date(),
      }

      setCurrentCall(call)
      setCallState('dialing')

      // Send call initiate to server
      socketService.initiateCall(
        callId,
        currentUser.extension,
        call.fromName,
        extension
      )
    } catch (err) {
      console.error('Error initiating call:', err)
      setError(err instanceof Error ? err.message : 'Failed to initiate call')
      cleanup()
    }
  }, [currentUser, callState, cleanup])

  /**
   * Answer incoming call
   */
  const answerCall = useCallback(async () => {
    if (!currentCall) {
      setError('No incoming call')
      return
    }

    try {
      setError(null)

      // Create WebRTC service
      webrtcServiceRef.current = new WebRTCService()

      // Get user media
      const stream = await webrtcServiceRef.current.getUserMedia()
      localStreamRef.current = stream

      // Create peer connection
      webrtcServiceRef.current.createPeerConnection()

      // Set up handlers
      webrtcServiceRef.current.onIceCandidate((candidate) => {
        if (currentCallRef.current) {
          socketService.sendIceCandidate(currentCallRef.current.id, candidate)
        }
      })

      webrtcServiceRef.current.onTrack((stream) => {
        console.log('Remote stream received')
        remoteStreamRef.current = stream
      })

      // Notify server
      socketService.answerCall(currentCall.id)
      setCallState('connecting')
      setCurrentCall({ ...currentCall, answeredAt: new Date() })
    } catch (err) {
      console.error('Error answering call:', err)
      setError(err instanceof Error ? err.message : 'Failed to answer call')
      cleanup()
    }
  }, [currentCall, cleanup])

  /**
   * Reject incoming call
   */
  const rejectCall = useCallback((reason?: string) => {
    if (!currentCall) return

    socketService.rejectCall(currentCall.id, reason)
    saveToHistory()
    cleanup()
  }, [currentCall, cleanup, saveToHistory])

  /**
   * End active call
   */
  const endCall = useCallback(() => {
    if (!currentCall) return

    socketService.endCall(currentCall.id)
    setCurrentCall({ ...currentCall, endedAt: new Date() })
    saveToHistory()
    cleanup()
  }, [currentCall, cleanup, saveToHistory])

  /**
   * Toggle mute
   */
  const toggleMute = useCallback(() => {
    if (!webrtcServiceRef.current) return

    const muted = webrtcServiceRef.current.toggleMute()
    setIsMuted(muted)
  }, [])

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // Subscribe to socket events
  useEffect(() => {
    if (!currentUser?.extension) return

    // Incoming call
    const unsubIncoming = socketService.onCallIncoming((call) => {
      console.log('Incoming call from:', call.fromName)

      const incomingCall: Call = {
        id: call.callId,
        fromUserId: call.fromUserId,
        fromExtension: call.fromExtension,
        fromName: call.fromName,
        toUserId: currentUser.id,
        toExtension: currentUser.extension!,
        toName: `${currentUser.firstName} ${currentUser.lastName}`,
        state: 'ringing',
        direction: 'inbound',
        startedAt: new Date(),
      }

      setCurrentCall(incomingCall)
      setCallState('ringing')
    })

    // Call ringing
    const unsubRinging = socketService.onCallRinging(() => {
      setCallState('ringing')
    })

    // Call answered
    const unsubAnswered = socketService.onCallAnswered(async (callId) => {
      setCallState('connecting')

      // If we're the caller, create and send offer
      if (currentCallRef.current?.direction === 'outbound' && webrtcServiceRef.current) {
        try {
          const offer = await webrtcServiceRef.current.createOffer()
          socketService.sendWebRTCOffer(callId, offer)
        } catch (err) {
          console.error('Failed to create offer:', err)
          setError('Failed to establish call')
          cleanup()
        }
      }
    })

    // Call rejected
    const unsubRejected = socketService.onCallRejected((_callId, reason) => {
      setError(reason || 'Call rejected')
      saveToHistory()
      cleanup()
    })

    // Call ended
    const unsubEnded = socketService.onCallEnded(() => {
      saveToHistory()
      cleanup()
    })

    // Call failed
    const unsubFailed = socketService.onCallFailed((reason) => {
      setError(reason)
      cleanup()
    })

    // WebRTC offer
    const unsubOffer = socketService.onWebRTCOffer(async (callId, offer) => {
      if (!webrtcServiceRef.current) return

      try {
        await webrtcServiceRef.current.setRemoteDescription(offer)
        const answer = await webrtcServiceRef.current.createAnswer(offer)
        socketService.sendWebRTCAnswer(callId, answer)
      } catch (err) {
        console.error('Failed to handle offer:', err)
        setError('Failed to establish call')
        cleanup()
      }
    })

    // WebRTC answer
    const unsubAnswer = socketService.onWebRTCAnswer(async (_callId, answer) => {
      if (!webrtcServiceRef.current) return

      try {
        await webrtcServiceRef.current.setRemoteDescription(answer)
        setCallState('connected')
      } catch (err) {
        console.error('Failed to handle answer:', err)
        setError('Failed to establish call')
        cleanup()
      }
    })

    // ICE candidates
    const unsubIceCandidate = socketService.onWebRTCIceCandidate(async (_callId, candidate) => {
      if (!webrtcServiceRef.current) return

      try {
        await webrtcServiceRef.current.addIceCandidate(candidate)
      } catch (err) {
        console.error('Failed to add ICE candidate:', err)
      }
    })

    return () => {
      unsubIncoming()
      unsubRinging()
      unsubAnswered()
      unsubRejected()
      unsubEnded()
      unsubFailed()
      unsubOffer()
      unsubAnswer()
      unsubIceCandidate()
    }
  }, [currentUser, cleanup, saveToHistory])

  return (
    <SoftphoneContext.Provider
      value={{
        currentCall,
        callState,
        isInCall: callState !== 'idle',
        isMuted,
        callHistory,
        initiateCall,
        answerCall,
        rejectCall,
        endCall,
        toggleMute,
        localStreamRef,
        remoteStreamRef,
        error,
        clearError,
      }}
    >
      {children}
    </SoftphoneContext.Provider>
  )
}

export const useSoftphone = () => {
  const context = useContext(SoftphoneContext)
  if (!context) {
    throw new Error('useSoftphone must be used within SoftphoneProvider')
  }
  return context
}

// Softphone Types

// WebRTC type definitions (for environments without DOM types)
export interface RTCSessionDescriptionInit {
  type: 'offer' | 'answer' | 'pranswer' | 'rollback'
  sdp?: string
}

export interface RTCIceCandidateInit {
  candidate?: string
  sdpMLineIndex?: number | null
  sdpMid?: string | null
  usernameFragment?: string | null
}

export type Extension = string

export type CallState = 'idle' | 'dialing' | 'ringing' | 'connecting' | 'connected' | 'ended' | 'failed'

export type CallDirection = 'inbound' | 'outbound'

export interface Call {
  id: string
  fromUserId: string
  fromExtension: string
  fromName: string
  toUserId: string
  toExtension: string
  toName: string
  state: CallState
  direction: CallDirection
  startedAt: Date
  answeredAt?: Date
  endedAt?: Date
  duration?: number
}

export interface CallHistoryEntry {
  id: string
  contactName: string
  contactExtension: string
  direction: CallDirection
  timestamp: Date
  duration?: number
  answered: boolean
}

// WebRTC Signaling Payloads

export interface CallInitiatePayload {
  callId: string
  fromUserId: string
  fromExtension: string
  fromName: string
  toExtension: string
}

export interface CallAnswerPayload {
  callId: string
  fromUserId: string
}

export interface CallRejectPayload {
  callId: string
  fromUserId: string
  reason?: string
}

export interface CallEndPayload {
  callId: string
  fromUserId: string
}

export interface WebRTCOfferPayload {
  callId: string
  fromUserId: string
  offer: RTCSessionDescriptionInit
}

export interface WebRTCAnswerPayload {
  callId: string
  fromUserId: string
  answer: RTCSessionDescriptionInit
}

export interface WebRTCIceCandidatePayload {
  callId: string
  fromUserId: string
  candidate: RTCIceCandidateInit
}

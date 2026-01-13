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

export type CallType = 'internal' | 'pstn_inbound' | 'pstn_outbound'

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
  // PSTN-specific fields
  callType?: CallType
  phoneNumber?: string
  twilioCallSid?: string
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

// ============================================================================
// TWILIO PSTN INTEGRATION
// ============================================================================

// Twilio Configuration
export interface TwilioConfig {
  accountSid: string
  authToken: string
  apiKey: string
  apiSecret: string
  twimlAppSid: string
}

// Twilio Webhook Payloads
export interface TwilioIncomingCallWebhook {
  CallSid: string
  From: string
  To: string
  CallStatus: string
  Direction: string
  CallerName?: string
  CallerCity?: string
  CallerState?: string
  CallerCountry?: string
}

export interface TwilioStatusCallbackWebhook {
  CallSid: string
  CallStatus: string
  CallDuration?: string
  RecordingUrl?: string
  RecordingSid?: string
  RecordingDuration?: string
}

// Twilio Device Token Payload
export interface TwilioDeviceTokenPayload {
  userId: string
  extension: string
}

// Twilio Incoming Connection (from Device SDK)
export interface TwilioIncomingConnectionPayload {
  callId: string
  callSid: string
  from: string
  to: string
  fromName?: string
}

// PBX Routing Types
export interface RoutingConditions {
  timeRanges?: Array<{ start: string; end: string; timezone?: string }>
  callerIds?: string[]
  daysOfWeek?: number[] // 0=Sunday, 6=Saturday
}

export type RoutingTargetType = 'user' | 'ivr' | 'voicemail' | 'external'

export interface PBXRoutingRule {
  id: string
  customerId: string
  phoneNumberId: string
  name: string
  priority: number
  enabled: boolean
  conditions: RoutingConditions
  targetType: RoutingTargetType
  targetUserId?: string
  targetIVRId?: string
  fallbackAction?: 'busy' | 'voicemail' | 'forward'
  createdAt: Date
  updatedAt: Date
}

// PSTN Call Session (backend tracking)
export interface PSTNCallSession {
  callId: string
  twilioCallSid: string
  fromNumber: string
  toExtension: string
  toUserId: string
  state: CallState
  createdAt: Date
}

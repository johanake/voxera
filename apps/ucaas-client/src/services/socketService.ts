import { io } from 'socket.io-client'
import type { Socket } from 'socket.io-client'
import type { ChatMessage, RTCSessionDescriptionInit, RTCIceCandidateInit } from '@ucaas/shared'

type MessageCallback = (message: ChatMessage) => void
type TypingCallback = (fromUserId: string, isTyping: boolean) => void
type StatusCallback = (userId: string, status: string | undefined) => void
type ConnectionCallback = (connected: boolean) => void
type OnlineUsersCallback = (userIds: string[]) => void

// Call-related callbacks
type CallIncomingCallback = (call: { callId: string; fromUserId: string; fromName: string; fromExtension: string }) => void
type CallRingingCallback = (callId: string) => void
type CallAnsweredCallback = (callId: string) => void
type CallRejectedCallback = (callId: string, reason?: string) => void
type CallEndedCallback = (callId: string) => void
type CallFailedCallback = (reason: string) => void
type WebRTCOfferCallback = (callId: string, offer: RTCSessionDescriptionInit) => void
type WebRTCAnswerCallback = (callId: string, answer: RTCSessionDescriptionInit) => void
type WebRTCIceCandidateCallback = (callId: string, candidate: RTCIceCandidateInit) => void

class SocketService {
  private socket: Socket | null = null
  private currentUserId: string | null = null
  private messageCallbacks: MessageCallback[] = []
  private typingCallbacks: TypingCallback[] = []
  private statusCallbacks: StatusCallback[] = []
  private connectionCallbacks: ConnectionCallback[] = []
  private onlineUsersCallbacks: OnlineUsersCallback[] = []

  // Call-related callbacks
  private callIncomingCallbacks: CallIncomingCallback[] = []
  private callRingingCallbacks: CallRingingCallback[] = []
  private callAnsweredCallbacks: CallAnsweredCallback[] = []
  private callRejectedCallbacks: CallRejectedCallback[] = []
  private callEndedCallbacks: CallEndedCallback[] = []
  private callFailedCallbacks: CallFailedCallback[] = []
  private webrtcOfferCallbacks: WebRTCOfferCallback[] = []
  private webrtcAnswerCallbacks: WebRTCAnswerCallback[] = []
  private webrtcIceCandidateCallbacks: WebRTCIceCandidateCallback[] = []

  /**
   * Connect to WebSocket server
   */
  connect(userId: string, extension?: string, status: 'online' | 'away' | 'busy' = 'online'): void {
    if (this.socket?.connected) {
      console.log('Socket already connected')
      return
    }

    // Store the userId for use in future calls
    this.currentUserId = userId

    const url = (import.meta.env.VITE_WS_URL as string | undefined) || 'http://localhost:5000'

    this.socket = io(url, {
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    })

    this.setupEventListeners()

    // Register user when connected
    this.socket.on('connect', () => {
      console.log('Socket connected')
      this.socket?.emit('user:register', { userId, extension, status })
      this.notifyConnection(true)
    })

    // Handle disconnection
    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason)
      this.notifyConnection(false)
    })

    // Handle connection errors
    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error)
      this.notifyConnection(false)
    })
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
      this.currentUserId = null
      this.notifyConnection(false)
    }
  }

  /**
   * Send a message to another user
   */
  sendMessage(toUserId: string, content: string): void {
    if (!this.socket?.connected) {
      console.warn('Socket not connected, cannot send message')
      return
    }

    this.socket.emit('message:send', { toUserId, content })
  }

  /**
   * Mark messages from a user as read
   */
  markAsRead(fromUserId: string): void {
    if (!this.socket?.connected) {
      return
    }

    this.socket.emit('message:read', { fromUserId })
  }

  /**
   * Notify that user started typing
   */
  startTyping(toUserId: string): void {
    if (!this.socket?.connected) {
      return
    }

    this.socket.emit('typing:start', { toUserId })
  }

  /**
   * Notify that user stopped typing
   */
  stopTyping(toUserId: string): void {
    if (!this.socket?.connected) {
      return
    }

    this.socket.emit('typing:stop', { toUserId })
  }

  /**
   * Change user status
   */
  changeStatus(status: 'online' | 'away' | 'busy'): void {
    if (!this.socket?.connected) {
      return
    }

    this.socket.emit('user:status_change', { status })
  }

  /**
   * Load conversation history
   */
  loadConversation(withUserId: string, limit?: number): void {
    if (!this.socket?.connected) {
      return
    }

    this.socket.emit('conversation:load', { withUserId, limit })
  }

  /**
   * Check if socket is connected
   */
  isConnected(): boolean {
    return this.socket?.connected ?? false
  }

  /**
   * Initiate a call to an extension
   */
  initiateCall(callId: string, fromExtension: string, fromName: string, toExtension: string): void {
    if (!this.socket?.connected) {
      console.warn('Socket not connected, cannot initiate call')
      return
    }

    this.socket.emit('call:initiate', {
      callId,
      fromUserId: this.currentUserId || '',
      fromExtension,
      fromName,
      toExtension,
    })
  }

  /**
   * Answer an incoming call
   */
  answerCall(callId: string): void {
    if (!this.socket?.connected) {
      console.warn('Socket not connected, cannot answer call')
      return
    }

    this.socket.emit('call:answer', { callId, fromUserId: this.currentUserId || '' })
  }

  /**
   * Reject an incoming call
   */
  rejectCall(callId: string, reason?: string): void {
    if (!this.socket?.connected) {
      console.warn('Socket not connected, cannot reject call')
      return
    }

    this.socket.emit('call:reject', { callId, fromUserId: this.currentUserId || '', reason })
  }

  /**
   * End an active call
   */
  endCall(callId: string): void {
    if (!this.socket?.connected) {
      console.warn('Socket not connected, cannot end call')
      return
    }

    this.socket.emit('call:end', { callId, fromUserId: this.currentUserId || '' })
  }

  /**
   * Send WebRTC offer
   */
  sendWebRTCOffer(callId: string, offer: RTCSessionDescriptionInit): void {
    if (!this.socket?.connected) {
      console.warn('Socket not connected, cannot send offer')
      return
    }

    this.socket.emit('webrtc:offer', { callId, fromUserId: this.currentUserId || '', offer })
  }

  /**
   * Send WebRTC answer
   */
  sendWebRTCAnswer(callId: string, answer: RTCSessionDescriptionInit): void {
    if (!this.socket?.connected) {
      console.warn('Socket not connected, cannot send answer')
      return
    }

    this.socket.emit('webrtc:answer', { callId, fromUserId: this.currentUserId || '', answer })
  }

  /**
   * Send ICE candidate
   */
  sendIceCandidate(callId: string, candidate: RTCIceCandidate): void {
    if (!this.socket?.connected) {
      console.warn('Socket not connected, cannot send ICE candidate')
      return
    }

    this.socket.emit('webrtc:ice-candidate', {
      callId,
      fromUserId: this.currentUserId || '',
      candidate: {
        candidate: candidate.candidate,
        sdpMLineIndex: candidate.sdpMLineIndex,
        sdpMid: candidate.sdpMid,
        usernameFragment: candidate.usernameFragment,
      },
    })
  }

  /**
   * Subscribe to incoming messages
   */
  onMessage(callback: MessageCallback): () => void {
    this.messageCallbacks.push(callback)
    return () => {
      this.messageCallbacks = this.messageCallbacks.filter((cb) => cb !== callback)
    }
  }

  /**
   * Subscribe to typing indicators
   */
  onTyping(callback: TypingCallback): () => void {
    this.typingCallbacks.push(callback)
    return () => {
      this.typingCallbacks = this.typingCallbacks.filter((cb) => cb !== callback)
    }
  }

  /**
   * Subscribe to status changes
   */
  onStatusChange(callback: StatusCallback): () => void {
    this.statusCallbacks.push(callback)
    return () => {
      this.statusCallbacks = this.statusCallbacks.filter((cb) => cb !== callback)
    }
  }

  /**
   * Subscribe to connection changes
   */
  onConnectionChange(callback: ConnectionCallback): () => void {
    this.connectionCallbacks.push(callback)
    return () => {
      this.connectionCallbacks = this.connectionCallbacks.filter((cb) => cb !== callback)
    }
  }

  /**
   * Subscribe to online users list
   */
  onOnlineUsers(callback: OnlineUsersCallback): () => void {
    this.onlineUsersCallbacks.push(callback)
    return () => {
      this.onlineUsersCallbacks = this.onlineUsersCallbacks.filter((cb) => cb !== callback)
    }
  }

  /**
   * Subscribe to incoming calls
   */
  onCallIncoming(callback: CallIncomingCallback): () => void {
    this.callIncomingCallbacks.push(callback)
    return () => {
      this.callIncomingCallbacks = this.callIncomingCallbacks.filter((cb) => cb !== callback)
    }
  }

  /**
   * Subscribe to call ringing event
   */
  onCallRinging(callback: CallRingingCallback): () => void {
    this.callRingingCallbacks.push(callback)
    return () => {
      this.callRingingCallbacks = this.callRingingCallbacks.filter((cb) => cb !== callback)
    }
  }

  /**
   * Subscribe to call answered event
   */
  onCallAnswered(callback: CallAnsweredCallback): () => void {
    this.callAnsweredCallbacks.push(callback)
    return () => {
      this.callAnsweredCallbacks = this.callAnsweredCallbacks.filter((cb) => cb !== callback)
    }
  }

  /**
   * Subscribe to call rejected event
   */
  onCallRejected(callback: CallRejectedCallback): () => void {
    this.callRejectedCallbacks.push(callback)
    return () => {
      this.callRejectedCallbacks = this.callRejectedCallbacks.filter((cb) => cb !== callback)
    }
  }

  /**
   * Subscribe to call ended event
   */
  onCallEnded(callback: CallEndedCallback): () => void {
    this.callEndedCallbacks.push(callback)
    return () => {
      this.callEndedCallbacks = this.callEndedCallbacks.filter((cb) => cb !== callback)
    }
  }

  /**
   * Subscribe to call failed event
   */
  onCallFailed(callback: CallFailedCallback): () => void {
    this.callFailedCallbacks.push(callback)
    return () => {
      this.callFailedCallbacks = this.callFailedCallbacks.filter((cb) => cb !== callback)
    }
  }

  /**
   * Subscribe to WebRTC offer
   */
  onWebRTCOffer(callback: WebRTCOfferCallback): () => void {
    this.webrtcOfferCallbacks.push(callback)
    return () => {
      this.webrtcOfferCallbacks = this.webrtcOfferCallbacks.filter((cb) => cb !== callback)
    }
  }

  /**
   * Subscribe to WebRTC answer
   */
  onWebRTCAnswer(callback: WebRTCAnswerCallback): () => void {
    this.webrtcAnswerCallbacks.push(callback)
    return () => {
      this.webrtcAnswerCallbacks = this.webrtcAnswerCallbacks.filter((cb) => cb !== callback)
    }
  }

  /**
   * Subscribe to WebRTC ICE candidates
   */
  onWebRTCIceCandidate(callback: WebRTCIceCandidateCallback): () => void {
    this.webrtcIceCandidateCallbacks.push(callback)
    return () => {
      this.webrtcIceCandidateCallbacks = this.webrtcIceCandidateCallbacks.filter((cb) => cb !== callback)
    }
  }

  /**
   * Setup socket event listeners
   */
  private setupEventListeners(): void {
    if (!this.socket) return

    // Message received
    this.socket.on('message:receive', (message: ChatMessage) => {
      console.log('Message received:', message)
      this.messageCallbacks.forEach((cb) => cb(message))
    })

    // Message sent confirmation
    this.socket.on('message:sent', (message: ChatMessage) => {
      console.log('Message sent confirmed:', message.id)
      this.messageCallbacks.forEach((cb) => cb(message))
    })

    // Typing indication
    this.socket.on('typing:indication', ({ fromUserId, isTyping }: { fromUserId: string; isTyping: boolean }) => {
      this.typingCallbacks.forEach((cb) => cb(fromUserId, isTyping))
    })

    // User came online
    this.socket.on('user:online', ({ userId, status }: { userId: string; status: string }) => {
      console.log(`User ${userId} came online (${status})`)
      this.statusCallbacks.forEach((cb) => cb(userId, status))
    })

    // User went offline
    this.socket.on('user:offline', ({ userId }: { userId: string }) => {
      console.log(`User ${userId} went offline`)
      this.statusCallbacks.forEach((cb) => cb(userId, 'offline'))
    })

    // User status changed
    this.socket.on('user:status_changed', ({ userId, status }: { userId: string; status: string }) => {
      console.log(`User ${userId} changed status to ${status}`)
      this.statusCallbacks.forEach((cb) => cb(userId, status))
    })

    // Online users list
    this.socket.on('users:online', ({ userIds }: { userIds: string[] }) => {
      console.log('Online users:', userIds)
      this.onlineUsersCallbacks.forEach((cb) => cb(userIds))
    })

    // Conversation loaded
    this.socket.on('conversation:loaded', ({ withUserId, messages }: { withUserId: string; messages: ChatMessage[] }) => {
      console.log(`Loaded ${messages.length} messages with ${withUserId}`)
      // Note: This would need a separate callback handler if you want to handle it
    })

    // Messages read
    this.socket.on('messages:read', ({ byUserId }: { byUserId: string }) => {
      console.log(`Messages read by ${byUserId}`)
      // Could trigger UI update to show read receipts
    })

    // Error handling
    this.socket.on('error', ({ code, message }: { code: string; message: string }) => {
      console.error(`Socket error [${code}]: ${message}`)
    })

    // Call events
    this.socket.on('call:incoming', ({ callId, fromUserId, fromName, fromExtension }: { callId: string; fromUserId: string; fromName: string; fromExtension: string }) => {
      console.log(`Incoming call from ${fromName} (${fromExtension})`)
      this.callIncomingCallbacks.forEach((cb) => cb({ callId, fromUserId, fromName, fromExtension }))
    })

    this.socket.on('call:ringing', ({ callId }: { callId: string }) => {
      console.log(`Call ${callId} is ringing`)
      this.callRingingCallbacks.forEach((cb) => cb(callId))
    })

    this.socket.on('call:answered', ({ callId }: { callId: string }) => {
      console.log(`Call ${callId} answered`)
      this.callAnsweredCallbacks.forEach((cb) => cb(callId))
    })

    this.socket.on('call:rejected', ({ callId, reason }: { callId: string; reason?: string }) => {
      console.log(`Call ${callId} rejected: ${reason || 'No reason'}`)
      this.callRejectedCallbacks.forEach((cb) => cb(callId, reason))
    })

    this.socket.on('call:ended', ({ callId }: { callId: string }) => {
      console.log(`Call ${callId} ended`)
      this.callEndedCallbacks.forEach((cb) => cb(callId))
    })

    this.socket.on('call:failed', ({ reason }: { reason: string }) => {
      console.log(`Call failed: ${reason}`)
      this.callFailedCallbacks.forEach((cb) => cb(reason))
    })

    // WebRTC signaling events
    this.socket.on('webrtc:offer', ({ callId, offer }: { callId: string; offer: RTCSessionDescriptionInit }) => {
      console.log(`WebRTC offer received for call ${callId}`)
      this.webrtcOfferCallbacks.forEach((cb) => cb(callId, offer))
    })

    this.socket.on('webrtc:answer', ({ callId, answer }: { callId: string; answer: RTCSessionDescriptionInit }) => {
      console.log(`WebRTC answer received for call ${callId}`)
      this.webrtcAnswerCallbacks.forEach((cb) => cb(callId, answer))
    })

    this.socket.on('webrtc:ice-candidate', ({ callId, candidate }: { callId: string; candidate: RTCIceCandidateInit }) => {
      console.log(`ICE candidate received for call ${callId}`)
      this.webrtcIceCandidateCallbacks.forEach((cb) => cb(callId, candidate))
    })
  }

  /**
   * Notify all connection callbacks
   */
  private notifyConnection(connected: boolean): void {
    this.connectionCallbacks.forEach((cb) => cb(connected))
  }
}

// Export singleton instance
export const socketService = new SocketService()

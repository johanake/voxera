import { io } from 'socket.io-client'
import type { Socket } from 'socket.io-client'
import type {
  ChatMessage,
  RTCSessionDescriptionInit,
  RTCIceCandidateInit,
  MessageReaction,
  ChatGroup,
  ChatGroupMessage,
  ChatGroupMember,
} from '@ucaas/shared'

type MessageCallback = (message: ChatMessage) => void
type TypingCallback = (fromUserId: string, isTyping: boolean) => void
type StatusCallback = (userId: string, status: string | undefined) => void
type ConnectionCallback = (connected: boolean) => void
type OnlineUsersCallback = (userIds: string[]) => void
type ReactionUpdatedCallback = (data: {
  messageId: string
  reactions: MessageReaction[]
  action: 'added' | 'removed'
  userId: string
  emoji: string
}) => void

// Chat group callbacks
type ChatGroupCreatedCallback = (chatGroup: ChatGroup) => void
type ChatGroupMessageCallback = (message: ChatGroupMessage) => void
type ChatGroupUpdatedCallback = (chatGroup: ChatGroup) => void
type ChatGroupMemberAddedCallback = (data: { chatGroupId: string; member: ChatGroupMember }) => void
type ChatGroupMemberRemovedCallback = (data: { chatGroupId: string; userId: string }) => void
type ChatGroupMemberLeftCallback = (data: { chatGroupId: string; userId: string }) => void
type ChatGroupLeftCallback = (data: { chatGroupId: string }) => void
type ChatGroupDeletedCallback = (data: { chatGroupId: string }) => void

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
  private reactionCallbacks: ReactionUpdatedCallback[] = []

  // Chat group callbacks
  private chatGroupCreatedCallbacks: ChatGroupCreatedCallback[] = []
  private chatGroupMessageCallbacks: ChatGroupMessageCallback[] = []
  private chatGroupUpdatedCallbacks: ChatGroupUpdatedCallback[] = []
  private chatGroupMemberAddedCallbacks: ChatGroupMemberAddedCallback[] = []
  private chatGroupMemberRemovedCallbacks: ChatGroupMemberRemovedCallback[] = []
  private chatGroupMemberLeftCallbacks: ChatGroupMemberLeftCallback[] = []
  private chatGroupLeftCallbacks: ChatGroupLeftCallback[] = []
  private chatGroupDeletedCallbacks: ChatGroupDeletedCallback[] = []

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
   * Toggle reaction on a message
   */
  toggleReaction(messageId: string, emoji: string): void {
    if (!this.socket?.connected) {
      console.warn('Socket not connected, cannot toggle reaction')
      return
    }

    this.socket.emit('reaction:toggle', { messageId, emoji })
  }

  // ============================================================================
  // CHAT GROUP METHODS
  // ============================================================================

  /**
   * Create a new chat group
   */
  createChatGroup(name: string, memberIds: string[]): void {
    if (!this.socket?.connected) {
      console.warn('Socket not connected, cannot create chat group')
      return
    }

    this.socket.emit('chatgroup:create', { name, memberIds })
  }

  /**
   * Send message to a chat group
   */
  sendChatGroupMessage(chatGroupId: string, content: string): void {
    if (!this.socket?.connected) {
      console.warn('Socket not connected, cannot send chat group message')
      return
    }

    this.socket.emit('chatgroup:message:send', { chatGroupId, content })
  }

  /**
   * Mark chat group messages as read
   */
  markChatGroupMessagesAsRead(chatGroupId: string, upToMessageId: string): void {
    if (!this.socket?.connected) {
      console.warn('Socket not connected, cannot mark messages as read')
      return
    }

    this.socket.emit('chatgroup:messages:read', { chatGroupId, upToMessageId })
  }

  /**
   * Load chat group message history
   */
  loadChatGroupMessages(chatGroupId: string, limit?: number, before?: string): void {
    if (!this.socket?.connected) {
      console.warn('Socket not connected, cannot load chat group messages')
      return
    }

    this.socket.emit('chatgroup:messages:load', { chatGroupId, limit, before })
  }

  /**
   * Update chat group name (admin only)
   */
  updateChatGroupName(chatGroupId: string, name: string): void {
    if (!this.socket?.connected) {
      console.warn('Socket not connected, cannot update chat group name')
      return
    }

    this.socket.emit('chatgroup:update:name', { chatGroupId, name })
  }

  /**
   * Add member to chat group (admin only)
   */
  addChatGroupMember(chatGroupId: string, newUserId: string): void {
    if (!this.socket?.connected) {
      console.warn('Socket not connected, cannot add chat group member')
      return
    }

    this.socket.emit('chatgroup:member:add', { chatGroupId, newUserId })
  }

  /**
   * Remove member from chat group (admin only)
   */
  removeChatGroupMember(chatGroupId: string, removeUserId: string): void {
    if (!this.socket?.connected) {
      console.warn('Socket not connected, cannot remove chat group member')
      return
    }

    this.socket.emit('chatgroup:member:remove', { chatGroupId, removeUserId })
  }

  /**
   * Leave a chat group
   */
  leaveChatGroup(chatGroupId: string): void {
    if (!this.socket?.connected) {
      console.warn('Socket not connected, cannot leave chat group')
      return
    }

    this.socket.emit('chatgroup:leave', { chatGroupId })
  }

  /**
   * Delete a chat group (admin only)
   */
  deleteChatGroup(chatGroupId: string): void {
    if (!this.socket?.connected) {
      console.warn('Socket not connected, cannot delete chat group')
      return
    }

    this.socket.emit('chatgroup:delete', { chatGroupId })
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
   * Subscribe to reaction updates
   */
  onReactionUpdated(callback: ReactionUpdatedCallback): () => void {
    this.reactionCallbacks.push(callback)
    return () => {
      this.reactionCallbacks = this.reactionCallbacks.filter((cb) => cb !== callback)
    }
  }

  /**
   * Subscribe to chat group created
   */
  onChatGroupCreated(callback: ChatGroupCreatedCallback): () => void {
    this.chatGroupCreatedCallbacks.push(callback)
    return () => {
      this.chatGroupCreatedCallbacks = this.chatGroupCreatedCallbacks.filter((cb) => cb !== callback)
    }
  }

  /**
   * Subscribe to chat group messages
   */
  onChatGroupMessage(callback: ChatGroupMessageCallback): () => void {
    this.chatGroupMessageCallbacks.push(callback)
    return () => {
      this.chatGroupMessageCallbacks = this.chatGroupMessageCallbacks.filter((cb) => cb !== callback)
    }
  }

  /**
   * Subscribe to chat group updates
   */
  onChatGroupUpdated(callback: ChatGroupUpdatedCallback): () => void {
    this.chatGroupUpdatedCallbacks.push(callback)
    return () => {
      this.chatGroupUpdatedCallbacks = this.chatGroupUpdatedCallbacks.filter((cb) => cb !== callback)
    }
  }

  /**
   * Subscribe to chat group member added
   */
  onChatGroupMemberAdded(callback: ChatGroupMemberAddedCallback): () => void {
    this.chatGroupMemberAddedCallbacks.push(callback)
    return () => {
      this.chatGroupMemberAddedCallbacks = this.chatGroupMemberAddedCallbacks.filter((cb) => cb !== callback)
    }
  }

  /**
   * Subscribe to chat group member removed
   */
  onChatGroupMemberRemoved(callback: ChatGroupMemberRemovedCallback): () => void {
    this.chatGroupMemberRemovedCallbacks.push(callback)
    return () => {
      this.chatGroupMemberRemovedCallbacks = this.chatGroupMemberRemovedCallbacks.filter((cb) => cb !== callback)
    }
  }

  /**
   * Subscribe to chat group member left
   */
  onChatGroupMemberLeft(callback: ChatGroupMemberLeftCallback): () => void {
    this.chatGroupMemberLeftCallbacks.push(callback)
    return () => {
      this.chatGroupMemberLeftCallbacks = this.chatGroupMemberLeftCallbacks.filter((cb) => cb !== callback)
    }
  }

  /**
   * Subscribe to chat group left
   */
  onChatGroupLeft(callback: ChatGroupLeftCallback): () => void {
    this.chatGroupLeftCallbacks.push(callback)
    return () => {
      this.chatGroupLeftCallbacks = this.chatGroupLeftCallbacks.filter((cb) => cb !== callback)
    }
  }

  /**
   * Subscribe to chat group deleted
   */
  onChatGroupDeleted(callback: ChatGroupDeletedCallback): () => void {
    this.chatGroupDeletedCallbacks.push(callback)
    return () => {
      this.chatGroupDeletedCallbacks = this.chatGroupDeletedCallbacks.filter((cb) => cb !== callback)
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

    // Reaction updated
    this.socket.on('reaction:updated', (data: { messageId: string; reactions: MessageReaction[]; action: 'added' | 'removed'; userId: string; emoji: string }) => {
      console.log(`Reaction ${data.action} on message ${data.messageId}`)
      this.reactionCallbacks.forEach((cb) => cb(data))
    })

    // Chat group events
    this.socket.on('chatgroup:created', (chatGroup: ChatGroup) => {
      console.log(`Chat group created: ${chatGroup.id}`)
      this.chatGroupCreatedCallbacks.forEach((cb) => cb(chatGroup))
    })

    this.socket.on('chatgroup:message:receive', (message: ChatGroupMessage) => {
      console.log(`Chat group message received: ${message.id}`)
      this.chatGroupMessageCallbacks.forEach((cb) => cb(message))
    })

    this.socket.on('chatgroup:updated', (chatGroup: ChatGroup) => {
      console.log(`Chat group updated: ${chatGroup.id}`)
      this.chatGroupUpdatedCallbacks.forEach((cb) => cb(chatGroup))
    })

    this.socket.on('chatgroup:member:added', (data: { chatGroupId: string; member: ChatGroupMember }) => {
      console.log(`Member added to chat group ${data.chatGroupId}`)
      this.chatGroupMemberAddedCallbacks.forEach((cb) => cb(data))
    })

    this.socket.on('chatgroup:member:removed', (data: { chatGroupId: string; userId: string }) => {
      console.log(`Member removed from chat group ${data.chatGroupId}`)
      this.chatGroupMemberRemovedCallbacks.forEach((cb) => cb(data))
    })

    this.socket.on('chatgroup:member:left', (data: { chatGroupId: string; userId: string }) => {
      console.log(`Member left chat group ${data.chatGroupId}`)
      this.chatGroupMemberLeftCallbacks.forEach((cb) => cb(data))
    })

    this.socket.on('chatgroup:left', (data: { chatGroupId: string }) => {
      console.log(`You left chat group ${data.chatGroupId}`)
      this.chatGroupLeftCallbacks.forEach((cb) => cb(data))
    })

    this.socket.on('chatgroup:deleted', (data: { chatGroupId: string }) => {
      console.log(`Chat group deleted: ${data.chatGroupId}`)
      this.chatGroupDeletedCallbacks.forEach((cb) => cb(data))
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

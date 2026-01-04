import type { CallState } from '@ucaas/shared'

export interface CallSession {
  callId: string
  fromUserId: string
  fromExtension: string
  toUserId: string
  toExtension: string
  state: CallState
  createdAt: Date
}

export class CallStorage {
  private activeCalls: Map<string, CallSession> = new Map()
  private extensionToUser: Map<string, string> = new Map()
  private userToExtension: Map<string, string> = new Map()

  /**
   * Register user extension mapping
   */
  registerExtension(userId: string, extension: string): void {
    if (!extension) return

    // Remove old extension mapping if user had one
    const oldExtension = this.userToExtension.get(userId)
    if (oldExtension) {
      this.extensionToUser.delete(oldExtension)
    }

    // Set new mappings
    this.extensionToUser.set(extension, userId)
    this.userToExtension.set(userId, extension)
    console.log(`Registered extension ${extension} for user ${userId}`)
  }

  /**
   * Unregister user extension (on disconnect)
   */
  unregisterExtension(userId: string): void {
    const extension = this.userToExtension.get(userId)
    if (extension) {
      this.extensionToUser.delete(extension)
      this.userToExtension.delete(userId)
      console.log(`Unregistered extension ${extension} for user ${userId}`)
    }
  }

  /**
   * Get user ID by extension
   */
  getUserByExtension(extension: string): string | undefined {
    return this.extensionToUser.get(extension)
  }

  /**
   * Get extension by user ID
   */
  getExtensionByUser(userId: string): string | undefined {
    return this.userToExtension.get(userId)
  }

  /**
   * Create a new call session
   */
  createCall(
    callId: string,
    fromUserId: string,
    fromExtension: string,
    toUserId: string,
    toExtension: string
  ): CallSession {
    const session: CallSession = {
      callId,
      fromUserId,
      fromExtension,
      toUserId,
      toExtension,
      state: 'ringing',
      createdAt: new Date(),
    }

    this.activeCalls.set(callId, session)
    console.log(`Created call session: ${callId} (${fromExtension} → ${toExtension})`)
    return session
  }

  /**
   * Get call session by ID
   */
  getCall(callId: string): CallSession | undefined {
    return this.activeCalls.get(callId)
  }

  /**
   * Update call state
   */
  updateCallState(callId: string, state: CallState): void {
    const call = this.activeCalls.get(callId)
    if (call) {
      call.state = state
      console.log(`Updated call ${callId} state to ${state}`)
    }
  }

  /**
   * End call and remove from active calls
   */
  endCall(callId: string): CallSession | null {
    const call = this.activeCalls.get(callId)
    if (call) {
      this.activeCalls.delete(callId)
      console.log(`Ended call: ${callId}`)
      return call
    }
    return null
  }

  /**
   * Get user's active call
   */
  getUserActiveCall(userId: string): CallSession | undefined {
    for (const call of this.activeCalls.values()) {
      if (call.fromUserId === userId || call.toUserId === userId) {
        return call
      }
    }
    return undefined
  }

  /**
   * Check if user is currently in a call
   */
  isUserInCall(userId: string): boolean {
    return this.getUserActiveCall(userId) !== undefined
  }

  /**
   * Get all active calls (for debugging)
   */
  getAllActiveCalls(): CallSession[] {
    return Array.from(this.activeCalls.values())
  }

  /**
   * Get extension stats (for debugging)
   */
  getExtensionStats(): { totalExtensions: number; activeCalls: number } {
    return {
      totalExtensions: this.extensionToUser.size,
      activeCalls: this.activeCalls.size,
    }
  }
}

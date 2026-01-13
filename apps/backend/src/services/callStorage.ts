import type { CallState, PSTNCallSession } from '@ucaas/shared'

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

  // PSTN call tracking
  private pstnCalls: Map<string, PSTNCallSession> = new Map()
  private sidToCallId: Map<string, string> = new Map() // Twilio SID -> Call ID mapping

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
   * Check if user is currently in a call (internal OR PSTN)
   */
  isUserInCall(userId: string): boolean {
    // Check internal calls
    if (this.getUserActiveCall(userId) !== undefined) {
      return true
    }

    // Check PSTN calls
    for (const pstnCall of this.pstnCalls.values()) {
      if (pstnCall.toUserId === userId) {
        return true
      }
    }

    return false
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
  getExtensionStats(): { totalExtensions: number; activeCalls: number; pstnCalls: number } {
    return {
      totalExtensions: this.extensionToUser.size,
      activeCalls: this.activeCalls.size,
      pstnCalls: this.pstnCalls.size,
    }
  }

  // ============================================================================
  // PSTN CALL METHODS
  // ============================================================================

  /**
   * Create a PSTN call session
   */
  createPSTNCall(params: {
    callId: string
    twilioCallSid: string
    fromNumber: string
    toExtension: string
    toUserId: string
  }): PSTNCallSession {
    const session: PSTNCallSession = {
      ...params,
      state: 'ringing',
      createdAt: new Date(),
    }

    this.pstnCalls.set(params.callId, session)
    this.sidToCallId.set(params.twilioCallSid, params.callId)
    console.log(
      `Created PSTN call: ${params.callId} (${params.fromNumber} → ${params.toExtension})`
    )

    return session
  }

  /**
   * Get PSTN call by call ID
   */
  getPSTNCall(callId: string): PSTNCallSession | undefined {
    return this.pstnCalls.get(callId)
  }

  /**
   * Get PSTN call by Twilio SID
   */
  getCallBySid(twilioCallSid: string): PSTNCallSession | undefined {
    const callId = this.sidToCallId.get(twilioCallSid)
    return callId ? this.pstnCalls.get(callId) : undefined
  }

  /**
   * Update PSTN call state
   */
  updatePSTNCallState(callId: string, state: CallState): void {
    const call = this.pstnCalls.get(callId)
    if (call) {
      call.state = state
      console.log(`Updated PSTN call ${callId} state to ${state}`)
    }
  }

  /**
   * End PSTN call and remove from active calls
   */
  endPSTNCall(callId: string): PSTNCallSession | null {
    const call = this.pstnCalls.get(callId)
    if (call) {
      this.pstnCalls.delete(callId)
      this.sidToCallId.delete(call.twilioCallSid)
      console.log(`Ended PSTN call: ${callId}`)
      return call
    }
    return null
  }

  /**
   * Get all PSTN calls (for debugging)
   */
  getAllPSTNCalls(): PSTNCallSession[] {
    return Array.from(this.pstnCalls.values())
  }

  /**
   * Get user's active PSTN call
   */
  getUserActivePSTNCall(userId: string): PSTNCallSession | undefined {
    for (const call of this.pstnCalls.values()) {
      if (call.toUserId === userId) {
        return call
      }
    }
    return undefined
  }
}

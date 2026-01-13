import { Device, Call as TwilioCall } from '@twilio/voice-sdk'

export class TwilioDeviceService {
  private device: Device | null = null
  private currentConnection: TwilioCall | null = null

  // Event callbacks
  private onIncomingCallback?: (connection: TwilioCall) => void
  private onConnectCallback?: (connection: TwilioCall) => void
  private onDisconnectCallback?: () => void
  private onErrorCallback?: (error: Error) => void

  /**
   * Initialize Twilio Device with access token
   * Token expires after 1 hour
   */
  async initialize(token: string): Promise<void> {
    // Destroy existing device if any
    if (this.device) {
      this.device.destroy()
    }

    // Create new device
    this.device = new Device(token, {
      logLevel: 1, // 0=off, 1=error, 2=warn, 3=info, 4=debug
    })

    // Setup event listeners
    this.setupEventListeners()

    // Register the device
    await this.device.register()
    console.log('[Twilio Device] Registered successfully')
  }

  /**
   * Setup device event listeners
   */
  private setupEventListeners(): void {
    if (!this.device) return

    // Incoming call
    this.device.on('incoming', (connection: TwilioCall) => {
      console.log('[Twilio Device] Incoming call:', connection.parameters)
      this.currentConnection = connection

      if (this.onIncomingCallback) {
        this.onIncomingCallback(connection)
      }
    })

    // Call connected
    this.device.on('connect', (connection: TwilioCall) => {
      console.log('[Twilio Device] Call connected')
      this.currentConnection = connection

      if (this.onConnectCallback) {
        this.onConnectCallback(connection)
      }
    })

    // Call disconnected
    this.device.on('disconnect', (_connection: TwilioCall) => {
      console.log('[Twilio Device] Call disconnected')
      this.currentConnection = null

      if (this.onDisconnectCallback) {
        this.onDisconnectCallback()
      }
    })

    // Error handling
    this.device.on('error', (error: any) => {
      console.error('[Twilio Device] Error:', error)

      if (this.onErrorCallback) {
        this.onErrorCallback(error)
      }
    })

    // Registration events
    this.device.on('registered', () => {
      console.log('[Twilio Device] Registration successful')
    })

    this.device.on('unregistered', () => {
      console.log('[Twilio Device] Unregistered')
    })

    // Token will expire events
    this.device.on('tokenWillExpire', () => {
      console.warn('[Twilio Device] Token will expire soon')
      // TODO: Implement token refresh logic
    })
  }

  /**
   * Answer incoming call
   */
  answerIncomingCall(): void {
    if (this.currentConnection) {
      this.currentConnection.accept()
      console.log('[Twilio Device] Answered call')
    } else {
      console.warn('[Twilio Device] No incoming call to answer')
    }
  }

  /**
   * Reject incoming call
   */
  rejectIncomingCall(): void {
    if (this.currentConnection) {
      this.currentConnection.reject()
      console.log('[Twilio Device] Rejected call')
      this.currentConnection = null
    } else {
      console.warn('[Twilio Device] No incoming call to reject')
    }
  }

  /**
   * Hangup active call
   */
  hangup(): void {
    if (this.currentConnection) {
      this.currentConnection.disconnect()
      console.log('[Twilio Device] Hung up call')
      this.currentConnection = null
    } else {
      console.warn('[Twilio Device] No active call to hang up')
    }
  }

  /**
   * Toggle mute on active call
   * Returns the new mute state
   */
  toggleMute(): boolean {
    if (!this.currentConnection) {
      console.warn('[Twilio Device] No active call to mute')
      return false
    }

    const currentlyMuted = this.currentConnection.isMuted()
    this.currentConnection.mute(!currentlyMuted)
    console.log('[Twilio Device] Mute toggled:', !currentlyMuted)

    return !currentlyMuted
  }

  /**
   * Get current call status
   */
  getStatus(): string | null {
    return this.currentConnection?.status() || null
  }

  /**
   * Check if there is an active call
   */
  hasActiveCall(): boolean {
    return this.currentConnection !== null
  }

  /**
   * Check if currently muted
   */
  isMuted(): boolean {
    return this.currentConnection?.isMuted() || false
  }

  /**
   * Register event callbacks
   */
  onIncoming(callback: (connection: TwilioCall) => void): void {
    this.onIncomingCallback = callback
  }

  onConnect(callback: (connection: TwilioCall) => void): void {
    this.onConnectCallback = callback
  }

  onDisconnect(callback: () => void): void {
    this.onDisconnectCallback = callback
  }

  onError(callback: (error: Error) => void): void {
    this.onErrorCallback = callback
  }

  /**
   * Destroy device and cleanup
   */
  destroy(): void {
    if (this.device) {
      this.device.destroy()
      this.device = null
      console.log('[Twilio Device] Destroyed')
    }
    this.currentConnection = null
  }

  /**
   * Check if device is ready
   */
  isReady(): boolean {
    return this.device !== null && this.device.state === Device.State.Registered
  }

  /**
   * Get device state
   */
  getDeviceState(): string {
    return this.device?.state || 'uninitialized'
  }
}

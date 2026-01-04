export class WebRTCService {
  private peerConnection: RTCPeerConnection | null = null
  private localStream: MediaStream | null = null
  private remoteStream: MediaStream | null = null
  private isMutedState: boolean = false

  private configuration: RTCConfiguration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
    ],
  }

  // Callbacks
  private onIceCandidateCallback?: (candidate: RTCIceCandidate) => void
  private onTrackCallback?: (stream: MediaStream) => void
  private onConnectionStateChangeCallback?: (state: RTCPeerConnectionState) => void

  /**
   * Get user media (microphone access)
   */
  async getUserMedia(): Promise<MediaStream> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      this.localStream = stream
      console.log('Got user media:', stream.getAudioTracks().length, 'audio tracks')
      return stream
    } catch (error) {
      console.error('Error getting user media:', error)

      if (error instanceof DOMException) {
        if (error.name === 'NotAllowedError') {
          throw new Error('Microphone access denied. Please allow microphone access in browser settings.')
        } else if (error.name === 'NotFoundError') {
          throw new Error('No microphone found. Please connect a microphone.')
        } else if (error.name === 'NotReadableError') {
          throw new Error('Microphone is already in use by another application.')
        }
      }
      throw new Error('Failed to access microphone')
    }
  }

  /**
   * Create peer connection
   */
  createPeerConnection(): void {
    if (this.peerConnection) {
      console.warn('Peer connection already exists, closing old one')
      this.peerConnection.close()
    }

    this.peerConnection = new RTCPeerConnection(this.configuration)
    console.log('Created peer connection')

    // Add local stream tracks to peer connection
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        this.peerConnection!.addTrack(track, this.localStream!)
        console.log('Added local track to peer connection:', track.kind)
      })
    }

    // Handle ICE candidates
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate && this.onIceCandidateCallback) {
        console.log('ICE candidate generated')
        this.onIceCandidateCallback(event.candidate)
      }
    }

    // Handle remote tracks
    this.peerConnection.ontrack = (event) => {
      console.log('Remote track received:', event.streams.length, 'streams')
      if (event.streams && event.streams[0]) {
        this.remoteStream = event.streams[0]
        if (this.onTrackCallback) {
          this.onTrackCallback(this.remoteStream)
        }
      }
    }

    // Monitor connection state
    this.peerConnection.onconnectionstatechange = () => {
      const state = this.peerConnection?.connectionState
      console.log('Connection state:', state)

      if (this.onConnectionStateChangeCallback && state) {
        this.onConnectionStateChangeCallback(state)
      }

      if (state === 'failed') {
        console.error('WebRTC connection failed')
      } else if (state === 'connected') {
        console.log('WebRTC connection established')
      }
    }

    // Monitor ICE connection state
    this.peerConnection.oniceconnectionstatechange = () => {
      console.log('ICE connection state:', this.peerConnection?.iceConnectionState)
    }
  }

  /**
   * Create offer (caller side)
   */
  async createOffer(): Promise<RTCSessionDescriptionInit> {
    if (!this.peerConnection) {
      throw new Error('Peer connection not initialized')
    }

    try {
      const offer = await this.peerConnection.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: false,
      })

      await this.peerConnection.setLocalDescription(offer)
      console.log('Created and set local offer')

      return offer
    } catch (error) {
      console.error('Error creating offer:', error)
      throw new Error('Failed to create offer')
    }
  }

  /**
   * Create answer (callee side)
   */
  async createAnswer(offer: RTCSessionDescriptionInit): Promise<RTCSessionDescriptionInit> {
    if (!this.peerConnection) {
      throw new Error('Peer connection not initialized')
    }

    try {
      // Set remote description (the offer)
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer))
      console.log('Set remote offer')

      // Create answer
      const answer = await this.peerConnection.createAnswer()

      await this.peerConnection.setLocalDescription(answer)
      console.log('Created and set local answer')

      return answer
    } catch (error) {
      console.error('Error creating answer:', error)
      throw new Error('Failed to create answer')
    }
  }

  /**
   * Set remote description
   */
  async setRemoteDescription(description: RTCSessionDescriptionInit): Promise<void> {
    if (!this.peerConnection) {
      throw new Error('Peer connection not initialized')
    }

    try {
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(description))
      console.log('Set remote description:', description.type)
    } catch (error) {
      console.error('Error setting remote description:', error)
      throw new Error('Failed to set remote description')
    }
  }

  /**
   * Add ICE candidate
   */
  async addIceCandidate(candidate: RTCIceCandidateInit): Promise<void> {
    if (!this.peerConnection) {
      console.warn('Peer connection not initialized, cannot add ICE candidate')
      return
    }

    try {
      await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate))
      console.log('Added ICE candidate')
    } catch (error) {
      console.error('Error adding ICE candidate:', error)
      // Don't throw - ICE candidates can fail gracefully
    }
  }

  /**
   * Close connection and cleanup
   */
  close(): void {
    console.log('Closing WebRTC service')

    // Stop all local stream tracks
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        track.stop()
        console.log('Stopped local track:', track.kind)
      })
      this.localStream = null
    }

    // Close peer connection
    if (this.peerConnection) {
      this.peerConnection.close()
      this.peerConnection = null
    }

    this.remoteStream = null
    this.isMutedState = false
  }

  /**
   * Register ICE candidate callback
   */
  onIceCandidate(callback: (candidate: RTCIceCandidate) => void): void {
    this.onIceCandidateCallback = callback
  }

  /**
   * Register track callback
   */
  onTrack(callback: (stream: MediaStream) => void): void {
    this.onTrackCallback = callback
  }

  /**
   * Register connection state change callback
   */
  onConnectionStateChange(callback: (state: RTCPeerConnectionState) => void): void {
    this.onConnectionStateChangeCallback = callback
  }

  /**
   * Get local stream
   */
  getLocalStream(): MediaStream | null {
    return this.localStream
  }

  /**
   * Get remote stream
   */
  getRemoteStream(): MediaStream | null {
    return this.remoteStream
  }

  /**
   * Toggle mute
   */
  toggleMute(): boolean {
    if (!this.localStream) {
      return false
    }

    const audioTracks = this.localStream.getAudioTracks()
    if (audioTracks.length === 0) {
      return false
    }

    this.isMutedState = !this.isMutedState
    audioTracks.forEach((track) => {
      track.enabled = !this.isMutedState
    })

    console.log('Mute toggled:', this.isMutedState ? 'muted' : 'unmuted')
    return this.isMutedState
  }

  /**
   * Check if muted
   */
  isMuted(): boolean {
    return this.isMutedState
  }
}

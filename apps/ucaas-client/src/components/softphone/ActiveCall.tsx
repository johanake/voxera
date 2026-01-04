import { useState, useEffect, useRef } from 'react'
import type { FC } from 'react'
import { useSoftphone } from '../../contexts/SoftphoneContext'

const ActiveCall: FC = () => {
  const { currentCall, callState, isMuted, endCall, toggleMute, localStreamRef, remoteStreamRef } = useSoftphone()
  const [callDuration, setCallDuration] = useState(0)
  const localAudioRef = useRef<HTMLAudioElement>(null)
  const remoteAudioRef = useRef<HTMLAudioElement>(null)

  // Connect local stream to audio element
  useEffect(() => {
    if (localAudioRef.current && localStreamRef.current) {
      localAudioRef.current.srcObject = localStreamRef.current
    }
  }, [localStreamRef.current])

  // Connect remote stream to audio element
  useEffect(() => {
    if (remoteAudioRef.current && remoteStreamRef.current) {
      remoteAudioRef.current.srcObject = remoteStreamRef.current
    }
  }, [remoteStreamRef.current])

  // Call duration timer
  useEffect(() => {
    if (callState !== 'connected') {
      setCallDuration(0)
      return
    }

    const interval = setInterval(() => {
      setCallDuration((prev) => prev + 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [callState])

  if (!currentCall) return null

  const contactName = currentCall.direction === 'outbound' ? currentCall.toName : currentCall.fromName
  const contactExtension = currentCall.direction === 'outbound' ? currentCall.toExtension : currentCall.fromExtension

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const getStateText = (): string => {
    switch (callState) {
      case 'dialing':
        return 'Calling...'
      case 'ringing':
        return 'Ringing...'
      case 'connecting':
        return 'Connecting...'
      case 'connected':
        return formatDuration(callDuration)
      default:
        return ''
    }
  }

  // Get initials from name
  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-8">
      {/* Contact Avatar */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-3xl font-bold mb-4">
          {getInitials(contactName)}
        </div>
        <h2 className="text-2xl font-bold text-gray-900">{contactName || 'Unknown'}</h2>
        <p className="text-lg text-gray-600 font-mono">Extension: {contactExtension}</p>
      </div>

      {/* Call State */}
      <div className="text-center mb-8">
        <p className="text-xl font-semibold text-gray-700">{getStateText()}</p>
        {callState !== 'connected' && (
          <div className="mt-4 flex justify-center">
            <div className="flex space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
      </div>

      {/* Call Controls */}
      <div className="flex justify-center space-x-4">
        <button
          onClick={toggleMute}
          className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${
            isMuted
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
          }`}
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
            </svg>
          )}
        </button>

        <button
          onClick={endCall}
          className="w-16 h-16 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors"
          title="End Call"
        >
          <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
          </svg>
        </button>
      </div>

      {/* Hidden Audio Elements */}
      <audio ref={localAudioRef} autoPlay muted />
      <audio ref={remoteAudioRef} autoPlay />
    </div>
  )
}

export default ActiveCall

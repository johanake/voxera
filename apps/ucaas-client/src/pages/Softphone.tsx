import type { FC } from 'react'
import { useSoftphone } from '../contexts/SoftphoneContext'
import { useAuth } from '../contexts/AuthContext'
import Dialer from '../components/softphone/Dialer'
import ActiveCall from '../components/softphone/ActiveCall'
import IncomingCall from '../components/softphone/IncomingCall'
import CallHistory from '../components/softphone/CallHistory'

const Softphone: FC = () => {
  const { currentUser } = useAuth()
  const { callState, error, clearError } = useSoftphone()

  // Check if user has extension
  if (!currentUser?.extension) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-start">
            <svg className="w-6 h-6 text-yellow-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Extension Not Assigned</h3>
              <p className="mt-1 text-sm text-yellow-700">
                You do not have an extension assigned. Please contact your administrator to get an extension number.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Softphone</h1>
        <p className="mt-2 text-gray-600">
          Your extension: <span className="font-mono font-semibold text-gray-900">{currentUser.extension}</span>
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex justify-between items-start">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-red-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
            </div>
            <button
              onClick={clearError}
              className="text-red-600 hover:text-red-800 transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Main Content - State-based rendering */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Dialer or Active Call */}
        <div className="lg:col-span-2">
          {callState === 'idle' && <Dialer />}
          {['dialing', 'connecting', 'connected'].includes(callState) && <ActiveCall />}
        </div>

        {/* Right: Call History */}
        <div>
          <CallHistory />
        </div>
      </div>

      {/* Incoming Call Modal */}
      {callState === 'ringing' && <IncomingCall />}
    </div>
  )
}

export default Softphone

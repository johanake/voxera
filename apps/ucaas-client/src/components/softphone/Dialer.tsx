import { useState } from 'react'
import type { FC } from 'react'
import { useSoftphone } from '../../contexts/SoftphoneContext'
import { useAuth } from '../../contexts/AuthContext'

const Dialer: FC = () => {
  const { currentUser } = useAuth()
  const { initiateCall } = useSoftphone()
  const [dialedNumber, setDialedNumber] = useState('')

  const handleDigit = (digit: string) => {
    if (dialedNumber.length < 5) {
      setDialedNumber(dialedNumber + digit)
    }
  }

  const handleBackspace = () => {
    setDialedNumber(dialedNumber.slice(0, -1))
  }

  const handleCall = () => {
    if (dialedNumber.length >= 3) {
      initiateCall(dialedNumber)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && dialedNumber.length >= 3) {
      handleCall()
    }
  }

  const isValidExtension = dialedNumber.length >= 3 && dialedNumber.length <= 5

  const dialpadButtons = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['*', '0', '#'],
  ]

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      {/* Your Extension */}
      <div className="mb-6 text-center">
        <p className="text-sm text-gray-600">Your Extension</p>
        <p className="text-2xl font-bold text-gray-900 font-mono">{currentUser?.extension || 'N/A'}</p>
      </div>

      {/* Input Display */}
      <div className="mb-6">
        <input
          type="text"
          value={dialedNumber}
          onChange={(e) => {
            const value = e.target.value.replace(/[^0-9*#]/g, '')
            if (value.length <= 5) {
              setDialedNumber(value)
            }
          }}
          onKeyPress={handleKeyPress}
          placeholder="Enter extension"
          className="w-full px-4 py-3 text-center text-2xl font-mono border-2 border-gray-300 rounded-lg focus:outline-none focus:border-primary-300"
        />
        <p className="mt-2 text-xs text-gray-500 text-center">
          {isValidExtension ? 'Ready to call' : 'Enter 3-5 digits'}
        </p>
      </div>

      {/* Dial Pad */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {dialpadButtons.map((row, rowIndex) => (
          row.map((digit) => (
            <button
              key={`${rowIndex}-${digit}`}
              onClick={() => handleDigit(digit)}
              className="aspect-square flex items-center justify-center text-2xl font-semibold bg-gray-100 hover:bg-gray-200 active:bg-gray-300 rounded-lg transition-colors"
            >
              {digit}
            </button>
          ))
        ))}
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={handleBackspace}
          disabled={dialedNumber.length === 0}
          className="py-3 px-4 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 text-gray-700 font-medium rounded-lg transition-colors"
        >
          ← Backspace
        </button>
        <button
          onClick={handleCall}
          disabled={!isValidExtension}
          className="py-3 px-4 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:text-gray-400 text-white font-medium rounded-lg transition-colors flex items-center justify-center space-x-2"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
          </svg>
          <span>Call</span>
        </button>
      </div>
    </div>
  )
}

export default Dialer

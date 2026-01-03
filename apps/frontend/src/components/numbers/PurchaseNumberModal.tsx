import { useState } from 'react'
import type { PhoneNumber, PhoneNumberType } from '@ucaas/shared'
import { Modal, Button, Select, Input, Badge } from '../ui'

interface AvailableNumber {
  number: string
  type: PhoneNumberType
  country: string
  region: string
  monthlyFee: number
  setupFee: number
  currency: string
  features: string[]
}

// Mock available numbers
const mockAvailableNumbers: AvailableNumber[] = [
  {
    number: '+46 70 555 1111',
    type: 'mobile',
    country: 'SE',
    region: 'Stockholm',
    monthlyFee: 49,
    setupFee: 0,
    currency: 'SEK',
    features: ['SMS capable', 'Voice', 'MMS'],
  },
  {
    number: '+46 70 555 2222',
    type: 'mobile',
    country: 'SE',
    region: 'Stockholm',
    monthlyFee: 49,
    setupFee: 0,
    currency: 'SEK',
    features: ['SMS capable', 'Voice', 'MMS'],
  },
  {
    number: '+46 8 555 3333',
    type: 'geographic',
    country: 'SE',
    region: 'Stockholm',
    monthlyFee: 99,
    setupFee: 50,
    currency: 'SEK',
    features: ['Voice', 'Call forwarding'],
  },
  {
    number: '+46 31 555 4444',
    type: 'geographic',
    country: 'SE',
    region: 'Gothenburg',
    monthlyFee: 99,
    setupFee: 50,
    currency: 'SEK',
    features: ['Voice', 'Call forwarding'],
  },
  {
    number: '+46 20 555 5555',
    type: 'toll-free',
    country: 'SE',
    region: 'National',
    monthlyFee: 199,
    setupFee: 100,
    currency: 'SEK',
    features: ['Voice', 'Call forwarding', 'Call recording', 'Analytics'],
  },
]

interface PurchaseNumberModalProps {
  isOpen: boolean
  onClose: () => void
  onPurchase: (numbers: PhoneNumber[]) => void
}

type Step = 'search' | 'select' | 'confirm'

const PurchaseNumberModal = ({ isOpen, onClose, onPurchase }: PurchaseNumberModalProps) => {
  const [step, setStep] = useState<Step>('search')
  const [country, setCountry] = useState('SE')
  const [numberType, setNumberType] = useState<PhoneNumberType | 'all'>('all')
  const [region, setRegion] = useState('')
  const [pattern, setPattern] = useState('')
  const [selectedNumber, setSelectedNumber] = useState<AvailableNumber | null>(null)
  const [availableNumbers, setAvailableNumbers] = useState<AvailableNumber[]>([])

  const handleSearch = () => {
    // Filter mock numbers based on criteria
    const filtered = mockAvailableNumbers.filter(num => {
      const matchesCountry = num.country === country
      const matchesType = numberType === 'all' || num.type === numberType
      const matchesRegion = !region || num.region.toLowerCase().includes(region.toLowerCase())
      const matchesPattern = !pattern || num.number.includes(pattern)

      return matchesCountry && matchesType && matchesRegion && matchesPattern
    })

    setAvailableNumbers(filtered)
    setStep('select')
  }

  const handleNumberSelect = (number: AvailableNumber) => {
    setSelectedNumber(number)
    setStep('confirm')
  }

  const handleConfirm = () => {
    if (!selectedNumber) return

    const newNumber: PhoneNumber = {
      id: `num-new-${Date.now()}`,
      customerId: 'cust-1',
      number: selectedNumber.number,
      type: selectedNumber.type,
      status: 'reserved',
      country: selectedNumber.country,
      region: selectedNumber.region,
      assignmentType: 'unassigned',
      monthlyFee: selectedNumber.monthlyFee,
      currency: selectedNumber.currency,
      purchasedAt: new Date(),
    }

    onPurchase([newNumber])
    handleClose()
  }

  const handleClose = () => {
    setStep('search')
    setCountry('SE')
    setNumberType('all')
    setRegion('')
    setPattern('')
    setSelectedNumber(null)
    setAvailableNumbers([])
    onClose()
  }

  const getTypeIcon = (type: PhoneNumberType) => {
    const icons: Record<PhoneNumberType, JSX.Element> = {
      mobile: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ),
      geographic: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        </svg>
      ),
      'toll-free': (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      ),
      national: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      ),
      premium: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      ),
    }
    return icons[type]
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Purchase Phone Number" size="xl">
      {/* Step 1: Search Criteria */}
      {step === 'search' && (
        <div>
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              Search for available phone numbers by specifying your criteria below.
            </p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                options={[
                  { value: 'SE', label: 'Sweden (+46)' },
                  { value: 'NO', label: 'Norway (+47)' },
                  { value: 'DK', label: 'Denmark (+45)' },
                  { value: 'FI', label: 'Finland (+358)' },
                ]}
              />

              <Select
                label="Number Type"
                value={numberType}
                onChange={(e) => setNumberType(e.target.value as PhoneNumberType | 'all')}
                options={[
                  { value: 'all', label: 'All Types' },
                  { value: 'mobile', label: 'Mobile' },
                  { value: 'geographic', label: 'Geographic (Landline)' },
                  { value: 'toll-free', label: 'Toll-Free' },
                  { value: 'national', label: 'National' },
                  { value: 'premium', label: 'Premium' },
                ]}
              />
            </div>

            <Input
              label="Region (Optional)"
              placeholder="e.g., Stockholm, Gothenburg"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
            />

            <Input
              label="Number Pattern (Optional)"
              placeholder="e.g., 555 for numbers containing '555'"
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
            />
          </div>

          <div className="mt-6 flex items-center justify-end space-x-3">
            <Button variant="secondary" onClick={handleClose}>
              Cancel
            </Button>
            <Button onClick={handleSearch}>
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Search Numbers
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Select Number */}
      {step === 'select' && (
        <div>
          <div className="mb-4">
            <Button variant="ghost" size="sm" onClick={() => setStep('search')}>
              ← Back to search
            </Button>
            <h3 className="text-lg font-medium text-gray-900 mt-2">
              {availableNumbers.length} Available {availableNumbers.length === 1 ? 'Number' : 'Numbers'}
            </h3>
            <p className="text-sm text-gray-600">Select a number to purchase</p>
          </div>

          {availableNumbers.length === 0 ? (
            <div className="py-12 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No numbers found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Try adjusting your search criteria.
              </p>
              <div className="mt-6">
                <Button onClick={() => setStep('search')}>
                  Modify Search
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {availableNumbers.map((num, index) => (
                <div
                  key={index}
                  onClick={() => handleNumberSelect(num)}
                  className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                        {getTypeIcon(num.type)}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="font-medium text-gray-900">{num.number}</p>
                          <Badge variant="info" size="sm">{num.type}</Badge>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">{num.region}, {num.country}</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {num.features.map(feature => (
                            <Badge key={feature} variant="gray" size="sm">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">{num.monthlyFee} {num.currency}/mo</p>
                      {num.setupFee > 0 && (
                        <p className="text-xs text-gray-500">+ {num.setupFee} {num.currency} setup</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step 3: Confirm */}
      {step === 'confirm' && selectedNumber && (
        <div>
          <div className="mb-4">
            <Button variant="ghost" size="sm" onClick={() => setStep('select')}>
              ← Back to results
            </Button>
          </div>

          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900">Selected Number</h4>
              <div className="flex items-center space-x-2 mt-2">
                <p className="text-lg font-bold text-blue-700">{selectedNumber.number}</p>
                <Badge variant="info">{selectedNumber.type}</Badge>
              </div>
              <p className="text-sm text-blue-600 mt-1">
                {selectedNumber.region}, {selectedNumber.country}
              </p>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">Features</h4>
              <div className="flex flex-wrap gap-2">
                {selectedNumber.features.map(feature => (
                  <Badge key={feature} variant="gray">
                    {feature}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <h4 className="font-medium text-gray-900 mb-3">Price Summary</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Monthly recurring:</span>
                  <span className="font-medium">
                    {selectedNumber.monthlyFee} {selectedNumber.currency}
                  </span>
                </div>
                {selectedNumber.setupFee > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">One-time setup fee:</span>
                    <span className="font-medium">
                      {selectedNumber.setupFee} {selectedNumber.currency}
                    </span>
                  </div>
                )}
                <div className="border-t border-gray-200 pt-2 flex justify-between">
                  <span className="font-medium text-gray-900">Total first month:</span>
                  <span className="text-lg font-bold text-gray-900">
                    {selectedNumber.monthlyFee + selectedNumber.setupFee} {selectedNumber.currency}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-sm text-gray-700">
                The number will be reserved in your inventory as <strong>unassigned</strong>. You can assign it to a user, PBX, or IVR after purchase.
              </p>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end space-x-3">
            <Button variant="secondary" onClick={handleClose}>
              Cancel
            </Button>
            <Button onClick={handleConfirm}>
              Purchase Number
            </Button>
          </div>
        </div>
      )}
    </Modal>
  )
}

export default PurchaseNumberModal

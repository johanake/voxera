import { useState } from 'react'
import type { PhoneNumber, PortingRequest } from '@ucaas/shared'
import { Modal, Button, Input, Select } from '../ui'

interface PortInNumberModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (number: PhoneNumber, portingRequest: PortingRequest) => void
}

type Step = 'number-details' | 'provider-info' | 'documents' | 'review'

const PortInNumberModal = ({ isOpen, onClose, onSubmit }: PortInNumberModalProps) => {
  const [step, setStep] = useState<Step>('number-details')

  // Form state
  const [phoneNumber, setPhoneNumber] = useState('')
  const [country, setCountry] = useState('SE')
  const [currentProvider, setCurrentProvider] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [pin, setPin] = useState('')
  const [desiredDate, setDesiredDate] = useState('')
  const [documentFiles, setDocumentFiles] = useState<string[]>([])

  // Validation
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateNumberDetails = () => {
    const newErrors: Record<string, string> = {}

    if (!phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required'
    } else if (!/^\+?[\d\s-()]+$/.test(phoneNumber)) {
      newErrors.phoneNumber = 'Invalid phone number format'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateProviderInfo = () => {
    const newErrors: Record<string, string> = {}

    if (!currentProvider.trim()) {
      newErrors.currentProvider = 'Current provider is required'
    }

    if (!accountNumber.trim()) {
      newErrors.accountNumber = 'Account number is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNextFromNumberDetails = () => {
    if (validateNumberDetails()) {
      setStep('provider-info')
    }
  }

  const handleNextFromProviderInfo = () => {
    if (validateProviderInfo()) {
      setStep('documents')
    }
  }

  const handleNextFromDocuments = () => {
    setStep('review')
  }

  const handleSubmit = () => {
    const portingRequest: PortingRequest = {
      id: `port-${Date.now()}`,
      customerId: 'cust-1',
      phoneNumber,
      currentProvider,
      accountNumber,
      pin: pin || undefined,
      status: 'pending',
      requestedDate: new Date(),
      scheduledDate: desiredDate ? new Date(desiredDate) : undefined,
      documents: documentFiles.length > 0 ? documentFiles : undefined,
    }

    const newNumber: PhoneNumber = {
      id: `num-port-${Date.now()}`,
      customerId: 'cust-1',
      number: phoneNumber,
      type: 'mobile', // Would be determined by number analysis
      status: 'porting',
      country,
      assignmentType: 'unassigned',
      monthlyFee: 49, // Would come from pricing
      currency: 'SEK',
      portingRequestId: portingRequest.id,
    }

    onSubmit(newNumber, portingRequest)
    handleClose()
  }

  const handleClose = () => {
    setStep('number-details')
    setPhoneNumber('')
    setCountry('SE')
    setCurrentProvider('')
    setAccountNumber('')
    setPin('')
    setDesiredDate('')
    setDocumentFiles([])
    setErrors({})
    onClose()
  }

  const handleFileUpload = () => {
    // Simulate file upload
    const fileName = `document-${documentFiles.length + 1}.pdf`
    setDocumentFiles([...documentFiles, fileName])
  }

  const removeDocument = (index: number) => {
    setDocumentFiles(documentFiles.filter((_, i) => i !== index))
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Port-In Phone Number" size="lg">
      {/* Progress Indicator */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          {['Number', 'Provider', 'Documents', 'Review'].map((label, index) => {
            const stepIndex = ['number-details', 'provider-info', 'documents', 'review'].indexOf(step)
            const isActive = index === stepIndex
            const isCompleted = index < stepIndex

            return (
              <div key={label} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  isCompleted ? 'bg-green-600' : isActive ? 'bg-blue-600' : 'bg-gray-300'
                } text-white text-sm font-medium`}>
                  {isCompleted ? '✓' : index + 1}
                </div>
                <span className={`ml-2 text-sm ${isActive ? 'font-medium text-gray-900' : 'text-gray-500'}`}>
                  {label}
                </span>
                {index < 3 && (
                  <div className={`w-8 h-0.5 mx-2 ${isCompleted ? 'bg-green-600' : 'bg-gray-300'}`} />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Step 1: Number Details */}
      {step === 'number-details' && (
        <div>
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              Enter the phone number you want to port to Voxera.
            </p>
          </div>

          <div className="space-y-4">
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

            <Input
              label="Phone Number"
              placeholder="+46 70 123 4567"
              value={phoneNumber}
              onChange={(e) => {
                setPhoneNumber(e.target.value)
                if (errors.phoneNumber) {
                  setErrors({ ...errors, phoneNumber: '' })
                }
              }}
              error={errors.phoneNumber}
            />

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 text-sm">Important Information</h4>
              <ul className="mt-2 space-y-1 text-xs text-blue-700">
                <li>• Porting typically takes 1-5 business days</li>
                <li>• Your service with the current provider will remain active until porting is complete</li>
                <li>• Make sure you have authorization to port this number</li>
              </ul>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end space-x-3">
            <Button variant="secondary" onClick={handleClose}>
              Cancel
            </Button>
            <Button onClick={handleNextFromNumberDetails}>
              Next: Provider Info
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Provider Information */}
      {step === 'provider-info' && (
        <div>
          <div className="mb-4">
            <Button variant="ghost" size="sm" onClick={() => setStep('number-details')}>
              ← Back
            </Button>
            <p className="text-sm text-gray-600 mt-2">
              Provide information about your current service provider.
            </p>
          </div>

          <div className="space-y-4">
            <Input
              label="Current Provider"
              placeholder="e.g., Telia, Telenor, Three"
              value={currentProvider}
              onChange={(e) => {
                setCurrentProvider(e.target.value)
                if (errors.currentProvider) {
                  setErrors({ ...errors, currentProvider: '' })
                }
              }}
              error={errors.currentProvider}
            />

            <Input
              label="Account Number"
              placeholder="Your account number with current provider"
              value={accountNumber}
              onChange={(e) => {
                setAccountNumber(e.target.value)
                if (errors.accountNumber) {
                  setErrors({ ...errors, accountNumber: '' })
                }
              }}
              error={errors.accountNumber}
            />

            <Input
              label="PIN / Account Password (Optional)"
              placeholder="If required by your provider"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              type="password"
            />

            <Input
              label="Desired Porting Date (Optional)"
              type="date"
              value={desiredDate}
              onChange={(e) => setDesiredDate(e.target.value)}
            />
          </div>

          <div className="mt-6 flex items-center justify-end space-x-3">
            <Button variant="secondary" onClick={() => setStep('number-details')}>
              Back
            </Button>
            <Button onClick={handleNextFromProviderInfo}>
              Next: Documents
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Documents */}
      {step === 'documents' && (
        <div>
          <div className="mb-4">
            <Button variant="ghost" size="sm" onClick={() => setStep('provider-info')}>
              ← Back
            </Button>
            <p className="text-sm text-gray-600 mt-2">
              Upload supporting documents (bill, authorization letter, etc.)
            </p>
          </div>

          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              <div className="text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <div className="mt-4">
                  <Button onClick={handleFileUpload}>
                    Upload Document
                  </Button>
                  <p className="mt-2 text-xs text-gray-500">
                    PDF, JPEG, or PNG up to 10MB
                  </p>
                </div>
              </div>
            </div>

            {documentFiles.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900 text-sm">Uploaded Documents</h4>
                {documentFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="text-sm text-gray-700">{file}</span>
                    </div>
                    <button
                      onClick={() => removeDocument(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-xs text-gray-700">
                <strong>Note:</strong> Documents are optional but may speed up the porting process. Common documents include:
                recent bill from current provider, letter of authorization (LOA), or proof of account ownership.
              </p>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end space-x-3">
            <Button variant="secondary" onClick={() => setStep('provider-info')}>
              Back
            </Button>
            <Button onClick={handleNextFromDocuments}>
              Next: Review
            </Button>
          </div>
        </div>
      )}

      {/* Step 4: Review */}
      {step === 'review' && (
        <div>
          <div className="mb-4">
            <Button variant="ghost" size="sm" onClick={() => setStep('documents')}>
              ← Back
            </Button>
            <p className="text-sm text-gray-600 mt-2">
              Review your porting request before submission.
            </p>
          </div>

          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900">Phone Number</h4>
              <p className="text-lg font-bold text-blue-700 mt-1">{phoneNumber}</p>
              <p className="text-sm text-blue-600">Country: {country}</p>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Provider Information</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Current Provider:</span>
                  <span className="font-medium">{currentProvider}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Account Number:</span>
                  <span className="font-medium">{accountNumber}</span>
                </div>
                {pin && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">PIN:</span>
                    <span className="font-medium">••••••</span>
                  </div>
                )}
                {desiredDate && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Desired Date:</span>
                    <span className="font-medium">{new Date(desiredDate).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>

            {documentFiles.length > 0 && (
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Documents</h4>
                <ul className="space-y-1">
                  {documentFiles.map((file, index) => (
                    <li key={index} className="text-sm text-gray-600">• {file}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-medium text-yellow-900 text-sm">What Happens Next?</h4>
              <ul className="mt-2 space-y-1 text-xs text-yellow-700">
                <li>1. We'll verify your information and contact your current provider</li>
                <li>2. You'll receive updates via email as the porting progresses</li>
                <li>3. Your number will remain active with your current provider until porting is complete</li>
                <li>4. Once complete, your number will be activated on the Voxera network</li>
              </ul>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end space-x-3">
            <Button variant="secondary" onClick={handleClose}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              Submit Porting Request
            </Button>
          </div>
        </div>
      )}
    </Modal>
  )
}

export default PortInNumberModal

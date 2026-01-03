import { useState } from 'react'
import type { Bundle, BundleTier, License } from '@ucaas/shared'
import { Modal, Button, Badge } from '../ui'

// Mock bundles
const mockBundles: Bundle[] = [
  {
    id: 'bundle-1',
    tenantId: 'tenant-1',
    name: 'Mobile Professional',
    description: 'Complete mobile solution with advanced features',
    category: 'mobile',
    status: 'active',
    isPublic: true,
    tiers: [
      {
        id: 'tier-free',
        name: 'Free',
        description: 'Basic mobile service',
        pricing: { monthlyFee: 0, setupFee: 0, currency: 'SEK' },
        capabilities: [
          { id: 'cap-1', name: '4G', type: 'feature', value: true },
          { id: 'cap-2', name: '5G', type: 'feature', value: false },
          { id: 'cap-3', name: 'VoLTE', type: 'feature', value: false },
        ],
        limits: { maxConcurrentCalls: 1, includedMinutes: 100, includedSMS: 50 },
        sortOrder: 1,
      },
      {
        id: 'tier-pro',
        name: 'Pro',
        description: 'Professional mobile service',
        pricing: { monthlyFee: 299, setupFee: 0, currency: 'SEK' },
        capabilities: [
          { id: 'cap-1', name: '4G', type: 'feature', value: true },
          { id: 'cap-2', name: '5G', type: 'feature', value: true },
          { id: 'cap-3', name: 'VoLTE', type: 'feature', value: true },
          { id: 'cap-4', name: 'Call Recording', type: 'feature', value: true },
        ],
        limits: { maxConcurrentCalls: 5, includedMinutes: 1000, includedSMS: 500 },
        sortOrder: 2,
      },
      {
        id: 'tier-premium',
        name: 'Premium',
        description: 'Premium mobile service with unlimited usage',
        pricing: { monthlyFee: 499, setupFee: 0, currency: 'SEK' },
        capabilities: [
          { id: 'cap-1', name: '4G', type: 'feature', value: true },
          { id: 'cap-2', name: '5G', type: 'feature', value: true },
          { id: 'cap-3', name: 'VoLTE', type: 'feature', value: true },
          { id: 'cap-4', name: 'Call Recording', type: 'feature', value: true },
          { id: 'cap-5', name: 'International Calling', type: 'feature', value: true },
        ],
        limits: {},
        sortOrder: 3,
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'bundle-2',
    tenantId: 'tenant-1',
    name: 'PBX Basic',
    description: 'Cloud PBX solution for businesses',
    category: 'pbx',
    status: 'active',
    isPublic: true,
    tiers: [
      {
        id: 'tier-basic',
        name: 'Basic',
        description: 'Essential PBX features',
        pricing: { monthlyFee: 199, setupFee: 0, currency: 'SEK' },
        capabilities: [
          { id: 'cap-1', name: 'Extensions', type: 'quota', value: 10 },
          { id: 'cap-2', name: 'Call Queues', type: 'feature', value: true },
          { id: 'cap-3', name: 'Voicemail', type: 'feature', value: true },
        ],
        limits: { maxConcurrentCalls: 10 },
        sortOrder: 1,
      },
      {
        id: 'tier-advanced',
        name: 'Advanced',
        description: 'Advanced PBX with all features',
        pricing: { monthlyFee: 399, setupFee: 0, currency: 'SEK' },
        capabilities: [
          { id: 'cap-1', name: 'Extensions', type: 'quota', value: 50 },
          { id: 'cap-2', name: 'Call Queues', type: 'feature', value: true },
          { id: 'cap-3', name: 'Voicemail', type: 'feature', value: true },
          { id: 'cap-4', name: 'Call Recording', type: 'feature', value: true },
          { id: 'cap-5', name: 'Analytics', type: 'feature', value: true },
        ],
        limits: { maxConcurrentCalls: 50 },
        sortOrder: 2,
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

interface PurchaseLicensesModalProps {
  isOpen: boolean
  onClose: () => void
  onPurchase: (licenses: License[]) => void
  currentLicenseCount: number
  licenseLimit: number
}

type Step = 'select-bundle' | 'select-tier' | 'confirm'

const PurchaseLicensesModal = ({
  isOpen,
  onClose,
  onPurchase,
  currentLicenseCount,
  licenseLimit,
}: PurchaseLicensesModalProps) => {
  const [step, setStep] = useState<Step>('select-bundle')
  const [selectedBundle, setSelectedBundle] = useState<Bundle | null>(null)
  const [selectedTier, setSelectedTier] = useState<BundleTier | null>(null)
  const [quantity, setQuantity] = useState(1)

  const maxQuantity = licenseLimit - currentLicenseCount

  const handleBundleSelect = (bundle: Bundle) => {
    setSelectedBundle(bundle)
    setStep('select-tier')
  }

  const handleTierSelect = (tier: BundleTier) => {
    setSelectedTier(tier)
    setStep('confirm')
  }

  const handleConfirm = () => {
    if (!selectedBundle || !selectedTier) return

    const newLicenses: License[] = Array.from({ length: quantity }, (_, i) => ({
      id: `lic-new-${Date.now()}-${i}`,
      customerId: 'cust-1',
      bundleId: selectedBundle.id,
      tierId: selectedTier.id,
      status: 'unassigned',
      bundleName: selectedBundle.name,
      tierName: selectedTier.name,
    }))

    onPurchase(newLicenses)
    handleClose()
  }

  const handleClose = () => {
    setStep('select-bundle')
    setSelectedBundle(null)
    setSelectedTier(null)
    setQuantity(1)
    onClose()
  }

  const getTotalCost = () => {
    if (!selectedTier) return { monthly: 0, setup: 0 }
    return {
      monthly: selectedTier.pricing.monthlyFee * quantity,
      setup: selectedTier.pricing.setupFee * quantity,
    }
  }

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, JSX.Element> = {
      mobile: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ),
      pbx: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
    }
    return icons[category] || icons.mobile
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Purchase Licenses" size="xl">
      {/* Step 1: Select Bundle */}
      {step === 'select-bundle' && (
        <div>
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              Select a bundle to purchase licenses from. You can purchase up to {maxQuantity} more licenses.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mockBundles.map(bundle => (
              <div
                key={bundle.id}
                onClick={() => handleBundleSelect(bundle)}
                className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition-colors"
              >
                <div className="flex items-start space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                    {getCategoryIcon(bundle.category)}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{bundle.name}</h4>
                    <p className="text-sm text-gray-500 mt-1">{bundle.description}</p>
                    <div className="mt-2">
                      <Badge variant="info" size="sm">
                        {bundle.tiers.length} tiers available
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Select Tier */}
      {step === 'select-tier' && selectedBundle && (
        <div>
          <div className="mb-4">
            <Button variant="ghost" size="sm" onClick={() => setStep('select-bundle')}>
              ← Back to bundles
            </Button>
            <h3 className="text-lg font-medium text-gray-900 mt-2">{selectedBundle.name}</h3>
            <p className="text-sm text-gray-600">{selectedBundle.description}</p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Feature</th>
                  {selectedBundle.tiers.map(tier => (
                    <th key={tier.id} className="px-4 py-3 text-center text-sm font-medium text-gray-900">
                      {tier.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr className="bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">Price</td>
                  {selectedBundle.tiers.map(tier => (
                    <td key={tier.id} className="px-4 py-3 text-center">
                      <div className="text-lg font-bold text-gray-900">
                        {tier.pricing.monthlyFee} {tier.pricing.currency}
                      </div>
                      <div className="text-xs text-gray-500">per month</div>
                    </td>
                  ))}
                </tr>
                {/* Features */}
                {['4G', '5G', 'VoLTE', 'Call Recording', 'International Calling', 'Extensions', 'Call Queues', 'Voicemail', 'Analytics'].map(featureName => {
                  const hasFeature = selectedBundle.tiers.some(tier =>
                    tier.capabilities.some(cap => cap.name === featureName)
                  )
                  if (!hasFeature) return null

                  return (
                    <tr key={featureName}>
                      <td className="px-4 py-3 text-sm text-gray-700">{featureName}</td>
                      {selectedBundle.tiers.map(tier => {
                        const cap = tier.capabilities.find(c => c.name === featureName)
                        return (
                          <td key={tier.id} className="px-4 py-3 text-center">
                            {cap ? (
                              typeof cap.value === 'boolean' ? (
                                cap.value ? '✓' : '✗'
                              ) : (
                                <span className="font-medium">{cap.value}</span>
                              )
                            ) : (
                              '✗'
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  )
                })}
                <tr>
                  <td className="px-4 py-3"></td>
                  {selectedBundle.tiers.map(tier => (
                    <td key={tier.id} className="px-4 py-3 text-center">
                      <Button onClick={() => handleTierSelect(tier)}>Select</Button>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Step 3: Confirm */}
      {step === 'confirm' && selectedBundle && selectedTier && (
        <div>
          <div className="mb-4">
            <Button variant="ghost" size="sm" onClick={() => setStep('select-tier')}>
              ← Back to tiers
            </Button>
          </div>

          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900">Selected License</h4>
              <p className="text-blue-700 mt-1">
                {selectedBundle.name} - {selectedTier.name}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity
              </label>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50"
                >
                  −
                </button>
                <input
                  type="number"
                  min="1"
                  max={maxQuantity}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.min(maxQuantity, Math.max(1, parseInt(e.target.value) || 1)))}
                  className="w-20 text-center border border-gray-300 rounded-lg px-3 py-2"
                />
                <button
                  onClick={() => setQuantity(Math.min(maxQuantity, quantity + 1))}
                  className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50"
                >
                  +
                </button>
                <span className="text-sm text-gray-500">
                  (max {maxQuantity} available)
                </span>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <h4 className="font-medium text-gray-900 mb-3">Price Summary</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Monthly fee per license:</span>
                  <span className="font-medium">
                    {selectedTier.pricing.monthlyFee} {selectedTier.pricing.currency}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Quantity:</span>
                  <span className="font-medium">× {quantity}</span>
                </div>
                <div className="border-t border-gray-200 pt-2 flex justify-between">
                  <span className="font-medium text-gray-900">Total monthly recurring:</span>
                  <span className="text-lg font-bold text-gray-900">
                    {getTotalCost().monthly} {selectedTier.pricing.currency}
                  </span>
                </div>
                {getTotalCost().setup > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">One-time setup fee:</span>
                    <span className="font-medium">
                      {getTotalCost().setup} {selectedTier.pricing.currency}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-sm text-gray-700">
                ℹ️ Licenses will be added to your inventory as <strong>unassigned</strong>. You can assign them to users after purchase.
              </p>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end space-x-3">
            <Button variant="secondary" onClick={handleClose}>
              Cancel
            </Button>
            <Button onClick={handleConfirm}>
              Purchase {quantity} {quantity === 1 ? 'License' : 'Licenses'}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  )
}

export default PurchaseLicensesModal

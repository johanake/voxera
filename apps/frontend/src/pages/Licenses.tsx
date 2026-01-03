import { useState } from 'react'
import type { License, LicenseStatus, User } from '@ucaas/shared'
import { Button, Input, Select, Badge, Card } from '../components/ui'
import PurchaseLicensesModal from '../components/licenses/PurchaseLicensesModal'
import AssignLicenseModal from '../components/licenses/AssignLicenseModal'

// Mock data
const mockLicenses: License[] = [
  {
    id: 'lic-1',
    customerId: 'cust-1',
    bundleId: 'bundle-1',
    tierId: 'tier-pro',
    userId: 'user-1',
    status: 'active',
    bundleName: 'Mobile Professional',
    tierName: 'Pro',
    activatedAt: new Date('2024-01-10'),
  },
  {
    id: 'lic-2',
    customerId: 'cust-1',
    bundleId: 'bundle-1',
    tierId: 'tier-pro',
    userId: 'user-2',
    status: 'active',
    bundleName: 'Mobile Professional',
    tierName: 'Pro',
    activatedAt: new Date('2024-01-10'),
  },
  {
    id: 'lic-3',
    customerId: 'cust-1',
    bundleId: 'bundle-1',
    tierId: 'tier-pro',
    status: 'unassigned',
    bundleName: 'Mobile Professional',
    tierName: 'Pro',
  },
  {
    id: 'lic-4',
    customerId: 'cust-1',
    bundleId: 'bundle-2',
    tierId: 'tier-basic',
    userId: 'user-1',
    status: 'active',
    bundleName: 'PBX Basic',
    tierName: 'Basic',
    activatedAt: new Date('2024-01-12'),
  },
  {
    id: 'lic-5',
    customerId: 'cust-1',
    bundleId: 'bundle-1',
    tierId: 'tier-free',
    status: 'unassigned',
    bundleName: 'Mobile Professional',
    tierName: 'Free',
  },
]

const mockUsers: User[] = [
  {
    id: 'user-1',
    customerId: 'cust-1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@acme.com',
    role: 'customer_admin',
    status: 'active',
    preferences: {
      emailNotifications: true,
      smsNotifications: false,
      newLicenseAssigned: true,
      numberPortingUpdates: true,
    },
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'system',
  },
  {
    id: 'user-2',
    customerId: 'cust-1',
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane@acme.com',
    role: 'user',
    status: 'active',
    preferences: {
      emailNotifications: true,
      smsNotifications: true,
      newLicenseAssigned: true,
      numberPortingUpdates: false,
    },
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'system',
  },
]

const Licenses = () => {
  const [licenses, setLicenses] = useState<License[]>(mockLicenses)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<LicenseStatus | 'all'>('all')
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false)
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false)
  const [selectedLicense, setSelectedLicense] = useState<License | null>(null)

  // Filter licenses
  const filteredLicenses = licenses.filter(license => {
    const matchesSearch =
      license.bundleName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      license.tierName?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === 'all' || license.status === statusFilter

    return matchesSearch && matchesStatus
  })

  // Group by bundle and tier
  const groupedLicenses = filteredLicenses.reduce((acc, license) => {
    const key = `${license.bundleName} - ${license.tierName}`
    if (!acc[key]) {
      acc[key] = {
        bundleName: license.bundleName || '',
        tierName: license.tierName || '',
        licenses: [],
      }
    }
    acc[key].licenses.push(license)
    return acc
  }, {} as Record<string, { bundleName: string; tierName: string; licenses: License[] }>)

  const handleAssignLicense = (license: License) => {
    setSelectedLicense(license)
    setIsAssignModalOpen(true)
  }

  const handlePurchase = (newLicenses: License[]) => {
    setLicenses([...licenses, ...newLicenses])
    setIsPurchaseModalOpen(false)
  }

  const handleAssign = (licenseId: string, userId: string) => {
    setLicenses(
      licenses.map(lic =>
        lic.id === licenseId
          ? { ...lic, userId, status: 'active' as LicenseStatus, activatedAt: new Date() }
          : lic
      )
    )
    setIsAssignModalOpen(false)
  }

  const handleUnassign = (licenseId: string) => {
    if (confirm('Are you sure you want to unassign this license?')) {
      setLicenses(
        licenses.map(lic =>
          lic.id === licenseId ? { ...lic, userId: undefined, status: 'unassigned' as LicenseStatus } : lic
        )
      )
    }
  }

  const getStatusBadge = (status: LicenseStatus) => {
    const variants: Record<LicenseStatus, 'success' | 'warning' | 'danger' | 'gray'> = {
      active: 'success',
      unassigned: 'warning',
      suspended: 'danger',
      expired: 'gray',
    }

    return <Badge variant={variants[status]}>{status}</Badge>
  }

  const getUserName = (userId?: string) => {
    if (!userId) return '-'
    const user = mockUsers.find(u => u.id === userId)
    return user ? `${user.firstName} ${user.lastName}` : 'Unknown User'
  }

  const stats = {
    total: licenses.length,
    active: licenses.filter(l => l.status === 'active').length,
    unassigned: licenses.filter(l => l.status === 'unassigned').length,
    limit: 100,
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Licenses</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</p>
              <p className="text-xs text-gray-500 mt-1">{stats.total}/{stats.limit} used</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active</p>
              <p className="text-3xl font-bold text-green-600 mt-1">{stats.active}</p>
              <p className="text-xs text-gray-500 mt-1">Assigned to users</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Unassigned</p>
              <p className="text-3xl font-bold text-yellow-600 mt-1">{stats.unassigned}</p>
              <p className="text-xs text-gray-500 mt-1">Available to assign</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Remaining</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.limit - stats.total}</p>
              <p className="text-xs text-gray-500 mt-1">Can purchase more</p>
            </div>
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Card */}
      <Card>
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">License Inventory</h1>
              <p className="text-sm text-gray-500 mt-1">Manage and assign licenses to users</p>
            </div>
            <Button onClick={() => setIsPurchaseModalOpen(true)}>
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Purchase Licenses
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <Input
                placeholder="Search by bundle or tier..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as LicenseStatus | 'all')}
              options={[
                { value: 'all', label: 'All Statuses' },
                { value: 'active', label: 'Active' },
                { value: 'unassigned', label: 'Unassigned' },
                { value: 'suspended', label: 'Suspended' },
                { value: 'expired', label: 'Expired' },
              ]}
            />
          </div>
        </div>

        {/* Grouped Licenses */}
        <div className="divide-y divide-gray-200">
          {Object.entries(groupedLicenses).length === 0 ? (
            <div className="px-6 py-12 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No licenses found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by purchasing your first licenses.
              </p>
              <div className="mt-6">
                <Button onClick={() => setIsPurchaseModalOpen(true)}>
                  Purchase Licenses
                </Button>
              </div>
            </div>
          ) : (
            Object.entries(groupedLicenses).map(([key, group]) => (
              <div key={key} className="px-6 py-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-medium text-gray-900">
                    {group.bundleName} - {group.tierName}
                  </h3>
                  <Badge variant="info">
                    {group.licenses.length} {group.licenses.length === 1 ? 'license' : 'licenses'}
                  </Badge>
                </div>

                <div className="space-y-2">
                  {group.licenses.map(license => {
                    const userName = getUserName(license.userId)
                    const isAssigned = license.status === 'active'

                    return (
                      <div
                        key={license.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center space-x-4">
                          {getStatusBadge(license.status)}
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {isAssigned ? userName : 'Unassigned'}
                            </p>
                            {license.activatedAt && (
                              <p className="text-xs text-gray-500">
                                Activated {license.activatedAt.toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          {license.status === 'unassigned' ? (
                            <Button
                              size="sm"
                              onClick={() => handleAssignLicense(license)}
                            >
                              Assign to User
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => handleUnassign(license.id)}
                            >
                              Unassign
                            </Button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Modals */}
      <PurchaseLicensesModal
        isOpen={isPurchaseModalOpen}
        onClose={() => setIsPurchaseModalOpen(false)}
        onPurchase={handlePurchase}
        currentLicenseCount={stats.total}
        licenseLimit={stats.limit}
      />

      <AssignLicenseModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        license={selectedLicense}
        users={mockUsers}
        onAssign={handleAssign}
      />
    </div>
  )
}

export default Licenses

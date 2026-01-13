import { useState } from 'react'
import type { PhoneNumber, PhoneNumberStatus, AssignmentType } from '@ucaas/shared'
import { Button, Input, Select, Badge, Card } from '../components/ui'
import PurchaseNumberModal from '../components/numbers/PurchaseNumberModal'
import PortInNumberModal from '../components/numbers/PortInNumberModal'
import AssignNumberModal from '../components/numbers/AssignNumberModal'

// Mock data
const mockNumbers: PhoneNumber[] = [
  {
    id: 'num-1',
    customerId: 'cust-1',
    number: '+46 70 123 4567',
    type: 'mobile',
    status: 'active',
    country: 'SE',
    region: 'Stockholm',
    assignmentType: 'user',
    assignedToId: 'user-1',
    assignedToName: 'John Doe',
    monthlyFee: 49,
    currency: 'SEK',
    purchasedAt: new Date('2024-01-05'),
    activatedAt: new Date('2024-01-10'),
  },
  {
    id: 'num-2',
    customerId: 'cust-1',
    number: '+46 8 555 1234',
    type: 'geographic',
    status: 'active',
    country: 'SE',
    region: 'Stockholm',
    assignmentType: 'pbx',
    assignedToId: 'pbx-1',
    assignedToName: 'Main Office PBX',
    monthlyFee: 99,
    currency: 'SEK',
    purchasedAt: new Date('2024-01-05'),
    activatedAt: new Date('2024-01-10'),
  },
  {
    id: 'num-3',
    customerId: 'cust-1',
    number: '+46 20 123 456',
    type: 'toll-free',
    status: 'active',
    country: 'SE',
    assignmentType: 'ivr',
    assignedToId: 'ivr-1',
    assignedToName: 'Customer Support IVR',
    monthlyFee: 199,
    currency: 'SEK',
    purchasedAt: new Date('2024-01-08'),
    activatedAt: new Date('2024-01-12'),
  },
  {
    id: 'num-4',
    customerId: 'cust-1',
    number: '+46 70 987 6543',
    type: 'mobile',
    status: 'reserved',
    country: 'SE',
    region: 'Gothenburg',
    assignmentType: 'unassigned',
    monthlyFee: 49,
    currency: 'SEK',
    purchasedAt: new Date('2024-01-15'),
  },
  {
    id: 'num-5',
    customerId: 'cust-1',
    number: '+46 31 555 9876',
    type: 'geographic',
    status: 'porting',
    country: 'SE',
    region: 'Gothenburg',
    assignmentType: 'unassigned',
    monthlyFee: 99,
    currency: 'SEK',
    portingRequestId: 'port-1',
  },
]

const Numbers = () => {
  const [numbers, setNumbers] = useState<PhoneNumber[]>(mockNumbers)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<PhoneNumberStatus | 'all'>('all')
  const [typeFilter, setTypeFilter] = useState<AssignmentType | 'all'>('all')
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false)
  const [isPortInModalOpen, setIsPortInModalOpen] = useState(false)
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false)
  const [selectedNumber, setSelectedNumber] = useState<PhoneNumber | null>(null)

  // Filter numbers
  const filteredNumbers = numbers.filter(number => {
    const matchesSearch =
      number.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      number.assignedToName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      number.region?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === 'all' || number.status === statusFilter
    const matchesType = typeFilter === 'all' || number.assignmentType === typeFilter

    return matchesSearch && matchesStatus && matchesType
  })

  // Group by type
  const groupedNumbers = filteredNumbers.reduce((acc, number) => {
    const key = number.type
    if (!acc[key]) {
      acc[key] = []
    }
    acc[key].push(number)
    return acc
  }, {} as Record<string, PhoneNumber[]>)

  const getStatusBadge = (status: PhoneNumberStatus) => {
    const variants: Record<PhoneNumberStatus, 'success' | 'warning' | 'danger' | 'gray' | 'info'> = {
      active: 'success',
      reserved: 'warning',
      pending: 'info',
      porting: 'info',
      cancelled: 'gray',
    }

    return <Badge variant={variants[status]}>{status}</Badge>
  }

  const getTypeIcon = (type: string) => {
    const icons: Record<string, JSX.Element> = {
      mobile: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ),
      geographic: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
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
    return icons[type] || icons.mobile
  }

  const getAssignmentBadge = (assignmentType: AssignmentType) => {
    const labels: Record<AssignmentType, string> = {
      user: 'User',
      pbx: 'PBX',
      ivr: 'IVR',
      unassigned: 'Unassigned',
    }

    const variants: Record<AssignmentType, 'success' | 'info' | 'warning'> = {
      user: 'success',
      pbx: 'info',
      ivr: 'info',
      unassigned: 'warning',
    }

    return <Badge variant={variants[assignmentType]} size="sm">{labels[assignmentType]}</Badge>
  }

  const stats = {
    total: numbers.length,
    active: numbers.filter(n => n.status === 'active').length,
    reserved: numbers.filter(n => n.status === 'reserved' || n.status === 'pending').length,
    porting: numbers.filter(n => n.status === 'porting').length,
  }

  const handlePurchase = (newNumbers: PhoneNumber[]) => {
    setNumbers([...numbers, ...newNumbers])
    setIsPurchaseModalOpen(false)
  }

  const handlePortIn = (number: PhoneNumber) => {
    setNumbers([...numbers, number])
    setIsPortInModalOpen(false)
  }

  const handleAssignNumber = (number: PhoneNumber) => {
    setSelectedNumber(number)
    setIsAssignModalOpen(true)
  }

  const handleAssign = (numberId: string, assignmentType: AssignmentType, targetId: string, targetName: string) => {
    setNumbers(
      numbers.map(num =>
        num.id === numberId
          ? {
              ...num,
              assignmentType,
              assignedToId: targetId,
              assignedToName: targetName,
              status: 'active' as PhoneNumberStatus,
              activatedAt: new Date()
            }
          : num
      )
    )
    setIsAssignModalOpen(false)
  }

  const handleUnassign = (numberId: string) => {
    if (confirm('Are you sure you want to unassign this number?')) {
      setNumbers(
        numbers.map(num =>
          num.id === numberId
            ? {
                ...num,
                assignmentType: 'unassigned',
                assignedToId: undefined,
                assignedToName: undefined,
                status: 'reserved' as PhoneNumberStatus
              }
            : num
        )
      )
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Numbers</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</p>
              <p className="text-xs text-gray-500 mt-1">In inventory</p>
            </div>
            <div className="w-12 h-12 bg-primary-50 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active</p>
              <p className="text-3xl font-bold text-green-600 mt-1">{stats.active}</p>
              <p className="text-xs text-gray-500 mt-1">Assigned & active</p>
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
              <p className="text-sm font-medium text-gray-600">Reserved</p>
              <p className="text-3xl font-bold text-yellow-600 mt-1">{stats.reserved}</p>
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
              <p className="text-sm font-medium text-gray-600">Porting</p>
              <p className="text-3xl font-bold text-primary-500 mt-1">{stats.porting}</p>
              <p className="text-xs text-gray-500 mt-1">In progress</p>
            </div>
            <div className="w-12 h-12 bg-primary-50 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
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
              <h1 className="text-2xl font-semibold text-gray-900">Phone Number Inventory</h1>
              <p className="text-sm text-gray-500 mt-1">Manage and assign phone numbers</p>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="secondary" onClick={() => setIsPortInModalOpen(true)}>
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
                Port-In Number
              </Button>
              <Button onClick={() => setIsPurchaseModalOpen(true)}>
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Purchase Number
              </Button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <Input
                placeholder="Search by number, assignee, or region..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as PhoneNumberStatus | 'all')}
              options={[
                { value: 'all', label: 'All Statuses' },
                { value: 'active', label: 'Active' },
                { value: 'reserved', label: 'Reserved' },
                { value: 'pending', label: 'Pending' },
                { value: 'porting', label: 'Porting' },
                { value: 'cancelled', label: 'Cancelled' },
              ]}
            />
            <Select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as AssignmentType | 'all')}
              options={[
                { value: 'all', label: 'All Assignments' },
                { value: 'user', label: 'User' },
                { value: 'pbx', label: 'PBX' },
                { value: 'ivr', label: 'IVR' },
                { value: 'unassigned', label: 'Unassigned' },
              ]}
            />
          </div>
        </div>

        {/* Grouped Numbers */}
        <div className="divide-y divide-gray-200">
          {Object.keys(groupedNumbers).length === 0 ? (
            <div className="px-6 py-12 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No numbers found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by purchasing or porting in your first number.
              </p>
              <div className="mt-6 flex items-center justify-center space-x-3">
                <Button variant="secondary" onClick={() => setIsPortInModalOpen(true)}>Port-In Number</Button>
                <Button onClick={() => setIsPurchaseModalOpen(true)}>Purchase Number</Button>
              </div>
            </div>
          ) : (
            Object.entries(groupedNumbers).map(([type, nums]) => (
              <div key={type} className="px-6 py-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <div className="text-gray-600">{getTypeIcon(type)}</div>
                    <h3 className="text-lg font-medium text-gray-900 capitalize">{type} Numbers</h3>
                  </div>
                  <Badge variant="info">
                    {nums.length} {nums.length === 1 ? 'number' : 'numbers'}
                  </Badge>
                </div>

                <div className="space-y-2">
                  {nums.map(number => (
                    <div
                      key={number.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div>
                          <div className="flex items-center space-x-2">
                            <p className="text-sm font-medium text-gray-900">{number.number}</p>
                            {getStatusBadge(number.status)}
                            {getAssignmentBadge(number.assignmentType)}
                          </div>
                          <div className="flex items-center space-x-3 mt-1">
                            {number.assignedToName && (
                              <p className="text-xs text-gray-500">
                                Assigned to: <span className="font-medium">{number.assignedToName}</span>
                              </p>
                            )}
                            {number.region && (
                              <p className="text-xs text-gray-400">{number.region}, {number.country}</p>
                            )}
                            <p className="text-xs text-gray-400">
                              {number.monthlyFee} {number.currency}/mo
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        {number.assignmentType === 'unassigned' && number.status !== 'porting' ? (
                          <Button size="sm" onClick={() => handleAssignNumber(number)}>Assign</Button>
                        ) : number.status === 'porting' ? (
                          <Button size="sm" variant="secondary">View Port Request</Button>
                        ) : (
                          <>
                            <Button size="sm" variant="secondary" onClick={() => handleAssignNumber(number)}>Reassign</Button>
                            <Button size="sm" variant="secondary" onClick={() => handleUnassign(number.id)}>Unassign</Button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Modals */}
      <PurchaseNumberModal
        isOpen={isPurchaseModalOpen}
        onClose={() => setIsPurchaseModalOpen(false)}
        onPurchase={handlePurchase}
      />

      <PortInNumberModal
        isOpen={isPortInModalOpen}
        onClose={() => setIsPortInModalOpen(false)}
        onSubmit={handlePortIn}
      />

      <AssignNumberModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        phoneNumber={selectedNumber}
        onAssign={handleAssign}
      />
    </div>
  )
}

export default Numbers

import { useState } from 'react'
import type { User, UserStatus, UserRole, License } from '@ucaas/shared'
import { Button, Input, Select, Badge, Table, Pagination, Dropdown, Card } from '../components/ui'
import type { Column } from '../components/ui'
import UserModal from '../components/users/UserModal'

// Mock data for demonstration
const mockUsers: User[] = [
  {
    id: '1',
    customerId: 'cust-1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@acme.com',
    phone: '+46701234567',
    role: 'customer_admin',
    status: 'active',
    department: 'Engineering',
    employeeId: 'EMP-001',
    preferences: {
      emailNotifications: true,
      smsNotifications: false,
      newLicenseAssigned: true,
      numberPortingUpdates: true,
    },
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
    createdBy: 'system',
  },
  {
    id: '2',
    customerId: 'cust-1',
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane@acme.com',
    role: 'user',
    status: 'active',
    department: 'Sales',
    preferences: {
      emailNotifications: true,
      smsNotifications: true,
      newLicenseAssigned: true,
      numberPortingUpdates: false,
    },
    createdAt: new Date('2024-01-14'),
    updatedAt: new Date('2024-01-14'),
    createdBy: 'user-1',
  },
  {
    id: '3',
    customerId: 'cust-1',
    firstName: 'Bob',
    lastName: 'Johnson',
    email: 'bob@acme.com',
    role: 'manager',
    status: 'invited',
    department: 'Marketing',
    preferences: {
      emailNotifications: true,
      smsNotifications: false,
      newLicenseAssigned: true,
      numberPortingUpdates: true,
    },
    createdAt: new Date('2024-01-13'),
    updatedAt: new Date('2024-01-13'),
    createdBy: 'user-1',
  },
]

const mockLicenses: License[] = [
  {
    id: 'lic-1',
    customerId: 'cust-1',
    bundleId: 'bundle-1',
    tierId: 'tier-pro',
    userId: '1',
    status: 'active',
    bundleName: 'Mobile Professional',
    tierName: 'Pro',
  },
  {
    id: 'lic-2',
    customerId: 'cust-1',
    bundleId: 'bundle-2',
    tierId: 'tier-basic',
    userId: '1',
    status: 'active',
    bundleName: 'PBX',
    tierName: 'Basic',
  },
  {
    id: 'lic-3',
    customerId: 'cust-1',
    bundleId: 'bundle-1',
    tierId: 'tier-pro',
    userId: '2',
    status: 'active',
    bundleName: 'Mobile Professional',
    tierName: 'Pro',
  },
]

const Users = () => {
  const [users, setUsers] = useState<User[]>(mockUsers)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<UserStatus | 'all'>('all')
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [sortKey, setSortKey] = useState<string>('createdAt')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

  const pageSize = 20

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === 'all' || user.status === statusFilter
    const matchesRole = roleFilter === 'all' || user.role === roleFilter

    return matchesSearch && matchesStatus && matchesRole
  })

  // Sort users
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    const aValue = (a as any)[sortKey]
    const bValue = (b as any)[sortKey]

    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1
    }
    return aValue < bValue ? 1 : -1
  })

  // Paginate users
  const totalPages = Math.ceil(sortedUsers.length / pageSize)
  const paginatedUsers = sortedUsers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDirection('asc')
    }
  }

  const handleAddUser = () => {
    setEditingUser(null)
    setIsModalOpen(true)
  }

  const handleEditUser = (user: User) => {
    setEditingUser(user)
    setIsModalOpen(true)
  }

  const handleDeleteUser = (userId: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      setUsers(users.filter(u => u.id !== userId))
    }
  }

  const handleSaveUser = (user: User) => {
    if (editingUser) {
      // Update existing user
      setUsers(users.map(u => u.id === user.id ? user : u))
    } else {
      // Add new user
      setUsers([...users, { ...user, id: `user-${Date.now()}`, createdAt: new Date(), updatedAt: new Date(), createdBy: 'current-user' }])
    }
    setIsModalOpen(false)
  }

  const getUserLicenses = (userId: string) => {
    return mockLicenses.filter(lic => lic.userId === userId)
  }

  const getStatusBadge = (status: UserStatus) => {
    const variants: Record<UserStatus, 'success' | 'warning' | 'danger' | 'gray'> = {
      active: 'success',
      invited: 'warning',
      suspended: 'danger',
      inactive: 'gray',
    }

    return <Badge variant={variants[status]}>{status}</Badge>
  }

  const getRoleName = (role: UserRole) => {
    const roleNames: Record<UserRole, string> = {
      customer_admin: 'Admin',
      manager: 'Manager',
      user: 'User',
    }
    return roleNames[role]
  }

  const columns: Column<User>[] = [
    {
      key: 'name',
      header: 'Name',
      sortable: true,
      render: (user) => (
        <div>
          <div className="font-medium text-gray-900">
            {user.firstName} {user.lastName}
          </div>
          <div className="text-gray-500 text-xs">{user.department || '-'}</div>
        </div>
      ),
    },
    {
      key: 'email',
      header: 'Email',
      sortable: true,
    },
    {
      key: 'role',
      header: 'Role',
      sortable: true,
      render: (user) => getRoleName(user.role),
    },
    {
      key: 'licenses',
      header: 'Licenses',
      render: (user) => {
        const licenses = getUserLicenses(user.id)
        if (licenses.length === 0) {
          return <span className="text-gray-500 text-sm">No licenses</span>
        }
        return (
          <div className="text-sm">
            <div className="font-medium">{licenses.length} assigned</div>
            {licenses.map(lic => (
              <div key={lic.id} className="text-gray-500 text-xs">
                {lic.bundleName} - {lic.tierName}
              </div>
            ))}
          </div>
        )
      },
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (user) => getStatusBadge(user.status),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (user) => (
        <Dropdown
          trigger={
            <button className="text-gray-500 hover:text-gray-700 p-1">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
            </button>
          }
          items={[
            {
              label: 'Edit User',
              onClick: () => handleEditUser(user),
              icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>,
            },
            {
              label: 'Assign License',
              onClick: () => alert('Assign license functionality'),
              icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
            },
            {
              label: 'View Activity',
              onClick: () => alert('View activity functionality'),
              icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
            },
            {
              label: user.status === 'active' ? 'Suspend Account' : 'Activate Account',
              onClick: () => alert('Suspend/Activate functionality'),
              icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>,
            },
            {
              label: 'Delete User',
              onClick: () => handleDeleteUser(user.id),
              danger: true,
              icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>,
            },
          ]}
        />
      ),
    },
  ]

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <Card>
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Users ({filteredUsers.length})</h1>
              <p className="text-sm text-gray-500 mt-1">Manage user accounts and permissions</p>
            </div>
            <Button onClick={handleAddUser}>
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add User
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as UserStatus | 'all')}
              options={[
                { value: 'all', label: 'All Statuses' },
                { value: 'active', label: 'Active' },
                { value: 'invited', label: 'Invited' },
                { value: 'suspended', label: 'Suspended' },
                { value: 'inactive', label: 'Inactive' },
              ]}
            />
            <Select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as UserRole | 'all')}
              options={[
                { value: 'all', label: 'All Roles' },
                { value: 'customer_admin', label: 'Admin' },
                { value: 'manager', label: 'Manager' },
                { value: 'user', label: 'User' },
              ]}
            />
          </div>
          {(searchQuery || statusFilter !== 'all' || roleFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('')
                setStatusFilter('all')
                setRoleFilter('all')
              }}
              className="mt-2 text-sm text-blue-600 hover:text-blue-700"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Table */}
        <Table
          columns={columns}
          data={paginatedUsers}
          onSort={handleSort}
          sortKey={sortKey}
          sortDirection={sortDirection}
          emptyMessage="No users found. Click 'Add User' to create your first user."
        />

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={filteredUsers.length}
            pageSize={pageSize}
          />
        )}
      </Card>

      {/* User Modal */}
      <UserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveUser}
        user={editingUser}
      />
    </div>
  )
}

export default Users

import { useState, useEffect } from 'react'
import type { User, UserStatus, UserRole } from '@ucaas/shared'
import { Button, Input, Select, Badge, Table, Pagination, Dropdown, Card } from '../components/ui'
import type { Column } from '../components/ui'
import UserModal from '../components/users/UserModal'
import { userApi } from '@ucaas/api-client'

const Users = () => {
  const [users, setUsers] = useState<User[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<UserStatus | 'all'>('all')
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const pageSize = 20

  // Fetch users from API
  useEffect(() => {
    loadUsers()
  }, [currentPage, searchQuery, statusFilter, roleFilter])

  const loadUsers = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await userApi.list({
        page: currentPage,
        pageSize,
        search: searchQuery || undefined,
        status: statusFilter !== 'all' ? [statusFilter] : undefined,
        role: roleFilter !== 'all' ? [roleFilter] : undefined,
      })

      setUsers(response.data)
      setTotalPages(response.pagination.totalPages)
      setTotalItems(response.pagination.totalItems)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users')
      console.error('Error loading users:', err)
    } finally {
      setLoading(false)
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

  const handleDeleteUser = async (userId: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      try {
        await userApi.delete(userId)
        await loadUsers() // Refresh the list
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Failed to delete user')
      }
    }
  }

  const handleSaveUser = async (user: User) => {
    try {
      if (editingUser) {
        // Update existing user
        await userApi.update(user.id, {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          extension: user.extension,
          role: user.role,
          department: user.department,
          preferences: user.preferences,
        })
      } else {
        // Add new user
        await userApi.create({
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone || undefined,
          extension: user.extension || undefined,
          role: user.role,
          department: user.department || undefined,
          preferences: user.preferences,
        })
      }
      setIsModalOpen(false)
      await loadUsers() // Refresh the list
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save user')
    }
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
    },
    {
      key: 'extension',
      header: 'Extension',
      render: (user) => user.extension || <span className="text-gray-400">-</span>,
    },
    {
      key: 'role',
      header: 'Role',
      render: (user) => getRoleName(user.role),
    },
    {
      key: 'status',
      header: 'Status',
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
              <h1 className="text-2xl font-semibold text-gray-900">
                Users {!loading && `(${totalItems})`}
              </h1>
              <p className="text-sm text-gray-500 mt-1">Manage user accounts and permissions</p>
            </div>
            <Button onClick={handleAddUser} disabled={loading}>
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
                disabled={loading}
              />
            </div>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as UserStatus | 'all')}
              disabled={loading}
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
              disabled={loading}
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
                setCurrentPage(1)
              }}
              disabled={loading}
              className="mt-2 text-sm text-blue-600 hover:text-blue-700 disabled:opacity-50"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Error State */}
        {error && (
          <div className="px-6 py-4 bg-red-50 border-b border-red-200">
            <div className="flex items-center text-red-800">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
              <button
                onClick={loadUsers}
                className="ml-auto text-sm underline hover:no-underline"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="px-6 py-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-sm text-gray-500">Loading users...</p>
          </div>
        )}

        {/* Table */}
        {!loading && (
          <Table
            columns={columns}
            data={users}
            emptyMessage="No users found. Click 'Add User' to create your first user."
          />
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={totalItems}
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

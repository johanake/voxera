import { useState, useEffect } from 'react'
import type { User, UserRole, UserStatus } from '@ucaas/shared'
import { Modal, Button, Input, Select } from '../ui'

interface UserModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (user: User) => void
  user: User | null
}

const UserModal = ({ isOpen, onClose, onSave, user }: UserModalProps) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'user' as UserRole,
    department: '',
    employeeId: '',
    emailNotifications: true,
    smsNotifications: false,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone || '',
        role: user.role,
        department: user.department || '',
        employeeId: user.employeeId || '',
        emailNotifications: user.preferences.emailNotifications,
        smsNotifications: user.preferences.smsNotifications,
      })
    } else {
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        role: 'user',
        department: '',
        employeeId: '',
        emailNotifications: true,
        smsNotifications: false,
      })
    }
    setErrors({})
  }, [user, isOpen])

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required'
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format'
    }

    if (formData.phone && !/^\+?[\d\s-()]+$/.test(formData.phone)) {
      newErrors.phone = 'Invalid phone number format'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    const userData: User = {
      id: user?.id || '',
      customerId: user?.customerId || 'cust-1',
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone || undefined,
      role: formData.role,
      status: user?.status || ('invited' as UserStatus),
      department: formData.department || undefined,
      employeeId: formData.employeeId || undefined,
      preferences: {
        emailNotifications: formData.emailNotifications,
        smsNotifications: formData.smsNotifications,
        newLicenseAssigned: true,
        numberPortingUpdates: true,
      },
      createdAt: user?.createdAt || new Date(),
      updatedAt: new Date(),
      createdBy: user?.createdBy || 'current-user',
    }

    onSave(userData)
  }

  const handleChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value })
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' })
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={user ? 'Edit User' : 'Add New User'}
      size="lg"
    >
      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-4">Basic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="First Name"
                value={formData.firstName}
                onChange={(e) => handleChange('firstName', e.target.value)}
                error={errors.firstName}
                required
              />
              <Input
                label="Last Name"
                value={formData.lastName}
                onChange={(e) => handleChange('lastName', e.target.value)}
                error={errors.lastName}
                required
              />
            </div>
          </div>

          <Input
            label="Email Address"
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            error={errors.email}
            helperText="User will receive an invitation email"
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Phone Number"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              error={errors.phone}
              placeholder="+46 70 123 4567"
            />
            <Input
              label="Employee ID"
              value={formData.employeeId}
              onChange={(e) => handleChange('employeeId', e.target.value)}
              placeholder="EMP-12345"
            />
          </div>

          {/* Role & Access */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-4">Role & Access</h3>
            <Select
              label="Role"
              value={formData.role}
              onChange={(e) => handleChange('role', e.target.value)}
              options={[
                { value: 'user', label: 'User - Can view their own licenses and services' },
                { value: 'manager', label: 'Manager - Can manage team members' },
                { value: 'customer_admin', label: 'Admin - Full access to customer account' },
              ]}
              required
            />
            <p className="mt-2 text-sm text-gray-500">
              {formData.role === 'customer_admin' && 'Admins have full access to manage users, licenses, and settings.'}
              {formData.role === 'manager' && 'Managers can view and manage their team members.'}
              {formData.role === 'user' && 'Users can view their own profile and assigned services.'}
            </p>
          </div>

          <Input
            label="Department"
            value={formData.department}
            onChange={(e) => handleChange('department', e.target.value)}
            placeholder="Sales"
          />

          {/* Notifications */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-4">Notifications</h3>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.emailNotifications}
                  onChange={(e) => handleChange('emailNotifications', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Email notifications</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.smsNotifications}
                  onChange={(e) => handleChange('smsNotifications', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">SMS notifications</span>
              </label>
            </div>
          </div>

          {!user && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div className="ml-3">
                  <p className="text-sm text-blue-800">
                    An invitation email will be sent to <strong>{formData.email || 'the user'}</strong> with instructions to set up their account.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 flex items-center justify-end space-x-3">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">
            {user ? 'Save Changes' : 'Create User'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default UserModal

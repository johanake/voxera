import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import type { User } from '@ucaas/shared'

interface AuthContextType {
  currentUser: User | null
  isAuthenticated: boolean
  login: (userId: string) => void
  logout: () => void
  availableUsers: User[]
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Mock users for testing
const mockUsers: User[] = [
  {
    id: 'user-1',
    customerId: 'customer-1',
    firstName: 'Alice',
    lastName: 'Johnson',
    email: 'alice@voxera.com',
    phone: '+1234567890',
    extension: '101',
    role: 'manager',
    status: 'active',
    preferences: {
      emailNotifications: true,
      smsNotifications: false,
      newLicenseAssigned: true,
      numberPortingUpdates: true,
    },
    department: 'Sales',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    createdBy: 'admin',
    employeeId: null,
    lastLoginAt: null
  },
  {
    id: 'user-2',
    customerId: 'customer-1',
    firstName: 'Bob',
    lastName: 'Smith',
    email: 'bob@voxera.com',
    phone: '+1234567891',
    extension: '102',
    role: 'user',
    status: 'active',
    preferences: {
      emailNotifications: true,
      smsNotifications: true,
      newLicenseAssigned: true,
      numberPortingUpdates: false,
    },
    department: 'Support',
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-02'),
    createdBy: 'admin',
    employeeId: null,
    lastLoginAt: null
  },
  {
    id: 'user-3',
    customerId: 'customer-1',
    firstName: 'Charlie',
    lastName: 'Davis',
    email: 'charlie@voxera.com',
    phone: '+1234567892',
    extension: '103',
    role: 'user',
    status: 'active',
    preferences: {
      emailNotifications: false,
      smsNotifications: false,
      newLicenseAssigned: false,
      numberPortingUpdates: false,
    },
    department: 'Engineering',
    createdAt: new Date('2024-01-03'),
    updatedAt: new Date('2024-01-03'),
    createdBy: 'admin',
    employeeId: null,
    lastLoginAt: null
  },
  {
    id: 'user-4',
    customerId: 'customer-1',
    firstName: 'Diana',
    lastName: 'Wilson',
    email: 'diana@voxera.com',
    phone: '+1234567893',
    extension: '100',
    role: 'customer_admin',
    status: 'active',
    preferences: {
      emailNotifications: true,
      smsNotifications: true,
      newLicenseAssigned: true,
      numberPortingUpdates: true,
    },
    department: 'Management',
    createdAt: new Date('2024-01-04'),
    updatedAt: new Date('2024-01-04'),
    createdBy: 'admin',
    employeeId: null,
    lastLoginAt: null
  },
]

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null)

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUserId = localStorage.getItem('currentUserId')
    if (savedUserId) {
      const user = mockUsers.find((u) => u.id === savedUserId)
      if (user) {
        setCurrentUser(user)
      }
    } else {
      // Auto-login as first user for convenience
      setCurrentUser(mockUsers[0])
      localStorage.setItem('currentUserId', mockUsers[0].id)
    }
  }, [])

  const login = (userId: string) => {
    const user = mockUsers.find((u) => u.id === userId)
    if (user) {
      setCurrentUser(user)
      localStorage.setItem('currentUserId', userId)
    }
  }

  const logout = () => {
    setCurrentUser(null)
    localStorage.removeItem('currentUserId')
  }

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        login,
        logout,
        availableUsers: mockUsers,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

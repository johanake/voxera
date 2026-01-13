import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import type { User } from '@ucaas/shared'
import { useUsers } from '../hooks/useUsers'

interface AuthContextType {
  currentUser: User | null
  isAuthenticated: boolean
  login: (userId: string) => void
  logout: () => void
  availableUsers: User[]
  isLoading: boolean
  error: Error | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null)

  // Fetch users from backend using React Query
  const { data: users = [], isLoading, error } = useUsers()

  // Load user from localStorage on mount or when users are fetched
  useEffect(() => {
    if (users.length === 0) return

    const savedUserId = localStorage.getItem('currentUserId')
    if (savedUserId) {
      const user = users.find((u) => u.id === savedUserId)
      if (user) {
        setCurrentUser(user)
      } else {
        // Saved user not found, default to first user
        setCurrentUser(users[0])
        localStorage.setItem('currentUserId', users[0].id)
      }
    } else {
      // Auto-login as first user for convenience
      setCurrentUser(users[0])
      localStorage.setItem('currentUserId', users[0].id)
    }
  }, [users])

  const login = (userId: string) => {
    const user = users.find((u) => u.id === userId)
    if (user) {
      setCurrentUser(user)
      localStorage.setItem('currentUserId', userId)
    }
  }

  const logout = () => {
    setCurrentUser(null)
    localStorage.removeItem('currentUserId')
  }

  // Show loading state while fetching users
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-300 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading users...</p>
        </div>
      </div>
    )
  }

  // Show error state if fetch fails
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <div className="text-red-600 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-red-600 mb-2">Failed to load users</h2>
          <p className="text-gray-600 mb-4">{error.message}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary-300 text-white rounded-lg hover:bg-primary-400"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        login,
        logout,
        availableUsers: users,
        isLoading,
        error,
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

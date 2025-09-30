import React, { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'

export interface AuthUser {
  teamId: string
  teamCode: string
  token: string
}

interface AuthContextType {
  user: AuthUser | null
  login: (teamCode: string, token: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  isLoading: boolean
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for stored token on mount
    const storedToken = localStorage.getItem('auth_token')
    const storedTeamCode = localStorage.getItem('team_code')

    if (storedToken && storedTeamCode) {
      // Validate token with backend
      validateStoredToken(storedToken, storedTeamCode)
    } else {
      setIsLoading(false)
    }
  }, [])

  const validateStoredToken = async (token: string, teamCode: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5011'}/auth/validate`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        setUser({ teamId: '', teamCode, token }) // We zouden teamId uit de token kunnen halen
      } else {
        // Token is invalid, clear storage
        localStorage.removeItem('auth_token')
        localStorage.removeItem('team_code')
      }
    } catch (error) {
      console.error('Token validation failed:', error)
      localStorage.removeItem('auth_token')
      localStorage.removeItem('team_code')
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (teamCode: string, token: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5011'}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ teamCode, token })
      })

      if (response.ok) {
        const data = await response.json()

        // Store token and team code
        localStorage.setItem('auth_token', data.jwt)
        localStorage.setItem('team_code', teamCode)

        // Update state
        setUser({
          teamId: data.team?._id || '',
          teamCode,
          token: data.jwt
        })

        return { success: true }
      } else {
        const errorData = await response.json()
        return { success: false, error: errorData.error || 'Login failed' }
      }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, error: 'Network error. Please check your connection.' }
    }
  }

  const logout = () => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('team_code')
    setUser(null)
  }

  const value: AuthContextType = {
    user,
    login,
    logout,
    isLoading,
    isAuthenticated: !!user
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

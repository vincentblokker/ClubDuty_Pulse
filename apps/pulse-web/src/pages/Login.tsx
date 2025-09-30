import React, { useState } from 'react'
import { useAuth } from '../store/auth'

export const Login: React.FC = () => {
  const [teamCode, setTeamCode] = useState('')
  const [token, setToken] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    if (!teamCode.trim() || !token.trim()) {
      setError('Please enter both team code and token')
      setIsLoading(false)
      return
    }

    const result = await login(teamCode.trim(), token.trim())

    if (!result.success) {
      setError(result.error || 'Login failed')
    }

    setIsLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: 'var(--color-base-200)' }}>
      <div className="w-full max-w-sm space-y-6 md:space-y-8">
        <div className="text-center">
          <h1 className="text-responsive-2xl font-bold mb-2" style={{ color: 'var(--color-base-content)' }}>ClubDuty Pulse</h1>
          <p className="text-sm" style={{ color: 'color-mix(in oklab, var(--color-base-content) 70%, transparent)' }}>Sign in to your team dashboard</p>
        </div>

        <form className="space-y-4 md:space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-lg shadow-md p-4 md:p-6 space-y-4" style={{ backgroundColor: 'var(--color-base-100)' }}>
            <div>
              <label htmlFor="teamCode" className="block text-sm font-medium mb-2" style={{ color: 'var(--color-base-content)' }}>
                Team Code
              </label>
              <input
                id="teamCode"
                name="teamCode"
                type="text"
                required
                className="input-mobile uppercase tracking-wider"
                placeholder="ABC123"
                value={teamCode}
                onChange={(e) => setTeamCode(e.target.value.toUpperCase())}
                disabled={isLoading}
                autoComplete="off"
                inputMode="text"
              />
            </div>

            <div>
              <label htmlFor="token" className="block text-sm font-medium mb-2" style={{ color: 'var(--color-base-content)' }}>
                Access Token
              </label>
              <input
                id="token"
                name="token"
                type="password"
                required
                className="input-mobile"
                placeholder="Enter your access token"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                disabled={isLoading}
                autoComplete="current-password"
                inputMode="text"
              />
            </div>

            {error && (
              <div className="text-sm rounded-md p-3 text-center" style={{ 
                backgroundColor: 'var(--color-error)',
                color: 'var(--color-error-content)',
                border: '1px solid color-mix(in oklab, var(--color-error) 80%, transparent)'
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              className="btn-mobile w-full focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ 
                backgroundColor: 'var(--color-primary)', 
                color: 'var(--color-primary-content)',
                borderColor: 'var(--color-primary)' 
              }}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 mr-2" style={{ borderColor: 'var(--color-primary-content)' }}></div>
                  Signing in...
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </div>
        </form>

        <div className="text-center text-xs md:text-sm rounded-lg p-3" style={{ 
          color: 'color-mix(in oklab, var(--color-base-content) 70%, transparent)',
          backgroundColor: 'color-mix(in oklab, var(--color-base-100) 50%, transparent)'
        }}>
          <p className="font-medium mb-1">Demo credentials:</p>
          <div className="space-y-1">
            <p>Team Code: <code className="px-2 py-1 rounded text-xs" style={{ backgroundColor: 'var(--color-base-300)', color: 'var(--color-base-content)' }}>ABC123</code></p>
            <p>Token: <code className="px-2 py-1 rounded text-xs" style={{ backgroundColor: 'var(--color-base-300)', color: 'var(--color-base-content)' }}>demo-token</code></p>
          </div>
        </div>
      </div>
    </div>
  )
}

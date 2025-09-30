import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../store/auth'
import { api } from '../lib/api'

interface Round {
  id: string
  name: string
  status: 'DRAFT' | 'OPEN' | 'CLOSED'
  startDate?: string
  endDate?: string
  assignmentsCount: number
  createdAt: string
  updatedAt: string
}

export const Rounds: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [rounds, setRounds] = useState<Round[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newRoundName, setNewRoundName] = useState('')
  const [newRoundStartDate, setNewRoundStartDate] = useState('')
  const [newRoundEndDate, setNewRoundEndDate] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [formError, setFormError] = useState('')

  useEffect(() => {
    loadRounds()
  }, [])

  const loadRounds = async () => {
    setIsLoading(true)
    const response = await api.get('/rounds')

    if (response.data) {
      setRounds((response.data as any).rounds || [])
    }
    setIsLoading(false)
  }

  const handleCreateRound = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')

    // Validation
    if (!newRoundName.trim()) {
      setFormError('Round name is required')
      return
    }

    if (newRoundName.trim().length < 2) {
      setFormError('Round name must be at least 2 characters long')
      return
    }

    if (newRoundStartDate && newRoundEndDate) {
      const start = new Date(newRoundStartDate)
      const end = new Date(newRoundEndDate)
      if (start >= end) {
        setFormError('End date must be after start date')
        return
      }
    }

    setIsCreating(true)
    const requestBody: any = { name: newRoundName.trim() }

    if (newRoundStartDate) requestBody.startDate = newRoundStartDate
    if (newRoundEndDate) requestBody.endDate = newRoundEndDate

    const response = await api.post('/rounds', requestBody)

    if (response.data) {
      setNewRoundName('')
      setNewRoundStartDate('')
      setNewRoundEndDate('')
      setShowCreateForm(false)
      await loadRounds() // Reload the list
    } else if (response.error) {
      setFormError(response.error)
    }
    setIsCreating(false)
  }

  const handleStatusChange = async (roundId: string, newStatus: 'DRAFT' | 'OPEN' | 'CLOSED') => {
    const response = await api.put(`/rounds/${roundId}/status`, { status: newStatus })

    if (response.data) {
      await loadRounds() // Reload the list
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return { backgroundColor: 'color-mix(in oklab, var(--color-success) 20%, transparent)', color: 'var(--color-success)' }
      case 'CLOSED': return { backgroundColor: 'color-mix(in oklab, var(--color-error) 20%, transparent)', color: 'var(--color-error)' }
      case 'DRAFT': return { backgroundColor: 'color-mix(in oklab, var(--color-base-content) 15%, transparent)', color: 'var(--color-base-content)' }
      default: return { backgroundColor: 'color-mix(in oklab, var(--color-base-content) 15%, transparent)', color: 'var(--color-base-content)' }
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-base-200)' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderColor: 'var(--color-primary)' }}></div>
          <p className="mt-4" style={{ color: 'color-mix(in oklab, var(--color-base-content) 70%, transparent)' }}>Loading rounds...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-base-200)' }}>
      {/* Header */}
      <header className="shadow-sm" style={{ backgroundColor: 'var(--color-base-100)', borderBottom: '1px solid color-mix(in oklab, var(--color-base-content) 15%, transparent)' }}>
        <div className="container mx-auto">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-4 gap-4">
            <h1 className="text-responsive-2xl font-bold" style={{ color: 'var(--color-base-content)' }}>Feedback Rounds</h1>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <span className="text-sm text-center sm:text-left" style={{ color: 'color-mix(in oklab, var(--color-base-content) 70%, transparent)' }}>
                Team: <span className="font-medium" style={{ color: 'var(--color-base-content)' }}>{user?.teamCode}</span>
              </span>
              <button
                onClick={() => setShowCreateForm(true)}
                className="btn-mobile transition-colors"
                style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-primary-content)' }}
              >
                New Round
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto py-4 md:py-8">
        {/* Create Round Form */}
        {showCreateForm && (
          <div className="mobile-card mb-6 md:mb-8" style={{ backgroundColor: 'var(--color-base-100)' }}>
            <h2 className="text-responsive-lg font-semibold mb-4" style={{ color: 'var(--color-base-content)' }}>Create New Round</h2>

            {formError && (
              <div className="mb-4 p-3 rounded-md text-sm" style={{ backgroundColor: 'color-mix(in oklab, var(--color-error) 20%, transparent)', border: '1px solid color-mix(in oklab, var(--color-error) 50%, transparent)', color: 'var(--color-error)' }}>
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateRound} className="space-y-4">
              <div>
                <label htmlFor="roundName" className="block text-sm font-medium mb-2" style={{ color: 'var(--color-base-content)' }}>
                  Round Name *
                </label>
                <input
                  id="roundName"
                  type="text"
                  value={newRoundName}
                  onChange={(e) => setNewRoundName(e.target.value)}
                  placeholder="Enter round name (e.g., Week 1, Sprint 3)"
                  className="input-mobile"
                  required
                />
              </div>

              <div className="mobile-layout gap-4">
                <div className="flex-1">
                  <label htmlFor="startDate" className="block text-sm font-medium mb-2" style={{ color: 'var(--color-base-content)' }}>
                    Start Date (Optional)
                  </label>
                  <input
                    id="startDate"
                    type="date"
                    value={newRoundStartDate}
                    onChange={(e) => setNewRoundStartDate(e.target.value)}
                    className="input-mobile"
                  />
                </div>

                <div className="flex-1">
                  <label htmlFor="endDate" className="block text-sm font-medium mb-2" style={{ color: 'var(--color-base-content)' }}>
                    End Date (Optional)
                  </label>
                  <input
                    id="endDate"
                    type="date"
                    value={newRoundEndDate}
                    onChange={(e) => setNewRoundEndDate(e.target.value)}
                    className="input-mobile"
                  />
                </div>
              </div>

              <div className="mobile-layout gap-3 pt-4">
                <button
                  type="submit"
                  disabled={isCreating || !newRoundName.trim()}
                  className="btn-mobile flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-primary-content)' }}
                >
                  {isCreating ? 'Creating...' : 'Create Round'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false)
                    setNewRoundName('')
                    setNewRoundStartDate('')
                    setNewRoundEndDate('')
                    setFormError('')
                  }}
                  className="btn-mobile flex-1"
                  style={{ border: '1px solid color-mix(in oklab, var(--color-base-content) 30%, transparent)', color: 'color-mix(in oklab, var(--color-base-content) 70%, transparent)', backgroundColor: 'transparent' }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Rounds List */}
        {rounds.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg" style={{ color: 'color-mix(in oklab, var(--color-base-content) 60%, transparent)' }}>No rounds yet</p>
            <p className="mt-2" style={{ color: 'color-mix(in oklab, var(--color-base-content) 50%, transparent)' }}>Create your first feedback round to get started</p>
          </div>
        ) : (
          <div className="grid grid-responsive-3 gap-4">
            {rounds.map((round) => (
              <div key={round.id} className="mobile-card" style={{ backgroundColor: 'var(--color-base-100)' }}>
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 gap-2">
                  <h3 className="text-responsive-lg font-semibold flex-1" style={{ color: 'var(--color-base-content)' }}>{round.name}</h3>
                  <span className="px-2 py-1 text-xs font-medium rounded-full self-start" style={getStatusColor(round.status)}>
                    {round.status}
                  </span>
                </div>

                <div className="space-y-2 text-sm mb-4">
                  <div className="mobile-layout">
                    <span style={{ color: 'color-mix(in oklab, var(--color-base-content) 70%, transparent)' }}>Assignments:</span>
                    <span className="font-medium" style={{ color: 'var(--color-base-content)' }}>{round.assignmentsCount}</span>
                  </div>
                  <div className="mobile-layout">
                    <span style={{ color: 'color-mix(in oklab, var(--color-base-content) 70%, transparent)' }}>Created:</span>
                    <span className="font-medium text-xs" style={{ color: 'var(--color-base-content)' }}>{new Date(round.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  {round.status === 'DRAFT' && (
                    <button
                      onClick={() => handleStatusChange(round.id, 'OPEN')}
                      className="btn-mobile flex-1 transition-colors text-sm"
                      style={{ backgroundColor: 'var(--color-success)', color: 'var(--color-success-content)' }}
                    >
                      Open Round
                    </button>
                  )}

                  {round.status === 'OPEN' && (
                    <button
                      onClick={() => handleStatusChange(round.id, 'CLOSED')}
                      className="btn-mobile flex-1 transition-colors text-sm"
                      style={{ backgroundColor: 'var(--color-error)', color: 'var(--color-error-content)' }}
                    >
                      Close Round
                    </button>
                  )}

                  <button
                    onClick={() => navigate(`/rounds/${round.id}`)}
                    className="btn-mobile flex-1 transition-colors text-sm"
                    style={{ backgroundColor: 'var(--color-neutral)', color: 'var(--color-neutral-content)' }}
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

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
      case 'OPEN': return 'bg-green-100 text-green-800'
      case 'CLOSED': return 'bg-red-100 text-red-800'
      case 'DRAFT': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading rounds...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-4 gap-4">
            <h1 className="text-responsive-2xl font-bold text-gray-900">Feedback Rounds</h1>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <span className="text-sm text-gray-600 text-center sm:text-left">
                Team: <span className="font-medium">{user?.teamCode}</span>
              </span>
              <button
                onClick={() => setShowCreateForm(true)}
                className="btn-mobile bg-blue-600 text-white hover:bg-blue-700 transition-colors"
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
          <div className="mobile-card bg-white mb-6 md:mb-8">
            <h2 className="text-responsive-lg font-semibold text-gray-900 mb-4">Create New Round</h2>

            {formError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateRound} className="space-y-4">
              <div>
                <label htmlFor="roundName" className="block text-sm font-medium text-gray-700 mb-2">
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
                  <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
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
                  <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
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
                  className="btn-mobile flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
                  className="btn-mobile flex-1 border border-gray-300 text-gray-600 hover:text-gray-900 hover:bg-gray-50"
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
            <p className="text-gray-500 text-lg">No rounds yet</p>
            <p className="text-gray-400 mt-2">Create your first feedback round to get started</p>
          </div>
        ) : (
          <div className="grid grid-responsive-3 gap-4">
            {rounds.map((round) => (
              <div key={round.id} className="mobile-card bg-white">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 gap-2">
                  <h3 className="text-responsive-lg font-semibold text-gray-900 flex-1">{round.name}</h3>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full self-start ${getStatusColor(round.status)}`}>
                    {round.status}
                  </span>
                </div>

                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <div className="mobile-layout">
                    <span className="text-gray-600">Assignments:</span>
                    <span className="font-medium">{round.assignmentsCount}</span>
                  </div>
                  <div className="mobile-layout">
                    <span className="text-gray-600">Created:</span>
                    <span className="font-medium text-xs">{new Date(round.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  {round.status === 'DRAFT' && (
                    <button
                      onClick={() => handleStatusChange(round.id, 'OPEN')}
                      className="btn-mobile flex-1 bg-green-600 hover:bg-green-700 transition-colors text-sm"
                    >
                      Open Round
                    </button>
                  )}

                  {round.status === 'OPEN' && (
                    <button
                      onClick={() => handleStatusChange(round.id, 'CLOSED')}
                      className="btn-mobile flex-1 bg-red-600 hover:bg-red-700 transition-colors text-sm"
                    >
                      Close Round
                    </button>
                  )}

                  <button
                    onClick={() => navigate(`/rounds/${round.id}`)}
                    className="btn-mobile flex-1 bg-gray-600 hover:bg-gray-700 transition-colors text-sm"
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

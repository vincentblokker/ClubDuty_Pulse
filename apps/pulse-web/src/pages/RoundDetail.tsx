import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../store/auth'
import { api } from '../lib/api'

interface RoundDetailData {
  id: string
  name: string
  status: 'DRAFT' | 'OPEN' | 'CLOSED'
  startDate?: string
  endDate?: string
  assignmentsCount: number
  createdAt: string
  updatedAt: string
}

interface ProgressData {
  completed: number
  totalNeeded: number
  percent: number
  playerProgress: Array<{
    playerId: string
    playerName: string
    totalAssigned: number
    completed: number
    percentComplete: number
  }>
  summary: {
    completedAll: number
    partial: number
    notStarted: number
    totalPlayers: number
  }
}

export const RoundDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [round, setRound] = useState<RoundDetailData | null>(null)
  const [progress, setProgress] = useState<ProgressData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [shareableUrl, setShareableUrl] = useState<string>('')

  useEffect(() => {
    if (id) {
      loadRound()
      loadProgress()
      loadShareableUrl()
    }
  }, [id])

  const loadProgress = async () => {
    if (!id) return

    const response = await api.getProgress(id)
    if (response.data) {
      setProgress(response.data)
    }
  }

  const loadRound = async () => {
    if (!id) return

    setIsLoading(true)
    const response = await api.get(`/rounds/${id}`)

    if (response.data) {
      setRound(response.data as RoundDetailData)
    }
    setIsLoading(false)
  }

  const handleStatusChange = async (newStatus: 'DRAFT' | 'OPEN' | 'CLOSED') => {
    if (!id) return

    setIsUpdating(true)
    const response = await api.put(`/rounds/${id}/status`, { status: newStatus })

    if (response.data) {
      await loadRound() // Reload the round data
    }
    setIsUpdating(false)
  }

  const handleGenerateAssignments = async () => {
    if (!id) return

    setIsUpdating(true)
    const response = await api.post(`/rounds/${id}/assign`, { perRater: 2 })

    if (response.data) {
      await loadRound() // Reload to get updated assignments count
    }
    setIsUpdating(false)
  }

  const loadShareableUrl = async () => {
    if (!id) return

    const response = await api.get(`/rounds/${id}/share`)
    if (response.data && (response.data as any).shareableUrl) {
      setShareableUrl((response.data as any).shareableUrl)
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareableUrl)
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy URL:', err)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return { backgroundColor: 'color-mix(in oklab, var(--color-success) 20%, transparent)', color: 'var(--color-success)', borderColor: 'color-mix(in oklab, var(--color-success) 50%, transparent)' }
      case 'CLOSED': return { backgroundColor: 'color-mix(in oklab, var(--color-error) 20%, transparent)', color: 'var(--color-error)', borderColor: 'color-mix(in oklab, var(--color-error) 50%, transparent)' }
      case 'DRAFT': return { backgroundColor: 'color-mix(in oklab, var(--color-base-content) 15%, transparent)', color: 'var(--color-base-content)', borderColor: 'color-mix(in oklab, var(--color-base-content) 30%, transparent)' }
      default: return { backgroundColor: 'color-mix(in oklab, var(--color-base-content) 15%, transparent)', color: 'var(--color-base-content)', borderColor: 'color-mix(in oklab, var(--color-base-content) 30%, transparent)' }
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-base-200)' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderColor: 'var(--color-primary)' }}></div>
          <p className="mt-4" style={{ color: 'color-mix(in oklab, var(--color-base-content) 70%, transparent)' }}>Loading round details...</p>
        </div>
      </div>
    )
  }

  if (!round) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-base-200)' }}>
        <div className="text-center">
          <p className="text-lg" style={{ color: 'color-mix(in oklab, var(--color-base-content) 60%, transparent)' }}>Round not found</p>
          <button
            onClick={() => navigate('/rounds')}
            className="mt-4 px-4 py-2 rounded-md transition-colors"
            style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-primary-content)' }}
          >
            Back to Rounds
          </button>
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
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/rounds')}
                className="text-gray-600 hover:text-gray-900 touch-target p-2 rounded-md hover:bg-gray-50"
              >
                ← Back to Rounds
              </button>
              <h1 className="text-responsive-2xl font-bold text-gray-900 truncate">{round.name}</h1>
            </div>
            <div className="flex items-center justify-center sm:justify-end">
              <span className="text-sm text-gray-600">
                Team: <span className="font-medium">{user?.teamCode}</span>
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto py-4 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Round Info */}
          <div className="lg:col-span-2">
            <div className="mobile-card bg-white">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
                <h2 className="text-responsive-xl font-semibold text-gray-900">Round Information</h2>
                <span className={`px-3 py-1 text-sm font-medium rounded-full border self-start ${getStatusColor(round.status)}`}>
                  {round.status}
                </span>
              </div>

              <div className="mobile-layout gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Basic Information</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm text-gray-600">Name:</span>
                      <p className="font-medium">{round.name}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Status:</span>
                      <p className="font-medium capitalize">{round.status}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Assignments:</span>
                      <p className="font-medium">{round.assignmentsCount} total</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Timeline</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm text-gray-600">Created:</span>
                      <p className="font-medium">{new Date(round.createdAt).toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Last Updated:</span>
                      <p className="font-medium">{new Date(round.updatedAt).toLocaleString()}</p>
                    </div>
                    {round.startDate && (
                      <div>
                        <span className="text-sm text-gray-600">Start Date:</span>
                        <p className="font-medium">{new Date(round.startDate).toLocaleDateString()}</p>
                      </div>
                    )}
                    {round.endDate && (
                      <div>
                        <span className="text-sm text-gray-600">End Date:</span>
                        <p className="font-medium">{new Date(round.endDate).toLocaleDateString()}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Progress Section */}
            <div className="mobile-card bg-white mt-6 md:mt-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
                <h3 className="text-responsive-lg font-semibold text-gray-900">Round Progress</h3>
                <button
                  onClick={loadProgress}
                  className="btn-mobile bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors self-start sm:self-center"
                >
                  Refresh
                </button>
              </div>

              {progress ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{progress.totalNeeded}</div>
                      <div className="text-sm text-blue-800">Total Feedback Needed</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{progress.completed}</div>
                      <div className="text-sm text-green-800">Completed</div>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">{progress.totalNeeded - progress.completed}</div>
                      <div className="text-sm text-orange-800">Remaining</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-gray-600">{progress.percent}%</div>
                      <div className="text-sm text-gray-800">Completion Rate</div>
                    </div>
                  </div>

                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="text-xl font-bold text-green-600">{progress.summary.completedAll}</div>
                      <div className="text-sm text-green-800">Completed All</div>
                    </div>
                    <div className="text-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                      <div className="text-xl font-bold text-yellow-600">{progress.summary.partial}</div>
                      <div className="text-sm text-yellow-800">In Progress</div>
                    </div>
                    <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
                      <div className="text-xl font-bold text-red-600">{progress.summary.notStarted}</div>
                      <div className="text-sm text-red-800">Not Started</div>
                    </div>
                  </div>

                  {/* Player Progress Table */}
                  <div className="mobile-table border rounded-lg overflow-hidden">
                    <div className="bg-gray-50 px-4 py-3 border-b">
                      <h4 className="font-medium text-gray-900">Player Progress</h4>
                    </div>
                    <div className="divide-y">
                      {progress.playerProgress.map((player) => (
                        <div key={player.playerId} className="px-4 py-3">
                          <div className="mobile-layout items-center gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-gray-900 truncate">{player.playerName}</div>
                              <div className="text-sm text-gray-600">
                                {player.completed} of {player.totalAssigned} completed
                              </div>
                            </div>
                            <div className="flex items-center space-x-3 flex-shrink-0">
                              <div className="w-20 md:w-24 bg-gray-200 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full transition-all ${
                                    player.percentComplete === 100 ? 'bg-green-500' :
                                    player.percentComplete > 0 ? 'bg-yellow-500' : 'bg-gray-300'
                                  }`}
                                  style={{ width: `${player.percentComplete}%` }}
                                ></div>
                              </div>
                              <div className="text-sm font-medium w-10 md:w-12 text-right">
                                {player.percentComplete}%
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading progress data...</p>
                </div>
              )}
            </div>
          </div>

          {/* Actions Panel */}
          <div className="lg:col-span-1 space-y-6">
            <div className="mobile-card bg-white">
              <h3 className="text-responsive-lg font-semibold text-gray-900 mb-4">Actions</h3>

              <div className="space-y-3">
                {round.status === 'DRAFT' && (
                  <button
                    onClick={() => handleStatusChange('OPEN')}
                    disabled={isUpdating}
                    className="btn-mobile w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 transition-colors"
                  >
                    {isUpdating ? 'Opening...' : 'Open Round'}
                  </button>
                )}

                {round.status === 'OPEN' && (
                  <button
                    onClick={() => handleStatusChange('CLOSED')}
                    disabled={isUpdating}
                    className="btn-mobile w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 transition-colors"
                  >
                    {isUpdating ? 'Closing...' : 'Close Round'}
                  </button>
                )}

                {round.status === 'DRAFT' && (
                  <button
                    onClick={handleGenerateAssignments}
                    disabled={isUpdating}
                    className="btn-mobile w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    {isUpdating ? 'Generating...' : 'Generate Assignments'}
                  </button>
                )}

                <button
                  onClick={() => navigate(`/rounds/${id}/feedback`)}
                  className="btn-mobile w-full bg-gray-600 hover:bg-gray-700 transition-colors"
                >
                  View All Feedback
                </button>

                <button
                  onClick={() => navigate(`/rounds/${id}/themes`)}
                  className="btn-mobile w-full bg-purple-600 hover:bg-purple-700 transition-colors"
                >
                  View Team Themes
                </button>

                <button className="btn-mobile w-full bg-gray-600 hover:bg-gray-700 transition-colors">
                  Export Results
                </button>

                {/* Share Section */}
                {shareableUrl && (
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="text-sm font-medium text-blue-900 mb-2">Share Feedback Link</h4>
                    <div className="flex flex-col sm:flex-row gap-2 mb-2">
                      <input
                        type="text"
                        value={shareableUrl}
                        readOnly
                        className="flex-1 px-3 py-2 text-sm border border-blue-300 rounded-md bg-white min-h-[44px]"
                      />
                      <button
                        onClick={copyToClipboard}
                        className="btn-mobile bg-blue-600 hover:bg-blue-700 transition-colors"
                      >
                        Copy
                      </button>
                    </div>
                    <p className="text-xs text-blue-700">
                      Share this link with your team members so they can provide anonymous feedback.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="mobile-card bg-white">
              <h3 className="text-responsive-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="mobile-layout items-center">
                  <span className="text-sm text-gray-600">Status:</span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(round.status)}`}>
                    {round.status}
                  </span>
                </div>
                <div className="mobile-layout items-center">
                  <span className="text-sm text-gray-600">Assignments:</span>
                  <span className="font-medium">{round.assignmentsCount}</span>
                </div>
                <div className="mobile-layout items-center">
                  <span className="text-sm text-gray-600">Created:</span>
                  <span className="font-medium text-xs">{new Date(round.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

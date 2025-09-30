import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../lib/api'

interface FeedbackData {
  playerId: string
  playerName: string
  strengths: Array<{
    id: string
    content: string[]
    createdAt: string
  }>
  improvements: Array<{
    id: string
    content: string
    createdAt: string
  }>
}

interface FeedbackResponse {
  feedback: FeedbackData[]
  totalPlayers: number
  totalFeedback: number
  filter: {
    type?: 'strengths' | 'improvement'
    playerId?: string
  }
}

export const FeedbackView: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [feedbackData, setFeedbackData] = useState<FeedbackResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedPlayer, setSelectedPlayer] = useState<string>('')
  const [filterType, setFilterType] = useState<'all' | 'strengths' | 'improvement'>('all')
  const [error, setError] = useState<string>('')

  useEffect(() => {
    if (id) {
      loadFeedback()
    }
  }, [id, selectedPlayer, filterType])

  const loadFeedback = async () => {
    if (!id) return

    setIsLoading(true)
    setError('')

    const options: { type?: 'strengths' | 'improvement'; playerId?: string } = {}

    if (filterType !== 'all') {
      options.type = filterType
    }

    if (selectedPlayer) {
      options.playerId = selectedPlayer
    }

    const response = await api.getFeedback(id, options)

    if (response.data) {
      setFeedbackData(response.data)
    } else if (response.error) {
      setError(response.error)
    }
    setIsLoading(false)
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy text:', err)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading feedback...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Feedback</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => navigate(`/rounds/${id}`)}
              className="w-full px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Back to Round
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!feedbackData || feedbackData.feedback.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => navigate(`/rounds/${id}`)}
                  className="text-gray-600 hover:text-gray-900"
                >
                  ← Back to Round
                </button>
                <h1 className="text-2xl font-bold text-gray-900">Feedback View</h1>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No Feedback Yet</h2>
            <p className="text-gray-600">No feedback has been submitted for this round yet.</p>
          </div>
        </main>
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
                onClick={() => navigate(`/rounds/${id}`)}
                className="text-gray-600 hover:text-gray-900 touch-target p-2 rounded-md hover:bg-gray-50"
              >
                ← Back to Round
              </button>
              <h1 className="text-responsive-2xl font-bold text-gray-900 truncate">Feedback Overview</h1>
            </div>
            <div className="flex items-center justify-center sm:justify-end">
              <span className="text-sm text-gray-600">
                {feedbackData.totalFeedback} feedback items
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto py-4 md:py-8">
        {/* Filters */}
        <div className="mobile-card bg-white mb-6">
          <div className="mobile-layout gap-4">
            {/* Player Filter */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Player
              </label>
              <select
                value={selectedPlayer}
                onChange={(e) => setSelectedPlayer(e.target.value)}
                className="input-mobile"
              >
                <option value="">All Players</option>
                {feedbackData.feedback.map((player) => (
                  <option key={player.playerId} value={player.playerId}>
                    {player.playerName}
                  </option>
                ))}
              </select>
            </div>

            {/* Type Filter */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Type
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as 'all' | 'strengths' | 'improvement')}
                className="input-mobile"
              >
                <option value="all">All Feedback</option>
                <option value="strengths">Strengths Only</option>
                <option value="improvement">Improvements Only</option>
              </select>
            </div>

            {/* Refresh Button */}
            <div className="flex items-end">
              <button
                onClick={loadFeedback}
                className="btn-mobile w-full bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                Refresh Data
              </button>
            </div>
          </div>
        </div>

        {/* Feedback Display */}
        <div className="mobile-spacing">
          {feedbackData.feedback.map((player) => (
            <div key={player.playerId} className="mobile-card bg-white">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
                <h3 className="text-responsive-lg font-semibold text-gray-900">{player.playerName}</h3>
                <div className="flex items-center justify-center sm:justify-end">
                  <span className="text-sm text-gray-600">
                    {player.strengths.length + player.improvements.length} feedback items
                  </span>
                </div>
              </div>

              {/* Strengths Section */}
              {player.strengths.length > 0 && (
                <div className="mobile-spacing">
                  <h4 className="text-responsive-lg font-medium text-green-700 mb-3 flex items-center">
                    <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                    </svg>
                    <span className="truncate">Strengths</span>
                  </h4>
                  <div className="mobile-spacing">
                    {player.strengths.map((strength) => (
                      <div key={strength.id} className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <ul className="space-y-1">
                              {strength.content.map((item, index) => (
                                <li key={index} className="text-green-800 text-sm break-words">• {item}</li>
                              ))}
                            </ul>
                            <p className="text-xs text-green-600 mt-2">
                              Received {formatDate(strength.createdAt)}
                            </p>
                          </div>
                          <button
                            onClick={() => copyToClipboard(strength.content.join('\n• '))}
                            className="touch-target p-2 text-green-600 hover:bg-green-100 rounded-md transition-colors flex-shrink-0"
                            title="Copy to clipboard"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Improvements Section */}
              {player.improvements.length > 0 && (
                <div className="mobile-spacing">
                  <h4 className="text-responsive-lg font-medium text-orange-700 mb-3 flex items-center">
                    <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path>
                    </svg>
                    <span className="truncate">Areas for Improvement</span>
                  </h4>
                  <div className="mobile-spacing">
                    {player.improvements.map((improvement) => (
                      <div key={improvement.id} className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-orange-800 text-sm break-words">{improvement.content}</p>
                            <p className="text-xs text-orange-600 mt-2">
                              Received {formatDate(improvement.createdAt)}
                            </p>
                          </div>
                          <button
                            onClick={() => copyToClipboard(improvement.content)}
                            className="touch-target p-2 text-orange-600 hover:bg-orange-100 rounded-md transition-colors flex-shrink-0"
                            title="Copy to clipboard"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="mobile-card bg-white mt-6 md:mt-8">
          <h3 className="text-responsive-lg font-semibold text-gray-900 mb-4">Summary</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl md:text-3xl font-bold text-blue-600">{feedbackData.totalPlayers}</div>
              <div className="text-sm text-blue-800">Players with Feedback</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl md:text-3xl font-bold text-green-600">
                {feedbackData.feedback.reduce((sum, player) => sum + player.strengths.length, 0)}
              </div>
              <div className="text-sm text-green-800">Strength Comments</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg sm:col-span-2 lg:col-span-1">
              <div className="text-2xl md:text-3xl font-bold text-orange-600">
                {feedbackData.feedback.reduce((sum, player) => sum + player.improvements.length, 0)}
              </div>
              <div className="text-sm text-orange-800">Improvement Comments</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

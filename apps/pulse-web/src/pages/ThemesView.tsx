import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../lib/api'

interface ThemeData {
  id: string
  name: string
  nameNl: string
  count: number
  strengthCount: number
  improvementCount: number
  color: string
  examples: Array<{
    id: string
    content: string
    type: string
    createdAt: string
  }>
}

interface ThemesResponse {
  themes: ThemeData[]
  totalFeedback: number
  unrecognizedCount: number
  themeDistribution: Record<string, number>
}

export const ThemesView: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [themesData, setThemesData] = useState<ThemesResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedTheme, setSelectedTheme] = useState<string>('')
  const [error, setError] = useState<string>('')

  useEffect(() => {
    if (id) {
      loadThemes()
    }
  }, [id])

  const loadThemes = async () => {
    if (!id) return

    setIsLoading(true)
    setError('')

    const response = await api.getThemes(id)

    if (response.data) {
      setThemesData(response.data)
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

  const getThemeIcon = (themeName: string) => {
    const icons: Record<string, string> = {
      'Communication': '💬',
      'Teamwork': '🤝',
      'Effort': '💪',
      'Leadership': '👑',
      'Reliability': '⚡',
      'Creativity': '✨'
    }
    return icons[themeName] || '📋'
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading team themes...</p>
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
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Themes</h1>
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

  if (!themesData || themesData.themes.length === 0) {
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
                <h1 className="text-2xl font-bold text-gray-900">Team Themes</h1>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No Themes Detected</h2>
            <p className="text-gray-600">No feedback has been clustered into themes yet, or themes need more data to be meaningful.</p>
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
              <h1 className="text-responsive-2xl font-bold text-gray-900 truncate">Team Themes Analysis</h1>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <span className="text-sm text-gray-600 text-center sm:text-left">
                {themesData.totalFeedback} feedback items analyzed
              </span>
              <button
                onClick={loadThemes}
                className="btn-mobile bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors self-center sm:self-start"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto py-4 md:py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 md:mb-8">
          <div className="mobile-card bg-white text-center">
            <div className="text-2xl md:text-3xl font-bold text-blue-600 mb-2">{themesData.themes.length}</div>
            <div className="text-sm text-gray-600">Detected Themes</div>
          </div>
          <div className="mobile-card bg-white text-center">
            <div className="text-2xl md:text-3xl font-bold text-green-600 mb-2">{themesData.totalFeedback}</div>
            <div className="text-sm text-gray-600">Total Feedback</div>
          </div>
          <div className="mobile-card bg-white text-center sm:col-span-2 lg:col-span-1">
            <div className="text-2xl md:text-3xl font-bold text-orange-600 mb-2">{themesData.unrecognizedCount}</div>
            <div className="text-sm text-gray-600">Unrecognized</div>
          </div>
        </div>

        {/* Themes Visualization */}
        <div className="mobile-card bg-white mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
            <h2 className="text-responsive-xl font-semibold text-gray-900">Team Themes</h2>
            <div className="text-sm text-gray-600 text-center sm:text-right">
              Ranked by frequency
            </div>
          </div>

          {/* Bar Chart Visualization */}
          <div className="mobile-spacing">
            {themesData.themes.map((theme) => (
              <div
                key={theme.id}
                className="relative bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors cursor-pointer touch-target"
                onClick={() => setSelectedTheme(selectedTheme === theme.id ? '' : theme.id)}
              >
                <div className="mobile-layout items-center gap-4">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <span className="text-2xl flex-shrink-0">{getThemeIcon(theme.name)}</span>
                    <div className="min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">{theme.nameNl}</h3>
                      <p className="text-sm text-gray-600 truncate">{theme.name}</p>
                    </div>
                  </div>
                  <div className="text-center sm:text-right flex-shrink-0">
                    <div className="text-responsive-lg font-bold text-gray-900">{theme.count}</div>
                    <div className="text-sm text-gray-600">mentions</div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
                  <div
                    className="h-3 rounded-full transition-all"
                    style={{
                      width: `${Math.min((theme.count / Math.max(...themesData.themes.map(t => t.count))) * 100, 100)}%`,
                      backgroundColor: theme.color
                    }}
                  ></div>
                </div>

                {/* Type Breakdown */}
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <div className="flex items-center space-x-1">
                    <div className="w-3 h-3 bg-green-500 rounded-full flex-shrink-0"></div>
                    <span className="text-green-700">{theme.strengthCount} strengths</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-3 h-3 bg-orange-500 rounded-full flex-shrink-0"></div>
                    <span className="text-orange-700">{theme.improvementCount} improvements</span>
                  </div>
                </div>

                {/* Examples (expandable) */}
                {selectedTheme === theme.id && theme.examples.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Example Feedback:</h4>
                    <div className="mobile-spacing">
                      {theme.examples.map((example) => (
                        <div key={example.id} className="bg-white border border-gray-200 rounded-lg p-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm break-words ${example.type === 'strength' ? 'text-green-800' : 'text-orange-800'}`}>
                                {example.type === 'strength' ? '💪 ' : '🔧 '}{example.content}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {formatDate(example.createdAt)}
                              </p>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                copyToClipboard(example.content)
                              }}
                              className="touch-target p-2 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0 rounded-md hover:bg-gray-50"
                              title="Copy feedback"
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
        </div>

        {/* Unrecognized Feedback */}
        {themesData.unrecognizedCount > 0 && (
          <div className="mobile-card bg-white">
            <div className="flex items-start space-x-3 mb-4">
              <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path>
              </svg>
              <div>
                <h3 className="text-responsive-lg font-semibold text-gray-900 mb-2">Unrecognized Feedback</h3>
                <p className="text-gray-600 text-sm mb-2">
                  {themesData.unrecognizedCount} feedback items couldn't be automatically categorized into themes.
                </p>
                <p className="text-sm text-gray-500">
                  This could indicate emerging themes that need to be added to our theme definitions, or feedback that doesn't fit current patterns.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Theme Distribution Chart */}
        <div className="mobile-card bg-white">
          <h3 className="text-responsive-lg font-semibold text-gray-900 mb-4">Theme Distribution</h3>
          <div className="mobile-spacing">
            {Object.entries(themesData.themeDistribution)
              .sort(([,a], [,b]) => b - a)
              .map(([themeId, count]) => {
                const theme = themesData.themes.find(t => t.id === themeId)
                if (!theme) return null

                return (
                  <div key={themeId} className="mobile-layout items-center gap-4">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <span className="text-lg flex-shrink-0">{getThemeIcon(theme.name)}</span>
                      <span className="font-medium text-gray-900 truncate">{theme.nameNl}</span>
                    </div>
                    <div className="flex items-center space-x-3 flex-shrink-0">
                      <div className="w-24 md:w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full"
                          style={{
                            width: `${(count / Math.max(...Object.values(themesData.themeDistribution))) * 100}%`,
                            backgroundColor: theme.color
                          }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-700 w-8 text-right">{count}</span>
                    </div>
                  </div>
                )
              })}
          </div>
        </div>
      </main>
    </div>
  )
}

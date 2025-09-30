const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5011'

export interface ApiResponse<T = any> {
  data?: T
  error?: string
  message?: string
}

class ApiService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('auth_token')
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: this.getAuthHeaders()
      })

      if (!response.ok) {
        return { error: `HTTP ${response.status}: ${response.statusText}` }
      }

      const data = await response.json()
      return { data }
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Network error' }
    }
  }

  async post<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: body ? JSON.stringify(body) : undefined
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: response.statusText }))
        return { error: errorData.error || `HTTP ${response.status}: ${response.statusText}` }
      }

      const data = await response.json()
      return { data }
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Network error' }
    }
  }

  async put<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: body ? JSON.stringify(body) : undefined
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: response.statusText }))
        return { error: errorData.error || `HTTP ${response.status}: ${response.statusText}` }
      }

      const data = await response.json()
      return { data }
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Network error' }
    }
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: response.statusText }))
        return { error: errorData.error || `HTTP ${response.status}: ${response.statusText}` }
      }

      const data = await response.json()
      return { data }
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Network error' }
    }
  }

  // Helper method for progress data
  async getProgress(roundId: string): Promise<ApiResponse<{
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
  }>> {
    return this.get(`/rounds/${roundId}/progress`)
  }

  // Helper method for feedback data
  async getFeedback(roundId: string, options?: {
    type?: 'strengths' | 'improvement'
    playerId?: string
  }): Promise<ApiResponse<{
    feedback: Array<{
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
    }>
    totalPlayers: number
    totalFeedback: number
    filter: {
      type?: 'strengths' | 'improvement'
      playerId?: string
    }
  }>> {
    const params = new URLSearchParams()
    if (options?.type) params.append('type', options.type)
    if (options?.playerId) params.append('playerId', options.playerId)

    const query = params.toString() ? `?${params.toString()}` : ''
    return this.get(`/feedback/round/${roundId}${query}`)
  }

  // Helper method for themes data
  async getThemes(roundId: string): Promise<ApiResponse<{
    themes: Array<{
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
    }>
    totalFeedback: number
    unrecognizedCount: number
    themeDistribution: Record<string, number>
  }>> {
    return this.get(`/rounds/${roundId}/themes`)
  }
}

export const api = new ApiService()

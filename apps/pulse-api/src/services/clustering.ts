import { FEEDBACK_THEMES, findThemeByKeyword, type ThemeDefinition } from './themes'

export interface FeedbackItem {
  id: string
  content: string
  type: 'strength' | 'improvement'
  createdAt: string
}

export interface ClusteredFeedback {
  theme: ThemeDefinition
  count: number
  examples: FeedbackItem[]
  strengthCount: number
  improvementCount: number
}

export interface ClusteringResult {
  themes: ClusteredFeedback[]
  totalFeedback: number
  unrecognizedCount: number
  themeDistribution: Record<string, number>
}

// Simple text preprocessing for better matching
function preprocessText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ') // Remove punctuation
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim()
}

// Enhanced theme detection with context awareness
function detectThemesInText(text: string): ThemeDefinition[] {
  const detectedThemes = new Set<ThemeDefinition>()
  const processedText = preprocessText(text)

  // Split into words for better matching
  const words = processedText.split(' ')

  for (const theme of FEEDBACK_THEMES) {
    let score = 0

    // Check for exact keyword matches (higher weight)
    for (const keyword of theme.keywords) {
      if (processedText.includes(keyword.toLowerCase())) {
        score += 3
      }
    }

    // Check for synonym matches (medium weight)
    for (const synonym of theme.synonyms) {
      if (processedText.includes(synonym.toLowerCase())) {
        score += 2
      }
    }

    // Check for word-level matches (lower weight)
    for (const word of words) {
      if (theme.keywords.some(k => k.toLowerCase().includes(word) || word.includes(k.toLowerCase()))) {
        score += 1
      }
      if (theme.synonyms.some(s => s.toLowerCase().includes(word) || word.includes(s.toLowerCase()))) {
        score += 0.5
      }
    }

    // If score is high enough, consider it a match
    if (score >= 1.5) {
      detectedThemes.add(theme)
    }
  }

  return Array.from(detectedThemes)
}

// Main clustering function
export function clusterFeedback(feedbackItems: FeedbackItem[]): ClusteringResult {
  const themeMap = new Map<string, ClusteredFeedback>()
  const unrecognized: FeedbackItem[] = []

  // Initialize theme map
  for (const theme of FEEDBACK_THEMES) {
    themeMap.set(theme.id, {
      theme,
      count: 0,
      examples: [],
      strengthCount: 0,
      improvementCount: 0
    })
  }

  // Process each feedback item
  for (const item of feedbackItems) {
    const detectedThemes = detectThemesInText(item.content)

    if (detectedThemes.length === 0) {
      // No themes detected - add to unrecognized
      unrecognized.push(item)
    } else {
      // Use the first detected theme (could be enhanced to use best match)
      const primaryTheme = detectedThemes[0]
      if (!primaryTheme) {
        unrecognized.push(item)
        continue
      }

      const clustered = themeMap.get(primaryTheme.id)!

      clustered.count++
      clustered.examples.push(item)

      // Update type counts
      if (item.type === 'strength') {
        clustered.strengthCount++
      } else {
        clustered.improvementCount++
      }

      // Keep only top 3 examples per theme for performance
      if (clustered.examples.length > 3) {
        clustered.examples.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        clustered.examples = clustered.examples.slice(0, 3)
      }
    }
  }

  // Convert to array and sort by count (descending)
  const themes = Array.from(themeMap.values())
    .filter(theme => theme.count > 0)
    .sort((a, b) => b.count - a.count)

  // Calculate theme distribution
  const themeDistribution: Record<string, number> = {}
  for (const theme of themes) {
    themeDistribution[theme.theme.id] = theme.count
  }

  return {
    themes,
    totalFeedback: feedbackItems.length,
    unrecognizedCount: unrecognized.length,
    themeDistribution
  }
}

// Helper function to get feedback items from database structure
export function convertDatabaseFeedbackToItems(dbFeedback: any[]): FeedbackItem[] {
  const items: FeedbackItem[] = []

  for (const feedback of dbFeedback) {
    // Add strengths as separate items
    if (feedback.strengths && feedback.strengths.length > 0) {
      for (const strength of feedback.strengths) {
        items.push({
          id: `${feedback._id}_strength_${feedback.strengths.indexOf(strength)}`,
          content: strength,
          type: 'strength',
          createdAt: feedback.createdAt || new Date().toISOString()
        })
      }
    }

    // Add improvement as separate item
    if (feedback.improvement) {
      items.push({
        id: `${feedback._id}_improvement`,
        content: feedback.improvement,
        type: 'improvement',
        createdAt: feedback.createdAt || new Date().toISOString()
      })
    }
  }

  return items
}

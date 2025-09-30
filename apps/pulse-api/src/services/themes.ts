// Theme definitions for feedback clustering
export interface ThemeDefinition {
  id: string
  name: string
  nameNl: string // Dutch translation
  keywords: string[]
  synonyms: string[]
  description: string
  color: string
}

export const FEEDBACK_THEMES: ThemeDefinition[] = [
  {
    id: 'communication',
    name: 'Communication',
    nameNl: 'Communicatie',
    keywords: [
      'communicatie', 'luisteren', 'spreken', 'vertellen', 'delen', 'uitleggen',
      'begrijpen', 'duidelijk', 'helder', 'spraak', 'gesprek', 'dialoog',
      'communiceert', 'vertelt', 'legt uit', 'bespreken', 'overleggen'
    ],
    synonyms: [
      'spraak', 'gesprek', 'dialoog', 'uitleg', 'vertellen', 'delen',
      'luisteren', 'begrijpen', 'duidelijk', 'helder'
    ],
    description: 'Communication skills and clarity in interactions',
    color: '#3B82F6' // blue
  },
  {
    id: 'teamwork',
    name: 'Teamwork',
    nameNl: 'Teamwerk',
    keywords: [
      'teamwerk', 'samenwerken', 'samen', 'team', 'hulp', 'ondersteuning',
      'samenwerking', 'teamspeler', 'collega', 'elkaar', 'gezamenlijk',
      'teamgeest', 'samen doen', 'helpen', 'ondersteunen', 'bijstaan'
    ],
    synonyms: [
      'samenwerken', 'team', 'samen', 'hulp', 'ondersteuning',
      'samenwerking', 'teamspeler', 'collega'
    ],
    description: 'Collaboration and team spirit',
    color: '#10B981' // green
  },
  {
    id: 'effort',
    name: 'Effort',
    nameNl: 'Inzet',
    keywords: [
      'inzet', 'inspanning', 'hard werken', 'toegewijd', 'gemotiveerd',
      'werkt hard', 'ijverig', 'gedreven', 'energie', 'passie', 'enthousiasme',
      'werkt door', 'zet zich in', 'geeft alles', 'probeert', 'doet moeite'
    ],
    synonyms: [
      'inzet', 'inspanning', 'hard werken', 'toegewijd', 'gemotiveerd',
      'werkt hard', 'ijverig', 'gedreven'
    ],
    description: 'Dedication and hard work',
    color: '#F59E0B' // amber
  },
  {
    id: 'leadership',
    name: 'Leadership',
    nameNl: 'Leiderschap',
    keywords: [
      'leiding', 'leider', 'aanvoeren', 'beslissen', 'besluit', 'sturen',
      'richten', 'begeleiden', 'coachen', 'mentor', 'voorbeeld', 'inspireren',
      'leidt', 'beslist', 'stuurt', 'begeleidt', 'inspireert'
    ],
    synonyms: [
      'leiding', 'leider', 'aanvoeren', 'beslissen', 'sturen',
      'begeleiden', 'inspireren'
    ],
    description: 'Leadership and guidance skills',
    color: '#8B5CF6' // purple
  },
  {
    id: 'reliability',
    name: 'Reliability',
    nameNl: 'Betrouwbaarheid',
    keywords: [
      'betrouwbaar', 'vertrouwen', 'afspraak', 'nakomen', 'stipt', 'precies',
      'op tijd', 'gezegd', 'beloofd', 'verantwoordelijk', 'plichtsbesef',
      'betrouwbaar', 'houdt zich aan', 'nakomt', 'is op tijd', 'doet wat gezegd'
    ],
    synonyms: [
      'betrouwbaar', 'vertrouwen', 'nakomen', 'stipt', 'op tijd',
      'verantwoordelijk'
    ],
    description: 'Reliability and dependability',
    color: '#059669' // emerald
  },
  {
    id: 'creativity',
    name: 'Creativity',
    nameNl: 'Creativiteit',
    keywords: [
      'creatief', 'innovatief', 'nieuw', 'origineel', 'anders', 'vernieuwend',
      'denkt buiten', 'box', 'oplossingen', 'ideeën', 'bedenken', 'uitvinden',
      'creatief denken', 'innovatie', 'nieuwe ideeën', 'origineel'
    ],
    synonyms: [
      'creatief', 'innovatief', 'nieuw', 'origineel', 'anders',
      'denkt buiten', 'oplossingen'
    ],
    description: 'Creative thinking and innovation',
    color: '#EC4899' // pink
  }
]

// Helper function to find theme by keyword
export function findThemeByKeyword(text: string): ThemeDefinition | null {
  const lowerText = text.toLowerCase()

  for (const theme of FEEDBACK_THEMES) {
    // Check exact keywords
    if (theme.keywords.some(keyword => lowerText.includes(keyword.toLowerCase()))) {
      return theme
    }

    // Check synonyms
    if (theme.synonyms.some(synonym => lowerText.includes(synonym.toLowerCase()))) {
      return theme
    }
  }

  return null
}

// Helper function to get all theme keywords for matching
export function getAllThemeKeywords(): string[] {
  return FEEDBACK_THEMES.flatMap(theme => [...theme.keywords, ...theme.synonyms])
}

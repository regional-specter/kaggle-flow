export const STUDY_TOPICS = [
  'Classification',
  'Regression',
  'Time series',
  'Text',
  'Clustering',
  'Recommendation',
] as const

export type StudyTopic = (typeof STUDY_TOPICS)[number]

export const STUDY_LENSES = [
  {
    id: 'models',
    title: 'Models and experiments',
    blurb: 'Fits worth trying, and the comparison that makes them meaningful.',
  },
  {
    id: 'statistics',
    title: 'Statistical modelling',
    blurb: 'Estimates, uncertainty, and the checks a score will not show.',
  },
  {
    id: 'interviews',
    title: 'Interview questions',
    blurb: 'Questions a data-role screen can ask with this table open.',
  },
  {
    id: 'research',
    title: 'Research ideas',
    blurb: 'Angles a short paper, thesis, or replication can actually pursue.',
  },
  {
    id: 'applications',
    title: 'Real-world use',
    blurb: 'Where the same decision shows up in a product or an operation.',
  },
] as const

export type StudyLens = (typeof STUDY_LENSES)[number]['id']

export type StudyTone = 'good' | 'warn' | 'idle'

export interface StudyPoint {
  title: string
  detail: string
}

export interface StudySection {
  tone: StudyTone
  toneLabel: string
  points: StudyPoint[]
}

export interface CuratedDataset {
  ref: string
  title: string
  owner: string
  topic: StudyTopic
  tags: string[]
  rows: number
  rowsLabel: string
  shape: string
  summary: string
  fileNote: string
  split: {
    marker: string
    trainLabel: string
    holdoutLabel: string
    trainShare: number
    caption: string
  }
  signal: {
    interview: number
    research: number
    applied: number
  }
  sections: Record<StudyLens, StudySection>
}

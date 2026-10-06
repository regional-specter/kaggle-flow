export interface KaggleCredentials {
  username: string
  apiKey: string
}

export interface KaggleDataset {
  ref: string
  title: string
  creatorName?: string
  ownerName?: string
  totalBytes?: number
  usabilityRating?: number
  voteCount?: number
  downloadCount?: number
  lastUpdated?: string
  subtitle?: string
  description?: string
}

export interface DatasetListParams {
  sortBy?: string
  page?: number
  search?: string
  pageSize?: number
}

export type AppTab = 'discover' | 'study' | 'bookmarked' | 'settings'

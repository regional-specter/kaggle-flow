export function formatBytes(bytes?: number): string {
  if (bytes == null || bytes === 0) return '—'
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  const value = bytes / Math.pow(1024, i)
  return `${value < 10 ? value.toFixed(1) : Math.round(value)}${units[i]}`
}

/** Card-sized row counts: "217 thousand" → "217K", "13 million" → "13M". */
export function formatRowLabel(label: string): string {
  return label.replace(/ million/gi, 'M').replace(/ thousand/gi, 'K')
}

export function formatCount(value?: number): string {
  if (value == null) return '—'
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}k`
  return value.toLocaleString()
}

export function formatRating(value?: number): string {
  if (value == null) return '—'
  return value.toFixed(1)
}

export function formatDate(value?: string): string {
  if (!value) return '—'
  return new Date(value).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function getCreatorName(dataset: {
  creatorName?: string
  ownerName?: string
}): string {
  return dataset.creatorName ?? dataset.ownerName ?? 'Unknown'
}

export function getKaggleDatasetUrl(ref: string): string {
  return `https://www.kaggle.com/datasets/${ref}`
}

/** Strip markdown/HTML and clamp description text for card display */
export function stripDescriptionText(text: string): string {
  return text
    .replace(/<[^>]+>/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[#*_`>~-]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

export function getDatasetDescription(
  dataset: { subtitle?: string; description?: string },
  maxLength = 140,
): string | null {
  const raw = dataset.subtitle?.trim() || dataset.description?.trim()
  if (!raw) return null

  const cleaned = stripDescriptionText(raw)
  if (!cleaned) return null

  if (cleaned.length <= maxLength) return cleaned
  return `${cleaned.slice(0, maxLength).trimEnd()}…`
}

export function parseDatasetRef(ref: string): { owner: string; slug: string } | null {
  const [owner, slug] = ref.split('/')
  if (!owner || !slug) return null
  return { owner, slug }
}

/** Summary copy built only from live Kaggle metadata fields */
export function buildDatasetSummary(dataset: {
  downloadCount?: number
  voteCount?: number
  usabilityRating?: number
  lastUpdated?: string
}): string {
  const downloads = formatCount(dataset.downloadCount)
  const votes = formatCount(dataset.voteCount)
  const rating = formatRating(dataset.usabilityRating)
  const updated = formatDate(dataset.lastUpdated)

  return `Usability score ${rating} with ${downloads} downloads and ${votes} community votes. Last updated ${updated}.`
}

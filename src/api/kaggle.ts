import type {
  DatasetListParams,
  KaggleCredentials,
  KaggleDataset,
} from '../types/kaggle'
import { parseDatasetRef } from '../utils/format'

const KAGGLE_API_BASE =
  import.meta.env.VITE_KAGGLE_API_BASE ?? '/api/kaggle'

type RawDataset = Record<string, unknown>

export function resolveCredentials(input: KaggleCredentials): KaggleCredentials {
  let username = input.username.trim()
  let apiKey = input.apiKey.trim()

  if (apiKey.toLowerCase().startsWith('bearer ')) {
    apiKey = apiKey.slice('bearer '.length).trim()
  }

  if (
    (apiKey.startsWith('"') && apiKey.endsWith('"')) ||
    (apiKey.startsWith("'") && apiKey.endsWith("'"))
  ) {
    apiKey = apiKey.slice(1, -1).trim()
  }

  if (apiKey.startsWith('{')) {
    try {
      const parsed = JSON.parse(apiKey) as { username?: unknown; key?: unknown }
      if (typeof parsed.username === 'string' && typeof parsed.key === 'string') {
        username = parsed.username.trim()
        apiKey = parsed.key.trim()
      }
    } catch {
      // Keep the raw value so validation can report it.
    }
  }

  return {
    username,
    apiKey: apiKey.replace(/[\u0000\r\n]/g, ''),
  }
}

export function isAccessToken(apiKey: string): boolean {
  return apiKey.startsWith('KGAT_')
}

export function hasUsableCredentials(credentials: KaggleCredentials): boolean {
  const resolved = resolveCredentials(credentials)
  if (!resolved.apiKey) return false
  return isAccessToken(resolved.apiKey) || Boolean(resolved.username)
}

function encodeBasic(username: string, apiKey: string): string {
  const raw = `${username}:${apiKey}`
  if ([...raw].some((char) => char.charCodeAt(0) > 255)) {
    throw new Error(
      'Username or API key contains a character this browser cannot encode. Paste the token again.',
    )
  }
  return btoa(raw)
}

function buildAuthHeader(credentials: KaggleCredentials): string {
  const resolved = resolveCredentials(credentials)
  // Tokens from "Generate New Token" are KGAT_… and must use Bearer.
  // Basic auth is only for a legacy username plus API key.
  if (isAccessToken(resolved.apiKey)) {
    return `Bearer ${resolved.apiKey}`
  }
  if (!resolved.username || !resolved.apiKey) {
    throw new Error(
      'Paste an API token from kaggle.com/settings, or enter both your username and a legacy API key.',
    )
  }
  return `Basic ${encodeBasic(resolved.username, resolved.apiKey)}`
}

function readErrorMessage(status: number, statusText: string, body: string): string {
  const trimmed = body.trim()
  if (trimmed.startsWith('{')) {
    try {
      const parsed = JSON.parse(trimmed) as {
        message?: unknown
        error?: unknown
      }
      if (typeof parsed.message === 'string' && parsed.message.trim()) {
        return parsed.message.trim()
      }
      if (typeof parsed.error === 'string' && parsed.error.trim()) {
        return parsed.error.trim()
      }
    } catch {
      // Fall through to the plain-text handling below.
    }
  }

  if (!trimmed || trimmed === 'Internal Server Error') {
    return `Could not reach Kaggle (${status}). Check your connection and try again.`
  }

  if (trimmed.startsWith('<') || trimmed.length > 400) {
    return `Kaggle returned ${status}. Generate a new API token at kaggle.com/settings and try again.`
  }

  return trimmed || `Kaggle API error (${status} ${statusText})`
}

async function kaggleFetch<T>(
  path: string,
  credentials: KaggleCredentials,
  params?: Record<string, string | number | undefined>,
): Promise<T> {
  const isProxy = !KAGGLE_API_BASE.startsWith('http')
  const url = isProxy
    ? new URL(`${KAGGLE_API_BASE}${path}`, window.location.origin)
    : new URL(`${KAGGLE_API_BASE}${path}`)

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        url.searchParams.set(key, String(value))
      }
    })
  }

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      Authorization: buildAuthHeader(credentials),
      Accept: 'application/json',
    },
  })

  if (!response.ok) {
    const message = await response.text().catch(() => '')
    if (response.status === 401) {
      throw new Error(
        'Kaggle rejected this token. On kaggle.com/settings, choose Generate New Token and paste the value that starts with KGAT_. A legacy key also needs your username.',
      )
    }
    throw new Error(readErrorMessage(response.status, response.statusText, message))
  }

  return response.json() as Promise<T>
}

function pickString(raw: RawDataset, ...keys: string[]): string | undefined {
  for (const key of keys) {
    const value = raw[key]
    if (typeof value === 'string' && value.trim()) return value
  }
  return undefined
}

function pickNumber(raw: RawDataset, ...keys: string[]): number | undefined {
  for (const key of keys) {
    const value = raw[key]
    if (typeof value === 'number' && !Number.isNaN(value)) return value
  }
  return undefined
}

export function normalizeDataset(raw: RawDataset): KaggleDataset {
  return {
    ref: pickString(raw, 'ref') ?? '',
    title: pickString(raw, 'title') ?? 'Untitled dataset',
    creatorName: pickString(raw, 'creatorName', 'creator_name'),
    ownerName: pickString(raw, 'ownerName', 'owner_name'),
    totalBytes: pickNumber(raw, 'totalBytes', 'total_bytes'),
    usabilityRating: pickNumber(raw, 'usabilityRating', 'usability_rating'),
    voteCount: pickNumber(raw, 'voteCount', 'vote_count'),
    downloadCount: pickNumber(raw, 'downloadCount', 'download_count'),
    lastUpdated: pickString(raw, 'lastUpdated', 'last_updated'),
    subtitle: pickString(raw, 'subtitle'),
    description: pickString(raw, 'description'),
  }
}

export async function listDatasets(
  credentials: KaggleCredentials,
  params: DatasetListParams = {},
): Promise<KaggleDataset[]> {
  const { sortBy = 'hottest', page = 1, search = '', pageSize = 20 } = params

  const results = await kaggleFetch<RawDataset[]>('/datasets/list', credentials, {
    sort_by: sortBy,
    page,
    search,
    page_size: pageSize,
  })

  return results.map(normalizeDataset)
}

interface DatasetMetadataResponse {
  info?: {
    subtitle?: string
    description?: string
  }
  subtitle?: string
  description?: string
}

export async function getDatasetMetadata(
  credentials: KaggleCredentials,
  ref: string,
): Promise<Pick<KaggleDataset, 'subtitle' | 'description'>> {
  const parsed = parseDatasetRef(ref)
  if (!parsed) return {}

  const response = await kaggleFetch<DatasetMetadataResponse>(
    `/datasets/metadata/${parsed.owner}/${parsed.slug}`,
    credentials,
  )

  return {
    subtitle: response.info?.subtitle ?? response.subtitle,
    description: response.info?.description ?? response.description,
  }
}

export async function validateCredentials(
  credentials: KaggleCredentials,
): Promise<boolean> {
  // Dataset search stays public, so it cannot tell a real token from a bad one.
  // Competition listing requires the token and returns 401 when it is rejected.
  await kaggleFetch<unknown>('/competitions/list', credentials, { page: 1 })
  return true
}

import type { VercelRequest, VercelResponse } from '@vercel/node'

const KAGGLE_API_BASE = 'https://www.kaggle.com/api/v1'

const ALLOWED_PATH_PREFIXES = [
  '/datasets/list',
  '/datasets/metadata/',
  '/competitions/list',
]

const KAGGLE_USER_AGENT = 'kaggle-api/v1.7.0'

function getKagglePath(pathQuery: string | string[] | undefined): string {
  if (!pathQuery) return ''
  const segments = Array.isArray(pathQuery) ? pathQuery : [pathQuery]
  const joined = segments.filter(Boolean).join('/')
  return joined.startsWith('/') ? joined : `/${joined}`
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const auth = req.headers.authorization
  if (
    typeof auth !== 'string' ||
    /[\r\n]/.test(auth) ||
    (!auth.startsWith('Basic ') && !auth.startsWith('Bearer '))
  ) {
    return res.status(401).json({ error: 'Missing Authorization header' })
  }

  const kagglePath = getKagglePath(req.query.path)

  if (!ALLOWED_PATH_PREFIXES.some((prefix) => kagglePath.startsWith(prefix))) {
    return res.status(403).json({ error: 'Path not allowed' })
  }

  const url = new URL(`${KAGGLE_API_BASE}${kagglePath}`)
  for (const [key, value] of Object.entries(req.query)) {
    if (key !== 'path' && value !== undefined) {
      url.searchParams.set(key, String(value))
    }
  }

  try {
    const upstream = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        Authorization: auth,
        Accept: 'application/json',
        'User-Agent': KAGGLE_USER_AGENT,
      },
    })

    const body = await upstream.text()
    res.status(upstream.status)
    res.setHeader(
      'Content-Type',
      upstream.headers.get('content-type') ?? 'application/json',
    )
    return res.send(body)
  } catch {
    return res.status(502).json({ error: 'Failed to reach Kaggle API' })
  }
}

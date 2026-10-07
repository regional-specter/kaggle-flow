import type { CuratedDataset, StudyLens, StudyPoint } from '../types/curator'
import { STUDY_LENSES } from '../types/curator'

const MODEL = 'gemini-3.5-flash-lite'
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`

export const STUDY_PROMPT_VERSION = 2

const LENS_IDS = STUDY_LENSES.map((lens) => lens.id)

interface GeminiPart {
  text?: string
  thought?: boolean
}

interface GeminiResponse {
  candidates?: Array<{
    content?: { parts?: GeminiPart[] }
  }>
  error?: { message?: string }
}

function responseText(payload: GeminiResponse): string {
  const parts = payload.candidates?.[0]?.content?.parts ?? []
  const visible = parts.filter((part) => part.text && !part.thought)
  const chosen = visible.length > 0 ? visible : parts
  return chosen.map((part) => part.text ?? '').join('').trim()
}

function geminiError(payload: GeminiResponse | null, status: number): Error {
  return new Error(payload?.error?.message || `Gemini request failed (${status}).`)
}

async function generate(
  apiKey: string,
  body: Record<string, unknown>,
  timeoutMs: number,
  signal?: AbortSignal,
): Promise<string> {
  const timeout = AbortSignal.timeout(timeoutMs)
  let response: Response
  try {
    response = await fetch(ENDPOINT, {
      method: 'POST',
      signal: signal ? AbortSignal.any([signal, timeout]) : timeout,
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify(body),
    })
  } catch (err) {
    if (signal?.aborted) throw err
    if (timeout.aborted) throw new Error('Gemini took too long to answer. Try again.')
    throw new Error('Could not reach Gemini. Check your connection and try again.')
  }

  const payload = (await response.json().catch(() => null)) as GeminiResponse | null
  if (!response.ok) throw geminiError(payload, response.status)

  const text = payload ? responseText(payload) : ''
  if (!text) throw new Error('Gemini returned an empty note.')
  return text
}

export async function validateGeminiKey(apiKey: string): Promise<void> {
  const timeout = AbortSignal.timeout(12_000)
  let response: Response
  try {
    response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}`,
      {
        signal: timeout,
        headers: { 'x-goog-api-key': apiKey.trim() },
      },
    )
  } catch {
    if (timeout.aborted) throw new Error('Gemini took too long to answer. Try again.')
    throw new Error('Could not reach Gemini. Check your connection and try again.')
  }

  if (response.ok) return
  const payload = (await response.json().catch(() => null)) as GeminiResponse | null
  throw geminiError(payload, response.status)
}

function seedFor(dataset: CuratedDataset): string {
  const notes = STUDY_LENSES.map((lens) => {
    const section = dataset.sections[lens.id]
    const lines = section.points.map((point) => `- ${point.title}: ${point.detail}`).join('\n')
    return `${lens.id} (${section.toneLabel})\n${lines}`
  }).join('\n\n')

  return [
    `Dataset: ${dataset.title}`,
    `Ref: ${dataset.ref}`,
    `Owner: ${dataset.owner}`,
    `Topic: ${dataset.topic}`,
    `Rows: ${dataset.rowsLabel} (${dataset.rows})`,
    `Shape: ${dataset.shape}`,
    `Summary: ${dataset.summary}`,
    `Files: ${dataset.fileNote}`,
    `Split: ${dataset.split.caption}. Train ${dataset.split.trainShare}% (${dataset.split.trainLabel}); holdout ${dataset.split.holdoutLabel}; marker ${dataset.split.marker}.`,
    `Tags: ${dataset.tags.join(', ')}`,
    '',
    'Facts already established. Do not contradict them:',
    notes,
  ].join('\n')
}

const STUDY_SCHEMA = {
  type: 'object',
  properties: {
    lenses: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', enum: [...LENS_IDS] },
          points: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                detail: { type: 'string' },
              },
              required: ['title', 'detail'],
            },
          },
        },
        required: ['id', 'points'],
      },
    },
  },
  required: ['lenses'],
}

export async function writeStudyNote(
  apiKey: string,
  dataset: CuratedDataset,
  signal?: AbortSignal,
): Promise<Record<StudyLens, StudyPoint[]>> {
  const text = await generate(
    apiKey.trim(),
    {
      systemInstruction: {
        parts: [
          {
            text: [
              'You write study notes for one public dataset used to learn ordinary machine learning and statistics.',
              'The notes must be specific to this table. Do not give a generic checklist, and do not paraphrase the seed.',
              'Each lens gets exactly 3 points. Each detail is 90 to 140 words of plain prose, longer than the seed, with a concrete procedure, comparison, or result.',
              'Research ideas must be unusual enough to be worth doing and still possible on this public file. Name the estimator, the comparison, and what would count as a finding.',
              'Interview details answer the question, they do not only restate it.',
              'Use LaTeX. Models and statistics must each include at least one display formula in $$...$$. Use $...$ for inline quantities. Do not use \\( \\) or \\[ \\]. Do not use a dollar sign for money; write USD.',
              'Stay inside the facts in the seed. Do not invent columns, row counts, or a target that the seed does not support.',
              'No markdown headings, bullets, or code fences inside title or detail.',
            ].join(' '),
          },
        ],
      },
      contents: [{ role: 'user', parts: [{ text: seedFor(dataset) }] }],
      generationConfig: {
        maxOutputTokens: 8192,
        thinkingConfig: { thinkingLevel: 'minimal' },
        responseMimeType: 'application/json',
        responseSchema: STUDY_SCHEMA,
      },
    },
    90_000,
    signal,
  )

  return parseStudyNote(text, dataset)
}

function readPoints(value: unknown): StudyPoint[] {
  if (!Array.isArray(value)) return []
  return value.flatMap((item) => {
    if (!item || typeof item !== 'object') return []
    const record = item as { title?: unknown; detail?: unknown }
    const title = typeof record.title === 'string' ? record.title.trim() : ''
    const detail = typeof record.detail === 'string' ? record.detail.trim() : ''
    if (!title || !detail) return []
    return [{ title, detail }]
  })
}

export function parseStudyNote(
  raw: string,
  dataset: CuratedDataset,
): Record<StudyLens, StudyPoint[]> {
  const start = raw.indexOf('{')
  const end = raw.lastIndexOf('}')
  if (start < 0 || end <= start) {
    throw new Error('Gemini returned a note this app could not read.')
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(raw.slice(start, end + 1))
  } catch {
    throw new Error('Gemini returned a note this app could not read.')
  }

  const lenses = new Map<string, StudyPoint[]>()
  const record = parsed as { lenses?: unknown }
  const entries = Array.isArray(record.lenses)
    ? record.lenses
    : parsed && typeof parsed === 'object'
      ? Object.entries(parsed as Record<string, unknown>).map(([id, points]) => ({ id, points }))
      : []

  for (const entry of entries) {
    if (!entry || typeof entry !== 'object') continue
    const item = entry as { id?: unknown; points?: unknown }
    const id = typeof item.id === 'string' ? item.id : ''
    if (!LENS_IDS.includes(id as StudyLens)) continue
    const points = readPoints(item.points).slice(0, 4)
    if (points.length > 0) lenses.set(id, points)
  }

  if (lenses.size < 4) {
    throw new Error('Gemini returned a note this app could not read.')
  }

  return Object.fromEntries(
    LENS_IDS.map((id) => [id, lenses.get(id) ?? dataset.sections[id].points]),
  ) as Record<StudyLens, StudyPoint[]>
}

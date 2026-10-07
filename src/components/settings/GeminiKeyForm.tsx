import { useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, Sparkles, Trash2 } from 'lucide-react'
import { validateGeminiKey } from '../../api/gemini'
import { ErrorState } from '../ui/ErrorState'
import { StatusBadge } from '../ui/StatusBadge'

interface GeminiKeyFormProps {
  apiKey: string
  hasKey: boolean
  onSave: (apiKey: string) => void
  onClear: () => void
}

export function GeminiKeyForm({ apiKey, hasKey, onSave, onClear }: GeminiKeyFormProps) {
  const [value, setValue] = useState(apiKey)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setSaving(true)
    setError(null)
    setSaved(false)

    const next = value.trim()
    try {
      await validateGeminiKey(next)
      onSave(next)
      setValue(next)
      setSaved(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to validate this Gemini API key.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-card sm:p-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-50 text-gray-700">
              <Sparkles className="h-5 w-5" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-gray-900">Gemini</h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-500">
              A Gemini key writes a longer study note for the dataset you have open, with
              formulas and ideas that go past the short starter text. Notes use Gemini 3.5
              Flash-Lite. The key stays in this browser and is sent only to Google.
            </p>
          </div>
          {hasKey ? (
            <StatusBadge variant="positive">Connected</StatusBadge>
          ) : (
            <StatusBadge variant="negative">Not configured</StatusBadge>
          )}
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label htmlFor="gemini-key" className="mb-2 block text-sm font-medium text-gray-700">
              API key
            </label>
            <input
              id="gemini-key"
              type="password"
              autoComplete="off"
              value={value}
              onChange={(event) => setValue(event.target.value)}
              placeholder="Paste your Gemini API key"
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-gray-300 focus:bg-white focus:ring-2 focus:ring-gray-900/5"
            />
          </div>

          <p className="text-xs leading-relaxed text-gray-500">
            Create a key in{' '}
            <a
              href="https://aistudio.google.com/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-gray-700 underline-offset-2 hover:underline"
            >
              Google AI Studio
            </a>
            . Notes are cached on this device, so opening the same dataset again does not call
            Gemini unless you ask for a new write-up.
          </p>

          {error && (
            <div className="rounded-xl">
              <ErrorState title="Gemini key rejected" message={error} />
            </div>
          )}

          {saved && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
            >
              <CheckCircle2 className="h-4 w-4" />
              Gemini key saved. Open Study and a longer note will be written for the dataset
              you select.
            </motion.div>
          )}

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="submit"
              disabled={saving || !value.trim()}
              className="rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? 'Checking…' : 'Save Gemini key'}
            </button>
            {hasKey && (
              <button
                type="button"
                onClick={() => {
                  onClear()
                  setValue('')
                  setSaved(false)
                  setError(null)
                }}
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
              >
                <Trash2 className="h-4 w-4" />
                Clear Gemini key
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}

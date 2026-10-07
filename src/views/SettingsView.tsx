import { ShieldAlert } from 'lucide-react'
import { CredentialsForm } from '../components/settings/CredentialsForm'
import { GeminiKeyForm } from '../components/settings/GeminiKeyForm'
import type { KaggleCredentials } from '../types/kaggle'

interface SettingsViewProps {
  credentials: KaggleCredentials
  hasCredentials: boolean
  onSave: (credentials: KaggleCredentials) => void
  onClear: () => void
  geminiKey: string
  hasGeminiKey: boolean
  onSaveGemini: (apiKey: string) => void
  onClearGemini: () => void
}

export function SettingsView({
  credentials,
  hasCredentials,
  onSave,
  onClear,
  geminiKey,
  hasGeminiKey,
  onSaveGemini,
  onClearGemini,
}: SettingsViewProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
          Settings
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Configure your Kaggle connection and the Gemini key used for study notes.
        </p>
      </div>

      <CredentialsForm
        credentials={credentials}
        hasCredentials={hasCredentials}
        onSave={onSave}
        onClear={onClear}
      />

      <GeminiKeyForm
        apiKey={geminiKey}
        hasKey={hasGeminiKey}
        onSave={onSaveGemini}
        onClear={onClearGemini}
      />

      <div className="mx-auto max-w-2xl rounded-2xl border border-amber-100 bg-amber-50/50 p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
          <div className="space-y-2 text-sm leading-relaxed text-amber-950/80">
            <h2 className="font-semibold text-amber-950">Security notice</h2>
            <p>
              Your Kaggle username and API key are saved in{' '}
              <strong>plaintext</strong> in this browser&apos;s{' '}
              <code className="rounded bg-white/80 px-1 py-0.5 text-xs">
                localStorage
              </code>
              . Anyone with access to this device or browser profile can read
              them.
            </p>
            <p>
              The Kaggle token is sent only to Kaggle. The Gemini key is sent only
              to Google when a study note is written. This app is not affiliated
              with Kaggle or Google.
            </p>
            <p>
              Use your own API key at your own risk. Clear stored credentials
              when you are done, especially on shared or public computers.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

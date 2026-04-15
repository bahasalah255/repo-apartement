import { useCallback, useEffect, useState } from 'react'
import { adminSettingsApi, adminUpdateSettingsApi } from '../../lib/api.js'
import { useAuth } from '../../context/AuthContext.jsx'
import PageHeader from '../../components/admin/PageHeader.jsx'
import LoadingState from '../../components/admin/LoadingState.jsx'
import ErrorState from '../../components/admin/ErrorState.jsx'

export default function AdminSettingsPage() {
  const { token } = useAuth()
  const [settings, setSettings] = useState({ support_email: '', currency: 'MAD' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const loadSettings = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const response = await adminSettingsApi(token)
      setSettings((prev) => ({
        ...prev,
        support_email: response?.settings?.support_email ?? prev.support_email,
        currency: response?.settings?.currency ?? prev.currency,
      }))
    } catch (err) {
      setError(err.message ?? 'Impossible de charger les parametres.')
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    loadSettings()
  }, [loadSettings])

  async function handleSubmit(event) {
    event.preventDefault()
    setSaving(true)
    setMessage('')

    try {
      const response = await adminUpdateSettingsApi(token, settings)
      setSettings((prev) => ({ ...prev, ...(response.settings ?? {}) }))
      setMessage(response.message ?? 'Parametres enregistres.')
    } catch (err) {
      setError(err.message ?? 'Echec de sauvegarde.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <LoadingState label="Chargement des parametres..." />
  if (error) return <ErrorState message={error} onRetry={loadSettings} />

  return (
    <div>
      <PageHeader title="Parametres admin" description="Configuration globale de l'espace d'administration." />

      <form onSubmit={handleSubmit} className="dashboard-surface max-w-xl space-y-4 p-5">
        {message && <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{message}</p>}

        <div>
          <label htmlFor="support_email" className="mb-1 block text-sm font-medium text-slate-700">
            Email support
          </label>
          <input
            id="support_email"
            type="email"
            required
            value={settings.support_email}
            onChange={(event) => setSettings((prev) => ({ ...prev, support_email: event.target.value }))}
            className="dashboard-input"
          />
        </div>

        <div>
          <label htmlFor="currency" className="mb-1 block text-sm font-medium text-slate-700">
            Devise
          </label>
          <input
            id="currency"
            type="text"
            required
            value={settings.currency}
            onChange={(event) => setSettings((prev) => ({ ...prev, currency: event.target.value }))}
            className="dashboard-input"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="dashboard-primary-btn disabled:opacity-70"
        >
          {saving ? 'Sauvegarde...' : 'Enregistrer'}
        </button>
      </form>
    </div>
  )
}

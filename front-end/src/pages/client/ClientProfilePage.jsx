import { useCallback, useEffect, useState } from 'react'
import {
  clientProfileApi,
  clientUpdatePasswordApi,
  clientUpdateProfileApi,
} from '../../lib/api.js'
import { useAuth } from '../../context/AuthContext.jsx'
import { ClientLoadingState, ClientErrorState } from '../../components/client/ClientFriendlyState.jsx'

const initialProfile = { name: '', email: '', phone: '' }
const initialPassword = { current_password: '', password: '', password_confirmation: '' }

function getInitials(name) {
  if (!name) return '?'
  const parts = name.trim().split(' ').filter(Boolean)
  if (parts.length === 1) return parts[0][0].toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export default function ClientProfilePage() {
  const { token } = useAuth()
  const [profile, setProfile] = useState(initialProfile)
  const [passwordForm, setPasswordForm] = useState(initialPassword)
  const [loading, setLoading] = useState(true)
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showCurrentPw, setShowCurrentPw] = useState(false)
  const [showNewPw, setShowNewPw] = useState(false)
  const [showConfirmPw, setShowConfirmPw] = useState(false)

  const loadProfile = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const response = await clientProfileApi(token)
      setProfile({
        name: response.profile?.name ?? '',
        email: response.profile?.email ?? '',
        phone: response.profile?.phone ?? '',
      })
    } catch (err) {
      setError(err.message ?? 'Unable to load profile.')
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => { loadProfile() }, [loadProfile])

  async function handleProfileSubmit(event) {
    event.preventDefault()
    setSavingProfile(true)
    setSuccess('')
    setError('')
    try {
      const response = await clientUpdateProfileApi(token, profile)
      setProfile((prev) => ({ ...prev, ...(response.profile ?? {}) }))
      setSuccess(response.message ?? 'Profil mis à jour avec succès.')
    } catch (err) {
      setError(err.message ?? 'Unable to update profile.')
    } finally {
      setSavingProfile(false)
    }
  }

  async function handlePasswordSubmit(event) {
    event.preventDefault()
    setSavingPassword(true)
    setSuccess('')
    setError('')
    try {
      const response = await clientUpdatePasswordApi(token, passwordForm)
      setPasswordForm(initialPassword)
      setSuccess(response.message ?? 'Mot de passe modifié avec succès.')
    } catch (err) {
      setError(err.message ?? 'Unable to update password.')
    } finally {
      setSavingPassword(false)
    }
  }

  if (loading) return <ClientLoadingState label="Chargement du profil..." />
  if (error && !profile.email) return <ClientErrorState message={error} onRetry={loadProfile} />

  return (
    <div className="mx-auto max-w-3xl space-y-8">

      {/* ── Hero card ── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-6 py-8 text-white shadow-xl">
        {/* Background pattern */}
        <div className="pointer-events-none absolute inset-0 opacity-5">
          <div className="absolute -right-10 -top-10 h-64 w-64 rounded-full border-[40px] border-white" />
          <div className="absolute -bottom-16 -left-10 h-72 w-72 rounded-full border-[40px] border-white" />
        </div>

        <div className="relative flex flex-wrap items-center gap-5">
          {/* Avatar */}
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-2xl font-bold backdrop-blur-sm ring-2 ring-white/20">
            {getInitials(profile.name)}
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold uppercase tracking-widest text-white/50">Mon compte</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight">{profile.name || 'Votre profil'}</h1>
            <div className="mt-2 flex flex-wrap gap-3">
              {profile.email && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs text-white/80">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5">
                    <path d="M2.5 3A1.5 1.5 0 0 0 1 4.5v.793c.026.009.051.02.076.032L7.674 8.51c.206.1.446.1.652 0l6.598-3.185A.755.755 0 0 1 15 5.293V4.5A1.5 1.5 0 0 0 13.5 3h-11Z" />
                    <path d="M15 6.954 8.978 9.86a2.25 2.25 0 0 1-1.956 0L1 6.954V11.5A1.5 1.5 0 0 0 2.5 13h11a1.5 1.5 0 0 0 1.5-1.5V6.954Z" />
                  </svg>
                  {profile.email}
                </span>
              )}
              {profile.phone && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs text-white/80">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5">
                    <path fillRule="evenodd" d="M3.5 2A1.5 1.5 0 0 0 2 3.5V5c0 1.149.15 2.263.43 3.326a13.022 13.022 0 0 0 9.244 9.244c1.063.28 2.177.43 3.326.43h1.5a1.5 1.5 0 0 0 1.5-1.5v-1.148a1.5 1.5 0 0 0-1.175-1.465l-3.223-.716a1.5 1.5 0 0 0-1.767 1.052l-.267.933c-.117.41-.549.643-.949.48a11.542 11.542 0 0 1-6.254-6.254c-.163-.4.07-.832.48-.95l.933-.266a1.5 1.5 0 0 0 1.052-1.768L4.979 3.175A1.5 1.5 0 0 0 3.5 2Z" clipRule="evenodd" />
                  </svg>
                  {profile.phone}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Alerts ── */}
      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="mt-0.5 h-5 w-5 shrink-0 text-rose-500">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
          </svg>
          <p className="text-sm text-rose-700">{error}</p>
        </div>
      )}
      {success && (
        <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
          </svg>
          <p className="text-sm text-emerald-700">{success}</p>
        </div>
      )}

      {/* ── Personal info ── */}
      <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 text-slate-600">
                <path d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 00-13.074.003z" />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900">Informations personnelles</h2>
              <p className="text-xs text-slate-500">Mettez à jour votre nom, email et téléphone.</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleProfileSubmit} className="space-y-4 p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-1.5">
              <span className="block text-xs font-semibold uppercase tracking-wider text-slate-500">Nom complet</span>
              <input
                type="text"
                required
                value={profile.name}
                onChange={(e) => setProfile((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Votre nom"
                className="dashboard-input"
              />
            </label>

            <label className="space-y-1.5">
              <span className="block text-xs font-semibold uppercase tracking-wider text-slate-500">Adresse email</span>
              <input
                type="email"
                required
                value={profile.email}
                onChange={(e) => setProfile((prev) => ({ ...prev, email: e.target.value }))}
                placeholder="votre@email.com"
                className="dashboard-input"
              />
            </label>

            <label className="space-y-1.5 sm:col-span-2">
              <span className="block text-xs font-semibold uppercase tracking-wider text-slate-500">Téléphone</span>
              <input
                type="text"
                value={profile.phone}
                onChange={(e) => setProfile((prev) => ({ ...prev, phone: e.target.value }))}
                placeholder="+212 6 00 00 00 00"
                className="dashboard-input"
              />
            </label>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={savingProfile}
              className="dashboard-primary-btn"
            >
              {savingProfile ? 'Enregistrement...' : 'Sauvegarder'}
            </button>
          </div>
        </form>
      </section>

      {/* ── Security ── */}
      <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 text-slate-600">
                <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900">Sécurité</h2>
              <p className="text-xs text-slate-500">Modifiez votre mot de passe régulièrement pour sécuriser votre compte.</p>
            </div>
          </div>
        </div>

        <form onSubmit={handlePasswordSubmit} className="space-y-4 p-6">
          {/* Current password */}
          <label className="space-y-1.5">
            <span className="block text-xs font-semibold uppercase tracking-wider text-slate-500">Mot de passe actuel</span>
            <div className="relative">
              <input
                type={showCurrentPw ? 'text' : 'password'}
                required
                value={passwordForm.current_password}
                onChange={(e) => setPasswordForm((prev) => ({ ...prev, current_password: e.target.value }))}
                placeholder="••••••••"
                className="dashboard-input pr-10"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPw((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showCurrentPw ? (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                    <path fillRule="evenodd" d="M3.28 2.22a.75.75 0 00-1.06 1.06l14.5 14.5a.75.75 0 101.06-1.06l-1.745-1.745a10.029 10.029 0 003.3-4.38 1.651 1.651 0 000-1.185A10.004 10.004 0 009.999 3a9.956 9.956 0 00-4.744 1.194L3.28 2.22zM7.752 6.69l1.092 1.092a2.5 2.5 0 013.374 3.373l1.091 1.092a4 4 0 00-5.557-5.557z" clipRule="evenodd" />
                    <path d="M10.748 13.93l2.523 2.523a9.987 9.987 0 01-3.27.547c-4.258 0-7.894-2.66-9.337-6.41a1.651 1.651 0 010-1.186A10.007 10.007 0 012.839 6.02L6.07 9.252a4 4 0 004.678 4.678z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                    <path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
                    <path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 010-1.186A10.004 10.004 0 0110 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0110 17c-4.257 0-7.893-2.66-9.336-6.41z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            </div>
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* New password */}
            <label className="space-y-1.5">
              <span className="block text-xs font-semibold uppercase tracking-wider text-slate-500">Nouveau mot de passe</span>
              <div className="relative">
                <input
                  type={showNewPw ? 'text' : 'password'}
                  required
                  value={passwordForm.password}
                  onChange={(e) => setPasswordForm((prev) => ({ ...prev, password: e.target.value }))}
                  placeholder="••••••••"
                  className="dashboard-input pr-10"
                />
                <button type="button" onClick={() => setShowNewPw((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                    <path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
                    <path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 010-1.186A10.004 10.004 0 0110 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0110 17c-4.257 0-7.893-2.66-9.336-6.41z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </label>

            {/* Confirm password */}
            <label className="space-y-1.5">
              <span className="block text-xs font-semibold uppercase tracking-wider text-slate-500">Confirmer le mot de passe</span>
              <div className="relative">
                <input
                  type={showConfirmPw ? 'text' : 'password'}
                  required
                  value={passwordForm.password_confirmation}
                  onChange={(e) => setPasswordForm((prev) => ({ ...prev, password_confirmation: e.target.value }))}
                  placeholder="••••••••"
                  className="dashboard-input pr-10"
                />
                <button type="button" onClick={() => setShowConfirmPw((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                    <path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
                    <path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 010-1.186A10.004 10.004 0 0110 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0110 17c-4.257 0-7.893-2.66-9.336-6.41z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </label>
          </div>

          {/* Password strength hint */}
          {passwordForm.password && passwordForm.password_confirmation && (
            <p className={`flex items-center gap-1.5 text-xs font-medium ${
              passwordForm.password === passwordForm.password_confirmation ? 'text-emerald-600' : 'text-rose-500'
            }`}>
              <span className={`h-1.5 w-1.5 rounded-full ${
                passwordForm.password === passwordForm.password_confirmation ? 'bg-emerald-500' : 'bg-rose-500'
              }`} />
              {passwordForm.password === passwordForm.password_confirmation
                ? 'Les mots de passe correspondent'
                : 'Les mots de passe ne correspondent pas'}
            </p>
          )}

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={savingPassword}
              className="dashboard-primary-btn"
            >
              {savingPassword ? 'Mise à jour...' : 'Modifier le mot de passe'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}

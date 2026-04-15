import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ownerApartmentsApi,
  ownerCreateApartmentApi,
  ownerDeleteApartmentApi,
  ownerUpdateApartmentApi,
  ownerUpdateApartmentStatusApi,
} from '../../lib/api.js'
import { useAuth } from '../../context/AuthContext.jsx'
import PageHeader from '../../components/admin/PageHeader.jsx'
import AdminFilters from '../../components/admin/AdminFilters.jsx'
import AdminTable from '../../components/admin/AdminTable.jsx'
import LoadingState from '../../components/admin/LoadingState.jsx'
import ErrorState from '../../components/admin/ErrorState.jsx'
import EmptyState from '../../components/admin/EmptyState.jsx'
import Pagination from '../../components/admin/Pagination.jsx'
import ConfirmModal from '../../components/admin/ConfirmModal.jsx'
import StatusBadge from '../../components/admin/StatusBadge.jsx'
import useDebouncedValue from '../../hooks/useDebouncedValue.js'
import { formatCurrency } from '../../utils/format.js'
import ApartmentImage from '../../components/apartments/ApartmentImage.jsx'
import ApartmentImageUpload from '../../components/apartments/ApartmentImageUpload.jsx'
import { getApartmentGallery } from '../../utils/apartmentImages.js'

const initialForm = {
  name: '',
  address: '',
  price_per_night: '',
  description: '',
  capacity: 1,
  is_active: true,
}

export default function OwnerApartmentsPage() {
  const { token } = useAuth()
  const [filters, setFilters] = useState({ search: '', status: '', city: '', max_price: '', page: 1 })
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleteItem, setDeleteItem] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(initialForm)
  const [existingPhotos, setExistingPhotos] = useState([])
  const [selectedFiles, setSelectedFiles] = useState([])
  const [viewMode, setViewMode] = useState('table')
  const debouncedSearch = useDebouncedValue(filters.search, 300)

  const queryParams = useMemo(
    () => ({
      search: debouncedSearch,
      status: filters.status,
      city: filters.city,
      max_price: filters.max_price,
      page: filters.page,
    }),
    [debouncedSearch, filters.city, filters.max_price, filters.page, filters.status],
  )

  const loadData = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const response = await ownerApartmentsApi(token, queryParams)
      setData(response)
    } catch (err) {
      setError(err.message ?? 'Unable to load apartments.')
    } finally {
      setLoading(false)
    }
  }, [queryParams, token])

  useEffect(() => { loadData() }, [loadData])

  function openCreateForm() {
    setEditing({ id: null })
    setForm(initialForm)
    setExistingPhotos([])
    setSelectedFiles([])
  }

  function openEditForm(apartment) {
    setEditing(apartment)
    setForm({
      name: apartment.name,
      address: apartment.address,
      price_per_night: apartment.price_per_night,
      description: apartment.description,
      capacity: apartment.capacity,
      is_active: apartment.is_active,
    })
    setExistingPhotos(Array.isArray(apartment.photos) ? apartment.photos : [])
    setSelectedFiles([])
  }

  async function handleSave(event) {
    event.preventDefault()
    setSubmitting(true)

    const payload = new FormData()
    payload.append('name', form.name)
    payload.append('address', form.address)
    payload.append('price_per_night', String(form.price_per_night))
    payload.append('description', form.description)
    payload.append('capacity', String(form.capacity))
    payload.append('is_active', form.is_active ? '1' : '0')
    existingPhotos.forEach((photo) => payload.append('kept_photos[]', photo))
    selectedFiles.forEach((file) => payload.append('photos[]', file))

    try {
      if (editing?.id) {
        await ownerUpdateApartmentApi(token, editing.id, payload)
      } else {
        await ownerCreateApartmentApi(token, payload)
      }
      setEditing(null)
      setForm(initialForm)
      await loadData()
    } finally {
      setSubmitting(false)
    }
  }

  async function handleStatusToggle(apartment) {
    await ownerUpdateApartmentStatusApi(token, apartment.id, !apartment.is_active)
    await loadData()
  }

  async function handleDeleteApartment() {
    if (!deleteItem) return
    await ownerDeleteApartmentApi(token, deleteItem.id)
    setDeleteItem(null)
    await loadData()
  }

  if (loading && !data) return <LoadingState label="Loading apartments..." />
  if (error) return <ErrorState message={error} onRetry={loadData} />

  const apartments = data?.data ?? []

  return (
    <div className="space-y-5">
      <PageHeader
        title="Mes Appartements"
        description="Gérez vos annonces, prix et disponibilités."
        actions={
          <>
            <button
              type="button"
              onClick={() => setViewMode((prev) => (prev === 'table' ? 'cards' : 'table'))}
              className="dashboard-ghost-btn"
            >
              {viewMode === 'table' ? 'Vue cartes' : 'Vue tableau'}
            </button>
            <button type="button" onClick={openCreateForm} className="dashboard-primary-btn">
              + Ajouter un appartement
            </button>
          </>
        }
      />

      {loading && data && <p className="text-xs text-slate-400">Actualisation...</p>}

      <AdminFilters>
        <input
          type="text"
          value={filters.search}
          placeholder="Rechercher..."
          onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value, page: 1 }))}
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
        />
        <select
          value={filters.status}
          onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value, page: 1 }))}
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
        >
          <option value="">Tous les statuts</option>
          <option value="active">Actif</option>
          <option value="inactive">Inactif</option>
        </select>
        <input
          type="text"
          value={filters.city}
          placeholder="Ville"
          onChange={(e) => setFilters((prev) => ({ ...prev, city: e.target.value, page: 1 }))}
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
        />
      </AdminFilters>

      {/* ── Create / Edit form ── */}
      {editing && (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {/* Form header */}
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                {editing.id ? 'Modifier l\'appartement' : 'Nouvel appartement'}
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                {editing.id ? 'Mettez à jour les informations de votre annonce.' : 'Remplissez les informations pour créer votre annonce.'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setEditing(null)}
              className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
                <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-6 p-6">
            {/* Basic info grid */}
            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-1.5">
                <span className="block text-xs font-semibold uppercase tracking-wider text-slate-500">Nom de l'appartement *</span>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Riad Dar Zitoun"
                  className="dashboard-input"
                />
              </label>

              <label className="space-y-1.5">
                <span className="block text-xs font-semibold uppercase tracking-wider text-slate-500">Adresse *</span>
                <input
                  required
                  value={form.address}
                  onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))}
                  placeholder="Ex: Médina, Marrakech"
                  className="dashboard-input"
                />
              </label>

              <label className="space-y-1.5">
                <span className="block text-xs font-semibold uppercase tracking-wider text-slate-500">Prix / nuit (MAD) *</span>
                <input
                  required
                  type="number"
                  min="0"
                  value={form.price_per_night}
                  onChange={(e) => setForm((prev) => ({ ...prev, price_per_night: e.target.value }))}
                  placeholder="Ex: 450"
                  className="dashboard-input"
                />
              </label>

              <label className="space-y-1.5">
                <span className="block text-xs font-semibold uppercase tracking-wider text-slate-500">Capacité (personnes) *</span>
                <input
                  required
                  type="number"
                  min="1"
                  value={form.capacity}
                  onChange={(e) => setForm((prev) => ({ ...prev, capacity: e.target.value }))}
                  placeholder="Ex: 4"
                  className="dashboard-input"
                />
              </label>

              <label className="space-y-1.5 md:col-span-2">
                <span className="block text-xs font-semibold uppercase tracking-wider text-slate-500">Description *</span>
                <textarea
                  required
                  value={form.description}
                  onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Décrivez votre logement : ambiance, équipements, situation..."
                  className="dashboard-textarea"
                  rows={3}
                />
              </label>

              <label className="inline-flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 transition hover:bg-slate-50 md:col-span-2">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={(e) => setForm((prev) => ({ ...prev, is_active: e.target.checked }))}
                    className="sr-only"
                  />
                  <div className={`h-5 w-9 rounded-full transition-colors ${form.is_active ? 'bg-slate-900' : 'bg-slate-300'}`} />
                  <div className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${form.is_active ? 'translate-x-4' : 'translate-x-0.5'}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">Annonce active</p>
                  <p className="text-xs text-slate-500">Les clients pourront découvrir et réserver ce logement.</p>
                </div>
              </label>
            </div>

            {/* Image upload section */}
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Photos du logement</p>
              <ApartmentImageUpload
                existingPhotos={existingPhotos}
                selectedFiles={selectedFiles}
                onExistingPhotosChange={setExistingPhotos}
                onSelectedFilesChange={setSelectedFiles}
                maxFiles={5}
              />
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
              <button type="button" onClick={() => setEditing(null)} className="dashboard-ghost-btn">
                Annuler
              </button>
              <button type="submit" disabled={submitting} className="dashboard-primary-btn">
                {submitting ? 'Enregistrement...' : editing?.id ? 'Mettre à jour' : 'Créer l\'annonce'}
              </button>
            </div>
          </form>
        </div>
      )}

      {apartments.length === 0 ? (
        <EmptyState
          title="Aucun appartement"
          description="Créez votre première annonce pour commencer à recevoir des réservations."
        />
      ) : viewMode === 'cards' ? (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {apartments.map((apartment) => (
            <article
              key={apartment.id}
              className="group overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              {/* Main image */}
              <div className="relative aspect-[16/9] overflow-hidden bg-slate-100">
                <ApartmentImage
                  photos={apartment.photos}
                  alt={apartment.name}
                  className="h-full w-full"
                  imageClassName="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
                />
                <div className="absolute right-3 top-3">
                  <StatusBadge label={apartment.is_active ? 'active' : 'inactive'} />
                </div>
                <div className="absolute bottom-3 left-3 rounded-xl bg-white/95 px-2.5 py-1 shadow-sm backdrop-blur-sm">
                  <span className="text-sm font-bold text-slate-900">{formatCurrency(apartment.price_per_night)}</span>
                  <span className="text-xs text-slate-500"> / nuit</span>
                </div>
              </div>

              {/* Thumbnail strip */}
              {getApartmentGallery(apartment.photos).length > 1 && (
                <div className="flex gap-1.5 border-b border-slate-100 px-3 py-2">
                  {getApartmentGallery(apartment.photos).slice(0, 4).map((photo, index) => (
                    <ApartmentImage
                      key={`${apartment.id}-${index}`}
                      photos={[photo]}
                      alt={`${apartment.name} ${index + 1}`}
                      className="h-10 w-14 shrink-0 overflow-hidden rounded-lg"
                      imageClassName="h-10 w-14 object-cover"
                    />
                  ))}
                </div>
              )}

              {/* Info */}
              <div className="p-4">
                <h3 className="font-semibold text-slate-900 line-clamp-1">{apartment.name}</h3>
                <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3 w-3 shrink-0">
                    <path fillRule="evenodd" d="M7.539 14.841a.75.75 0 0 1-.02 0l-.008-.004-.026-.012a15.02 15.02 0 0 1-.595-.31 13.02 13.02 0 0 1-1.892-1.29 10.5 10.5 0 0 1-1.667-1.99C2.545 10.187 2 8.99 2 7.5a6 6 0 1 1 12 0c0 1.49-.545 2.688-1.33 3.735a10.5 10.5 0 0 1-1.668 1.99 13.02 13.02 0 0 1-2.487 1.6l-.026.012-.008.004-.003.001a.752.752 0 0 1-.679 0l-.003-.001ZM8 8.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" clipRule="evenodd" />
                  </svg>
                  <span className="truncate">{apartment.address}</span>
                </p>
                <p className="mt-1 text-xs text-slate-500">{apartment.capacity} personnes</p>

                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => openEditForm(apartment)}
                    className="flex-1 rounded-lg border border-slate-200 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    Modifier
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStatusToggle(apartment)}
                    className="flex-1 rounded-lg border border-slate-200 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    {apartment.is_active ? 'Désactiver' : 'Activer'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteItem(apartment)}
                    className="rounded-lg bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-600 transition hover:bg-rose-100"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <AdminTable headers={['Photo', 'Nom', 'Prix', 'Capacité', 'Statut', 'Actions']}>
          {apartments.map((apartment) => (
            <tr key={apartment.id} className="group">
              <td className="px-4 py-3">
                <ApartmentImage
                  photos={apartment.photos}
                  alt={apartment.name}
                  className="h-12 w-16 overflow-hidden rounded-xl"
                  imageClassName="h-12 w-16 rounded-xl object-cover"
                />
              </td>
              <td className="px-4 py-3">
                <p className="text-sm font-medium text-slate-900">{apartment.name}</p>
                <p className="mt-0.5 text-xs text-slate-500 truncate max-w-[180px]">{apartment.address}</p>
              </td>
              <td className="px-4 py-3 text-sm font-medium text-slate-900">{formatCurrency(apartment.price_per_night)}</td>
              <td className="px-4 py-3 text-sm text-slate-600">{apartment.capacity} pers.</td>
              <td className="px-4 py-3"><StatusBadge label={apartment.is_active ? 'active' : 'inactive'} /></td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => openEditForm(apartment)}
                    className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    Modifier
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStatusToggle(apartment)}
                    className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    {apartment.is_active ? 'Désactiver' : 'Activer'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteItem(apartment)}
                    className="rounded-lg bg-rose-50 px-3 py-1 text-xs font-medium text-rose-600 transition hover:bg-rose-100"
                  >
                    Supprimer
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </AdminTable>
      )}

      <Pagination meta={data} onPageChange={(page) => setFilters((prev) => ({ ...prev, page }))} />

      <ConfirmModal
        open={Boolean(deleteItem)}
        title="Supprimer cet appartement ?"
        description={deleteItem ? deleteItem.name : ''}
        onCancel={() => setDeleteItem(null)}
        onConfirm={handleDeleteApartment}
      />
    </div>
  )
}

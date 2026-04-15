import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  clientAddFavoriteApi,
  clientBrowseApartmentsApi,
  clientFavoritesApi,
  clientRemoveFavoriteApi,
} from '../../lib/api.js'
import { useAuth } from '../../context/AuthContext.jsx'
import Pagination from '../../components/admin/Pagination.jsx'
import ConfirmModal from '../../components/admin/ConfirmModal.jsx'
import useDebouncedValue from '../../hooks/useDebouncedValue.js'
import { formatCurrency } from '../../utils/format.js'
import ClientSectionHeader from '../../components/client/ClientSectionHeader.jsx'
import ClientSectionCard from '../../components/client/ClientSectionCard.jsx'
import ClientApartmentCard from '../../components/client/ClientApartmentCard.jsx'
import { ClientLoadingState, ClientErrorState, ClientEmptyState } from '../../components/client/ClientFriendlyState.jsx'

export default function ClientFavoritesPage() {
  const { token } = useAuth()
  const navigate = useNavigate()
  const [favorites, setFavorites] = useState(null)
  const [browse, setBrowse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [removeItem, setRemoveItem] = useState(null)
  const [filters, setFilters] = useState({ search: '', city: '', max_price: '', capacity: '', page: 1 })
  const browseRef = useRef(null)

  const debouncedSearch = useDebouncedValue(filters.search, 300)

  const browseParams = useMemo(
    () => ({
      search: debouncedSearch,
      city: filters.city,
      max_price: filters.max_price,
      capacity: filters.capacity,
      page: filters.page,
    }),
    [debouncedSearch, filters.capacity, filters.city, filters.max_price, filters.page],
  )

  const loadData = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const [favoritesRes, browseRes] = await Promise.all([
        clientFavoritesApi(token, { per_page: 12 }),
        clientBrowseApartmentsApi(token, browseParams),
      ])
      setFavorites(favoritesRes)
      setBrowse(browseRes)
    } catch (err) {
      setError(err.message ?? 'Unable to load favorites.')
    } finally {
      setLoading(false)
    }
  }, [browseParams, token])

  useEffect(() => {
    loadData()
  }, [loadData])

  async function removeFavorite() {
    if (!removeItem) return
    await clientRemoveFavoriteApi(token, removeItem.apartment.id)
    setRemoveItem(null)
    await loadData()
  }

  async function saveFavorite(apartmentId) {
    await clientAddFavoriteApi(token, apartmentId)
    await loadData()
  }

  if (loading && !favorites) return <ClientLoadingState label="Loading your saved places..." />
  if (error) return <ClientErrorState message={error} onRetry={loadData} />

  const favoriteItems = favorites?.data ?? []
  const browseItems = browse?.data ?? []
  const quickChips = [
    { label: 'City', value: filters.city || 'Any' },
    { label: 'Budget', value: filters.max_price ? `${filters.max_price} MAD max` : 'Flexible' },
    { label: 'Guests', value: filters.capacity ? `${filters.capacity}+` : 'Any' },
  ]

  return (
    <div className="space-y-6">
      <ClientSectionHeader
        eyebrow="Saved places"
        title="Favorites"
        description="A visual space to collect apartments you like and discover new ones at your pace."
      />

      <section className="flex flex-wrap gap-2">
        {quickChips.map((chip) => (
          <span key={chip.label} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600">
            {chip.label}: <span className="text-slate-900">{chip.value}</span>
          </span>
        ))}
      </section>

      <ClientSectionCard title="Saved apartments" description="Your personal shortlist with an image-first layout for faster browsing.">
        {favoriteItems.length === 0 ? (
          <ClientEmptyState
            title="No favorites yet"
            description="Browse the apartments below and save the ones that feel right for your next trip."
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {favoriteItems.map((favorite) => (
              <ClientApartmentCard
                key={favorite.id}
                apartment={favorite.apartment}
                children={formatCurrency(favorite.apartment?.price_per_night)}
                footer={[
                  <button
                    key="open"
                    type="button"
                    onClick={() => navigate(`/client/apartments/${favorite.apartment?.id}`)}
                    className="dashboard-primary-btn !px-3 !py-1.5"
                  >
                    Open details
                  </button>,
                  <button
                    key="remove"
                    type="button"
                    onClick={() => setRemoveItem(favorite)}
                    className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
                  >
                    Remove
                  </button>
                ]}
              />
            ))}
          </div>
        )}
      </ClientSectionCard>

      <ClientSectionCard
        title="Browse apartments"
        description="Discover more stays with lightweight filters and clear visual cards."
      >
        <div ref={browseRef} className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <input
            type="text"
            value={filters.search}
            onChange={(event) => setFilters((prev) => ({ ...prev, search: event.target.value, page: 1 }))}
            placeholder="Search apartments"
            className="dashboard-input"
          />
          <input
            type="text"
            value={filters.city}
            onChange={(event) => setFilters((prev) => ({ ...prev, city: event.target.value, page: 1 }))}
            placeholder="City"
            className="dashboard-input"
          />
          <input
            type="number"
            min="0"
            value={filters.max_price}
            onChange={(event) => setFilters((prev) => ({ ...prev, max_price: event.target.value, page: 1 }))}
            placeholder="Max price"
            className="dashboard-input"
          />
          <input
            type="number"
            min="1"
            value={filters.capacity}
            onChange={(event) => setFilters((prev) => ({ ...prev, capacity: event.target.value, page: 1 }))}
            placeholder="Capacity"
            className="dashboard-input"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {browseItems.map((apartment) => (
            <ClientApartmentCard
              key={apartment.id}
              apartment={apartment}
              children={formatCurrency(apartment.price_per_night)}
              footer={[
                <button key="save" className="dashboard-primary-btn !px-3 !py-1.5" type="button" onClick={() => saveFavorite(apartment.id)}>
                  Save
                </button>,
                <button
                  key="book"
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  type="button"
                  onClick={() => navigate(`/client/apartments/${apartment.id}`)}
                >
                  View details
                </button>,
              ]}
            />
          ))}
        </div>

        <Pagination meta={browse} onPageChange={(page) => setFilters((prev) => ({ ...prev, page }))} />
      </ClientSectionCard>

      <ConfirmModal
        open={Boolean(removeItem)}
        title="Remove from favorites?"
        description={removeItem ? removeItem.apartment?.name : ''}
        onCancel={() => setRemoveItem(null)}
        onConfirm={removeFavorite}
        confirmLabel="Remove"
        loadingLabel="Removing..."
        confirmTone="danger"
      />
    </div>
  )
}

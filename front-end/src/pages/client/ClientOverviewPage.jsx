import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { clientAddFavoriteApi, clientBrowseApartmentsApi, clientOverviewApi } from '../../lib/api.js'
import { useAuth } from '../../context/AuthContext.jsx'
import { ClientLoadingState, ClientErrorState, ClientEmptyState } from '../../components/client/ClientFriendlyState.jsx'
import ClientSectionCard from '../../components/client/ClientSectionCard.jsx'
import { formatDate } from '../../utils/format.js'
import CategoryTabs from '../../components/client/discovery/CategoryTabs.jsx'
import FilterButton from '../../components/client/discovery/FilterButton.jsx'
import CardGrid from '../../components/client/discovery/CardGrid.jsx'
import ApartmentImage from '../../components/apartments/ApartmentImage.jsx'

const categories = [
  { value: 'all', label: 'Tous', icon: '🇲🇦' },
  { value: 'apartments', label: 'Appartements', icon: '🏠' },
  { value: 'spaces', label: 'Espaces', icon: '🏡' },
]

export default function ClientOverviewPage() {
  const { token } = useAuth()
  const navigate = useNavigate()
  const [overview, setOverview] = useState(null)
  const [browse, setBrowse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [filters, setFilters] = useState({ search: '', city: '', max_price: '', capacity: '' })
  const [savedIds, setSavedIds] = useState(() => new Set())

  const loadData = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const [overviewRes, browseRes] = await Promise.all([
        clientOverviewApi(token),
        clientBrowseApartmentsApi(token, {
          search: filters.search,
          city: filters.city,
          max_price: filters.max_price,
          capacity: filters.capacity,
          per_page: 12,
        }),
      ])

      setOverview(overviewRes)
      setBrowse(browseRes)
    } catch (err) {
      setError(err.message ?? 'Unable to load discover page.')
    } finally {
      setLoading(false)
    }
  }, [filters.capacity, filters.city, filters.max_price, filters.search, token])

  useEffect(() => {
    loadData()
  }, [loadData])

  const upcomingReservation = useMemo(() => {
    const reservations = overview?.recent_reservations ?? []
    return reservations.find((reservation) => reservation.status !== 'cancelled') ?? reservations[0]
  }, [overview])

  const discoverItems = useMemo(() => {
    const items = browse?.data ?? []

    if (activeCategory === 'apartments') {
      return items.filter((item) => Number(item.capacity ?? 1) <= 3)
    }

    if (activeCategory === 'spaces') {
      return items.filter((item) => Number(item.capacity ?? 1) >= 4)
    }

    return items
  }, [activeCategory, browse])

  if (loading) return <ClientLoadingState label="Preparing your travel space..." />
  if (error) return <ClientErrorState message={error} onRetry={loadData} />

  async function handleSaveFavorite(apartmentId) {
    try {
      await clientAddFavoriteApi(token, apartmentId)
      setSavedIds((prev) => new Set([...prev, apartmentId]))
    } catch {
      // Avoid blocking discovery browsing when save fails.
    }
  }

  return (
    <div className="space-y-8">
      <section className="space-y-2">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-400">Découverte</p>
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          Trouvez votre <span className="text-amber-500">séjour</span> idéal
        </h1>
        <p className="text-base text-slate-500">Riads, appartements et villas à travers tout le Maroc.</p>
      </section>

      {upcomingReservation && (
        <section className="flex flex-col md:flex-row items-center gap-6 overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 transition-shadow hover:shadow-sm">
          <div className="flex-1 w-full flex flex-col md:flex-row items-center gap-4">
            <ApartmentImage
              photos={upcomingReservation.apartment?.photos}
              alt={upcomingReservation.apartment?.name}
              className="h-36 w-full overflow-hidden rounded-[1.2rem]"
              imageClassName="h-36 w-full object-cover"
            />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Prochain sejour</p>
              <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-900">{upcomingReservation.apartment?.name}</h2>
              <p className="mt-1 text-sm text-slate-600">
                {formatDate(upcomingReservation.check_in)} - {formatDate(upcomingReservation.check_out)}
              </p>
              <button
                type="button"
                onClick={() => navigate('/client/reservations')}
                className="mt-4 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
              >
                Voir mes reservations
              </button>
            </div>
          </div>
        </section>
      )}

      <section className="flex flex-wrap items-center justify-between gap-3">
        <CategoryTabs value={activeCategory} onChange={setActiveCategory} items={categories} />
        <FilterButton active={showAdvancedFilters} onClick={() => setShowAdvancedFilters((prev) => !prev)} />
      </section>

      {showAdvancedFilters && (
        <ClientSectionCard title="Filtres avances" description="Affinez votre recherche rapidement.">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <input
              type="text"
              value={filters.search}
              onChange={(event) => setFilters((prev) => ({ ...prev, search: event.target.value }))}
              placeholder="Rechercher un appartement"
              className="dashboard-input"
            />
            <input
              type="text"
              value={filters.city}
              onChange={(event) => setFilters((prev) => ({ ...prev, city: event.target.value }))}
              placeholder="Ville"
              className="dashboard-input"
            />
            <input
              type="number"
              min="0"
              value={filters.max_price}
              onChange={(event) => setFilters((prev) => ({ ...prev, max_price: event.target.value }))}
              placeholder="Budget max"
              className="dashboard-input"
            />
            <input
              type="number"
              min="1"
              value={filters.capacity}
              onChange={(event) => setFilters((prev) => ({ ...prev, capacity: event.target.value }))}
              placeholder="Capacite"
              className="dashboard-input"
            />
          </div>
        </ClientSectionCard>
      )}

      {discoverItems.length === 0 ? (
        <ClientEmptyState
          title="Aucun resultat"
          description="Essayez un autre filtre ou revenez a la categorie Tous."
        />
      ) : (
        <CardGrid
          apartments={discoverItems}
          onSave={handleSaveFavorite}
          onView={(id) => navigate(`/client/apartments/${id}`)}
          savedIds={savedIds}
        />
      )}

      <section className="grid gap-5 md:grid-cols-2">
        <ClientSectionCard title="Activite recente" description="Mises a jour recentes de vos reservations.">
          <div className="space-y-3">
            {(overview?.notifications ?? []).slice(0, 4).map((item) => (
              <div key={item.id} className="rounded-xl border border-slate-200 bg-slate-50/80 p-3">
                <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                <p className="mt-1 text-xs text-slate-500">{formatDate(item.created_at)}</p>
              </div>
            ))}
          </div>
        </ClientSectionCard>

        <ClientSectionCard title="Navigation rapide" description="Acces direct a votre espace personnel.">
          <div className="grid gap-2 sm:grid-cols-2">
            <button type="button" onClick={() => navigate('/client/reservations')} className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">Reservations</button>
            <button type="button" onClick={() => navigate('/client/favorites')} className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">Favoris</button>
            <button type="button" onClick={() => navigate('/client/profile')} className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">Mon compte</button>
            <button type="button" onClick={() => setShowAdvancedFilters(true)} className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">Filtres</button>
          </div>
        </ClientSectionCard>
      </section>
    </div>
  )
}

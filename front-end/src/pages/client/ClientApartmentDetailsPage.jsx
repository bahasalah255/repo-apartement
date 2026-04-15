import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  apartmentAvailabilityApi,
  apartmentDetailsApi,
  createReservationApi,
} from '../../lib/api.js'
import { useAuth } from '../../context/AuthContext.jsx'
import { ClientErrorState, ClientLoadingState } from '../../components/client/ClientFriendlyState.jsx'
import ApartmentImage from '../../components/apartments/ApartmentImage.jsx'
import { getApartmentGallery } from '../../utils/apartmentImages.js'
import { formatCurrency, formatDate } from '../../utils/format.js'

const initialForm = {
  check_in: '',
  check_out: '',
  phone: '',
  special_requests: '',
}

function daysBetween(start, end) {
  if (!start || !end) return 0
  const startDate = new Date(start)
  const endDate = new Date(end)
  const diff = endDate.getTime() - startDate.getTime()
  if (Number.isNaN(diff) || diff <= 0) return 0
  return Math.round(diff / (1000 * 60 * 60 * 24))
}

function isRangeAvailable(events, checkIn, checkOut) {
  if (!checkIn || !checkOut) return true
  const start = new Date(checkIn)
  const end = new Date(checkOut)
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) return false
  return !events.some((event) => {
    const eventStart = new Date(event.start)
    const eventEnd = new Date(event.end)
    if (Number.isNaN(eventStart.getTime()) || Number.isNaN(eventEnd.getTime())) return false
    return start < eventEnd && end > eventStart
  })
}

function getRating(apartment) {
  const seed = Number(apartment?.id ?? 1)
  return (4.2 + (seed % 8) / 10).toFixed(1)
}

export default function ClientApartmentDetailsPage() {
  const { apartmentId } = useParams()
  const navigate = useNavigate()
  const { token } = useAuth()

  const [apartment, setApartment] = useState(null)
  const [availability, setAvailability] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedImage, setSelectedImage] = useState('')

  const [form, setForm] = useState(initialForm)
  const [submitting, setSubmitting] = useState(false)
  const [bookingError, setBookingError] = useState('')
  const [bookingSuccess, setBookingSuccess] = useState('')

  const loadData = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [detailsRes, availabilityRes] = await Promise.all([
        apartmentDetailsApi(apartmentId),
        apartmentAvailabilityApi(apartmentId),
      ])
      const loadedApartment = detailsRes.apartment
      setApartment(loadedApartment)
      setAvailability(Array.isArray(availabilityRes) ? availabilityRes : [])
      const gallery = getApartmentGallery(loadedApartment?.photos)
      setSelectedImage(gallery[0] ?? '')
    } catch (err) {
      setError(err.message ?? 'Unable to load apartment details.')
    } finally {
      setLoading(false)
    }
  }, [apartmentId])

  useEffect(() => { loadData() }, [loadData])

  const gallery = useMemo(() => getApartmentGallery(apartment?.photos), [apartment])
  const nights = useMemo(() => daysBetween(form.check_in, form.check_out), [form.check_in, form.check_out])
  const total = useMemo(() => nights * Number(apartment?.price_per_night ?? 0), [nights, apartment?.price_per_night])
  const rangeAvailable = useMemo(
    () => isRangeAvailable(availability, form.check_in, form.check_out),
    [availability, form.check_in, form.check_out],
  )

  async function handleReservationSubmit(event) {
    event.preventDefault()
    setBookingError('')
    setBookingSuccess('')

    if (!form.check_in || !form.check_out || !form.phone) {
      setBookingError('Please complete check-in, check-out and phone number.')
      return
    }
    if (nights <= 0) {
      setBookingError('Check-out date must be after check-in date.')
      return
    }
    if (!rangeAvailable) {
      setBookingError('These dates are not available for this apartment.')
      return
    }

    setSubmitting(true)
    try {
      const latestAvailability = await apartmentAvailabilityApi(apartmentId)
      const stillAvailable = isRangeAvailable(latestAvailability, form.check_in, form.check_out)
      if (!stillAvailable) {
        setBookingError('This apartment has just been booked for your selected dates.')
        setAvailability(Array.isArray(latestAvailability) ? latestAvailability : [])
        return
      }
      await createReservationApi(token, {
        apartment_id: Number(apartmentId),
        check_in: form.check_in,
        check_out: form.check_out,
        phone: form.phone,
        special_requests: form.special_requests,
      })
      setBookingSuccess('Reservation created successfully. Redirecting to your reservations...')
      setForm(initialForm)
      setTimeout(() => navigate('/client/reservations'), 900)
    } catch (err) {
      setBookingError(err.message ?? 'Unable to create reservation.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <ClientLoadingState label="Loading apartment details..." />
  if (error) return <ClientErrorState message={error} onRetry={loadData} />

  const rating = getRating(apartment)
  const city = apartment?.address?.split(',').map((p) => p.trim()).filter(Boolean).pop() ?? 'Maroc'

  return (
    <div className="space-y-0">

      {/* ── Back nav ── */}
      <div className="mb-5">
        <button
          type="button"
          onClick={() => navigate('/client')}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
            <path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" />
          </svg>
          Retour à la découverte
        </button>
      </div>

      {/* ── Hero image ── */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-100 shadow-sm">
        <ApartmentImage
          photos={[selectedImage || gallery[0]]}
          alt={apartment?.name}
          className="h-[300px] w-full sm:h-[420px] lg:h-[500px]"
          imageClassName="h-full w-full object-cover transition duration-500"
        />

        {/* gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

        {/* bottom-left title block */}
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
                    <path fillRule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 002.273 1.765 11.842 11.842 0 00.976.544l.062.029.018.008.006.003zM10 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" clipRule="evenodd" />
                  </svg>
                  {city}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/90 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                  ★ {rating}
                </span>
              </div>
              <h1 className="text-2xl font-bold text-white drop-shadow sm:text-3xl lg:text-4xl">{apartment?.name}</h1>
              <p className="mt-1 text-sm text-white/70">{apartment?.address}</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-white">{formatCurrency(apartment?.price_per_night)}</p>
              <p className="text-sm text-white/70">par nuit</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Thumbnail strip ── */}
      {gallery.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {gallery.map((photo, index) => (
            <button
              key={`${photo}-${index}`}
              type="button"
              onClick={() => setSelectedImage(photo)}
              className={`relative shrink-0 overflow-hidden rounded-xl border-2 transition-all duration-200 ${
                selectedImage === photo
                  ? 'border-slate-900 shadow-md'
                  : 'border-transparent opacity-70 hover:opacity-100'
              }`}
            >
              <ApartmentImage
                photos={[photo]}
                alt={`${apartment?.name} ${index + 1}`}
                className="h-16 w-24 bg-slate-100"
                imageClassName="h-16 w-24 object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* ── Main content ── */}
      <div className="mt-8 grid gap-8 xl:grid-cols-[1fr_380px]">

        {/* Left — About + Availability */}
        <div className="space-y-6">

          {/* About */}
          <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">À propos de ce logement</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">{apartment?.description}</p>

            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="flex flex-col items-center gap-1.5 rounded-xl bg-slate-50 py-4 px-3 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5 text-slate-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                </svg>
                <span className="text-xs text-slate-500">Capacité</span>
                <span className="text-sm font-semibold text-slate-900">{apartment?.capacity} pers.</span>
              </div>

              <div className="flex flex-col items-center gap-1.5 rounded-xl bg-slate-50 py-4 px-3 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5 text-slate-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75" />
                </svg>
                <span className="text-xs text-slate-500">Prix / nuit</span>
                <span className="text-sm font-semibold text-slate-900">{formatCurrency(apartment?.price_per_night)}</span>
              </div>

              <div className="flex flex-col items-center gap-1.5 rounded-xl bg-slate-50 py-4 px-3 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5 text-amber-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                </svg>
                <span className="text-xs text-slate-500">Note</span>
                <span className="text-sm font-semibold text-slate-900">{rating} / 5</span>
              </div>

              <div className="flex flex-col items-center gap-1.5 rounded-xl bg-slate-50 py-4 px-3 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5 text-slate-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
                <span className="text-xs text-slate-500">Ville</span>
                <span className="text-sm font-semibold text-slate-900 truncate w-full text-center">{city}</span>
              </div>
            </div>
          </section>

          {/* Availability */}
          <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5 text-slate-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                </svg>
              </div>
              <div>
                <h2 className="text-base font-semibold text-slate-900">Disponibilité</h2>
                <p className="text-xs text-slate-500">Périodes déjà réservées ou bloquées</p>
              </div>
            </div>

            {(availability ?? []).length === 0 ? (
              <div className="mt-4 flex items-center gap-3 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-emerald-600">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-sm text-slate-600">Aucune date bloquée pour le moment — logement entièrement disponible.</p>
              </div>
            ) : (
              <div className="mt-4 space-y-2">
                {availability.slice(0, 8).map((event, index) => (
                  <div
                    key={`${event.start}-${event.end}-${index}`}
                    className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3"
                  >
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-rose-400" />
                      <span className="text-sm font-medium text-slate-800">{event.title}</span>
                    </div>
                    <span className="text-xs text-slate-500">
                      {formatDate(event.start)} → {formatDate(event.end)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Right — Booking card (sticky) */}
        <div className="xl:sticky xl:top-6 xl:self-start">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-lg shadow-slate-900/5">

            {/* Card header */}
            <div className="border-b border-slate-100 px-6 py-5">
              <p className="text-2xl font-bold text-slate-900">
                {formatCurrency(apartment?.price_per_night)}
                <span className="ml-1 text-base font-normal text-slate-500">/ nuit</span>
              </p>
              <div className="mt-1 flex items-center gap-1 text-sm text-amber-500">
                <span>★</span>
                <span className="font-semibold">{rating}</span>
                <span className="text-slate-400">· Marrakech</span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleReservationSubmit} className="space-y-4 px-6 py-5">

              {/* Dates row */}
              <div className="overflow-hidden rounded-xl border border-slate-200">
                <div className="grid grid-cols-2 divide-x divide-slate-200">
                  <label className="space-y-0.5 px-3 py-2.5">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Arrivée</span>
                    <input
                      type="date"
                      value={form.check_in}
                      onChange={(e) => setForm((prev) => ({ ...prev, check_in: e.target.value }))}
                      className="w-full border-0 bg-transparent p-0 text-sm font-medium text-slate-900 focus:outline-none focus:ring-0"
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </label>
                  <label className="space-y-0.5 px-3 py-2.5">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Départ</span>
                    <input
                      type="date"
                      value={form.check_out}
                      onChange={(e) => setForm((prev) => ({ ...prev, check_out: e.target.value }))}
                      className="w-full border-0 bg-transparent p-0 text-sm font-medium text-slate-900 focus:outline-none focus:ring-0"
                      min={form.check_in || new Date().toISOString().split('T')[0]}
                      required
                    />
                  </label>
                </div>
              </div>

              {/* Phone */}
              <label className="block space-y-1.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Téléphone</span>
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                  placeholder="+212 6 00 00 00 00"
                  className="dashboard-input"
                  required
                />
              </label>

              {/* Special requests */}
              <label className="block space-y-1.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Demandes spéciales</span>
                <textarea
                  value={form.special_requests}
                  onChange={(e) => setForm((prev) => ({ ...prev, special_requests: e.target.value }))}
                  placeholder="Arrivée tardive, lit bébé…"
                  className="dashboard-textarea"
                  rows={2}
                />
              </label>

              {/* Price breakdown */}
              {nights > 0 && (
                <div className="space-y-2 rounded-xl bg-slate-50 p-4 text-sm">
                  <div className="flex justify-between text-slate-600">
                    <span>{formatCurrency(apartment?.price_per_night)} × {nights} nuit{nights > 1 ? 's' : ''}</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-200 pt-2 font-semibold text-slate-900">
                    <span>Total</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                  <p className={`flex items-center gap-1.5 text-xs font-medium ${rangeAvailable ? 'text-emerald-600' : 'text-rose-600'}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${rangeAvailable ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                    {rangeAvailable ? 'Ces dates sont disponibles' : 'Ces dates ne sont pas disponibles'}
                  </p>
                </div>
              )}

              {/* Alerts */}
              {bookingError && (
                <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="mt-0.5 h-4 w-4 shrink-0 text-rose-500">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                  </svg>
                  <p className="text-xs text-rose-700">{bookingError}</p>
                </div>
              )}

              {bookingSuccess && (
                <div className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                  </svg>
                  <p className="text-xs text-emerald-700">{bookingSuccess}</p>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting || !rangeAvailable || nights <= 0}
                className="w-full rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? 'Confirmation en cours…' : 'Réserver maintenant'}
              </button>

              <p className="text-center text-xs text-slate-400">Aucun frais prélevé pour le moment</p>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

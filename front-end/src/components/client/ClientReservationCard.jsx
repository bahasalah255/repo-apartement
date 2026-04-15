import { useEffect } from 'react'
import ClientStatusPill from './ClientStatusPill.jsx'
import { formatCurrency, formatDate } from '../../utils/format.js'
import ApartmentImage from '../apartments/ApartmentImage.jsx'
import { getApartmentPrimaryImage } from '../../utils/apartmentImages.js'

export default function ClientReservationCard({ reservation, onDetails, onCancel }) {
  const status = String(reservation?.status ?? 'pending').toLowerCase()
  const canCancel = status !== 'cancelled' && new Date(reservation?.check_in) > new Date()
  const photos = reservation?.apartment?.photos

  useEffect(() => {
    if (import.meta.env.DEV) {
      console.debug('[ClientReservationCard] apartment photos', {
        reservationId: reservation?.id,
        photos,
        primaryImage: getApartmentPrimaryImage(photos),
      })
    }
  }, [photos, reservation?.id])

  return (
    <article className="group overflow-hidden rounded-[1.6rem] border border-slate-200/70 bg-white shadow-[0_18px_45px_-34px_rgba(15,23,42,0.5)] transition hover:-translate-y-0.5 hover:shadow-[0_26px_60px_-34px_rgba(15,23,42,0.56)]">
      <div className="flex flex-col lg:flex-row lg:items-stretch">
        <div className="relative h-44 overflow-hidden bg-slate-100 lg:h-auto lg:w-[150px] lg:flex-none">
          <ApartmentImage
            photos={photos}
            alt={reservation?.apartment?.name}
            className="h-full w-full"
            imageClassName="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
          />
          <div className="absolute left-4 top-4">
            <ClientStatusPill label={reservation?.status} />
          </div>
        </div>

        <div className="relative z-10 flex min-w-0 flex-1 flex-col p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-slate-500">Reservation</p>
              <h3 className="mt-1 text-lg font-semibold tracking-tight text-slate-900">
                {reservation?.apartment?.name}
              </h3>
              <p className="mt-1 text-sm leading-6 text-slate-600">{reservation?.apartment?.address}</p>
            </div>
            <p className="text-lg font-semibold tracking-tight text-slate-900">
              {formatCurrency(reservation?.total_price)}
            </p>
          </div>

          <div className="mt-5 grid gap-3 rounded-[1.25rem] bg-slate-50/80 p-4 text-sm text-slate-600 sm:grid-cols-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Check-in</p>
              <p className="mt-1 font-medium text-slate-900">{formatDate(reservation?.check_in)}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Check-out</p>
              <p className="mt-1 font-medium text-slate-900">{formatDate(reservation?.check_out)}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Guests</p>
              <p className="mt-1 font-medium text-slate-900">{reservation?.apartment?.capacity ?? '1'} people</p>
            </div>
          </div>

          <p className="mt-3 text-xs text-slate-500">Booked on: {formatDate(reservation?.created_at)}</p>

          <div className="mt-5 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
            <button type="button" onClick={onDetails} className="dashboard-primary-btn">
              View details
            </button>
            {canCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
              >
                Cancel booking
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}

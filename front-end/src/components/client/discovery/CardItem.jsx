import ApartmentImage from '../../apartments/ApartmentImage.jsx'
import { formatCurrency } from '../../../utils/format.js'

function getCity(address) {
  if (!address) return 'Maroc'
  const parts = String(address).split(',').map((part) => part.trim()).filter(Boolean)
  return parts[parts.length - 1] || address
}

function getRating(apartment) {
  if (typeof apartment?.rating === 'number') return apartment.rating.toFixed(1)
  const seed = Number(apartment?.id ?? 1)
  return (4.2 + (seed % 8) / 10).toFixed(1)
}

export default function CardItem({ apartment, onSave, isSaved, onView }) {
  const city = getCity(apartment?.address)
  const rating = getRating(apartment)
  const capacity = apartment?.capacity ?? 1

  return (
    <article
      className="group flex flex-col overflow-hidden rounded-2xl bg-white border border-slate-100 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md cursor-pointer"
      onClick={() => onView?.(apartment.id)}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        <ApartmentImage
          photos={apartment?.photos}
          alt={apartment?.name}
          className="h-full w-full"
          imageClassName="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
        />

        {/* Save button */}
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onSave?.(apartment.id) }}
          className={`absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full backdrop-blur-sm transition ${
            isSaved
              ? 'bg-white text-red-500'
              : 'bg-black/30 text-white hover:bg-white hover:text-red-400'
          }`}
          aria-label={isSaved ? 'Retirer des favoris' : 'Ajouter aux favoris'}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={isSaved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" className="h-4 w-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
          </svg>
        </button>

        {/* Price badge */}
        <div className="absolute bottom-3 left-3 rounded-xl bg-white/95 px-3 py-1.5 shadow-sm backdrop-blur-sm">
          <span className="text-sm font-bold text-slate-900">{formatCurrency(apartment?.price_per_night)}</span>
          <span className="text-xs text-slate-500"> / nuit</span>
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-col gap-2 p-4">
        {/* Location + Rating */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1 text-xs text-slate-500 min-w-0">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5 shrink-0 text-slate-400">
              <path fillRule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 002.273 1.765 11.842 11.842 0 00.976.544l.062.029.018.008.006.003zM10 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" clipRule="evenodd" />
            </svg>
            <span className="truncate font-medium">{city}</span>
          </div>
          <div className="flex items-center gap-1 shrink-0 text-xs font-semibold text-amber-500">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
              <path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z" clipRule="evenodd" />
            </svg>
            {rating}
          </div>
        </div>

        {/* Name */}
        <h3 className="text-sm font-semibold leading-snug text-slate-900 line-clamp-1">
          {apartment?.name}
        </h3>

        {/* Description */}
        <p className="line-clamp-2 text-xs leading-5 text-slate-500">
          {apartment?.description || 'Un lieu accueillant pour votre prochain séjour au Maroc.'}
        </p>

        {/* Capacity badge */}
        <div className="flex items-center gap-1.5 pt-1">
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
              <path d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 00-13.074.003z" />
            </svg>
            {capacity} {capacity === 1 ? 'personne' : 'personnes'}
          </span>
        </div>
      </div>
    </article>
  )
}

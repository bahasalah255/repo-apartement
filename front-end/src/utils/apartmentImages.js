import { API_BASE_URL } from '../lib/api.js'

const fallbackSvgMarkup = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" role="img" aria-label="Apartment placeholder">
  <defs>
    <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0%" stop-color="#f8fafc" />
      <stop offset="100%" stop-color="#e2e8f0" />
    </linearGradient>
  </defs>
  <rect width="800" height="600" rx="36" fill="url(#g)" />
  <rect x="230" y="140" width="340" height="260" rx="24" fill="#ffffff" stroke="#cbd5e1" stroke-width="10" />
  <path d="M260 260 L400 180 L540 260" fill="none" stroke="#94a3b8" stroke-width="20" stroke-linecap="round" stroke-linejoin="round" />
  <rect x="285" y="280" width="70" height="120" rx="10" fill="#dbeafe" />
  <rect x="445" y="280" width="70" height="120" rx="10" fill="#dbeafe" />
  <rect x="365" y="305" width="70" height="145" rx="12" fill="#cbd5e1" />
  <text x="400" y="485" font-family="Arial, sans-serif" font-size="28" text-anchor="middle" fill="#64748b">No image</text>
</svg>
`

const fallbackSvg = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(fallbackSvgMarkup)}`

const DEFAULT_IMAGE_BASE_URL = API_BASE_URL || 'http://localhost:8000'

function stripTrailingSlash(value) {
  return value.replace(/\/$/, '')
}

function extractPhotoSource(photo) {
  if (typeof photo === 'string') {
    return photo.trim()
  }

  if (photo && typeof photo === 'object') {
    return String(photo.url ?? photo.path ?? photo.src ?? photo.file_path ?? '').trim()
  }

  return ''
}

export function resolveApartmentImageUrl(photo) {
  const source = extractPhotoSource(photo)

  if (!source) {
    return ''
  }

  if (/^(https?:)?\/\//i.test(source) || source.startsWith('data:') || source.startsWith('blob:')) {
    try {
      const parsedSource = new URL(source)
      if ((parsedSource.hostname === 'localhost' || parsedSource.hostname === '127.0.0.1') && parsedSource.pathname.startsWith('/storage/')) {
        return `${stripTrailingSlash(DEFAULT_IMAGE_BASE_URL)}${parsedSource.pathname}`
      }
    } catch {
      // Keep the original absolute URL if it cannot be parsed.
    }

    return source
  }

  const normalizedPath = source.startsWith('/') ? source : `/${source}`
  return `${stripTrailingSlash(DEFAULT_IMAGE_BASE_URL)}${normalizedPath}`
}

function isValidApartmentImage(src) {
  return typeof src === 'string' && src.trim() !== ''
}

export const apartmentFallbackImage = fallbackSvg

export function getApartmentImageList(photos) {
  if (!photos) return []

  if (Array.isArray(photos)) {
    return photos.map(resolveApartmentImageUrl).filter(Boolean)
  }

  if (typeof photos === 'string') {
    return photos
      .split(',')
      .map((photo) => resolveApartmentImageUrl(photo))
      .filter(Boolean)
  }

  if (typeof photos === 'object') {
    const image = resolveApartmentImageUrl(photos)
    return image ? [image] : []
  }

  return []
}

export function getApartmentPrimaryImage(photos) {
  const image = getApartmentImageList(photos).find(isValidApartmentImage)
  return image ?? apartmentFallbackImage
}

export function getApartmentGallery(photos) {
  const images = getApartmentImageList(photos).filter(isValidApartmentImage)
  return images.length > 0 ? images : [apartmentFallbackImage]
}

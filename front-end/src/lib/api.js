import axios from 'axios'

export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000').replace(/\/$/, '')

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Accept: 'application/json',
  },
})

function normalizeError(error) {
  const message = error.response?.data?.message ?? error.message ?? 'Request failed.'
  const err = new Error(message)
  err.status = error.response?.status
  err.errors = error.response?.data?.errors ?? {}
  throw err
}

function authHeaders(token) {
  return token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {}
}

async function request(config) {
  try {
    const response = await client.request(config)
    return response.data
  } catch (error) {
    normalizeError(error)
  }
}

export async function registerApi(data) {
  return request({
    url: '/api/auth/register',
    method: 'post',
    data,
  })
}

export async function loginApi(data) {
  return request({
    url: '/api/auth/login',
    method: 'post',
    data,
  })
}

export async function logoutApi(token) {
  return request({
    url: '/api/auth/logout',
    method: 'post',
    headers: authHeaders(token),
  })
}

export async function currentUserApi(token) {
  return request({
    url: '/api/auth/user',
    method: 'get',
    headers: authHeaders(token),
  })
}

export async function adminOverviewApi(token) {
  return request({
    url: '/api/admin/overview',
    method: 'get',
    headers: authHeaders(token),
  })
}

export async function adminAnalyticsApi(token) {
  return request({
    url: '/api/admin/analytics',
    method: 'get',
    headers: authHeaders(token),
  })
}

export async function adminUsersApi(token, params = {}) {
  return request({
    url: '/api/admin/users',
    method: 'get',
    headers: authHeaders(token),
    params,
  })
}

export async function adminUserDetailsApi(token, userId) {
  return request({
    url: `/api/admin/users/${userId}`,
    method: 'get',
    headers: authHeaders(token),
  })
}

export async function adminUpdateUserApi(token, userId, payload) {
  return request({
    url: `/api/admin/users/${userId}`,
    method: 'put',
    headers: authHeaders(token),
    data: payload,
  })
}

export async function adminUpdateUserRoleApi(token, userId, role) {
  return request({
    url: `/api/admin/users/${userId}/role`,
    method: 'patch',
    headers: authHeaders(token),
    data: { role },
  })
}

export async function adminUpdateUserStatusApi(token, userId, isActive) {
  return request({
    url: `/api/admin/users/${userId}/status`,
    method: 'patch',
    headers: authHeaders(token),
    data: { is_active: isActive },
  })
}

export async function adminDeleteUserApi(token, userId) {
  return request({
    url: `/api/admin/users/${userId}`,
    method: 'delete',
    headers: authHeaders(token),
  })
}

export async function adminApartmentsApi(token, params = {}) {
  return request({
    url: '/api/admin/apartments',
    method: 'get',
    headers: authHeaders(token),
    params,
  })
}

export async function adminCreateApartmentApi(token, payload) {
  return request({
    url: '/api/admin/apartments',
    method: 'post',
    headers: authHeaders(token),
    data: payload,
  })
}

export async function adminUpdateApartmentApi(token, apartmentId, payload) {
  return request({
    url: `/api/admin/apartments/${apartmentId}`,
    method: 'put',
    headers: authHeaders(token),
    data: payload,
  })
}

export async function adminDeleteApartmentApi(token, apartmentId) {
  return request({
    url: `/api/admin/apartments/${apartmentId}`,
    method: 'delete',
    headers: authHeaders(token),
  })
}

export async function adminUpdateApartmentStatusApi(token, apartmentId, isActive) {
  return request({
    url: `/api/admin/apartments/${apartmentId}/status`,
    method: 'patch',
    headers: authHeaders(token),
    data: { is_active: isActive },
  })
}

export async function adminReservationsApi(token, params = {}) {
  return request({
    url: '/api/admin/reservations',
    method: 'get',
    headers: authHeaders(token),
    params,
  })
}

export async function adminUpdateReservationStatusApi(token, reservationId, status) {
  return request({
    url: `/api/admin/reservations/${reservationId}/status`,
    method: 'patch',
    headers: authHeaders(token),
    data: { status },
  })
}

export async function adminDeleteReservationApi(token, reservationId) {
  return request({
    url: `/api/admin/reservations/${reservationId}`,
    method: 'delete',
    headers: authHeaders(token),
  })
}

export async function adminOwnersApi(token, params = {}) {
  return request({
    url: '/api/admin/owners',
    method: 'get',
    headers: authHeaders(token),
    params,
  })
}

export async function adminNotificationsApi(token) {
  return request({
    url: '/api/admin/notifications',
    method: 'get',
    headers: authHeaders(token),
  })
}

export async function adminSettingsApi(token) {
  return request({
    url: '/api/admin/settings',
    method: 'get',
    headers: authHeaders(token),
  })
}

export async function adminUpdateSettingsApi(token, payload) {
  return request({
    url: '/api/admin/settings',
    method: 'put',
    headers: authHeaders(token),
    data: payload,
  })
}

export async function ownerOverviewApi(token) {
  return request({
    url: '/api/owner/overview',
    method: 'get',
    headers: authHeaders(token),
  })
}

export async function ownerApartmentsApi(token, params = {}) {
  return request({
    url: '/api/owner/apartments',
    method: 'get',
    headers: authHeaders(token),
    params,
  })
}

export async function ownerCreateApartmentApi(token, payload) {
  return request({
    url: '/api/owner/apartments',
    method: 'post',
    headers: authHeaders(token),
    data: payload,
  })
}

export async function ownerUpdateApartmentApi(token, apartmentId, payload) {
  return request({
    url: `/api/owner/apartments/${apartmentId}`,
    method: 'put',
    headers: authHeaders(token),
    data: payload,
  })
}

export async function ownerDeleteApartmentApi(token, apartmentId) {
  return request({
    url: `/api/owner/apartments/${apartmentId}`,
    method: 'delete',
    headers: authHeaders(token),
  })
}

export async function ownerUpdateApartmentStatusApi(token, apartmentId, isActive) {
  return request({
    url: `/api/owner/apartments/${apartmentId}/status`,
    method: 'patch',
    headers: authHeaders(token),
    data: { is_active: isActive },
  })
}

export async function ownerReservationsApi(token, params = {}) {
  return request({
    url: '/api/owner/reservations',
    method: 'get',
    headers: authHeaders(token),
    params,
  })
}

export async function ownerReservationDetailsApi(token, reservationId) {
  return request({
    url: `/api/owner/reservations/${reservationId}`,
    method: 'get',
    headers: authHeaders(token),
  })
}

export async function ownerUpdateReservationStatusApi(token, reservationId, status) {
  return request({
    url: `/api/owner/reservations/${reservationId}/status`,
    method: 'patch',
    headers: authHeaders(token),
    data: { status },
  })
}

export async function ownerCalendarApi(token, params = {}) {
  return request({
    url: '/api/owner/calendar',
    method: 'get',
    headers: authHeaders(token),
    params,
  })
}

export async function ownerBlockDatesApi(token, payload) {
  return request({
    url: '/api/owner/blocked-dates',
    method: 'post',
    headers: authHeaders(token),
    data: payload,
  })
}

export async function ownerUnblockDatesApi(token, blockedDateId) {
  return request({
    url: `/api/owner/blocked-dates/${blockedDateId}`,
    method: 'delete',
    headers: authHeaders(token),
  })
}

export async function ownerAnalyticsApi(token) {
  return request({
    url: '/api/owner/analytics',
    method: 'get',
    headers: authHeaders(token),
  })
}

export async function ownerNotificationsApi(token) {
  return request({
    url: '/api/owner/notifications',
    method: 'get',
    headers: authHeaders(token),
  })
}

export async function ownerProfileApi(token) {
  return request({
    url: '/api/owner/profile',
    method: 'get',
    headers: authHeaders(token),
  })
}

export async function ownerUpdateProfileApi(token, payload) {
  return request({
    url: '/api/owner/profile',
    method: 'put',
    headers: authHeaders(token),
    data: payload,
  })
}

export async function ownerUpdatePasswordApi(token, payload) {
  return request({
    url: '/api/owner/password',
    method: 'put',
    headers: authHeaders(token),
    data: payload,
  })
}

export async function clientOverviewApi(token) {
  return request({
    url: '/api/client/overview',
    method: 'get',
    headers: authHeaders(token),
  })
}

export async function clientReservationsApi(token, params = {}) {
  return request({
    url: '/api/client/reservations',
    method: 'get',
    headers: authHeaders(token),
    params,
  })
}

export async function clientReservationDetailsApi(token, reservationId) {
  return request({
    url: `/api/client/reservations/${reservationId}`,
    method: 'get',
    headers: authHeaders(token),
  })
}

export async function clientCancelReservationApi(token, reservationId) {
  return request({
    url: `/api/client/reservations/${reservationId}/cancel`,
    method: 'patch',
    headers: authHeaders(token),
  })
}

export async function clientFavoritesApi(token, params = {}) {
  return request({
    url: '/api/client/favorites',
    method: 'get',
    headers: authHeaders(token),
    params,
  })
}

export async function clientAddFavoriteApi(token, apartmentId) {
  return request({
    url: '/api/client/favorites',
    method: 'post',
    headers: authHeaders(token),
    data: { apartment_id: apartmentId },
  })
}

export async function clientRemoveFavoriteApi(token, apartmentId) {
  return request({
    url: `/api/client/favorites/${apartmentId}`,
    method: 'delete',
    headers: authHeaders(token),
  })
}

export async function clientBrowseApartmentsApi(token, params = {}) {
  return request({
    url: '/api/client/browse-apartments',
    method: 'get',
    headers: authHeaders(token),
    params,
  })
}

export async function clientNotificationsApi(token) {
  return request({
    url: '/api/client/notifications',
    method: 'get',
    headers: authHeaders(token),
  })
}

export async function clientProfileApi(token) {
  return request({
    url: '/api/client/profile',
    method: 'get',
    headers: authHeaders(token),
  })
}

export async function clientUpdateProfileApi(token, payload) {
  return request({
    url: '/api/client/profile',
    method: 'put',
    headers: authHeaders(token),
    data: payload,
  })
}

export async function clientUpdatePasswordApi(token, payload) {
  return request({
    url: '/api/client/password',
    method: 'put',
    headers: authHeaders(token),
    data: payload,
  })
}

export async function apartmentsApi(params = {}) {
  return request({
    url: '/api/apartments',
    method: 'get',
    params,
  })
}

export async function apartmentDetailsApi(apartmentId) {
  return request({
    url: `/api/apartments/${apartmentId}`,
    method: 'get',
  })
}

export async function apartmentAvailabilityApi(apartmentId) {
  return request({
    url: `/api/apartments/${apartmentId}/availability`,
    method: 'get',
  })
}

export async function createReservationApi(token, payload) {
  return request({
    url: '/api/reservations',
    method: 'post',
    headers: authHeaders(token),
    data: payload,
  })
}

// src/store/auth.js

export function setAuth({ token, user }) {
  if (token) localStorage.setItem('token', token)
  if (user) {
    const role = (user.role || 'user').toLowerCase()
    localStorage.setItem('user', JSON.stringify({ ...user, role }))
  }
}

export function clearAuth() {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
}

export function getToken() {
  return localStorage.getItem('token')
}

export function getUser() {
  const raw = localStorage.getItem('user')
  try {
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

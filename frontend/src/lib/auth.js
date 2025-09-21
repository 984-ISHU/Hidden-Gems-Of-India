import api from './api'

const TOKEN_KEY = 'hgoi_token'
const USER_KEY = 'hgoi_user'

export function saveSession(token, user) {
  if (!token || !user) {
    console.error('Invalid session data:', { token: !!token, user: !!user });
    return;
  }
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  api.setToken(token);
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function getUser() {
  const user = localStorage.getItem(USER_KEY)
  return user ? JSON.parse(user) : null
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
  api.clearToken()
}
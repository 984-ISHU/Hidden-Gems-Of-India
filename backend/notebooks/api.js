import axios from "axios"

const api = axios.create({
  baseURL: "http://localhost:8000/api/v1",
  withCredentials: true, // include cookies if backend uses session auth
})

/* ----------------------------- AUTH ----------------------------- */
// Signup
export const signup = async (userData) => {
  const { data } = await api.post("/auth/signup", userData)
  return data
}

// Login
export const login = async (credentials) => {
  const { data } = await api.post("/auth/login", credentials)
  return data
}

// Logout
export const logout = async () => {
  const { data } = await api.post("/auth/logout")
  return data
}

// Get current logged-in user
export const getCurrentUser = async () => {
  const { data } = await api.get("/auth/me")
  return data
}

/* ----------------------------- ARTISANS ----------------------------- */
export const getArtisans = async () => {
  const { data } = await api.get("/artisans")
  return data
}

export const getArtisansBySkill = async (skill) => {
  const { data } = await api.get(`/artisans/skill/${encodeURIComponent(skill)}`)
  return data
}

export const getArtisansByLocation = async (location) => {
  const { data } = await api.get(`/artisans/location/${encodeURIComponent(location)}`)
  return data
}

/* ----------------------------- EVENTS ----------------------------- */
export const getEvents = async (location, date = null) => {
  const params = {}
  if (location) params.location = location
  if (date) params.date = date

  const { data } = await api.get("/events", { params })
  return data
}

/* ----------------------------- DASHBOARD ----------------------------- */
export const getProductsByArtisan = async (artisanId) => {
  const { data } = await api.get(`/artisans/${artisanId}/products`)
  return data
}

export const addProduct = async (artisanId, productData) => {
  const { data } = await api.post(`/artisans/${artisanId}/products`, productData)
  return data
}

export const deleteProduct = async (artisanId, productId) => {
  const { data } = await api.delete(`/artisans/${artisanId}/products/${productId}`)
  return data
}

export const getMarketingOutput = async (artisanId, prompt) => {
  const { data } = await api.post(`/artisans/${artisanId}/marketing`, { prompt })
  return data
}

export const getRAGOutput = async (artisanId, query) => {
  const { data } = await api.post(`/artisans/${artisanId}/rag`, { query })
  return data
}

/* ----------------------------- PROFILE ----------------------------- */
export const updateProfile = async (artisanId, updates) => {
  const { data } = await api.patch(`/artisans/${artisanId}/profile`, updates)
  return data
}

export const generateStoryFromBio = async (bio) => {
  const { data } = await api.post("/generate-story", { bio })
  return data
}

export default api
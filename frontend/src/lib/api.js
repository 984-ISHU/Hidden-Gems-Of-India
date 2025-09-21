/*
  api.js (Axios version)
  Client helper for "Hidden Gems of India" backend APIs
  - Uses axios for HTTP requests.
  - Exports named helpers for each endpoint described in the OpenAPI summary.
  - Handles JSON and multipart/form-data where appropriate.
*/

import axios from 'axios'

let BASE_URL = 'http://127.0.0.1:8000'
let accessToken = null

function setBaseUrl(url) {
  BASE_URL = url.replace(/\/$/, '')
}

function setToken(token) {
  accessToken = token
}

function clearToken() {
  accessToken = null
}

function client() {
  const instance = axios.create({
    baseURL: BASE_URL,
    withCredentials: true, // Important for cookies
    headers: {
      'Content-Type': 'application/json',
    }
  })

  instance.interceptors.request.use(config => {
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`
    }
    return config
  })

  return instance
}

// Helper function for FormData requests
function clientFormData() {
  const instance = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
    // Don't set Content-Type for FormData - let browser handle it
  })

  instance.interceptors.request.use(config => {
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`
    }
    return config
  })

  return instance
}

// ---- Health ----
async function health() {
  return client().get('/health').then(r => r.data)
}

// ---- Auth ----
async function signup(data) {
  try {
    const response = await client().post('/api/v1/auth/signup', {
      username: data.username,
      email: data.email,
      password: data.password,
      user_type: data.user_type || 'artisan'
    });
    return response.data;
  } catch (error) {
    console.error('Signup error details:', error.response?.data);
    throw error;
  }
}

async function login(data) {
  const res = await client().post('/api/v1/auth/login', data)
  if (res.data?.access_token) {
    setToken(res.data.access_token)
  }
  return res.data
}

async function logout() {
  const res = await client().post('/api/v1/auth/logout')
  clearToken()
  return res.data
}

async function getCurrentUser() {
  return client().get('/api/v1/auth/me').then(r => r.data)
}

// ---- Artisans ----
async function getArtisans(params = {}) {
  return client().get('/api/v1/artisans/', { params }).then(r => r.data)
}

async function getArtisansBySkill(skill) {
  return client().get(`/api/v1/artisans/skill/${encodeURIComponent(skill)}`).then(r => r.data)
}

async function getArtisansByLocation(location) {
  return client().get(`/api/v1/artisans/location/${encodeURIComponent(location)}`).then(r => r.data)
}

async function getArtisan(userId) {
  return client().get(`/api/v1/artisans/${encodeURIComponent(userId)}`).then(r => r.data)
}

async function getCurrentUserArtisan() {
  const user = await getCurrentUser()
  if (!user || !user.email) {
    throw new Error('No authenticated user found')
  }
  return getArtisanByEmail(user.email)
}

async function getArtisanByEmail(email) {
  return client().get(`/api/v1/artisans/by-email/${encodeURIComponent(email)}`).then(r => r.data)
}

async function createArtisanProfile(userId) {
  return client().post(`/api/v1/artisans/create?user_id=${encodeURIComponent(userId)}`).then(r => r.data)
}

async function createArtisanProfileByEmail(email) {
  return client().post(`/api/v1/artisans/create-by-email?email=${encodeURIComponent(email)}`).then(r => r.data)
}

async function updateArtisanProfile(artisanId, profileData = {}, profilePhoto = null) {
  if (profilePhoto) {
    const fd = new FormData()
    Object.entries(profileData || {}).forEach(([k, v]) => {
      if (v !== undefined && v !== null) {
        if (Array.isArray(v)) fd.append(k, JSON.stringify(v))
        else fd.append(k, String(v))
      }
    })
    fd.append('profile_photo', profilePhoto)
    return clientFormData().patch(`/api/v1/artisans/${encodeURIComponent(artisanId)}/profile`, fd).then(r => r.data)
  }
  return client().patch(`/api/v1/artisans/${encodeURIComponent(artisanId)}/profile`, profileData).then(r => r.data)
}

async function getArtisanProducts(artisanId) {
  return client().get(`/api/v1/artisans/${encodeURIComponent(artisanId)}/products`).then(r => r.data)
}

async function addArtisanProduct(artisanId, product = {}) {
  const hasFileImages = Array.isArray(product.images) && product.images.some(i => (typeof File !== 'undefined' && i instanceof File) || (typeof Blob !== 'undefined' && i instanceof Blob))
  if (hasFileImages) {
    const fd = new FormData()
    if (product.images) product.images.forEach(img => fd.append('images', img))
    ;['name','description','price','category','availability'].forEach(k => {
      if (product[k] !== undefined && product[k] !== null) fd.append(k, String(product[k]))
    })
    return clientFormData().post(`/api/v1/artisans/${encodeURIComponent(artisanId)}/products`, fd).then(r => r.data)
  }
  return client().post(`/api/v1/artisans/${encodeURIComponent(artisanId)}/products`, product).then(r => r.data)
}

async function getArtisanProductsByEmail(email) {
  return client().get(`/api/v1/artisans/by-email/${encodeURIComponent(email)}/products`).then(r => r.data)
}

async function addArtisanProductByEmail(email, product = {}) {
  const hasFileImages = Array.isArray(product.images) && product.images.some(i => (typeof File !== 'undefined' && i instanceof File) || (typeof Blob !== 'undefined' && i instanceof Blob))
  if (hasFileImages) {
    const fd = new FormData()
    if (product.images) product.images.forEach(img => fd.append('images', img))
    ;['name','description','price','category','availability'].forEach(k => {
      if (product[k] !== undefined && product[k] !== null) fd.append(k, String(product[k]))
    })
    return clientFormData().post(`/api/v1/artisans/by-email/${encodeURIComponent(email)}/products`, fd).then(r => r.data)
  }
  return client().post(`/api/v1/artisans/by-email/${encodeURIComponent(email)}/products`, product).then(r => r.data)
}

async function deleteArtisanProduct(artisanId, productId) {
  return client().delete(`/api/v1/artisans/${encodeURIComponent(artisanId)}/products/${encodeURIComponent(productId)}`).then(r => r.data)
}

async function getMarketingOutput(artisanId, prompt, image = null) {
  if (!prompt) {
    throw new Error('Prompt is required for marketing content generation')
  }
  
  const params = { prompt }
  
  if (image) {
    const fd = new FormData()
    fd.append('image', image)
    return clientFormData().post(`/api/v1/artisans/${encodeURIComponent(artisanId)}/marketing`, fd, { params }).then(r => r.data)
  }
  
  // For text-only requests, we still need to send as POST with query params
  return client().post(`/api/v1/artisans/${encodeURIComponent(artisanId)}/marketing`, {}, { params }).then(r => r.data)
}

// ---- Marketing ----
async function generateProductDescription(body) {
  return client().post('/api/v1/product-description/generate', body).then(r => r.data)
}

async function generatePoster(image, productName = null) {
  const fd = new FormData()
  fd.append('image', image)
  if (productName && productName.trim()) {
    fd.append('product_name', productName.trim())
  }
  
  console.log("Making POST request to /api/v1/poster/generate with image:", image.name)
  
  try {
    const response = await clientFormData().post('/api/v1/poster/generate', fd, {
      responseType: 'blob',
      timeout: 30000 // 30 second timeout
    })
    
    console.log("Response received:", response.status, response.headers)
    
    // Ensure we have a valid blob
    if (!response.data || !(response.data instanceof Blob)) {
      throw new Error(`Invalid response: expected Blob, got ${typeof response.data}`)
    }
    
    if (response.data.size === 0) {
      throw new Error("Received empty blob response")
    }
    
    console.log("Blob received successfully, size:", response.data.size)
    return response.data
  } catch (error) {
    console.error("Error in generatePoster:", error.response?.status, error.message)
    throw error
  }
}

// ---- Events ----
async function findEvents(params = {}) {
  return client().get('/api/v1/events/find', { params }).then(r => r.data)
}

async function getAllEvents(params = {}) {
  return client().get('/api/v1/events/').then(r => r.data)
}

// ---- Assistant ----
async function assistantChat(chatReq) {
  return client().post('/api/v1/assistant/chat', chatReq).then(r => r.data)
}

// ---- Profile ----
async function generateStoryFromBio() {
  return client().get('/api/v1/generate-story').then(r => r.data)
}

const api = {
  setBaseUrl,
  setToken,
  clearToken,

  health,

  signup,
  login,
  logout,
  getCurrentUser,

  getArtisans,
  getArtisansBySkill,
  getArtisansByLocation,
  getArtisan,
  getArtisanByEmail,
  getCurrentUserArtisan,
  createArtisanProfile,
  createArtisanProfileByEmail,
  updateArtisanProfile,
  getArtisanProducts,
  getArtisanProductsByEmail,
  addArtisanProduct,
  addArtisanProductByEmail,
  deleteArtisanProduct,
  getMarketingOutput,

  generateProductDescription,
  generatePoster,

  getAllEvents,
  findEvents,

  assistantChat,

  generateStoryFromBio,
}

export default api

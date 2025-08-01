import axios from "axios"
import Cookies from "js-cookie"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api"

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get("auth_token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      Cookies.remove("auth_token")
      Cookies.remove("user")
      window.location.href = "/login"
    }
    return Promise.reject(error)
  },
)

export default api

// main.js
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import axios from 'axios'

// 🔥 CONFIGURATION GLOBALE AXIOS
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

axios.defaults.baseURL = API_URL
axios.defaults.headers.common['Content-Type'] = 'application/json'

// Intercepteur pour ajouter automatiquement le token
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      return
    }
    config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Intercepteur pour gérer les erreurs 401 (non authentifié)
/* axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      router.push('/login')
    }
    return Promise.reject(error)
  }
) */

const app = createApp(App)
app.use(router)
app.mount('#app')
import { defineStore } from 'pinia'
import api from '@/api'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    isLoading: false
  }),

  getters: {
    isLoggedIn: (state) => !!state.user,
    isAdmin: (state) => state.user?.is_admin === true
  },

  actions: {
    setUser(user) {
      this.user = user
      if (user) {
        localStorage.setItem('user', JSON.stringify(user))
      } else {
        localStorage.removeItem('user')
      }
    },

    logout(router) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      this.user = null
      if (router) router.push('/')
    },

    async checkAuth() {
      const token = localStorage.getItem('token')
      const storedUser = localStorage.getItem('user')

      if (!token) {
        this.user = null
        return
      }

      if (storedUser) {
        this.user = JSON.parse(storedUser)
        return
      }

      this.isLoading = true
      try {
        const res = await api.get('/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        })
        this.setUser(res.data.user || res.data)
      } catch (e) {
        this.user = null
        localStorage.removeItem('token')
      } finally {
        this.isLoading = false
      }
    }
  }
})

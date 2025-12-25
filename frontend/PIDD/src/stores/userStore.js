import { defineStore } from 'pinia'
import { useCartStore } from './cartStore'

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null
  }),

  getters: {
    isAuthenticated: (state) => !!state.user,
    isAdmin: (state) => state.user?.is_admin === true
  },

  actions: {
    login(userData) {
      const cartStore = useCartStore()

      // 🔥 Panier vide à chaque connexion
      cartStore.clearCart()

      this.user = userData
    },

    logout() {
      const cartStore = useCartStore()
      cartStore.clearCart()

      this.user = null
      localStorage.removeItem('token')
    }
  }
})

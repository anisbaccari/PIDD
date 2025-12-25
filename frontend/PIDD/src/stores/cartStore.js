import { defineStore } from 'pinia'

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [] // tableau des produits du panier
  }),

  getters: {
    totalItems: (state) =>
      state.items.reduce((total, item) => total + item.quantity, 0)
  },

  actions: {
    loadCart() {
      const savedCart = localStorage.getItem('cart')
      this.items = savedCart ? JSON.parse(savedCart) : []
    },

    clearCart() {
      this.items = []
      localStorage.removeItem('cart')
    }
  }
})

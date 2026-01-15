<template>
  <div class="cart-page">
    <div class="cart-content">
      <!-- Fil d'Ariane -->
      <nav class="breadcrumb">
        <router-link to="/" class="breadcrumb-link">Accueil</router-link>
        <span class="breadcrumb-separator">/</span>
        <span class="breadcrumb-current">Mon Panier</span>
      </nav>

      <h1 class="title">Mon Panier</h1>

      <!-- Loading -->
      <div v-if="loading" class="loading">
        <p>Chargement du panier...</p>
      </div>

      <!-- Panier vide -->
      <div v-else-if="cartItems.length === 0" class="empty-cart">
        <div class="empty-icon">🛒</div>
        <h2>Votre panier est vide</h2>
        <p>Découvrez nos produits et ajoutez-les à votre panier</p>
        <router-link to="/" class="cta-button">
          Découvrir les collections
        </router-link>
      </div>

      <!-- Panier avec articles -->
      <div v-else class="cart-with-items">
        <div class="cart-layout">
          <!-- Liste des articles -->
          <div class="cart-items-section">
            <div class="section-header">
              <h2>Articles ({{ getTotalItems() }})</h2>
              <button @click="clearCart" class="clear-cart-btn">
                Vider le panier
              </button>
            </div>

            <div class="cart-items">
              <div
                v-for="item in cartItems"
                :key="item.id"
                class="cart-item"
              >
                <!-- Image -->
                <div class="item-image">
                  <img
                    :src="getProductImage(item.product)"
                    :alt="item.product?.name || 'Produit'"
                  />
                </div>

                <!-- Infos produit -->
                <div class="item-details">
                  <h3 class="product-name">
                    {{ item.product?.name || 'Produit' }}
                  </h3>
                  <p class="product-brand">
                    {{ item.product?.brand || '' }}
                  </p>
                  <p class="product-price-unit">
                    {{ formatPrice(item.unitPrice) }} l'unité
                  </p>
                </div>

                <!-- Quantité -->
                <div class="quantity-controls">
                  <button
                    @click="updateQuantity(item.id, item.quantity - 1)"
                    :disabled="item.quantity <= 1"
                    class="quantity-btn"
                  >
                    −
                  </button>
                  <span class="quantity">{{ item.quantity }}</span>
                  <button
                    @click="updateQuantity(item.id, item.quantity + 1)"
                    class="quantity-btn"
                  >
                    +
                  </button>
                </div>

                <!-- Total ligne -->
                <div class="item-total">
                  <span class="item-price">
                    {{ formatPrice(item.unitPrice * item.quantity) }}
                  </span>

                  <button
                    @click="removeItem(item.id)"
                    class="remove-btn"
                    title="Supprimer"
                  >
                    ×
                  </button>
                </div>
              </div>
            </div>
          </div>
      
          <!-- Résumé -->
          <div class="order-summary">
            <div class="summary-card">
              <h3>Résumé de la commande</h3>

              <div class="summary-line">
                <span>Sous-total ({{ getTotalItems() }} articles)</span>
                <span>{{ formatPrice(getCartTotal()) }}</span>
              </div>

              <div class="summary-line">
                <span>Frais de livraison</span>
                <span>Gratuit</span>
              </div>

              <div class="summary-divider"></div>

              <div class="summary-total">
                <span>Total</span>
                <span class="total-price">
                  {{ formatPrice(getCartTotal()) }}
                </span>
              </div>

              <button class="checkout-btn" @click="proceedToCheckout">
                Procéder au paiement
              </button>

              <router-link to="/" class="continue-shopping">
                ← Continuer mes achats
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useHead } from '@unhead/vue'
import axios from 'axios'
import api from '../api.js';

export default {
  name: 'CartPage',
  setup() {
    useHead({
      title: 'Mon Panier | MonShop',
      meta: [
        { name: 'description', content: 'Voir et gérer les articles dans votre panier.' }
      ]
    })
  },

  props: {
    setTmpPanier:Function,
    getTmpPanier:Function,
    getOrderId:Function,
    setOrderId:Function,
    orderId: Object,
    user:Object,
    tmpUser: Object,
    totalPanierPrice: Function,
  },
  data() {
    return {
      cartItems: [],
      subtotal: 0,
      loading: true,
       myOrders: []
    }
  },

  async mounted() {
    console.log(this.tmpUser)
    await this.fetchCart()
    await this.fetchMyOrders()
  },

  methods: {
    // 🔹 Charger le panier
    async fetchCart() {
        console.log('[PAnier] user: ',this.user)
      this.loading = true
      try {

        if(this.user){

       
        console.log('🔄 Chargement du panier...')
        console.log('[PAnier] user: ',this.user.id)

        
        //const res = await axios.get('/cart')
         const res = await api.get(`http://localhost:3000/cart/${this.user.id}`);
        console.log('✅ Réponse API:', res.data)

        // ✅ Utiliser la bonne structure de données
        this.cartItems = res.data?.items || []
        this.subtotal = res.data?.subtotal || 0
        const newOrderId = res.data?.orderId || 0
        this.setOrderId(newOrderId) 
        console.log(`📦 ${this.cartItems.length} articles chargés`)
        
        // Debug
        if (this.cartItems.length > 0) {
          console.log('Premier article:', this.cartItems)
        }
      } else 
      { 
          this.cartItems = this.tmpUser?.panier || []
          this.subtotal = this.totalPanierPrice()
      }
      } catch (err) {
        console.error('❌ Erreur chargement panier:', {
          message: err.message,
          status: err.response?.status,
          data: err.response?.data
        })
        
        this.cartItems = []
        this.subtotal = 0
        
        if (err.response?.status !== 401) {
          alert('Erreur lors du chargement du panier')
        }
        
      } finally {
        this.loading = false
      }
    },
    async fetchMyOrders() {
    try {

      if(this.user)
    {

      const token = localStorage.getItem('token')

      const res = await fetch('http://localhost:3000/orders/mine', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      this.myOrders = await res.json()
    }

    } catch (e) {
      console.error('Erreur récupération commandes', e)
    }
  },
    async updateQuantity(orderItemId, quantity) {
      if (quantity < 1) return
      console.log("[updateQuantity] this.user",this.user)
     

      try {
         if(this.user){
        console.log(`🔄 Mise à jour: item ${orderItemId} → ${quantity}`)
        console.log(`[order] orderId` , this.orderId)
        
        //await axios.put(`/cart/item/${orderItemId}`, { quantity })
        const response = await api.put(`http://localhost:3000/cart/item/${this.user.id}`, {
              orderId:this.orderId,
              id: orderItemId,
              quantity: quantity,
              userId: this.user.id
        });
        await this.fetchCart()
        
        // 🔥 Mettre à jour le compteur dans le header
        window.EventBus.$emit('cart-updated')
      }
      else { 
        return 
      }
      } catch (err) {
        console.error('❌ Erreur mise à jour:', err)
        alert('Erreur lors de la mise à jour')
      }
    },

    async removeItem(orderItemId) {
      try {
        if(this.user){

        console.log(`🗑️ Suppression item ${orderItemId}`)
        
      //  await axios.delete(`/cart/item/${orderItemId}`)
       const response = await api.post('http://localhost:3000/cart/deleteItem', {
              orderItemId: orderItemId,
              userId: this.user.id
        });

        await this.fetchCart()
        
        // 🔥 Mettre à jour le compteur dans le header
        window.EventBus.$emit('cart-updated')
        }
        
      } catch (err) {
        console.error('❌ Erreur suppression:', err)
        alert('Erreur lors de la suppression')
      }
    },

    async clearCart() {
      if (!confirm('Vider le panier ?')) return
      
      try {
        if(this.user){

        console.log('🗑️ Vidage du panier')
        
      //  await axios.delete('/cart')
         const response = await api.delete(`http://localhost:3000/cart/${this.user.id}`);
        await this.fetchCart()
        
        // 🔥 Mettre à jour le compteur dans le header
        window.EventBus.$emit('cart-updated')
        } else { 
            this.setTmpPanier(null)
        }
        
      } catch (err) {
        console.error('❌ Erreur vidage:', err)
        alert('Erreur lors du vidage du panier')
      }
    },

  proceedToCheckout() {
      if (this.cartItems.length === 0) {
        this.showError('Votre panier est vide');
        return;
      }
      
      this.$router.push('/checkout');
      console.log('🚀 Redirection vers paiement');
    },
    

    // 🔹 Helpers
   getProductImage(product) {
  // Vérifier si product existe
  if (!product) {
    console.warn('⚠️ product est null/undefined')
    return '/images/placeholder.png'
  }
  
  // Vérifier si product.img existe
  if (!product.img) {
    console.warn('⚠️ product.img est vide pour:', product)
    return '/images/placeholder.png'
  }
  
  // ✅ CORRECTION: Images dans public/images/
  // Vite/Vue sert automatiquement les fichiers du dossier public/
  const imagePath = `/images/${product.img}`
  
  console.log(`🖼️ Image: ${product.name} → ${imagePath}`)
  
  return imagePath
},

    formatPrice(price) {
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR'
      }).format(price || 0)
    },

    getTotalItems() {
      return this.cartItems.reduce((sum, item) => sum + (item.quantity || 0), 0)
    },

    getCartTotal() {
      return this.subtotal
    }
  }
}
</script>

<style scoped>
.cart-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 2rem 1rem;
}

.cart-content {
  max-width: 1200px;
  margin: 0 auto;
}

.breadcrumb {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
  font-size: 0.9rem;
}

.breadcrumb-link {
  color: #666;
  text-decoration: none;
}

.breadcrumb-link:hover {
  color: #333;
}

.breadcrumb-current {
  color: #333;
  font-weight: 500;
}

.title {
  font-size: 2rem;
  margin-bottom: 2rem;
}

.loading {
  text-align: center;
  padding: 3rem;
  color: #666;
}

.empty-cart {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 8px;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.cta-button {
  display: inline-block;
  margin-top: 2rem;
  padding: 1rem 2rem;
  background: #333;
  color: white;
  text-decoration: none;
  border-radius: 4px;
}

.cart-layout {
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 2rem;
}

.cart-items-section {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.clear-cart-btn {
  padding: 0.5rem 1rem;
  background: #f44336;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.cart-items {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.cart-item {
  display: grid;
  grid-template-columns: 100px 1fr auto auto;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  align-items: center;
}

.item-image img {
  width: 100%;
  height: 100px;
  object-fit: cover;
  border-radius: 4px;
}

.quantity-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.quantity-btn {
  width: 32px;
  height: 32px;
  border: 1px solid #ddd;
  background: white;
  cursor: pointer;
  border-radius: 4px;
}

.quantity-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.item-total {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.5rem;
}

.item-price {
  font-weight: bold;
}

.remove-btn {
  width: 32px;
  height: 32px;
  border: 1px solid #e0e0e0;
  background: white;
  color: #f44336;
  font-size: 1.5rem;
  cursor: pointer;
  border-radius: 4px;
}

.order-summary {
  position: sticky;
  top: 2rem;
  height: fit-content;
}

.summary-card {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
}

.summary-line {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.summary-divider {
  border-top: 1px solid #e0e0e0;
  margin: 1rem 0;
}

.summary-total {
  display: flex;
  justify-content: space-between;
  font-size: 1.2rem;
  font-weight: bold;
  margin-bottom: 1.5rem;
}

.checkout-btn {
  width: 100%;
  padding: 1rem;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  margin-bottom: 1rem;
}

.continue-shopping {
  display: block;
  text-align: center;
  color: #666;
  text-decoration: none;
  padding: 0.5rem;
}

@media (max-width: 768px) {
  .cart-layout {
    grid-template-columns: 1fr;
  }
  
  .cart-item {
    grid-template-columns: 80px 1fr;
    gap: 0.5rem;
  }
  
  .quantity-controls,
  .item-total {
    grid-column: 2;
  }
}
</style>
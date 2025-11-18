<template>
  <div class="cart-page">
    <!-- Navigation 
    <nav class="navigation">
      <router-link to="/" class="nav-logo">MonShop</router-link>
      <div class="nav-links">
        <router-link to="/" class="nav-link">Accueil</router-link>
        <router-link to="/categories" class="nav-link">Collections</router-link>
        <router-link to="/cart" class="nav-link">Panier ({{ getTotalItems() }})</router-link>
      </div>
      <div class="nav-login">
        <div v-if="user" class="user-menu">
          <span class="welcome-message">Bienvenue, {{ user.prenom }}!</span>
          <button @click="logout" class="logout-button">Déconnexion</button>
        </div>
        <router-link v-else to="/login" class="login-button">
          Se connecter
        </router-link>
      </div>
    </nav>
    -->

    <div class="cart-content">
      <!-- Fil d'Ariane -->
      <nav class="breadcrumb">
        <router-link to="/" class="breadcrumb-link">Accueil</router-link>
        <span class="breadcrumb-separator">/</span>
        <span class="breadcrumb-current">Mon Panier</span>
      </nav>

      <h1 class="title">Mon Panier</h1>

      <!-- Panier vide -->
      <div v-if="cartItems.length === 0" class="empty-cart">
        <div class="empty-icon">🛒</div>
        <h2>Votre panier est vide</h2>
        <p>Découvrez nos produits et ajoutez-les à votre panier</p>
        <router-link to="/categories" class="cta-button">Découvrir les collections</router-link>
      </div>

      <!-- Panier avec articles -->
      <div v-else class="cart-with-items">
        <div class="cart-layout">
          <!-- Liste des articles -->
          <div class="cart-items-section">
            <div class="section-header">
              <!-- <h2>Articles ({{ getTotalItems() }})</h2> -->
              <button @click="clearCart" class="clear-cart-btn" v-if="cartItems.length > 0">
                Vider le panier
              </button>
            </div>
            
            <div class="cart-items">
              <div 
                v-for="item in cartItems" 
                :key="item.id" 
                class="cart-item"
              >
                <div class="item-image">
                  <img :src="getProductImage(item.img)" :alt="item.name" />
                </div>
                
                <div class="item-details">
                  <h3 class="product-name">{{ item.name }}</h3>
                  <p class="product-brand">{{ item.brand }}</p>
                <!--   <p class="product-price-unit">{{ formatPrice(item.price) }} l'unité</p> -->
                </div>
                
                <div class="quantity-controls">
                  <button 
                    @click="updateQuantity(item.id, item.quantity - 1)"
                    :disabled="item.quantity <= 1"
                    class="quantity-btn"
                  >
                    −
                  </button>
               <!--    <span class="quantity">{{ item.quantity }}</span> -->
                <!--   <button 
                    @click="updateQuantity(item.id, item.quantity + 1)"
                    class="quantity-btn"
                  >
                  +
                </button>
                -->
                </div>
                
<!--                 <div class="item-total">
                  {{ formatPrice(item.price * item.quantity) }}
                </div> -->
                
<!--                 <button 
                  @click="removeItem(item.id)"
                  class="remove-btn"
                  title="Supprimer"
                >
                  ×
                </button> -->
              </div>
            </div>
          </div>

          <!-- Résumé de commande -->
          <div class="order-summary">
            <div class="summary-card">
              <h3>Résumé de la commande</h3>
              
              <div class="summary-line">
<!--                 <span>Sous-total ({{ getTotalItems() }} articles)</span>
                <span>{{ formatPrice(getCartTotal()) }}</span> -->
              </div>
              
              <div class="summary-line">
                <span>Frais de livraison</span>
                <span>Gratuit</span>
              </div>
              
              <div class="summary-divider"></div>
              
              <div class="summary-total">
                <span>Total</span>
               <!--  <span class="total-price">{{ formatPrice(getCartTotal()) }}</span> -->
              </div>
              
              <button class="checkout-btn" @click="proceedToCheckout">
                Procéder au paiement
              </button>
              
              <router-link to="/categories" class="continue-shopping">
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
// Import des images
import noir from '../assets/noir.png'
import blanc from '../assets/blanc.png'
import rosefemme from '../assets/rosefemme.png'
import blancfemme from '../assets/blancfemme.png'
import noirfemme from '../assets/noirfemme.png'
import enfantbleu from '../assets/enfantbleu.png'
import enfantrouge from '../assets/enfantrouge.png'
import gris from '../assets/gris.png'

export default {
  name: 'CartPage',
  props: [
    'user', 
    'setUser',
    'getUser',
    'setPanier',
    'getPanier'
/*     'addToCartGlobal', 
    'updateCartQuantity', 
    'removeFromCart', 
    'clearCart',
    'cartItems', 
    'getCartTotal', 
    'getTotalItems' */
  ],
  data() {
    return {
      deliveryPrice: 0, // Livraison gratuite
      imageMap: {
        'noir.png': noir,
        'blanc.png': blanc,
        'rosefemme.png': rosefemme,
        'gris.png': gris,
        'blancfemme.png': blancfemme,
        'noirfemme.png': noirfemme,
        'enfantbleu.png': enfantbleu,
        'enfantrouge.png': enfantrouge
      },
      cartItems : []
    }
  },
  mounted(){
    this.cartItems = this.getPanier()
    console.log(" cartiem :",this.getPanier())
  },
  computed: {
    // ✅ SUPPRIMEZ ces computed properties redondantes
    // totalItems() et subtotal() sont déjà dans App.vue
  },
  methods: {
    updateQuantity(productId, newQuantity) {
      if (this.updateCartQuantity) {
        this.updateCartQuantity(productId, newQuantity);
      }
    },
    
    removeItem(productId) {
      if (this.removeFromCart) {
        this.removeFromCart(productId);
      }
    },
    
    clearCart() {
      if (this.clearCart && confirm('Êtes-vous sûr de vouloir vider votre panier ?')) {
        this.clearCart();
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
    
    getProductImage(imgName) {
      if (!imgName) return '';
      return this.imageMap[imgName] || '';
    },
    
    formatPrice(price) {
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR'
      }).format(price);
    },
    
    logout() {
      if (this.setUser) {
        this.setUser(null);
      }
      localStorage.removeItem('token');
      this.$router.push('/');
    },
    
    showSuccess(message) {
      alert(`✅ ${message}`);
    },
    
    showError(message) {
      alert(`❌ ${message}`);
    }
  }
}
</script>

<style scoped>
.cart-page {
  min-height: 100vh;
  background: #f8fafc;
}

.cart-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

/* Breadcrumb */
.breadcrumb {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 2rem;
  font-size: 0.9rem;
}

.breadcrumb-link {
  color: #3b82f6;
  text-decoration: none;
}

.breadcrumb-link:hover {
  text-decoration: underline;
}

.breadcrumb-separator {
  color: #9ca3af;
}

.breadcrumb-current {
  color: #6b7280;
  font-weight: 500;
}

.title {
  font-size: 2.5rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: 3rem;
  color: #1f2937;
}

/* Panier vide */
.empty-cart {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1.5rem;
}

.empty-cart h2 {
  color: #1f2937;
  margin-bottom: 1rem;
}

.empty-cart p {
  color: #6b7280;
  margin-bottom: 2rem;
}

.cta-button {
  display: inline-block;
  padding: 1rem 2rem;
  background: #3b82f6;
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
  transition: background 0.3s ease;
}

.cta-button:hover {
  background: #2563eb;
}

/* Layout panier avec articles */
.cart-layout {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
  align-items: start;
}

/* Section articles */
.cart-items-section {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.section-header {
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 1rem;
  margin-bottom: 1.5rem;
}

.section-header h2 {
  color: #1f2937;
  margin: 0;
}

/* Articles individuels */
.cart-item {
  display: grid;
  grid-template-columns: 80px 1fr auto auto auto;
  gap: 1.5rem;
  align-items: center;
  padding: 1.5rem 0;
  border-bottom: 1px solid #f3f4f6;
}

.cart-item:last-child {
  border-bottom: none;
}

.item-image img {
  width: 80px;
  height: 80px;
  object-fit: contain;
  border-radius: 8px;
  background: #f9fafb;
}

.item-details {
  text-align: left;
}

.product-name {
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 0.25rem 0;
}

.product-brand {
  color: #6b7280;
  font-size: 0.9rem;
  margin: 0 0 0.5rem 0;
}

.product-price-unit {
  color: #3b82f6;
  font-weight: 600;
  margin: 0;
}

/* Contrôles quantité */
.quantity-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #f8fafc;
  border-radius: 8px;
  padding: 0.25rem;
}

.quantity-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: white;
  border-radius: 6px;
  font-size: 1.2rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease;
}

.quantity-btn:hover:not(:disabled) {
  background: #e5e7eb;
}

.quantity-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.quantity {
  font-weight: 600;
  min-width: 30px;
  text-align: center;
}

/* Prix total par article */
.item-total {
  font-weight: 700;
  font-size: 1.1rem;
  color: #1f2937;
  min-width: 80px;
  text-align: right;
}

/* Bouton suppression */
.remove-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: #fef2f2;
  color: #dc2626;
  border-radius: 6px;
  font-size: 1.2rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.remove-btn:hover {
  background: #dc2626;
  color: white;
}

/* Résumé commande */
.order-summary {
  position: sticky;
  top: 2rem;
}

.summary-card {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.summary-card h3 {
  margin: 0 0 1.5rem 0;
  color: #1f2937;
  font-size: 1.25rem;
}

.summary-line {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
  color: #6b7280;
}

.summary-divider {
  height: 1px;
  background: #e5e7eb;
  margin: 1.5rem 0;
}

.summary-total {
  display: flex;
  justify-content: space-between;
  font-size: 1.2rem;
  font-weight: 700;
  color: #1f2937;
}

.total-price {
  color: #3b82f6;
}

.checkout-btn {
  width: 100%;
  padding: 1rem;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1.1rem;
  cursor: pointer;
  transition: background 0.3s ease;
  margin: 1.5rem 0 1rem 0;
}

.checkout-btn:hover {
  background: #059669;
}

.continue-shopping {
  display: block;
  text-align: center;
  color: #3b82f6;
  text-decoration: none;
  font-weight: 500;
}

.continue-shopping:hover {
  text-decoration: underline;
}

/* Navigation (identique aux autres pages) */
.navigation {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-logo {
  font-size: 1.5rem;
  font-weight: bold;
  color: #3b82f6;
  text-decoration: none;
}

.nav-links {
  display: flex;
  gap: 2rem;
}

.nav-link {
  text-decoration: none;
  color: #374151;
  font-weight: 500;
  transition: color 0.3s ease;
}

.nav-link:hover,
.nav-link.router-link-active {
  color: #3b82f6;
}

.nav-login {
  display: flex;
  align-items: center;
}

.user-menu {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.welcome-message {
  color: #3b82f6;
  font-weight: 600;
  font-size: 0.9rem;
}

.login-button {
  padding: 0.5rem 1rem;
  background: #3b82f6;
  color: white !important;
  border-radius: 8px;
  text-decoration: none;
  transition: all 0.3s ease;
}

.login-button:hover {
  background: #2563eb;
  transform: translateY(-1px);
}

.logout-button {
  padding: 0.5rem 1rem;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.logout-button:hover {
  background: #dc2626;
  transform: translateY(-1px);
}

/* Responsive */
@media (max-width: 768px) {
  .cart-content {
    padding: 1rem;
  }
  
  .cart-layout {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .cart-item {
    grid-template-columns: 60px 1fr;
    gap: 1rem;
    padding: 1rem 0;
  }
  
  .quantity-controls,
  .item-total,
  .remove-btn {
    grid-column: 1 / -1;
    justify-self: start;
  }
  
  .quantity-controls {
    justify-self: start;
  }
  
  .item-total {
    justify-self: end;
    margin-left: auto;
  }
  
  .remove-btn {
    position: absolute;
    top: 1rem;
    right: 0;
  }
  
  .cart-item {
    position: relative;
  }
  
  .navigation {
    flex-direction: column;
    gap: 1rem;
  }
  
  .nav-links {
    gap: 1rem;
  }
  
  .user-menu {
    flex-direction: column;
    gap: 0.5rem;
    text-align: center;
  }
}
</style>
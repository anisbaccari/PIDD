<script>
import AppFooter from './components/AppFooter.vue'
import api from './api';

export default {
  components: { AppFooter },
  
  data() {
    return { 
      user: null,
      cartItems: []
    };
  },
  methods: {
    setUser(user) {
      this.user = user;
    },
    getUser() {
      return this.user;
    },
    
    addToCart(product) {
      console.log('🛒 Ajout au panier global:', product.name);
      
      const existingItem = this.cartItems.find(item => item.id === product.id);
      
      if (existingItem) {
        existingItem.quantity += product.quantity;
      } else {
        this.cartItems.push({
          ...product,
          quantity: product.quantity || 1
        });
      }
      
      this.saveCartToLocalStorage();
      console.log('✅ Panier mis à jour:', this.cartItems);
    },
    
    updateCartQuantity(productId, newQuantity) {
      const item = this.cartItems.find(item => item.id === productId);
      if (item) {
        if (newQuantity <= 0) {
          this.removeFromCart(productId);
        } else {
          item.quantity = newQuantity;
          this.saveCartToLocalStorage();
        }
      }
    },
    
    removeFromCart(productId) {
      this.cartItems = this.cartItems.filter(item => item.id !== productId);
      this.saveCartToLocalStorage();
      console.log('🗑️ Produit supprimé du panier:', productId);
    },
    
    clearCart() {
      this.cartItems = [];
      this.saveCartToLocalStorage();
      console.log('🧹 Panier vidé');
    },
    
    saveCartToLocalStorage() {
      localStorage.setItem('monShop_cart', JSON.stringify(this.cartItems));
    },
    
    loadCartFromLocalStorage() {
      try {
        const savedCart = localStorage.getItem('monShop_cart');
        if (savedCart) {
          this.cartItems = JSON.parse(savedCart);
          console.log('📦 Panier chargé:', this.cartItems.length, 'articles');
        }
      } catch (error) {
        console.error('❌ Erreur chargement panier:', error);
        this.cartItems = [];
      }
    },
    
    getCartTotal() {
      return this.cartItems.reduce((total, item) => {
        return total + (item.price * item.quantity);
      }, 0);
    },
    
    getTotalItems() {
      return this.cartItems.reduce((total, item) => total + item.quantity, 0);
    }
  },
  async mounted() {
    const token = localStorage.getItem("token");
    if (!token) {
      console.log("[App] : aucun token trouvé");
    } else {
      console.log("[App] token trouvé :", token)
      try {
        const res = await api.get('http://localhost:3000/profil', {
          headers: { Authorization: `Bearer ${token}` }
        });

        this.user = res.data.user;
        console.log('✅ Profil utilisateur chargé:', res.data);
        
      } catch (err) {
        console.error('❌ Erreur profil:', err.response?.data || err.message);
        localStorage.removeItem("token");
        this.user = null;
      }
    }
    
    this.loadCartFromLocalStorage();
  }
};
</script>

<template>
  <div id="app">
    <!-- Contenu principal avec wrapper pour le footer sticky -->
    <div class="app-content">
      <router-view 
        :user="user"
        :getUser="getUser"
        :setUser="setUser"
        :addToCartGlobal="addToCart"
        :updateCartQuantity="updateCartQuantity"
        :removeFromCart="removeFromCart"
        :clearCart="clearCart"
        :cartItems="cartItems"
        :getCartTotal="getCartTotal"
        :getTotalItems="getTotalItems"
      />
    </div>
    <AppFooter />
  </div>
</template>

<style>
/* Styles globaux */
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: "Inter", sans-serif;
  background-color: #f8fafc;
  color: #374151;
  line-height: 1.6;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* ✅ CORRECTION: Wrapper pour le contenu principal */
.app-content {
  flex: 1 0 auto; /* Prend tout l'espace disponible */
  display: flex;
  flex-direction: column;
}

/* Styles pour les liens */
a {
  color: #3b82f6;
  text-decoration: none;
  transition: color 0.3s ease;
}

a:hover {
  text-decoration: underline;
  color: #2563eb;
}

/* Styles pour les boutons */
button {
  font-family: inherit;
  cursor: pointer;
  border: none;
  border-radius: 6px;
  transition: all 0.3s ease;
}

/* Styles pour les inputs */
input, select, textarea {
  font-family: inherit;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  padding: 0.5rem 0.75rem;
  font-size: 1rem;
}

input:focus, select:focus, textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Utility classes */
.text-center { text-align: center; }
.text-left { text-align: left; }
.text-right { text-align: right; }

.mt-1 { margin-top: 0.25rem; }
.mt-2 { margin-top: 0.5rem; }
.mt-4 { margin-top: 1rem; }
.mt-8 { margin-top: 2rem; }

.mb-1 { margin-bottom: 0.25rem; }
.mb-2 { margin-bottom: 0.5rem; }
.mb-4 { margin-bottom: 1rem; }
.mb-8 { margin-bottom: 2rem; }

.p-4 { padding: 1rem; }
.p-8 { padding: 2rem; }

.flex { display: flex; }
.justify-center { justify-content: center; }
.justify-between { justify-content: space-between; }
.items-center { align-items: center; }

.grid { display: grid; }
.gap-4 { gap: 1rem; }
.gap-8 { gap: 2rem; }

.w-full { width: 100%; }
.h-full { height: 100%; }

/* Scrollbar personnalisée */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f5f9;
}

::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>
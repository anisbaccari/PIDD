<script>
import axios from 'axios'
import api from './api.js'
import AppFooter from './components/AppFooter.vue'
import UserMenu from './components/UserMenu.vue'

// Event Bus pour Vue 3
const EventBus = {
  events: {},
  $on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = []
    }
    this.events[event].push(callback)
  },
  $emit(event, data) {
    if (this.events[event]) {
      this.events[event].forEach(callback => callback(data))
    }
  },
  $off(event, callback) {
    if (this.events[event]) {
      const index = this.events[event].indexOf(callback)
      if (index > -1) {
        this.events[event].splice(index, 1)
      }
    }
  }
}

window.EventBus = EventBus

export default {
  components: { AppFooter, UserMenu },

  data() {
    return {
      orderId: null,
      tmpUser: { panier:[]},
      user: null,
      cartItemsCount: 0, // 🔥 Nombre d'articles dans le panier BD
      isLoadingUser: false
    }
  },

  methods: {
    /* === AUTHENTIFICATION === */
    setUser(user) {
      console.log('🔄 setUser:', user)
      this.user = user
      
      if (user) {
        localStorage.setItem('user', JSON.stringify(user))
        // Charger le compteur du panier depuis la BD
        this.fetchCartCount()
      } else {
        localStorage.removeItem('user')
        this.cartItemsCount = 0
      }
      
      this.$forceUpdate()
    },

    getUser() {
      return this.user
    },

    totalPanierPrice() {
        console.log("[totalPanierPrice] TmpUSER :",this.tmpUser)
      if(this.tmpUser.panier){

     
      return this.tmpUser.panier.reduce((total, item) => {
        return total + (item.unitPrice * item.quantity);
      }, 0); 
    } else {
      return 0
    }
    },
    addToTmp(product){
        console.log("[CategoryPage] addTocart Product :",product)
        
        const newItem = {id:1,productid: product.id,
                      unitPrice:product.price,quantity:1}
        if(!this.tmpUser || !this.tmpUser.panier)
          this.tmpUser =  { panier:[]}
        this.tmpUser.panier.push(newItem)
        console.log("[addToTmp] addTocart newItem :",newItem)
        console.log("[addToTmp] addTocart TmpUSER :",this.tmpUser)

    },
    setOrderId(id){
      console.log("[setOrderId] id ",id)

      this.orderId = id
    },
    getOrderId(){
      console.log("[getOrderId] this.orderId ",this.orderId)
      return this.orderId
    },
    getTmpPanier(){
      console.log("[getTmpPanier] TMPUSER ",this.tmpUser)

      return this.tmpUser.panier;
    }, 
    setTmpPanier(panier){ 
      console.log("[setTmpPanier] TMPUSER ",this.tmpUser)
      this.tmpUser.panier = panier
      console.log("[setTmpPanier] panier ",this.tmpUser.panier)

    },
    resetUser(){
        const lastUser = localStorage.getItem('user')
        console.log('[resetUser] last user',lastUser)
        localStorage.removeItem('user')
      const token = localStorage.getItem('token')

        console.log('[resetUser] token removed',token)

        localStorage.removeItem('token')

    },
    /* === PANIER BD === */
    async fetchCartCount() {
      if (!this.user) {
        this.cartItemsCount = 0
        return
      }

      try {
        console.log('🔄 Chargement du compteur panier...')
        
       // const resz = await axios.get('/cart')
        const res = await api.get(`http://localhost:3000/cart`/* , {
        headers: { Authorization: `Bearer ${token}` }
      } */);
        const totalItems = res.data?.totalItems || 0
        this.cartItemsCount = totalItems
        
        console.log(`🛒 Panier: ${totalItems} articles`)
        
      } catch (err) {
        console.error('❌ Erreur compteur panier:', err)
        this.cartItemsCount = 0
      }
    },

    getTotalItems() {
      return this.cartItemsCount
    },

    /* === VÉRIFICATION UTILISATEUR === */
    async checkUserAuthentication() {
      console.log('🔍 Vérification authentification...')
      
      const storedUser = localStorage.getItem('user')
      const token = localStorage.getItem('token')
      
      if (!token) {
        console.log('❌ Pas de token')
       const lastUser = localStorage.getItem('user')
        console.log('[checkUserAuthentication] last user',lastUser)

         await this.fetchCartCount()
        
      }

      // Charger l'utilisateur depuis localStorage
      if (storedUser) {
        try {
          this.user = JSON.parse(storedUser)
          console.log('✅ User chargé:', this.user)
          
          // Charger le compteur du panier
          await this.fetchCartCount()
          return
        } catch (err) {
          console.error('❌ Erreur parsing user:', err)
          localStorage.removeItem('user')
        }
      }

      // Sinon, essayer de récupérer depuis l'API
      this.isLoadingUser = true
      
      try {
        const endpoints = ['/auth/me', '/api/auth/me']
        let userData = null
        
        for (const endpoint of endpoints) {
          try {
            console.log(`🔄 GET ${endpoint}`)
            const res = await axios.get(endpoint)
            
            if (res.data) {
              userData = res.data.user || res.data.data || res.data
              if (userData && (userData.username || userData.email || userData.id)) {
                console.log(`✅ User trouvé:`, userData)
                break
              }
            }
          } catch (err) {
            console.log(`❌ ${endpoint} échoué`)
            continue
          }
        }
        
        if (userData) {
          this.user = userData
          localStorage.setItem('user', JSON.stringify(userData))
          
          // Charger le compteur du panier
          await this.fetchCartCount()
        } else {
          this.user = null
          this.cartItemsCount = 0
        }
        
      } catch (err) {
        console.error('❌ Erreur API:', err)
        this.user = null
        this.cartItemsCount = 0
      } finally {
        this.isLoadingUser = false
      }
    },

    refreshUser() {
      console.log('🔄 Rafraîchissement user')
      this.checkUserAuthentication()
    },

    logoutUser() {
      console.log('🚪 Déconnexion')
      
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      this.user = null
      this.cartItemsCount = 0
      
      this.$router.push('/')
    }
  },

  async mounted() {
    console.log('🚀 App.vue monté')
    
    // Vérifier l'authentification
    await this.checkUserAuthentication()
    
    // Écouter les événements
    window.EventBus.$on('user-logged-in', (userData) => {
      console.log('🎯 user-logged-in:', userData)
      if (userData) {
        this.setUser(userData)
      } else {
        this.checkUserAuthentication()
      }
    })
    
    window.EventBus.$on('user-logged-out', () => {
      console.log('🎯 user-logged-out')
      this.logoutUser()
    })
    
    // 🔥 IMPORTANT: Recharger le compteur quand le panier est mis à jour
    window.EventBus.$on('cart-updated', () => {
      console.log('🛒 cart-updated')
      this.fetchCartCount()
    })
  },

  beforeUnmount() {
    window.EventBus.$off('user-logged-in')
    window.EventBus.$off('user-logged-out')
    window.EventBus.$off('cart-updated')
  }
}
</script>

<template>
  <div id="app">
    <!-- Loader utilisateur -->
    <div v-if="isLoadingUser" class="user-loading">
      <div class="loading-spinner"></div>
      <p>Chargement de votre session...</p>
    </div>

    <!-- Navbar -->
    <nav class="navigation">
      <router-link to="/" class="nav-logo">MonShop</router-link>

      <div class="nav-links">
        <router-link to="/" class="nav-link">Accueil</router-link>
        <router-link v-if="user && user.is_admin" to="/admin" class="nav-link">
          Admin
        </router-link>
        <router-link to="/category/1" class="nav-link">Homme</router-link>
        <router-link to="/category/2" class="nav-link">Femme</router-link>
        <router-link to="/category/3" class="nav-link">Enfants</router-link>
        <router-link to="/cart" class="nav-link">
          Panier 
        </router-link>
      </div>

      <div class="nav-login">
        <UserMenu :user="user" />
      </div>
    </nav>

    <!-- Contenu principal -->
    <router-view
      :getOrderId="getOrderId"
      :setOrderId="setOrderId"
      :orderId="orderId"
    :resetUser="resetUser"
    :setTmpPanier="setTmpPanier"
      :getTmpPanier="getTmpPanier"
      :addToTmp="addToTmp"
      :totalPanierPrice="totalPanierPrice"
      :tmpUser="tmpUser"
      :user="user"
      :setUser="setUser"
      :getUser="getUser"
      :refreshUser="refreshUser"
    />

    <AppFooter />
  </div>
</template>

<style>
/* Styles globaux */
body {
  margin: 0;
  font-family: "Inter", sans-serif;
  background-color: #f8fafc;
}

#app {
  min-height: 100vh;
  position: relative;
}

/* Navigation */
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

/* Loader */
.user-loading {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 5px solid #f3f3f3;
  border-top: 5px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.user-loading p {
  color: #6b7280;
  font-weight: 500;
}
</style>
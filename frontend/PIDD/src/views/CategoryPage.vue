<template>
  <div class="category-page">
    <div class="category-content">
      <!-- Fil d'Ariane -->
      <nav class="breadcrumb">
        <router-link to="/" class="breadcrumb-link">Accueil</router-link>
        <span class="breadcrumb-separator">/</span>
        <span class="breadcrumb-current">{{ categoryName }}</span>
      </nav>

      <h1 class="title">{{ categoryName }}</h1>
      <!-- 🔥 NOUVEAU : Section partage social de la page -->
    <section class="home-share-section">
      <ShareButtons
        :url="siteUrl"
        title="MonShop - T-Shirts Premium Belgique"
        description="Découvrez notre collection exclusive de t-shirts premium pour toute la famille. Livraison gratuite dès 50€."
        :image="`${siteUrl}/images/facebook.png`"
      />
    </section>
      <!-- Loading state -->
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Chargement des produits...</p>
      </div>

      <!-- Products grid -->
      <div v-else-if="products.length" class="products-grid">
        <div v-for="p in products" :key="p.id" class="product-card">
          <!-- ✅ CORRECTION: Utilisez getProductImageUrl() -->
          <img :src="getProductImageUrl(p.img)" :alt="p.name" class="product-img" />

          <div class="product-info">
            <h3 class="product-name">{{ p.name }}</h3>
            <p class="product-price">{{ formatPrice(p.price) }}</p>
            <div class="stock-info">
              <span :class="{ 'low-stock': p.quantity < 5, 'in-stock': p.quantity >= 5 }">
                {{ p.quantity > 0 ? `${p.quantity} en stock` : 'Rupture' }}
              </span>
            </div>
          </div>

          <div class="product-card-actions">
            <router-link :to="`/product/${p.id}`" class="view-details-btn">
              Voir le produit
            </router-link>

            <button 
              @click="addToCart(p)" 
              class="add-to-cart-quick-btn" 
              title="Ajouter au panier"
              :disabled="p.quantity <= 0"
              :class="{ 'disabled': p.quantity <= 0 }"
            >
              🛒
            </button>
          </div>
        </div>
      </div>

      <!-- Empty state -->
      <div v-else class="empty-state">
        <p class="empty-text">Aucun produit dans cette catégorie</p>
        <router-link to="/categories" class="back-to-home">Voir toutes les collections</router-link>
      </div>
    </div>
  </div>
</template>

<script>
  import { useHead } from '@unhead/vue'
  import ShareButtons from '../components/ShareButtons.vue'


import axios from 'axios'
import api from '../api.js'
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
  name: 'CategoryPage',
  // 🔥 IMPORTANT : Déclarer le composant
  components: {
    ShareButtons
  },
  props: ['user', 'setUser', 'addToCartGlobal','tmpUser','addToTmp'],
  
  setup() {
    useHead({
      title: 'Boutique de T-shirts | MonShop',
      meta: [
        { name: 'description', content: 'T-shirts premium pour homme, femme et enfant.' }
      ]
    })
  },
  data() {
    return {
      products: [],
      categoryName: '',
      loading: false,
      imageMap: {
        'noir.png': noir,
        'blanc.png': blanc,
        'rosefemme.png': rosefemme,
        'gris.png': gris,
        'blancfemme.png': blancfemme,
        'noirfemme.png': noirfemme,
        'enfantbleu.png': enfantbleu,
        'enfantrouge.png': enfantrouge
      }
    }
  },
  watch: {
    '$route.params.id': {
      handler: 'loadCategoryProducts',
      immediate: true
    }
  },
  methods: {
    async loadCategoryProducts() {
      const categoryId = parseInt(this.$route.params.id)
      console.log(`🔄 Chargement catégorie ${categoryId}...`)

      this.loading = true
      this.products = []

      try {
        // ✅ Axios utilise baseURL de main.js
       // const response = await axios.get(`/product/category/${categoryId}`)
         const response = await api.get(`http://localhost:3000/product/category/${categoryId}`/* , {
        headers: { Authorization: `Bearer ${token}` }
      } */);
        console.log('📊 Réponse API:', response.data)

        if (response.data?.success) {
          this.products = response.data.data || []
          console.log(`✅ ${this.products.length} produits chargés`)
          
          if (this.products.length > 0) {
            console.log('📦 Premier produit:', {
              id: this.products[0].id,
              name: this.products[0].name,
              img: this.products[0].img,
              price: this.products[0].price
            })
          }
        } else {
          console.warn('⚠️ Réponse sans success:true', response.data)
        }

      } catch (error) {
        console.error('❌ Erreur chargement catégorie:', error)
        
        if (error.response) {
          console.error('📊 Détails erreur:', {
            status: error.response.status,
            data: error.response.data,
            url: error.config?.url
          })
        }
        
        this.products = []
      } finally {
        this.loading = false
        this.setCategoryName(categoryId)
      }
    },
    
    setCategoryName(categoryId) {
      const categories = {
        1: 'T-shirts Homme',
        2: 'T-shirts Femme', 
        3: 'T-shirts Enfants'
      }
      this.categoryName = categories[categoryId] || 'Catégorie'
    },
    
    getProductImageUrl(imgName) {
      return this.imageMap[imgName] || ''
    },
    
    formatPrice(price) {
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR'
      }).format(price)
    },
    
    async addToCart(product) {
      if (product.quantity <= 0) {
        this.showNotification('Produit en rupture de stock', 'error')
        return
      }

      if (!this.user) {
        console.log("[CategoryPage] addTocart TmpUSER :",product)
       this.addToTmp(product)
        return
      }

      try {
        console.log(`🛒 Ajout au panier: ${product.name} (ID: ${product.id})`)
        
        // ✅ Axios utilise baseURL de main.js + token automatique via interceptor
       const response = await api.post('http://localhost:3000/cart/item', {
              productId: product.id,
              quantity: 1,
              userId: this.user.id
        });

        console.log('✅ Produit ajouté au panier')
        
        this.showNotification(`${product.name} ajouté au panier !`, 'success')
        
        // Informer le parent pour mettre à jour le compteur du panier
        this.$emit('cart-updated')

      } catch (error) {
        console.error('❌ Erreur ajout panier:', {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data
        })
        
        this.showNotification('Erreur lors de l\'ajout au panier', 'error')
      }
    },
    
    showNotification(message, type = 'success') {
      // À remplacer par votre système de notification
      alert(message)
    }
  }
}
</script>

<style scoped>
.category-page {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.breadcrumb {
  margin-bottom: 20px;
  font-size: 14px;
}

.breadcrumb-link {
  color: #666;
  text-decoration: none;
}

.breadcrumb-link:hover {
  text-decoration: underline;
}

.breadcrumb-separator {
  margin: 0 8px;
  color: #999;
}

.breadcrumb-current {
  color: #333;
  font-weight: 500;
}

.title {
  margin-bottom: 30px;
  color: #333;
}

.loading-state {
  text-align: center;
  padding: 40px;
}

.spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 30px;
}

.product-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.product-img {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.product-info {
  padding: 15px;
}

.product-name {
  font-weight: 600;
  margin-bottom: 8px;
  color: #333;
}

.product-price {
  font-size: 18px;
  font-weight: 700;
  color: #e44d26;
  margin-bottom: 10px;
}

.stock-info {
  font-size: 14px;
}

.in-stock {
  color: #27ae60;
}

.low-stock {
  color: #e74c3c;
}

.product-card-actions {
  padding: 15px;
  border-top: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.view-details-btn {
  background: #3498db;
  color: white;
  padding: 8px 16px;
  border-radius: 4px;
  text-decoration: none;
  font-size: 14px;
  transition: background 0.2s;
}

.view-details-btn:hover {
  background: #2980b9;
}

.add-to-cart-quick-btn {
  background: #2ecc71;
  color: white;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  font-size: 18px;
  cursor: pointer;
  transition: background 0.2s;
}

.add-to-cart-quick-btn:hover:not(.disabled) {
  background: #27ae60;
}

.add-to-cart-quick-btn.disabled {
  background: #95a5a6;
  cursor: not-allowed;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-text {
  font-size: 18px;
  color: #666;
  margin-bottom: 20px;
}

.back-to-home {
  background: #3498db;
  color: white;
  padding: 10px 20px;
  border-radius: 4px;
  text-decoration: none;
  display: inline-block;
}

.back-to-home:hover {
  background: #2980b9;
}
</style>
<template>
  <div class="product-details-page">
    <!-- Header avec bouton retour -->
    <div class="details-header">
      <router-link :to="`/product/${product.id}`" class="back-button">
        ← Retour au produit
      </router-link>
      <h1>Détails complets</h1>
    </div>

    <!-- Contenu principal -->
    <div v-if="product" class="details-container">
      <!-- Section informations principales -->
      <div class="main-info-section">
        <div class="product-image-large">
          <img :src="`/images/${product.img}`" :alt="product.name" />
        </div>
        
        <div class="product-basic-info">
          <h2>{{ product.name }}</h2>
          <div class="price-tag">
            <span class="price">{{ product.price }} €</span>
            <span v-if="product.originalPrice" class="original-price">
              {{ product.originalPrice }} €
            </span>
          </div>
          <div class="stock-status" :class="{ 'in-stock': product.quantity > 0, 'out-of-stock': product.quantity <= 0 }">
            {{ product.quantity > 0 ? 'En stock' : 'Rupture de stock' }}
            <span v-if="product.quantity > 0">({{ product.quantity }} disponibles)</span>
          </div>
        </div>
      </div>

      <!-- Section détaillée -->
      <div class="detailed-sections">
        <!-- Description complète -->
        <section class="details-section">
          <h3>📖 Description complète</h3>
          <p>{{ product.description }}</p>
          <div v-if="product.extendedDescription" class="extended-description">
            {{ product.extendedDescription }}
          </div>
        </section>

        <!-- Caractéristiques techniques -->
        <section class="details-section">
          <h3>⚙️ Caractéristiques</h3>
          <div class="features-grid">
            <div class="feature-item" v-if="product.brand">
              <span class="feature-label">Marque :</span>
              <span class="feature-value">{{ product.brand }}</span>
            </div>
            <div class="feature-item" v-if="product.category">
              <span class="feature-label">Catégorie :</span>
              <span class="feature-value">{{ getCategoryName(product.category) }}</span>
            </div>
            <div class="feature-item" v-if="product.material">
              <span class="feature-label">Matière :</span>
              <span class="feature-value">{{ product.material }}</span>
            </div>
            <div class="feature-item" v-if="product.color">
              <span class="feature-label">Couleur :</span>
              <span class="feature-value">{{ product.color }}</span>
            </div>
            <div class="feature-item" v-if="product.size">
              <span class="feature-label">Tailles disponibles :</span>
              <span class="feature-value">{{ product.size }}</span>
            </div>
            <div class="feature-item" v-if="product.weight">
              <span class="feature-label">Poids :</span>
              <span class="feature-value">{{ product.weight }}g</span>
            </div>
            <div class="feature-item" v-if="product.dimensions">
              <span class="feature-label">Dimensions :</span>
              <span class="feature-value">{{ product.dimensions }}</span>
            </div>
          </div>
        </section>

        <!-- Entretien -->
        <section class="details-section" v-if="product.careInstructions">
          <h3>🧺 Conseils d'entretien</h3>
          <p>{{ product.careInstructions }}</p>
        </section>

        <!-- Informations additionnelles -->
        <section class="details-section">
          <h3>📋 Informations additionnelles</h3>
          <div class="additional-info">
            <div class="info-item">
              <span class="info-label">Référence :</span>
              <span class="info-value">PROD-{{ product.id.toString().padStart(4, '0') }}</span>
            </div>
            <div class="info-item" v-if="product.createdAt">
              <span class="info-label">Ajouté le :</span>
              <span class="info-value">{{ formatDate(product.createdAt) }}</span>
            </div>
            <div class="info-item" v-if="product.updatedAt">
              <span class="info-label">Dernière mise à jour :</span>
              <span class="info-value">{{ formatDate(product.updatedAt) }}</span>
            </div>
          </div>
        </section>
      </div>

      <!-- Actions -->
      <div class="details-actions">
        <router-link :to="`/product/${product.id}`" class="action-btn back-to-product">
          ← Retour à la fiche produit
        </router-link>
        <button @click="addToCart" class="action-btn add-to-cart-btn">
          🛒 Ajouter au panier
        </button>
      </div>
    </div>

    <!-- Loading state -->
    <div v-else-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Chargement des détails...</p>
    </div>

    <!-- Error state -->
    <div v-else class="error-state">
      <h2>⚠️ Produit non trouvé</h2>
      <p>Impossible de charger les détails du produit.</p>
      <router-link to="/" class="back-home-btn">
        Retour à l'accueil
      </router-link>
    </div>
  </div>
</template>
<script>

import { useHead } from '@unhead/vue'
import axios from 'axios'
import { productService } from '../services/productServices'

export default {
  name: 'ProductDetailsPage',
  props: ['user'],
  setup() {
    useHead({
      title: 'Détails du produit | MonShop',
      meta: [
        { name: 'description', content: 'Découvrez les détails complets de notre produit.' }
      ]
    })
  },
  
  data() {
    return {
      product: null,
      loading: false,
      error: null
    }
  },
  
  watch: {
    '$route.params.id': {
      handler() {
        this.loadProductDetails()
      },
      immediate: true
    }
  },
  
  methods: {
    async loadProductDetails() {
      this.loading = true
      this.error = null
      
      try {
        const id = this.$route.params.id
        console.log(`🔄 Chargement produit ID: ${id}`)
        
        this.product = await productService.getById(id)
        
        if (!this.product || !this.product.id) {
          throw new Error('Produit non trouvé')
        }
        
        console.log('✅ Produit chargé:', this.product)
        
      } catch (err) {
        console.error('❌ Erreur chargement détails:', err)
        this.error = err.message
      } finally {
        this.loading = false
      }
    },
    
    getCategoryName(id) {
      const categories = {
        1: 'Homme',
        2: 'Femme',
        3: 'Enfant'
      }
      return categories[id] || 'Catégorie'
    },
    
    formatDate(dateString) {
      if (!dateString) return 'Non spécifié'
      const date = new Date(dateString)
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    },
    
    async addToCart() {
      if (!this.product) return

      // 🔐 Vérifier si l'utilisateur est connecté
      if (!this.user) {
        this.$notify?.({
          title: 'Connexion requise',
          message: 'Veuillez vous connecter pour ajouter au panier',
          type: 'warning',
          duration: 3000
        })
        this.$router.push('/login')
        return
      }

      try {
        console.log(`🛒 Ajout au panier: ${this.product.name} (ID: ${this.product.id})`)
        
        // ✅ Axios utilise baseURL de main.js + token automatique via interceptor
        await axios.post('/cart/item', {
          productId: this.product.id,
          quantity: 1
        })

        console.log('✅ Produit ajouté au panier')

        this.$notify?.({
          title: 'Ajouté au panier',
          message: `${this.product.name} a été ajouté au panier`,
          type: 'success',
          duration: 3000
        })

        // 🔄 Informer le parent pour mettre à jour le compteur du panier
        this.$emit('cart-updated')

      } catch (err) {
        console.error('❌ Erreur ajout panier:', {
          message: err.message,
          status: err.response?.status,
          data: err.response?.data
        })

        this.$notify?.({
          title: 'Erreur',
          message: 'Impossible d\'ajouter le produit au panier',
          type: 'error',
          duration: 3000
        })
      }
    }
  }
}
</script>
<style scoped>
.product-details-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.details-header {
  margin-bottom: 30px;
  border-bottom: 1px solid #eee;
  padding-bottom: 15px;
}

.back-button {
  display: inline-block;
  color: #3498db;
  text-decoration: none;
  margin-bottom: 15px;
}

.back-button:hover {
  text-decoration: underline;
}

.details-container {
  background: white;
  border-radius: 10px;
  padding: 30px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.main-info-section {
  display: flex;
  gap: 40px;
  margin-bottom: 40px;
}

.product-image-large {
  flex: 1;
  max-width: 400px;
}

.product-image-large img {
  width: 100%;
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
}

.product-basic-info {
  flex: 2;
}

.price-tag {
  font-size: 1.8em;
  font-weight: bold;
  color: #2c3e50;
  margin: 15px 0;
}

.original-price {
  text-decoration: line-through;
  color: #95a5a6;
  font-size: 0.8em;
  margin-left: 10px;
}

.stock-status {
  padding: 8px 15px;
  border-radius: 20px;
  display: inline-block;
  font-weight: bold;
  margin: 10px 0;
}

.stock-status.in-stock {
  background-color: #d4edda;
  color: #155724;
}

.stock-status.out-of-stock {
  background-color: #f8d7da;
  color: #721c24;
}

.detailed-sections {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.details-section {
  background: #f8f9fa;
  padding: 25px;
  border-radius: 8px;
  border-left: 4px solid #3498db;
}

.details-section h3 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #2c3e50;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 15px;
}

.feature-item {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px dashed #ddd;
}

.feature-label {
  font-weight: bold;
  color: #7f8c8d;
}

.feature-value {
  color: #2c3e50;
}

.extended-description {
  margin-top: 15px;
  line-height: 1.8;
  color: #555;
}

.additional-info {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 10px;
}

.info-item {
  padding: 8px 0;
}

.info-label {
  font-weight: bold;
  color: #7f8c8d;
  margin-right: 10px;
}

.details-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.action-btn {
  padding: 12px 30px;
  border-radius: 5px;
  text-decoration: none;
  font-weight: bold;
  transition: all 0.3s;
  border: none;
  cursor: pointer;
  font-size: 1em;
}

.back-to-product {
  background-color: #f8f9fa;
  color: #3498db;
  border: 1px solid #3498db;
}

.add-to-cart-btn {
  background-color: #27ae60;
  color: white;
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.loading-state, .error-state {
  text-align: center;
  padding: 50px;
}

.spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.back-home-btn {
  display: inline-block;
  margin-top: 20px;
  padding: 10px 20px;
  background-color: #3498db;
  color: white;
  text-decoration: none;
  border-radius: 5px;
}

@media (max-width: 768px) {
  .main-info-section {
    flex-direction: column;
  }
  
  .product-image-large {
    max-width: 100%;
  }
  
  .details-actions {
    flex-direction: column;
    gap: 15px;
  }
  
  .action-btn {
    width: 100%;
    text-align: center;
  }
}
</style>
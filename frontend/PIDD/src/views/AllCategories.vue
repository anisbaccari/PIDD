<template>
  <div class="all-categories-page">
    <div class="categories-content">
      <!-- Fil d'Ariane -->
      <nav class="breadcrumb">
        <router-link to="/" class="breadcrumb-link">Accueil</router-link>
        <span class="breadcrumb-separator">/</span>
        <span class="breadcrumb-current">Toutes les collections</span>
      </nav>

      <h1 class="title">Toutes nos collections</h1>
      <p class="subtitle">Découvrez notre sélection complète de t-shirts</p>

      <!-- Chargement -->
      <div v-if="loading" class="loading-categories">
        <div class="spinner"></div>
        <p>Chargement des catégories...</p>
      </div>

      <!-- Grille des catégories -->
      <div v-else class="categories-grid">
        <router-link
          v-for="category in categories"
          :key="category.id"
          :to="`/category/${category.id}`"
          class="category-large-card"
        >
          <div class="category-image-container">
            <img 
              :src="getCategoryImage(category)" 
              :alt="category.name" 
              class="category-large-img"
              @error="handleImageError"
            />
          </div>
          <div class="category-overlay">
            <h2 class="category-large-name">{{ category.name }}</h2>
           <!--  <p class="category-count">{{ getProductCount(category.id) }} produits</p> -->
            <span class="explore-text">Explorer →</span>
          </div>
        </router-link>
      </div>

    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useHead } from '@unhead/vue'
import axios from 'axios' // 🔥 Utiliser axios au lieu de fetch

// Import des images par défaut
let defaultHommeImg = null
let defaultFemmeImg = null
let defaultEnfantImg = null

try {
  defaultHommeImg = require('../assets/homme.png')
} catch (e) {
  console.warn('Image homme.png non trouvée')
}

try {
  defaultFemmeImg = require('../assets/femme.png')
} catch (e) {
  console.warn('Image femme.png non trouvée')
}

try {
  defaultEnfantImg = require('../assets/enfant.png')
} catch (e) {
  console.warn('Image enfant.png non trouvée')
}

export default {
  name: 'AllCategories',
  props: {
    user: Object,
    setUser: Function
  },

  setup() {
    const categories = ref([])
    const allProducts = ref([])
    const productCountByCategory = ref({}) // 🔥 NOUVEAU : Compteur pré-calculé
    const loading = ref(true)

    const defaultImages = {
      'homme': defaultHommeImg || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'femme': defaultFemmeImg || 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'enfant': defaultEnfantImg || 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'default': 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    }

    const siteUrl = window.location.origin || 'https://monshop.com'

    useHead({
      title: 'Toutes nos Collections de T-Shirts | MonShop Belgique',
      
      meta: [
        { 
          name: 'description', 
          content: 'Explorez toutes nos collections de t-shirts premium : Homme, Femme, Enfant. Qualité supérieure, styles variés, livraison gratuite dès 50€ en Belgique.' 
        },
        { 
          name: 'keywords', 
          content: 'collections tshirt, tshirt homme, tshirt femme, tshirt enfant, catalogue, boutique belgique' 
        },
        
        { property: 'og:type', content: 'website' },
        { property: 'og:title', content: 'Toutes nos Collections de T-Shirts | MonShop' },
        { 
          property: 'og:description', 
          content: 'Explorez toutes nos collections de t-shirts premium pour homme, femme et enfant. Livraison gratuite dès 50€.' 
        },
        { property: 'og:image', content: `${siteUrl}/images/facebook.png` },
        { property: 'og:url', content: `${siteUrl}/allcategories` },
        { property: 'og:locale', content: 'fr_BE' },
        
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: 'Toutes nos Collections | MonShop' },
        { 
          name: 'twitter:description', 
          content: 'Collections complètes de t-shirts premium pour toute la famille.' 
        },
        { name: 'twitter:image', content: `${siteUrl}/images/X.png` }
      ],
      
      link: [
        { rel: 'canonical', href: `${siteUrl}/allcategories` }
      ],
      
      script: [
        {
          type: 'application/ld+json',
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": "Toutes nos Collections",
            "description": "Collections complètes de t-shirts premium pour homme, femme et enfant",
            "url": `${siteUrl}/allcategories`,
            "mainEntity": {
              "@type": "ItemList",
              "numberOfItems": 3,
              "itemListElement": [
                {
                  "@type": "ListItem",
                  "position": 1,
                  "name": "T-shirts Homme",
                  "url": `${siteUrl}/category/1`
                },
                {
                  "@type": "ListItem",
                  "position": 2,
                  "name": "T-shirts Femme",
                  "url": `${siteUrl}/category/2`
                },
                {
                  "@type": "ListItem",
                  "position": 3,
                  "name": "T-shirts Enfants",
                  "url": `${siteUrl}/category/3`
                }
              ]
            }
          })
        },
        {
          type: 'application/ld+json',
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Accueil",
                "item": siteUrl
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": "Toutes les collections",
                "item": `${siteUrl}/allcategories`
              }
            ]
          })
        }
      ]
    })

    return {
      categories,
      allProducts,
      productCountByCategory,
      loading,
      defaultImages
    }
  },

  methods: {
    async loadCategories() {
      try {
        this.loading = true

        // 🔥 CATÉGORIES PAR DÉFAUT
        this.categories = [
          { id: 1, name: "T-shirts Homme", type: "homme" },
          { id: 2, name: "T-shirts Femme", type: "femme" },
          { id: 3, name: "T-shirts Enfants", type: "enfant" }
        ]

        console.log('✅ Catégories chargées:', this.categories)

      } catch (error) {
        console.error('❌ Erreur chargement catégories:', error)
      } finally {
        this.loading = false
      }
    },

    async loadProducts() {
      try {
        console.log('🔄 Chargement des produits...')

        // 🔥 UTILISER AXIOS AVEC LA BONNE ROUTE
        const response = await axios.get('/product')
        
        console.log('📊 Réponse API:', response.data)

        // 🔥 GÉRER DIFFÉRENTS FORMATS DE RÉPONSE
        if (response.data?.success) {
          this.allProducts = response.data.data || []
        } else if (Array.isArray(response.data)) {
          this.allProducts = response.data
        } else if (response.data?.products) {
          this.allProducts = response.data.products
        } else {
          console.warn('⚠️ Format de réponse inattendu:', response.data)
          this.allProducts = []
        }

        console.log(`✅ ${this.allProducts.length} produits chargés`)

        if (this.allProducts.length > 0) {
          console.log('📦 Premier produit:', {
            id: this.allProducts[0].id,
            name: this.allProducts[0].name,
            category: this.allProducts[0].category,
            categoryId: this.allProducts[0].categoryId
          })
        }

        // 🔥 CALCULER LES COMPTEURS PAR CATÉGORIE
        this.calculateProductCounts()

      } catch (error) {
        console.error('❌ Erreur chargement produits:', error)
        
        if (error.response) {
          console.error('📊 Détails erreur:', {
            status: error.response.status,
            data: error.response.data,
            url: error.config?.url
          })
        }
        
        this.allProducts = []
      }
    },

    // 🔥 NOUVELLE MÉTHODE : Calculer les compteurs
    calculateProductCounts() {
      console.log('🔢 Calcul des compteurs par catégorie...')

      // Réinitialiser les compteurs
      this.productCountByCategory = {
        1: 0,
        2: 0,
        3: 0
      }

      // Compter les produits par catégorie
      this.allProducts.forEach(product => {
        // 🔥 Gérer les deux noms de champs possibles
        const categoryId = product.category || product.categoryId
        
        if (categoryId && this.productCountByCategory[categoryId] !== undefined) {
          this.productCountByCategory[categoryId]++
        }
      })

      console.log('📊 Compteurs calculés:', this.productCountByCategory)
    },

    getCategoryImage(category) {
      if (category.image && category.image !== '') {
        return `/images/categories/${category.image}`
      }

      const categoryType = category.type ? category.type.toLowerCase() :
        category.name.toLowerCase().includes('homme') ? 'homme' :
        category.name.toLowerCase().includes('femme') ? 'femme' :
        category.name.toLowerCase().includes('enfant') ? 'enfant' : 'default'

      return this.defaultImages[categoryType] || this.defaultImages.default
    },

    handleImageError(event) {
      const categoryType = event.target.dataset.categoryType || 'default'
      event.target.src = this.defaultImages[categoryType] || this.defaultImages.default
    },

    // 🔥 MÉTHODE CORRIGÉE
    getProductCount(categoryId) {
      console.log(`🔍 Comptage pour catégorie ${categoryId}:`, this.productCountByCategory[categoryId])
      return this.productCountByCategory[categoryId] || 0
    }
  },

  async mounted() {
    console.log('🚀 AllCategories monté')
    
    await this.loadCategories()
    await this.loadProducts()
  }
}
</script>
<style scoped>
.all-categories-page {
  min-height: 100vh;
  background: #f8fafc;
  padding: 2rem 0;
}

.categories-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

/* Fil d'Ariane */
.breadcrumb {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 2rem;
  font-size: 0.9rem;
  color: #6b7280;
}

.breadcrumb-link {
  color: #3b82f6;
  text-decoration: none;
  transition: color 0.2s ease;
}

.breadcrumb-link:hover {
  color: #2563eb;
  text-decoration: underline;
}

.breadcrumb-separator {
  color: #9ca3af;
}

.breadcrumb-current {
  color: #4b5563;
  font-weight: 500;
}

/* Titres */
.title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.5rem;
  text-align: center;
}

.subtitle {
  font-size: 1.1rem;
  color: #6b7280;
  text-align: center;
  margin-bottom: 3rem;
}

/* Chargement */
.loading-categories,
.loading-products {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 0;
}

.spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top: 4px solid #3b82f6;
  width: 50px;
  height: 50px;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

.spinner.small {
  width: 30px;
  height: 30px;
  border-width: 3px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Grille des catégories */
.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2.5rem;
  margin-bottom: 5rem;
}

.category-large-card {
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  text-decoration: none;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  height: 400px;
  display: block;
}

.category-large-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.15);
}

.category-image-container {
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
}

.category-large-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.category-large-card:hover .category-large-img {
  transform: scale(1.05);
}

.category-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
  color: white;
  padding: 2rem;
  padding-top: 4rem;
}

.category-large-name {
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: white;
}

.category-count {
  font-size: 1rem;
  opacity: 0.9;
  margin-bottom: 1rem;
}

.explore-text {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  background: rgba(255, 255, 255, 0.2);
  padding: 0.5rem 1rem;
  border-radius: 20px;
  backdrop-filter: blur(10px);
  transition: background 0.3s ease;
}

.category-large-card:hover .explore-text {
  background: rgba(255, 255, 255, 0.3);
}

/* Produits populaires */
.featured-products {
  margin-top: 4rem;
  padding-top: 4rem;
  border-top: 1px solid #e5e7eb;
}

.section-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  text-align: center;
  margin-bottom: 2.5rem;
  position: relative;
}

.section-title::after {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 4px;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  border-radius: 2px;
}

.products-preview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
}

.product-preview-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  text-decoration: none;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  display: flex;
  flex-direction: column;
}

.product-preview-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
}

.product-preview-image {
  height: 200px;
  overflow: hidden;
  background: #f9fafb;
  display: flex;
  align-items: center;
  justify-content: center;
}

.product-preview-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.product-preview-card:hover .product-preview-img {
  transform: scale(1.05);
}

.product-preview-name {
  padding: 1rem 1rem 0.5rem;
  font-size: 1.1rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
  flex-grow: 1;
}

.product-preview-price {
  padding: 0 1rem 1rem;
  font-size: 1.25rem;
  font-weight: 700;
  color: #3b82f6;
  margin: 0;
}

.view-all-container {
  text-align: center;
  margin-top: 2rem;
}

.view-all-btn {
  display: inline-block;
  padding: 1rem 2.5rem;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  color: white;
  text-decoration: none;
  border-radius: 50px;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.2);
}

.view-all-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(59, 130, 246, 0.3);
}

/* Responsive */
@media (max-width: 768px) {
  .categories-content {
    padding: 0 1rem;
  }
  
  .title {
    font-size: 2rem;
  }
  
  .categories-grid {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  
  .category-large-card {
    height: 350px;
  }
  
  .products-preview {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1.5rem;
  }
  
  .section-title {
    font-size: 1.8rem;
  }
}

@media (max-width: 480px) {
  .title {
    font-size: 1.8rem;
  }
  
  .category-large-card {
    height: 300px;
  }
  
  .category-large-name {
    font-size: 1.5rem;
  }
  
  .products-preview {
    grid-template-columns: 1fr;
  }
  
  .product-preview-image {
    height: 180px;
  }
}
</style>
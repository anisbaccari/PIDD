<template>
  <div class="home-page">
    <!-- Bouton Admin flottant -->
    <router-link 
      v-if="user && user.role === 'admin'"
      to="/admin/dashboard" 
      class="admin-float-btn"
      title="Dashboard Admin"
    >
      <span class="admin-icon">👑</span>
      <span class="admin-text">Admin</span>
    </router-link>

    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-overlay">
        <div class="hero-content">
          <h1 class="hero-title">Élégance & Confort</h1>
          <p class="hero-subtitle">Découvrez notre collection exclusive de t-shirts premium</p>
          <div class="hero-actions">
            <router-link to="/allcategories" class="hero-btn primary">
              Explorer la collection → 
            </router-link>
            <router-link to="/products" class="hero-btn secondary">
              Voir les promotions
            </router-link>
          </div>
        </div>
      </div>
    </section>

    <h1>T-shirts premium pour homme</h1>
    <p>Découvrez notre collection de t-shirts confortables et stylés pour homme.</p>

    <!-- 🔥 NOUVEAU : Section partage social de la page -->
    <section class="home-share-section">
      <ShareButtons
        :url="siteUrl"
        title="MonShop - T-Shirts Premium Belgique"
        description="Découvrez notre collection exclusive de t-shirts premium pour toute la famille. Livraison gratuite dès 50€."
        :image="`${siteUrl}/images/facebook.png`"
      />
    </section>

    <!-- Produits populaires -->
    <section class="products-section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">Les Plus Populaires</h2>
          <p class="section-subtitle">Nos best-sellers</p>
        </div>
        
        <!-- Chargement -->
        <div v-if="loading" class="loading-products">
          <div class="spinner"></div>
          <p>Chargement des produits...</p>
        </div>
        
        <!-- Grille produits -->
        <div v-else class="products-grid">
          <div v-for="product in popularProducts" :key="product.id" class="product-card">
            <div class="product-image-container">
              <img 
                :src="getImageUrl(product.img)" 
                :alt="product.name" 
                class="product-image"
                @error="handleImageError"
              />
              <div class="new-badge" v-if="product.isNew">Nouveau</div>
            </div>
            <div class="product-info">
              <h3 class="product-name">{{ product.name }}</h3>
              <span class="product-price">{{ formatPrice(product.price) }}</span>
            </div>
            <div class="product-actions">
              <button @click="addToCart(product)" class="action-btn cart-btn">
                🛒 Ajouter
              </button>
              <router-link :to="`/product/${product.id}`" class="action-btn view-btn">
                Voir détails
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import ShareButtons from '../components/ShareButtons.vue'
import { ref, computed, onMounted } from 'vue'
import { useHead } from '@unhead/vue'
import { productService } from '../services/productServices'
import axios from 'axios'
import api from '../api.js'

export default {
  name: 'HomePage',
  
  // 🔥 IMPORTANT : Déclarer le composant
  components: {
    ShareButtons
  },
  
  props: {
    user: Object,
    tmpUser: Object,
    addToCartGlobal: Function,
    resetUser: Function,
    getTmpPanier: Function
  },

  setup() {
    const popularProducts = ref([])
    const loading = ref(true)

    // 🔥 AJOUTER siteUrl pour le template
    const siteUrl = computed(() => {
      return window.location.origin || 'https://monshop.com'
    })

    // ============================================
    // 🎯 META TAGS SEO OPTIMISÉS
    // ============================================
    useHead({
      title: 'MonShop - T-Shirts Premium Belgique | Homme, Femme, Enfant',
      
      meta: [
        { 
          name: 'description', 
          content: 'Découvrez notre collection exclusive de t-shirts premium pour homme, femme et enfant. Qualité supérieure, livraison gratuite dès 50€ en Belgique. Plus de 500 modèles disponibles.' 
        },
        { 
          name: 'keywords', 
          content: 'tshirt premium, tshirt homme, tshirt femme, tshirt enfant, vêtements belgique, mode, coton bio, livraison gratuite' 
        },
        
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: 'MonShop' },
        { property: 'og:title', content: 'MonShop - T-Shirts Premium Belgique' },
        { 
          property: 'og:description', 
          content: 'Collection exclusive de t-shirts premium. Livraison gratuite dès 50€. Plus de 500 modèles pour homme, femme et enfant.' 
        },
        { property: 'og:image', content: `${siteUrl.value}/images/facebook.png` },
        { property: 'og:image:width', content: '1200' },
        { property: 'og:image:height', content: '630' },
        { property: 'og:url', content: siteUrl.value },
        { property: 'og:locale', content: 'fr_BE' },
        
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:site', content: '@MonShop' },
        { name: 'twitter:title', content: 'MonShop - T-Shirts Premium Belgique' },
        { 
          name: 'twitter:description', 
          content: 'Collection exclusive de t-shirts premium. Livraison gratuite dès 50€.' 
        },
        { name: 'twitter:image', content: `${siteUrl.value}/images/X.png` },
        
        { name: 'geo.region', content: 'BE' },
        { name: 'geo.placename', content: 'Belgique' }
      ],
      
      link: [
        { rel: 'canonical', href: siteUrl.value }
      ],
      
      script: [
        {
          type: 'application/ld+json',
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "MonShop",
            "url": siteUrl.value,
            "description": "Boutique de t-shirts premium pour homme, femme et enfant en Belgique",
            "potentialAction": {
              "@type": "SearchAction",
              "target": `${siteUrl.value}/search?q={search_term_string}`,
              "query-input": "required name=search_term_string"
            }
          })
        },
        {
          type: 'application/ld+json',
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "MonShop",
            "url": siteUrl.value,
            "logo": `${siteUrl.value}/images/logo.png`,
            "description": "Boutique de t-shirts premium en Belgique",
            "address": {
              "@type": "PostalAddress",
              "addressCountry": "BE",
              "addressLocality": "Bruxelles"
            },
            "contactPoint": {
              "@type": "ContactPoint",
              "telephone": "+32-XXX-XX-XX-XX",
              "contactType": "Customer Service",
              "availableLanguage": ["French", "Dutch"]
            },
            "sameAs": [
              "https://www.facebook.com/monshop",
              "https://www.instagram.com/monshop",
              "https://twitter.com/monshop"
            ]
          })
        }
      ]
    })

    return {
      popularProducts,
      loading,
      siteUrl // 🔥 RETOURNER siteUrl pour le template
    }
  },

  methods: {
    async loadProducts() {
      try {
        console.log('🔄 Chargement des produits populaires...')
        
        const products = await productService.getAll()
        console.log(`✅ ${products.length} produits chargés`)
        
        const productsWithNewFlag = products.slice(0, 8).map((product, index) => ({
          ...product,
          isNew: index < 2
        }))
        
        this.popularProducts = productsWithNewFlag
        this.addProductsSchema()
        
      } catch (error) {
        console.error('❌ Erreur chargement produits:', error)
        this.popularProducts = []
      } finally {
        this.loading = false
      }
    },

    addProductsSchema() {
      if (this.popularProducts.length === 0) return

      const siteUrl = window.location.origin || 'https://monshop.com'
      
      useHead({
        script: [
          {
            type: 'application/ld+json',
            children: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ItemList",
              "name": "Produits Populaires MonShop",
              "numberOfItems": this.popularProducts.length,
              "itemListElement": this.popularProducts.map((product, index) => ({
                "@type": "ListItem",
                "position": index + 1,
                "item": {
                  "@type": "Product",
                  "name": product.name,
                  "image": product.img?.startsWith('http') 
                    ? product.img 
                    : `${siteUrl}/images/${product.img}`,
                  "url": `${siteUrl}/product/${product.id}`,
                  "offers": {
                    "@type": "Offer",
                    "price": product.price,
                    "priceCurrency": "EUR",
                    "availability": "https://schema.org/InStock"
                  }
                }
              }))
            })
          }
        ]
      })
    },

    /* ====== */
    homeCheckUser(){
        const token = localStorage.getItem('token')
        if(token)
         {
           console.log("[homeCheckUser] token :",token)
            return;
         } 
         this.resetUser();

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
    async addToCart(product) {
      try {
        if (!this.user) {
          console.log(this.tmpUser)
          this.addToTmp(product)
          //this.$router.push('/login')
          return
        }
        console.log(`[addToCart] user`,this.user)
        console.log(`🛒 Ajout au panier: ${product.name} (ID: ${product.id})`)
        const response = await api.post('http://localhost:3000/cart/item', {
              productId: product.id,
              quantity: 1,
              userId: this.user.id
        });
 

        console.log(`✅ Produit ajouté au panier: ${product.name}`)
        alert(`${product.name} ajouté au panier !`)
        
        this.$emit('cart-updated')

      } catch (error) {
        console.error('❌ Erreur ajout panier:', error)
        alert('Erreur lors de l\'ajout au panier')
      }
    },
    
    getImageUrl(imgPath) {
      if (!imgPath) {
        return 'https://via.placeholder.com/400x500?text=Image+Indisponible'
      }
      
      if (imgPath.startsWith('http')) {
        return imgPath
      }
      
      return `/images/${imgPath}`
    },
    
    handleImageError(e) {
      e.target.src = 'https://via.placeholder.com/400x500?text=Image+Indisponible'
    },
    
    formatPrice(price) {
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR'
      }).format(price || 0)
    }
  },
  
  mounted() {
    this.loadProducts()
  }
}
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  background: #f8fafc;
}

/* Container */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

/* Admin Button */
.admin-float-btn {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 50px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.4);
  z-index: 1000;
  transition: all 0.3s ease;
  font-weight: 600;
}

.admin-float-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 25px rgba(102, 126, 234, 0.6);
}

/* Hero Section */
.hero-section {
  height: 90vh;
  min-height: 600px;
  background: linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)),
              url('https://images.unsplash.com/photo-1523381210434-271e8be1f52b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  position: relative;
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 30% 50%, rgba(59, 130, 246, 0.3), transparent 50%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.hero-content {
  text-align: center;
  color: white;
  padding: 0 2rem;
  max-width: 800px;
}

.hero-title {
  font-size: 4rem;
  font-weight: 800;
  margin-bottom: 1rem;
  background: linear-gradient(135deg, #fff 0%, #a5b4fc 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: fadeInUp 1s ease;
}

.hero-subtitle {
  font-size: 1.5rem;
  margin-bottom: 3rem;
  opacity: 0.9;
  animation: fadeInUp 1s ease 0.2s both;
}

.hero-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  animation: fadeInUp 1s ease 0.4s both;
}

.hero-btn {
  padding: 1rem 2.5rem;
  border-radius: 50px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.hero-btn.primary {
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  color: white;
  box-shadow: 0 10px 25px rgba(59, 130, 246, 0.3);
}

.hero-btn.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 15px 35px rgba(59, 130, 246, 0.4);
}

.hero-btn.secondary {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.hero-btn.secondary:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

/* Section Header */
.section-header {
  text-align: center;
  margin: 4rem 0;
}

.section-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 1rem;
  position: relative;
  display: inline-block;
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

.section-subtitle {
  font-size: 1.1rem;
  color: #6b7280;
}

/* Chargement */
.loading-products {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  padding: 4rem 0;
}

.spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top: 4px solid #3b82f6;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Grille produits */
.products-section {
  padding: 4rem 0;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2.5rem;
  margin-top: 2rem;
}

.product-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;
}

.product-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.15);
}

/* CONTAINER D'IMAGE MODIFIÉ */
.product-image-container {
  height: 320px; /* Augmenté de 280px */
  overflow: hidden;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0; /* Retirer le padding */
  position: relative;
  border-bottom: 1px solid #f1f5f9;
}

.product-image {
  width: 100%; /* Prend toute la largeur */
  height: 100%; /* Prend toute la hauteur */
  object-fit: cover; /* Remplit le conteneur */
  transition: transform 0.5s ease;
}

.product-card:hover .product-image {
  transform: scale(1.08); /* Zoom plus prononcé */
}

/* Badge nouveau produit */
.new-badge {
  position: absolute;
  top: 1rem;
  left: 1rem;
  background: linear-gradient(135deg, #ef4444, #f97316);
  color: white;
  padding: 0.4rem 1rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  z-index: 2;
  box-shadow: 0 4px 10px rgba(239, 68, 68, 0.2);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

.product-info {
  padding: 1.5rem;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  background: white;
}

.product-name {
  font-size: 1.2rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.5rem;
  min-height: auto;
  line-height: 1.4;
}

.product-price {
  font-size: 1.35rem;
  font-weight: 800;
  color: #3b82f6;
  display: block;
  margin-top: 0.5rem;
}

.product-actions {
  padding: 0 1.5rem 1.5rem;
  display: flex;
  gap: 0.8rem;
  background: white;
}

.action-btn {
  flex: 1;
  padding: 0.8rem;
  border-radius: 10px;
  font-weight: 600;
  text-align: center;
  transition: all 0.2s ease;
  font-size: 0.95rem;
  cursor: pointer;
  text-decoration: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  border: 2px solid transparent;
}

.cart-btn {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
  border: none;
}

.view-btn {
  background: white;
  color: #4b5563;
  border: 2px solid #e5e7eb;
}

.cart-btn:hover {
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(59, 130, 246, 0.3);
}

.view-btn:hover {
  background: #f3f4f6;
  border-color: #d1d5db;
  transform: translateY(-2px);
}

/* Style pour les produits sans image */
.no-image {
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  color: white;
  font-weight: 700;
  font-size: 1.5rem;
  height: 100%;
}

/* Animations */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .hero-title {
    font-size: 2.5rem;
  }
  
  .hero-subtitle {
    font-size: 1.2rem;
  }
  
  .hero-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .hero-btn {
    width: 100%;
    max-width: 300px;
    justify-content: center;
  }
  
  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1.5rem;
  }
  
  .section-title {
    font-size: 2rem;
  }
  
  .product-image-container {
    height: 280px; /* Légèrement plus petit sur mobile */
  }
  
  .product-name {
    font-size: 1.1rem;
  }
  
  .product-price {
    font-size: 1.3rem;
  }
  
  .product-actions {
    flex-direction: column;
    gap: 0.8rem;
  }
  
  .action-btn {
    padding: 0.9rem;
  }
  
  .container {
    padding: 0 1rem;
  }
}
.home-share-section {
  max-width: 1200px;
  margin: 3rem auto;
  padding: 0 1rem;
}
@media (max-width: 480px) {
  .products-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .product-image-container {
    height: 250px;
  }
  
  .hero-title {
    font-size: 2rem;
  }
  
  .hero-subtitle {
    font-size: 1rem;
  }
  
  .admin-float-btn {
    bottom: 1rem;
    right: 1rem;
    padding: 0.6rem 1.2rem;
    font-size: 0.9rem;
  }
}

/* Message si pas de produits */
.products-grid:empty + .no-products-message {
  display: block;
}

.no-products-message {
  text-align: center;
  padding: 3rem 0;
  color: #6b7280;
  font-size: 1.1rem;
}



  .home-share-section {
    margin: 2rem auto;
  }

/* Option : Si vos images ont un fond blanc, décommentez ceci */
/*
.product-image {
  mix-blend-mode: multiply;
}
*/
</style>
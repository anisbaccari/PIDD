<template>
  <div class="product-page">
    <!-- Breadcrumb Navigation -->
    <nav class="breadcrumb-nav" v-if="product">
      <div class="container">
        <router-link to="/" class="breadcrumb-link">Accueil</router-link>
        <span class="separator">/</span>
        <router-link :to="`/category/${product.category}`" class="breadcrumb-link">
          {{ getCategoryName(product.category) }}
        </router-link>
        <span class="separator">/</span>
        <span class="current">{{ product.name }}</span>
      </div>
    </nav>

    <!-- Loading Skeleton -->
    <div v-if="loading" class="skeleton-container">
      <div class="skeleton-image"></div>
      <div class="skeleton-content">
        <div class="skeleton-title"></div>
        <div class="skeleton-price"></div>
        <div class="skeleton-description"></div>
        <div class="skeleton-button"></div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <div class="error-icon">😔</div>
      <h2>Produit introuvable</h2>
      <p>{{ error }}</p>
      <div class="error-actions">
        <router-link to="/" class="btn btn-primary">
          <span class="btn-icon">🏠</span>
          Retour à l'accueil
        </router-link>
        <button @click="loadProduct" class="btn btn-secondary">
          <span class="btn-icon">🔄</span>
          Réessayer
        </button>
      </div>
    </div>

    <!-- Product Details -->
    <div v-else-if="product" class="product-container">
      <!-- Product Header with Actions -->
      <div class="product-header">
        <div class="header-actions">
          <!-- 🔥 Nouveau : Composant de partage -->
          <ShareButtons
            :url="currentPageUrl"
            :title="product.name"
            :description="`${product.name} - ${formatPrice(product.price)}`"
            :image="fullProductImageUrl"
            compact
          />
          <button @click="toggleWishlist" class="header-action-btn" :title="wishlistText">
            <span class="action-icon">{{ wishlistIcon }}</span>
            {{ wishlistText }}
          </button>
          <button @click="printPage" class="header-action-btn" title="Imprimer">
            <span class="action-icon">🖨️</span>
            Imprimer
          </button>
        </div>
      </div>

      <!-- Main Product Content -->
      <div class="main-content">
        <!-- Left Column - Gallery -->
        <div class="gallery-section">
          <div class="main-image-container">
            <img 
              :src="`/images/${product.img}`" 
              :alt="product.name"
              @error="handleImageError"
              class="main-product-image"
              @click="openImageZoom"
            />
            <div v-if="product.discount" class="discount-badge">
              -{{ product.discount }}%
            </div>
            <div v-if="product.isNew" class="new-badge">Nouveau</div>
          </div>
          
          <!-- Product Labels -->
          <div class="product-labels">
            <span v-if="product.isPopular" class="label popular">⭐ Populaire</span>
            <span v-if="product.rating >= 4" class="label top-rated">🏆 Top vente</span>
            <span v-if="product.ecoFriendly" class="label eco">🌱 Écologique</span>
          </div>

          <!-- View Details Button -->
          <div class="details-button-container">
            <router-link :to="`/product/${product.id}/details`" class="view-details-btn">
              <span class="btn-icon">🔍</span>
              Voir tous les détails
            </router-link>
            <span class="details-hint">Dimensions, composition, entretien</span>
          </div>
        </div>

        <!-- Right Column - Product Info -->
        <div class="info-section">
          <!-- Product Title & Category -->
          <div class="title-section">
            <h1 class="product-title">{{ product.name }}</h1>
            <div class="product-category">
              <span class="category-icon">🏷️</span>
              {{ getCategoryName(product.category) }}
            </div>
          </div>

          <!-- Rating & Reviews -->
          <div class="rating-section" v-if="product.rating">
            <div class="stars">
              <span 
                v-for="n in 5" 
                :key="n"
                :class="['star', { filled: n <= Math.round(product.rating) }]"
              >
                ★
              </span>
              <span class="rating-value">{{ product.rating.toFixed(1) }}</span>
            </div>
            <button @click="scrollToReviews" class="reviews-link">
              ({{ product.reviewCount || 0 }} avis)
            </button>
            <span class="best-seller" v-if="product.soldCount > 100">
              🔥 {{ formatNumber(product.soldCount) }} vendus
            </span>
          </div>

          <!-- Price & Stock -->
          <div class="price-stock-section">
            <div class="price-container">
              <div class="current-price">{{ formatPrice(product.price) }}</div>
              <div v-if="product.originalPrice" class="original-price">
                {{ formatPrice(product.originalPrice) }}
                <span class="save-amount">
                  Économisez {{ calculateDiscount(product.originalPrice, product.price) }}
                </span>
              </div>
              <div class="tax-info">TVA incluse</div>
            </div>
            
            <div class="stock-indicator" :class="stockStatusClass">
              <span class="indicator-dot"></span>
              <span class="stock-text">{{ stockStatusText }}</span>
              <span v-if="product.quantity > 0 && product.quantity < 10" class="low-stock-warning">
                ⚠️ Plus que {{ product.quantity }} disponible{{ product.quantity > 1 ? 's' : '' }}
              </span>
            </div>
          </div>

          <!-- Variants (Size, Color, etc.) -->
          <div v-if="product.variants && product.variants.length" class="variants-section">
            <div v-for="variant in product.variants" :key="variant.type" class="variant-group">
              <label class="variant-label">{{ variant.name }} :</label>
              <div class="variant-options">
                <button 
                  v-for="option in variant.options"
                  :key="option.value"
                  @click="selectVariant(variant.type, option)"
                  :class="['variant-option', { 
                    selected: selectedVariants[variant.type] === option.value,
                    disabled: !option.available 
                  }]"
                  :disabled="!option.available"
                >
                  {{ option.label }}
                  <span v-if="option.priceDiff" class="price-diff">
                    {{ option.priceDiff > 0 ? '+' : '' }}{{ option.priceDiff }}€
                  </span>
                </button>
              </div>
            </div>
          </div>

          <!-- Quantity Selector -->
          <div class="quantity-section">
            <label class="quantity-label">Quantité :</label>
            <div class="quantity-controls">
              <button 
                @click="decreaseQuantity" 
                :disabled="quantity <= 1"
                class="qty-btn qty-minus"
                aria-label="Diminuer quantité"
              >
                −
              </button>
              <input 
                v-model.number="quantity" 
                type="number" 
                min="1" 
                :max="product.quantity"
                @change="validateQuantity"
                class="qty-input"
                :disabled="!product.quantity"
                aria-label="Quantité"
              />
              <button 
                @click="increaseQuantity" 
                :disabled="quantity >= product.quantity"
                class="qty-btn qty-plus"
                aria-label="Augmenter quantité"
              >
                +
              </button>
            </div>
            <div v-if="product.quantity > 0" class="available-stock">
              <span class="stock-icon">📦</span>
              {{ product.quantity }} unités disponibles
            </div>
          </div>

          <!-- Add to Cart & Actions -->
          <div class="actions-section">
            <button 
              @click="addToCart" 
              :disabled="!product.quantity || addingToCart"
              :class="['add-to-cart-btn', { disabled: !product.quantity }]"
            >
              <span v-if="addingToCart" class="spinner"></span>
              <span v-else class="btn-icon">🛒</span>
              <span class="btn-text">{{ addToCartText }}</span>
              <span v-if="product.quantity" class="total-price">
                • {{ formatPrice(product.price * quantity) }}
              </span>
            </button>

            <div class="secondary-actions">
              <button @click="buyNow" class="buy-now-btn" :disabled="!product.quantity">
                <span class="btn-icon">⚡</span>
                Acheter maintenant
              </button>
              <button @click="addToCompare" class="compare-btn">
                <span class="btn-icon">⚖️</span>
                Comparer
              </button>
            </div>
          </div>

          <!-- Delivery Info -->
          <div class="delivery-section">
            <div class="delivery-item">
              <span class="delivery-icon">🚚</span>
              <div class="delivery-info">
                <strong>Livraison gratuite</strong>
                <small>à partir de 50€ • 3-5 jours ouvrés</small>
              </div>
            </div>
            <div class="delivery-item">
              <span class="delivery-icon">↩️</span>
              <div class="delivery-info">
                <strong>Retours gratuits</strong>
                <small>sous 30 jours • Satisfait ou remboursé</small>
              </div>
            </div>
            <div class="delivery-item">
              <span class="delivery-icon">🔒</span>
              <div class="delivery-info">
                <strong>Paiement sécurisé</strong>
                <small>CB, PayPal, 3x sans frais</small>
              </div>
            </div>
          </div>

          <!-- Short Description -->
          <div class="short-description">
            <h3>Description</h3>
            <p class="description-text">{{ product.description }}</p>
            <router-link :to="`/product/${product.id}/details`" class="read-more-link">
              Lire la suite 
              <span class="arrow">→</span>
            </router-link>
          </div>
        </div>
      </div>

      <!-- Quick Specs -->
      <div class="quick-specs">
        <div v-for="spec in quickSpecs" :key="spec.label" class="spec-item">
          <span class="spec-icon">{{ spec.icon }}</span>
          <div class="spec-content">
            <strong>{{ spec.label }}</strong>
            <small>{{ spec.value }}</small>
          </div>
        </div>
      </div>

      <!-- Related Products -->
      <div v-if="relatedProducts.length" class="related-products">
        <h2>Produits similaires</h2>
        <div class="related-grid">
          <div v-for="related in relatedProducts.slice(0, 4)" :key="related.id" class="related-card">
            <router-link :to="`/product/${related.id}`" class="related-link">
              <img :src="`/images/${related.img}`" :alt="related.name" />
              <div class="related-info">
                <h4>{{ related.name }}</h4>
                <div class="related-price">{{ formatPrice(related.price) }}</div>
              </div>
            </router-link>
          </div>
        </div>
      </div>

      <!-- Back Navigation -->
      <div class="back-navigation">
        <router-link :to="`/category/${product.category}`" class="back-to-category">
          ← Retour à {{ getCategoryName(product.category) }}
        </router-link>
        <router-link to="/" class="back-to-home">
          ← Retour à l'accueil
        </router-link>
      </div>
    </div>
    

    <!-- Section de partage étendue (après la description) -->
      <div class="social-share-section">
        <ShareButtons
          :url="currentPageUrl"
          :title="product.name"
          :description="`Découvrez ${product.name} à ${formatPrice(product.price)} sur MonShop. ${product.description}`"
          :image="fullProductImageUrl"
        />
      </div>
    <!-- Toast Notification -->
    <transition name="slide-up">
      <div v-if="showToast" :class="['toast', toastType]">
        <span class="toast-icon">{{ toastIcon }}</span>
        <span class="toast-text">{{ toastMessage }}</span>
        <button @click="showToast = false" class="toast-close">×</button>
      </div>
    </transition>
  </div>
</template>

<script>
  import ShareButtons from '../components/ShareButtons.vue'
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useHead } from '@unhead/vue'
import axios from 'axios'
import { productService } from '../services/productServices'

components: {
  ShareButtons  // ← Doit être présent
}
export default {
  name: 'ProductPage',

  // 🔥 COMPOSANTS - DOIT ÊTRE ICI, PAS AILLEURS
  components: {
    ShareButtons
  },
  props: ['addToCartGlobal', 'user'],

  setup(props) {
    const route = useRoute()
    const router = useRouter()

    // ============================================
    // ÉTAT RÉACTIF
    // ============================================
    const product = ref(null)
    const quantity = ref(1)
    const loading = ref(false)
    const error = ref(null)
    const selectedVariants = ref({})
    const addingToCart = ref(false)
    const isInWishlist = ref(false)
    const showToast = ref(false)
    const toastMessage = ref('')
    const toastType = ref('success')
    const relatedProducts = ref([])
    const zoomedImage = ref(false)

    // ============================================
    // COMPUTED - URLs ABSOLUES
    // ============================================
    const siteUrl = computed(() => {
      // En production, utilisez votre vraie URL
      return window.location.origin || 'https://monshop.com'
    })

    const fullProductImageUrl = computed(() => {
      if (!product.value?.img) {
        return `${siteUrl.value}/images/logo.png`
      }
      if (product.value.img.startsWith('http')) {
        return product.value.img
      }
      return `${siteUrl.value}/images/${product.value.img}`
    })

    const currentPageUrl = computed(() => {
      return `${siteUrl.value}/product/${route.params.id}`
    })

    // ============================================
    // 🎯 META TAGS DYNAMIQUES (CRUCIAL POUR SEO)
    // ============================================
    const metaTags = computed(() => {
      if (!product.value) {
        return {
          title: 'Chargement... | MonShop',
          meta: []
        }
      }

      const title = `${product.value.name} - ${formatPrice(product.value.price)} | MonShop`
      const description = product.value.description 
        ? product.value.description.substring(0, 155) + '...'
        : `Achetez ${product.value.name} à ${formatPrice(product.value.price)}. T-shirt premium en coton de qualité supérieure. Livraison rapide en Belgique.`

      return {
        title,
        meta: [
          // SEO de base
          { name: 'description', content: description },
          { name: 'keywords', content: `${product.value.name}, tshirt, ${getCategoryName(product.value.category)}, MonShop, Belgique` },
          
          // Open Graph (Facebook, LinkedIn, WhatsApp)
          { property: 'og:type', content: 'product' },
          { property: 'og:site_name', content: 'MonShop' },
          { property: 'og:title', content: title },
          { property: 'og:description', content: description },
          { property: 'og:image', content: fullProductImageUrl.value },
          { property: 'og:image:secure_url', content: fullProductImageUrl.value },
          { property: 'og:image:width', content: '800' },
          { property: 'og:image:height', content: '800' },
          { property: 'og:image:alt', content: product.value.name },
          { property: 'og:url', content: currentPageUrl.value },
          { property: 'og:locale', content: 'fr_BE' },
          { property: 'product:price:amount', content: product.value.price },
          { property: 'product:price:currency', content: 'EUR' },
          { property: 'product:availability', content: product.value.quantity > 0 ? 'in stock' : 'out of stock' },
          
          // Twitter Card
          { name: 'twitter:card', content: 'summary_large_image' },
          { name: 'twitter:site', content: '@MonShop' },
          { name: 'twitter:title', content: title },
          { name: 'twitter:description', content: description },
          { name: 'twitter:image', content: fullProductImageUrl.value },
          { name: 'twitter:image:alt', content: product.value.name },
          
          // Pinterest
          { name: 'pinterest:description', content: description }
        ],
        
        // Canonical URL
        link: [
          { rel: 'canonical', href: currentPageUrl.value }
        ],
        
        // 🔥 Schema.org JSON-LD (Rich Snippets Google)
        script: [
          {
            type: 'application/ld+json',
            children: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Product",
              "name": product.value.name,
              "image": [fullProductImageUrl.value],
              "description": description,
              "sku": `PROD-${product.value.id}`,
              "brand": {
                "@type": "Brand",
                "name": product.value.brand || "MonShop"
              },
              "offers": {
                "@type": "Offer",
                "url": currentPageUrl.value,
                "priceCurrency": "EUR",
                "price": product.value.price,
                "availability": product.value.quantity > 0 
                  ? "https://schema.org/InStock" 
                  : "https://schema.org/OutOfStock",
                "priceValidUntil": new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
                "seller": {
                  "@type": "Organization",
                  "name": "MonShop"
                }
              },
              "aggregateRating": product.value.rating ? {
                "@type": "AggregateRating",
                "ratingValue": product.value.rating,
                "reviewCount": product.value.reviewCount || 0,
                "bestRating": 5,
                "worstRating": 1
              } : undefined
            })
          },
          // Breadcrumbs Schema
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
                  "item": siteUrl.value
                },
                {
                  "@type": "ListItem",
                  "position": 2,
                  "name": getCategoryName(product.value.category),
                  "item": `${siteUrl.value}/category/${product.value.category}`
                },
                {
                  "@type": "ListItem",
                  "position": 3,
                  "name": product.value.name,
                  "item": currentPageUrl.value
                }
              ]
            })
          }
        ]
      }
    })

    // Appliquer les meta tags
    watch(metaTags, (newMeta) => {
      useHead(newMeta)
    }, { immediate: true })

    // ============================================
    // COMPUTED - STATUT & FORMATAGE
    // ============================================
    const stockStatusClass = computed(() => {
      if (!product.value) return ''
      if (product.value.quantity > 10) return 'in-stock'
      if (product.value.quantity > 0) return 'low-stock'
      return 'out-of-stock'
    })

    const stockStatusText = computed(() => {
      if (!product.value) return ''
      if (product.value.quantity > 10) return 'En stock'
      if (product.value.quantity > 0) return 'Stock limité'
      return 'Rupture de stock'
    })

    const addToCartText = computed(() => {
      if (!product.value?.quantity) return 'Rupture de stock'
      if (addingToCart.value) return 'Ajout en cours...'
      return 'Ajouter au panier'
    })

    const wishlistIcon = computed(() => isInWishlist.value ? '❤️' : '🤍')
    const wishlistText = computed(() => isInWishlist.value ? 'Dans la liste' : 'Ajouter à la liste')

    const toastIcon = computed(() => {
      const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' }
      return icons[toastType.value] || icons.info
    })

    const quickSpecs = computed(() => {
      if (!product.value) return []
      const specs = []
      
      if (product.value.brand) specs.push({ icon: '🏷️', label: 'Marque', value: product.value.brand })
      if (product.value.material) specs.push({ icon: '🧵', label: 'Matière', value: product.value.material })
      if (product.value.color) specs.push({ icon: '🎨', label: 'Couleur', value: product.value.color })
      if (product.value.size) specs.push({ icon: '📏', label: 'Taille', value: product.value.size })
      
      return specs
    })

    // ============================================
    // MÉTHODES - CHARGEMENT
    // ============================================
    const loadProduct = async () => {
      loading.value = true
      error.value = null
      product.value = null

      try {
        const id = route.params.id

        if (!id || id === 'undefined') {
          throw new Error('ID de produit invalide')
        }

        const response = await productService.getById(id)

        if (response && typeof response === 'object') {
          if (response.success && response.data) {
            product.value = response.data
          } else if (response.id) {
            product.value = response
          } else if (response.product) {
            product.value = response.product
          } else {
            throw new Error('Format de réponse invalide')
          }
        } else {
          throw new Error('Réponse API invalide')
        }

        if (!product.value || !product.value.id) {
          throw new Error('Produit non trouvé')
        }

        checkWishlistStatus()
        await loadRelatedProducts()

      } catch (err) {
        console.error('❌ Erreur chargement produit:', err)
        handleError(err)
      } finally {
        loading.value = false
      }
    }

    const loadRelatedProducts = async () => {
      try {
        if (!product.value?.category) return

        const products = await productService.getByCategory(product.value.category)
        relatedProducts.value = Array.isArray(products)
          ? products.filter(p => p.id !== product.value.id)
          : []

      } catch (err) {
        console.error('❌ Erreur produits similaires:', err)
      }
    }

    const checkWishlistStatus = () => {
      if (!props.user || !product.value) return
      const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]')
      isInWishlist.value = wishlist.some(item => item.id === product.value.id)
    }

    // ============================================
    // MÉTHODES - PANIER & ACTIONS
    // ============================================
    const addToCart = async () => {
      if (!product.value || quantity.value <= 0 || addingToCart.value) return

      if (!props.user) {
        showToastMessage('Veuillez vous connecter', 'error')
        router.push('/login')
        return
      }

      addingToCart.value = true

      try {
        await axios.post('/cart/item', {
          productId: product.value.id,
          quantity: quantity.value
        })

        showToastMessage(
          `✅ ${quantity.value} "${product.value.name}" ajouté${quantity.value > 1 ? 's' : ''} au panier`,
          'success'
        )

        quantity.value = 1

        // Émettre événement pour EventBus
        if (window.EventBus) {
          window.EventBus.$emit('cart-updated')
        }

      } catch (err) {
        console.error('❌ Erreur ajout panier:', err)
        showToastMessage('❌ Erreur lors de l\'ajout au panier', 'error')
      } finally {
        addingToCart.value = false
      }
    }

    const buyNow = () => {
      if (!product.value?.quantity) return

      addToCart().then(() => {
        router.push('/cart')
      })
    }

    // ============================================
    // 📱 PARTAGE SOCIAL AMÉLIORÉ
    // ============================================
    const shareProduct = async () => {
      if (!product.value) return

      const shareData = {
        title: product.value.name,
        text: `${product.value.name} - ${formatPrice(product.value.price)} sur MonShop 🛍️`,
        url: currentPageUrl.value
      }

      // 1. API native (si disponible)
      if (navigator.share) {
        try {
          await navigator.share(shareData)
          showToastMessage('Merci du partage ! 🎉', 'success')
          return
        } catch (err) {
          if (err.name === 'AbortError') {
            return // Utilisateur a annulé
          }
          console.log('Partage natif non supporté, fallback...')
        }
      }

      // 2. Fallback : Copier + Afficher les options
      try {
        await navigator.clipboard.writeText(currentPageUrl.value)
        
        // Afficher les options de partage manuel
        const confirmShare = confirm(
          `Lien copié ! 📋\n\n` +
          `Voulez-vous ouvrir WhatsApp pour partager ?\n\n` +
          `(Vous pouvez aussi coller le lien sur Facebook, Instagram, etc.)`
        )

        if (confirmShare) {
          // Ouvrir WhatsApp avec le message pré-rempli
          const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(
            `${shareData.text}\n${shareData.url}`
          )}`
          window.open(whatsappUrl, '_blank')
        }

        showToastMessage('Lien copié ! 📋', 'success')

      } catch (err) {
        console.error('❌ Erreur copie:', err)
        showToastMessage('Impossible de copier le lien', 'error')
      }
    }

    // Options de partage social direct
    const shareOnSocial = (platform) => {
      if (!product.value) return

      const url = encodeURIComponent(currentPageUrl.value)
      const title = encodeURIComponent(product.value.name)
      const description = encodeURIComponent(
        `${product.value.name} - ${formatPrice(product.value.price)}`
      )
      const image = encodeURIComponent(fullProductImageUrl.value)

      const urls = {
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
        twitter: `https://twitter.com/intent/tweet?url=${url}&text=${title}&hashtags=MonShop,TshirtPremium`,
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
        whatsapp: `https://wa.me/?text=${title}%20${url}`,
        pinterest: `https://pinterest.com/pin/create/button/?url=${url}&media=${image}&description=${description}`,
        email: `mailto:?subject=${title}&body=${description}%0A%0A${url}`
      }

      if (urls[platform]) {
        window.open(urls[platform], '_blank', 'width=600,height=500')
      }
    }

    // ============================================
    // MÉTHODES - UTILITAIRES
    // ============================================
    const toggleWishlist = () => {
      if (!props.user) {
        showToastMessage('Connectez-vous pour ajouter à votre liste', 'info')
        router.push('/login')
        return
      }

      let wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]')

      if (isInWishlist.value) {
        wishlist = wishlist.filter(item => item.id !== product.value.id)
        showToastMessage('Retiré de votre liste de souhaits', 'info')
      } else {
        wishlist.push({
          id: product.value.id,
          name: product.value.name,
          price: product.value.price,
          img: product.value.img,
          addedAt: new Date().toISOString()
        })
        showToastMessage('Ajouté à votre liste de souhaits', 'success')
      }

      localStorage.setItem('wishlist', JSON.stringify(wishlist))
      isInWishlist.value = !isInWishlist.value

      window.dispatchEvent(new CustomEvent('wishlist-updated'))
    }

    const addToCompare = () => {
      let compareList = JSON.parse(localStorage.getItem('compareList') || '[]')

      if (compareList.some(item => item.id === product.value.id)) {
        showToastMessage('Produit déjà dans la comparaison', 'info')
        return
      }

      if (compareList.length >= 4) {
        showToastMessage('Maximum 4 produits pour la comparaison', 'warning')
        return
      }

      compareList.push({
        id: product.value.id,
        name: product.value.name,
        price: product.value.price,
        category: product.value.category,
        img: product.value.img
      })

      localStorage.setItem('compareList', JSON.stringify(compareList))
      showToastMessage('Ajouté à la comparaison', 'success')

      window.dispatchEvent(new CustomEvent('compare-updated'))
    }

    const showToastMessage = (message, type = 'success') => {
      toastMessage.value = message
      toastType.value = type
      showToast.value = true

      setTimeout(() => {
        showToast.value = false
      }, 3000)
    }

    const validateQuantity = () => {
      if (quantity.value < 1) quantity.value = 1
      if (product.value?.quantity && quantity.value > product.value.quantity) {
        quantity.value = product.value.quantity
      }
    }

    const increaseQuantity = () => {
      if (product.value?.quantity && quantity.value < product.value.quantity) {
        quantity.value++
      }
    }

    const decreaseQuantity = () => {
      if (quantity.value > 1) {
        quantity.value--
      }
    }

    const getCategoryName = (id) => {
      const categories = { 1: 'Homme', 2: 'Femme', 3: 'Enfant' }
      return categories[id] || 'Catégorie'
    }

    const formatPrice = (price) => {
      if (!price) return '0,00 €'
      const numPrice = typeof price === 'string' ? parseFloat(price) : price
      return numPrice.toFixed(2).replace('.', ',') + ' €'
    }

    const formatNumber = (num) => {
      return new Intl.NumberFormat('fr-FR').format(num)
    }

    const calculateDiscount = (original, current) => {
      const discount = ((original - current) / original) * 100
      return `${Math.round(discount)}%`
    }

    const selectVariant = (type, option) => {
      selectedVariants.value[type] = option.value
    }

    const scrollToReviews = () => {
      router.push(`/product/${product.value.id}/details#reviews`)
    }

    const printPage = () => {
      window.print()
    }

    const openImageZoom = () => {
      zoomedImage.value = !zoomedImage.value
    }

    const handleImageError = (event) => {
      event.target.src = '/images/placeholder.jpg'
      event.target.onerror = null
    }

    const handleError = (err) => {
      if (err.response) {
        switch (err.response.status) {
          case 404:
            error.value = 'Ce produit n\'existe pas ou a été supprimé.'
            break
          case 500:
            error.value = 'Erreur serveur. Veuillez réessayer plus tard.'
            break
          default:
            error.value = `Erreur serveur (${err.response.status})`
        }
      } else if (err.request) {
        error.value = 'Impossible de contacter le serveur. Vérifiez votre connexion internet.'
      } else {
        error.value = err.message || 'Une erreur inattendue est survenue'
      }
    }

    // ============================================
    // LIFECYCLE
    // ============================================
    watch(() => route.params.id, (newId) => {
      if (newId) {
        loadProduct()
      }
    }, { immediate: true })

    onMounted(() => {
      loadProduct()
    })

    // ============================================
    // RETURN
    // ============================================
    return {
      product,
      quantity,
      loading,
      error,
      selectedVariants,
      addingToCart,
      isInWishlist,
      showToast,
      toastMessage,
      toastType,
      relatedProducts,
      zoomedImage,
      siteUrl,
      fullProductImageUrl,
      currentPageUrl,
      stockStatusClass,
      stockStatusText,
      addToCartText,
      wishlistIcon,
      wishlistText,
      toastIcon,
      quickSpecs,
      loadProduct,
      addToCart,
      buyNow,
      shareProduct,
      shareOnSocial,
      toggleWishlist,
      addToCompare,
      showToastMessage,
      validateQuantity,
      increaseQuantity,
      decreaseQuantity,
      getCategoryName,
      formatPrice,
      formatNumber,
      calculateDiscount,
      selectVariant,
      scrollToReviews,
      printPage,
      openImageZoom,
      handleImageError
    }
  }
}
</script>

<style scoped>
/* Reset & Base */
.product-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
}

/* Breadcrumb */
.breadcrumb-nav {
  background: white;
  padding: 1rem 0;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  margin-bottom: 2rem;
}

.breadcrumb-nav .container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.breadcrumb-link {
  color: #3b82f6;
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.2s;
}

.breadcrumb-link:hover {
  color: #2563eb;
  text-decoration: underline;
}

.separator {
  color: #94a3b8;
  font-size: 0.8rem;
}

.current {
  color: #64748b;
  font-weight: 500;
  font-size: 0.9rem;
}

/* Skeleton Loading */
.skeleton-container {
  max-width: 1200px;
  margin: 2rem auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  padding: 2rem;
  animation: pulse 1.5s infinite;
}

.skeleton-image {
  height: 400px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  border-radius: 12px;
}

.skeleton-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.skeleton-title {
  height: 2.5rem;
  width: 80%;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  border-radius: 6px;
}

.skeleton-price {
  height: 2rem;
  width: 30%;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  border-radius: 6px;
}

.skeleton-button {
  height: 3rem;
  width: 60%;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  border-radius: 8px;
  margin-top: 2rem;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* Error State */
.error-container {
  max-width: 600px;
  margin: 4rem auto;
  padding: 3rem;
  text-align: center;
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
}

.error-icon {
  font-size: 4rem;
  margin-bottom: 1.5rem;
}

.error-container h2 {
  color: #ef4444;
  margin-bottom: 1rem;
}

.error-container p {
  color: #64748b;
  margin-bottom: 2rem;
}

.error-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover {
  background: #2563eb;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.btn-secondary {
  background: #e2e8f0;
  color: #475569;
}

.btn-secondary:hover {
  background: #cbd5e1;
  transform: translateY(-2px);
}

.btn-icon {
  font-size: 1.1em;
}

/* Main Product Container */
.product-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem 3rem;
}

/* Header Actions */
.header-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-bottom: 2rem;
}

.header-action-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  color: #475569;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.header-action-btn:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
  transform: translateY(-1px);
}

.action-icon {
  font-size: 1.1em;
}

/* Main Content Grid */
.main-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  margin-bottom: 3rem;
  background: white;
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.08);
}

/* Gallery Section */
.gallery-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.main-image-container {
  position: relative;
  cursor: zoom-in;
}

.main-product-image {
  width: 100%;
  height: auto;
  border-radius: 12px;
  box-shadow: 0 8px 30px rgba(0,0,0,0.12);
  transition: transform 0.3s ease;
}

.main-product-image:hover {
  transform: scale(1.01);
}

.discount-badge {
  position: absolute;
  top: 1rem;
  left: 1rem;
  background: #ef4444;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: bold;
  font-size: 0.9rem;
  animation: pulse 2s infinite;
}

.new-badge {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: #10b981;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: bold;
  font-size: 0.9rem;
}

/* Product Labels */
.product-labels {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.label {
  padding: 0.25rem 0.75rem;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 500;
}

.label.popular {
  background: #fef3c7;
  color: #92400e;
}

.label.top-rated {
  background: #dbeafe;
  color: #1e40af;
}

.label.eco {
  background: #d1fae5;
  color: #065f46;
}

/* Details Button */
.details-button-container {
  text-align: center;
  margin-top: 1rem;
}

.view-details-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.3s;
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
}

.view-details-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
}

.details-hint {
  display: block;
  margin-top: 0.5rem;
  color: #64748b;
  font-size: 0.85rem;
}

/* Info Section */
.info-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.title-section {
  margin-bottom: 0.5rem;
}

.product-title {
  font-size: 2.2rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 0.5rem 0;
  line-height: 1.2;
}

.product-category {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: #64748b;
  font-size: 0.95rem;
  background: #f8fafc;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
}

.category-icon {
  font-size: 0.9em;
}

/* Rating Section */
.rating-section {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.stars {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.star {
  color: #e2e8f0;
  font-size: 1.2rem;
}

.star.filled {
  color: #f59e0b;
}

.rating-value {
  margin-left: 0.5rem;
  font-weight: 600;
  color: #1e293b;
}

.reviews-link {
  background: none;
  border: none;
  color: #3b82f6;
  cursor: pointer;
  font-size: 0.9rem;
  padding: 0;
}

.reviews-link:hover {
  text-decoration: underline;
}

.best-seller {
  background: #fee2e2;
  color: #991b1b;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
}

/* Price & Stock */
.price-stock-section {
  padding: 1.5rem;
  background: #f8fafc;
  border-radius: 12px;
  border-left: 4px solid #3b82f6;
}

.price-container {
  margin-bottom: 1rem;
}

.current-price {
  font-size: 2.5rem;
  font-weight: 800;
  color: #1e293b;
  margin-bottom: 0.5rem;
}

.original-price {
  font-size: 1.2rem;
  color: #94a3b8;
  text-decoration: line-through;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.save-amount {
  background: #10b981;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 600;
}

.tax-info {
  color: #64748b;
  font-size: 0.9rem;
  margin-top: 0.25rem;
}

.stock-indicator {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-weight: 500;
}

.stock-indicator.in-stock {
  background: #d1fae5;
  color: #065f46;
}

.stock-indicator.low-stock {
  background: #fef3c7;
  color: #92400e;
}

.stock-indicator.out-of-stock {
  background: #fee2e2;
  color: #991b1b;
}

.indicator-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
}

.stock-indicator.in-stock .indicator-dot {
  background: #10b981;
}

.stock-indicator.low-stock .indicator-dot {
  background: #f59e0b;
}

.stock-indicator.out-of-stock .indicator-dot {
  background: #ef4444;
}

.low-stock-warning {
  font-size: 0.9rem;
  margin-left: 0.5rem;
}

/* Variants */
.variants-section {
  margin-top: 1rem;
}

.variant-group {
  margin-bottom: 1.5rem;
}

.variant-label {
  display: block;
  margin-bottom: 0.75rem;
  font-weight: 600;
  color: #1e293b;
}

.variant-options {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.variant-option {
  padding: 0.5rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.variant-option:hover:not(.disabled) {
  border-color: #cbd5e1;
  background: #f8fafc;
}

.variant-option.selected {
  border-color: #3b82f6;
  background: #dbeafe;
  color: #1e40af;
  font-weight: 600;
}

.variant-option.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  text-decoration: line-through;
}

.price-diff {
  font-size: 0.85rem;
  color: #10b981;
  font-weight: 600;
}

/* Quantity Section */
.quantity-section {
  margin: 1rem 0;
}

.quantity-label {
  display: block;
  margin-bottom: 0.75rem;
  font-weight: 600;
  color: #1e293b;
}

.quantity-controls {
  display: inline-flex;
  align-items: center;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
  background: white;
}

.qty-btn {
  width: 3rem;
  height: 3rem;
  border: none;
  background: #f8fafc;
  font-size: 1.2rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.qty-btn:hover:not(:disabled) {
  background: #e2e8f0;
}

.qty-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.qty-input {
  width: 4rem;
  height: 3rem;
  border: none;
  text-align: center;
  font-size: 1.1rem;
  font-weight: 600;
  color: #1e293b;
  background: white;
}

.qty-input:focus {
  outline: none;
}

.available-stock {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.75rem;
  color: #64748b;
  font-size: 0.9rem;
  background: #f8fafc;
  padding: 0.5rem 1rem;
  border-radius: 20px;
}

.stock-icon {
  font-size: 1em;
}

/* Actions Section */
.actions-section {
  margin: 2rem 0;
}

.add-to-cart-btn {
  width: 100%;
  padding: 1.25rem;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  transition: all 0.3s;
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
  margin-bottom: 1rem;
}

.add-to-cart-btn:hover:not(.disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 25px rgba(59, 130, 246, 0.4);
}

.add-to-cart-btn.disabled {
  opacity: 0.7;
  cursor: not-allowed;
  background: #94a3b8;
}

.spinner {
  width: 1.25rem;
  height: 1.25rem;
  border: 2px solid rgba(255,255,255,0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.total-price {
  margin-left: auto;
  font-size: 1.1rem;
  opacity: 0.9;
}

.secondary-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.buy-now-btn {
  padding: 1rem;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.3s;
}

.buy-now-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
}

.buy-now-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.compare-btn {
  padding: 1rem;
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  color: #475569;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.2s;
}

.compare-btn:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
  transform: translateY(-1px);
}

/* Delivery Section */
.delivery-section {
  background: #f0f9ff;
  border-radius: 12px;
  padding: 1.5rem;
  border-left: 4px solid #0ea5e9;
}

.delivery-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.delivery-item:last-child {
  margin-bottom: 0;
}

.delivery-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.delivery-info {
  flex: 1;
}

.delivery-info strong {
  display: block;
  color: #1e293b;
  margin-bottom: 0.25rem;
}

.delivery-info small {
  color: #64748b;
  font-size: 0.85rem;
}

/* Short Description */
.short-description {
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 2px solid #f1f5f9;
}

.short-description h3 {
  font-size: 1.3rem;
  color: #1e293b;
  margin-bottom: 1rem;
}

.description-text {
  color: #475569;
  line-height: 1.7;
  margin-bottom: 1rem;
}

.read-more-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: #3b82f6;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.95rem;
  transition: gap 0.2s;
}

.read-more-link:hover {
  gap: 0.75rem;
}

.arrow {
  font-size: 1.2em;
  transition: transform 0.2s;
}

.read-more-link:hover .arrow {
  transform: translateX(4px);
}

/* Quick Specs */
.quick-specs {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  background: white;
  padding: 2rem;
  border-radius: 16px;
  margin: 2rem 0;
  box-shadow: 0 5px 15px rgba(0,0,0,0.05);
}

.spec-item {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.spec-icon {
  font-size: 1.5rem;
  width: 3rem;
  height: 3rem;
  background: #f8fafc;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.spec-content {
  flex: 1;
}

.spec-content strong {
  display: block;
  color: #1e293b;
  margin-bottom: 0.25rem;
}

.spec-content small {
  color: #64748b;
  font-size: 0.9rem;
}

/* Related Products */
.related-products {
  margin: 3rem 0;
}

.related-products h2 {
  font-size: 1.8rem;
  color: #1e293b;
  margin-bottom: 1.5rem;
  text-align: center;
}

.related-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.related-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  transition: transform 0.3s, box-shadow 0.3s;
}

.related-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.12);
}

.related-link {
  text-decoration: none;
  color: inherit;
  display: block;
}

.related-card img {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.related-info {
  padding: 1rem;
}

.related-info h4 {
  font-size: 1rem;
  color: #1e293b;
  margin: 0 0 0.5rem 0;
  line-height: 1.4;
}

.related-price {
  font-size: 1.2rem;
  font-weight: 700;
  color: #3b82f6;
}

/* Back Navigation */
.back-navigation {
  display: flex;
  justify-content: space-between;
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 2px solid #f1f5f9;
}

.back-to-category, .back-to-home {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: #3b82f6;
  text-decoration: none;
  font-weight: 500;
  padding: 0.75rem 1.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  transition: all 0.2s;
}

.back-to-category:hover, .back-to-home:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
  transform: translateY(-1px);
}

/* Toast Notification */
.toast {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  background: white;
  box-shadow: 0 10px 30px rgba(0,0,0,0.15);
  display: flex;
  align-items: center;
  gap: 1rem;
  z-index: 1000;
  animation: slideIn 0.3s ease-out;
  max-width: 400px;
}

.toast.success {
  border-left: 4px solid #10b981;
}

.toast.error {
  border-left: 4px solid #ef4444;
}

.toast.info {
  border-left: 4px solid #3b82f6;
}

.toast.warning {
  border-left: 4px solid #f59e0b;
}

.toast-icon {
  font-size: 1.2rem;
}

.toast-text {
  flex: 1;
  font-weight: 500;
}

.toast-close {
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  font-size: 1.2rem;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
}

.toast-close:hover {
  background: #f1f5f9;
  color: #64748b;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.slide-up-enter-active, .slide-up-leave-active {
  transition: all 0.3s;
}

.slide-up-enter-from, .slide-up-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

/* Responsive Design */
@media (max-width: 1024px) {
  .main-content {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  
  .main-product-image {
    max-width: 500px;
    margin: 0 auto;
  }
}

@media (max-width: 768px) {
  .product-container {
    padding: 0 0.5rem 2rem;
  }
  
  .main-content {
    padding: 1rem;
  }
  
  .product-title {
    font-size: 1.8rem;
  }
  
  .current-price {
    font-size: 2rem;
  }
  
  .secondary-actions {
    grid-template-columns: 1fr;
  }
  
  .quick-specs {
    grid-template-columns: 1fr;
  }
  
  .related-grid {
    grid-template-columns: 1fr 1fr;
  }
  
  .back-navigation {
    flex-direction: column;
    gap: 1rem;
  }
  
  .toast {
    left: 1rem;
    right: 1rem;
    max-width: none;
  }
}

@media (max-width: 640px) {
  .skeleton-container {
    grid-template-columns: 1fr;
  }
  
  .header-actions {
    justify-content: center;
  }
  
  .related-grid {
    grid-template-columns: 1fr;
  }
  
  .error-actions {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
    justify-content: center;
  }
  social-share-section {
  margin: 3rem 0;
  border-top: 1px solid #e0e0e0;
  padding-top: 2rem;
}
}
</style>
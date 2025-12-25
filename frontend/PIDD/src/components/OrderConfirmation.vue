<template>
  <div class="order-success-page">
    <!-- Animation de fond avec particules -->
    <div class="background-particles">
      <div class="particle" v-for="n in 15" :key="'particle-' + n" :style="particleStyle(n)"></div>
    </div>

    <!-- Header avec animation améliorée -->
    <div class="success-header">
      <div class="success-animation">
        <div class="pulse-ring ring-1"></div>
        <div class="pulse-ring ring-2"></div>
        <div class="pulse-ring ring-3"></div>
        <div class="success-icon">
          <svg width="100" height="100" viewBox="0 0 100 100" fill="none">
            <circle cx="50" cy="50" r="48" fill="url(#gradient)" stroke="url(#gradient)" stroke-width="3"/>
            <path d="M30 50L45 65L70 40" stroke="white" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#10B981" />
                <stop offset="50%" stop-color="#059669" />
                <stop offset="100%" stop-color="#047857" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>
      
      <h1 class="success-title">
        <span class="title-text">Commande confirmée !</span>
        <span class="title-underline"></span>
      </h1>
      
      <p class="success-subtitle">
        <span class="subtitle-icon">🎉</span>
        Merci pour votre achat{{ user ? `, ${user.name}` : '' }} ! Votre commande a été enregistrée avec succès.
      </p>
      
      <div class="order-number-display">
        <div class="order-number-content">
          <span class="order-number-label">Numéro de commande</span>
          <span class="order-number-value">{{ orderId }}</span>
          <div class="order-number-decoration">
            <span class="decoration-dot"></span>
            <span class="decoration-line"></span>
            <span class="decoration-dot"></span>
          </div>
        </div>
      </div>
    </div>

    <!-- Section principale avec effet de carte flottante -->
    <div class="main-content">
      <!-- Carte Résumé de la commande (design amélioré) -->
      <div class="order-summary-card floating-card">
        <div class="card-header-animated">
          <div class="header-icon">📋</div>
          <h2 class="card-main-title">Résumé de la commande</h2>
          <div class="header-decoration"></div>
        </div>
        
        <div class="summary-section">
          <div class="summary-row" v-for="(row, index) in summaryRows" :key="index">
            <div class="row-decoration"></div>
            <span class="summary-label">
              <span class="label-icon">{{ row.icon }}</span>
              {{ row.label }}
            </span>
            <span class="summary-value" :class="row.class">
              {{ row.value }}
            </span>
          </div>
        </div>
        
        <!-- Séparateur animé -->
        <div class="animated-divider">
          <div class="divider-line"></div>
          <div class="divider-icon">🚚</div>
          <div class="divider-line"></div>
        </div>
        
        <!-- Informations de livraison -->
        <div class="delivery-section">
          <h3 class="section-title">
            <span class="title-icon">📍</span>
            Informations de livraison
          </h3>
          
          <div class="delivery-info-card">
            <div class="delivery-icon-animated">
              <div class="icon-circle">
                <span class="icon">📦</span>
              </div>
              <div class="icon-pulse"></div>
            </div>
            <div class="delivery-details">
              <h4 class="delivery-name">{{ deliveryMethod }}</h4>
              <p class="delivery-estimate">
                <span class="estimate-icon">📅</span>
                Livraison estimée : <strong>{{ estimatedDeliveryDate }}</strong>
              </p>
            </div>
          </div>
          
          <div class="tracking-card">
            <div class="tracking-header">
              <span class="tracking-label">
                <span class="label-icon">🔍</span>
                Numéro de suivi
              </span>
              <button 
                @click="copyTrackingNumber" 
                class="copy-btn-animated"
                :class="{ copied: isTrackingCopied }"
              >
                <span class="btn-content">
                  <span v-if="!isTrackingCopied" class="copy-icon">📋</span>
                  <span v-if="!isTrackingCopied" class="copy-text">Copier</span>
                  <span v-if="isTrackingCopied" class="copied-text">
                    <span class="check-icon">✓</span>
                    Copié !
                  </span>
                </span>
                <span class="btn-wave"></span>
              </button>
            </div>
            <div class="tracking-number-display">
              <div class="tracking-number-bg">
                <code class="tracking-number">{{ trackingNumber }}</code>
              </div>
              <div class="tracking-number-shine"></div>
            </div>
          </div>
          
          <button @click="trackPackage" class="track-btn-animated">
            <span class="btn-wave-effect"></span>
            <span class="track-icon">📍</span>
            <span class="track-text">Suivre mon colis</span>
            <span class="track-arrow">→</span>
          </button>
        </div>
      </div>

      <!-- Détails des articles avec effet de slide -->
      <transition name="slide-fade">
        <div v-if="orderData?.items && orderData.items.length > 0" class="order-items-card floating-card">
          <div class="card-header-animated">
            <div class="header-icon">🛍️</div>
            <h3 class="card-title">Articles commandés</h3>
          </div>
          
          <div class="items-list">
            <div v-for="(item, index) in orderData.items" :key="index" class="order-item">
              <div class="item-image-animated">
                <div class="image-circle">
                  <img
                    :src="getProductImage(item)"
                    :alt="item.name || 'Produit'"
                    @error="handleImageError"
                    loading="lazy"
                    class="product-image"
                  />
                </div>
                <div class="image-glow"></div>
              </div>
              <div class="item-details">
                <h4 class="item-name">{{ item.name || 'Produit' }}</h4>
                <div class="item-meta">
                  <span class="item-quantity">
                    <span class="meta-icon">🔢</span>
                    Quantité: {{ item.quantity || 1 }}
                  </span>
                  <span class="item-price">
                    <span class="meta-icon">💰</span>
                    {{ formatPrice(item.price || 0) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div class="price-summary">
            <div class="price-row" v-for="(row, index) in priceRows" :key="index" :class="row.class">
              <span class="price-label">{{ row.label }}</span>
              <span class="price-value">{{ row.value }}</span>
            </div>
          </div>
        </div>
      </transition>

      <!-- Actions avec effet de hover amélioré -->
      <div class="actions-section">
        <h3 class="section-title">Prochaines étapes</h3>
        <div class="actions-grid">
          <router-link to="/" class="action-card card-hover-1">
            <div class="card-glow"></div>
            <div class="action-icon">🏠</div>
            <div class="action-content">
              <h4>Retour à l'accueil</h4>
              <p>Retourner sur la page principale</p>
            </div>
            <div class="action-arrow">→</div>
          </router-link>
          
          <router-link to="/categories" class="action-card card-hover-2">
            <div class="card-glow"></div>
            <div class="action-icon">🛒</div>
            <div class="action-content">
              <h4>Continuer mes achats</h4>
              <p>Découvrir nos nouvelles collections</p>
            </div>
            <div class="action-arrow">→</div>
          </router-link>
          
          <button @click="downloadInvoice" class="action-card card-hover-3">
            <div class="card-glow"></div>
            <div class="action-icon">📄</div>
            <div class="action-content">
              <h4>Télécharger la facture</h4>
              <p>Format PDF ou TXT</p>
            </div>
            <div class="action-arrow">↓</div>
          </button>
        </div>
      </div>

      <!-- Informations supplémentaires avec effet de carte -->
      <div class="additional-info-grid">
        <div class="info-card card-hover-4">
          <div class="info-icon-animated">
            <div class="icon-wrapper">
              <span class="icon">📧</span>
            </div>
          </div>
          <div class="info-content">
            <h4>Email de confirmation</h4>
            <p>Un récapitulatif détaillé a été envoyé à {{ user?.email || 'votre adresse email' }}</p>
          </div>
        </div>
        
        <div class="info-card card-hover-5">
          <div class="info-icon-animated">
            <div class="icon-wrapper">
              <span class="icon">📱</span>
            </div>
          </div>
          <div class="info-content">
            <h4>Suivi en temps réel</h4>
            <p>Suivez votre commande dans votre espace client</p>
          </div>
        </div>
      </div>

      <!-- Section de progression animée -->
      <div class="progress-section">
        <h3 class="section-title">Suivi de votre commande</h3>
        <div class="progress-timeline">
          <div class="timeline-line"></div>
          <div v-for="step in timelineSteps" :key="step.id" class="timeline-step" :class="{ active: step.active }">
            <div class="step-indicator">
              <div class="step-circle">
                <span class="step-number">{{ step.id }}</span>
                <span class="step-check">✓</span>
              </div>
              <div class="step-pulse" v-if="step.active"></div>
            </div>
            <div class="step-content">
              <h4 class="step-title">{{ step.title }}</h4>
              <p class="step-description">{{ step.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Message de félicitations animé -->
    <div class="celebration-message">
      <div class="message-content">
        <span class="message-icon">🎊</span>
        <p>Merci pour votre confiance ! Votre satisfaction est notre priorité.</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'OrderSuccess',
  data() {
    return {
      orderData: null,
      isTrackingCopied: false,
      timelineSteps: [
        { id: 1, title: 'Commande confirmée', description: 'Votre commande a été validée', active: true },
        { id: 2, title: 'En préparation', description: 'Notre équipe prépare votre colis', active: false },
        { id: 3, title: 'Expédié', description: 'Votre colis a été remis au transporteur', active: false },
        { id: 4, title: 'En livraison', description: 'Votre colis est en cours de livraison', active: false },
        { id: 5, title: 'Livré', description: 'Votre commande a été livrée', active: false }
      ]
    }
  },
  computed: {
    user() {
      const userStr = localStorage.getItem('user')
      return userStr ? JSON.parse(userStr) : null
    },
    
    formattedDate() {
      if (this.orderData?.date) {
        const date = new Date(this.orderData.date)
        return date.toLocaleDateString('fr-FR', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        })
      }
      return new Date().toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
    },
    
    estimatedDeliveryDate() {
      if (this.orderData?.estimatedDelivery) {
        return this.orderData.estimatedDelivery
      }
      
      // Calculer une date estimée
      const today = new Date()
      const deliveryDate = new Date(today)
      deliveryDate.setDate(deliveryDate.getDate() + 5)
      
      return deliveryDate.toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
      })
    },
    
 formattedAmount() {
    if (this.orderData?.total) {
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 2
      }).format(this.orderData.total)
    } else if (this.orderData?.amount) {
      // Fallback sur 'amount' si 'total' n'existe pas
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 2
      }).format(this.orderData.amount)
    }
    return '0,00 €'
  },
  
    trackingNumber() {
      return this.orderData?.trackingNumber || this.generateTrackingNumber()
    },
    
    deliveryMethod() {
      return this.orderData?.deliveryMethod || 'Livraison standard'
    },
    
    paymentMethod() {
      const methods = {
        'credit_card': 'Carte bancaire',
        'paypal': 'PayPal',
        'carte': 'Carte bancaire',
        'virement': 'Virement bancaire'
      }
      return methods[this.orderData?.paymentMethod] || 'Paiement'
    },
    
    orderId() {
      return this.orderData?.orderId || this.$route.query.orderId || 'CMD-' + Date.now().toString().slice(-6)
    },
    
    summaryRows() {
      return [
        { icon: '📅', label: 'Date de commande', value: this.formattedDate, class: '' },
        { icon: '💰', label: 'Montant total', value: this.formattedAmount, class: 'total-amount' },
        { icon: '💳', label: 'Méthode de paiement', value: this.paymentMethod, class: '' },
        { icon: '✅', label: 'Statut', value: 'Confirmée', class: 'status-badge' }
      ]
    },
    
    priceRows() {
      const subtotal = this.orderData?.subtotal || (this.orderData?.amount || 0) - (this.orderData?.deliveryPrice || 0)
      const delivery = this.orderData?.deliveryPrice || 0
      const total = this.orderData?.amount || 0
      
      return [
        { label: 'Sous-total', value: this.formatPrice(subtotal), class: '' },
        { label: 'Livraison', value: this.formatPrice(delivery), class: '' },
        { label: 'Total', value: this.formatPrice(total), class: 'total' }
      ]
    }
  },
  mounted() {
    this.loadOrderData()
    localStorage.removeItem('monShop_cart')
    localStorage.removeItem('cart')
    
    // Précharger les images
    this.$nextTick(() => {
      setTimeout(() => {
        this.preloadImages()
      }, 500)
    })
    
    // Simulation d'animation de progression
    setTimeout(() => {
      this.timelineSteps[1].active = true
    }, 1000)
  },
  methods: {
    getProductImage(item) {
      // Essayer plusieurs chemins possibles pour l'image
      if (item.img) {
        return `/images/${item.img}`
      }
      
      if (item.image) {
        return `/images/${item.image}`
      }
      
      // Si l'item a un objet product
      if (item.product) {
        if (item.product.img) {
          return `/images/${item.product.img}`
        }
        if (item.product.image) {
          return `/images/${item.product.image}`
        }
      }
      
      // Image par défaut
      return '/images/placeholder.png'
    },
    
    handleImageError(event) {
      console.warn('⚠️ Image non chargée:', event.target.src)
      event.target.src = '/images/placeholder.png'
      event.target.classList.add('error-image')
    },
    async loadOrderData() {
  // 1. Vérifier d'abord dans l'URL
  const query = this.$route.query
  console.log('🔍 Query params:', query)
  
  if (query.orderId || query.orderNumber) {
    const orderId = query.orderId || query.orderNumber
    
    // Vérifier dans localStorage avec plusieurs clés
    const storageKeys = [
      `order_${orderId}`,
      'lastOrder',
      'currentOrder',
      'currentOrderDetails'
    ]
    
    for (const key of storageKeys) {
      const stored = localStorage.getItem(key)
      if (stored) {
        try {
          const parsed = JSON.parse(stored)
          // Vérifier si c'est la bonne commande
          if (parsed.orderId === orderId || parsed.id === orderId) {
            this.orderData = this.formatOrderData(parsed)
            console.log(`✅ Commande chargée depuis ${key}:`, this.orderData)
            return
          }
        } catch (e) {
          console.warn(`⚠️ Erreur parsing ${key}:`, e)
        }
      }
    }
    
    // Si pas trouvé dans localStorage, créer depuis query params
    this.orderData = {
      orderId: orderId,
      orderNumber: query.orderNumber || orderId,
      amount: parseFloat(query.amount) || 0,
      paymentMethod: query.paymentMethod || 'carte',
      deliveryMethod: query.deliveryMethod || 'Livraison standard',
      trackingNumber: query.tracking || this.generateTrackingNumber(),
      date: new Date().toISOString(),
      status: 'confirmed',
      // Si vous avez besoin du total, calculez-le
      total: parseFloat(query.amount) || 0,
      subtotal: parseFloat(query.amount) || 0,
      deliveryPrice: 0
    }
    console.log('✅ Commande créée depuis query params:', this.orderData)
    return
  }
  
  // 2. Fallback: dernier ordre dans localStorage
  const lastOrder = localStorage.getItem('lastOrder')
  if (lastOrder) {
    try {
      this.orderData = this.formatOrderData(JSON.parse(lastOrder))
      console.log('✅ Commande chargée depuis lastOrder:', this.orderData)
      return
    } catch (e) {
      console.error('❌ Erreur parsing lastOrder:', e)
    }
  }
  
  // 3. Données par défaut
  this.orderData = this.getDefaultOrderData()
  console.log('⚠️ Commande par défaut créée:', this.orderData)
},
    
    preloadImages() {
      if (!this.orderData?.items) return
      
      this.orderData.items.forEach(item => {
        const imgUrl = this.getProductImage(item)
        if (imgUrl && !imgUrl.includes('placeholder')) {
          const img = new Image()
          img.src = imgUrl
        }
      })
    },
    
    formatOrderData(order) {
      console.log('📦 Formatage des données de commande:', order)
      
      // Extraire les items correctement
      let items = []
      
      if (order.items && Array.isArray(order.items)) {
        items = order.items
      } else if (order.orderItems && Array.isArray(order.orderItems)) {
        items = order.orderItems
      }
      
      // Formater chaque item
      const formattedItems = items.map(item => {
        const product = item.product || item
        return {
          id: product.id || item.id,
          name: product.name || item.name || 'Produit',
          price: product.price || item.unitPrice || item.price || 0,
          quantity: item.quantity || 1,
          img: product.img || product.image || item.img || item.image,
          image: product.img || product.image || item.img || item.image,
          product: product
        }
      })
      
      return {
        id: order.id,
        orderId: order.orderNumber || order.id,
        orderNumber: order.orderNumber || `CMD-${order.id}`,
        amount: order.totalPrice || order.amount || 0,
        subtotal: order.subtotal || (order.totalPrice || 0) - (order.deliveryPrice || 0),
        deliveryPrice: order.deliveryPrice || order.shippingPrice || 0,
        paymentMethod: order.paymentMethod,
        deliveryMethod: order.shippingMethod || order.deliveryMethod || 'Livraison standard',
        deliveryAddress: order.shippingAddress || order.deliveryAddress || {},
        trackingNumber: order.trackingNumber || this.generateTrackingNumber(),
        estimatedDelivery: order.estimatedDelivery || this.calculateEstimatedDelivery(),
        date: order.createdAt || order.date || new Date().toISOString(),
        items: formattedItems,
        status: order.status || 'confirmed'
      }
    },
getDefaultOrderData() {
  // Récupérer le montant depuis localStorage si disponible
  let amount = 0
  try {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    if (cart.length > 0) {
      amount = cart.reduce((total, item) => {
        const price = parseFloat(item.price) || 0
        const qty = parseInt(item.quantity) || 1
        return total + (price * qty)
      }, 0)
    }
  } catch (e) {
    console.warn('⚠️ Erreur calcul panier:', e)
  }
  
  return {
    orderId: 'CMD-' + Date.now().toString().slice(-6),
    orderNumber: 'CMD-' + Date.now().toString().slice(-6),
    amount: amount,
    total: amount,
    subtotal: amount,
    deliveryPrice: 0,
    paymentMethod: 'credit_card',
    deliveryMethod: 'Livraison standard',
    trackingNumber: this.generateTrackingNumber(),
    estimatedDelivery: this.calculateEstimatedDelivery(),
    items: JSON.parse(localStorage.getItem('cart') || '[]'),
    date: new Date().toISOString()
  }
},
    
    calculateEstimatedDelivery() {
      const today = new Date()
      const deliveryDate = new Date(today)
      deliveryDate.setDate(deliveryDate.getDate() + 5)
      
      return deliveryDate.toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
      })
    },
    
    generateTrackingNumber() {
      const date = new Date()
      const year = date.getFullYear().toString().substring(2)
      const month = (date.getMonth() + 1).toString().padStart(2, '0')
      const day = date.getDate().toString().padStart(2, '0')
      const random = Math.random().toString(36).substring(2, 8).toUpperCase()
      return `TRK-${year}${month}${day}-${random}`
    },
    
    copyTrackingNumber() {
      const trackingNumber = this.trackingNumber
      navigator.clipboard.writeText(trackingNumber)
        .then(() => {
          this.isTrackingCopied = true
          setTimeout(() => {
            this.isTrackingCopied = false
          }, 2000)
        })
        .catch(err => {
          console.error('Erreur lors de la copie:', err)
          // Fallback pour les anciens navigateurs
          const textArea = document.createElement('textarea')
          textArea.value = trackingNumber
          document.body.appendChild(textArea)
          textArea.select()
          document.execCommand('copy')
          document.body.removeChild(textArea)
          this.isTrackingCopied = true
          setTimeout(() => {
            this.isTrackingCopied = false
          }, 2000)
        })
    },
    
    trackPackage() {
      window.open(`https://monshop.com/track/${this.trackingNumber}`, '_blank')
    },
    
    downloadInvoice() {
      const invoiceContent = this.generateInvoice()
      const blob = new Blob([invoiceContent], { type: 'text/plain;charset=utf-8' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `facture-${this.orderId}.txt`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    },
    
    generateInvoice() {
      return `
FACTURE - MONSHOP
================================

Numéro de commande: ${this.orderId}
Date de commande: ${this.formattedDate}
Statut: Confirmée

INFORMATIONS CLIENT
--------------------------------
${this.user ? `${this.user.nom || ''} ${this.user.prenom || ''}`.trim() || this.user.name : 'Client'}
${this.user?.email || ''}
${this.user?.telephone || ''}

DÉTAILS DE LA COMMANDE
--------------------------------
Montant total: ${this.formattedAmount}
Méthode de paiement: ${this.paymentMethod}
Mode de livraison: ${this.deliveryMethod}

INFORMATIONS DE LIVRAISON
--------------------------------
Numéro de suivi: ${this.trackingNumber}
Livraison estimée: ${this.estimatedDeliveryDate}
${this.orderData?.deliveryAddress ? 
  `Adresse de livraison: ${this.orderData.deliveryAddress.street || ''}, ${this.orderData.deliveryAddress.postalCode || ''} ${this.orderData.deliveryAddress.city || ''}` : 
  'Adresse: Non spécifiée'}

ARTICLES COMMANDÉS
--------------------------------
${this.orderData?.items ? this.orderData.items.map(item => 
  `${item.name || 'Produit'} - Qté: ${item.quantity || 1} - Prix: ${this.formatPrice(item.price || 0)}`
).join('\n') : 'Aucun détail disponible'}

DÉTAIL DES PRIX
--------------------------------
Sous-total: ${this.formatPrice(this.orderData?.subtotal || 0)}
Frais de livraison: ${this.formatPrice(this.orderData?.deliveryPrice || 0)}
Total: ${this.formattedAmount}

MENTIONS
--------------------------------
TVA non applicable, article 293 B du CGI
Merci pour votre confiance !

© MonShop ${new Date().getFullYear()}
      `
    },
    
    formatPrice(price) {
      const num = parseFloat(price)
      if (isNaN(num)) return '0,00 €'
      
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 2
      }).format(num)
    },
    
    particleStyle(n) {
      const size = Math.random() * 4 + 2
      const posX = Math.random() * 100
      const delay = Math.random() * 5
      const duration = Math.random() * 10 + 10
      
      return {
        width: `${size}px`,
        height: `${size}px`,
        left: `${posX}%`,
        animationDelay: `${delay}s`,
        animationDuration: `${duration}s`,
        backgroundColor: `rgba(16, 185, 129, ${Math.random() * 0.3 + 0.1})`
      }
    }
  }
}
</script>

<style scoped>
/* Styles globaux améliorés */
.order-success-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  position: relative;
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #f0f9ff 50%, #e6f7ff 100%);
  overflow-x: hidden;
}

/* Animation de fond avec particules */
.background-particles {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}

.particle {
  position: absolute;
  background: rgba(16, 185, 129, 0.15);
  border-radius: 50%;
  animation: float-particle linear infinite;
}

@keyframes float-particle {
  0% {
    transform: translateY(100vh) rotate(0deg);
    opacity: 0;
  }
  10% {
    opacity: 0.6;
  }
  90% {
    opacity: 0.6;
  }
  100% {
    transform: translateY(-100px) rotate(360deg);
    opacity: 0;
  }
}

/* Header amélioré */
.success-header {
  text-align: center;
  margin-bottom: 4rem;
  position: relative;
  z-index: 1;
}

.success-animation {
  position: relative;
  width: 140px;
  height: 140px;
  margin: 0 auto 2rem;
}

.pulse-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border: 2px solid rgba(16, 185, 129, 0.3);
  border-radius: 50%;
  animation: pulse-ring 2s ease-out infinite;
}

.pulse-ring.ring-1 {
  width: 120px;
  height: 120px;
  animation-delay: 0s;
}

.pulse-ring.ring-2 {
  width: 150px;
  height: 150px;
  animation-delay: 0.5s;
}

.pulse-ring.ring-3 {
  width: 180px;
  height: 180px;
  animation-delay: 1s;
}

@keyframes pulse-ring {
  0% {
    transform: translate(-50%, -50%) scale(0.8);
    opacity: 0.8;
  }
  100% {
    transform: translate(-50%, -50%) scale(1.2);
    opacity: 0;
  }
}

.success-icon {
  position: relative;
  z-index: 2;
  animation: icon-float 3s ease-in-out infinite;
}

@keyframes icon-float {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-10px) rotate(5deg);
  }
}

.success-title {
  font-size: 3rem;
  font-weight: 800;
  margin-bottom: 1rem;
  position: relative;
  display: inline-block;
}

.title-text {
  background: linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  display: inline-block;
  animation: text-glow 2s ease-in-out infinite alternate;
}

@keyframes text-glow {
  0% {
    filter: drop-shadow(0 0 5px rgba(16, 185, 129, 0.3));
  }
  100% {
    filter: drop-shadow(0 0 15px rgba(16, 185, 129, 0.6));
  }
}

.title-underline {
  position: absolute;
  bottom: -5px;
  left: 10%;
  width: 80%;
  height: 4px;
  background: linear-gradient(90deg, transparent, #10b981, transparent);
  border-radius: 2px;
}

.success-subtitle {
  font-size: 1.2rem;
  color: #4b5563;
  margin-bottom: 2rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.subtitle-icon {
  display: inline-block;
  animation: bounce 2s infinite;
  margin-right: 0.5rem;
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}

.order-number-display {
  display: inline-block;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.1));
  padding: 0.2rem;
  border-radius: 16px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(16, 185, 129, 0.2);
}

.order-number-content {
  background: white;
  padding: 1rem 2rem;
  border-radius: 14px;
  position: relative;
  overflow: hidden;
}

.order-number-label {
  display: block;
  font-size: 0.9rem;
  color: #6b7280;
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.order-number-value {
  font-family: 'Courier New', monospace;
  font-size: 1.3rem;
  font-weight: 700;
  color: #1f2937;
  letter-spacing: 1px;
}

.order-number-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.decoration-dot {
  position: absolute;
  width: 6px;
  height: 6px;
  background: #10b981;
  border-radius: 50%;
  top: 50%;
  transform: translateY(-50%);
}

.decoration-dot:first-child {
  left: 10px;
}

.decoration-dot:last-child {
  right: 10px;
}

.decoration-line {
  position: absolute;
  top: 50%;
  left: 20px;
  right: 20px;
  height: 1px;
  background: linear-gradient(90deg, transparent, #10b981, transparent);
  transform: translateY(-50%);
}

/* Cartes flottantes */
.floating-card {
  background: white;
  border-radius: 24px;
  padding: 2.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08),
              0 8px 16px rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.3);
  position: relative;
  overflow: hidden;
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1),
              box-shadow 0.3s ease;
}

.floating-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.12),
              0 12px 24px rgba(0, 0, 0, 0.06);
}

.card-header-animated {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  position: relative;
}

.card-header-animated::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg, #10b981, transparent);
}

.header-icon {
  font-size: 2rem;
  animation: icon-spin 10s linear infinite;
}

@keyframes icon-spin {
  0% {
    transform: rotate(0deg) scale(1);
  }
  50% {
    transform: rotate(180deg) scale(1.1);
  }
  100% {
    transform: rotate(360deg) scale(1);
  }
}

.card-main-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
  background: linear-gradient(135deg, #1f2937, #374151);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Sections de résumé */
.summary-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  position: relative;
  border-bottom: 1px solid rgba(229, 231, 235, 0.5);
}

.summary-row:last-child {
  border-bottom: none;
}

.row-decoration {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 0;
  background: #10b981;
  border-radius: 2px;
  transition: height 0.3s ease;
}

.summary-row:hover .row-decoration {
  height: 80%;
}

.summary-label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 500;
  color: #6b7280;
  font-size: 1rem;
}

.label-icon {
  font-size: 1.2rem;
  display: inline-block;
  animation: icon-bounce 2s infinite;
}

@keyframes icon-bounce {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
}

.summary-value {
  font-weight: 600;
  color: #1f2937;
  font-size: 1.1rem;
}

.summary-value.total-amount {
  font-size: 1.4rem;
  font-weight: 700;
  color: #10b981;
  text-shadow: 0 2px 4px rgba(16, 185, 129, 0.2);
}

.summary-value.status-badge {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  padding: 0.5rem 1.5rem;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.9rem;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

/* Séparateur animé */
.animated-divider {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 2rem 0;
}

.divider-line {
  flex: 1;
  height: 2px;
  background: linear-gradient(90deg, transparent, #e5e7eb, transparent);
}

.divider-icon {
  font-size: 1.5rem;
  animation: delivery-move 3s ease-in-out infinite;
}

@keyframes delivery-move {
  0%, 100% {
    transform: translateX(0);
  }
  50% {
    transform: translateX(10px);
  }
}

/* Section livraison améliorée */
.section-title {
  font-size: 1.4rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 1.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.title-icon {
  font-size: 1.6rem;
  display: inline-block;
  animation: title-icon-pulse 2s ease-in-out infinite;
}

@keyframes title-icon-pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

.delivery-info-card {
  background: linear-gradient(135deg, #f0f9ff, #e6f7ff);
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  border: 1px solid #bfdbfe;
  position: relative;
  overflow: hidden;
}

.delivery-icon-animated {
  position: relative;
}

.icon-circle {
  width: 70px;
  height: 70px;
  background: linear-gradient(135deg, #3b82f6, #6366f1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  color: white;
  position: relative;
  z-index: 1;
  animation: icon-rotate 20s linear infinite;
}

.icon-pulse {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80px;
  height: 80px;
  border: 2px solid rgba(59, 130, 246, 0.3);
  border-radius: 50%;
  animation: icon-pulse-ring 2s ease-out infinite;
}

@keyframes icon-rotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes icon-pulse-ring {
  0% {
    transform: translate(-50%, -50%) scale(0.8);
    opacity: 0.8;
  }
  100% {
    transform: translate(-50%, -50%) scale(1.2);
    opacity: 0;
  }
}

.delivery-details h4 {
  font-size: 1.2rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
}

.delivery-estimate {
  color: #6b7280;
  font-size: 1rem;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.estimate-icon {
  font-size: 1.2rem;
}

/* Carte de suivi améliorée */
.tracking-card {
  background: #f8fafc;
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  border: 1px solid #e5e7eb;
  position: relative;
  overflow: hidden;
}

.tracking-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #10b981, #3b82f6);
}

.tracking-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.copy-btn-animated {
  position: relative;
  background: linear-gradient(135deg, #3b82f6, #6366f1);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.copy-btn-animated:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(59, 130, 246, 0.4);
}

.copy-btn-animated.copied {
  background: linear-gradient(135deg, #10b981, #059669);
}

.btn-content {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-wave {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(0);
  width: 100px;
  height: 100px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  transition: transform 0.5s ease;
}

.copy-btn-animated:active .btn-wave {
  transform: translate(-50%, -50%) scale(1);
}

.tracking-number-display {
  position: relative;
}

.tracking-number-bg {
  background: white;
  padding: 1.25rem;
  border-radius: 12px;
  border: 2px solid #e5e7eb;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.tracking-number {
  font-family: 'Courier New', monospace;
  font-size: 1.2rem;
  font-weight: 700;
  color: #1f2937;
  letter-spacing: 1px;
  position: relative;
  z-index: 1;
}

.tracking-number-shine {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  animation: shine 3s infinite;
}

@keyframes shine {
  0% {
    left: -100%;
  }
  100% {
    left: 100%;
  }
}

/* Bouton de suivi animé */
.track-btn-animated {
  width: 100%;
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  border: none;
  padding: 1.25rem;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  transition: all 0.3s ease;
}

.track-btn-animated:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 24px rgba(16, 185, 129, 0.4);
}

.track-btn-animated:active {
  transform: translateY(-1px);
}

.btn-wave-effect {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transform: translateX(-100%);
}

.track-btn-animated:hover .btn-wave-effect {
  animation: wave 1s ease;
}

@keyframes wave {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

/* Articles commandés */
.order-items-card {
  animation: slide-up 0.6s ease;
}

@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

.order-item {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1.25rem;
  background: #f8fafc;
  border-radius: 16px;
  border: 1px solid #e5e7eb;
  transition: all 0.3s ease;
}

.order-item:hover {
  transform: translateX(10px);
  background: white;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

/* CORRECTION DES IMAGES */
.item-image-animated {
  position: relative;
  width: 80px;
  height: 80px;
  flex-shrink: 0;
}

.image-circle {
  width: 100%;
  height: 100%;
  border-radius: 12px;
  overflow: hidden;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 1;
}

/* IMPORTANT: Remplacement de .image-glow par une version plus subtile */
.product-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 12px;
  transition: transform 0.3s ease;
}

.order-item:hover .product-image {
  transform: scale(1.05);
}

/* Retirer ou corriger .image-glow qui cause la superposition */
.image-glow {
  display: none; /* Désactivé car cause des superpositions */
}

/* Nouveau style pour l'effet de brillance sans superposition */
.image-circle::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 12px;
  background: linear-gradient(135deg, transparent, rgba(139, 92, 246, 0.1));
  pointer-events: none;
}

.error-image {
  opacity: 0.6;
  filter: grayscale(100%);
}

.item-details {
  flex: 1;
}

.item-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 0.75rem 0;
}

.item-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.item-quantity, .item-price {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.95rem;
}

.item-quantity {
  color: #6b7280;
}

.item-price {
  font-weight: 600;
  color: #3b82f6;
}

/* Résumé des prix */
.price-summary {
  padding-top: 1.5rem;
  border-top: 2px solid #f3f4f6;
}

.price-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid #f9fafb;
}

.price-row:last-child {
  border-bottom: none;
}

.price-row.total {
  padding-top: 1rem;
  border-top: 2px solid #e5e7eb;
  margin-top: 0.5rem;
  font-weight: 700;
}

.price-label {
  font-size: 1rem;
  color: #6b7280;
}

.price-value {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1f2937;
}

.price-row.total .price-value {
  font-size: 1.3rem;
  color: #10b981;
}

/* Section actions */
.actions-section {
  margin-bottom: 3rem;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

.action-card {
  background: white;
  border-radius: 20px;
  padding: 2rem;
  text-decoration: none;
  color: inherit;
  border: 1px solid rgba(255, 255, 255, 0.3);
  cursor: pointer;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.card-glow {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at 50% 0%, rgba(255,255,255,0.8), transparent 70%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.action-card:hover .card-glow {
  opacity: 1;
}

.card-hover-1:hover {
  background: linear-gradient(135deg, #f0f9ff, #e6f7ff);
  border-color: #bfdbfe;
  transform: translateY(-10px) scale(1.02);
  box-shadow: 0 20px 40px rgba(59, 130, 246, 0.15);
}

.card-hover-2:hover {
  background: linear-gradient(135deg, #f0fdf4, #dcfce7);
  border-color: #bbf7d0;
  transform: translateY(-10px) scale(1.02);
  box-shadow: 0 20px 40px rgba(34, 197, 94, 0.15);
}

.card-hover-3:hover {
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
  border-color: #e5e7eb;
  transform: translateY(-10px) scale(1.02);
  box-shadow: 0 20px 40px rgba(107, 114, 128, 0.15);
}

.action-icon {
  font-size: 2.5rem;
  transition: transform 0.3s ease;
}

.action-card:hover .action-icon {
  transform: scale(1.2) rotate(10deg);
}

.action-content {
  flex: 1;
}

.action-content h4 {
  font-size: 1.2rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
  transition: color 0.3s ease;
}

.action-card:hover .action-content h4 {
  color: #3b82f6;
}

.action-content p {
  color: #6b7280;
  font-size: 0.95rem;
  margin: 0;
  line-height: 1.4;
}

.action-arrow {
  font-size: 1.5rem;
  opacity: 0;
  transform: translateX(-10px);
  transition: all 0.3s ease;
}

.action-card:hover .action-arrow {
  opacity: 1;
  transform: translateX(0);
}

/* Grille d'informations supplémentaires */
.additional-info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.info-card {
  background: white;
  border-radius: 20px;
  padding: 2rem;
  display: flex;
  align-items: flex-start;
  gap: 1.5rem;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.card-hover-4:hover {
  background: linear-gradient(135deg, #fef3c7, #fef3c7);
  border-color: #fde68a;
  transform: translateY(-5px);
  box-shadow: 0 15px 30px rgba(245, 158, 11, 0.1);
}

.card-hover-5:hover {
  background: linear-gradient(135deg, #fce7f3, #fce7f3);
  border-color: #fbcfe8;
  transform: translateY(-5px);
  box-shadow: 0 15px 30px rgba(236, 72, 153, 0.1);
}

.info-icon-animated {
  position: relative;
}

.icon-wrapper {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #f59e0b, #d97706);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
  color: white;
  animation: icon-float 3s ease-in-out infinite;
}

.card-hover-5 .icon-wrapper {
  background: linear-gradient(135deg, #ec4899, #db2777);
}

.info-content h4 {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 0.75rem 0;
}

.info-content p {
  color: #6b7280;
  font-size: 0.95rem;
  margin: 0;
  line-height: 1.4;
}

/* Progression timeline */
.progress-section {
  background: white;
  border-radius: 24px;
  padding: 2.5rem;
  margin-bottom: 3rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
}

.progress-timeline {
  position: relative;
  padding: 2rem 0;
}

.timeline-line {
  position: absolute;
  left: 40px;
  top: 0;
  bottom: 0;
  width: 3px;
  background: linear-gradient(to bottom, #10b981, #3b82f6, #8b5cf6);
}

.timeline-step {
  position: relative;
  margin-bottom: 3rem;
  padding-left: 80px;
  opacity: 0.5;
  transition: all 0.5s ease;
}

.timeline-step.active {
  opacity: 1;
}

.timeline-step:last-child {
  margin-bottom: 0;
}

.step-indicator {
  position: absolute;
  left: 0;
  top: 0;
}

.step-circle {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #e5e7eb, #d1d5db);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 600;
  color: #9ca3af;
  position: relative;
  z-index: 1;
  transition: all 0.5s ease;
}

.timeline-step.active .step-circle {
  background: linear-gradient(135deg, #3b82f6, #6366f1);
  color: white;
  box-shadow: 0 10px 25px rgba(59, 130, 246, 0.3);
}

.step-check {
  display: none;
}

.timeline-step.active .step-number {
  display: none;
}

.timeline-step.active .step-check {
  display: block;
  animation: check-pop 0.5s ease;
}

@keyframes check-pop {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}

.step-pulse {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100px;
  height: 100px;
  border: 2px solid rgba(59, 130, 246, 0.3);
  border-radius: 50%;
  animation: step-pulse-ring 2s ease-out infinite;
}

@keyframes step-pulse-ring {
  0% {
    transform: translate(-50%, -50%) scale(0.8);
    opacity: 0.8;
  }
  100% {
    transform: translate(-50%, -50%) scale(1.2);
    opacity: 0;
  }
}

.step-content {
  padding: 1rem 0;
}

.step-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
}

.step-description {
  color: #6b7280;
  font-size: 1rem;
  margin: 0;
}

/* Message de célébration */
.celebration-message {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(59, 130, 246, 0.1));
  border-radius: 20px;
  padding: 2rem;
  text-align: center;
  margin-top: 3rem;
  position: relative;
  overflow: hidden;
}

.celebration-message::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #10b981, #3b82f6, #8b5cf6);
}

.message-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.message-icon {
  font-size: 2.5rem;
  animation: celebrate 1s ease-in-out infinite;
}

@keyframes celebrate {
  0%, 100% {
    transform: rotate(0deg) scale(1);
  }
  25% {
    transform: rotate(-10deg) scale(1.1);
  }
  75% {
    transform: rotate(10deg) scale(1.1);
  }
}

.message-content p {
  font-size: 1.1rem;
  color: #1f2937;
  font-weight: 500;
  margin: 0;
}

/* Animations de transition */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.5s ease;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(30px);
}

/* Responsive */
@media (max-width: 1024px) {
  .order-success-page {
    padding: 1.5rem;
  }
  
  .success-title {
    font-size: 2.5rem;
  }
  
  .actions-grid,
  .additional-info-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .success-title {
    font-size: 2rem;
  }
  
  .success-subtitle {
    font-size: 1rem;
    padding: 0.75rem;
  }
  
  .floating-card {
    padding: 1.5rem;
  }
  
  .order-number-content {
    padding: 0.75rem 1.5rem;
  }
  
  .order-number-value {
    font-size: 1.1rem;
  }
  
  .summary-row,
  .price-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .timeline-step {
    padding-left: 60px;
  }
  
  .step-circle {
    width: 60px;
    height: 60px;
  }
  
  .timeline-line {
    left: 30px;
  }
  
  .order-item {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
    padding: 1rem;
  }
  
  .item-image-animated {
    width: 120px;
    height: 120px;
  }
  
  .item-meta {
    flex-direction: column;
    gap: 0.5rem;
  }
}

@media (max-width: 480px) {
  .success-header {
    margin-bottom: 2rem;
  }
  
  .success-animation {
    width: 100px;
    height: 100px;
  }
  
  .pulse-ring.ring-1 {
    width: 80px;
    height: 80px;
  }
  
  .pulse-ring.ring-2 {
    width: 100px;
    height: 100px;
  }
  
  .pulse-ring.ring-3 {
    width: 120px;
    height: 120px;
  }
  
  .success-title {
    font-size: 1.8rem;
  }
  
  .tracking-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .copy-btn-animated {
    align-self: stretch;
    justify-content: center;
  }
  
  .order-success-page {
    padding: 1rem;
  }
  
  .floating-card {
    padding: 1rem;
  }
  
  .actions-grid {
    grid-template-columns: 1fr;
  }
  
  .action-card {
    flex-direction: column;
    text-align: center;
  }
}

@media print {
  .order-success-page {
    background: white !important;
    box-shadow: none !important;
    padding: 0 !important;
  }
  
  .success-animation,
  .background-particles,
  .pulse-ring,
  .card-glow,
  .action-arrow,
  .btn-wave,
  .tracking-number-shine,
  .image-glow,
  .icon-pulse,
  .step-pulse,
  .message-icon {
    display: none !important;
  }
  
  .floating-card {
    box-shadow: none !important;
    border: 1px solid #ddd !important;
    margin-bottom: 1rem !important;
  }
}
</style>
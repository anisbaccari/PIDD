<template>
  <div class="checkout-page">
    <!-- En-tête minimaliste -->
    <div class="checkout-header">
      <div class="header-content">
        <router-link to="/" class="brand">
          <span class="brand-icon">🛍️</span>
          <span class="brand-name">MonShop</span>
        </router-link>
        <div class="header-info">
          <div class="secure-badge">
            <span class="secure-icon">🔒</span>
            <span>Paiement sécurisé</span>
          </div>
        </div>
      </div> 
    </div>

    <!-- Barre de progression -->
    <div class="progress-container">
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: progressWidth }"></div>
      </div>
      <div class="progress-steps">
        <div v-for="step in steps" :key="step.id" :class="['progress-step', { active: currentStep >= step.id, current: currentStep === step.id }]">
          <div class="step-indicator">
            <div class="step-circle">
              <span v-if="currentStep > step.id">✓</span>
              <span v-else>{{ step.id }}</span>
            </div>
          </div>
          <div class="step-info">
            <span class="step-number">Étape {{ step.id }}</span>
            <span class="step-title">{{ step.title }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="checkout-layout">
      <!-- Colonne principale -->
      <div class="checkout-main">
        <!-- Étape 1 : Livraison -->
        <div v-if="currentStep === 1" class="step-container">
          <div class="step-header">
            <h2 class="step-title">Livraison</h2>
            <p class="step-subtitle">Où souhaitez-vous recevoir votre commande ?</p>
          </div>
          
          <!-- Section adresse -->
          <div class="section-card">
            <div class="section-header">
              <div class="section-icon">📍</div>
              <h3>Adresse de livraison</h3>
            </div>
            <div class="address-form">
              <div class="form-grid">
                <div class="form-group">
                  <label class="form-label">Nom complet</label>
                  <input 
                    v-model="deliveryAddress.fullName" 
                    type="text" 
                    placeholder="Hermann Tchuente"
                    class="form-input"
                    @focus="highlightField"
                  >
                </div>
                <div class="form-group">
                  <label class="form-label">Téléphone</label>
                  <input 
                    v-model="deliveryAddress.phone" 
                    type="tel" 
                    placeholder="06 12 34 56 78"
                    class="form-input"
                    @focus="highlightField"
                  >
                </div>
                <div class="form-group full-width">
                  <label class="form-label">Adresse</label>
                  <input 
                    v-model="deliveryAddress.street" 
                    type="text" 
                    placeholder="123 Rue de la Paix"
                    class="form-input"
                    @focus="highlightField"
                  >
                </div>
                <div class="form-group">
                  <label class="form-label">Code postal</label>
                  <input 
                    v-model="deliveryAddress.postalCode" 
                    type="text" 
                    placeholder="1000"
                    class="form-input"
                    @focus="highlightField"
                  >
                </div>
                <div class="form-group">
                  <label class="form-label">Ville</label>
                  <input 
                    v-model="deliveryAddress.city" 
                    type="text" 
                    placeholder="Bruxelles"
                    class="form-input"
                    @focus="highlightField"
                  >
                </div>
                <div class="form-group full-width">
                  <label class="form-label">Pays</label>
                  <select v-model="deliveryAddress.country" class="form-input" @focus="highlightField">
                    <option value="">Sélectionner un pays</option>
                    <option value="BE">Belgique</option>
                    <option value="FR">France</option>
                    <option value="CH">Suisse</option>
                    <option value="LU">Luxembourg</option>
                    <option value="AU">Autres</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <!-- Options de livraison -->
          <div class="section-card">
            <div class="section-header">
              <div class="section-icon">🚚</div>
              <h3>Mode de livraison</h3>
            </div>
            <div class="delivery-grid">
              <div 
                v-for="option in deliveryOptions"
                :key="option.id"
                :class="['delivery-card', { selected: selectedDelivery === option.id, premium: option.price > 0 && option.id !== 'gratuite' }]"
                @click="selectDeliveryOption(option)"
              >
                <div class="delivery-icon">{{ option.icon }}</div>
                <div class="delivery-content">
                  <div class="delivery-header">
                    <h4>{{ option.name }}</h4>
                    <div class="delivery-price">
                      {{ option.price === 0 ? 'Gratuit' : formatPrice(option.price) }}
                    </div>
                  </div>
                  <p class="delivery-description">{{ option.description }}</p>
                  <div class="delivery-meta">
                    <span class="delivery-time">{{ option.deliveryTime }}</span>
                    <span class="delivery-carrier">{{ option.carrier }}</span>
                  </div>
                </div>
                <div class="delivery-selector">
                  <div :class="['selector-dot', { selected: selectedDelivery === option.id }]"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Étape 2 : Paiement -->
        <div v-else-if="currentStep === 2" class="step-container">
          <div class="step-header">
            <h2 class="step-title">Paiement</h2>
            <p class="step-subtitle">Comment souhaitez-vous payer ?</p>
          </div>
          
          <!-- Récapitulatif -->
          <div class="summary-card">
            <div class="summary-header">
              <div class="summary-icon">📦</div>
              <h3>Votre livraison</h3>
            </div>
            <div class="summary-content">
              <div class="summary-item">
                <span class="summary-label">Adresse</span>
                <span class="summary-value">{{ deliveryAddress.street }}, {{ deliveryAddress.postalCode }} {{ deliveryAddress.city }}</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">Mode</span>
                <span class="summary-value">{{ selectedDeliveryOption.name }}</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">Délai</span>
                <span class="summary-value">{{ selectedDeliveryOption.deliveryTime }}</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">Transporteur</span>
                <span class="summary-value">{{ selectedDeliveryOption.carrier }}</span>
              </div>
            </div>
          </div>

          <!-- Méthodes de paiement -->
          <div class="section-card">
            <div class="section-header">
              <div class="section-icon">💳</div>
              <h3>Moyen de paiement</h3>
            </div>
            <PaymentMethod 
              :amount="orderTotal"
              @payment-completed="handlePaymentCompleted"
              @payment-error="handlePaymentError"
            />
          </div>
        </div>

        <!-- Étape 3 : Confirmation -->
        <div v-else-if="currentStep === 3" class="step-container confirmation-container">
          <div class="success-animation">
            <div class="success-circle">
              <div class="checkmark">✓</div>
            </div>
          </div>
          
          <div class="confirmation-header">
            <h1 class="confirmation-title">Commande confirmée !</h1>
            <p class="confirmation-subtitle">
              Merci {{ deliveryAddress.fullName.split(' ')[0] || '' }}, votre commande a été enregistrée.
            </p>
          </div>
          
          <div class="order-card">
            <div class="order-header">
              <h3>Résumé de la commande</h3>
              <span class="order-badge">#{{ orderDetails?.id || generateOrderId() }}</span>
            </div>
            
            <div class="order-details">
              <div class="detail-row">
                <span class="detail-label">Numéro de commande</span>
                <span class="detail-value">{{ orderDetails?.id || generateOrderId() }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Date</span>
                <span class="detail-value">{{ new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Montant total</span>
                <span class="detail-value price">{{ formatPrice(orderTotal) }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Mode de livraison</span>
                <span class="detail-value">{{ selectedDeliveryOption.name }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Livraison estimée</span>
                <span class="detail-value">{{ calculateEstimatedDelivery() }}</span>
              </div>
            </div>
            
            <div class="order-timeline">
              <div class="timeline-item active">
                <div class="timeline-dot"></div>
                <div class="timeline-content">
                  <h4>Commande confirmée</h4>
                  <p>Votre commande est enregistrée</p>
                </div>
              </div>
              <div class="timeline-item">
                <div class="timeline-dot"></div>
                <div class="timeline-content">
                  <h4>Préparation</h4>
                  <p>Notre équipe prépare votre colis</p>
                </div>
              </div>
              <div class="timeline-item">
                <div class="timeline-dot"></div>
                <div class="timeline-content">
                  <h4>Expédition</h4>
                  <p>Votre colis est envoyé</p>
                </div>
              </div>
              <div class="timeline-item">
                <div class="timeline-dot"></div>
                <div class="timeline-content">
                  <h4>Livraison</h4>
                  <p>Votre colis est livré</p>
                </div>
              </div>
            </div>
          </div>
          
          <div class="confirmation-actions">
            <button 
              class="btn btn-primary btn-lg btn-confirm"
              @click="completeOrder"
              :disabled="isProcessing"
            >
              <span v-if="isProcessing" class="btn-loading">
                <span class="spinner"></span>
                Traitement...
              </span>
              <span v-else>
                <span class="btn-icon">🎉</span>
                Voir le détail de ma commande
              </span>
             </button>
            
            <button 
              class="btn btn-outline"
              @click="currentStep = 1"
              :disabled="isProcessing"
            >
              <span class="btn-icon">↶</span>
              Modifier la commande
            </button>
          </div>
          
          <div class="confirmation-footer">
            <div class="info-box">
              <div class="info-icon">📧</div>
              <div class="info-content">
                <h4>Email de confirmation</h4>
                <p>Un récapitulatif détaillé vous a été envoyé par email.</p>
              </div>
            </div>
            <div class="info-box">
              <div class="info-icon">📱</div>
              <div class="info-content">
                <h4>Suivi en temps réel</h4>
                <p>Suivez votre commande dans votre espace client.</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Navigation -->
        <div v-if="currentStep < 3" class="step-navigation">
          <button 
            v-if="currentStep > 1"
            class="btn btn-outline"
            @click="currentStep--"
          >
            <span class="btn-icon">←</span>
            Retour
          </button>
          
          <button 
            v-if="currentStep === 1"
            class="btn btn-primary btn-next"
            @click="goToPaymentStep"
            :disabled="!isDeliveryStepValid"
          >
            Continuer vers le paiement
            <span class="btn-icon">→</span>
          </button>
        </div>
      </div>

      <!-- Panneau latéral -->
      <div class="checkout-sidebar">
        <div class="sidebar-card">
          <h3 class="sidebar-title">Récapitulatif</h3>
          
          <div class="cart-items">
            <div v-for="(item, index) in cartItems" :key="index" class="cart-item">
              <div class="item-image">
                <span v-if="item.image">🖼️</span>
                <span v-else>📦</span>
              </div>
              <div class="item-details">
                <h4 class="item-name">{{ item.name || 'Produit' }}</h4>
                <div class="item-meta">
                  <span class="item-quantity">Quantité: {{ item.quantity || 1 }}</span>
                  <span class="item-price">{{ formatPrice(item.price || 0) }}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div class="price-breakdown">
            <div class="price-row">
              <span>Sous-total</span>
              <span>{{ formatPrice(subtotal) }}</span>
            </div>
            <div class="price-row">
              <span>Livraison</span>
              <span :class="{ 'free': selectedDeliveryOption.price === 0 }">
                {{ selectedDeliveryOption.price === 0 ? 'Gratuit' : formatPrice(selectedDeliveryOption.price) }}
              </span>
            </div>
            <div class="price-row total">
              <span>Total</span>
              <span class="total-price">{{ formatPrice(orderTotal) }}</span>
            </div>
          </div>
          
          <div class="sidebar-footer">
            <div class="protection-badge">
              <span class="protection-icon">🛡️</span>
              <span>Paiement 100% sécurisé</span>
            </div>
            <div class="guarantee-badge">
              <span class="guarantee-icon">✅</span>
              <span>Garantie satisfait ou remboursé</span>
            </div>
          </div>
        </div>
        
        <div class="help-card">
          <div class="help-icon">❓</div>
          <div class="help-content">
            <h4>Besoin d'aide ?</h4>
            <p>Notre équipe est là pour vous accompagner.</p>
            <a href="mailto:support@monshop.com" class="help-link">
              <span class="help-link-icon">✉️</span>
              Nous contacter
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import PaymentMethod from '@/components/PaymentMethod.vue'

export default {
  name: 'CheckoutPage',
  components: {
    PaymentMethod
  },
  props: {
    user: {
      type: Object,
      default: () => null
    },
    cartItems: {
      type: Array,
      default: () => []
    },
    getCartTotal: {
      type: Function,
      default: () => 0
    },
    clearCart: {
      type: Function,
      default: () => {}
    }
  },
  data() {
    return {
      currentStep: 1,
      steps: [
        { id: 1, title: 'Livraison' },
        { id: 2, title: 'Paiement' },
        { id: 3, title: 'Confirmation' }
      ],
      deliveryAddress: {
        fullName: '',
        phone: '',
        street: '',
        postalCode: '',
        city: '',
        country: 'FR'
      },
      selectedDelivery: 'standard',
      deliveryOptions: [
        {
          id: 'standard',
          name: 'Livraison standard',
          description: 'Colissimo - Suivi disponible',
          price: 5.99,
          deliveryTime: '3-5 jours ouvrés',
          icon: '📦',
          carrier: 'Colissimo'
        },
        {
          id: 'express',
          name: 'Livraison express',
          description: 'Chronopost - Livraison prioritaire',
          price: 12.99,
          deliveryTime: '24-48h',
          icon: '🚀',
          carrier: 'Chronopost'
        },
        {
          id: 'point_relais',
          name: 'Point relais',
          description: 'Retrait en magasin partenaire',
          price: 0,
          deliveryTime: '2-4 jours',
          icon: '🏪',
          carrier: 'Mondial Relay'
        },
        {
          id: 'gratuite',
          name: 'Livraison gratuite',
          description: 'À partir de 50€ d\'achat',
          price: 0,
          deliveryTime: '4-7 jours ouvrés',
          icon: '🎁',
          carrier: 'Colissimo',
          minAmount: 50
        }
      ],
      orderDetails: null,
      isProcessing: false,
      hasCompletedPayment: false
    }
  },
  computed: {
    selectedDeliveryOption() {
      return this.deliveryOptions.find(opt => opt.id === this.selectedDelivery) || this.deliveryOptions[0]
    },
    
    subtotal() {
      return this.getCartTotal ? this.getCartTotal() : 0
    },
    
    orderTotal() {
      return this.subtotal + this.selectedDeliveryOption.price
    },
    
    isDeliveryStepValid() {
      return (
        this.deliveryAddress.fullName.trim() &&
        this.deliveryAddress.phone.trim() &&
        this.deliveryAddress.street.trim() &&
        this.deliveryAddress.postalCode.trim() &&
        this.deliveryAddress.city.trim() &&
        this.deliveryAddress.country &&
        this.selectedDelivery
      )
    },
    
    progressWidth() {
      return `${((this.currentStep - 1) / (this.steps.length - 1)) * 100}%`
    }
  },
  mounted() {
    console.log('🛒 CheckoutPage monté')
    
    // Initialiser avec les données utilisateur si disponibles
    if (this.user) {
      this.deliveryAddress.fullName = `${this.user.prenom || ''} ${this.user.nom || ''}`.trim()
      this.deliveryAddress.phone = this.user.telephone || ''
    }
    
    // Vérifier si le panier est vide
    if (!this.cartItems || this.cartItems.length === 0) {
      console.warn('⚠️ Panier vide, redirection vers le panier')
      this.$router.push('/cart')
    }
    
    // Calculer la meilleure option de livraison
    this.calculateBestDeliveryOption()
  },
  methods: {
    selectDeliveryOption(option) {
      this.selectedDelivery = option.id
      console.log('🚚 Option livraison sélectionnée:', option)
    },
    
    calculateBestDeliveryOption() {
      if (this.subtotal >= 50) {
        this.selectedDelivery = 'gratuite'
      } else {
        this.selectedDelivery = 'standard'
      }
    },
    
    goToPaymentStep() {
      if (this.isDeliveryStepValid) {
        this.currentStep = 2
        console.log('📦 Passage à l\'étape paiement')
      } else {
        alert('Veuillez remplir toutes les informations de livraison')
      }
    },
    
    highlightField(event) {
      event.target.parentElement.classList.add('focused')
      setTimeout(() => {
        event.target.parentElement.classList.remove('focused')
      }, 1000)
    },
    
    handlePaymentCompleted(paymentData) {
      console.log('💳 Paiement terminé avec succès:', paymentData)
      
      this.hasCompletedPayment = true
      
      this.orderDetails = {
        id: this.generateOrderId(),
        date: new Date().toLocaleDateString('fr-FR'),
        items: this.cartItems || [],
        delivery: {
          address: { ...this.deliveryAddress },
          option: this.selectedDeliveryOption,
          estimatedDelivery: this.calculateEstimatedDelivery()
        },
        payment: paymentData,
        subtotal: this.subtotal,
        deliveryPrice: this.selectedDeliveryOption.price,
        total: this.orderTotal,
        status: 'confirmed'
      }
      
      this.currentStep = 3
      console.log('✅ Passage à l\'étape confirmation')
    },
    
    handlePaymentError(error) {
      console.error('❌ Erreur de paiement:', error)
      alert(`Erreur lors du paiement: ${error.message || 'Veuillez réessayer'}`)
    },
    
    async completeOrder() {
  if (this.isProcessing) return
  
  this.isProcessing = true
  
  try {
    const orderId = this.orderDetails?.id || this.generateOrderId()
    const trackingNumber = this.generateTrackingNumber()
    
    const orderData = {
      orderId,
      orderNumber: orderId,
      amount: this.orderTotal,
      paymentMethod: this.orderDetails?.payment?.method || 'credit_card',
      deliveryMethod: this.selectedDeliveryOption.name,
      deliveryAddress: this.deliveryAddress,
      items: this.cartItems || [],
      status: 'confirmed',
      date: new Date().toISOString(),
      subtotal: this.subtotal,
      deliveryPrice: this.selectedDeliveryOption.price,
      trackingNumber: trackingNumber,
      estimatedDelivery: this.calculateEstimatedDelivery()
    }
    
    // Sauvegarder la commande dans localStorage
    localStorage.setItem('lastOrder', JSON.stringify(orderData))
    localStorage.setItem('lastOrderTimestamp', new Date().toISOString())
    
    // Vider le panier
    this.clearCartLocal()
    
    // Simulation de délai de traitement
    await new Promise(resolve => setTimeout(resolve, 800))
    
    // Rediriger vers la page de confirmation avec TOUTES les données
    this.redirectToOrderConfirmation(orderData)
    
  } catch (error) {
    console.error('🚨 Erreur lors de la finalisation:', error)
    alert('Une erreur est survenue. Veuillez réessayer.')
    this.isProcessing = false
  }
},
    generateTrackingNumber() {
  const date = new Date()
  const year = date.getFullYear().toString().substring(2)
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `MONSHOP-${year}${month}${day}-${random}`
},
    clearCartLocal() {
      try {
        // Nettoyer plusieurs clés possibles de localStorage
        localStorage.removeItem('cart')
        localStorage.removeItem('monShop_cart')
        localStorage.removeItem('shoppingCart')
        
        // Émettre un événement pour notifier le parent
        this.$emit('cart-cleared')
        
        // Appeler la fonction clearCart du parent si elle existe
        if (this.clearCart && typeof this.clearCart === 'function') {
          this.clearCart()
        }
        
        console.log('🛒 Panier nettoyé')
      } catch (error) {
        console.warn('⚠️ Erreur nettoyage panier:', error)
      }
    },
    
  redirectToOrderConfirmation(orderData) {
  console.log('🔄 Redirection vers confirmation avec données:', orderData)
  
  try {
    // Stocker les données dans localStorage pour la page confirmation
    localStorage.setItem('currentOrder', JSON.stringify(orderData))
    
    // Rediriger vers la page de confirmation avec TOUTES les données
    this.$router.push({
      name: 'OrderConfirmation',
      query: {
        orderId: orderData.orderId,
        orderNumber: orderData.orderNumber,
        amount: orderData.amount,
        paymentMethod: orderData.paymentMethod,
        deliveryMethod: orderData.deliveryMethod,
        trackingNumber: orderData.trackingNumber,
        estimatedDelivery: orderData.estimatedDelivery
      },
      params: {
        orderData: JSON.stringify(orderData)
      }
    })
    
  } catch (routerError) {
    console.error('❌ Erreur de redirection router:', routerError)
    
    // Fallback: Redirection directe avec les données dans l'URL
    try {
      localStorage.setItem('currentOrder', JSON.stringify(orderData))
      window.location.href = `/order/confirmation?orderId=${orderData.orderId}&tracking=${orderData.trackingNumber}`
      
    } catch (fallbackError) {
      console.error('❌ Fallback échoué:', fallbackError)
      alert(`Commande confirmée ! Numéro: ${orderData.orderId}`)
      this.$router.push('/')
    }
  }
},
    generateOrderId() {
      const prefix = 'CMD'
      const timestamp = Date.now().toString(36).toUpperCase()
      const random = Math.random().toString(36).substring(2, 8).toUpperCase()
      return `${prefix}-${timestamp}-${random}`
    },
    
    calculateEstimatedDelivery() {
      const today = new Date()
      let deliveryDays = 0
      
      switch (this.selectedDelivery) {
        case 'express':
          deliveryDays = 2
          break
        case 'standard':
          deliveryDays = 5
          break
        case 'point_relais':
          deliveryDays = 4
          break
        case 'gratuite':
          deliveryDays = 7
          break
        default:
          deliveryDays = 5
      }
      
      const deliveryDate = new Date(today)
      let daysAdded = 0
      while (daysAdded < deliveryDays) {
        deliveryDate.setDate(deliveryDate.getDate() + 1)
        if (deliveryDate.getDay() !== 0 && deliveryDate.getDay() !== 6) {
          daysAdded++
        }
      }
      
      return deliveryDate.toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
      })
    },
    
    formatPrice(price) {
      const num = parseFloat(price)
      if (isNaN(num)) return '0,00 €'
      
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR'
      }).format(num)
    }
  }
}
</script>

<style scoped>
.checkout-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

/* En-tête */
.checkout-header {
  background: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
  font-weight: 700;
  font-size: 1.5rem;
  color: #3b82f6;
}

.brand-icon {
  font-size: 1.8rem;
}

.secure-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #f0f9ff;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  color: #3b82f6;
  font-size: 0.9rem;
  font-weight: 500;
}

/* Barre de progression */
.progress-container {
  max-width: 1200px;
  margin: 2rem auto;
  padding: 0 2rem;
}

.progress-bar {
  height: 4px;
  background: #e5e7eb;
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 2rem;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #8b5cf6);
  border-radius: 2px;
  transition: width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.progress-steps {
  display: flex;
  justify-content: space-between;
  position: relative;
}

.progress-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  position: relative;
  z-index: 2;
  flex: 1;
}

.step-indicator {
  position: relative;
}

.step-circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #e5e7eb;
  color: #9ca3af;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.95rem;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.progress-step.active .step-circle {
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  color: white;
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
  transform: scale(1.1);
}

.progress-step.current .step-circle {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3); }
  50% { box-shadow: 0 4px 25px rgba(59, 130, 246, 0.5); }
}

.step-info {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.step-number {
  font-size: 0.8rem;
  color: #9ca3af;
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.step-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: #4b5563;
}

.progress-step.active .step-title {
  color: #3b82f6;
}

/* Layout principal */
.checkout-layout {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem 3rem;
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 2rem;
}

.checkout-main {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.step-container {
  background: white;
  border-radius: 16px;
  padding: 2.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  animation: slideIn 0.4s ease;
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

.step-header {
  margin-bottom: 2rem;
}

.step-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
}

.step-subtitle {
  font-size: 1rem;
  color: #6b7280;
  margin: 0;
}

/* Cartes de section */
.section-card {
  margin-bottom: 2rem;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.section-icon {
  font-size: 1.5rem;
}

.section-header h3 {
  font-size: 1.2rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

/* Formulaires */
.address-form {
  background: #f8fafc;
  border-radius: 12px;
  padding: 2rem;
  border: 1px solid #e5e7eb;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-label {
  font-size: 0.9rem;
  font-weight: 500;
  color: #4b5563;
  margin-bottom: 0.5rem;
  display: block;
}

.form-input {
  padding: 0.875rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.95rem;
  color: #1f2937;
  background: white;
  transition: all 0.3s ease;
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
}

.form-group.focused .form-input {
  border-color: #3b82f6;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
}

.form-input::placeholder {
  color: #9ca3af;
}

select.form-input {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='%236b7280' viewBox='0 0 16 16'%3E%3Cpath d='M7.247 11.14L2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 1rem center;
  padding-right: 3rem;
}

/* Options de livraison */
.delivery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.delivery-card {
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  display: flex;
  align-items: center;
  gap: 1rem;
  position: relative;
}

.delivery-card:hover {
  border-color: #9ca3af;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
}

.delivery-card.selected {
  border-color: #3b82f6;
  background: linear-gradient(135deg, #f0f9ff, #e6f7ff);
  box-shadow: 0 8px 25px rgba(59, 130, 246, 0.15);
  transform: translateY(-2px);
}

.delivery-card.premium {
  border-color: #f59e0b;
}

.delivery-card.premium.selected {
  background: linear-gradient(135deg, #fffbeb, #fef3c7);
}

.delivery-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.delivery-content {
  flex: 1;
}

.delivery-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem;
}

.delivery-header h4 {
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.delivery-price {
  font-size: 1.1rem;
  font-weight: 700;
  color: #059669;
}

.delivery-card.premium .delivery-price {
  color: #d97706;
}

.delivery-description {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0 0 0.75rem 0;
  line-height: 1.4;
}

.delivery-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.8rem;
  color: #9ca3af;
}

.delivery-selector {
  flex-shrink: 0;
}

.selector-dot {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid #d1d5db;
  position: relative;
}

.selector-dot.selected {
  border-color: #3b82f6;
  background: #3b82f6;
}

.selector-dot.selected::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 8px;
  height: 8px;
  background: white;
  border-radius: 50%;
}

/* Récapitulatif */
.summary-card {
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid #e5e7eb;
}

.summary-content {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f1f5f9;
}

.summary-item:last-child {
  border-bottom: none;
}

.summary-label {
  font-size: 0.9rem;
  color: #6b7280;
}

.summary-value {
  font-size: 0.9rem;
  font-weight: 500;
  color: #1f2937;
  text-align: right;
}

/* Confirmation */
.confirmation-container {
  text-align: center;
}

.success-animation {
  margin-bottom: 2rem;
}

.success-circle {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #10b981, #059669);
  border-radius: 50%;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: scaleIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes scaleIn {
  0% { transform: scale(0); opacity: 0; }
  70% { transform: scale(1.1); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
}

.checkmark {
  color: white;
  font-size: 2.5rem;
  font-weight: bold;
  animation: checkmark 0.3s ease 0.6s both;
}

@keyframes checkmark {
  0% { transform: scale(0); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}

.confirmation-title {
  font-size: 2.2rem;
  font-weight: 800;
  color: #1f2937;
  margin: 0 0 0.75rem 0;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.confirmation-subtitle {
  font-size: 1.1rem;
  color: #6b7280;
  margin: 0 0 2rem 0;
}

.order-card {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  margin: 2rem 0;
  border: 1px solid #e5e7eb;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f3f4f6;
}

.order-header h3 {
  font-size: 1.3rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.order-badge {
  background: #f0f9ff;
  color: #3b82f6;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.9rem;
}

.order-details {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 2rem;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid #f9fafb;
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-label {
  font-size: 0.95rem;
  color: #6b7280;
}

.detail-value {
  font-size: 0.95rem;
  font-weight: 500;
  color: #1f2937;
}

.detail-value.price {
  font-size: 1.1rem;
  font-weight: 700;
  color: #10b981;
}

.order-timeline {
  position: relative;
  padding-left: 30px;
  margin-top: 2rem;
}

.order-timeline::before {
  content: '';
  position: absolute;
  left: 15px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: #e5e7eb;
}

.timeline-item {
  position: relative;
  margin-bottom: 1.5rem;
}

.timeline-item:last-child {
  margin-bottom: 0;
}

.timeline-dot {
  position: absolute;
  left: -30px;
  top: 4px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #d1d5db;
  border: 3px solid white;
}

.timeline-item.active .timeline-dot {
  background: #10b981;
  box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.2);
}

.timeline-content h4 {
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 0.25rem 0;
}

.timeline-content p {
  font-size: 0.9rem;
  color: #6b7280;
  margin: 0;
}

/* Boutons */
.btn {
  padding: 0.875rem 1.75rem;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

.btn-primary {
  background: linear-gradient(135deg, #3b82f6, #6366f1);
  color: white;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
}

.btn-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #2563eb, #4f46e5);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(37, 99, 235, 0.3);
}

.btn-outline {
  background: white;
  color: #4b5563;
  border-color: #e5e7eb;
}

.btn-outline:hover:not(:disabled) {
  background: #f8fafc;
  border-color: #d1d5db;
  transform: translateY(-2px);
}

.btn-lg {
  padding: 1rem 2rem;
  font-size: 1rem;
}

.btn-confirm {
  min-width: 300px;
}

.btn-icon {
  font-size: 1.1rem;
}

.btn-loading {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.confirmation-actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
  margin: 2rem 0;
}

.confirmation-footer {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-top: 2rem;
}

.info-box {
  background: #f8fafc;
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  border: 1px solid #e5e7eb;
}

.info-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.info-content h4 {
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
}

.info-content p {
  font-size: 0.9rem;
  color: #6b7280;
  margin: 0;
  line-height: 1.4;
}

.step-navigation {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 2rem;
  border-top: 1px solid #e5e7eb;
}

/* Sidebar */
.checkout-sidebar {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.sidebar-card {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  position: sticky;
  top: 6rem;
}

.sidebar-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 1.5rem 0;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f3f4f6;
}

.cart-items {
  margin-bottom: 1.5rem;
}

.cart-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid #f9fafb;
}

.cart-item:last-child {
  border-bottom: none;
}

.item-image {
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  flex-shrink: 0;
}

.item-details {
  flex: 1;
}

.item-name {
  font-size: 0.9rem;
  font-weight: 500;
  color: #1f2937;
  margin: 0 0 0.25rem 0;
  line-height: 1.2;
}

.item-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.item-quantity {
  font-size: 0.8rem;
  color: #6b7280;
}

.item-price {
  font-size: 0.9rem;
  font-weight: 600;
  color: #1f2937;
}

.price-breakdown {
  margin-bottom: 1.5rem;
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

.price-row span:first-child {
  font-size: 0.9rem;
  color: #6b7280;
}

.price-row span:last-child {
  font-size: 0.9rem;
  font-weight: 500;
  color: #1f2937;
}

.price-row .free {
  color: #10b981;
  font-weight: 600;
}

.price-row.total {
  padding-top: 1rem;
  border-top: 2px solid #e5e7eb;
  margin-top: 0.5rem;
}

.total-price {
  font-size: 1.2rem;
  font-weight: 700;
  color: #3b82f6;
}

.sidebar-footer {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 1.5rem;
}

.protection-badge,
.guarantee-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: #4b5563;
  padding: 0.5rem;
  background: #f8fafc;
  border-radius: 8px;
}

.protection-icon,
.guarantee-icon {
  font-size: 1rem;
}

.help-card {
  background: linear-gradient(135deg, #f0f9ff, #e6f7ff);
  border-radius: 16px;
  padding: 1.5rem;
  border: 1px solid #bfdbfe;
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.help-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.help-content h4 {
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
}

.help-content p {
  font-size: 0.9rem;
  color: #4b5563;
  margin: 0 0 0.75rem 0;
  line-height: 1.4;
}

.help-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: #3b82f6;
  text-decoration: none;
  font-weight: 500;
  font-size: 0.9rem;
  transition: color 0.3s ease;
}

.help-link:hover {
  color: #2563eb;
}

.help-link-icon {
  font-size: 1rem;
}

/* Responsive */
@media (max-width: 1024px) {
  .checkout-layout {
    grid-template-columns: 1fr;
  }
  
  .checkout-sidebar {
    order: -1;
  }
  
  .sidebar-card {
    position: static;
  }
}

@media (max-width: 768px) {
  .header-content,
  .progress-container,
  .checkout-layout {
    padding: 0 1rem;
  }
  
  .step-container {
    padding: 1.5rem;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .delivery-grid {
    grid-template-columns: 1fr;
  }
  
  .confirmation-title {
    font-size: 1.8rem;
  }
  
  .btn-confirm {
    min-width: 100%;
  }
  
  .progress-steps {
    flex-direction: column;
    gap: 1rem;
  }
  
  .progress-step {
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
    gap: 1rem;
  }
  
  .step-info {
    align-items: flex-start;
  }
}
</style>
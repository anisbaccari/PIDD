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
              :order-number="orderNumber"
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
                <img
                  :src="`/images/${item.product.img}`"
                  :alt="item.product.name || 'Produit'"
                  class="product-img"
                  @error="handleImageError"
                  loading="lazy"
                />
              </div>

              <div class="item-details">
                <h4 class="item-name">{{ item.product.name || 'Produit' }}</h4>
                <div class="item-meta">
                  <span class="item-quantity">Quantité: {{ item.quantity || 1 }}</span>
                  <span class="item-price">{{ formatPrice(item.unitPrice * item.quantity) }}</span>
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
import { useHead } from '@unhead/vue'
import axios from 'axios';
import PaymentMethod from '@/components/PaymentMethod.vue'

export default {
  name: 'CheckoutPage',
  components: {
    PaymentMethod
  },
  setup() {
    useHead({
      title: 'Paiement et Livraison | MonShop',
      meta: [
        { name: 'description', content: 'Finalisez votre commande en toute sécurité avec nos options de livraison flexibles.' }
      ]
    })
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
      cartSnapshot: null,
      isProcessing: false,
      hasCompletedPayment: false,
      cartItems: [],
      loading: true,
      orderNumber: null,
      user: null // Ajout de la propriété user
    }
  },
  computed: {
    selectedDeliveryOption() {
      return this.deliveryOptions.find(opt => opt.id === this.selectedDelivery) || this.deliveryOptions[0]
    },
    
    /* subtotal() {
      // Calcul précis du sous-total
      if (!this.cartItems || this.cartItems.length === 0) return 0
      
      return this.cartItems.reduce((total, item) => {
        const price = parseFloat(item.price) || parseFloat(item.unitPrice) || 0
        const quantity = parseInt(item.quantity) || 1
        return total + (price * quantity)
      }, 0)
    }, */
    
    orderTotal() {
    // Utiliser this.subtotal qui vient de l'API
    const sub = parseFloat(this.subtotal) || 0
    const delivery = parseFloat(this.selectedDeliveryOption?.price) || 0
    return sub + delivery
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

  async mounted() {
    console.log('🛒 CheckoutPage monté')

    // 1️⃣ Récupérer les infos utilisateur si connecté
    await this.fetchUserInfo()
    
    // 2️⃣ Récupérer la commande / panier AVANT tout calcul
    await this.fetchCurrentOrder()

    console.log('📦 Items dans panier:', this.cartItems)
    console.log('💰 Sous-total calculé:', this.subtotal)

    // 3️⃣ Pré-remplir les infos utilisateur si connecté
    if (this.user) {
      this.deliveryAddress.fullName =
        `${this.user.lastName || ''} ${this.user.name || ''}`.trim()
      this.deliveryAddress.phone = this.user.telephone || ''
    }

    // 4️⃣ Calculer la meilleure option de livraison (dépend du subtotal)
    this.calculateBestDeliveryOption()

    // 5️⃣ Générer le numéro de commande UNE SEULE FOIS
    this.orderNumber = this.generateOrderId()
    console.log('📝 Numéro de commande généré:', this.orderNumber)
    
    this.loading = false
  },

  methods: {
    async fetchUserInfo() {
  try {
    // Récupérer l'utilisateur depuis localStorage
    const userStr = localStorage.getItem('user')
    
    if (userStr) {
      this.user = JSON.parse(userStr)
      console.log('👤 Utilisateur récupéré:', this.user)
    } else {
      console.warn('⚠️ Aucun utilisateur dans localStorage')
      
      // Optionnel: essayer de récupérer depuis l'API
      try {
        const response = await axios.get('/auth/me')
        if (response.data?.user) {
          this.user = response.data.user
          localStorage.setItem('user', JSON.stringify(this.user))
        }
      } catch (err) {
        console.warn('⚠️ Impossible de récupérer l\'utilisateur depuis l\'API')
      }
    }
  } catch (error) {
    console.warn('⚠️ Erreur fetchUserInfo:', error)
    this.user = null
  }
},
async fetchCurrentOrder() {
  try {
    console.log('🔄 Récupération du panier pour checkout...')
    
    // ✅ Utiliser axios directement (pas this.$axios)
    const res = await axios.get('/cart')

    console.log('📦 Réponse API /cart:', res.data)

    // Vérifier si le panier est vide
    if (!res.data || !res.data.items || res.data.items.length === 0) {
      console.warn('⚠️ Panier vide → redirection vers /cart')
      alert('Votre panier est vide')
      this.$router.push('/cart')
      return
    }

    // ✅ Adapter la structure des données
    this.cartItems = res.data.items.map(item => {
      console.log('📦 Item:', item)
      
      return {
        id: item.id,
        quantity: item.quantity || 1,
        unitPrice: parseFloat(item.unitPrice) || 0,
        price: parseFloat(item.unitPrice) || 0, // Pour compatibilité
        product: {
          id: item.product?.id,
          name: item.product?.name || 'Produit',
          brand: item.product?.brand || '',
          img: item.product?.img || 'placeholder.png',
          price: parseFloat(item.product?.price) || parseFloat(item.unitPrice) || 0
        }
      }
    })

    // Utiliser le subtotal renvoyé par l'API (plus fiable)
    this.subtotal = parseFloat(res.data.subtotal) || 0
    
    console.log('✅ Panier chargé pour checkout:', {
      itemsCount: this.cartItems.length,
      subtotal: this.subtotal,
      items: this.cartItems
    })

  } catch (error) {
    console.error('❌ Erreur récupération panier:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    })
    
    // Gérer les différents cas d'erreur
    if (error.response?.status === 401) {
      alert('Vous devez être connecté pour accéder au paiement')
      this.$router.push('/login')
    } else if (error.response?.status === 404) {
      alert('Votre panier est vide')
      this.$router.push('/cart')
    } else {
      alert('Erreur lors du chargement de votre panier')
      this.$router.push('/cart')
    }
  }
},
    getProductImage(item) {
      if (item.product?.img) {
        return `/images/${item.product.img}`
      }
      return '/images/placeholder.png'
    },
    
    findProductById(productId) {
      try {
        const allProducts = JSON.parse(localStorage.getItem('allProducts') || '[]')
        return allProducts.find(p => p.id === productId)
      } catch (e) {
        return null
      }
    },
    
    handleImageError(event) {
      event.target.src = '/images/placeholder.png'
      event.target.classList.add('error-image')
    },
    
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
      console.log('📦 Option livraison choisie:', this.selectedDelivery)
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
    
 async handlePaymentCompleted(paymentData) {
  try {
    this.isProcessing = true;
    console.log('💳 Paiement reçu, finalisation de la commande...');

    // 1. On prépare les données complètes pour le serveur
    const orderData = {
      paymentMethod: paymentData.method || 'carte',
      shippingAddress: this.deliveryAddress,
      shippingMethod: this.selectedDeliveryOption.name,
      estimatedDelivery: this.calculateEstimatedDelivery(),
      orderNumber: this.orderNumber // Utilise le numéro généré au mounted
    };

    // 2. Un SEUL appel au backend pour valider le statut 'paid'
    const response = await axios.post('/cart/confirm', orderData);

    if (response.data.success) {
      console.log('✅ Commande confirmée en base de données');

      // 3. On prépare l'objet pour l'écran de confirmation (Step 3)
      this.orderDetails = {
        id: response.data.order?.id || this.orderNumber,
        date: new Date().toISOString(),
        items: [...this.cartItems],
        delivery: {
          address: { ...this.deliveryAddress },
          option: { ...this.selectedDeliveryOption }
        },
        total: this.orderTotal,
        status: 'paid'
      };

      // 4. Nettoyage local uniquement (On ne fait PAS d'appel DELETE /cart)
      this.clearLocalStorage();

      // 5. Passage à l'étape finale
      this.hasCompletedPayment = true;
      this.currentStep = 3;
      
    } else {
      throw new Error(response.data.error || 'Erreur serveur');
    }

  } catch (error) {
    console.error('❌ Erreur finalisation commande:', error);
    // C'est ce message que tu voyais :
    alert('Le paiement a réussi, mais nous avons eu un problème pour enregistrer votre commande en base de données. Ne repayez pas, contactez le support.');
  } finally {
    this.isProcessing = false;
  }
},
    
     async completeOrder() {
    if (this.isProcessing) return
    this.isProcessing = true
    console.log('🚀 Début de la finalisation de commande...')
    
    try {
      // Préparer les données de la commande
      const orderData = {
        orderId: this.orderNumber,
        orderNumber: this.orderNumber,
        amount: this.orderTotal,
        total: this.orderTotal,
        subtotal: this.subtotal,
        deliveryPrice: this.selectedDeliveryOption.price,
        paymentMethod: this.orderDetails?.payment?.method || 'carte',
        deliveryMethod: this.selectedDeliveryOption.name,
        trackingNumber: this.generateTrackingNumber(),
        estimatedDelivery: this.calculateEstimatedDelivery(),
        date: new Date().toISOString(),
        items: this.cartSnapshot || [],
        status: 'paid',
        shippingAddress: this.deliveryAddress,
        customer: this.user ? {
          id: this.user.id,
          name: this.user.name,
          lastName: this.user.lastName,
          email: this.user.email,
          telephone: this.user.telephone
        } : null
      }
      
      console.log('📊 Données de commande à sauvegarder:', orderData)
      
      // Sauvegarder AVANT de vider le panier
      localStorage.setItem('lastOrder', JSON.stringify(orderData))
      localStorage.setItem('currentOrder', JSON.stringify(orderData))
      localStorage.setItem(`order_${orderData.orderId}`, JSON.stringify(orderData))
      
      console.log('💾 Données sauvegardées dans localStorage')
      
      // Attendre un peu pour être sûr
      await new Promise(resolve => setTimeout(resolve, 300))
      
      // Vider le localStorage du panier
      this.clearLocalStorage()
      
      // Rediriger
      console.log('🔄 Redirection vers la page de confirmation...')
      await this.redirectToOrderConfirmation(orderData)
      
    } catch (error) {
      console.error('🚨 Erreur lors de la finalisation:', error)
      this.isProcessing = false
      alert('Une erreur est survenue lors de la confirmation de votre commande. Veuillez réessayer.')
    }
  },
  
    
    async redirectToOrderConfirmation(orderData) {
      console.log('📍 Méthode redirectToOrderConfirmation appelée')
      console.log('📦 Données de commande:', orderData)
      
      try {
        // Vérifier que les données sont bien sauvegardées
        const savedOrder = localStorage.getItem('lastOrder')
        console.log('💾 Vérification données sauvegardées:', savedOrder ? 'OK' : 'MANQUANTES')
        
        // Essayer plusieurs méthodes de redirection
        console.log('🔄 Tentative de redirection...')
        
        // Méthode 1: Utiliser le nom de route si disponible
        try {
          await this.$router.push({
            name: 'OrderSuccess', // ou 'OrderConfirmation' selon votre router
            query: {
              orderId: orderData.orderId,
              orderNumber: orderData.orderNumber,
              amount: orderData.amount,
              tracking: orderData.trackingNumber,
              success: 'true'
            }
          })
          console.log('✅ Redirection via router.push réussie')
          return
        } catch (routerError) {
          console.warn('⚠️ Redirection par nom échouée:', routerError)
        }
        
        // Méthode 2: Utiliser le chemin
        try {
          await this.$router.push({
            path: '/order/confirmation',
            query: {
              orderId: orderData.orderId,
              orderNumber: orderData.orderNumber,
              amount: orderData.amount,
              tracking: orderData.trackingNumber
            }
          })
          console.log('✅ Redirection via chemin réussie')
          return
        } catch (pathError) {
          console.warn('⚠️ Redirection par chemin échouée:', pathError)
        }
        
        // Méthode 3: Fallback avec window.location
        console.log('🔄 Fallback avec window.location...')
        const queryString = new URLSearchParams({
          orderId: orderData.orderId,
          orderNumber: orderData.orderNumber,
          amount: orderData.amount,
          tracking: orderData.trackingNumber
        }).toString()
        
        window.location.href = `/order/success?${queryString}`
        
      } catch (error) {
        console.error('❌ Toutes les méthodes de redirection ont échoué:', error)
        
        // Dernier recours: message et redirection vers l'accueil
        alert(`Commande confirmée ! Votre numéro de commande est: ${orderData.orderId}`)
        this.$router.push('/')
      }
    },
    
    generateTrackingNumber() {
      const date = new Date()
      const year = date.getFullYear().toString().substring(2)
      const month = (date.getMonth() + 1).toString().padStart(2, '0')
      const day = date.getDate().toString().padStart(2, '0')
      const random = Math.random().toString(36).substring(2, 8).toUpperCase()
      return `TRK-${year}${month}${day}-${random}`
    },
    // ✅ NOUVELLE MÉTHODE: Vider le panier dans la BD
  async clearCartInDatabase() {
    try {
      console.log('🗑️ Vidage du panier dans la BD...')
      
      await axios.delete('/cart')
      
      console.log('✅ Panier vidé dans la BD')
      
      // Émettre l'événement de mise à jour
      if (window.EventBus) {
        window.EventBus.$emit('cart-updated')
      }
      
    } catch (error) {
      console.error('❌ Erreur vidage panier:', error)
      // Ne pas bloquer même en cas d'erreur
    }
  },
  // ✅ NOUVELLE MÉTHODE: Vider le localStorage
  clearLocalStorage() {
    console.log('🗑️ Nettoyage du localStorage...')
    
    const keysToRemove = [
      'cart',
      'monShop_cart',
      'shoppingCart',
      'panier',
      'cart_anonymous',
      'currentOrderDetails'
    ]
    
    keysToRemove.forEach(key => {
      localStorage.removeItem(key)
    })
    
    console.log('✅ localStorage nettoyé')
  },
  
    clearCartLocal() {
      try {
        console.log('🗑️ Nettoyage du panier...')
        
        // Supprimer toutes les versions possibles du panier
        localStorage.removeItem('cart')
        localStorage.removeItem('monShop_cart')
        localStorage.removeItem('shoppingCart')
        localStorage.removeItem('panier')
        
        // Émettre l'événement
        this.$emit('cart-cleared')
        
        // Appeler la fonction de nettoyage si fournie
        if (this.clearCart && typeof this.clearCart === 'function') {
          this.clearCart()
        }
        
        console.log('✅ Panier nettoyé avec succès')
      } catch (error) {
        console.warn('⚠️ Erreur lors du nettoyage du panier:', error)
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
        currency: 'EUR',
        minimumFractionDigits: 2
      }).format(num)
    }
  }
}
</script>

<style scoped>
/* Styles de base */
.checkout-page {
  min-height: 100vh;
  background: #f8fafc;
}

.checkout-header {
  background: white;
  border-bottom: 1px solid #e5e7eb;
  padding: 1rem 0;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  color: #1f2937;
  font-weight: 600;
  font-size: 1.25rem;
}

.brand-icon {
  font-size: 1.5rem;
}

.secure-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #6b7280;
  font-size: 0.875rem;
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
  margin-bottom: 2rem;
  position: relative;
}

.progress-fill {
  position: absolute;
  height: 100%;
  background: #10b981;
  border-radius: 2px;
  transition: width 0.3s ease;
}

.progress-steps {
  display: flex;
  justify-content: space-between;
}

.progress-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.step-indicator {
  position: relative;
}

.step-circle {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  background: white;
  border: 2px solid #e5e7eb;
  color: #9ca3af;
  transition: all 0.3s ease;
}

.progress-step.active .step-circle {
  border-color: #10b981;
  background: #10b981;
  color: white;
}

.progress-step.current .step-circle {
  border-color: #10b981;
  color: #10b981;
  background: white;
  box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1);
}

.step-info {
  text-align: center;
}

.step-number {
  display: block;
  font-size: 0.75rem;
  color: #9ca3af;
  margin-bottom: 0.25rem;
}

.step-title {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

/* Layout principal */
.checkout-layout {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 2rem;
  margin-bottom: 4rem;
}

/* Colonne principale */
.checkout-main {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.step-container {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.step-header {
  margin-bottom: 2rem;
}

.step-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.step-subtitle {
  color: #6b7280;
  font-size: 0.95rem;
}

/* Cartes de section */
.section-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.section-icon {
  font-size: 1.25rem;
}

.section-header h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

/* Formulaire */
.address-form {
  margin-top: 1rem;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group.full-width {
  grid-column: span 2;
}

.form-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
}

.form-input {
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.95rem;
  transition: all 0.2s ease;
}

.form-input:focus {
  outline: none;
  border-color: #8b5cf6;
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
}

/* Options de livraison */
.delivery-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.delivery-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.delivery-card:hover {
  border-color: #8b5cf6;
  background: #f8fafc;
}

.delivery-card.selected {
  border-color: #8b5cf6;
  background: rgba(139, 92, 246, 0.05);
}

.delivery-card.premium {
  border-left: 4px solid #8b5cf6;
}

.delivery-icon {
  font-size: 1.5rem;
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
  font-weight: 600;
  color: #8b5cf6;
}

.delivery-description {
  color: #6b7280;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
}

.delivery-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.75rem;
  color: #9ca3af;
}

.delivery-selector {
  display: flex;
  align-items: center;
}

.selector-dot {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid #d1d5db;
  transition: all 0.2s ease;
}

.selector-dot.selected {
  border-color: #8b5cf6;
  background: #8b5cf6;
  box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.1);
}

/* Panneau latéral */
.checkout-sidebar {
  position: sticky;
  top: 2rem;
  height: fit-content;
}

.sidebar-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 1rem;
}

.sidebar-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 1.5rem;
}

.cart-items {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.cart-item {
  display: flex;
  gap: 1rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid #f3f4f6;
}

.item-image {
  width: 60px;
  height: 60px;
  border-radius: 6px;
  overflow: hidden;
  flex-shrink: 0;
}

.product-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-details {
  flex: 1;
}

.item-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: #1f2937;
  margin-bottom: 0.25rem;
}

.item-meta {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: #6b7280;
}

.price-breakdown {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.price-row {
  display: flex;
  justify-content: space-between;
  color: #4b5563;
}

.price-row.total {
  padding-top: 0.75rem;
  border-top: 1px solid #e5e7eb;
  font-weight: 600;
  color: #1f2937;
}

.total-price {
  color: #8b5cf6;
  font-size: 1.125rem;
}

.free {
  color: #10b981;
  font-weight: 600;
}

.sidebar-footer {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding-top: 1rem;
  border-top: 1px solid #f3f4f6;
}

.protection-badge,
.guarantee-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  color: #6b7280;
}

.help-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.help-icon {
  font-size: 1.5rem;
}

.help-content {
  flex: 1;
}

.help-content h4 {
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.help-content p {
  color: #6b7280;
  font-size: 0.875rem;
  margin-bottom: 1rem;
}

.help-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #8b5cf6;
  text-decoration: none;
  font-weight: 500;
  font-size: 0.875rem;
}

.help-link:hover {
  text-decoration: underline;
}

/* Navigation */
.step-navigation {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 0;
  border-top: 1px solid #e5e7eb;
}

/* Boutons */
.btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  font-family: inherit;
}

.btn-primary {
  background: #8b5cf6;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #7c3aed;
  transform: translateY(-1px);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-outline {
  background: white;
  color: #4b5563;
  border: 1px solid #d1d5db;
}

.btn-outline:hover:not(:disabled) {
  background: #f9fafb;
  border-color: #9ca3af;
}

.btn-lg {
  padding: 1rem 2rem;
  font-size: 1rem;
}

.btn-next {
  margin-left: auto;
}

.btn-icon {
  font-size: 1.25rem;
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
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Page de confirmation */
.confirmation-container {
  text-align: center;
}

.success-animation {
  margin-bottom: 2rem;
}

.success-circle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: #10b981;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  animation: scaleIn 0.5s ease;
}

@keyframes scaleIn {
  0% { transform: scale(0); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

.checkmark {
  font-size: 2.5rem;
  color: white;
  font-weight: bold;
}

.confirmation-header {
  margin-bottom: 3rem;
}

.confirmation-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 1rem;
}

.confirmation-subtitle {
  color: #6b7280;
  font-size: 1.125rem;
  max-width: 600px;
  margin: 0 auto;
}

.order-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
  text-align: left;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #f3f4f6;
}

.order-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.order-badge {
  background: #f3f4f6;
  color: #374151;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
}

.order-details {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid #f9fafb;
}

.detail-label {
  color: #6b7280;
  font-size: 0.95rem;
}

.detail-value {
  font-weight: 500;
  color: #1f2937;
}

.detail-value.price {
  color: #8b5cf6;
  font-size: 1.125rem;
  font-weight: 600;
}

.order-timeline {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  position: relative;
  padding-left: 1.5rem;
}

.order-timeline::before {
  content: '';
  position: absolute;
  left: 7px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: #e5e7eb;
}

.timeline-item {
  display: flex;
  gap: 1rem;
  position: relative;
}

.timeline-dot {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: white;
  border: 2px solid #e5e7eb;
  flex-shrink: 0;
  z-index: 1;
}

.timeline-item.active .timeline-dot {
  border-color: #10b981;
  background: #10b981;
  box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1);
}

.timeline-content {
  flex: 1;
}

.timeline-content h4 {
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.25rem;
}

.timeline-content p {
  color: #6b7280;
  font-size: 0.875rem;
}

.confirmation-actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

.confirmation-footer {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.info-box {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  background: #f9fafb;
  padding: 1rem;
  border-radius: 8px;
  text-align: left;
}

.info-icon {
  font-size: 1.25rem;
}

.info-content h4 {
  font-size: 0.95rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.25rem;
}

.info-content p {
  color: #6b7280;
  font-size: 0.875rem;
  margin: 0;
}

/* Récapitulatif */
.summary-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.summary-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.summary-icon {
  font-size: 1.25rem;
}

.summary-content {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.summary-item {
  display: flex;
  justify-content: space-between;
}

.summary-label {
  color: #6b7280;
  font-size: 0.875rem;
}

.summary-value {
  font-weight: 500;
  color: #1f2937;
  text-align: right;
  max-width: 200px;
}

/* Responsive */
@media (max-width: 1024px) {
  .checkout-layout {
    grid-template-columns: 1fr;
  }
  
  .checkout-sidebar {
    position: static;
  }
}

@media (max-width: 768px) {
  .checkout-layout,
  .progress-container,
  .header-content {
    padding: 0 1rem;
  }
  
  .progress-steps {
    gap: 0.5rem;
  }
  
  .step-title {
    font-size: 0.75rem;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .form-group.full-width {
    grid-column: span 1;
  }
  
  .confirmation-footer {
    grid-template-columns: 1fr;
  }
  
  .order-timeline::before {
    left: 8px;
  }
}

@media (max-width: 480px) {
  .step-container {
    padding: 1rem;
  }
  
  .section-card {
    padding: 1rem;
  }
  
  .btn {
    width: 100%;
    justify-content: center;
  }
  
  .step-navigation {
    flex-direction: column;
    gap: 1rem;
  }
  
  .btn-next {
    margin-left: 0;
    width: 100%;
  }
  
  .confirmation-actions {
    gap: 0.75rem;
  }
}
</style>
<template>
  <div class="order-confirmation">
    <!-- En-tête avec effet visuel -->
    <div class="confirmation-header">
      <div class="confetti-container">
        <div class="confetti"></div>
        <div class="confetti"></div>
        <div class="confetti"></div>
        <div class="confetti"></div>
      </div>
      
      <div class="header-content">
        <div class="success-animation">
          <div class="checkmark-circle">
            <svg class="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
              <circle class="checkmark__circle" cx="26" cy="26" r="25" fill="none"/>
              <path class="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
            </svg>
          </div>
        </div>
        
        <div class="header-text">
          <h1>Commande confirmée !</h1>
          <p class="greeting">Merci pour votre confiance {{ getUserFirstName() }} !</p>
          <div class="order-badge">
            <span class="badge-icon">📦</span>
            <span class="badge-text">N° {{ order.id || generateOrderId() }}</span>
            <button @click="copyOrderNumber" class="badge-copy" title="Copier le numéro">
              📋
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Timeline élégante -->
    <div class="delivery-timeline">
      <div class="timeline-header">
        <h2><span class="timeline-icon">🚚</span> Suivi de votre commande</h2>
        <p class="timeline-subtitle">Suivez l'avancement de votre livraison en temps réel</p>
      </div>
      
      <div class="timeline-container">
        <div class="timeline-progress">
          <div class="progress-bar" :style="{ width: progressPercentage + '%' }"></div>
        </div>
        
        <div class="timeline-steps">
          <div 
            v-for="step in trackingSteps"
            :key="step.id"
            :class="['timeline-step', { active: step.active, completed: step.completed }]"
          >
            <div class="step-indicator">
              <div class="step-dot">
                <span class="step-number">{{ step.id }}</span>
                <span v-if="step.completed" class="step-check">✓</span>
              </div>
              <div class="step-connector"></div>
            </div>
            
            <div class="step-content">
              <div class="step-header">
                <div class="step-icon">{{ step.icon }}</div>
                <div class="step-info">
                  <h3>{{ step.title }}</h3>
                  <p class="step-desc">{{ step.description }}</p>
                </div>
              </div>
              
              <div v-if="step.date" class="step-meta">
                <span class="step-date">
                  <span class="date-icon">📅</span>
                  {{ step.date }}
                </span>
                <span v-if="step.time" class="step-time">
                  <span class="time-icon">⏰</span>
                  {{ step.time }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Grille d'informations modernes -->
    <div class="info-grid">
      <div class="info-card delivery-info">
        <div class="card-header">
          <div class="card-icon">🏠</div>
          <h3>Livraison</h3>
        </div>
        <div class="card-content">
          <div class="info-item">
            <span class="info-label">Transporteur</span>
            <span class="info-value carrier">{{ deliveryInfo.option.carrier }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Délai estimé</span>
            <span class="info-value">{{ deliveryInfo.option.deliveryTime }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Livraison prévue</span>
            <span class="info-value highlight">{{ deliveryInfo.estimatedDelivery }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Suivi</span>
            <span class="info-value tracking">
              {{ trackingNumber }}
              <button @click="copyTrackingNumber" class="copy-tracking" title="Copier">
                📋
              </button>
            </span>
          </div>
        </div>
      </div>
      
      <div class="info-card address-info">
        <div class="card-header">
          <div class="card-icon">📍</div>
          <h3>Adresse de livraison</h3>
        </div>
        <div class="card-content">
          <div class="address-details">
            <p class="recipient">{{ deliveryInfo.address.fullName }}</p>
            <p class="street">{{ deliveryInfo.address.street }}</p>
            <p class="city">{{ deliveryInfo.address.postalCode }} {{ deliveryInfo.address.city }}</p>
            <p class="country">{{ getCountryName(deliveryInfo.address.country) }}</p>
            <div class="contact">
              <span class="phone">📞 {{ deliveryInfo.address.phone }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="info-card payment-info">
        <div class="card-header">
          <div class="card-icon">💳</div>
          <h3>Paiement</h3>
        </div>
        <div class="card-content">
          <div class="info-item">
            <span class="info-label">Méthode</span>
            <span class="info-value">{{ getPaymentMethod() }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Montant total</span>
            <span class="info-value price">{{ formatPrice(order.total || order.amount) }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Statut</span>
            <span class="info-value status">
              <span class="status-dot"></span>
              Payé
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Actions principales -->
    <div class="main-actions">
      <button 
        @click="confirmOrder"
        class="action-btn primary"
        :class="{ loading: isProcessing }"
        :disabled="isProcessing"
      >
        <span v-if="isProcessing" class="btn-content">
          <span class="spinner"></span>
          Traitement en cours...
        </span>
        <span v-else class="btn-content">
          <span class="btn-icon">✨</span>
          Finaliser la commande
        </span>
      </button>
      
      <div class="secondary-actions">
        <button @click="downloadInvoice" class="action-btn secondary">
          <span class="btn-icon">📄</span>
          Télécharger la facture
        </button>
        <button @click="printSummary" class="action-btn secondary">
          <span class="btn-icon">🖨️</span>
          Imprimer
        </button>
        <button @click="trackPackage" class="action-btn secondary">
          <span class="btn-icon">🚚</span>
          Suivre le colis
        </button>
      </div>
    </div>

    <!-- Informations utiles -->
    <div class="useful-info">
      <div class="info-section">
        <div class="section-icon">📧</div>
        <div class="section-content">
          <h4>Email de confirmation</h4>
          <p>Un récapitulatif complet a été envoyé à votre adresse email.</p>
        </div>
      </div>
      
      <div class="info-section">
        <div class="section-icon">📱</div>
        <div class="section-content">
          <h4>Application mobile</h4>
          <p>Suivez votre commande en temps réel sur notre application.</p>
        </div>
      </div>
      
      <div class="info-section">
        <div class="section-icon">🛡️</div>
        <div class="section-content">
          <h4>Garantie</h4>
          <p>Votre achat est couvert par notre garantie satisfait ou remboursé.</p>
        </div>
      </div>
    </div>

    <!-- Conseils de livraison -->
    <div class="delivery-tips">
      <h3><span class="tips-icon">💡</span> Conseils pour la réception</h3>
      <div class="tips-grid">
        <div class="tip-card">
          <div class="tip-icon">📦</div>
          <h4>Vérifiez le colis</h4>
          <p>Inspectez l'emballage avant de signer le bon de livraison.</p>
        </div>
        <div class="tip-card">
          <div class="tip-icon">🆔</div>
          <h4>Pièce d'identité</h4>
          <p>Préparez votre pièce d'identité pour la réception.</p>
        </div>
        <div class="tip-card">
          <div class="tip-icon">📞</div>
          <h4>Contact du livreur</h4>
          <p>Le transporteur vous préviendra par SMS la veille.</p>
        </div>
        <div class="tip-card">
          <div class="tip-icon">⏰</div>
          <h4>Disponibilité</h4>
          <p>Assurez-vous d'être présent lors de la livraison.</p>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="confirmation-footer">
      <p class="thank-you">Merci d'avoir choisi MonShop !</p>
      <div class="footer-links">
        <router-link to="/profile/orders" class="footer-link">Mes commandes</router-link>
        <router-link to="/" class="footer-link">Retour à l'accueil</router-link>
        <router-link to="/contact" class="footer-link">Contactez-nous</router-link>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
export default {
  name: 'OrderConfirmation',
  
  props: {
    order: {
     user: Object
  },
  data() {
    return {
         order: null,
          deliveryInfo: null,
      isProcessing: false,
      trackingSteps: [
        {
          id: 1,
          title: 'Commande confirmée',
          description: 'Votre commande a été validée et enregistrée',
          icon: '✅',
          active: true,
          completed: true,
          date: 'Aujourd\'hui',
          time: 'Maintenant'
        },
        {
          id: 2,
          title: 'En préparation',
          description: 'Votre colis est en cours de préparation',
          icon: '📦',
          active: false,
          completed: false,
          date: 'Demain',
          time: '9h-12h'
        },
        {
          id: 3,
          title: 'Expédié',
          description: 'Votre colis a été remis au transporteur',
          icon: '🚚',
          active: false,
          completed: false,
          date: null,
          time: null
        },
        {
          id: 4,
          title: 'En transit',
          description: 'Votre colis est en cours de livraison',
          icon: '✈️',
          active: false,
          completed: false,
          date: null,
          time: null
        },
        {
          id: 5,
          title: 'Livré',
          description: 'Votre commande a été livrée avec succès',
          icon: '🎁',
          active: false,
          completed: false,
          date: null,
          time: null
        }
      ],
      trackingNumber: '',
      isProcessing: false,
       cartItems: [],
      progressPercentage: 20
    }
  },
   async created() {
    // Récupérer les articles du panier depuis le store ou localStorage
     await this.loadOrderData();
  },
  async mounted() {
    console.log('📦 OrderConfirmation monté')
    this.generateTrackingNumber()
    this.startTrackingSimulation()
  },
  methods: {
    getUserFirstName() {
      const name = this.deliveryInfo?.address?.fullName || ''
      return name.split(' ')[0] || ''
    },
    async loadOrderData() {
      try {
        // Récupérer depuis localStorage (passé depuis CheckoutPage)
        const orderData = localStorage.getItem('lastOrder');
        
        if (orderData) {
          const parsedOrder = JSON.parse(orderData);
          this.order = parsedOrder;
          this.deliveryInfo = parsedOrder.deliveryInfo || {};
          
          console.log('✅ Commande chargée:', this.order);
        } else {
          console.warn('⚠️ Aucune commande trouvée');
          // Rediriger vers le panier si pas de commande
          this.$router.push('/cart');
        }
      } catch (error) {
        console.error('❌ Erreur chargement commande:', error);
      }
    },
      async loadOrder(orderId) {
      try {
        const response = await axios.get(`/api/orders/confirmation/${orderId}`);
        this.order = response.data.order;
        this.trackingNumber = this.order.trackingNumber;
        
        // Formater les données pour la vue
        this.deliveryInfo = {
          address: this.order.shippingAddress,
          option: {
            carrier: this.order.shippingMethod,
            deliveryTime: '2-3 jours'
          },
          estimatedDelivery: this.formatDate(this.order.estimatedDelivery)
        };
        
      } catch (error) {
        console.error('Erreur chargement commande:', error);
      }
    },
    getCountryName(countryCode) {
      const countries = {
        'FR': 'France',
        'BE': 'Belgique',
        'CH': 'Suisse',
        'LU': 'Luxembourg',
        'ES': 'Espagne',
        'IT': 'Italie',
        'DE': 'Allemagne'
      }
      return countries[countryCode] || countryCode
    },
    
    getPaymentMethod() {
      return this.order?.payment?.method || 'Carte bancaire'
    },
    
    formatPrice(price) {
      const num = parseFloat(price) || 0
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR'
      }).format(num)
    },
    
    generateOrderId() {
      const prefix = 'CMD'
      const timestamp = Date.now().toString(36).toUpperCase()
      const random = Math.random().toString(36).substring(2, 6).toUpperCase()
      return `${prefix}-${timestamp}-${random}`
    },
    
    generateTrackingNumber() {
      const carrier = this.deliveryInfo?.option?.carrier || 'Colissimo'
      const prefix = carrier === 'Chronopost' ? 'CHR' : 
                    carrier === 'Mondial Relay' ? 'MR' : 'COL'
      const random = Math.random().toString(36).substring(2, 10).toUpperCase()
      const timestamp = Date.now().toString(36).toUpperCase()
      this.trackingNumber = `${prefix}${timestamp.slice(-6)}${random.slice(0, 8)}`
      return this.trackingNumber
    },
    
    startTrackingSimulation() {
      // Simulation progressive du suivi
      const intervals = [2000, 4000, 6000, 8000]
      
      intervals.forEach((timeout, index) => {
        setTimeout(() => {
          this.trackingSteps[index + 1].completed = true
          this.trackingSteps[index + 1].active = true
          this.trackingSteps[index + 1].date = this.getFutureDate(index + 1)
          this.trackingSteps[index + 1].time = this.getRandomTime()
          
          // Mettre à jour la progression
          this.progressPercentage = (index + 2) * 20
        }, timeout)
      })
    },
    
    getFutureDate(days) {
      const date = new Date()
      date.setDate(date.getDate() + days)
      return date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
    },
    
    getRandomTime() {
      const hours = ['9h-12h', '13h-17h', '10h-13h', '14h-18h']
      return hours[Math.floor(Math.random() * hours.length)]
    },
    
    copyOrderNumber() {
      const orderId = this.order.id || this.generateOrderId()
      this.copyToClipboard(orderId, 'Numéro de commande')
    },
    
    copyTrackingNumber() {
      this.copyToClipboard(this.trackingNumber, 'Numéro de suivi')
    },
    
    async copyToClipboard(text, label) {
      try {
        await navigator.clipboard.writeText(text)
        this.showToast(`${label} copié !`)
      } catch (err) {
        // Fallback pour les anciens navigateurs
        const textArea = document.createElement('textarea')
        textArea.value = text
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
        this.showToast(`${label} copié !`)
      }
    },
    
    showToast(message) {
      // Créer un toast temporaire
      const toast = document.createElement('div')
      toast.className = 'toast-notification'
      toast.textContent = message
      document.body.appendChild(toast)
      
      setTimeout(() => {
        toast.classList.add('show')
      }, 10)
      
      setTimeout(() => {
        toast.classList.remove('show')
        setTimeout(() => {
          document.body.removeChild(toast)
        }, 300)
      }, 3000)
    },
    
  async confirmOrder() {
      if (this.isProcessing) return;
      
      this.isProcessing = true;
      
      try {
        console.log('🔄 Création de la commande...');
        
        // 1. Créer la commande dans la base de données
        const orderResponse = await axios.post('/api/admin/orders', {
          userId: this.user?.id || this.order.userId,
          orderNumber: this.order.orderNumber || this.generateOrderId(),
          customerName: this.deliveryInfo?.address?.fullName || 'Client',
          customerEmail: this.deliveryInfo?.address?.email || this.user?.email,
          customerPhone: this.deliveryInfo?.address?.phone || '',
          items: this.order.items || [],
          subtotal: this.order.subtotal || 0,
          shipping: this.order.deliveryPrice || 0,
          total: this.order.total || this.order.amount,
          status: 'confirmed',
          paymentMethod: this.order.paymentMethod || 'card',
          shippingAddress: {
            fullName: this.deliveryInfo?.address?.fullName,
            street: this.deliveryInfo?.address?.street,
            city: this.deliveryInfo?.address?.city,
            postalCode: this.deliveryInfo?.address?.postalCode,
            country: this.deliveryInfo?.address?.country,
            phone: this.deliveryInfo?.address?.phone
          },
          shippingMethod: this.deliveryInfo?.option?.name || 'Standard',
          trackingNumber: this.trackingNumber
        }, {
          headers: this.getAuthHeaders()
        });
        
        console.log('✅ Commande créée:', orderResponse.data);
        
        // 2. Mettre à jour les stocks des produits
        await this.updateProductStocks();
        
        // 3. Nettoyer le localStorage
        this.clearOrderData();
        
        this.showToast('✅ Commande finalisée avec succès !');
        
        // 4. Rediriger vers les commandes après 2 secondes
        setTimeout(() => {
          this.$router.push('/profile/orders');
        }, 2000);
        
      } catch (error) {
        console.error('❌ Erreur confirmation:', error);
        this.showToast('❌ Erreur lors de la confirmation', 'error');
      } finally {
        this.isProcessing = false;
      }
    },
    
     async updateProductStocks() {
      try {
        console.log('🔄 Mise à jour des stocks...');
        
        const updatePromises = this.order.items.map(async (item) => {
          try {
            // Appel API pour diminuer le stock
            const response = await axios.patch(
              `/api/products/${item.productId}/decrease-stock`,
              {
                quantity: item.quantity
              },
              {
                headers: this.getAuthHeaders()
              }
            );
            
            console.log(`✅ Stock mis à jour pour produit ${item.productId}`);
            return response.data;
          } catch (error) {
            console.error(`❌ Erreur stock produit ${item.productId}:`, error);
            throw error;
          }
        });
        
        await Promise.all(updatePromises);
        console.log('✅ Tous les stocks ont été mis à jour');
        
      } catch (error) {
        console.error('❌ Erreur mise à jour stocks:', error);
        throw error;
      }
    },

     getAuthHeaders() {
      const token = localStorage.getItem('token');
      return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
    },
    
    clearOrderData() {
      localStorage.removeItem('lastOrder');
      localStorage.removeItem('lastOrderTimestamp');
      localStorage.removeItem('cart');
      console.log('🧹 Données de commande nettoyées');
    },
    calculateTotal() {
      return this.cartItems.reduce((total, item) => {
        return total + (item.price * item.quantity);
      }, 0) + (this.deliveryInfo?.option?.price || 0);
    },
    
    clearCart() {
      // Vider le panier dans le store
      if (this.$store.state.cart) {
        this.$store.commit('clearCart');
      }
      // Vider le localStorage
      localStorage.removeItem('cartItems');
    },
    downloadInvoice() {
      // Simulation de téléchargement de facture
      this.showToast('Facture téléchargée !')
      console.log('📄 Facture téléchargée')
    },
    
    printSummary() {
      window.print()
    },
    async mounted() {
    const orderId = this.$route.params.orderId;
    await this.loadOrder(orderId);
  },
    trackPackage() {
      // Ouvrir le suivi dans un nouvel onglet
      const url = `https://www.${this.deliveryInfo.option.carrier.toLowerCase().replace(' ', '')}.fr/track/${this.trackingNumber}`
      window.open(url, '_blank')
    }
  }
}
</script>

<style scoped>
.order-confirmation {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem 3rem;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

/* En-tête avec confetti */
.confirmation-header {
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  border-radius: 20px;
  padding: 4rem 2rem;
  margin-bottom: 3rem;
  position: relative;
  overflow: hidden;
  color: white;
  box-shadow: 0 20px 40px rgba(59, 130, 246, 0.2);
}

.confetti-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.confetti {
  position: absolute;
  width: 10px;
  height: 20px;
  background: rgba(255, 255, 255, 0.6);
  top: 0;
  animation: fall 5s linear infinite;
}

.confetti:nth-child(1) {
  left: 10%;
  animation-delay: 0s;
  background: #ffd700;
}
.confetti:nth-child(2) {
  left: 30%;
  animation-delay: 1s;
  background: #ff6b6b;
}
.confetti:nth-child(3) {
  left: 50%;
  animation-delay: 2s;
  background: #4ecdc4;
}
.confetti:nth-child(4) {
  left: 70%;
  animation-delay: 3s;
  background: #ffd93d;
}

@keyframes fall {
  0% {
    transform: translateY(-100px) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(100vh) rotate(360deg);
    opacity: 0;
  }
}

.header-content {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 3rem;
  flex-wrap: wrap;
}

.success-animation {
  flex-shrink: 0;
}

.checkmark-circle {
  width: 100px;
  height: 100px;
  position: relative;
}

.checkmark {
  width: 100px;
  height: 100px;
  display: block;
  stroke-width: 4;
  stroke: white;
  stroke-miterlimit: 10;
  animation: fill 0.4s ease-in-out 0.4s forwards, scale 0.3s ease-in-out 0.9s both;
}

.checkmark__circle {
  stroke-dasharray: 166;
  stroke-dashoffset: 166;
  stroke-width: 4;
  stroke-miterlimit: 10;
  stroke: white;
  fill: none;
  animation: stroke 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards;
}

.checkmark__check {
  transform-origin: 50% 50%;
  stroke-dasharray: 48;
  stroke-dashoffset: 48;
  animation: stroke 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.8s forwards;
}

@keyframes stroke {
  100% {
    stroke-dashoffset: 0;
  }
}
@keyframes scale {
  0%, 100% {
    transform: none;
  }
  50% {
    transform: scale3d(1.1, 1.1, 1);
  }
}
@keyframes fill {
  100% {
    box-shadow: inset 0px 0px 0px 100px rgba(255, 255, 255, 0.1);
  }
}

.header-text {
  flex: 1;
}

.header-text h1 {
  font-size: 3rem;
  font-weight: 800;
  margin: 0 0 0.5rem 0;
  background: linear-gradient(to right, #ffffff, #e2e8f0);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.greeting {
  font-size: 1.2rem;
  opacity: 0.9;
  margin: 0 0 2rem 0;
}

.order-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  padding: 0.75rem 1.5rem;
  border-radius: 50px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.badge-icon {
  font-size: 1.2rem;
}

.badge-text {
  font-weight: 600;
  font-size: 1.1rem;
  letter-spacing: 0.5px;
}

.badge-copy {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  font-size: 1rem;
  opacity: 0.7;
  transition: opacity 0.3s ease;
  padding: 0.25rem;
  border-radius: 4px;
}

.badge-copy:hover {
  opacity: 1;
  background: rgba(255, 255, 255, 0.1);
}

/* Timeline */
.delivery-timeline {
  background: white;
  border-radius: 20px;
  padding: 2.5rem;
  margin-bottom: 3rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  border: 1px solid #e5e7eb;
}

.timeline-header {
  margin-bottom: 2.5rem;
}

.timeline-header h2 {
  font-size: 1.8rem;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.timeline-subtitle {
  color: #6b7280;
  margin: 0;
}

.timeline-container {
  position: relative;
}

.timeline-progress {
  height: 6px;
  background: #e5e7eb;
  border-radius: 3px;
  margin-bottom: 4rem;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #10b981, #3b82f6);
  border-radius: 3px;
  transition: width 1s ease;
}

.timeline-steps {
  display: grid;
  gap: 3rem;
}

.timeline-step {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 2rem;
  position: relative;
}

.step-indicator {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.step-dot {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: #9ca3af;
  position: relative;
  z-index: 2;
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.timeline-step.completed .step-dot {
  background: #10b981;
  color: white;
  transform: scale(1.1);
  box-shadow: 0 0 0 8px rgba(16, 185, 129, 0.2);
}

.timeline-step.active .step-dot {
  background: #3b82f6;
  color: white;
  animation: pulse 2s infinite;
  box-shadow: 0 0 0 8px rgba(59, 130, 246, 0.2);
}

@keyframes pulse {
  0%, 100% { box-shadow: 0 0 0 8px rgba(59, 130, 246, 0.2); }
  50% { box-shadow: 0 0 0 12px rgba(59, 130, 246, 0); }
}

.step-number {
  font-size: 1rem;
}

.step-check {
  font-size: 1.2rem;
  font-weight: bold;
}

.step-connector {
  position: absolute;
  top: 50px;
  bottom: -3rem;
  width: 2px;
  background: #e5e7eb;
}

.timeline-step:last-child .step-connector {
  display: none;
}

.timeline-step.completed .step-connector {
  background: #10b981;
}

.step-content {
  padding-top: 0.5rem;
}

.step-header {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1rem;
}

.step-icon {
  font-size: 1.8rem;
  flex-shrink: 0;
}

.step-info h3 {
  font-size: 1.2rem;
  color: #1f2937;
  margin: 0 0 0.25rem 0;
  font-weight: 600;
}

.step-desc {
  color: #6b7280;
  margin: 0;
  font-size: 0.95rem;
}

.step-meta {
  display: flex;
  gap: 1.5rem;
  font-size: 0.9rem;
  color: #4b5563;
  padding-left: 2.8rem;
}

.step-date,
.step-time {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #f8fafc;
  padding: 0.5rem 1rem;
  border-radius: 8px;
}

.date-icon,
.time-icon {
  font-size: 0.9rem;
}

/* Grille d'informations */
.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.info-card {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.06);
  border: 1px solid #e5e7eb;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.info-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 35px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f3f4f6;
}

.card-icon {
  font-size: 1.8rem;
}

.card-header h3 {
  font-size: 1.3rem;
  color: #1f2937;
  margin: 0;
  font-weight: 600;
}

.card-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid #f9fafb;
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  color: #6b7280;
  font-size: 0.95rem;
}

.info-value {
  color: #1f2937;
  font-weight: 500;
  font-size: 0.95rem;
}

.info-value.carrier {
  font-weight: 600;
  color: #3b82f6;
}

.info-value.highlight {
  color: #10b981;
  font-weight: 600;
  font-size: 1rem;
}

.info-value.price {
  font-size: 1.2rem;
  font-weight: 700;
  color: #059669;
}

.info-value.status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.status-dot {
  width: 8px;
  height: 8px;
  background: #10b981;
  border-radius: 50%;
  animation: status-pulse 2s infinite;
}

@keyframes status-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.info-value.tracking {
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
  background: #f0f9ff;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  border: 1px solid #bfdbfe;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.copy-tracking {
  background: none;
  border: none;
  color: #3b82f6;
  cursor: pointer;
  font-size: 1rem;
  padding: 0.25rem;
  border-radius: 4px;
  transition: background 0.3s ease;
}

.copy-tracking:hover {
  background: rgba(59, 130, 246, 0.1);
}

.address-details p {
  margin: 0.5rem 0;
  color: #4b5563;
}

.address-details .recipient {
  font-weight: 600;
  color: #1f2937;
  font-size: 1.1rem;
}

.address-details .contact {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

.phone {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #4b5563;
}

/* Actions */
.main-actions {
  text-align: center;
  margin: 3rem 0;
  padding: 2.5rem;
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
  border-radius: 20px;
}

.action-btn {
  padding: 1.2rem 2.5rem;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  border: none;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
}

.action-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none !important;
}

.action-btn.primary {
  background: linear-gradient(135deg, #3b82f6, #6366f1);
  color: white;
  box-shadow: 0 8px 20px rgba(59, 130, 246, 0.3);
  min-width: 300px;
}

.action-btn.primary:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 12px 30px rgba(59, 130, 246, 0.4);
}

.action-btn.primary.loading {
  background: linear-gradient(135deg, #6b7280, #9ca3af);
}

.action-btn.secondary {
  background: white;
  color: #4b5563;
  border: 2px solid #e5e7eb;
}

.action-btn.secondary:hover {
  background: #f8fafc;
  border-color: #d1d5db;
  transform: translateY(-2px);
}

.btn-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.btn-icon {
  font-size: 1.2rem;
}

.secondary-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 1.5rem;
  flex-wrap: wrap;
}

/* Informations utiles */
.useful-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin: 3rem 0;
}

.info-section {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  border: 1px solid #e5e7eb;
}

.section-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.section-content h4 {
  font-size: 1.1rem;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
  font-weight: 600;
}

.section-content p {
  color: #6b7280;
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.5;
}

/* Conseils de livraison */
.delivery-tips {
  background: linear-gradient(135deg, #fffbeb, #fef3c7);
  border-radius: 20px;
  padding: 2.5rem;
  margin: 3rem 0;
  border: 1px solid #fcd34d;
}

.delivery-tips h3 {
  color: #92400e;
  margin: 0 0 2rem 0;
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.tips-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.tip-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid #fde68a;
  transition: transform 0.3s ease;
}

.tip-card:hover {
  transform: translateY(-3px);
}

.tip-icon {
  font-size: 2rem;
  margin-bottom: 1rem;
  display: inline-block;
}

.tip-card h4 {
  color: #92400e;
  margin: 0 0 0.75rem 0;
  font-size: 1.1rem;
}

.tip-card p {
  color: #92400e;
  margin: 0;
  font-size: 0.9rem;
  opacity: 0.9;
}

/* Footer */
.confirmation-footer {
  text-align: center;
  padding: 2rem;
  background: white;
  border-radius: 16px;
  margin-top: 3rem;
  border: 1px solid #e5e7eb;
}

.thank-you {
  font-size: 1.3rem;
  font-weight: 600;
  color: #3b82f6;
  margin: 0 0 1.5rem 0;
}

.footer-links {
  display: flex;
  justify-content: center;
  gap: 2rem;
  flex-wrap: wrap;
}

.footer-link {
  color: #3b82f6;
  text-decoration: none;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.footer-link:hover {
  background: #f0f9ff;
  text-decoration: underline;
}

/* Toast notification */
.toast-notification {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  background: #10b981;
  color: white;
  padding: 1rem 1.5rem;
  border-radius: 10px;
  box-shadow: 0 10px 25px rgba(16, 185, 129, 0.3);
  z-index: 1000;
  transform: translateY(100px);
  opacity: 0;
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.toast-notification.show {
  transform: translateY(0);
  opacity: 1;
}

/* Responsive */
@media (max-width: 1024px) {
  .header-content {
    flex-direction: column;
    text-align: center;
    gap: 2rem;
  }
  
  .header-text h1 {
    font-size: 2.5rem;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .order-confirmation {
    padding: 0 0.5rem 2rem;
  }
  
  .confirmation-header {
    padding: 3rem 1.5rem;
  }
  
  .delivery-timeline,
  .info-card,
  .main-actions {
    padding: 1.5rem;
  }
  
  .timeline-step {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .step-indicator {
    display: none;
  }
  
  .step-content {
    padding-left: 0;
  }
  
  .step-meta {
    padding-left: 0;
  }
  
  .action-btn.primary {
    min-width: 100%;
  }
  
  .secondary-actions {
    flex-direction: column;
  }
  
  .useful-info,
  .tips-grid {
    grid-template-columns: 1fr;
  }
  
  .footer-links {
    flex-direction: column;
    gap: 1rem;
  }
}

/* Styles pour l'impression */
@media print {
  .confirmation-header,
  .main-actions,
  .confirmation-footer,
  .action-btn,
  .copy-tracking,
  .badge-copy {
    display: none;
  }
  
  .order-confirmation {
    padding: 0;
  }
  
  .info-card {
    box-shadow: none;
    border: 1px solid #e5e7eb;
    break-inside: avoid;
  }
  
  .delivery-tips {
    background: none;
    border: 1px solid #e5e7eb;
  }
}
</style>
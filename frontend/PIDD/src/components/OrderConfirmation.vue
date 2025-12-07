<template>
  <div class="order-confirmation">
    <div class="confirmation-header">
      <div class="success-icon">✅</div>
      <h1 class="confirmation-title">Commande confirmée !</h1>
      <p class="confirmation-subtitle">
        Merci pour votre achat, {{ user?.prenom || 'Cher client' }} !
      </p>
    </div>
    
    <!-- Résumé de la commande -->
    <div class="order-details">
      <div class="details-card">
        <h3>Détails de votre commande</h3>
        
        <div class="order-info">
          <div class="info-item">
            <span class="info-label">Numéro de commande</span>
            <span class="info-value">{{ order.id }}</span>
          </div>
          
          <div class="info-item">
            <span class="info-label">Date de commande</span>
            <span class="info-value">{{ order.date }}</span>
          </div>
          
          <div class="info-item">
            <span class="info-label">Statut</span>
            <span class="info-value status-badge" :class="order.status">
              {{ getStatusText(order.status) }}
            </span>
          </div>
          
          <div class="info-item">
            <span class="info-label">Montant total</span>
            <span class="info-value total-amount">{{ formatPrice(order.total) }}</span>
          </div>
        </div>
      </div>
      
      <!-- Colonnes d'information -->
      <div class="info-columns">
        <!-- Adresse de livraison -->
        <div class="info-column">
          <h4>Livraison</h4>
          <div class="column-content">
            <p><strong>{{ order.address.fullName }}</strong></p>
            <p>{{ order.address.street }}</p>
            <p v-if="order.address.additional">{{ order.address.additional }}</p>
            <p>{{ order.address.city }}, {{ order.address.postalCode }}</p>
            <p>{{ getCountryName(order.address.country) }}</p>
            <p>📞 {{ order.address.phone }}</p>
            
            <div class="delivery-estimate">
              <p class="estimate-title">Livraison estimée :</p>
              <p class="estimate-date">{{ order.delivery.estimatedDate }}</p>
              <p class="estimate-method">{{ order.delivery.method }}</p>
            </div>
          </div>
        </div>
        
        <!-- Mode de paiement -->
        <div class="info-column">
          <h4>Paiement</h4>
          <div class="column-content">
            <div class="payment-method-display">
              <div class="payment-icon">{{ getPaymentIcon(order.payment.method) }}</div>
              <div>
                <p class="payment-name">{{ getPaymentMethodName(order.payment.method) }}</p>
                <p v-if="order.payment.transactionId" class="transaction-id">
                  Transaction: {{ order.payment.transactionId }}
                </p>
                <p class="payment-status" :class="order.payment.status">
                  {{ getPaymentStatusText(order.payment.status) }}
                </p>
              </div>
            </div>
            
            <div class="payment-amount">
              <p>Montant payé : {{ formatPrice(order.payment.amount) }}</p>
              <p class="payment-date">Le {{ order.payment.date }}</p>
            </div>
          </div>
        </div>
        
        <!-- Articles commandés -->
        <div class="info-column full-width">
          <h4>Articles commandés</h4>
          <div class="order-items">
            <div 
              v-for="item in order.items" 
              :key="item.id" 
              class="order-item"
            >
              <img 
                :src="getProductImage(item.img)" 
                :alt="item.name"
                class="item-image"
              />
              <div class="item-details">
                <h5>{{ item.name }}</h5>
                <p class="item-brand">{{ item.brand }}</p>
                <div class="item-quantity-price">
                  <span class="quantity">Quantité : {{ item.quantity }}</span>
                  <span class="price">{{ formatPrice(item.price * item.quantity) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Suivi de commande -->
      <div class="order-tracking">
        <h4>Suivi de votre commande</h4>
        <div class="tracking-timeline">
          <div 
            v-for="step in trackingSteps"
            :key="step.id"
            :class="['tracking-step', { active: step.active, completed: step.completed }]"
          >
            <div class="step-icon">{{ step.icon }}</div>
            <div class="step-content">
              <h5>{{ step.title }}</h5>
              <p>{{ step.description }}</p>
              <p v-if="step.date" class="step-date">{{ step.date }}</p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Actions -->
      <div class="confirmation-actions">
        <button @click="downloadInvoice" class="action-btn secondary">
          📄 Télécharger la facture
        </button>
        
        <button @click="trackOrder" class="action-btn primary">
          🚚 Suivre ma commande
        </button>
        
        <router-link to="/categories" class="action-btn success">
          🛒 Continuer mes achats
        </router-link>
      </div>
      
      <!-- Contact -->
      <div class="contact-info">
        <p>Des questions concernant votre commande ?</p>
        <div class="contact-options">
          <a href="mailto:support@monshop.com" class="contact-link">✉️ support@monshop.com</a>
          <span class="contact-phone">📞 01 23 45 67 89</span>
          <router-link to="/help" class="contact-link">❓ Centre d'aide</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// Import des images (identique aux autres composants)
import noir from '../assets/noir.png'
import blanc from '../assets/blanc.png'
import rosefemme from '../assets/rosefemme.png'
import blancfemme from '../assets/blancfemme.png'
import noirfemme from '../assets/noirfemme.png'
import enfantbleu from '../assets/enfantbleu.png'
import enfantrouge from '../assets/enfantrouge.png'
import gris from '../assets/gris.png'

export default {
  name: 'OrderConfirmation',
  props: {
    order: {
      type: Object,
      required: true
    },
    user: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      trackingSteps: [
        {
          id: 1,
          title: 'Commande confirmée',
          description: 'Votre commande a été validée',
          icon: '✅',
          active: true,
          completed: true,
          date: 'Aujourd\'hui, 14:30'
        },
        {
          id: 2,
          title: 'En préparation',
          description: 'Votre colis est en cours de préparation',
          icon: '📦',
          active: false,
          completed: false,
          date: null
        },
        {
          id: 3,
          title: 'Expédié',
          description: 'Votre colis a été remis au transporteur',
          icon: '🚚',
          active: false,
          completed: false,
          date: null
        },
        {
          id: 4,
          title: 'En livraison',
          description: 'Votre colis est en cours de livraison',
          icon: '🏠',
          active: false,
          completed: false,
          date: null
        },
        {
          id: 5,
          title: 'Livré',
          description: 'Votre commande a été livrée',
          icon: '🎁',
          active: false,
          completed: false,
          date: null
        }
      ],
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
  computed: {
    orderItemsTotal() {
      return this.order.items.reduce((total, item) => 
        total + (item.price * item.quantity), 0)
    }
  },
  mounted() {
    // Émettre l'événement que la commande est confirmée
    this.$emit('order-confirmed', this.order)
    
    // Simuler le suivi
    this.simulateOrderTracking()
  },
  methods: {
    getProductImage(imgName) {
      if (!imgName) return ''
      return this.imageMap[imgName] || ''
    },
    
    formatPrice(price) {
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR'
      }).format(price)
    },
    
    getCountryName(countryCode) {
      const countries = {
        'FR': 'France',
        'BE': 'Belgique',
        'CH': 'Suisse',
        'LU': 'Luxembourg'
      }
      return countries[countryCode] || countryCode
    },
    
    getStatusText(status) {
      const statusMap = {
        'pending': 'En attente',
        'confirmed': 'Confirmée',
        'processing': 'En traitement',
        'shipped': 'Expédiée',
        'delivered': 'Livrée',
        'cancelled': 'Annulée'
      }
      return statusMap[status] || status
    },
    
    getPaymentIcon(method) {
      const icons = {
        'credit_card': '💳',
        'paypal': '🔵',
        'bank_transfer': '🏦',
        'paysafe': '🃏'
      }
      return icons[method] || '💰'
    },
    
    getPaymentMethodName(method) {
      const names = {
        'credit_card': 'Carte bancaire',
        'paypal': 'PayPal',
        'bank_transfer': 'Virement bancaire',
        'paysafe': 'Paysafe Card'
      }
      return names[method] || method
    },
    
    getPaymentStatusText(status) {
      const statusMap = {
        'pending': 'En attente',
        'processing': 'En traitement',
        'completed': 'Payé',
        'failed': 'Échoué',
        'refunded': 'Remboursé'
      }
      return statusMap[status] || status
    },
    
    simulateOrderTracking() {
      // Simuler l'avancement du suivi
      setTimeout(() => {
        this.trackingSteps[1].active = true
        this.trackingSteps[1].completed = true
        this.trackingSteps[1].date = 'Demain matin'
      }, 3000)
      
      setTimeout(() => {
        this.trackingSteps[2].active = true
        this.trackingSteps[2].completed = true
        this.trackingSteps[2].date = 'Après-demain'
      }, 6000)
    },
    
    downloadInvoice() {
      // Générer une facture PDF
      console.log('📄 Téléchargement facture pour commande:', this.order.id)
      alert('Facture générée avec succès !')
      
      // Envoyer par email
      this.sendInvoiceEmail()
    },
    
    trackOrder() {
      // Rediriger vers le suivi
      window.open(`/tracking/${this.order.id}`, '_blank')
    },
    
    async sendInvoiceEmail() {
      try {
        console.log('📧 Envoi facture par email...')
        // Simulation d'envoi
        await new Promise(resolve => setTimeout(resolve, 1000))
        alert('Facture envoyée par email avec succès !')
      } catch (error) {
        console.error('❌ Erreur envoi email:', error)
      }
    },
    
    printOrder() {
      window.print()
    }
  }
}
</script>

<style scoped>
.order-confirmation {
  background: linear-gradient(135deg, #f0f9ff 0%, #e6f7ff 100%);
  min-height: 100vh;
  padding: 2rem;
}

.confirmation-header {
  text-align: center;
  margin-bottom: 3rem;
  padding: 2rem;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.success-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  animation: bounce 1s ease;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {transform: translateY(0);}
  40% {transform: translateY(-20px);}
  60% {transform: translateY(-10px);}
}

.confirmation-title {
  color: #059669;
  font-size: 2.5rem;
  margin: 0 0 0.5rem 0;
}

.confirmation-subtitle {
  color: #6b7280;
  font-size: 1.1rem;
  margin: 0;
}

/* Détails de commande */
.order-details {
  max-width: 1000px;
  margin: 0 auto;
}

.details-card {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.details-card h3 {
  margin: 0 0 1.5rem 0;
  color: #1f2937;
  border-bottom: 2px solid #3b82f6;
  padding-bottom: 0.5rem;
}

.order-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-label {
  font-size: 0.9rem;
  color: #6b7280;
  font-weight: 500;
}

.info-value {
  font-size: 1.1rem;
  color: #1f2937;
  font-weight: 600;
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
}

.status-badge.confirmed {
  background: #d1fae5;
  color: #065f46;
}

.status-badge.processing {
  background: #fef3c7;
  color: #92400e;
}

.status-badge.shipped {
  background: #dbeafe;
  color: #1e40af;
}

.total-amount {
  color: #3b82f6;
  font-size: 1.3rem;
}

/* Colonnes d'information */
.info-columns {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.info-column {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.info-column.full-width {
  grid-column: 1 / -1;
}

.info-column h4 {
  margin: 0 0 1rem 0;
  color: #1f2937;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 0.5rem;
}

.column-content {
  padding: 0.5rem 0;
}

/* Adresse de livraison */
.column-content p {
  margin: 0.5rem 0;
  color: #4b5563;
  font-size: 0.95rem;
}

.delivery-estimate {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

.estimate-title {
  font-weight: 600;
  color: #1f2937;
}

.estimate-date {
  font-size: 1.1rem;
  color: #3b82f6;
  font-weight: 600;
}

.estimate-method {
  color: #6b7280;
  font-size: 0.9rem;
}

/* Mode de paiement */
.payment-method-display {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.payment-icon {
  font-size: 2rem;
}

.payment-name {
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 0.25rem 0;
}

.transaction-id {
  font-family: monospace;
  font-size: 0.85rem;
  color: #6b7280;
  margin: 0;
}

.payment-status {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  margin-top: 0.5rem;
}

.payment-status.completed {
  background: #d1fae5;
  color: #065f46;
}

.payment-amount {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

.payment-amount p {
  margin: 0.5rem 0;
  font-size: 1rem;
}

.payment-date {
  color: #6b7280;
  font-size: 0.9rem;
}

/* Articles commandés */
.order-items {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-height: 400px;
  overflow-y: auto;
  padding: 1rem 0;
}

.order-item {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #f9fafb;
}

.item-image {
  width: 80px;
  height: 80px;
  object-fit: contain;
  border-radius: 6px;
  background: white;
  padding: 0.5rem;
}

.item-details {
  flex-grow: 1;
}

.item-details h5 {
  margin: 0 0 0.25rem 0;
  color: #1f2937;
  font-size: 1rem;
}

.item-brand {
  margin: 0 0 0.5rem 0;
  color: #6b7280;
  font-size: 0.9rem;
}

.item-quantity-price {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.quantity {
  color: #6b7280;
  font-size: 0.9rem;
}

.price {
  font-weight: 600;
  color: #1f2937;
}

/* Suivi de commande */
.order-tracking {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.order-tracking h4 {
  margin: 0 0 1.5rem 0;
  color: #1f2937;
}

.tracking-timeline {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  position: relative;
  padding-left: 2.5rem;
}

.tracking-timeline::before {
  content: '';
  position: absolute;
  left: 30px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: #e5e7eb;
}

.tracking-step {
  display: flex;
  gap: 1rem;
  position: relative;
  z-index: 1;
}

.tracking-step.completed .step-icon {
  background: #10b981;
  color: white;
}

.tracking-step.active .step-icon {
  background: #3b82f6;
  color: white;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(59, 130, 246, 0); }
  100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
}

.step-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  flex-shrink: 0;
  transition: all 0.3s ease;
}

.step-content {
  flex-grow: 1;
  padding-top: 0.5rem;
}

.step-content h5 {
  margin: 0 0 0.25rem 0;
  color: #1f2937;
  font-size: 1rem;
}

.step-content p {
  margin: 0.25rem 0;
  color: #6b7280;
  font-size: 0.9rem;
}

.step-date {
  font-weight: 600;
  color: #3b82f6 !important;
}

/* Actions */
.confirmation-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin: 2rem 0;
  flex-wrap: wrap;
}

.action-btn {
  padding: 1rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  text-align: center;
  transition: all 0.3s ease;
  border: none;
  font-size: 1rem;
  min-width: 200px;
}

.action-btn.primary {
  background: #3b82f6;
  color: white;
}

.action-btn.primary:hover {
  background: #2563eb;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
}

.action-btn.secondary {
  background: #e5e7eb;
  color: #374151;
  border: 1px solid #d1d5db;
}

.action-btn.secondary:hover {
  background: #d1d5db;
  transform: translateY(-2px);
}

.action-btn.success {
  background: #10b981;
  color: white;
}

.action-btn.success:hover {
  background: #059669;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3);
}

/* Contact */
.contact-info {
  text-align: center;
  padding: 2rem;
  background: white;
  border-radius: 12px;
  margin-top: 2rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.contact-info p {
  margin: 0 0 1rem 0;
  color: #4b5563;
}

.contact-options {
  display: flex;
  gap: 2rem;
  justify-content: center;
  flex-wrap: wrap;
}

.contact-link,
.contact-phone {
  color: #3b82f6;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.3s ease;
}

.contact-link:hover {
  color: #2563eb;
  text-decoration: underline;
}

/* Responsive */
@media (max-width: 768px) {
  .order-confirmation {
    padding: 1rem;
  }
  
  .confirmation-title {
    font-size: 2rem;
  }
  
  .info-columns {
    grid-template-columns: 1fr;
  }
  
  .confirmation-actions {
    flex-direction: column;
  }
  
  .action-btn {
    min-width: 100%;
  }
  
  .tracking-timeline {
    padding-left: 1rem;
  }
  
  .tracking-timeline::before {
    left: 20px;
  }
  
  .step-icon {
    width: 40px;
    height: 40px;
    font-size: 1rem;
  }
}
</style>
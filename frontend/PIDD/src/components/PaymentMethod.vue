<template>
  <div class="payment-method">
    <h3 class="payment-title">Méthode de paiement</h3>
    
    <!-- Sélection de la méthode -->
    <div class="methods-list">
      <div 
        v-for="method in paymentMethods"
        :key="method.id"
        :class="['method-card', { selected: selectedMethod === method.id }]"
        @click="selectMethod(method.id)"
      >
        <div class="method-icon">
          {{ method.icon }}
        </div>
        <div class="method-info">
          <h4>{{ method.name }}</h4>
          <p>{{ method.description }}</p>
        </div>
        <div v-if="selectedMethod === method.id" class="method-check">
          ✓
        </div>
      </div>
    </div>
    
    <!-- Formulaire dynamique selon la méthode -->
    <div v-if="selectedMethod" class="payment-form">
      <div class="form-header">
        <h4>Détails du paiement</h4>
        <div class="amount-display">
          Montant : <span class="amount">{{ formatPrice(amount) }}</span>
        </div>
      </div>
      
      <!-- Carte bancaire -->
      <div v-if="selectedMethod === 'credit_card'" class="method-form">
        <CreditCardForm 
          :amount="amount"
          @payment-success="handlePaymentSuccess"
          @payment-error="handlePaymentError"
        />
      </div>
      
      <!-- PayPal -->
      <div v-else-if="selectedMethod === 'paypal'" class="method-form">
        <PayPalButton 
          :amount="amount"
          @payment-success="handlePaymentSuccess"
          @payment-cancelled="handlePaymentCancelled"
          @pay-with-card="switchToCreditCard"
        />
      </div>
      
      <!-- Virement bancaire -->
      <div v-else-if="selectedMethod === 'bank_transfer'" class="method-form">
        <BankTransferInfo 
          :amount="amount"
          :order-number="orderNumber"
          @payment-initiated="handlePaymentInitiated"
          @payment-confirmed="handlePaymentConfirmed"
        />
      </div>
      
      <!-- Paysafe -->
      <div v-else-if="selectedMethod === 'paysafe'" class="method-form">
        <PaysafeForm 
          :amount="amount"
          @payment-success="handlePaymentSuccess"
          @choose-other-method="showMethodSelection"
        />
      </div>
    </div>
    
    <!-- Navigation -->
    <div v-if="selectedMethod" class="payment-navigation">
      <button 
        class="nav-btn back-btn"
        @click="showMethodSelection"
      >
        ← Changer de méthode
      </button>
      
      <div class="secure-payment">
        <span class="secure-icon">🔒</span>
        <span class="secure-text">Paiement 100% sécurisé</span>
      </div>
    </div>
    
    <!-- Messages d'état -->
    <div v-if="paymentMessage" :class="['payment-message', messageType]">
      {{ paymentMessage }}
      <button v-if="messageType === 'error'" class="retry-btn" @click="retryPayment">
        Réessayer
      </button>
    </div>
  </div>
</template>

<script>
import CreditCardForm from './CreditCardForm.vue'
import PayPalButton from './PayPalButton.vue'
import BankTransferInfo from './BankTransferInfo.vue'
import PaysafeForm from './PaysafeForm.vue'

export default {
  name: 'PaymentMethod',
  components: {
    CreditCardForm,
    PayPalButton,
    BankTransferInfo,
    PaysafeForm
  },
  props: {
    amount: {
      type: Number,
      required: true
    },
    orderNumber: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      selectedMethod: null,
      paymentMessage: '',
      messageType: 'info',
      processing: false,
      paymentMethods: [
        {
          id: 'credit_card',
          name: 'Carte de crédit/débit',
          description: 'Visa, Mastercard, American Express',
          icon: '💳',
          enabled: true
        },
        {
          id: 'paypal',
          name: 'PayPal',
          description: 'Paiement rapide et sécurisé',
          icon: '🔵',
          enabled: true
        },
        {
          id: 'bank_transfer',
          name: 'Virement bancaire',
          description: 'Coordonnées bancaires',
          icon: '🏦',
          enabled: true
        },
        {
          id: 'paysafe',
          name: 'Paysafe Card',
          description: 'Carte prépayée',
          icon: '🃏',
          enabled: true
        }
      ]
    }
  },
  computed: {
    // Filtrer les méthodes disponibles (pourrait dépendre de conditions)
    availableMethods() {
      return this.paymentMethods.filter(method => method.enabled)
    }
  },
  methods: {
    formatPrice(price) {
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR'
      }).format(price)
    },
    
    selectMethod(methodId) {
      if (this.processing) return
      
      this.selectedMethod = methodId
      this.paymentMessage = ''
      this.$emit('payment-method-selected', methodId)
    },
    
    showMethodSelection() {
      this.selectedMethod = null
      this.paymentMessage = ''
    },
    
    switchToCreditCard() {
      this.selectMethod('credit_card')
      this.showMessage('Vous pouvez maintenant payer avec votre carte bancaire', 'info')
    },
    
    handlePaymentSuccess(paymentData) {
      console.log('✅ Paiement réussi:', paymentData)
      
      this.showMessage('Paiement confirmé avec succès !', 'success')
      this.processing = false
      
      // Émettre l'événement vers le parent
      this.$emit('payment-completed', {
        method: this.selectedMethod,
        ...paymentData,
        timestamp: new Date().toISOString()
      })
    },
    
    handlePaymentError(error) {
      console.error('❌ Erreur paiement:', error)
      
      this.showMessage(`Erreur: ${error.message || 'Le paiement a échoué'}`, 'error')
      this.processing = false
      
      this.$emit('payment-error', {
        method: this.selectedMethod,
        error: error.message,
        timestamp: new Date().toISOString()
      })
    },
    
    handlePaymentCancelled() {
      console.log('❌ Paiement annulé')
      
      this.showMessage('Paiement annulé par l\'utilisateur', 'warning')
      this.processing = false
      
      this.$emit('payment-cancelled', {
        method: this.selectedMethod,
        timestamp: new Date().toISOString()
      })
    },
    
    handlePaymentInitiated(data) {
      console.log('🔄 Paiement initié:', data)
      
      this.showMessage(`Virement initié. Référence: ${data.reference}`, 'info')
      
      this.$emit('payment-initiated', {
        method: this.selectedMethod,
        ...data,
        timestamp: new Date().toISOString()
      })
    },
    
    handlePaymentConfirmed(data) {
      console.log('✅ Virement confirmé:', data)
      
      this.showMessage('Virement confirmé. Votre commande sera traitée sous 24h.', 'success')
      this.processing = false
      
      // Pour le virement, on considère le paiement comme complété
      this.$emit('payment-completed', {
        method: this.selectedMethod,
        ...data,
        status: 'pending_bank_transfer',
        timestamp: new Date().toISOString()
      })
    },
    
    showMessage(message, type = 'info') {
      this.paymentMessage = message
      this.messageType = type
      
      // Effacer le message après 5 secondes (sauf erreur)
      if (type !== 'error') {
        setTimeout(() => {
          this.paymentMessage = ''
        }, 5000)
      }
    },
    
    retryPayment() {
      this.paymentMessage = ''
      this.$emit('retry-payment')
    }
  }
}
</script>

<style scoped>
.payment-method {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.payment-title {
  margin: 0 0 1.5rem 0;
  color: #1f2937;
  font-size: 1.5rem;
  border-bottom: 2px solid #3b82f6;
  padding-bottom: 0.5rem;
}

/* Liste des méthodes */
.methods-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

.method-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.method-card:hover {
  border-color: #9ca3af;
  background: #f9fafb;
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.method-card.selected {
  border-color: #3b82f6;
  background: #f0f9ff;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1);
}

.method-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.method-info {
  flex-grow: 1;
}

.method-info h4 {
  margin: 0 0 0.25rem 0;
  color: #1f2937;
  font-size: 1.1rem;
}

.method-info p {
  margin: 0;
  color: #6b7280;
  font-size: 0.9rem;
}

.method-check {
  color: #10b981;
  font-weight: bold;
  font-size: 1.5rem;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #d1fae5;
  border-radius: 50%;
}

/* En-tête du formulaire */
.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.form-header h4 {
  margin: 0;
  color: #1f2937;
}

.amount-display {
  color: #6b7280;
  font-weight: 500;
}

.amount {
  color: #3b82f6;
  font-weight: bold;
  font-size: 1.1rem;
}

/* Formulaire de méthode */
.method-form {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Navigation */
.payment-navigation {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.nav-btn {
  padding: 0.75rem 1.5rem;
  background: #e5e7eb;
  color: #374151;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.nav-btn:hover {
  background: #d1d5db;
  transform: translateY(-1px);
}

.secure-payment {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #10b981;
  font-weight: 500;
}

.secure-icon {
  font-size: 1.2rem;
}

/* Messages */
.payment-message {
  margin-top: 1.5rem;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.payment-message.success {
  background: #d1fae5;
  color: #065f46;
  border-left: 4px solid #10b981;
}

.payment-message.error {
  background: #fef2f2;
  color: #dc2626;
  border-left: 4px solid #ef4444;
}

.payment-message.warning {
  background: #fef3c7;
  color: #92400e;
  border-left: 4px solid #f59e0b;
}

.payment-message.info {
  background: #e0f2fe;
  color: #0369a1;
  border-left: 4px solid #0ea5e9;
}

.retry-btn {
  margin-left: 1rem;
  padding: 0.25rem 0.75rem;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s ease;
}

.retry-btn:hover {
  background: #dc2626;
}

/* Responsive */
@media (max-width: 768px) {
  .payment-method {
    padding: 1rem;
  }
  
  .form-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .payment-navigation {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .nav-btn {
    width: 100%;
  }
  
  .secure-payment {
    justify-content: center;
  }
}
</style>
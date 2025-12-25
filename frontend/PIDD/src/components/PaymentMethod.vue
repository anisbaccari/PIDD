<template>
  <div class="payment-method">
    <h3 class="payment-title">Méthode de paiement</h3>

    <!-- Sélection de la méthode -->
    <div class="methods-list">
      <div
        v-for="method in availableMethods"
        :key="method.id"
        :class="['method-card', { selected: selectedMethod === method.id }]"
        @click="selectMethod(method.id)"
      >
        <div class="method-icon">{{ method.icon }}</div>

        <div class="method-info">
          <h4>{{ method.name }}</h4>
          <p>{{ method.description }}</p>
        </div>

        <div v-if="selectedMethod === method.id" class="method-check">
          ✓
        </div>
      </div>
    </div>

    <!-- Formulaire dynamique -->
    <div v-if="selectedMethod" class="payment-form">
      <div class="form-header">
        <h4>Détails du paiement</h4>
        <div class="amount-display">
          Montant :
          <span class="amount">{{ formatPrice(amount) }}</span>
        </div>
      </div>

      <!-- Carte bancaire -->
      <CreditCardForm
        v-if="selectedMethod === 'credit_card'"
        :amount="amount"
        @payment-success="handlePaymentSuccess"
        @payment-error="handlePaymentError"
      />

      <!-- PayPal -->
      <PayPalButton
        v-else-if="selectedMethod === 'paypal'"
        :amount="amount"
        @payment-completed="handlePaymentSuccess"
        @payment-cancelled="handlePaymentCancelled"
        @pay-with-card="switchToCreditCard"
      />

      <!-- Virement bancaire -->
      <BankTransferInfo
        v-else-if="selectedMethod === 'bank_transfer'"
        :amount="amount"
        :order-number="orderNumber"
        @payment-initiated="handlePaymentInitiated"
        @payment-confirmed="handlePaymentConfirmed"
      />

      <!-- Paysafe -->
      <PaysafeForm
        v-else-if="selectedMethod === 'paysafe'"
        :amount="amount"
        @payment-success="handlePaymentSuccess"
        @choose-other-method="showMethodSelection"
      />
    </div>

    <!-- Navigation -->
    <div v-if="selectedMethod" class="payment-navigation">
      <button class="nav-btn back-btn" @click="showMethodSelection">
        ← Changer de méthode
      </button>

      <div class="secure-payment">
        <span class="secure-icon">🔒</span>
        <span class="secure-text">Paiement 100% sécurisé</span>
      </div>
    </div>

    <!-- Messages -->
    <div v-if="paymentMessage" :class="['payment-message', messageType]">
      {{ paymentMessage }}
      <button
        v-if="messageType === 'error'"
        class="retry-btn"
        @click="retryPayment"
      >
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
          name: 'Carte bancaire',
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
          description: 'Paiement sous 24h',
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
    availableMethods() {
      return this.paymentMethods.filter(m => m.enabled)
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
      this.showMessage(
        'Vous pouvez maintenant payer avec votre carte bancaire',
        'info'
      )
    },

    handlePaymentSuccess(paymentData) {
      this.processing = false
      this.showMessage('Paiement confirmé avec succès ✔️', 'success')

      // Émettre l'événement avec les bonnes données
      this.$emit('payment-completed', {
        method: this.selectedMethod,
        transactionId: paymentData.transactionId || this.generateTransactionId(),
        status: 'completed',
        amount: this.amount,
        currency: 'EUR',
        ...paymentData,
        timestamp: new Date().toISOString()
      })
    },

    handlePaymentError(error) {
      this.processing = false
      this.showMessage(error.message || 'Paiement échoué', 'error')

      this.$emit('payment-error', {
        method: this.selectedMethod,
        error: error.message || 'Erreur inconnue',
        timestamp: new Date().toISOString()
      })
    },

    handlePaymentCancelled() {
      this.processing = false
      this.showMessage('Paiement annulé', 'warning')
      
      this.$emit('payment-cancelled', {
        method: this.selectedMethod,
        timestamp: new Date().toISOString()
      })
    },

    handlePaymentInitiated(data) {
      this.showMessage(`Virement initié (ref: ${data.reference})`, 'info')
      
      this.$emit('payment-initiated', {
        method: this.selectedMethod,
        reference: data.reference,
        ...data,
        timestamp: new Date().toISOString()
      })
    },

    handlePaymentConfirmed(data) {
      this.processing = false
      this.showMessage(
        'Virement confirmé, commande en cours de traitement',
        'success'
      )
      
      this.$emit('payment-completed', {
        method: this.selectedMethod,
        transactionId: data.transactionId || this.generateTransactionId(),
        status: 'completed',
        amount: this.amount,
        currency: 'EUR',
        ...data,
        timestamp: new Date().toISOString()
      })
    },

    showMessage(message, type = 'info') {
      this.paymentMessage = message
      this.messageType = type

      if (type !== 'error') {
        setTimeout(() => (this.paymentMessage = ''), 5000)
      }
    },

    retryPayment() {
      this.paymentMessage = ''
    },
    
    generateTransactionId() {
      const timestamp = Date.now().toString(36).toUpperCase()
      const random = Math.random().toString(36).substring(2, 8).toUpperCase()
      return `TXN-${timestamp}-${random}`
    }
  }
}
</script>

<style scoped>
.payment-method {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.payment-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #e5e7eb;
}

.methods-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.method-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.method-card:hover {
  border-color: #8b5cf6;
  background: #f8fafc;
}

.method-card.selected {
  border-color: #8b5cf6;
  background: rgba(139, 92, 246, 0.05);
}

.method-icon {
  font-size: 1.5rem;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f3f4f6;
  border-radius: 8px;
}

.method-info {
  flex: 1;
}

.method-info h4 {
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.25rem;
}

.method-info p {
  color: #6b7280;
  font-size: 0.875rem;
  margin: 0;
}

.method-check {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 24px;
  height: 24px;
  background: #10b981;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: bold;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.payment-form {
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.form-header h4 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.amount-display {
  color: #6b7280;
  font-size: 0.95rem;
}

.amount {
  font-weight: 600;
  color: #8b5cf6;
  font-size: 1.125rem;
}

.payment-navigation {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

.nav-btn {
  background: none;
  border: none;
  color: #6b7280;
  font-size: 0.875rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.nav-btn:hover {
  background: #f3f4f6;
  color: #4b5563;
}

.secure-payment {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #10b981;
  font-size: 0.875rem;
  font-weight: 500;
}

.secure-icon {
  font-size: 1rem;
}

.payment-message {
  margin-top: 1rem;
  padding: 1rem;
  border-radius: 8px;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
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
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.2);
  color: #065f46;
}

.payment-message.error {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  color: #991b1b;
}

.payment-message.warning {
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.2);
  color: #92400e;
}

.payment-message.info {
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.2);
  color: #1e40af;
}

.retry-btn {
  background: #ef4444;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background 0.2s ease;
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
    align-self: flex-start;
  }
  
  .secure-payment {
    justify-content: center;
  }
}
</style>
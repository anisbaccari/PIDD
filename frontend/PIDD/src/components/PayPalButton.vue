<template>
  <div class="paypal-button-container">
    <div class="paypal-header">
      <div class="paypal-logo">
        <span class="paypal-blue">Pay</span><span class="paypal-yellow">Pal</span>
      </div>
      <p class="paypal-tagline">Paiement rapide et sécurisé</p>
    </div>
    
    <div class="paypal-info">
      <div class="benefits">
        <div class="benefit">
          <span class="benefit-icon">⚡</span>
          <span class="benefit-text">Paiement en 1 clic</span>
        </div>
        <div class="benefit">
          <span class="benefit-icon">🔒</span>
          <span class="benefit-text">Protection de l'acheteur</span>
        </div>
        <div class="benefit">
          <span class="benefit-icon">🌍</span>
          <span class="benefit-text">Accepté mondialement</span>
        </div>
      </div>
      
      <div class="paypal-options">
        <div class="option-group">
          <label class="option-label">
            <input
              type="radio"
              v-model="paypalOption"
              value="pay_now"
              checked
            />
            <span>Payer maintenant avec PayPal</span>
          </label>
          <p class="option-description">
            Vous serez redirigé vers PayPal pour finaliser votre paiement
          </p>
        </div>
        
        <div class="option-group">
          <label class="option-label">
            <input
              type="radio"
              v-model="paypalOption"
              value="paypal_credit"
            />
            <span>Payer avec PayPal Crédit</span>
          </label>
          <p class="option-description">
            4x sans frais disponible • Conditions d'éligibilité
          </p>
        </div>
        
        <div class="option-group">
          <label class="option-label">
            <input
              type="checkbox"
              v-model="savePaypalInfo"
            />
            <span>Mémoriser mon compte PayPal pour plus tard</span>
          </label>
        </div>
      </div>
      
      <!-- Bouton PayPal -->
      <div class="paypal-button-wrapper">
        <button 
          class="paypal-button"
          @click="initiatePayPalPayment"
          :disabled="processing"
          :class="{ 'processing': processing }"
        >
          <div class="paypal-button-content">
            <span class="paypal-button-logo">
              <span class="paypal-blue">Pay</span><span class="paypal-yellow">Pal</span>
            </span>
            <span class="paypal-button-text">
              <span v-if="!processing">Payer avec PayPal</span>
              <span v-else>Connexion à PayPal...</span>
            </span>
            <span class="paypal-amount">{{ formatPrice(amount) }}</span>
          </div>
          <div v-if="processing" class="button-loading">
            <div class="loading-spinner"></div>
          </div>
        </button>
      </div>
      
      <!-- Détails de sécurité -->
      <div class="security-details">
        <p class="security-title">🔒 Sécurité PayPal</p>
        <ul class="security-list">
          <li>Paiement crypté SSL</li>
          <li>Protection de l'acheteur incluse</li>
          <li>Aucune information bancaire partagée avec le marchand</li>
          <li>Annulation possible sous 180 jours</li>
        </ul>
      </div>
      
      <!-- Alternative -->
      <div class="alternative-payment">
        <p class="alternative-title">Vous n'avez pas de compte PayPal ?</p>
        <p class="alternative-description">
          Vous pouvez payer avec votre carte bancaire via PayPal sans créer de compte
        </p>
        <button 
          class="alternative-button"
          @click="payWithCard"
        >
          Payer avec carte sans compte PayPal
        </button>
      </div>
      
      <!-- FAQ -->
      <div class="faq-section">
        <details class="faq-item">
          <summary class="faq-question">Comment fonctionne PayPal ?</summary>
          <div class="faq-answer">
            <p>PayPal agit comme intermédiaire sécurisé entre vous et le marchand.</p>
            <p>Vous vous connectez à votre compte PayPal et confirmez le paiement.</p>
            <p>Le marchand ne voit jamais vos informations bancaires.</p>
          </div>
        </details>
        
        <details class="faq-item">
          <summary class="faq-question">Quelle est la protection acheteur ?</summary>
          <div class="faq-answer">
            <p>PayPal protège vos achats :</p>
            <ul>
              <li>Article non reçu ? Remboursement garanti</li>
              <li>Article différent de la description ? Remboursement garanti</li>
              <li>Protection contre les paiements non autorisés</li>
            </ul>
          </div>
        </details>
      </div>
    </div>
    
    <!-- Simulateur de redirection PayPal -->
    <div v-if="showPayPalRedirect" class="paypal-redirect-simulator">
      <div class="redirect-modal">
        <div class="redirect-header">
          <div class="redirect-logo">
            <span class="paypal-blue">Pay</span><span class="paypal-yellow">Pal</span>
          </div>
          <button class="redirect-close" @click="cancelRedirect">×</button>
        </div>
        
        <div class="redirect-content">
          <div class="redirect-loading">
            <div class="loading-spinner large"></div>
            <p>Connexion sécurisée à PayPal...</p>
          </div>
          
          <div class="redirect-message">
            <p>Vous allez être redirigé vers le site sécurisé de PayPal.</p>
            <p>Veuillez vous connecter et confirmer votre paiement.</p>
          </div>
          
          <div class="redirect-details">
            <div class="detail-item">
              <span class="detail-label">Marchand :</span>
              <span class="detail-value">MonShop</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Montant :</span>
              <span class="detail-value">{{ formatPrice(amount) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Référence :</span>
              <span class="detail-value">CMD-{{ Math.random().toString(36).substring(2, 10).toUpperCase() }}</span>
            </div>
          </div>
        </div>
        
        <div class="redirect-actions">
          <button class="redirect-cancel" @click="cancelRedirect">
            Annuler
          </button>
          <button class="redirect-confirm" @click="simulatePayPalSuccess">
            Confirmer le paiement
          </button>
        </div>
        
        <div class="redirect-security">
          <span class="security-icon">🔒</span>
          <span>Connexion sécurisée • Données cryptées</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PayPalButton',

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
      paypalOption: 'pay_now',
      savePaypalInfo: false,
      processing: false,
      showPayPalRedirect: false
    }
  },

  methods: {
    formatPrice(price) {
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR'
      }).format(Number(price) || 0)
    },

    generateTransactionId() {
      const date = new Date()
      const timestamp = date.getTime().toString(36).toUpperCase()
      const random = Math.random().toString(36).substring(2, 8).toUpperCase()
      return `PAYPAL-${timestamp}-${random}`
    },

    async initiatePayPalPayment() {
      if (this.processing) return

      this.processing = true

      // Simulation délai de connexion
      await new Promise(resolve => setTimeout(resolve, 1200))

      this.showPayPalRedirect = true
      this.processing = false
    },

    simulatePayPalSuccess() {
      const transactionId = this.generateTransactionId()
      const payerEmail = `client-${Math.random().toString(36).substring(2, 8)}@example.com`
      
      // Émettre l'événement avec les données PayPal standardisées
      this.$emit('payment-completed', {
        transactionId,
        provider: 'paypal',
        method: 'paypal',
        payerEmail,
        payerId: `P${Math.random().toString(36).substring(2, 12).toUpperCase()}`,
        status: 'completed',
        amount: this.amount,
        currency: 'EUR',
        paymentOption: this.paypalOption,
        saveInfo: this.savePaypalInfo,
        timestamp: new Date().toISOString(),
        metadata: {
          orderNumber: this.orderNumber,
          paymentGateway: 'PayPal',
          transactionType: 'express_checkout'
        }
      })

      this.showPayPalRedirect = false
      
      // Feedback visuel
      this.processing = true
      setTimeout(() => {
        this.processing = false
      }, 500)
    },

    cancelRedirect() {
      this.showPayPalRedirect = false
      
      // Émettre l'événement d'annulation
      this.$emit('payment-cancelled', {
        provider: 'paypal',
        timestamp: new Date().toISOString(),
        reason: 'user_cancelled'
      })
    },

    payWithCard() {
      // Émettre l'événement pour passer à la carte
      this.$emit('pay-with-card', {
        provider: 'paypal',
        action: 'pay_with_card_without_account',
        timestamp: new Date().toISOString()
      })
    }
  }
}
</script>

<style scoped>
.paypal-button-container {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.paypal-header {
  text-align: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.paypal-logo {
  font-size: 2rem;
  font-weight: 700;
  letter-spacing: -0.5px;
  margin-bottom: 0.5rem;
}

.paypal-blue {
  color: #003087;
}

.paypal-yellow {
  color: #009cde;
}

.paypal-tagline {
  color: #6b7280;
  font-size: 0.95rem;
  margin: 0;
}

.benefits {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.benefit {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 0.75rem;
  background: #f8fafc;
  border-radius: 8px;
}

.benefit-icon {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.benefit-text {
  font-size: 0.8rem;
  color: #4b5563;
  font-weight: 500;
}

.paypal-options {
  margin-bottom: 1.5rem;
}

.option-group {
  margin-bottom: 1rem;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.option-label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  font-weight: 500;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.option-label input[type="radio"],
.option-label input[type="checkbox"] {
  width: 18px;
  height: 18px;
  accent-color: #003087;
}

.option-description {
  color: #6b7280;
  font-size: 0.85rem;
  margin: 0.25rem 0 0 2rem;
}

.paypal-button-wrapper {
  margin: 2rem 0;
}

.paypal-button {
  position: relative;
  width: 100%;
  padding: 1rem 1.5rem;
  background: linear-gradient(135deg, #ffc439 0%, #ffb300 100%);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  overflow: hidden;
}

.paypal-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 196, 57, 0.3);
}

.paypal-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.paypal-button.processing {
  background: linear-gradient(135deg, #ffc439 0%, #ffb300 100%);
}

.paypal-button-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #111;
  font-weight: 600;
  position: relative;
  z-index: 1;
}

.paypal-button-logo {
  font-size: 1.25rem;
  font-weight: 700;
}

.paypal-button-text {
  font-size: 1.1rem;
  text-align: center;
  flex: 1;
}

.paypal-amount {
  font-size: 1.2rem;
  font-weight: 700;
  color: #003087;
}

.button-loading {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 196, 57, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
}

.loading-spinner {
  width: 24px;
  height: 24px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s linear infinite;
}

.loading-spinner.large {
  width: 40px;
  height: 40px;
  border-width: 4px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.security-details {
  background: #f0f9ff;
  border: 1px solid #e0f2fe;
  border-radius: 8px;
  padding: 1rem;
  margin: 1.5rem 0;
}

.security-title {
  font-weight: 600;
  color: #0369a1;
  margin-bottom: 0.75rem;
  font-size: 0.95rem;
}

.security-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.security-list li {
  padding: 0.25rem 0;
  color: #374151;
  font-size: 0.85rem;
  position: relative;
  padding-left: 1.5rem;
}

.security-list li:before {
  content: "✓";
  position: absolute;
  left: 0;
  color: #10b981;
  font-weight: bold;
}

.alternative-payment {
  text-align: center;
  padding: 1.5rem;
  background: #f8fafc;
  border-radius: 8px;
  margin: 1.5rem 0;
}

.alternative-title {
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.alternative-description {
  color: #6b7280;
  font-size: 0.9rem;
  margin-bottom: 1rem;
}

.alternative-button {
  background: white;
  border: 2px solid #003087;
  color: #003087;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.alternative-button:hover {
  background: #003087;
  color: white;
}

.faq-section {
  margin-top: 1.5rem;
}

.faq-item {
  margin-bottom: 0.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
}

.faq-question {
  padding: 1rem;
  background: #f9fafb;
  cursor: pointer;
  font-weight: 500;
  color: #1f2937;
  list-style: none;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.faq-question::-webkit-details-marker {
  display: none;
}

.faq-question:after {
  content: "➕";
  font-size: 1.2rem;
}

.faq-item[open] .faq-question:after {
  content: "➖";
}

.faq-answer {
  padding: 1rem;
  background: white;
  color: #4b5563;
  font-size: 0.9rem;
  line-height: 1.5;
}

.faq-answer p {
  margin: 0.5rem 0;
}

.faq-answer ul {
  margin: 0.5rem 0;
  padding-left: 1.5rem;
}

.faq-answer li {
  margin: 0.25rem 0;
}

/* Modal de redirection */
.paypal-redirect-simulator {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.redirect-modal {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  animation: slideUp 0.4s ease;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.redirect-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.redirect-logo {
  font-size: 1.5rem;
  font-weight: 700;
}

.redirect-close {
  background: none;
  border: none;
  font-size: 2rem;
  color: #6b7280;
  cursor: pointer;
  line-height: 1;
  padding: 0;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.redirect-close:hover {
  background: #f3f4f6;
}

.redirect-content {
  padding: 2rem;
}

.redirect-loading {
  text-align: center;
  margin-bottom: 2rem;
}

.redirect-loading p {
  margin-top: 1rem;
  color: #4b5563;
  font-weight: 500;
}

.redirect-message {
  text-align: center;
  margin-bottom: 2rem;
  color: #6b7280;
  line-height: 1.6;
}

.redirect-details {
  background: #f8fafc;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 2rem;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  margin: 0.5rem 0;
}

.detail-label {
  color: #6b7280;
  font-size: 0.9rem;
}

.detail-value {
  font-weight: 500;
  color: #1f2937;
}

.redirect-actions {
  display: flex;
  gap: 1rem;
}

.redirect-cancel,
.redirect-confirm {
  flex: 1;
  padding: 1rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.redirect-cancel {
  background: white;
  border: 2px solid #d1d5db;
  color: #4b5563;
}

.redirect-cancel:hover {
  background: #f3f4f6;
}

.redirect-confirm {
  background: #003087;
  border: none;
  color: white;
}

.redirect-confirm:hover {
  background: #002266;
}

.redirect-security {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem;
  background: #f0f9ff;
  border-top: 1px solid #e0f2fe;
  color: #0369a1;
  font-size: 0.85rem;
}

/* Responsive */
@media (max-width: 768px) {
  .benefits {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }
  
  .redirect-modal {
    width: 95%;
    margin: 1rem;
  }
  
  .redirect-actions {
    flex-direction: column;
  }
  
  .paypal-button-content {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .paypal-button-text {
    order: 2;
  }
  
  .paypal-button-logo {
    order: 1;
  }
  
  .paypal-amount {
    order: 3;
    margin-top: 0.5rem;
  }
}
</style>
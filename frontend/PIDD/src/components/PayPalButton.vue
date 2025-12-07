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
        >
          <div class="paypal-button-content">
            <span class="paypal-button-logo">
              <span class="paypal-blue">Pay</span><span class="paypal-yellow">Pal</span>
            </span>
            <span class="paypal-button-text">
              <span v-if="!processing">Payer avec PayPal</span>
              <span v-else>Redirection vers PayPal...</span>
            </span>
            <span class="paypal-amount">{{ formatPrice(amount) }}</span>
          </div>
        </button>
        
        <div v-if="processing" class="paypal-processing">
          <div class="spinner"></div>
          <p>Redirection vers le site sécurisé de PayPal...</p>
        </div>
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
            <div class="loading-spinner"></div>
            <p>Connexion à PayPal...</p>
          </div>
          
          <div class="redirect-message">
            <p>Vous allez être redirigé vers le site sécurisé de PayPal.</p>
            <p>Veuillez vous connecter et confirmer votre paiement.</p>
          </div>
          
          <div class="redirect-details">
            <p><strong>Marchand :</strong> MonShop</p>
            <p><strong>Montant :</strong> {{ formatPrice(amount) }}</p>
            <p><strong>Référence :</strong> CMD-{{ Math.random().toString(36).substring(2, 10).toUpperCase() }}</p>
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
      }).format(price)
    },
    
    async initiatePayPalPayment() {
      this.processing = true
      
      // Simulation du délai de traitement
      await new Promise(resolve => setTimeout(resolve, 800))
      
      // Ouvrir le simulateur de redirection PayPal
      this.showPayPalRedirect = true
      this.processing = false
    },
    
    simulatePayPalSuccess() {
      // Simulation de succès PayPal
      const transactionId = 'PAY-' + Math.random().toString(36).substring(2, 15).toUpperCase()
      
      this.$emit('payment-success', {
        method: 'paypal',
        transactionId: transactionId,
        payerEmail: 'client@example.com',
        payerId: 'PAYER_' + Math.random().toString(36).substring(2, 10).toUpperCase()
      })
      
      this.showPayPalRedirect = false
    },
    
    cancelRedirect() {
      this.showPayPalRedirect = false
      this.$emit('payment-cancelled')
    },
    
    payWithCard() {
      // Option pour payer avec carte via PayPal
      this.$emit('pay-with-card')
    }
  }
}
</script>

<style scoped>
.paypal-button-container {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

/* Header */
.paypal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.paypal-logo {
  font-size: 2rem;
  font-weight: bold;
  letter-spacing: -1px;
}

.paypal-blue {
  color: #003087;
}

.paypal-yellow {
  color: #009cde;
}

.paypal-tagline {
  color: #6b7280;
  font-size: 0.9rem;
  margin: 0;
}

/* Benefits */
.benefits {
  display: flex;
  justify-content: space-around;
  margin: 1.5rem 0;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 8px;
}

.benefit {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.benefit-icon {
  font-size: 1.5rem;
}

.benefit-text {
  font-size: 0.85rem;
  color: #4b5563;
  text-align: center;
}

/* Options */
.paypal-options {
  margin: 1.5rem 0;
}

.option-group {
  margin-bottom: 1rem;
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}

.option-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: #1f2937;
  cursor: pointer;
}

.option-description {
  margin: 0.5rem 0 0 1.5rem;
  font-size: 0.85rem;
  color: #6b7280;
}

/* Bouton principal */
.paypal-button-wrapper {
  margin: 2rem 0;
}

.paypal-button {
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, #ffc439, #f0c14b);
  border: 1px solid #e0b238;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.paypal-button:hover:not(:disabled) {
  background: linear-gradient(135deg, #f0c14b, #e0b238);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.paypal-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.paypal-button-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
  color: #111;
}

.paypal-button-logo {
  font-size: 1.2rem;
  font-weight: bold;
}

.paypal-button-text {
  font-size: 1.1rem;
}

.paypal-amount {
  font-size: 1.2rem;
  color: #003087;
}

/* Traitement */
.paypal-processing {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  margin-top: 1rem;
  padding: 1.5rem;
  background: #f0f9ff;
  border-radius: 8px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(0, 48, 135, 0.1);
  border-radius: 50%;
  border-top-color: #003087;
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.paypal-processing p {
  margin: 0;
  color: #003087;
  font-weight: 500;
}

/* Sécurité */
.security-details {
  margin: 2rem 0;
  padding: 1.5rem;
  background: #f0f9ff;
  border-radius: 8px;
  border-left: 4px solid #003087;
}

.security-title {
  font-weight: 600;
  color: #003087;
  margin: 0 0 0.5rem 0;
}

.security-list {
  margin: 0;
  padding-left: 1.5rem;
  color: #4b5563;
  font-size: 0.9rem;
}

.security-list li {
  margin: 0.25rem 0;
}

/* Alternative */
.alternative-payment {
  margin: 2rem 0;
  padding: 1.5rem;
  background: #f8fafc;
  border-radius: 8px;
  text-align: center;
}

.alternative-title {
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
}

.alternative-description {
  color: #6b7280;
  margin: 0 0 1rem 0;
  font-size: 0.9rem;
}

.alternative-button {
  padding: 0.75rem 1.5rem;
  background: white;
  border: 2px solid #003087;
  color: #003087;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.alternative-button:hover {
  background: #003087;
  color: white;
}

/* FAQ */
.faq-section {
  margin-top: 2rem;
}

.faq-item {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  margin-bottom: 0.5rem;
  overflow: hidden;
}

.faq-question {
  padding: 1rem;
  background: #f8fafc;
  cursor: pointer;
  font-weight: 600;
  color: #1f2937;
  list-style: none;
  position: relative;
}

.faq-question::after {
  content: '▶';
  position: absolute;
  right: 1rem;
  transition: transform 0.3s ease;
}

.faq-item[open] .faq-question::after {
  transform: rotate(90deg);
}

.faq-answer {
  padding: 1rem;
  background: white;
  color: #4b5563;
  font-size: 0.9rem;
}

.faq-answer p {
  margin: 0.5rem 0;
}

.faq-answer ul {
  margin: 0.5rem 0;
  padding-left: 1.5rem;
}

/* Simulateur de redirection */
.paypal-redirect-simulator {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.redirect-modal {
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 500px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.redirect-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  background: linear-gradient(135deg, #003087, #009cde);
  color: white;
}

.redirect-logo {
  font-size: 1.5rem;
  font-weight: bold;
}

.redirect-close {
  background: none;
  border: none;
  color: white;
  font-size: 2rem;
  cursor: pointer;
  line-height: 1;
}

.redirect-content {
  padding: 2rem;
  text-align: center;
}

.loading-spinner {
  width: 60px;
  height: 60px;
  border: 4px solid #e5e7eb;
  border-top-color: #003087;
  border-radius: 50%;
  margin: 0 auto 1.5rem;
  animation: spin 1s linear infinite;
}

.redirect-message p {
  margin: 0.5rem 0;
  color: #4b5563;
}

.redirect-details {
  margin: 1.5rem 0;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 8px;
  text-align: left;
}

.redirect-details p {
  margin: 0.5rem 0;
  color: #374151;
}

.redirect-actions {
  display: flex;
  gap: 1rem;
  padding: 1.5rem;
  background: #f8fafc;
  border-top: 1px solid #e5e7eb;
}

.redirect-cancel,
.redirect-confirm {
  flex: 1;
  padding: 0.75rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.3s ease;
}

.redirect-cancel {
  background: #e5e7eb;
  color: #374151;
}

.redirect-cancel:hover {
  background: #d1d5db;
}

.redirect-confirm {
  background: #003087;
  color: white;
}

.redirect-confirm:hover {
  background: #002366;
}

/* Responsive */
@media (max-width: 768px) {
  .benefits {
    flex-direction: column;
    gap: 1rem;
  }
  
  .paypal-button-content {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .redirect-actions {
    flex-direction: column;
  }
}
</style>
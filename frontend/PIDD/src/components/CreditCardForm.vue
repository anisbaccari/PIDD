<template>
  <div class="credit-card-form">
    <div class="form-header">
      <div class="card-icons">
        <span class="card-icon visa">VISA</span>
        <span class="card-icon mastercard">MasterCard</span>
        <span class="card-icon american">Amex</span>
      </div>
      <p class="security-notice">🔒 Paiement 100% sécurisé</p>
    </div>
    
    <form @submit.prevent="submitPayment" class="card-form">
      <!-- Numéro de carte -->
      <div class="form-group">
        <label for="cardNumber">Numéro de carte *</label>
        <div class="input-with-icon">
          <input
            id="cardNumber"
            v-model="cardData.number"
            type="text"
            placeholder="4242 4242 4242 4242"
            maxlength="19"
            @input="formatCardNumber"
            :class="{ 'invalid': errors.number }"
            required
          />
          <span class="input-icon">💳</span>
        </div>
        <div v-if="errors.number" class="error-message">{{ errors.number }}</div>
        <div v-else class="card-type-hint">
          {{ detectedCardType ? `Carte ${detectedCardType} détectée` : '' }}
        </div>
      </div>
      
      <div class="form-row">
        <!-- Date d'expiration -->
        <div class="form-group">
          <label for="expiryDate">Date d'expiration *</label>
          <div class="input-with-icon">
            <input
              id="expiryDate"
              v-model="cardData.expiry"
              type="text"
              placeholder="MM/AA"
              maxlength="5"
              @input="formatExpiryDate"
              :class="{ 'invalid': errors.expiry }"
              required
            />
            <span class="input-icon">📅</span>
          </div>
          <div v-if="errors.expiry" class="error-message">{{ errors.expiry }}</div>
        </div>
        
        <!-- CVV -->
        <div class="form-group">
          <label for="cvv">CVV *</label>
          <div class="input-with-icon">
            <input
              id="cvv"
              v-model="cardData.cvv"
              type="password"
              placeholder="123"
              maxlength="4"
              @input="validateCVV"
              :class="{ 'invalid': errors.cvv }"
              required
            />
            <span class="input-icon">🔐</span>
          </div>
          <div v-if="errors.cvv" class="error-message">{{ errors.cvv }}</div>
          <a 
            href="#" 
            class="cvv-help"
            @click.prevent="showCVVHelp = !showCVVHelp"
          >
            Qu'est-ce que le CVV ?
          </a>
        </div>
      </div>
      
      <!-- Nom sur la carte -->
      <div class="form-group">
        <label for="cardholderName">Nom sur la carte *</label>
        <input
          id="cardholderName"
          v-model="cardData.name"
          type="text"
          placeholder="JEAN DUPONT"
          :class="{ 'invalid': errors.name }"
          required
        />
        <div v-if="errors.name" class="error-message">{{ errors.name }}</div>
      </div>
      
      <!-- Option : Sauvegarder la carte -->
      <div class="save-card-option">
        <input
          type="checkbox"
          id="saveCard"
          v-model="saveCard"
        />
        <label for="saveCard">
          <span class="checkbox-label">💾 Sauvegarder cette carte pour mes prochains achats</span>
          <span class="security-badge">(Sécurité maximale)</span>
        </label>
      </div>
      
      <!-- Carte en temps réel -->
      <div class="card-preview">
        <div class="credit-card" :class="detectedCardType">
          <div class="card-front">
            <div class="card-chip">⚫⚫</div>
            <div class="card-number">{{ displayCardNumber || '•••• •••• •••• ••••' }}</div>
            <div class="card-details">
              <div class="card-holder">{{ cardData.name.toUpperCase() || 'NOM SUR LA CARTE' }}</div>
              <div class="card-expiry">{{ cardData.expiry || 'MM/AA' }}</div>
            </div>
            <div class="card-logo">{{ getCardLogo() }}</div>
          </div>
        </div>
      </div>
      
      <!-- Bouton de soumission -->
      <button 
        type="submit" 
        class="submit-button"
        :disabled="!isFormValid || processing"
      >
        <span v-if="processing" class="spinner"></span>
        <span v-else>Payer {{ formatPrice(amount) }}</span>
      </button>
      
      <!-- Informations de sécurité -->
      <div class="security-info">
        <p>✅ Transactions cryptées SSL</p>
        <p>✅ Conforme PCI DSS</p>
        <p>✅ Aucune donnée stockée sur nos serveurs</p>
      </div>
    </form>
    
    <!-- Modal d'aide CVV -->
    <div v-if="showCVVHelp" class="modal-overlay" @click="showCVVHelp = false">
      <div class="modal-content" @click.stop>
        <button class="modal-close" @click="showCVVHelp = false">×</button>
        <h3>Qu'est-ce que le code CVV ?</h3>
        <div class="cvv-examples">
          <div class="cvv-example">
            <img src="@/assets/cvv-visa-mastercard.png" alt="CVV Visa/Mastercard" />
            <p><strong>Visa/Mastercard :</strong> 3 chiffres au dos de la carte</p>
          </div>
          <div class="cvv-example">
            <img src="@/assets/cvv-amex.png" alt="CVV American Express" />
            <p><strong>American Express :</strong> 4 chiffres au recto de la carte</p>
          </div>
        </div>
        <p class="cvv-security">Ce code est requis pour vérifier que vous possédez physiquement la carte.</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CreditCardForm',
  props: {
    amount: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
      cardData: {
        number: '',
        expiry: '',
        cvv: '',
        name: ''
      },
      errors: {
        number: '',
        expiry: '',
        cvv: '',
        name: ''
      },
      saveCard: false,
      processing: false,
      showCVVHelp: false,
      detectedCardType: null
    }
  },
  computed: {
    displayCardNumber() {
      return this.cardData.number.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim()
    },
    
    isFormValid() {
      return (
        this.validateCardNumber() &&
        this.validateExpiryDate() &&
        this.validateCVV() &&
        this.cardData.name.trim().length > 0
      )
    }
  },
  methods: {
    formatCardNumber(event) {
      let value = event.target.value.replace(/\s/g, '').replace(/\D/g, '')
      
      // Détecter le type de carte
      this.detectedCardType = this.detectCardType(value)
      
      // Formater par groupes de 4
      value = value.replace(/(.{4})/g, '$1 ').trim()
      
      this.cardData.number = value.substring(0, 19) // 16 chiffres + 3 espaces
      this.validateCardNumber()
    },
    
    formatExpiryDate(event) {
      let value = event.target.value.replace(/\D/g, '')
      
      if (value.length >= 2) {
        value = value.substring(0, 2) + '/' + value.substring(2, 4)
      }
      
      this.cardData.expiry = value.substring(0, 5)
      this.validateExpiryDate()
    },
    
    validateCardNumber() {
      const number = this.cardData.number.replace(/\s/g, '')
      
      if (!number) {
        this.errors.number = 'Le numéro de carte est requis'
        return false
      }
      
      if (number.length < 15 || number.length > 19) {
        this.errors.number = 'Numéro de carte invalide'
        return false
      }
      
      // Algorithme de Luhn
      if (!this.luhnCheck(number)) {
        this.errors.number = 'Numéro de carte invalide'
        return false
      }
      
      this.errors.number = ''
      return true
    },
    
    validateExpiryDate() {
      if (!this.cardData.expiry) {
        this.errors.expiry = 'La date d\'expiration est requise'
        return false
      }
      
      const [month, year] = this.cardData.expiry.split('/').map(Number)
      const currentYear = new Date().getFullYear() % 100
      const currentMonth = new Date().getMonth() + 1
      
      if (!month || !year || month < 1 || month > 12) {
        this.errors.expiry = 'Date invalide'
        return false
      }
      
      if (year < currentYear || (year === currentYear && month < currentMonth)) {
        this.errors.expiry = 'Carte expirée'
        return false
      }
      
      this.errors.expiry = ''
      return true
    },
    
    validateCVV() {
      const cvv = this.cardData.cvv
      
      if (!cvv) {
        this.errors.cvv = 'Le CVV est requis'
        return false
      }
      
      // Vérifier la longueur selon le type de carte
      const expectedLength = this.detectedCardType === 'American Express' ? 4 : 3
      
      if (cvv.length !== expectedLength || !/^\d+$/.test(cvv)) {
        this.errors.cvv = `Le CVV doit contenir ${expectedLength} chiffres`
        return false
      }
      
      this.errors.cvv = ''
      return true
    },
    
    detectCardType(number) {
      const patterns = {
        visa: /^4/,
        mastercard: /^5[1-5]|^2[2-7]/,
        'American Express': /^3[47]/,
        diners: /^3[689]/,
        discover: /^6[045]/
      }
      
      for (const [type, pattern] of Object.entries(patterns)) {
        if (pattern.test(number)) {
          return type
        }
      }
      
      return null
    },
    
    luhnCheck(number) {
      let sum = 0
      let shouldDouble = false
      
      // Parcourir les chiffres de droite à gauche
      for (let i = number.length - 1; i >= 0; i--) {
        let digit = parseInt(number.charAt(i))
        
        if (shouldDouble) {
          digit *= 2
          if (digit > 9) digit -= 9
        }
        
        sum += digit
        shouldDouble = !shouldDouble
      }
      
      return sum % 10 === 0
    },
    
    getCardLogo() {
      const logos = {
        'Visa': 'VISA',
        'Mastercard': 'MC',
        'American Express': 'AMEX',
        'Diners': 'DC',
        'Discover': 'DISCOVER'
      }
      
      return logos[this.detectedCardType] || 'CARD'
    },
    
    formatPrice(price) {
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR'
      }).format(price)
    },
    
    async submitPayment() {
      if (!this.isFormValid) return
      
      this.processing = true
      
      try {
        // Simulation de traitement
        console.log('💳 Traitement du paiement carte:', {
          montant: this.amount,
          type: this.detectedCardType,
          saveCard: this.saveCard
        })
        
        // Ici, vous intégreriez avec Stripe, PayPal, ou votre API
        const paymentResult = await this.processWithStripe()
        
        if (paymentResult.success) {
          this.$emit('payment-completed', {
  method: 'credit_card',
  transactionId: paymentResult.transactionId,
  cardLast4: this.cardData.number.slice(-4),
  amount: this.amount
})
        } else {
          throw new Error(paymentResult.error || 'Paiement échoué')
        }
        
      } catch (error) {
        console.error('❌ Erreur paiement:', error)
        this.$emit('payment-error', error.message)
      } finally {
        this.processing = false
      }
    },
    
    processWithStripe() {
      // Simulation d'intégration Stripe
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            success: true,
            transactionId: 'pi_' + Math.random().toString(36).substring(2),
            amount: this.amount
          })
        }, 1500)
      })
    }
  }
}
</script>

<style scoped>
.credit-card-form {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.card-icons {
  display: flex;
  gap: 0.5rem;
}

.card-icon {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
}

.card-icon.visa {
  background: #1a1f71;
  color: white;
}

.card-icon.mastercard {
  background: #eb001b;
  color: white;
}

.card-icon.american {
  background: #2e77bc;
  color: white;
}

.security-notice {
  font-size: 0.9rem;
  color: #059669;
  font-weight: 500;
  margin: 0;
}

/* Formulaire */
.card-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-group {
  margin-bottom: 0;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #374151;
  font-size: 0.9rem;
}

.input-with-icon {
  position: relative;
}

.input-with-icon input {
  width: 100%;
  padding: 0.75rem 2.5rem 0.75rem 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
  font-family: 'Courier New', monospace;
  letter-spacing: 1px;
}

.input-with-icon input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.input-with-icon input.invalid {
  border-color: #ef4444;
  background: #fef2f2;
}

.input-icon {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1.1rem;
}

.error-message {
  color: #ef4444;
  font-size: 0.8rem;
  margin-top: 0.25rem;
  min-height: 1rem;
}

.card-type-hint {
  color: #6b7280;
  font-size: 0.8rem;
  margin-top: 0.25rem;
  min-height: 1rem;
}

/* Option sauvegarde */
.save-card-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0.5rem 0;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 8px;
}

.save-card-option input[type="checkbox"] {
  width: auto;
  margin: 0;
}

.save-card-option label {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin: 0;
  font-size: 0.9rem;
  color: #4b5563;
}

.checkbox-label {
  font-weight: 600;
}

.security-badge {
  font-size: 0.8rem;
  color: #6b7280;
}

/* Carte de crédit en temps réel */
.card-preview {
  display: flex;
  justify-content: center;
  margin: 1.5rem 0;
}

.credit-card {
  width: 320px;
  height: 200px;
  perspective: 1000px;
}

.card-front {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #374151, #1f2937);
  border-radius: 16px;
  padding: 1.5rem;
  position: relative;
  color: white;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

.credit-card.visa .card-front {
  background: linear-gradient(135deg, #1a1f71, #2a2f9e);
}

.credit-card.mastercard .card-front {
  background: linear-gradient(135deg, #eb001b, #f79e1b);
}

.credit-card.American\ Express .card-front {
  background: linear-gradient(135deg, #2e77bc, #006fcf);
}

.card-chip {
  width: 50px;
  height: 40px;
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
}

.card-number {
  font-family: 'Courier New', monospace;
  font-size: 1.5rem;
  letter-spacing: 2px;
  margin: 1rem 0;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.card-details {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-top: 1.5rem;
}

.card-holder {
  font-size: 0.9rem;
  opacity: 0.9;
  max-width: 70%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-expiry {
  font-family: 'Courier New', monospace;
  font-size: 1rem;
}

.card-logo {
  position: absolute;
  right: 1.5rem;
  bottom: 1.5rem;
  font-weight: bold;
  font-size: 1.2rem;
  opacity: 0.9;
}

/* Bouton de soumission */
.submit-button {
  padding: 1rem;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
}

.submit-button:hover:not(:disabled) {
  background: linear-gradient(135deg, #2563eb, #1e40af);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
}

.submit-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Informations de sécurité */
.security-info {
  display: flex;
  justify-content: space-around;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
  font-size: 0.85rem;
  color: #6b7280;
}

.security-info p {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

/* Modal CVV */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  max-width: 500px;
  width: 90%;
  position: relative;
}

.modal-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6b7280;
}

.modal-content h3 {
  margin: 0 0 1.5rem 0;
  color: #1f2937;
}

.cvv-examples {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin: 1.5rem 0;
}

.cvv-example img {
  width: 100%;
  max-width: 200px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  margin-bottom: 0.5rem;
}

.cvv-example p {
  margin: 0;
  font-size: 0.9rem;
  color: #4b5563;
}

.cvv-security {
  font-style: italic;
  color: #6b7280;
  margin-top: 1rem;
  font-size: 0.9rem;
}

/* Aide CVV */
.cvv-help {
  display: inline-block;
  margin-top: 0.5rem;
  color: #3b82f6;
  font-size: 0.85rem;
  text-decoration: none;
}

.cvv-help:hover {
  text-decoration: underline;
}

/* Responsive */
@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .security-info {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .credit-card {
    width: 280px;
    height: 175px;
  }
  
  .card-number {
    font-size: 1.2rem;
  }
  
  .cvv-examples {
    grid-template-columns: 1fr;
  }
}
</style>
<template>
  <div class="paysafe-form-container">
    <div class="paysafe-header">
      <div class="paysafe-logo">🃏</div>
      <div class="paysafe-title">
        <h3>Paysafe Card</h3>
        <p class="paysafe-subtitle">Paiement avec code prépayé</p>
      </div>
    </div>
    
    <!-- Introduction -->
    <div class="paysafe-intro">
      <div class="intro-card">
        <p>La Paysafe Card est une carte prépayée que vous pouvez acheter chez plus de 650 000 points de vente.</p>
        <div class="intro-features">
          <div class="feature">
            <span class="feature-icon">💳</span>
            <span class="feature-text">Aucun compte bancaire requis</span>
          </div>
          <div class="feature">
            <span class="feature-icon">🔒</span>
            <span class="feature-text">Paiement 100% anonyme</span>
          </div>
          <div class="feature">
            <span class="feature-icon">⚡</span>
            <span class="feature-text">Validation instantanée</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Formulaire principal -->
    <div class="paysafe-form">
      <div class="form-section">
        <h4>Entrez votre code PIN</h4>
        
        <!-- Champ de code -->
        <div class="pin-input-container">
          <div class="pin-fields">
            <input
              v-for="n in 16"
              :key="n"
              :ref="`pin${n}`"
              v-model="pinDigits[n-1]"
              type="password"
              maxlength="1"
              class="pin-digit"
              @input="onPinInput(n-1, $event)"
              @keydown="onPinKeydown(n-1, $event)"
              @paste="onPinPaste"
              :disabled="processing"
            />
          </div>
          <div class="pin-hint">
            <span class="pin-length">16 chiffres</span>
            <button 
              class="show-pin-toggle"
              @click="toggleShowPin"
              type="button"
            >
              {{ showPin ? '👁️‍🗨️ Masquer' : '👁️ Afficher' }}
            </button>
          </div>
        </div>
        
        <!-- Validation -->
        <div v-if="pinError" class="pin-error">
          ❌ {{ pinError }}
        </div>
        
        <div v-if="pinSuccess" class="pin-success">
          ✅ Code valide
        </div>
        
        <!-- Montant disponible -->
        <div v-if="cardBalance > 0" class="balance-info">
          <div class="balance-display">
            <span class="balance-label">Solde disponible :</span>
            <span class="balance-amount">{{ formatPrice(cardBalance) }}</span>
          </div>
          
          <div class="balance-progress">
            <div 
              class="progress-bar"
              :style="{ width: balancePercentage + '%' }"
            ></div>
          </div>
          
          <div class="balance-warning" v-if="cardBalance < amount">
            ⚠️ Votre solde est insuffisant. Il manque {{ formatPrice(amount - cardBalance) }}
          </div>
        </div>
      </div>
      
      <!-- Options de paiement -->
      <div class="payment-options">
        <div class="option-group">
          <h5>Options de paiement</h5>
          
          <label class="option-label">
            <input
              type="radio"
              v-model="paymentOption"
              value="full"
              :disabled="cardBalance < amount"
            />
            <span>
              <span class="option-title">Paiement complet</span>
              <span class="option-amount">{{ formatPrice(amount) }}</span>
            </span>
          </label>
          
          <label class="option-label">
            <input
              type="radio"
              v-model="paymentOption"
              value="partial"
            />
            <span>
              <span class="option-title">Paiement partiel</span>
              <span class="option-amount" v-if="cardBalance > 0">
                Utiliser {{ formatPrice(Math.min(cardBalance, amount)) }}
              </span>
            </span>
          </label>
          
          <label class="option-label">
            <input
              type="radio"
              v-model="paymentOption"
              value="combine"
            />
            <span>
              <span class="option-title">Combiner avec un autre moyen</span>
              <span class="option-description">Payer le reste avec carte bancaire</span>
            </span>
          </label>
        </div>
      </div>
      
      <!-- Montants -->
      <div class="amounts-section">
        <div class="amount-row">
          <span>Total de la commande</span>
          <span class="amount-value">{{ formatPrice(amount) }}</span>
        </div>
        
        <div v-if="paymentOption === 'partial'" class="amount-row">
          <span>Paiement Paysafe</span>
          <span class="amount-value">{{ formatPrice(Math.min(cardBalance, amount)) }}</span>
        </div>
        
        <div v-if="paymentOption === 'partial' && cardBalance < amount" class="amount-row">
          <span>Reste à payer</span>
          <span class="amount-value remaining">
            {{ formatPrice(amount - cardBalance) }}
          </span>
        </div>
        
        <div class="amount-row total">
          <span>Total à débiter</span>
          <span class="amount-value total-amount">
            {{ formatPrice(getTotalToPay()) }}
          </span>
        </div>
      </div>
      
      <!-- Boutons d'action -->
      <div class="paysafe-actions">
        <button 
          class="action-btn validate-btn"
          @click="validatePin"
          :disabled="!isPinComplete || processing"
        >
          <span v-if="processing" class="spinner"></span>
          <span v-else>Valider le code</span>
        </button>
        
        <button 
          class="action-btn pay-btn"
          @click="processPayment"
          :disabled="!isPinValid || processing"
        >
          <span v-if="processing" class="spinner"></span>
          <span v-else>Payer avec Paysafe</span>
        </button>
      </div>
    </div>
    
    <!-- Aide et informations -->
    <div class="paysafe-help">
      <details class="help-item">
        <summary class="help-question">❓ Où acheter une Paysafe Card ?</summary>
        <div class="help-answer">
          <p>Vous pouvez acheter une Paysafe Card chez :</p>
          <ul>
            <li>Tobacco shops (tabacs)</li>
            <li>Bureaux de poste</li>
            <li>Supermarchés (Carrefour, Auchan, etc.)</li>
            <li>Stations-service</li>
            <li>Kiosques à journaux</li>
          </ul>
          <a href="https://www.paysafecard.com/fr-fr/ou-acheter/" target="_blank" class="store-locator">
            🔍 Trouver un point de vente près de chez vous
          </a>
        </div>
      </details>
      
      <details class="help-item">
        <summary class="help-question">💰 Comment fonctionne la Paysafe Card ?</summary>
        <div class="help-answer">
          <ol>
            <li>Achetez une carte prépayée en magasin</li>
            <li>Récupérez le code PIN de 16 chiffres</li>
            <li>Entrez le code sur cette page</li>
            <li>Le montant est débité instantanément</li>
          </ol>
          <p class="note">⚠️ Les cartes Paysafe sont à usage unique. Le solde restant ne peut être réutilisé.</p>
        </div>
      </details>
      
      <details class="help-item">
        <summary class="help-question">🔒 Sécurité et confidentialité</summary>
        <div class="help-answer">
          <p>Avec Paysafe Card :</p>
          <ul>
            <li>✅ Aucune information personnelle requise</li>
            <li>✅ Pas de compte à créer</li>
            <li>✅ Transaction 100% anonyme</li>
            <li>✅ Protection contre la fraude</li>
            <li>✅ Support client disponible 24/7</li>
          </ul>
        </div>
      </details>
    </div>
    
    <!-- Simulation de validation -->
    <div v-if="showValidation" class="validation-simulator">
      <div class="validation-modal">
        <div class="validation-header">
          <div class="validation-logo">🃏</div>
          <h4>Validation en cours</h4>
          <button class="validation-close" @click="closeValidation">×</button>
        </div>
        
        <div class="validation-content">
          <div class="validation-step" :class="{ active: validationStep >= 1 }">
            <div class="step-icon">1</div>
            <div class="step-content">
              <h5>Vérification du code PIN</h5>
              <p>Connexion au serveur Paysafe...</p>
            </div>
            <div v-if="validationStep >= 1" class="step-status">✅</div>
          </div>
          
          <div class="validation-step" :class="{ active: validationStep >= 2 }">
            <div class="step-icon">2</div>
            <div class="step-content">
              <h5>Vérification du solde</h5>
              <p>Solde disponible : {{ formatPrice(cardBalance) }}</p>
            </div>
            <div v-if="validationStep >= 2" class="step-status">✅</div>
          </div>
          
          <div class="validation-step" :class="{ active: validationStep >= 3 }">
            <div class="step-icon">3</div>
            <div class="step-content">
              <h5>Réservation du montant</h5>
              <p>Réservation de {{ formatPrice(getTotalToPay()) }}...</p>
            </div>
            <div v-if="validationStep >= 3" class="step-status">✅</div>
          </div>
          
          <div class="validation-step" :class="{ active: validationStep >= 4 }">
            <div class="step-icon">4</div>
            <div class="step-content">
              <h5>Confirmation du paiement</h5>
              <p>Génération de la transaction...</p>
            </div>
            <div v-if="validationStep >= 4" class="step-status">✅</div>
          </div>
        </div>
        
        <div class="validation-actions">
          <div class="transaction-details" v-if="validationStep >= 4">
            <p><strong>Transaction :</strong> {{ transactionId }}</p>
            <p><strong>Montant :</strong> {{ formatPrice(getTotalToPay()) }}</p>
            <p><strong>Date :</strong> {{ new Date().toLocaleString('fr-FR') }}</p>
          </div>
          
          <button 
            class="validation-confirm"
            @click="completeValidation"
            :disabled="validationStep < 4"
          >
            Finaliser le paiement
          </button>
        </div>
      </div>
    </div>
    
    <!-- Alternative -->
    <div class="paysafe-alternative">
      <p class="alternative-title">Vous n'avez pas de Paysafe Card ?</p>
      <div class="alternative-buttons">
        <button class="alternative-btn" @click="$emit('choose-other-method')">
          Choisir un autre moyen de paiement
        </button>
        <a 
          href="https://www.paysafecard.com/fr-fr/acheter-en-ligne/" 
          target="_blank"
          class="alternative-btn secondary"
        >
          Acheter une carte en ligne
        </a>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PaysafeForm',
  props: {
    amount: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
      pinDigits: Array(16).fill(''),
      showPin: false,
      processing: false,
      pinError: '',
      pinSuccess: false,
      pinValid: false,
      cardBalance: 0,
      paymentOption: 'full',
      validationStep: 0,
      showValidation: false,
      transactionId: ''
    }
  },
  computed: {
    isPinComplete() {
      return this.pinDigits.every(digit => digit !== '')
    },
    
    isPinValid() {
      return this.pinValid && this.cardBalance > 0
    },
    
    balancePercentage() {
      if (!this.amount) return 0
      return Math.min(100, (this.cardBalance / this.amount) * 100)
    },
    
    pinCode() {
      return this.pinDigits.join('')
    }
  },
  watch: {
    pinDigits: {
      handler() {
        this.pinError = ''
        this.pinSuccess = false
      },
      deep: true
    }
  },
  methods: {
    formatPrice(price) {
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR'
      }).format(price)
    },
    
    onPinInput(index, event) {
      const value = event.target.value
      
      // Ne garder que les chiffres
      if (!/^\d*$/.test(value)) {
        this.pinDigits[index] = ''
        return
      }
      
      this.pinDigits[index] = value
      
      // Passer au champ suivant si un chiffre est entré
      if (value && index < 15) {
        this.$refs[`pin${index + 2}`][0].focus()
      }
      
      // Vérifier si le code est complet
      if (this.isPinComplete) {
        this.autoValidatePin()
      }
    },
    
    onPinKeydown(index, event) {
      // Gérer la touche retour arrière
      if (event.key === 'Backspace') {
        if (!this.pinDigits[index] && index > 0) {
          // Si le champ est vide, revenir au champ précédent
          this.$refs[`pin${index}`][0].focus()
        }
      }
      
      // Gérer les flèches
      if (event.key === 'ArrowLeft' && index > 0) {
        this.$refs[`pin${index}`][0].focus()
      }
      if (event.key === 'ArrowRight' && index < 15) {
        this.$refs[`pin${index + 2}`][0].focus()
      }
    },
    
    onPinPaste(event) {
      event.preventDefault()
      const pasteData = event.clipboardData.getData('text').replace(/\D/g, '')
      
      if (pasteData.length === 16) {
        // Remplir tous les champs avec les données collées
        for (let i = 0; i < 16; i++) {
          this.pinDigits[i] = pasteData[i] || ''
        }
        
        // Focus sur le dernier champ
        if (this.$refs.pin16) {
          this.$refs.pin16[0].focus()
        }
        
        // Valider automatiquement
        setTimeout(() => {
          this.autoValidatePin()
        }, 100)
      } else {
        this.pinError = 'Le code PIN doit contenir exactement 16 chiffres'
      }
    },
    
    toggleShowPin() {
      this.showPin = !this.showPin
      // Basculer le type des inputs
      const inputs = document.querySelectorAll('.pin-digit')
      inputs.forEach(input => {
        input.type = this.showPin ? 'text' : 'password'
      })
    },
    
    async autoValidatePin() {
      // Simuler une validation automatique après 1 seconde
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      if (this.isPinComplete && !this.pinValid) {
        this.validatePin()
      }
    },
    
    async validatePin() {
      if (!this.isPinComplete) {
        this.pinError = 'Veuillez entrer les 16 chiffres du code PIN'
        return
      }
      
      this.processing = true
      this.pinError = ''
      
      try {
        // Simuler un appel API Paysafe
        await new Promise(resolve => setTimeout(resolve, 1500))
        
        // Validation simple (simulation)
        const isValid = this.validatePaysafeFormat(this.pinCode)
        
        if (isValid) {
          this.pinValid = true
          this.pinSuccess = true
          
          // Simuler un solde aléatoire entre 20€ et 100€
          this.cardBalance = Math.floor(Math.random() * 80) + 20
          
          // Sélectionner automatiquement l'option de paiement
          if (this.cardBalance >= this.amount) {
            this.paymentOption = 'full'
          } else {
            this.paymentOption = 'partial'
          }
          
        } else {
          this.pinError = 'Code PIN invalide. Veuillez vérifier et réessayer.'
          this.pinValid = false
        }
        
      } catch (error) {
        this.pinError = 'Erreur de validation. Veuillez réessayer.'
        console.error('Validation error:', error)
      } finally {
        this.processing = false
      }
    },
    
    validatePaysafeFormat(pin) {
      // Validation simple : doit contenir 16 chiffres et respecter le format Luhn
      if (pin.length !== 16) return false
      if (!/^\d{16}$/.test(pin)) return false
      
      // Algorithme de Luhn pour vérifier la validité
      return this.luhnCheck(pin)
    },
    
    luhnCheck(number) {
      let sum = 0
      let shouldDouble = false
      
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
    
    getTotalToPay() {
      if (this.paymentOption === 'full') {
        return Math.min(this.amount, this.cardBalance)
      } else if (this.paymentOption === 'partial') {
        return Math.min(this.amount, this.cardBalance)
      } else if (this.paymentOption === 'combine') {
        return Math.min(this.amount, this.cardBalance)
      }
      return 0
    },
    
    async processPayment() {
      if (!this.isPinValid) {
        this.pinError = 'Veuillez d\'abord valider votre code PIN'
        return
      }
      
      if (this.paymentOption === 'partial' && this.cardBalance < this.amount) {
        // Demander confirmation pour paiement partiel
        if (!confirm(`Votre solde (${this.formatPrice(this.cardBalance)}) est insuffisant. Payer ${this.formatPrice(this.cardBalance)} avec Paysafe et le reste avec un autre moyen ?`)) {
          return
        }
      }
      
      // Ouvrir le simulateur de validation
      this.showValidation = true
      this.startValidationProcess()
    },
    
    startValidationProcess() {
      this.validationStep = 0
      
      const steps = [1, 2, 3, 4]
      steps.forEach((step, index) => {
        setTimeout(() => {
          this.validationStep = step
          
          if (step === 4) {
            // Générer un ID de transaction
            this.transactionId = 'PSC-' + Math.random().toString(36).substring(2, 15).toUpperCase()
          }
        }, (index + 1) * 1000)
      })
    },
    
    completeValidation() {
      // Émettre l'événement de succès
      this.$emit('payment-success', {
        method: 'paysafe',
        transactionId: this.transactionId,
        amount: this.getTotalToPay(),
        cardBalance: this.cardBalance,
        remaining: this.amount - this.getTotalToPay()
      })
      
      this.showValidation = false
      this.resetForm()
    },
    
    closeValidation() {
      this.showValidation = false
    },
    
    resetForm() {
      this.pinDigits = Array(16).fill('')
      this.pinValid = false
      this.pinSuccess = false
      this.cardBalance = 0
      this.paymentOption = 'full'
      this.showPin = false
      
      // Réinitialiser le type des inputs
      const inputs = document.querySelectorAll('.pin-digit')
      inputs.forEach(input => {
        input.type = 'password'
      })
    }
  }
}
</script>

<style scoped>
.paysafe-form-container {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

/* Header */
.paysafe-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.paysafe-logo {
  font-size: 3rem;
}

.paysafe-title h3 {
  margin: 0 0 0.25rem 0;
  color: #1f2937;
}

.paysafe-subtitle {
  margin: 0;
  color: #6b7280;
  font-size: 0.9rem;
}

/* Introduction */
.paysafe-intro {
  margin-bottom: 2rem;
}

.intro-card {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  padding: 1.5rem;
  border-radius: 8px;
}

.intro-card p {
  margin: 0 0 1.5rem 0;
  font-size: 1rem;
  line-height: 1.5;
}

.intro-features {
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
  gap: 1rem;
}

.feature {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.feature-icon {
  font-size: 1.2rem;
}

.feature-text {
  font-size: 0.9rem;
  font-weight: 500;
}

/* Formulaire principal */
.form-section {
  margin-bottom: 2rem;
}

.form-section h4 {
  color: #1f2937;
  margin: 0 0 1rem 0;
}

/* Input PIN */
.pin-input-container {
  margin: 1.5rem 0;
}

.pin-fields {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: center;
  margin-bottom: 1rem;
}

.pin-digit {
  width: 40px;
  height: 50px;
  text-align: center;
  font-size: 1.2rem;
  font-weight: bold;
  border: 2px solid #d1d5db;
  border-radius: 8px;
  background: #f8fafc;
  font-family: 'Courier New', monospace;
}

.pin-digit:focus {
  outline: none;
  border-color: #667eea;
  background: white;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.pin-digit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.pin-hint {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
  color: #6b7280;
}

.pin-length {
  font-weight: 500;
}

.show-pin-toggle {
  background: none;
  border: none;
  color: #667eea;
  cursor: pointer;
  font-size: 0.9rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.show-pin-toggle:hover {
  background: #f3f4f6;
}

/* Messages */
.pin-error {
  color: #ef4444;
  font-weight: 500;
  margin: 1rem 0;
  padding: 0.75rem;
  background: #fef2f2;
  border-radius: 8px;
  border-left: 4px solid #ef4444;
}

.pin-success {
  color: #10b981;
  font-weight: 500;
  margin: 1rem 0;
  padding: 0.75rem;
  background: #d1fae5;
  border-radius: 8px;
  border-left: 4px solid #10b981;
}

/* Solde */
.balance-info {
  margin: 1.5rem 0;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 8px;
}

.balance-display {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.balance-label {
  color: #6b7280;
  font-weight: 500;
}

.balance-amount {
  color: #10b981;
  font-weight: bold;
  font-size: 1.2rem;
}

.balance-progress {
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
  margin: 0.5rem 0;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #10b981, #34d399);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.balance-warning {
  color: #f59e0b;
  font-weight: 500;
  margin-top: 0.5rem;
  font-size: 0.9rem;
}

/* Options de paiement */
.payment-options {
  margin: 2rem 0;
}

.option-group h5 {
  margin: 0 0 1rem 0;
  color: #1f2937;
}

.option-label {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  margin-bottom: 0.75rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.option-label:hover {
  background: #f8fafc;
  border-color: #d1d5db;
}

.option-label input[type="radio"] {
  margin-top: 0.25rem;
}

.option-label span {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.option-title {
  font-weight: 600;
  color: #1f2937;
}

.option-amount {
  color: #10b981;
  font-weight: 500;
  font-size: 0.95rem;
}

.option-description {
  color: #6b7280;
  font-size: 0.85rem;
}

/* Montants */
.amounts-section {
  margin: 2rem 0;
  padding: 1.5rem;
  background: #f8fafc;
  border-radius: 8px;
}

.amount-row {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 0;
  border-bottom: 1px solid #e5e7eb;
}

.amount-row:last-child {
  border-bottom: none;
}

.amount-value {
  color: #1f2937;
  font-weight: 500;
}

.amount-value.remaining {
  color: #ef4444;
}

.amount-row.total {
  margin-top: 0.5rem;
  padding-top: 1rem;
  border-top: 2px solid #e5e7eb;
  font-weight: bold;
  font-size: 1.1rem;
}

.total-amount {
  color: #667eea;
  font-size: 1.2rem;
}

/* Actions */
.paysafe-actions {
  display: flex;
  gap: 1rem;
  margin: 2rem 0;
}

.action-btn {
  flex: 1;
  padding: 1rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
}

.validate-btn {
  background: #e5e7eb;
  color: #374151;
}

.validate-btn:hover:not(:disabled) {
  background: #d1d5db;
}

.validate-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.pay-btn {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
}

.pay-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #5a67d8, #6b46c1);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.pay-btn:disabled {
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

/* Aide */
.paysafe-help {
  margin: 2rem 0;
}

.help-item {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  margin-bottom: 0.5rem;
  overflow: hidden;
}

.help-question {
  padding: 1rem;
  background: #f8fafc;
  cursor: pointer;
  font-weight: 600;
  color: #1f2937;
  list-style: none;
  position: relative;
}

.help-question::after {
  content: '▶';
  position: absolute;
  right: 1rem;
  transition: transform 0.3s ease;
}

.help-item[open] .help-question::after {
  transform: rotate(90deg);
}

.help-answer {
  padding: 1rem;
  background: white;
  color: #4b5563;
  font-size: 0.9rem;
}

.help-answer p,
.help-answer ul,
.help-answer ol {
  margin: 0.5rem 0;
}

.help-answer li {
  margin: 0.25rem 0;
}

.store-locator {
  display: inline-block;
  margin-top: 0.5rem;
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
}

.store-locator:hover {
  text-decoration: underline;
}

.note {
  font-style: italic;
  color: #6b7280;
  margin-top: 1rem !important;
  padding: 0.5rem;
  background: #f3f4f6;
  border-radius: 4px;
}

/* Simulateur de validation */
.validation-simulator {
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

.validation-modal {
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 500px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.validation-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
}

.validation-logo {
  font-size: 2rem;
}

.validation-header h4 {
  margin: 0;
  flex-grow: 1;
}

.validation-close {
  background: none;
  border: none;
  color: white;
  font-size: 2rem;
  cursor: pointer;
  line-height: 1;
}

.validation-content {
  padding: 2rem;
}

.validation-step {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  margin-bottom: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  opacity: 0.5;
}

.validation-step.active {
  opacity: 1;
  border-color: #667eea;
  background: #f8fafc;
}

.step-icon {
  width: 40px;
  height: 40px;
  background: #e5e7eb;
  color: #6b7280;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  flex-shrink: 0;
}

.validation-step.active .step-icon {
  background: #667eea;
  color: white;
}

.step-content {
  flex-grow: 1;
}

.step-content h5 {
  margin: 0 0 0.25rem 0;
  color: #1f2937;
}

.step-content p {
  margin: 0;
  color: #6b7280;
  font-size: 0.9rem;
}

.step-status {
  color: #10b981;
  font-size: 1.5rem;
  font-weight: bold;
}

.validation-actions {
  padding: 1.5rem;
  background: #f8fafc;
  border-top: 1px solid #e5e7eb;
}

.transaction-details {
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: white;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.transaction-details p {
  margin: 0.5rem 0;
  color: #374151;
}

.validation-confirm {
  width: 100%;
  padding: 1rem;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s ease;
}

.validation-confirm:hover:not(:disabled) {
  background: #059669;
}

.validation-confirm:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Alternative */
.paysafe-alternative {
  text-align: center;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #e5e7eb;
}

.alternative-title {
  color: #6b7280;
  margin: 0 0 1rem 0;
}

.alternative-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.alternative-btn {
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.3s ease;
  border: none;
  font-size: 0.9rem;
}

.alternative-btn {
  background: #e5e7eb;
  color: #374151;
  border: 1px solid #d1d5db;
}

.alternative-btn:hover {
  background: #d1d5db;
}

.alternative-btn.secondary {
  background: #667eea;
  color: white;
  border: none;
}

.alternative-btn.secondary:hover {
  background: #5a67d8;
}

/* Responsive */
@media (max-width: 768px) {
  .pin-fields {
    gap: 0.25rem;
  }
  
  .pin-digit {
    width: 35px;
    height: 45px;
    font-size: 1rem;
  }
  
  .intro-features {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
  
  .paysafe-actions {
    flex-direction: column;
  }
  
  .alternative-buttons {
    flex-direction: column;
  }
}
</style>
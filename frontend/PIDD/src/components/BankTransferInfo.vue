<template>
  <div class="bank-transfer-container">
    <div class="transfer-header">
      <div class="transfer-icon">🏦</div>
      <h3 class="transfer-title">Virement Bancaire</h3>
      <p class="transfer-subtitle">Paiement sécurisé par virement</p>
    </div>
    
    <!-- Informations de compte -->
    <div class="bank-details-section">
      <div class="section-header">
        <h4>Coordonnées bancaires</h4>
        <div class="copy-all" @click="copyAllDetails">
          📋 Copier tout
        </div>
      </div>
      
      <div class="bank-details-card">
        <div class="detail-row">
          <span class="detail-label">Nom du bénéficiaire</span>
          <div class="detail-value">
            <span class="detail-text">MONSHOP SARL</span>
            <button 
              class="copy-button"
              @click="copyToClipboard('MONSHOP SARL')"
              title="Copier"
            >
              📋
            </button>
          </div>
        </div>
        
        <div class="detail-row">
          <span class="detail-label">IBAN</span>
          <div class="detail-value">
            <span class="detail-text iban">FR76 3000 4000 5000 6000 7000 891</span>
            <button 
              class="copy-button"
              @click="copyToClipboard('FR76 3000 4000 5000 6000 7000 891')"
              title="Copier"
            >
              📋
            </button>
          </div>
        </div>
        
        <div class="detail-row">
          <span class="detail-label">BIC / SWIFT</span>
          <div class="detail-value">
            <span class="detail-text">BNPAFRPPXXX</span>
            <button 
              class="copy-button"
              @click="copyToClipboard('BNPAFRPPXXX')"
              title="Copier"
            >
              📋
            </button>
          </div>
        </div>
        
        <div class="detail-row">
          <span class="detail-label">Banque</span>
          <div class="detail-value">
            <span class="detail-text">BNP PARIBAS</span>
          </div>
        </div>
        
        <div class="detail-row">
          <span class="detail-label">Adresse de la banque</span>
          <div class="detail-value">
            <span class="detail-text">16 Boulevard des Italiens, 75009 Paris</span>
          </div>
        </div>
      </div>
      
      <!-- Référence de paiement -->
      <div class="payment-reference">
        <div class="reference-header">
          <h5>Votre référence de paiement</h5>
          <span class="reference-important">IMPORTANT</span>
        </div>
        <div class="reference-card">
          <code class="reference-code">{{ paymentReference }}</code>
          <div class="reference-actions">
            <button 
              class="copy-reference"
              @click="copyToClipboard(paymentReference)"
            >
              📋 Copier la référence
            </button>
            <button 
              class="print-reference"
              @click="printReference"
            >
              🖨️ Imprimer
            </button>
          </div>
          <p class="reference-instruction">
            Cette référence DOIT apparaître dans la communication du virement
          </p>
        </div>
      </div>
    </div>
    
    <!-- Instructions -->
    <div class="instructions-section">
      <h4>Comment procéder ?</h4>
      
      <div class="instructions-steps">
        <div class="step">
          <div class="step-number">1</div>
          <div class="step-content">
            <h5>Effectuez le virement</h5>
            <p>Utilisez les coordonnées bancaires ci-dessus depuis votre espace bancaire en ligne ou en agence.</p>
          </div>
        </div>
        
        <div class="step">
          <div class="step-number">2</div>
          <div class="step-content">
            <h5>Indiquez la référence</h5>
            <p>Copiez-collez la référence de paiement dans le champ "communication" ou "message" du virement.</p>
          </div>
        </div>
        
        <div class="step">
          <div class="step-number">3</div>
          <div class="step-content">
            <h5>Confirmez le paiement</h5>
            <p>Une fois le virement effectué, cliquez sur "Confirmer le paiement" ci-dessous.</p>
          </div>
        </div>
        
        <div class="step">
          <div class="step-number">4</div>
          <div class="step-content">
            <h5>Recevez la confirmation</h5>
            <p>Nous traiterons votre commande sous 24-48h après réception du virement.</p>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Détails de la commande -->
    <div class="order-details-section">
      <h4>Détails de votre commande</h4>
      
      <div class="details-grid">
        <div class="detail-item">
          <span class="detail-name">Montant à verser</span>
          <span class="detail-value-amount">{{ formatPrice(amount) }}</span>
        </div>
        
        <div class="detail-item">
          <span class="detail-name">Numéro de commande</span>
          <span class="detail-value-text">{{ orderNumber }}</span>
        </div>
        
        <div class="detail-item">
          <span class="detail-name">Date limite de paiement</span>
          <span class="detail-value-text">{{ paymentDeadline }}</span>
        </div>
        
        <div class="detail-item">
          <span class="detail-name">Délai de traitement</span>
          <span class="detail-value-text">2-3 jours ouvrés après réception</span>
        </div>
      </div>
    </div>
    
    <!-- Aide -->
    <div class="help-section">
      <details class="help-item">
        <summary class="help-question">⏱️ Combien de temps pour que le virement soit visible ?</summary>
        <div class="help-answer">
          <p>Les virements SEPA sont généralement traités sous 1 jour ouvré.</p>
          <p>Pour les virements internationaux, comptez 2-5 jours ouvrés.</p>
        </div>
      </details>
      
      <details class="help-item">
        <summary class="help-question">💶 Des frais supplémentaires ?</summary>
        <div class="help-answer">
          <p>Les virements SEPA sont généralement gratuits dans la zone euro.</p>
          <p>Pour les virements internationaux, des frais peuvent s'appliquer selon votre banque.</p>
        </div>
      </details>
      
      <details class="help-item">
        <summary class="help-question">📄 Reçu / Facture ?</summary>
        <div class="help-answer">
          <p>Une facture vous sera envoyée par email après réception du paiement.</p>
          <p>Vous pouvez également la télécharger depuis votre espace client.</p>
        </div>
      </details>
    </div>
    
    <!-- Actions -->
    <div class="transfer-actions">
      <div class="action-buttons">
        <button 
          class="action-btn secondary"
          @click="downloadBankDetails"
        >
          📄 Télécharger les coordonnées
        </button>
        
        <button 
          class="action-btn primary"
          @click="confirmPayment"
          :disabled="processing"
        >
          <span v-if="processing">
            <span class="spinner-small"></span> Traitement...
          </span>
          <span v-else>J'ai effectué le virement</span>
        </button>
      </div>
      
      <div class="reminder">
        <p>⚠️ Votre commande sera expédiée seulement après réception du virement.</p>
      </div>
    </div>
    
    <!-- Email de confirmation -->
    <div v-if="showEmailForm" class="email-confirmation">
      <div class="email-header">
        <h5>Confirmer votre email pour le suivi</h5>
        <button class="close-email" @click="showEmailForm = false">×</button>
      </div>
      
      <div class="email-form">
        <p>Nous vous enverrons la confirmation de réception du virement à cette adresse :</p>
        
        <div class="form-group">
          <label for="confirmationEmail">Email</label>
          <input
            id="confirmationEmail"
            v-model="confirmationEmail"
            type="email"
            placeholder="votre@email.com"
            required
          />
        </div>
        
        <button 
          class="send-confirmation"
          @click="sendConfirmation"
          :disabled="!confirmationEmail"
        >
          Envoyer la confirmation
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BankTransferInfo',
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
      paymentReference: '',
      processing: false,
      showEmailForm: false,
      confirmationEmail: '',
      copied: false
    }
  },
  computed: {
    paymentDeadline() {
      const date = new Date()
      date.setDate(date.getDate() + 7) // 7 jours pour payer
      return date.toLocaleDateString('fr-FR')
    }
  },
  mounted() {
    // Générer une référence de paiement unique
    this.generatePaymentReference()
    
    // Si pas de numéro de commande fourni, en générer un
    if (!this.orderNumber) {
      this.orderNumber = 'CMD-' + Date.now().toString().slice(-6)
    }
  },
  methods: {
    generatePaymentReference() {
      const date = new Date()
      const timestamp = date.getTime().toString().slice(-6)
      const random = Math.random().toString(36).substring(2, 6).toUpperCase()
      this.paymentReference = `MONSHOP-${timestamp}-${random}`
    },
    
    formatPrice(price) {
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR'
      }).format(price)
    },
    
    async copyToClipboard(text) {
      try {
        await navigator.clipboard.writeText(text)
        this.showCopySuccess('Copié !')
      } catch (err) {
        console.error('Erreur copie:', err)
        // Fallback pour anciens navigateurs
        const textArea = document.createElement('textarea')
        textArea.value = text
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
        this.showCopySuccess('Copié !')
      }
    },
    
    copyAllDetails() {
      const details = `
Bénéficiaire: MONSHOP SARL
IBAN: FR76 3000 4000 5000 6000 7000 891
BIC: BNPAFRPPXXX
Banque: BNP PARIBAS
Adresse: 16 Boulevard des Italiens, 75009 Paris
Référence: ${this.paymentReference}
Montant: ${this.formatPrice(this.amount)}
      `.trim()
      
      this.copyToClipboard(details)
    },
    
    showCopySuccess(message) {
      // Afficher une notification temporaire
      const notification = document.createElement('div')
      notification.className = 'copy-notification'
      notification.textContent = message
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #10b981;
        color: white;
        padding: 1rem;
        border-radius: 8px;
        z-index: 1000;
        animation: fadeInOut 2s ease;
      `
      
      document.body.appendChild(notification)
      
      setTimeout(() => {
        document.body.removeChild(notification)
      }, 2000)
    },
    
    printReference() {
      const printWindow = window.open('', '_blank')
      printWindow.document.write(`
        <html>
          <head>
            <title>Référence de paiement - MonShop</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 2rem; }
              h1 { color: #1f2937; }
              .reference { font-family: monospace; font-size: 1.2rem; background: #f3f4f6; padding: 1rem; border-radius: 8px; }
              .details { margin-top: 2rem; }
            </style>
          </head>
          <body>
            <h1>Référence de paiement MonShop</h1>
            <p>Commande: ${this.orderNumber}</p>
            <div class="reference">${this.paymentReference}</div>
            <div class="details">
              <p><strong>Bénéficiaire:</strong> MONSHOP SARL</p>
              <p><strong>IBAN:</strong> FR76 3000 4000 5000 6000 7000 891</p>
              <p><strong>Montant:</strong> ${this.formatPrice(this.amount)}</p>
              <p><strong>Date:</strong> ${new Date().toLocaleDateString('fr-FR')}</p>
            </div>
            <p style="margin-top: 3rem; font-size: 0.9rem; color: #6b7280;">
              Veuillez inclure cette référence dans la communication de votre virement.
            </p>
          </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.print()
    },
    
    downloadBankDetails() {
      const content = `
COORDONNÉES BANCAIRES - MONSHOP
================================

INFORMATIONS BANCAIRES
---------------------
Bénéficiaire: MONSHOP SARL
IBAN: FR76 3000 4000 5000 6000 7000 891
BIC/SWIFT: BNPAFRPPXXX
Banque: BNP PARIBAS
Adresse: 16 Boulevard des Italiens, 75009 Paris

DÉTAILS DE LA COMMANDE
----------------------
Numéro de commande: ${this.orderNumber}
Référence de paiement: ${this.paymentReference}
Montant à verser: ${this.formatPrice(this.amount)}
Date limite: ${this.paymentDeadline}

INSTRUCTIONS
------------
1. Effectuez un virement avec les coordonnées ci-dessus
2. Indiquez la référence de paiement dans la communication
3. Conservez ce document comme preuve de paiement
4. Votre commande sera expédiée après réception du virement

CONTACT
-------
Email: paiement@monshop.com
Téléphone: 01 23 45 67 89

      `.trim()
      
      const blob = new Blob([content], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `coordonnees-bancaires-monshop-${this.orderNumber}.txt`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    },
    
    async confirmPayment() {
      this.processing = true
      
      try {
        // Simulation de traitement
        await new Promise(resolve => setTimeout(resolve, 1500))
        
        // Afficher le formulaire d'email
        this.showEmailForm = true
        
        // Émettre l'événement de confirmation
        this.$emit('payment-initiated', {
          method: 'bank_transfer',
          reference: this.paymentReference,
          amount: this.amount,
          orderNumber: this.orderNumber
        })
        
      } catch (error) {
        console.error('Erreur confirmation:', error)
      } finally {
        this.processing = false
      }
    },
    
    sendConfirmation() {
      // Simuler l'envoi d'email
      console.log('📧 Email envoyé à:', this.confirmationEmail)
      
      // Émettre l'événement de succès
      this.$emit('payment-confirmed', {
        method: 'bank_transfer',
        reference: this.paymentReference,
        email: this.confirmationEmail,
        timestamp: new Date().toISOString()
      })
      
      this.showEmailForm = false
      this.confirmationEmail = ''
    }
  }
}
</script>

<style scoped>
.bank-transfer-container {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

/* Header */
.transfer-header {
  text-align: center;
  margin-bottom: 2rem;
}

.transfer-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.transfer-title {
  color: #1f2937;
  margin: 0 0 0.5rem 0;
  font-size: 1.8rem;
}

.transfer-subtitle {
  color: #6b7280;
  margin: 0;
}

/* Section header */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.section-header h4 {
  margin: 0;
  color: #1f2937;
}

.copy-all {
  color: #3b82f6;
  font-weight: 600;
  cursor: pointer;
  padding: 0.5rem 1rem;
  border: 1px solid #3b82f6;
  border-radius: 6px;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.copy-all:hover {
  background: #3b82f6;
  color: white;
}

/* Détails bancaires */
.bank-details-card {
  background: #f8fafc;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  border: 1px solid #e5e7eb;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid #e5e7eb;
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-label {
  color: #6b7280;
  font-weight: 500;
  min-width: 180px;
}

.detail-value {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.detail-text {
  color: #1f2937;
  font-weight: 600;
  font-family: monospace;
}

.detail-text.iban {
  letter-spacing: 1px;
}

.copy-button {
  background: none;
  border: 1px solid #d1d5db;
  color: #6b7280;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.copy-button:hover {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

/* Référence de paiement */
.payment-reference {
  margin: 2rem 0;
}

.reference-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.reference-header h5 {
  margin: 0;
  color: #1f2937;
}

.reference-important {
  background: #ef4444;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
}

.reference-card {
  background: #fef2f2;
  border: 2px solid #ef4444;
  border-radius: 8px;
  padding: 1.5rem;
  text-align: center;
}

.reference-code {
  display: block;
  font-family: 'Courier New', monospace;
  font-size: 1.5rem;
  font-weight: bold;
  color: #dc2626;
  margin-bottom: 1.5rem;
  letter-spacing: 1px;
}

.reference-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 1rem;
}

.copy-reference,
.print-reference {
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  font-size: 0.9rem;
}

.copy-reference {
  background: #3b82f6;
  color: white;
}

.copy-reference:hover {
  background: #2563eb;
}

.print-reference {
  background: #e5e7eb;
  color: #374151;
}

.print-reference:hover {
  background: #d1d5db;
}

.reference-instruction {
  color: #dc2626;
  font-weight: 600;
  margin: 0;
  font-size: 0.9rem;
}

/* Instructions */
.instructions-section {
  margin: 2rem 0;
}

.instructions-section h4 {
  color: #1f2937;
  margin: 0 0 1.5rem 0;
}

.instructions-steps {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.step {
  display: flex;
  gap: 1rem;
  padding: 1.5rem;
  background: #f8fafc;
  border-radius: 8px;
  border-left: 4px solid #3b82f6;
}

.step-number {
  width: 40px;
  height: 40px;
  background: #3b82f6;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  flex-shrink: 0;
}

.step-content h5 {
  margin: 0 0 0.5rem 0;
  color: #1f2937;
}

.step-content p {
  margin: 0;
  color: #6b7280;
  font-size: 0.9rem;
}

/* Détails commande */
.order-details-section {
  margin: 2rem 0;
  padding: 1.5rem;
  background: #f0f9ff;
  border-radius: 8px;
}

.order-details-section h4 {
  margin: 0 0 1rem 0;
  color: #1f2937;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.detail-name {
  color: #6b7280;
  font-size: 0.9rem;
}

.detail-value-amount {
  color: #3b82f6;
  font-weight: bold;
  font-size: 1.2rem;
}

.detail-value-text {
  color: #1f2937;
  font-weight: 600;
}

/* Aide */
.help-section {
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

.help-answer p {
  margin: 0.5rem 0;
}

/* Actions */
.transfer-actions {
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.action-buttons {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.action-btn {
  flex: 1;
  padding: 1rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.3s ease;
}

.action-btn.primary {
  background: #3b82f6;
  color: white;
}

.action-btn.primary:hover:not(:disabled) {
  background: #2563eb;
  transform: translateY(-1px);
}

.action-btn.primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.action-btn.secondary {
  background: #e5e7eb;
  color: #374151;
  border: 1px solid #d1d5db;
}

.action-btn.secondary:hover {
  background: #d1d5db;
}

.spinner-small {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s ease-in-out infinite;
  margin-right: 0.5rem;
  vertical-align: middle;
}

.reminder {
  text-align: center;
  padding: 1rem;
  background: #fef3c7;
  border-radius: 8px;
  border: 1px solid #fbbf24;
}

.reminder p {
  margin: 0;
  color: #92400e;
  font-weight: 500;
}

/* Email confirmation */
.email-confirmation {
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

.email-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.email-header h5 {
  margin: 0;
  color: #1f2937;
}

.close-email {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #6b7280;
  cursor: pointer;
  line-height: 1;
}

.email-form {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.email-form p {
  color: #6b7280;
  margin: 0 0 1.5rem 0;
  font-size: 0.9rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #374151;
}

.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
}

.form-group input:focus {
  outline: none;
  border-color: #3b82f6;
}

.send-confirmation {
  width: 100%;
  padding: 0.75rem;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s ease;
}

.send-confirmation:hover:not(:disabled) {
  background: #059669;
}

.send-confirmation:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Responsive */
@media (max-width: 768px) {
  .detail-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .detail-label {
    min-width: auto;
  }
  
  .instructions-steps {
    grid-template-columns: 1fr;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .reference-actions {
    flex-direction: column;
  }
}
</style>
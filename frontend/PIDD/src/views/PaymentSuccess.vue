<template>
  <div class="payment-success-page">
    <!-- Navigation -->
    <nav class="navigation">
      <router-link to="/" class="nav-logo">MonShop</router-link>
      <div class="nav-links">
        <router-link to="/" class="nav-link">Accueil</router-link>
        <router-link to="/categories" class="nav-link">Collections</router-link>
        <router-link to="/cart" class="nav-link">Panier</router-link>
      </div>
    </nav>

    <div class="success-content">
      <!-- Confirmation -->
      <div class="success-header">
        <div class="success-icon">🎉</div>
        <h1 class="success-title">Commande confirmée !</h1>
        <p class="success-subtitle">
          Merci pour votre achat{{ user ? `, ${user.prenom}` : '' }} !
        </p>
      </div>

      <!-- Détails de la commande -->
      <div class="order-summary-card">
        <h3>Résumé de votre commande</h3>
        
        <div class="order-details">
          <div class="detail-item">
            <span class="detail-label">Numéro de commande</span>
            <span class="detail-value">{{ orderId || 'CMD-' + Date.now().toString().slice(-6) }}</span>
          </div>
          
          <div class="detail-item">
            <span class="detail-label">Date</span>
            <span class="detail-value">{{ currentDate }}</span>
          </div>
          
          <div class="detail-item">
            <span class="detail-label">Méthode de paiement</span>
            <span class="detail-value payment-method">
              <span class="method-icon">{{ getPaymentMethodIcon() }}</span>
              {{ getPaymentMethodName() }}
            </span>
          </div>
          
          <div class="detail-item">
            <span class="detail-label">Montant total</span>
            <span class="detail-value amount">{{ formatPrice(amount) }}</span>
          </div>
          
          <div class="detail-item">
            <span class="detail-label">Statut</span>
            <span class="detail-value status confirmed">
              ✅ Confirmée
            </span>
          </div>
        </div>
      </div>

      <!-- Informations de livraison -->
      <div class="delivery-info-section">
        <h3>Informations de livraison</h3>
        <div class="delivery-card">
          <div class="delivery-method">
            <span class="method-icon">{{ getDeliveryIcon() }}</span>
            <div>
              <h4>{{ deliveryMethod || 'Livraison standard' }}</h4>
              <p>Numéro de suivi : <strong>{{ trackingNumber }}</strong></p>
              <button @click="copyTrackingNumber" class="copy-tracking-btn">
                📋 Copier le numéro
              </button>
            </div>
          </div>
          
          <div class="tracking-link">
            <a :href="getTrackingLink()" target="_blank" class="tracking-btn">
              🚚 Suivre mon colis en direct
            </a>
          </div>
        </div>
      </div>

      <!-- Prochaines étapes -->
      <div class="next-steps">
        <h3>Prochaines étapes</h3>
        
        <div class="steps-timeline">
          <div class="step">
            <div class="step-number">1</div>
            <div class="step-content">
              <h4>Confirmation par email</h4>
              <p>Vous recevrez un email de confirmation sous quelques minutes.</p>
            </div>
          </div>
          
          <div class="step">
            <div class="step-number">2</div>
            <div class="step-content">
              <h4>Préparation de la commande</h4>
              <p>Notre équipe prépare votre commande pour l'expédition.</p>
            </div>
          </div>
          
          <div class="step">
            <div class="step-number">3</div>
            <div class="step-content">
              <h4>Expédition</h4>
              <p>Vous recevrez un email avec le numéro de suivi.</p>
            </div>
          </div>
          
          <div class="step">
            <div class="step-number">4</div>
            <div class="step-content">
              <h4>Livraison</h4>
              <p>Votre commande sera livrée dans les délais estimés.</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="success-actions">
        <router-link to="/" class="action-btn primary">
          🏠 Retour à l'accueil
        </router-link>
        
        <router-link to="/categories" class="action-btn secondary">
          🛒 Continuer mes achats
        </router-link>
        
        <button class="action-btn outline" @click="downloadInvoice">
          📄 Télécharger la facture
        </button>
        
        <button class="action-btn outline" @click="printSummary">
          🖨️ Imprimer ce récapitulatif
        </button>
      </div>

      <!-- Contact -->
      <div class="contact-section">
        <h4>Des questions ?</h4>
        <p>Notre équipe est là pour vous aider</p>
        <div class="contact-options">
          <a href="mailto:support@monshop.com" class="contact-link">
            ✉️ support@monshop.com
          </a>
          <a href="tel:+33123456789" class="contact-link">
            📞 01 23 45 67 89
          </a>
          <router-link to="/help" class="contact-link">
            ❓ Centre d'aide
          </router-link>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <footer class="success-footer">
      <p>© 2024 MonShop. Tous droits réservés.</p>
      <p>Merci de votre confiance !</p>
    </footer>
  </div>
</template>

<script>
export default {
  name: 'PaymentSuccess',
  props: {
    orderId: {
      type: String,
      default: ''
    },
    amount: {
      type: Number,
      default: 0
    },
    method: {
      type: String,
      default: ''
    },
    user: {
      type: Object,
      default: null
    },
    deliveryMethod: {
      type: String,
      default: 'Livraison standard'
    }
  },
  data() {
    return {
      currentDate: new Date().toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      trackingNumber: this.generateTrackingNumber()
    }
  },
  mounted() {
    console.log('✅ Page de succès chargée')
    console.log('Commande:', this.orderId)
    console.log('Montant:', this.amount)
    console.log('Méthode:', this.method)
    
    // Nettoyer le panier
    this.clearCart()
    
    // Émettre un événement de succès
    this.$emit('order-completed', {
      orderId: this.orderId,
      amount: this.amount,
      method: this.method,
      date: new Date().toISOString(),
      trackingNumber: this.trackingNumber
    })
  },
  methods: {
    formatPrice(price) {
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR'
      }).format(price)
    },
    
    getPaymentMethodIcon() {
      const icons = {
        'credit_card': '💳',
        'paypal': '🔵',
        'bank_transfer': '🏦',
        'paysafe': '🃏'
      }
      return icons[this.method] || '💰'
    },
    
    getPaymentMethodName() {
      const names = {
        'credit_card': 'Carte bancaire',
        'paypal': 'PayPal',
        'bank_transfer': 'Virement bancaire',
        'paysafe': 'Paysafe Card'
      }
      return names[this.method] || 'Paiement'
    },
    
    getDeliveryIcon() {
      const method = this.deliveryMethod.toLowerCase()
      if (method.includes('express')) return '🚚'
      if (method.includes('relais') || method.includes('point')) return '🏪'
      if (method.includes('gratuite') || method.includes('offerte')) return '🎁'
      return '📦'
    },
    
    generateTrackingNumber() {
      const prefix = 'MONSHOP'
      const random = Math.random().toString(36).substring(2, 8).toUpperCase()
      return `${prefix}-${Date.now().toString().slice(-6)}-${random}`
    },
    
    copyTrackingNumber() {
      navigator.clipboard.writeText(this.trackingNumber)
        .then(() => {
          alert('Numéro de suivi copié !')
        })
        .catch(err => {
          console.error('Erreur lors de la copie:', err)
          // Fallback pour les navigateurs qui ne supportent pas clipboard API
          const tempInput = document.createElement('input')
          tempInput.value = this.trackingNumber
          document.body.appendChild(tempInput)
          tempInput.select()
          document.execCommand('copy')
          document.body.removeChild(tempInput)
          alert('Numéro de suivi copié !')
        })
    },
    
    getTrackingLink() {
      // Lien vers le suivi du transporteur
      return 'https://www.colissimo.fr/portail_colissimo/suivre.do'
    },
    
    clearCart() {
      localStorage.removeItem('monShop_cart')
      console.log('🛒 Panier nettoyé')
    },
    
    downloadInvoice() {
      // Simulation de téléchargement de facture
      console.log('📄 Téléchargement facture pour:', this.orderId)
      
      // Créer un PDF factice
      const invoiceContent = `
        FACTURE
        ======================
        Numéro: ${this.orderId}
        Date: ${this.currentDate}
        Client: ${this.user ? this.user.nom + ' ' + this.user.prenom : 'Client'}
        
        Montant total: ${this.formatPrice(this.amount)}
        Méthode: ${this.getPaymentMethodName()}
        Livraison: ${this.deliveryMethod}
        Suivi: ${this.trackingNumber}
        
        Merci pour votre commande !
      `
      
      // Créer et télécharger un fichier texte (simulation)
      const blob = new Blob([invoiceContent], { type: 'text/plain' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `facture-${this.orderId}.txt`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
      
      alert('Facture générée avec succès ! Un email vous a été envoyé.')
    },
    
    printSummary() {
      window.print()
    }
  }
}
</script>

<style scoped>
.payment-success-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f0f9ff 0%, #e6f7ff 100%);
}

/* Navigation */
.navigation {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-logo {
  font-size: 1.5rem;
  font-weight: bold;
  color: #3b82f6;
  text-decoration: none;
}

.nav-links {
  display: flex;
  gap: 2rem;
}

.nav-link {
  text-decoration: none;
  color: #374151;
  font-weight: 500;
  transition: color 0.3s ease;
}

.nav-link:hover,
.nav-link.router-link-active {
  color: #3b82f6;
}

/* Contenu principal */
.success-content {
  max-width: 800px;
  margin: 0 auto;
  padding: 3rem 2rem;
}

/* Header succès */
.success-header {
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

.success-title {
  color: #10b981;
  font-size: 2.5rem;
  margin: 0 0 0.5rem 0;
}

.success-subtitle {
  color: #6b7280;
  font-size: 1.1rem;
  margin: 0;
}

/* Résumé commande */
.order-summary-card {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.order-summary-card h3 {
  margin: 0 0 1.5rem 0;
  color: #1f2937;
  border-bottom: 2px solid #3b82f6;
  padding-bottom: 0.5rem;
}

.order-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.detail-label {
  font-size: 0.9rem;
  color: #6b7280;
  font-weight: 500;
}

.detail-value {
  font-size: 1.1rem;
  color: #1f2937;
  font-weight: 600;
}

.payment-method {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.method-icon {
  font-size: 1.2rem;
}

.amount {
  color: #3b82f6;
  font-size: 1.2rem;
}

.status.confirmed {
  color: #10b981;
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background: #d1fae5;
  border-radius: 20px;
  font-size: 0.9rem;
}

/* Informations de livraison */
.delivery-info-section {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.delivery-info-section h3 {
  margin: 0 0 1.5rem 0;
  color: #1f2937;
  border-bottom: 2px solid #f59e0b;
  padding-bottom: 0.5rem;
}

.delivery-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1.5rem;
}

.delivery-method {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex: 1;
}

.delivery-method .method-icon {
  font-size: 3rem;
  min-width: 60px;
}

.delivery-method h4 {
  margin: 0 0 0.5rem 0;
  color: #1f2937;
}

.delivery-method p {
  margin: 0 0 0.5rem 0;
  color: #6b7280;
}

.copy-tracking-btn {
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.copy-tracking-btn:hover {
  background: #e5e7eb;
  border-color: #9ca3af;
}

.tracking-link {
  flex-shrink: 0;
}

.tracking-btn {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.tracking-btn:hover {
  background: linear-gradient(135deg, #d97706, #b45309);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
}

/* Prochaines étapes */
.next-steps {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.next-steps h3 {
  margin: 0 0 1.5rem 0;
  color: #1f2937;
}

.steps-timeline {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1.5rem;
}

.step {
  display: flex;
  gap: 1rem;
  padding: 1rem;
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

.step-content h4 {
  margin: 0 0 0.5rem 0;
  color: #1f2937;
  font-size: 1rem;
}

.step-content p {
  margin: 0;
  color: #6b7280;
  font-size: 0.9rem;
}

/* Actions */
.success-actions {
  display: flex;
  gap: 1rem;
  margin: 2rem 0;
  flex-wrap: wrap;
  justify-content: center;
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
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
  box-shadow: 0 4px 6px rgba(59, 130, 246, 0.2);
}

.action-btn.primary:hover {
  background: linear-gradient(135deg, #2563eb, #1e40af);
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(59, 130, 246, 0.3);
}

.action-btn.secondary {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  box-shadow: 0 4px 6px rgba(16, 185, 129, 0.2);
}

.action-btn.secondary:hover {
  background: linear-gradient(135deg, #059669, #047857);
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(16, 185, 129, 0.3);
}

.action-btn.outline {
  background: white;
  color: #374151;
  border: 2px solid #e5e7eb;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.action-btn.outline:hover {
  background: #f8fafc;
  border-color: #d1d5db;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

/* Contact */
.contact-section {
  text-align: center;
  padding: 2rem;
  background: white;
  border-radius: 12px;
  margin: 2rem 0;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.contact-section h4 {
  margin: 0 0 0.5rem 0;
  color: #1f2937;
}

.contact-section p {
  color: #6b7280;
  margin: 0 0 1.5rem 0;
}

.contact-options {
  display: flex;
  gap: 2rem;
  justify-content: center;
  flex-wrap: wrap;
}

.contact-link {
  color: #3b82f6;
  text-decoration: none;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.contact-link:hover {
  text-decoration: underline;
  background: #f0f9ff;
}

/* Footer */
.success-footer {
  text-align: center;
  padding: 2rem;
  color: #6b7280;
  font-size: 0.9rem;
  background: white;
  border-top: 1px solid #e5e7eb;
}

.success-footer p {
  margin: 0.5rem 0;
}

/* Responsive */
@media (max-width: 768px) {
  .navigation {
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
  }
  
  .nav-links {
    gap: 1rem;
  }
  
  .success-content {
    padding: 2rem 1rem;
  }
  
  .order-details {
    grid-template-columns: 1fr;
  }
  
  .delivery-card {
    flex-direction: column;
    align-items: flex-start;
    gap: 1.5rem;
  }
  
  .delivery-method {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .steps-timeline {
    grid-template-columns: 1fr;
  }
  
  .success-actions {
    flex-direction: column;
  }
  
  .action-btn {
    min-width: 100%;
  }
  
  .contact-options {
    flex-direction: column;
    gap: 1rem;
  }
}

/* Styles pour l'impression */
@media print {
  .navigation,
  .success-actions,
  .contact-section,
  .success-footer,
  .copy-tracking-btn,
  .tracking-btn {
    display: none;
  }
  
  .success-content {
    padding: 0;
  }
  
  .success-header,
  .order-summary-card,
  .delivery-info-section,
  .next-steps {
    box-shadow: none;
    border: 1px solid #e5e7eb;
    margin-bottom: 1rem;
    page-break-inside: avoid;
  }
}
</style>
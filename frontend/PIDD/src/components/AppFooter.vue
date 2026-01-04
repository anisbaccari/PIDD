<template>
  <footer class="footer" role="contentinfo">
    <!-- Bouton RGPD flottant -->
    <button 
      class="rgpd-floating-btn"
      @click="openModal('cookies')"
      :class="{ 'rgpd-pulse': !cookies.saved }"
      aria-label="Gérer vos préférences de confidentialité"
    >
      <svg class="rgpd-icon" viewBox="0 0 24 24" aria-hidden="true">
        <path fill="currentColor" d="M12,16A2,2 0 0,1 14,18A2,2 0 0,1 12,20A2,2 0 0,1 10,18A2,2 0 0,1 12,16M12,10A2,2 0 0,1 14,12A2,2 0 0,1 12,14A2,2 0 0,1 10,12A2,2 0 0,1 12,10M12,4A2,2 0 0,1 14,6A2,2 0 0,1 12,8A2,2 0 0,1 10,6A2,2 0 0,1 12,4Z"/>
      </svg>
      <span class="rgpd-label">RGPD</span>
    </button>

    <div class="footer-content">
      <!-- Logo et Newsletter -->
      <div class="footer-section logo-section">
        <div class="logo-wrapper">
          <h3 class="footer-heading">MonShop</h3>
        </div>
        <p class="footer-description">
          Votre boutique de t-shirts premium. 
          Qualité, style et confort réunis.
        </p>
        
        <div class="newsletter">
          <p class="newsletter-text">Recevez nos offres exclusives</p>
          <form @submit.prevent="subscribeNewsletter" class="newsletter-form">
            <div class="input-group">
              <input 
                type="email" 
                v-model="newsletterEmail" 
                placeholder="Votre email" 
                required
                class="newsletter-input"
                aria-label="Adresse email pour l'inscription à la newsletter"
              >
              <button type="submit" class="newsletter-btn" aria-label="S'inscrire à la newsletter">
                →
              </button>
            </div>
            <label class="checkbox-label">
              <input 
                type="checkbox" 
                v-model="newsletterConsent" 
                required
                class="checkbox-input"
              >
              <span class="checkbox-text">
                J'accepte de recevoir les offres marketing
              </span>
            </label>
          </form>
        </div>
      </div>

      <!-- Navigation principale -->
      <div class="footer-section">
        <h3 class="footer-heading">Boutique</h3>
        <ul class="footer-links">
          <li><router-link to="/" class="footer-link">Accueil</router-link></li>
          <li><router-link to="/category/1" class="footer-link">T-shirts Homme</router-link></li>
          <li><router-link to="/category/2" class="footer-link">T-shirts Femme</router-link></li>
          <li><router-link to="/category/3" class="footer-link">T-shirts Enfants</router-link></li>
          <li><router-link to="/new" class="footer-link">Nouveautés</router-link></li>
          <li><router-link to="/sale" class="footer-link">Promotions</router-link></li>
        </ul>
      </div>

      <!-- Informations légales -->
      <div class="footer-section">
        <h3 class="footer-heading">Informations</h3>
        <ul class="footer-links">
          <li><router-link to="/about" class="footer-link">À propos</router-link></li>
          <li><router-link to="/faq" class="footer-link">FAQ</router-link></li>
          <li><router-link to="/shipping" class="footer-link">Livraison</router-link></li>
          <li><router-link to="/returns" class="footer-link">Retours</router-link></li>
          <li>
            <button class="footer-link modal-trigger" @click="openModal('mentions')">
              Mentions légales
            </button>
          </li>
          <li>
            <button class="footer-link modal-trigger" @click="openModal('confidentialite')">
              Confidentialité
            </button>
          </li>
          <li>
            <button class="footer-link modal-trigger" @click="openModal('cgv')">
              CGV
            </button>
          </li>
        </ul>
      </div>

      <!-- Contact & Réseaux sociaux -->
      <div class="footer-section">
        <h3 class="footer-heading">Contact & Réseaux</h3>
        <ul class="footer-contact">
          <li class="contact-item">
            <span class="contact-icon">✉️</span>
            <a href="mailto:contact@monshop.com" class="contact-link">contact@monshop.com</a>
          </li>
          <li class="contact-item">
            <span class="contact-icon">📞</span>
            <a href="tel:+33123456789" class="contact-link">01 23 45 67 89</a>
          </li>
          <li class="contact-item">
            <span class="contact-icon">🕒</span>
            <span>Lun-Ven: 9h-18h</span>
          </li>
          <li class="contact-item">
            <button class="contact-btn modal-trigger" @click="openModal('contact')">
              Formulaire de contact
            </button>
          </li>
        </ul>

        <div class="social-section">
          <h4 class="social-heading">Suivez-nous</h4>
          <div class="social-links" role="list">
            <a href="https://www.facebook.com/hermann.tchuente/about_places" class="social-link" aria-label="Facebook (nouvelle fenêtre)">
              <svg class="social-icon" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="currentColor" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </a>
            <a href="#" class="social-link" aria-label="Instagram (nouvelle fenêtre)">
              <svg class="social-icon" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="currentColor" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>
            <a href="#" class="social-link" aria-label="Twitter (nouvelle fenêtre)">
              <svg class="social-icon" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="currentColor" d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.213c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
              </svg>
            </a>
            <a href="https://www.linkedin.com/in/hermann-tchuente-5895a3203/" class="social-link" aria-label="LinkedIn (nouvelle fenêtre)">
              <svg class="social-icon" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="currentColor" d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>

    <!-- Barre inférieure -->
    <div class="footer-bottom">
      <div class="footer-bottom-content">
        <div class="footer-legal">
          <p class="copyright">&copy; 2024 MonShop. Tous droits réservés.</p>
          <div class="legal-links">
            <button @click="openModal('mentions')" class="legal-link">Mentions légales</button>
            <span class="separator" aria-hidden="true">•</span>
            <button @click="openModal('confidentialite')" class="legal-link">Vie privée</button>
            <span class="separator" aria-hidden="true">•</span>
            <button @click="openModal('cookies')" class="legal-link">Cookies</button>
            <span class="separator" aria-hidden="true">•</span>
            <button @click="openModal('cgv')" class="legal-link">CGV</button>
          </div>
        </div>
        
        <!-- Méthodes de paiement -->
        <div class="payment-methods">
          <div class="payment-icon" title="Carte Bancaire">💳</div>
          <div class="payment-icon" title="PayPal">🅿️</div>
          <div class="payment-icon" title="Apple Pay"></div>
          <div class="payment-icon" title="Google Pay">G</div>
        </div>
      </div>
    </div>

    <!-- Modal RGPD -->
    <div v-if="activeModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content" role="dialog" :aria-labelledby="'modal-title-' + activeModal">
        <div class="modal-header">
          <h2 :id="'modal-title-' + activeModal" class="modal-title">
            {{ getModalTitle(activeModal) }}
          </h2>
          <button 
            @click="closeModal" 
            class="modal-close"
            aria-label="Fermer la fenêtre"
          >
            <svg class="close-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="currentColor" d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"/>
            </svg>
          </button>
        </div>

        <!-- Modal Cookies -->
        <div v-if="activeModal === 'cookies'" class="modal-body">
          <div class="cookie-explainer">
            <p>Nous utilisons des cookies pour améliorer votre expérience. Choisissez les catégories que vous acceptez :</p>
          </div>

          <div class="cookie-categories">
            <div class="cookie-category essential">
              <div class="cookie-header">
                <div class="cookie-title">
                  <span class="cookie-badge essential-badge">Nécessaire</span>
                  <h3>Cookies Essentiels</h3>
                </div>
                <div class="cookie-toggle">
                  <span class="toggle-label">Toujours actif</span>
                  <div class="toggle-icon">🔒</div>
                </div>
              </div>
              <p class="cookie-description">Indispensables au fonctionnement du site (session, panier, sécurité)</p>
              <ul class="cookie-list">
                <li>Authentification</li>
                <li>Panier d'achat</li>
                <li>Protection contre la fraude</li>
              </ul>
            </div>

            <div class="cookie-category">
              <div class="cookie-header">
                <div class="cookie-title">
                  <span class="cookie-badge analytics-badge">Analytics</span>
                  <h3>Cookies d'Analyse</h3>
                </div>
                <div class="cookie-toggle">
                  <label class="toggle-switch">
                    <input 
                      type="checkbox" 
                      v-model="cookies.analytics"
                      class="toggle-input"
                      :disabled="cookies.essential"
                    >
                    <span class="toggle-slider"></span>
                  </label>
                </div>
              </div>
              <p class="cookie-description">Nous aident à comprendre comment vous utilisez notre site</p>
              <ul class="cookie-list">
                <li>Google Analytics</li>
                <li>Statistiques anonymes</li>
                <li>Amélioration des performances</li>
              </ul>
            </div>

            <div class="cookie-category">
              <div class="cookie-header">
                <div class="cookie-title">
                  <span class="cookie-badge marketing-badge">Marketing</span>
                  <h3>Cookies Marketing</h3>
                </div>
                <div class="cookie-toggle">
                  <label class="toggle-switch">
                    <input 
                      type="checkbox" 
                      v-model="cookies.marketing"
                      class="toggle-input"
                      :disabled="cookies.essential"
                    >
                    <span class="toggle-slider"></span>
                  </label>
                </div>
              </div>
              <p class="cookie-description">Personnalisent votre expérience et nos publicités</p>
              <ul class="cookie-list">
                <li>Réseaux sociaux</li>
                <li>Publicité ciblée</li>
                <li>Recommandations personnalisées</li>
              </ul>
            </div>
          </div>

          <div class="modal-actions">
            <button @click="refuseAllCookies" class="btn btn-outline">
              Tout refuser
            </button>
            <button @click="saveCookiePreferences" class="btn btn-secondary">
              Enregistrer mes choix
            </button>
            <button @click="acceptAllCookies" class="btn btn-primary">
              Tout accepter
            </button>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<script>
export default {
  name: 'AppFooter',
  data() {
    return {
      activeModal: null,
      newsletterEmail: '',
      newsletterConsent: false,
      cookies: {
        essential: true,
        analytics: false,
        marketing: false,
        saved: false
      },
      contactForm: {
        name: '',
        email: '',
        subject: '',
        message: ''
      }
    }
  },
  computed: {
  currentUrl() {
    return window.location.href;
  },
  pageTitle() {
    return document.title;
  }
}
,
  mounted() {
    this.loadCookiePreferences();
  },
  methods: {
    openModal(modalType) {
      this.activeModal = modalType;
      document.body.style.overflow = 'hidden';
      document.documentElement.style.scrollbarGutter = 'stable';
    },
    closeModal() {
      this.activeModal = null;
      document.body.style.overflow = '';
      document.documentElement.style.scrollbarGutter = '';
    },
    getModalTitle(modalType) {
      const titles = {
        'mentions': 'Mentions Légales',
        'confidentialite': 'Politique de Confidentialité',
        'cookies': 'Gestion des Cookies',
        'cgv': 'Conditions Générales de Vente',
        'cgu': 'Conditions Générales d\'Utilisation',
        'contact': 'Contactez-nous'
      };
      return titles[modalType] || 'Modal';
    },
    loadCookiePreferences() {
      const preferences = localStorage.getItem('cookiePreferences');
      if (preferences) {
        const saved = JSON.parse(preferences);
        this.cookies = { ...this.cookies, ...saved, saved: true };
      }
    },
    saveCookiePreferences() {
      const { essential, analytics, marketing } = this.cookies;
      localStorage.setItem('cookiePreferences', JSON.stringify({ 
        essential, analytics, marketing 
      }));
      this.cookies.saved = true;
      this.closeModal();
      
      this.showNotification('Préférences enregistrées avec succès', 'success');
    },
    acceptAllCookies() {
      this.cookies.analytics = true;
      this.cookies.marketing = true;
      this.saveCookiePreferences();
    },
    refuseAllCookies() {
      this.cookies.analytics = false;
      this.cookies.marketing = false;
      this.saveCookiePreferences();
    },
    subscribeNewsletter() {
      if (!this.newsletterConsent) {
        this.showNotification('Veuillez accepter les conditions', 'error');
        return;
      }
      
      console.log('Inscription newsletter:', this.newsletterEmail);
      this.showNotification('Merci pour votre inscription !', 'success');
      this.newsletterEmail = '';
      this.newsletterConsent = false;
    },
    showNotification(message, type) {
      const toast = document.createElement('div');
      toast.className = `toast-notification toast-${type}`;
      toast.textContent = message;
      toast.setAttribute('role', 'alert');
      
      document.body.appendChild(toast);
      
      setTimeout(() => {
        toast.classList.add('toast-show');
      }, 10);
      
      setTimeout(() => {
        toast.classList.remove('toast-show');
        setTimeout(() => {
          document.body.removeChild(toast);
        }, 300);
      }, 3000);
    }
  }
}
</script>

<style scoped>
/* Palette de couleurs noir profond */
:root {
  --black-primary: #000000;
  --black-secondary: #111111;
  --black-tertiary: #222222;
  --black-surface: #333333;
  --black-border: #444444;
  --white-text: #ffffff;
  --gray-text: #cccccc;
  --gray-light: #aaaaaa;
  --accent-primary: #8b5cf6;
  --accent-secondary: #10b981;
  --accent-danger: #ef4444;
  --shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.5);
  --shadow: 0 4px 12px rgba(0, 0, 0, 0.7);
  --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.9);
  --radius: 12px;
  --radius-sm: 8px;
}

/* Footer principal - Fond noir */
.footer {
  background: var(--black-primary);
  color: var(--white-text);
  position: relative;
  border-top: 1px solid var(--black-border);
}

/* Bouton RGPD flottant */
.rgpd-floating-btn {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  z-index: 999;
  background: linear-gradient(135deg, var(--accent-primary), #7c3aed);
  color: white;
  border: none;
  border-radius: 50px;
  padding: 0.75rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: var(--shadow-lg);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.rgpd-floating-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 32px rgba(139, 92, 246, 0.4);
}

.rgpd-pulse {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(139, 92, 246, 0.7);
  }
  50% {
    box-shadow: 0 0 0 15px rgba(139, 92, 246, 0);
  }
}

.rgpd-icon {
  width: 20px;
  height: 20px;
}

/* Contenu principal du footer */
.footer-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 4rem 2rem;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 3rem;
}

/* Section Logo & Newsletter */
.logo-section {
  grid-column: span 1;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.logo-wrapper {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.footer-heading {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--white-text);
  margin: 0;
  letter-spacing: 0.5px;
}

.footer-description {
  color: var(--gray-text);
  line-height: 1.6;
  font-size: 0.95rem;
  margin: 0;
}

/* Newsletter */
.newsletter {
  margin-top: 1rem;
}

.newsletter-text {
  color: var(--gray-text);
  font-size: 0.95rem;
  margin-bottom: 1rem;
}

.newsletter-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.input-group {
  display: flex;
  background: var(--black-tertiary);
  border: 1px solid var(--black-border);
  border-radius: var(--radius-sm);
  overflow: hidden;
  transition: all 0.3s;
}

.input-group:focus-within {
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
}

.newsletter-input {
  flex: 1;
  background: transparent;
  border: none;
  padding: 0.875rem 1rem;
  color: var(--white-text);
  font-family: inherit;
  font-size: 0.95rem;
}

.newsletter-input::placeholder {
  color: var(--gray-light);
}

.newsletter-btn {
  background: var(--accent-primary);
  color: white;
  border: none;
  padding: 0 1.5rem;
  cursor: pointer;
  transition: background 0.3s;
  font-weight: 600;
}

.newsletter-btn:hover {
  background: #7c3aed;
}

.checkbox-label {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  cursor: pointer;
}

.checkbox-input {
  margin-top: 0.25rem;
  flex-shrink: 0;
}

.checkbox-text {
  color: var(--gray-text);
  font-size: 0.8rem;
  line-height: 1.4;
}

/* Navigation */
.footer-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.footer-section .footer-heading {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--white-text);
  margin: 0;
  position: relative;
  padding-bottom: 0.75rem;
}

.footer-section .footer-heading::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 40px;
  height: 2px;
  background: var(--accent-primary);
}

.footer-links {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.footer-link, .modal-trigger {
  color: var(--gray-text);
  text-decoration: none;
  transition: all 0.3s ease;
  background: none;
  border: none;
  font-family: inherit;
  font-size: 0.95rem;
  cursor: pointer;
  text-align: left;
  padding: 0;
  line-height: 1.5;
}

.footer-link:hover, .modal-trigger:hover {
  color: var(--white-text);
  transform: translateX(4px);
}

/* Contact */
.footer-contact {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: var(--gray-text);
}

.contact-icon {
  width: 20px;
  text-align: center;
  flex-shrink: 0;
  opacity: 0.7;
}

.contact-link {
  color: var(--gray-text);
  text-decoration: none;
  transition: color 0.3s;
}

.contact-link:hover {
  color: var(--white-text);
}

.contact-btn {
  background: rgba(139, 92, 246, 0.1);
  color: var(--accent-primary);
  border: 1px solid rgba(139, 92, 246, 0.2);
  border-radius: var(--radius-sm);
  padding: 0.75rem 1.5rem;
  font-weight: 500;
  transition: all 0.3s;
  margin-top: 0.5rem;
  width: 100%;
  cursor: pointer;
}

.contact-btn:hover {
  background: rgba(139, 92, 246, 0.2);
}

/* Social Media */
.social-section {
  margin-top: 2rem;
}

.social-heading {
  color: var(--white-text);
  font-size: 0.95rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.social-links {
  display: flex;
  gap: 1rem;
}

.social-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: var(--black-tertiary);
  border-radius: 50%;
  color: var(--gray-text);
  transition: all 0.3s;
  border: 1px solid var(--black-border);
}

.social-link:hover {
  background: var(--accent-primary);
  color: white;
  transform: translateY(-2px);
  border-color: var(--accent-primary);
}

.social-icon {
  width: 20px;
  height: 20px;
}

/* Barre inférieure */
.footer-bottom {
  border-top: 1px solid var(--black-border);
  background: var(--black-secondary);
  padding: 2rem;
}

.footer-bottom-content {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1.5rem;
}

.footer-legal {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.copyright {
  color: var(--gray-text);
  font-size: 0.9rem;
  margin: 0;
}

.legal-links {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.legal-link {
  color: var(--gray-text);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  font-size: 0.9rem;
  transition: all 0.3s;
  border-radius: 4px;
}

.legal-link:hover {
  color: var(--white-text);
  background: rgba(255, 255, 255, 0.05);
}

.separator {
  color: var(--black-border);
  font-size: 0.9rem;
}

/* Méthodes de paiement */
.payment-methods {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.payment-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--black-tertiary);
  border-radius: 4px;
  font-size: 0.9rem;
  color: var(--gray-text);
  border: 1px solid var(--black-border);
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-content {
  background: var(--black-secondary);
  border-radius: var(--radius);
  max-width: 800px;
  max-height: 90vh;
  width: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  animation: slideUp 0.4s ease;
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--black-border);
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

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid var(--black-border);
  background: var(--black-tertiary);
  position: sticky;
  top: 0;
  z-index: 10;
}

.modal-title {
  margin: 0;
  color: var(--white-text);
  font-size: 1.5rem;
  font-weight: 600;
}

.modal-close {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--black-border);
  border-radius: 6px;
  padding: 0.5rem;
  cursor: pointer;
  color: var(--gray-text);
  transition: all 0.3s;
}

.modal-close:hover {
  color: var(--white-text);
  background: rgba(255, 255, 255, 0.1);
}

.close-icon {
  width: 24px;
  height: 24px;
}

.modal-body {
  padding: 2rem;
  overflow-y: auto;
  flex: 1;
}

/* Cookies Modal */
.cookie-explainer {
  background: rgba(139, 92, 246, 0.05);
  border: 1px solid rgba(139, 92, 246, 0.1);
  border-radius: var(--radius-sm);
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.cookie-explainer p {
  margin: 0;
  color: var(--gray-text);
  font-size: 0.95rem;
}

.cookie-categories {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

.cookie-category {
  background: var(--black-tertiary);
  border: 1px solid var(--black-border);
  border-radius: var(--radius-sm);
  padding: 1.5rem;
}

.cookie-category.essential {
  border-color: var(--accent-secondary);
  background: rgba(16, 185, 129, 0.05);
}

.cookie-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.cookie-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.cookie-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.essential-badge {
  background: rgba(16, 185, 129, 0.2);
  color: var(--accent-secondary);
}

.analytics-badge {
  background: rgba(59, 130, 246, 0.2);
  color: #3b82f6;
}

.marketing-badge {
  background: rgba(239, 68, 68, 0.2);
  color: var(--accent-danger);
}

.cookie-header h3 {
  margin: 0;
  color: var(--white-text);
  font-size: 1.1rem;
  font-weight: 600;
}

.cookie-toggle {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.toggle-label {
  color: var(--gray-text);
  font-size: 0.9rem;
}

.toggle-switch {
  position: relative;
  display: inline-block;
  width: 52px;
  height: 28px;
}

.toggle-input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--black-border);
  transition: .4s;
  border-radius: 34px;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 20px;
  width: 20px;
  left: 4px;
  bottom: 4px;
  background: var(--white-text);
  transition: .4s;
  border-radius: 50%;
}

.toggle-input:checked + .toggle-slider {
  background: var(--accent-primary);
}

.toggle-input:checked + .toggle-slider:before {
  transform: translateX(24px);
}

.cookie-description {
  color: var(--gray-text);
  margin-bottom: 1rem;
  font-size: 0.95rem;
}

.cookie-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  list-style: none;
  padding: 0;
  margin: 0;
}

.cookie-list li {
  background: var(--black-surface);
  padding: 0.375rem 0.75rem;
  border-radius: 20px;
  font-size: 0.85rem;
  color: var(--gray-text);
  border: 1px solid var(--black-border);
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding-top: 2rem;
  border-top: 1px solid var(--black-border);
}

.btn {
  padding: 0.875rem 1.75rem;
  border-radius: var(--radius-sm);
  font-weight: 500;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s;
  border: none;
  font-family: inherit;
}

.btn-primary {
  background: var(--accent-primary);
  color: white;
}

.btn-primary:hover {
  background: #7c3aed;
}

.btn-secondary {
  background: var(--accent-secondary);
  color: white;
}

.btn-secondary:hover {
  background: #0da271;
}

.btn-outline {
  background: transparent;
  color: var(--gray-text);
  border: 1px solid var(--black-border);
}

.btn-outline:hover {
  background: var(--black-tertiary);
  color: var(--white-text);
}

/* Notifications */
.toast-notification {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  padding: 1rem 1.5rem;
  border-radius: var(--radius-sm);
  color: white;
  font-weight: 500;
  z-index: 1001;
  transform: translateY(100px);
  opacity: 0;
  transition: all 0.3s ease;
  max-width: 350px;
  box-shadow: var(--shadow-lg);
}

.toast-show {
  transform: translateY(0);
  opacity: 1;
}

.toast-success {
  background: var(--accent-secondary);
}

.toast-error {
  background: var(--accent-danger);
}

/* Responsive */
@media (max-width: 1200px) {
  .footer-content {
    grid-template-columns: repeat(2, 1fr);
    gap: 2rem;
  }
  
  .logo-section {
    grid-column: span 2;
  }
}

@media (max-width: 768px) {
  .footer-content {
    grid-template-columns: 1fr;
    padding: 3rem 1.5rem;
  }
  
  .logo-section {
    grid-column: span 1;
  }
  
  .rgpd-floating-btn {
    bottom: 1rem;
    right: 1rem;
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
  }
  
  .rgpd-label {
    display: none;
  }
  
  .footer-bottom-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 1.5rem;
  }
  
  .modal-content {
    margin: 0.5rem;
    max-height: calc(100vh - 1rem);
  }
  
  .modal-actions {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .footer-content {
    padding: 2rem 1rem;
  }
  
  .footer-bottom {
    padding: 1.5rem;
  }
  
  .legal-links {
    justify-content: center;
  }
  
  .payment-methods {
    justify-content: center;
    width: 100%;
  }
  
  .rgpd-floating-btn {
    bottom: 1rem;
    right: 1rem;
    padding: 0.5rem;
  }
  
  .modal-overlay {
    padding: 0.5rem;
  }
}
</style>
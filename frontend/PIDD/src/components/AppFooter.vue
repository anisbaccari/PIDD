<template>
  <footer class="footer">
    <div class="footer-content">
      <!-- Section Liens Rapides -->
      <div class="footer-section">
        <h3>Boutique</h3>
        <ul>
          <li><router-link to="/">Accueil</router-link></li>
          <li><router-link to="/category/1">T-shirts Homme</router-link></li>
          <li><router-link to="/category/2">T-shirts Femme</router-link></li>
          <li><router-link to="/category/3">T-shirts Enfants</router-link></li>
        </ul>
      </div>

      <!-- Section Informations Légales -->
      <div class="footer-section">
        <h3>Informations Légales</h3>
        <ul>
          <li><a href="#" @click.prevent="openModal('mentions')">Mentions légales</a></li>
          <li><a href="#" @click.prevent="openModal('confidentialite')">Politique de confidentialité</a></li>
          <li><a href="#" @click.prevent="openModal('cookies')">Gestion des cookies</a></li>
          <li><a href="#" @click.prevent="openModal('cgv')">CGV</a></li>
          <li><a href="#" @click.prevent="openModal('cgu')">CGU</a></li>
        </ul>
      </div>

      <!-- Section Contact -->
      <div class="footer-section">
        <h3>Contact</h3>
        <ul>
          <li>📧 contact@monshop.com</li>
          <li>📞 01 23 45 67 89</li>
          <li>🕒 Lun-Ven: 9h-18h</li>
          <li><a href="#" @click.prevent="openModal('contact')">Formulaire de contact</a></li>
        </ul>
      </div>

      <!-- Section Réseaux Sociaux -->
      <div class="footer-section">
        <h3>Suivez-nous</h3>
        <div class="social-links">
          <a href="#" aria-label="Facebook">📘</a>
          <a href="#" aria-label="Instagram">📷</a>
          <a href="#" aria-label="Twitter">🐦</a>
        </div>
        
        <!-- Bouton Préférences RGPD -->
        <button class="rgpd-btn" @click="openModal('cookies')">
          ⚙️ Préférences de confidentialité
        </button>
      </div>
    </div>

    <!-- Barre Inférieure -->
    <div class="footer-bottom">
      <div class="footer-bottom-content">
        <p>&copy; 2024 MonShop. Tous droits réservés.</p>
        <div class="legal-links">
          <a href="#" @click.prevent="openModal('mentions')">Mentions légales</a>
          <span>|</span>
          <a href="#" @click.prevent="openModal('confidentialite')">Vie privée</a>
          <span>|</span>
          <a href="#" @click.prevent="openModal('cookies')">Cookies</a>
        </div>
      </div>
    </div>

    <!-- Modals RGPD -->
    <div v-if="activeModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <button class="modal-close" @click="closeModal">×</button>
        
        <!-- Modal Mentions Légales -->
        <div v-if="activeModal === 'mentions'" class="modal-section">
          <h2>Mentions Légales</h2>
          <div class="legal-text">
            <h3>Éditeur du site</h3>
            <p><strong>MonShop SAS</strong><br>
            Capital social : 50 000 €<br>
            RCS Paris 123 456 789<br>
            Siège social : 123 Avenue de la Mode, 75001 Paris<br>
            N° TVA : FR 12 345 678 90</p>

            <h3>Directeur de la publication</h3>
            <p>Hermann - Responsable de la communication</p>

            <h3>Hébergeur</h3>
            <p>Netlify Inc.<br>
            2325 3rd Street, Suite 215<br>
            San Francisco, California 94107<br>
            United States</p>
          </div>
        </div>

        <!-- Modal Politique de Confidentialité -->
        <div v-if="activeModal === 'confidentialite'" class="modal-section">
          <h2>Politique de Confidentialité</h2>
          <div class="legal-text">
            <h3>Responsable du traitement</h3>
            <p>MonShop est responsable du traitement de vos données personnelles.</p>

            <h3>Données collectées</h3>
            <ul>
              <li>Données de identification (nom, email)</li>
              <li>Données de transaction (commandes, paiements)</li>
              <li>Données de navigation (cookies, adresse IP)</li>
              <li>Données de profil (préférences, historique d'achat)</li>
            </ul>

            <h3>Finalités du traitement</h3>
            <ul>
              <li>Exécution des commandes</li>
              <li>Service client</li>
              <li>Marketing (avec consentement)</li>
              <li>Amélioration du service</li>
            </ul>

            <h3>Vos droits RGPD</h3>
            <p>Conformément au RGPD, vous disposez des droits suivants :</p>
            <ul>
              <li>Droit d'accès à vos données</li>
              <li>Droit de rectification</li>
              <li>Droit à l'effacement ("droit à l'oubli")</li>
              <li>Droit à la limitation du traitement</li>
              <li>Droit à la portabilité des données</li>
              <li>Droit d'opposition</li>
            </ul>

            <h3>Exercer vos droits</h3>
            <p>Contactez notre DPO :<br>
            📧 dpo@monshop.com<br>
            📞 01 23 45 67 89</p>

            <p>Délai de réponse : 1 mois maximum</p>
          </div>
        </div>

        <!-- Modal Gestion des Cookies -->
        <div v-if="activeModal === 'cookies'" class="modal-section">
          <h2>Gestion des Cookies</h2>
          <div class="legal-text">
            <p>Nous utilisons différents types de cookies :</p>

            <div class="cookie-category">
              <h3>Cookies Essentiels ✅ <small>(Toujours actifs)</small></h3>
              <p>Nécessaires au fonctionnement du site</p>
              <ul>
                <li>Session utilisateur</li>
                <li>Panier d'achat</li>
                <li>Préférences de langue</li>
              </ul>
            </div>

            <div class="cookie-category">
              <h3>
                <label>
                  <input type="checkbox" v-model="cookies.analytics" :disabled="cookies.essential">
                  Cookies Analytics 📊
                </label>
              </h3>
              <p>Nous aident à comprendre l'usage du site</p>
              <ul>
                <li>Google Analytics</li>
                <li>Statistiques de visite</li>
              </ul>
            </div>

            <div class="cookie-category">
              <h3>
                <label>
                  <input type="checkbox" v-model="cookies.marketing" :disabled="cookies.essential">
                  Cookies Marketing 🎯
                </label>
              </h3>
              <p>Personnalisation de la publicité</p>
              <ul>
                <li>Réseaux sociaux</li>
                <li>Publicité ciblée</li>
              </ul>
            </div>

            <div class="cookie-actions">
              <button @click="acceptAllCookies" class="btn-primary">
                Tout accepter
              </button>
              <button @click="saveCookiePreferences" class="btn-secondary">
                Enregistrer mes préférences
              </button>
              <button @click="refuseAllCookies" class="btn-outline">
                Tout refuser
              </button>
            </div>
          </div>
        </div>

        <!-- Modal CGV -->
        <div v-if="activeModal === 'cgv'" class="modal-section">
          <h2>Conditions Générales de Vente</h2>
          <div class="legal-text">
            <h3>Article 1 - Objet</h3>
            <p>Les présentes conditions régissent les ventes par MonShop.</p>

            <h3>Article 2 - Prix</h3>
            <p>Les prix sont en euros TTC. Frais de port : 4,90 €.</p>

            <h3>Article 3 - Délais de livraison</h3>
            <p>Délai moyen : 3-5 jours ouvrés.</p>

            <h3>Article 4 - Droit de rétractation</h3>
            <p>14 jours pour exercer votre droit de rétractation.</p>
          </div>
        </div>

        <!-- Modal Contact -->
        <div v-if="activeModal === 'contact'" class="modal-section">
          <h2>Contactez-nous</h2>
          <form @submit.prevent="submitContact" class="contact-form">
            <div class="form-group">
              <label>Nom *</label>
              <input type="text" v-model="contactForm.name" required>
            </div>
            <div class="form-group">
              <label>Email *</label>
              <input type="email" v-model="contactForm.email" required>
            </div>
            <div class="form-group">
              <label>Sujet *</label>
              <select v-model="contactForm.subject" required>
                <option value="">Choisir un sujet</option>
                <option value="commande">Commande</option>
                <option value="livraison">Livraison</option>
                <option value="donnees">Données personnelles</option>
                <option value="autre">Autre</option>
              </select>
            </div>
            <div class="form-group">
              <label>Message *</label>
              <textarea v-model="contactForm.message" rows="5" required></textarea>
            </div>
            <button type="submit" class="btn-primary">Envoyer</button>
          </form>
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
      cookies: {
        essential: true,
        analytics: false,
        marketing: false
      },
      contactForm: {
        name: '',
        email: '',
        subject: '',
        message: ''
      }
    }
  },
  mounted() {
    this.loadCookiePreferences();
  },
  methods: {
    openModal(modalType) {
      this.activeModal = modalType;
      document.body.style.overflow = 'hidden';
    },
    closeModal() {
      this.activeModal = null;
      document.body.style.overflow = 'auto';
    },
    loadCookiePreferences() {
      const preferences = localStorage.getItem('cookiePreferences');
      if (preferences) {
        this.cookies = { ...this.cookies, ...JSON.parse(preferences) };
      }
    },
    saveCookiePreferences() {
      localStorage.setItem('cookiePreferences', JSON.stringify(this.cookies));
      this.closeModal();
      alert('Préférences enregistrées !');
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
    submitContact() {
      // Ici, intégrer l'envoi vers votre backend
      console.log('Formulaire contact:', this.contactForm);
      alert('Message envoyé ! Nous vous répondrons sous 48h.');
      this.contactForm = { name: '', email: '', subject: '', message: '' };
      this.closeModal();
    }
  }
}
</script>

<style scoped>
.footer {
  background: #1f2937;
  color: white;
  margin-top: auto;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 3rem 2rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}

.footer-section h3 {
  color: #3b82f6;
  margin-bottom: 1rem;
  font-size: 1.1rem;
}

.footer-section ul {
  list-style: none;
  padding: 0;
}

.footer-section li {
  margin-bottom: 0.5rem;
}

.footer-section a {
  color: #d1d5db;
  text-decoration: none;
  transition: color 0.3s;
}

.footer-section a:hover {
  color: #3b82f6;
}

.social-links {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.social-links a {
  font-size: 1.5rem;
}

.rgpd-btn {
  background: #374151;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background 0.3s;
}

.rgpd-btn:hover {
  background: #4b5563;
}

.footer-bottom {
  border-top: 1px solid #374151;
  padding: 1.5rem 2rem;
}

.footer-bottom-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.legal-links {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.legal-links a {
  color: #9ca3af;
  text-decoration: none;
  font-size: 0.9rem;
}

.legal-links a:hover {
  color: #3b82f6;
}

/* Modals */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: 12px;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
  position: relative;
  color: #1f2937;
}

.modal-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  color: #6b7280;
}

.modal-section {
  padding: 2rem;
}

.legal-text {
  line-height: 1.6;
}

.legal-text h3 {
  color: #3b82f6;
  margin: 1.5rem 0 0.5rem 0;
}

.legal-text ul {
  padding-left: 1.5rem;
}

.cookie-category {
  background: #f8fafc;
  padding: 1rem;
  border-radius: 8px;
  margin: 1rem 0;
}

.cookie-category h3 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0 0 0.5rem 0 !important;
}

.cookie-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  flex-wrap: wrap;
}

.btn-primary, .btn-secondary, .btn-outline {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-secondary {
  background: #10b981;
  color: white;
}

.btn-outline {
  background: white;
  color: #374151;
  border: 1px solid #d1d5db;
}

.contact-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.form-group input,
.form-group select,
.form-group textarea {
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-family: inherit;
}

/* Responsive */
@media (max-width: 768px) {
  .footer-content {
    grid-template-columns: 1fr;
    text-align: center;
  }
  
  .footer-bottom-content {
    flex-direction: column;
    text-align: center;
  }
  
  .cookie-actions {
    flex-direction: column;
  }
  
  .modal-content {
    margin: 1rem;
    max-height: 90vh;
  }
}
</style>
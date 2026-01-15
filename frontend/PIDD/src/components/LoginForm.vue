<template>
  <div class="login-container">
    <!-- État connecté (actuellement masqué mais gardé pour évolutivité) -->
    <div v-if="user && user.username" class="logged-state">
      <p>Bienvenue, <strong>{{ user.username }}</strong> 👋</p>
      <button class="logout-btn" @click="logout">Se déconnecter</button>
    </div>

    <!-- État non connecté -->
    <div v-else class="login-card">
      <header class="login-header">
        <h2>Connexion</h2>
        <p class="login-subtitle">Accédez à votre compte</p>
      </header>

      <form @submit.prevent="handleLogin" class="login-form" novalidate>
        <div class="form-group">
          <label for="username" class="form-label">
            email
            <span class="required-asterisk">*</span>
          </label>
          <input
            id="username"
            v-model="loginForm.email"
            type="text"
            placeholder="Entrez votre nom d'utilisateur"
            required
            :class="{ 'input-error': formErrors.email }"
            @input="clearError('username')"
          />
          <span v-if="formErrors.username" class="error-text">{{ formErrors.username }}</span>
        </div>

        <div class="form-group">
          <label for="password" class="form-label">
            Mot de passe
            <span class="required-asterisk">*</span>
          </label>
          <input
            id="password"
            v-model="loginForm.password"
            type="password"
            placeholder="Entrez votre mot de passe"
            required
            :class="{ 'input-error': formErrors.password }"
            @input="clearError('password')"
          />
          <span v-if="formErrors.password" class="error-text">{{ formErrors.password }}</span>
        </div>

        <button 
          type="submit" 
          class="login-btn"
          :disabled="isLoading"
          :class="{ 'loading': isLoading }"
        >
          <span v-if="!isLoading">Se connecter</span>
          <span v-else class="loading-text">Connexion...</span>
        </button>
      </form>

      <div class="login-footer">
        <p class="register-text">
          Pas encore de compte ?
          <router-link to="/register" class="register-link">
            Créer un compte
          </router-link>
        </p>
      </div>

      <!-- Message d'erreur général -->
      <div v-if="errorMessage" class="error-message" role="alert">
        <span class="error-icon">⚠️</span>
        {{ errorMessage }}
      </div>
    </div>

    <!-- Modal de choix pour les administrateurs -->
    <div v-if="showAdminChoice" class="admin-choice-modal">
      <div class="modal-overlay">
        <div class="modal-content">
          <div class="modal-header">
            <h3>🛡️ Accès Administrateur</h3>
            <p>Bienvenue <strong>{{ user.username }}</strong> !</p>
          </div>
          
          <div class="modal-body">
            <p>Vous êtes connecté en tant qu'administrateur. Où souhaitez-vous vous rendre ?</p>
            
            <div class="choice-buttons">
              <button 
                class="choice-btn admin-btn"
                @click="goToAdminPanel"
              >
                <span class="btn-icon">⚙️</span>
                <span class="btn-text">
                  <strong>Espace Administration</strong>
                  <small>Gérer les produits et paramètres</small>
                </span>
              </button>
              
              <button 
                class="choice-btn home-btn"
                @click="goToHomepage"
              >
                <span class="btn-icon">🏠</span>
                <span class="btn-text">
                  <strong>Page d'Accueil</strong>
                  <small>Naviguer sur le site public</small>
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from '../api';

export default {
  name: 'LoginForm',  // ✅ CORRIGÉ : Nom du composant
  props: {
    user: {
      type: Object,
      default: null  // ✅ CORRIGÉ : null au lieu de () => ({})
    },
    setUser: {
      type: Function,
      required: true
    }
  },
  data() {
    return {
      loginForm: {
        username: '',
        password: ''
      },
      formErrors: {
        username: '',
        password: ''
      },
      errorMessage: '',
      isLoading: false,
      showAdminChoice: false,
      // ✅ AJOUTÉ : Pour stocker temporairement l'utilisateur admin
      tempUser: null
    };
  },
  mounted() {
    console.log('🔑 LoginForm monté, user:', this.user);
    
    // ✅ CORRIGÉ : Utiliser le prop directement
    if (this.user && this.user.username) {
      this.loginForm.username = this.user.username;
      this.loginForm.email = this.user.email;
    }
    
    // ✅ AJOUTÉ : Vérifier si on vient d'une redirection checkout
    const redirect = this.$route.query.redirect;
    if (redirect && redirect === '/checkout') {
      console.log('🛒 Redirection depuis checkout détectée');
    }
  },
  methods: {
    validateForm() {
      this.formErrors = {};
      let isValid = true;

      if (!this.loginForm.email) {
        this.formErrors.username = 'Le nom d\'utilisateur est requis';
        isValid = false;
      }

      if (!this.loginForm.password) {
        this.formErrors.password = 'Le mot de passe est requis';
        isValid = false;
      } else if (this.loginForm.password.length < 6) {
        this.formErrors.password = 'Le mot de passe doit contenir au moins 6 caractères';
        isValid = false;
      }

      return isValid;
    },

    clearError(field) {
      if (this.formErrors[field]) {
        this.formErrors[field] = '';
      }
      if (this.errorMessage) {
        this.errorMessage = '';
      }
    },

    // ✅ CORRIGÉ : Méthode simplifiée pour vérifier les admins
    isUserAdmin(username) {
      const adminUsernames = ['Anis', 'Hermann', 'Franklin', 'admin', 'administrateur'];
      return adminUsernames.includes(username);
    },

    goToAdminPanel() {
      this.showAdminChoice = false;
      this.$router.push('/admin');
    },

    goToHomepage() {
      this.showAdminChoice = false;
      this.handleRedirect();
    },

    // ✅ AJOUTÉ : Gestion de la redirection après login
    handleRedirect() {
      const redirect = this.$route.query.redirect;
      
      if (redirect) {
        console.log('🔀 Redirection vers:', redirect);
        this.$router.push(redirect);
      } else {
        this.$router.push('/');
      }
    },

    async handleLogin() {
      // Validation côté client
      if (!this.validateForm()) {
        return;
      }

      this.isLoading = true;
      this.errorMessage = '';

      try {
        const response = await api.post('/auth/login', {
          email: this.loginForm.email,
          password: this.loginForm.password
        });

        console.log('✅ Réponse login:', response.data);

        if (response.data.token && response.data.user) {
          // Sauvegarder le token
          localStorage.setItem('token', response.data.token);
          
          // ✅ CORRIGÉ : Utiliser la fonction setUser du parent
          this.setUser(response.data.user);
          this.errorMessage = '';

          // Vérifier si l'utilisateur est un administrateur
          const isAdmin = this.isUserAdmin(response.data.user.username);
          
          if (isAdmin) {
            // Stocker temporairement l'utilisateur pour le modal
            this.tempUser = response.data.user;
            this.showAdminChoice = true;
          } else {
            // Redirection normale pour les utilisateurs standard
            this.handleRedirect();
          }
        } else {
          throw new Error('Réponse de connexion invalide');
        }

      } catch (error) {
        console.error('❌ Erreur de connexion:', error);
        
        // Gestion des erreurs spécifiques
        if (error.response?.status === 401) {
          this.errorMessage = 'Nom d\'utilisateur ou mot de passe incorrect';
        } else if (error.response?.status === 404) {
          this.errorMessage = 'Service d\'authentification indisponible';
        } else if (error.response?.data?.error) {
          this.errorMessage = error.response.data.error;
        } else if (error.request) {
          this.errorMessage = 'Erreur de réseau - Impossible de contacter le serveur';
        } else {
          this.errorMessage = 'Une erreur inattendue est survenue';
        }
      } finally {
        this.isLoading = false;
      }
    },

    logout() {
      localStorage.removeItem('token');
      this.setUser(null);
      this.loginForm = { username: '', password: '' };
      this.showAdminChoice = false;
      this.tempUser = null;
      this.$router.push('/login');
    }
  }
};
</script>

<style scoped>
/* Gardez tous les styles CSS existants, ils sont corrects */

.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 90vh;
  background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
  padding: 1rem;
}

.login-card {
  background: white;
  padding: 3rem 2.5rem;
  border-radius: 20px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 440px;
  text-align: center;
}

.login-header {
  margin-bottom: 2rem;
}

h2 {
  margin-bottom: 0.5rem;
  color: #1f2937;
  font-size: 1.8rem;
  font-weight: 700;
}

.login-subtitle {
  color: #6b7280;
  font-size: 0.95rem;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  text-align: left;
}

.form-label {
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #374151;
  font-size: 0.95rem;
}

.required-asterisk {
  color: #ef4444;
}

input {
  padding: 0.9rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background-color: #f9fafb;
}

input:focus {
  border-color: #007bff;
  background-color: white;
  outline: none;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

.input-error {
  border-color: #ef4444 !important;
  background-color: #fef2f2;
}

.error-text {
  color: #ef4444;
  font-size: 0.85rem;
  margin-top: 0.3rem;
  display: block;
}

.login-btn {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 1rem;
  border-radius: 10px;
  font-weight: 600;
  font-size: 1.05rem;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 0.5rem;
}

.login-btn:hover:not(:disabled) {
  background-color: #0056b3;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
}

.login-btn:disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
  transform: none;
}

.loading {
  position: relative;
}

.loading-text {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.login-footer {
  border-top: 1px solid #e5e7eb;
  padding-top: 1.5rem;
}

.register-text {
  color: #6b7280;
  font-size: 0.95rem;
  margin: 0;
}

.register-link {
  color: #007bff;
  font-weight: 600;
  text-decoration: none;
  transition: color 0.3s ease;
}

.register-link:hover {
  color: #0056b3;
  text-decoration: underline;
}

.error-message {
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  margin-top: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
}

.error-icon {
  font-size: 1rem;
}

.logged-state {
  text-align: center;
  background: white;
  padding: 2rem;
  border-radius: 15px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.1);
}

.logout-btn {
  background-color: #ef4444;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  margin-top: 1rem;
}

.logout-btn:hover {
  background-color: #dc2626;
  transform: translateY(-1px);
}

/* Modal de choix administrateur */
.admin-choice-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: 20px;
  padding: 2.5rem;
  max-width: 500px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: modalAppear 0.3s ease-out;
}

@keyframes modalAppear {
  from {
    opacity: 0;
    transform: scale(0.8) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.modal-header {
  text-align: center;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 2px solid #f3f4f6;
}

.modal-header h3 {
  color: #1f2937;
  margin-bottom: 0.5rem;
  font-size: 1.8rem;
  font-weight: 700;
}

.modal-header p {
  color: #6b7280;
  font-size: 1.1rem;
  margin: 0;
}

.modal-body {
  text-align: center;
}

.modal-body p {
  color: #6b7280;
  margin-bottom: 2rem;
  font-size: 1.1rem;
  line-height: 1.5;
}

.choice-buttons {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.choice-btn {
  display: flex;
  align-items: center;
  gap: 1.2rem;
  padding: 1.5rem;
  border: 2px solid #e5e7eb;
  border-radius: 15px;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;
  width: 100%;
}

.choice-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
}

.admin-btn {
  border-color: #3b82f6;
  background: linear-gradient(135deg, #f0f7ff 0%, #e6f2ff 100%);
}

.admin-btn:hover {
  border-color: #2563eb;
  background: linear-gradient(135deg, #e6f2ff 0%, #dbeafe 100%);
}

.home-btn {
  border-color: #10b981;
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
}

.home-btn:hover {
  border-color: #059669;
  background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
}

.btn-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.btn-text {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.btn-text strong {
  color: #1f2937;
  font-size: 1.2rem;
  margin-bottom: 0.3rem;
}

.btn-text small {
  color: #6b7280;
  font-size: 0.9rem;
  text-align: left;
}

/* Responsive */
@media (max-width: 480px) {
  .login-card {
    padding: 2rem 1.5rem;
    margin: 1rem;
  }
  
  h2 {
    font-size: 1.6rem;
  }
  
  .modal-content {
    padding: 2rem 1.5rem;
    margin: 1rem;
  }
  
  .modal-header h3 {
    font-size: 1.5rem;
  }
  
  .choice-btn {
    padding: 1.25rem;
    gap: 1rem;
  }
  
  .btn-icon {
    font-size: 1.5rem;
  }
  
  .btn-text strong {
    font-size: 1.1rem;
  }
}
</style>
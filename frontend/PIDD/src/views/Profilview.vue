<template>
  <div class="profile-container">
    <div class="ProfilBox">
      <h2><span class="profile-icon">👤</span> Mon profil</h2>

      <div v-if="!loaded" class="loading">
        <div class="spinner"></div>
        <p>Chargement de votre profil...</p>
      </div>

      <div v-else class="profile-content">
        <!-- Informations courantes -->
        <div class="current-info">
          <div class="info-card">
            <h3><span class="icon">ℹ️</span> Vos informations actuelles</h3>
            <div class="info-grid">
              <div class="info-item">
                <span class="label">Nom :</span>
                <span class="value">{{ dataUser.lastName || 'Non défini' }}</span>
              </div>
              <div class="info-item">
                <span class="label">Prénom :</span>
                <span class="value">{{ dataUser.name || 'Non défini' }}</span>
              </div>
              
              <div class="info-item">
                <span class="label">Rôle :</span>
                <span class="value role-badge" :class="{ admin: dataUser.is_admin }">
                  {{ dataUser.is_admin ? 'Administrateur' : 'Utilisateur' }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Formulaire de modification -->
        <form @submit.prevent="saveChanges" class="profile-form">
          <div class="form-section">
            <h3><span class="icon">✏️</span> Modifier mes informations</h3>
            
            <div class="form-row">
              <div class="form-group">
                <label for="lastName">Nom</label>
                <input 
                  id="lastName" 
                  v-model="form.lastName" 
                  type="text" 
                  placeholder="Votre nom" 
                  :disabled="saving"
                />
              </div>

              <div class="form-group">
                <label for="name">Prénom</label>
                <input 
                  id="name" 
                  v-model="form.name" 
                  type="text" 
                  placeholder="Votre prénom" 
                  :disabled="saving"
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="username">Nom d'utilisateur</label>
                <input 
                  id="username" 
                  v-model="form.username" 
                  type="text" 
                  placeholder="Votre nom d'utilisateur" 
                  :disabled="saving"
                />
              </div>

              <div class="form-group">
                <label for="email">Email</label>
                <input 
                  id="email" 
                  v-model="form.email" 
                  type="email" 
                  placeholder="Votre email" 
                  :disabled="saving"
                  readonly
                  class="readonly-field"
                />
                <small class="field-note">L'email ne peut pas être modifié</small>
              </div>
            </div>
          </div>

          <div class="form-section">
            <h3><span class="icon">🔒</span> Sécurité</h3>
            
            <div class="form-row">
              <div class="form-group">
                <label for="password">Nouveau mot de passe</label>
                <input 
                  id="password" 
                  v-model="form.password" 
                  type="password" 
                  placeholder="Laisser vide pour ne pas changer" 
                  :disabled="saving"
                />
                <small class="field-note">Minimum 6 caractères</small>
              </div>

              <div class="form-group">
                <label for="passwordConfirm">Confirmer le mot de passe</label>
                <input 
                  id="passwordConfirm" 
                  v-model="form.passwordConfirm" 
                  type="password" 
                  placeholder="Confirmez le nouveau mot de passe" 
                  :disabled="saving"
                />
              </div>
            </div>
          </div>

          <div class="form-actions">
            <button 
              type="submit" 
              class="submit-btn" 
              :disabled="saving || !hasChanges"
            >
              <span v-if="saving" class="btn-content">
                <span class="spinner-btn"></span>
                Enregistrement...
              </span>
              <span v-else class="btn-content">
                <span class="btn-icon">💾</span>
                Enregistrer les modifications
              </span>
            </button>
            
            <button 
              type="button" 
              class="cancel-btn" 
              @click="resetForm"
              :disabled="saving"
            >
              Annuler
            </button>
          </div>

          <!-- Messages -->
          <div v-if="message" :class="['message', messageType]">
            <span class="message-icon">
              {{ messageType === 'success' ? '✅' : '❌' }}
            </span>
            <span>{{ message }}</span>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import api from "../api";

export default {
  name: "Profilview",
  
  props: {
    user: Object,
    getUser: Function,
    setUser: Function,
    cartItems: {
      type: Array,
      default: () => []
    },
    addToCartGlobal: Function,
    updateCartQuantity: Function,
    removeFromCart: Function,
    clearCart: Function,
    getCartTotal: Function,
    getTotalItems: Function,
    refreshUser: Function
  },
  
  data() {
    return {
      loaded: false,
      saving: false,
      message: "",
      messageType: "",
      form: {
        lastName: "",
        name: "",
        username: "",
        address: "",
        email: "",
        password: "",
        passwordConfirm: ""
      },
      dataUser: {}
    };
  },

  computed: {
    hasChanges() {
      const original = this.dataUser;
      const form = this.form;
      
      return (
        form.lastName !== original.lastName ||
        form.name !== original.name ||
        form.username !== original.username ||
        form.address !== original.address ||
        form.password !== ""
      );
    }
  },

  methods: {
    async loadProfile() {
      try {
        this.loaded = false;
        console.log("[Profilview] Chargement du profil...");
        
        const res = await api.get("/profil");
        console.log("[Profilview] Réponse API:", res.data);
        
        const userData = res.data.user || res.data;
        
        if (userData) {
          this.dataUser = userData;
          this.populateForm(userData);
          
          if (this.setUser && typeof this.setUser === 'function') {
            this.setUser(userData);
          }
          
          console.log("[Profilview] Profil chargé:", userData);
        } else {
          throw new Error("Données utilisateur invalides");
        }
        
      } catch (error) {
        console.error("[Profilview] Erreur chargement profil:", error);
        
        if (this.getUser && typeof this.getUser === 'function') {
          const globalUser = this.getUser();
          if (globalUser) {
            this.dataUser = globalUser;
            this.populateForm(globalUser);
            console.log("[Profilview] Utilisation du fallback:", globalUser);
          }
        }
        
        this.showMessage("Impossible de charger votre profil. Veuillez rafraîchir la page.", "error");
        
      } finally {
        this.loaded = true;
      }
    },

    async saveChanges() {
      // Validation
      if (this.form.password && this.form.password !== this.form.passwordConfirm) {
        this.showMessage("Les mots de passe ne correspondent pas.", "error");
        return;
      }

      if (this.form.password && this.form.password.length < 6) {
        this.showMessage("Le mot de passe doit contenir au moins 6 caractères.", "error");
        return;
      }

      this.saving = true;
      this.message = "";
      
      try {
        // Construction du payload - UNIQUEMENT les champs modifiés
        const payload = {};
        
        // Comparer et ajouter uniquement les champs qui ont changé
        if (this.form.lastName && this.form.lastName !== this.dataUser.lastName) {
          payload.lastName = this.form.lastName.trim();
        }
        
        if (this.form.name && this.form.name !== this.dataUser.name) {
          payload.name = this.form.name.trim();
        }
        
        if (this.form.username && this.form.username !== this.dataUser.username) {
          payload.username = this.form.username.trim();
        }
        
    
        
        // Mot de passe uniquement s'il est renseigné
        if (this.form.password && this.form.password.trim() !== "") {
          payload.password = this.form.password;
        }
        console.log("TOKEN =", localStorage.getItem("token"));

        console.log("[Profilview] 📦 Payload envoyé:", payload);
        console.log("[Profilview] 📊 Nombre de champs:", Object.keys(payload).length);

        // Vérifier qu'il y a au moins un champ à mettre à jour
        if (Object.keys(payload).length === 0) {
          this.showMessage("⚠️ Aucune modification à enregistrer.", "error");
          this.saving = false;
          return;
        }
       const test = await api.get("/profil");
console.log("TEST AUTH OK =", test.data);

        const res = await api.put("/profil", payload);
        console.log("[Profilview] ✅ Réponse serveur:", res.data);

        if (res.data.success || res.data.user) {
          const updatedUser = res.data.user || res.data;
          
          // Mettre à jour les données locales
          this.dataUser = { ...this.dataUser, ...updatedUser };
          
          // Mettre à jour l'utilisateur global
          if (this.setUser && typeof this.setUser === 'function') {
            this.setUser(this.dataUser);
          }

          // Réinitialiser le formulaire avec les nouvelles données
          this.populateForm(this.dataUser);
          
          this.showMessage("✅ Votre profil a été mis à jour avec succès !", "success");
          
          // Rafraîchir l'utilisateur global si la fonction existe
          if (this.refreshUser && typeof this.refreshUser === 'function') {
            this.refreshUser();
          }
          
        } else {
          throw new Error(res.data.error || res.data.message || "Erreur lors de la mise à jour");
        }

      } catch (error) {
        console.error("[Profilview] ❌ Erreur complète:", error);
        console.error("[Profilview] 📄 Réponse serveur:", error.response?.data);
        
        let errorMessage = "❌ Erreur lors de la mise à jour du profil.";
        
        if (error.response?.data?.error) {
          errorMessage = `❌ ${error.response.data.error}`;
        } else if (error.response?.data?.message) {
          errorMessage = `❌ ${error.response.data.message}`;
        } else if (error.message) {
          errorMessage = `❌ ${error.message}`;
        }
        
        this.showMessage(errorMessage, "error");
        
      } finally {
        this.saving = false;
      }
    },

    populateForm(userData) {
      this.form = {
        lastName: userData.lastName || "",
        name: userData.name || "",
        username: userData.username || "",
        email: userData.email || "",
        address: userData.address || "",
        password: "",
        passwordConfirm: ""
      };
    },

    resetForm() {
      this.populateForm(this.dataUser);
      this.message = "";
    },

    showMessage(text, type) {
      this.message = text;
      this.messageType = type;
      
      if (type === "success") {
        setTimeout(() => {
          this.message = "";
        }, 5000);
      }
    }
  },

  mounted() {
    this.loadProfile();
  },

  watch: {
    user: {
      handler(newUser) {
        if (newUser && newUser.id) {
          this.dataUser = newUser;
          this.populateForm(newUser);
        }
      },
      immediate: true
    }
  }
};
</script>

<style scoped>
/* Tous les styles restent identiques */
.profile-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 30px 20px;
  min-height: 80vh;
}

.ProfilBox {
  background: white;
  border-radius: 15px;
  padding: 30px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
}

h2 {
  color: #2c3e50;
  margin-bottom: 30px;
  font-size: 2em;
  display: flex;
  align-items: center;
  gap: 10px;
}

.profile-icon {
  font-size: 1.3em;
}

.current-info {
  margin-bottom: 30px;
}

.info-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 25px;
  color: white;
}

.info-card h3 {
  color: white;
  margin-bottom: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.3);
  padding-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px dashed rgba(255, 255, 255, 0.2);
}

.info-item:last-child {
  border-bottom: none;
}

.label {
  font-weight: 500;
}

.value {
  font-weight: bold;
}

.role-badge {
  background: rgba(255, 255, 255, 0.2);
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 0.9em;
}

.role-badge.admin {
  background: #f39c12;
}

.profile-content {
  margin-top: 20px;
}

.form-section {
  margin-bottom: 35px;
  padding-bottom: 25px;
  border-bottom: 2px solid #f0f2f5;
}

.form-section:last-child {
  border-bottom: none;
}

.form-section h3 {
  color: #34495e;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.icon {
  font-size: 1.2em;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #2c3e50;
  font-weight: 500;
  font-size: 0.95em;
}

.form-group input {
  width: 100%;
  padding: 14px 16px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 1em;
  transition: all 0.3s;
  background: #f8fafc;
}

.form-group input:focus {
  outline: none;
  border-color: #3498db;
  background: white;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
}

.form-group input:disabled {
  background: #f5f5f5;
  cursor: not-allowed;
  opacity: 0.7;
}

.readonly-field {
  background: #f0f2f5 !important;
  color: #7f8c8d;
  cursor: not-allowed;
}

.field-note {
  display: block;
  margin-top: 5px;
  color: #7f8c8d;
  font-size: 0.85em;
}

.form-actions {
  display: flex;
  gap: 15px;
  margin-top: 40px;
  padding-top: 20px;
  border-top: 2px solid #f0f2f5;
}

.submit-btn {
  flex: 2;
  padding: 16px 30px;
  background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 1em;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 54px;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(39, 174, 96, 0.3);
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
}

.btn-content {
  display: flex;
  align-items: center;
  gap: 10px;
}

.btn-icon {
  font-size: 1.2em;
}

.spinner-btn {
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top: 3px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.cancel-btn {
  flex: 1;
  padding: 16px 20px;
  background: #e0e0e0;
  color: #333;
  border: none;
  border-radius: 10px;
  font-size: 1em;
  cursor: pointer;
  transition: all 0.3s;
}

.cancel-btn:hover:not(:disabled) {
  background: #d0d0d0;
  transform: translateY(-2px);
}

.cancel-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.message {
  margin-top: 25px;
  padding: 18px 25px;
  border-radius: 10px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 15px;
  animation: slideIn 0.3s ease-out;
}

.message.success {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.message.error {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.message-icon {
  font-size: 1.3em;
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

.loading {
  text-align: center;
  padding: 60px 20px;
}

.spinner {
  width: 60px;
  height: 60px;
  border: 5px solid #f3f3f3;
  border-top: 5px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading p {
  color: #7f8c8d;
  font-size: 1.1em;
}

@media (max-width: 768px) {
  .profile-container {
    padding: 15px;
  }
  
  .ProfilBox {
    padding: 20px;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  h2 {
    font-size: 1.6em;
  }
}
</style>
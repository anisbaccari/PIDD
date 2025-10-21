<template>
  <div class="register-container">
    <!-- Si l'utilisateur est déjà connecté -->
    <div v-if="user && user.username" class="registered">
      <p>Bienvenue, <strong>{{ user.username }}</strong> 🎉</p>
      <p>Votre compte est déjà créé.</p>
    </div>

    <!-- Si l'utilisateur n'est pas encore inscrit -->
    <div v-else class="register-card">
      <h2>Créer un compte</h2>
      <form @submit.prevent="register" class="register-form">
        <div class="form-group">
          <label for="nom">Nom</label>
          <input id="nom" v-model="DataUser.nom" placeholder="Entrez votre nom" required />
        </div>

        <div class="form-group">
          <label for="prenom">Prénom</label>
          <input id="prenom" v-model="DataUser.prenom" placeholder="Entrez votre prénom" required />
        </div>

        <div class="form-group">
          <label for="username">Nom d'utilisateur</label>
          <input id="username" v-model="DataUser.username" placeholder="Choisissez un nom d'utilisateur" required />
        </div>

        <div class="form-group">
          <label for="email">e-mail </label>
          <input id="email" v-model="DataUser.email" placeholder="email" required />
        </div>

        <div class="form-group">
          <label for="password">Mot de passe</label>
          <input id="password" v-model="DataUser.password" type="password" placeholder="Entrez un mot de passe" required />
        </div>

        <button type="submit" class="register-btn">S'inscrire</button>
      </form>

      <p class="login-text">
        Déjà inscrit ?
        <router-link to="/login" class="login-link">Se connecter</router-link>
      </p>
      <btn-home/>

      <p v-if="message" class="response-message">
        {{ message }}

      </p>
    </div>
  </div>
</template>

<script>
import api from '../api';
import btnHome from './btnHome.vue';


export default {
  components:{btnHome},
  props: ['user', 'getUser', 'setUser'],
  data() {
    return {
      DataUser: this?.getUser() || { nom: '', prenom: '', username: '', password: '',email: '' },
      message: ''
    }
  },
  methods: {
    async register() {
      try {
        const res = await api.post('/auth/register', {
          nom: this.DataUser.nom,
          prenom: this.DataUser.prenom,
          username: this.DataUser.username,
          password: this.DataUser.password,
          email: this.DataUser.email

        })
        this.message = `✅ Compte créé avec succès ! Bienvenue, ${this.DataUser.prenom} ${this.DataUser.nom}`
        if (res.data.token) {
          localStorage.setItem('token', res.data.token)
        }
        this.setUser(res.data.user || this.DataUser)
      } catch (err) {
        this.message = err.response?.data?.error || '❌ Échec de l’inscription'
      }
    }
  }
}
</script>

<style scoped>
/* Conteneur principal centré */
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh; /* prend toute la hauteur */
  background: #f3f4f6;
}

/* Carte du formulaire */
.register-card {
  background: white;
  padding: 3rem 3.5rem;
  border-radius: 20px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.12);
  width: 100%;
  max-width: 480px;
  text-align: center;
}

/* Titres */
h2 {
  margin-bottom: 2rem;
  color: #333;
  font-size: 1.8rem;
}

/* Formulaire */
.register-form {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  text-align: left;
}

label {
  font-weight: 600;
  margin-bottom: 0.3rem;
  color: #444;
  font-size: 1rem;
}

input {
  width: 100%;
  padding: 0.9rem;
  border: 1px solid #ccc;
  border-radius: 10px;
  font-size: 1.05rem;
}

input:focus {
  border-color: #007bff;
  outline: none;
}

/* Bouton S'inscrire identique au Login */
.register-btn {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 0.9rem;
  border-radius: 10px;
  font-weight: 600;
  font-size: 1.1rem;
  cursor: pointer;
  transition: background 0.3s, transform 0.1s;
}

.register-btn:hover {
  background-color: #0056b3;
  transform: scale(1.02);
}

/* Lien vers Login */
.login-text {
  margin-top: 1.5rem;
  color: #555;
  font-size: 1rem;
}

.login-link {
  color: #007bff;
  font-weight: 600;
  text-decoration: none;
}

.login-link:hover {
  text-decoration: underline;
}

/* Message de réponse */
.response-message {
  margin-top: 1rem;
  color: #333;
  font-weight: 500;
}
</style>

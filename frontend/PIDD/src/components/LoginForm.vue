<template>
  <div class="login-container">
    <!-- Si l'utilisateur est connecté -->
    <div v-if="user && user.username" class="logged">
      <p>Bienvenue, <strong>{{ user.username }}</strong> 👋</p>
      <button class="logout-btn" @click="logout">Se déconnecter</button>
    </div>

    <!-- Si l'utilisateur n'est PAS connecté -->
    <div v-else class="login-card">
      <h2>Connexion</h2>
      <form @submit.prevent="login" class="login-form">
        <div class="form-group">
          <label for="username">Nom d'utilisateur</label>
          <input
            id="username"
            v-model="DataUser.username"
            placeholder="Entrez votre nom d'utilisateur"
            required
          />
        </div>

        <div class="form-group">
          <label for="password">Mot de passe</label>
          <input
            id="password"
            v-model="DataUser.password"
            type="password"
            placeholder="Entrez votre mot de passe"
            required
          />
        </div>

        <button type="submit" class="login-btn">Se connecter</button>
      </form>

      <!-- Lien vers l'inscription -->
      <p class="register-text">
        Pas encore de compte ?
        <router-link to="/register" class="register-link">Créer un compte</router-link>
      </p>

      <p v-if="message" class="error-message">{{ message }}</p>
    </div>
  </div>
</template>

<script>
import api from '../api';

export default {
  props: ['user', 'setUser', 'getUser'],
  data() {
    return {
      DataUser: this?.getUser() || { username: '', password: '' },
      message: ''
    }
  },
  methods: {
    async login() {
      try {
        const res = await api.post('/auth/login', {
          username: this.DataUser.username,
          password: this.DataUser.password
        })
        localStorage.setItem('token', res.data.token)
        this.setUser(res.data.user)
        this.message = ''
      } catch (err) {
        this.message = err.response?.data?.error || 'Échec de la connexion'
      }
    },
    logout() {
      localStorage.removeItem('token')
      this.setUser(null)
    }
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 90vh;
  background: #f3f4f6;
}

.login-card {
  background: white;
  padding: 3rem 3.5rem;
  border-radius: 20px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.12);
  width: 100%;
  max-width: 480px;
  text-align: center;
}

h2 {
  margin-bottom: 2rem;
  color: #333;
  font-size: 1.8rem;
}

.login-form {
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
  padding: 0.9rem;
  border: 1px solid #ccc;
  border-radius: 10px;
  font-size: 1.05rem;
}

input:focus {
  border-color: #007bff;
  outline: none;
}

.login-btn {
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

.login-btn:hover {
  background-color: #0056b3;
  transform: scale(1.02);
}

.register-text {
  margin-top: 1.5rem;
  color: #555;
  font-size: 1rem;
}

.register-link {
  color: #007bff;
  font-weight: 600;
  text-decoration: none;
}

.register-link:hover {
  text-decoration: underline;
}

.error-message {
  margin-top: 1rem;
  color: red;
  font-weight: 500;
}

.logged {
  text-align: center;
}

.logout-btn {
  background-color: #e63946;
  color: white;
  border: none;
  padding: 0.8rem 1.3rem;
  border-radius: 10px;
  cursor: pointer;
  margin-top: 1rem;
  transition: background 0.3s;
}

.logout-btn:hover {
  background-color: #c62828;
}
</style>

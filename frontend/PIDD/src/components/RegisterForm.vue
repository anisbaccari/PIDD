<template>
  <div class="register-container">
    <div v-if="user && user.username" class="registered">
      <p>Bienvenue, <strong>{{ user.username }}</strong> 🎉</p>
      <p>Votre compte est déjà créé.</p>
    </div>

    <div v-else class="register-card">
      <h2>Créer un compte</h2>

      <form @submit.prevent="register" class="register-form">

        <div class="form-group">
          <label for="name">Nom</label>
          <input id="name" v-model="DataUser.name" placeholder="Entrez votre nom" required />
        </div>

        <div class="form-group">
          <label for="lastName">Prénom</label>
          <input id="lastName" v-model="DataUser.lastName" placeholder="Entrez votre prénom" required />
        </div>

        <div class="form-group">
          <label for="email">Email</label>
          <input id="email" v-model="DataUser.email" type="email" placeholder="Entrez votre email" required />
        </div>

        <div class="form-group">
          <label for="username">Nom d'utilisateur</label>
          <input id="username" v-model="DataUser.username" placeholder="Choisissez un nom d'utilisateur" required />
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

      <p v-if="message" class="response-message">{{ message }}</p>
    </div>
  </div>
</template>

<script>
import api from '../api';

export default {
  props: ['user', 'getUser', 'setUser'],

  data() {
    return {
      DataUser: {
        name: '',
        lastName: '',
        email: '',
        username: '',
        password: ''
      },
      message: ''
    }
  },

  methods: {
    async register() {
      try {
        const res = await api.post('/auth/register', {
          name: this.DataUser.name,
          lastName: this.DataUser.lastName,
          email: this.DataUser.email,
          username: this.DataUser.username,
          password: this.DataUser.password
        });

        this.message = `✅ Compte créé avec succès ! Bienvenue, ${this.DataUser.name}`;

        if (res.data.token) {
          localStorage.setItem('token', res.data.token);
        }

        this.setUser(res.data.user || this.DataUser);

      } catch (err) {
        this.message = err.response?.data?.error || '❌ Échec de l’inscription';
      }
    }
  }
};
</script>

<style scoped>
/* Même style que ta version précédente */
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: #f3f4f6;
}
.register-card {
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
}
input {
  padding: 0.9rem;
  border: 1px solid #ccc;
  border-radius: 10px;
}
input:focus {
  border-color: #007bff;
}
.register-btn {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 0.9rem;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
}
.register-btn:hover {
  background-color: #0056b3;
}
.login-text {
  margin-top: 1.5rem;
}
.login-link {
  color: #007bff;
}
.response-message {
  margin-top: 1rem;
}
</style>

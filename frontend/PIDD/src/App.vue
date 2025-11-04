<script>
import api from './api';
import AppFooter from './components/AppFooter.vue';
import UserAvatar from './components/UserAvatar.vue';
import Home from './views/Home.vue';

export default {
  components: { Home,AppFooter,UserAvatar },
  
  data() {
    return { 
      user: null 
    };
  },
  methods: {
    setUser(user) {
      this.user = user;
    },
    getUser() {
      return this.user;
    }
  },
  async mounted() {
    const token = localStorage.getItem("token");
    if (!token) {
      console.log("[navBar] : no token found");
      return;
    }
    console.log("[init] token found :", token)

    try {
      // Correction : toujours essayer de récupérer le profil si token existe
      const res = await api.get('http://localhost:3000/profil', {
        headers: { Authorization: `Bearer ${token}` }
      });

      // axios puts parsed JSON on res.data
      this.user = res.data.user;
      console.log('profile', res.data);
      
    } catch (err) {
      console.error('profile error', err.response?.data || err.message);
      console.error('[USER + TOKEN]', this?.user, token);
      // Optionnel : déconnecter si token invalide
      localStorage.removeItem("token");
      this.user = null;
    }
  }
};
</script>

<template>
  <div id="app">
    <!-- Navigation -->
    <nav class="navigation">
      <router-link to="/" class="nav-logo">MonShop</router-link>
      <div class="nav-links">
        <router-link to="/" class="nav-link">Accueil</router-link>
        <router-link to="/category/1" class="nav-link">Homme</router-link>
        <router-link to="/category/2" class="nav-link">Femme</router-link>
        <router-link to="/category/3" class="nav-link">Enfants</router-link>
      </div>
      <div class="nav-login">
        <router-link v-if="!user" to="/login" class="login-button nav-link">Se connecter</router-link>
        <UserAvatar v-else :user="user" />
      </div>
    </nav>
    
    <!-- Contenu principal - UNIQUEMENT le router-view -->
    <router-view 
      :user="user"
      :getUser="getUser"
      :setUser="setUser"
    />
    <AppFooter />
  </div>
</template>

<style>
/* Styles globaux */
body {
  margin: 0;
  font-family: "Inter", sans-serif;
  background-color: #f8fafc;
}

#app {
  min-height: 100vh;
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
</style>
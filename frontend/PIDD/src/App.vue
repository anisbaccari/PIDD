<script>
import api from './api';
import AppFooter from './components/AppFooter.vue';
import Home from './views/Home.vue';

export default {
  components: { Home,AppFooter },
  
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
    <NavBar :user="user" :setUser="setUser" :getUser="getUser"/>
    
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
</style>
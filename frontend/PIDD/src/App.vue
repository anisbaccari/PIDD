<script>
import api from './api';
import AppFooter from './components/AppFooter.vue';
import UserAvatar from './components/UserAvatar.vue';
import Home from './views/Home.vue';

export default {
  components: { Home,AppFooter,UserAvatar },
  
  data() {
    return { 
      user: {id:'', username:'', password:'',is_admin : false,email:''},
      tempCart : []
    };
  },
  methods: {
    setUser(user) {
      try {
      this.user = user;
      } catch (error) {
      console.error('setUser error', error);
        
      }

    },
    getUser() {
      try {
      return this.user;
        
      } catch (error) {
        
        console.error('getUser error', error);
      }
    },
    setPanier(panier) {

      try {
          this.tempCart.push(panier);
          console.error('[setPanier]  this.tempCart',  this.tempCart);

        
      } catch (error) {
          console.error('setPanier error', error);
        
      }
    },
    getFirstPanier() {

      try {
        if(this.tempCart[0]){
          console.log('[App] getFirstPanier this.tempCart', this.tempCart.target);

          return this.tempCart[0];
        }
        else
          return null;
      } catch (error) {
          console.error('getPanier error', error);
        
      }
    },
  },
  async mounted() {


    try {

          const token = localStorage.getItem("token");
          if (token == null) {
            console.log("[App] : no token found");
            return;
          }

        console.log("[init] token found :", token)
       // console.log("[APP] user found :", this.user)
        console.log("TOKEN =>", `"${token}"`);

        const res = await api.get(`http://localhost:3000/profil`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // axios puts parsed JSON on res.data
      this.user = res.data.user;
      console.log('[App]  profile', res.data);
      
    } catch (err) {
      console.error('profile error', err.response?.data || err.message);
      console.error('profile error',  err.message);

      // Optionnel : déconnecter si token invalide
   //   localStorage.removeItem("token");
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
        <router-link v-if="this.user && this.user.is_admin" to="/admin" class="nav-link">Admin</router-link>
        <router-link to="/category/1" class="nav-link">Homme</router-link>
        <router-link to="/category/2" class="nav-link">Femme</router-link>
        <router-link to="/category/3" class="nav-link">Enfants</router-link>
        <router-link to="/cart" class="nav-link">Panier</router-link>
      </div>
       <div class="nav-login">
        <router-link v-if="!user" to="/login" class="login-button nav-link">Se connecter</router-link>
        <UserAvatar v-else :user="user" :getUser="getUser" :setUser="setUser"/>
      </div>
    </nav>
    
    <!-- Contenu principal - UNIQUEMENT le router-view -->
    <router-view 
      :tempCart="tempCart"
      :user="user"
      :getUser="getUser"
      :setUser="setUser" 
      :getFirstPanier="getFirstPanier" 
      :setPanier="setPanier"
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
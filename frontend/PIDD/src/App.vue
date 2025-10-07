<script>
import RegisterForm from './components/RegisterForm.vue';
import LoginForm from './components/LoginForm.vue';
import Home from './views/Home.vue';
import NavBar from './components/NavBar.vue';
import api from './api';


export default {
  
  components: { NavBar,Home },
  data() {
    return { user: null };
  },
  methods: {
    setUser(user) {
      this.user = user;
    },
    getUser(){
      return this.user;
    }
  },
     async mounted() {
        const token = localStorage.getItem("token");
        if(!token)
        {
        console.log("[navBar] : no token found");
        return;
        }
        console.log("[init] token found :",token)
    
        try {

          if(this.user)
          {
            const res = await api.get('http://localhost:3000/profil',
            {
              headers: { Authorization: `Bearer ${token}` }
            });

            // axios puts parsed JSON on res.data
            this.user = res.data.user;
            console.log('profile', res.data);
          }
          else{
            console.log("[init] not user found")
          }
  } catch (err) {
    console.error('profile error', err.response?.data || err.message);
    console.error('[USER + TOKEN]', this?.user,token);

  }
    
    
    }
    
};
</script>

<template>
    <div>
      <NavBar :user="user" :setUser="setUser" :getUser="getUser"/>
      <router-view v-slot="{ Component }" 
      :user="user"
      :getUser="getUser"
      :setUser="setUser"
      >
      <component :is="Component"
      :user="user"
      :getUser="getUser"
      :setUser="setUser"
      />

      </router-view>
      <div>
    <header class="p-4 text-center bg-gray-800 text-white">
      <h1>🧢 Boutique T-Shirts</h1>
    </header>

    <main class="p-6">
      <router-view />
    </main>
  </div>
    </div>
</template>


<style scoped>
body {
  margin: 0;
  font-family: "Inter", sans-serif;
}
</style>

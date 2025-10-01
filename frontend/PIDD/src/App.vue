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
    }
  },
     async mounted() {
        const token = localStorage.getItem("token");
        if(!token)
        {
        console.log("[navBar] : no token found");
        return;
        }
    
  try {
    const res = await api.get('http://localhost:3000/profil', {
      headers: { Authorization: `Bearer ${token}` }
    });


        // axios puts parsed JSON on res.data
        this.user = res.data.user;
        console.log('profile', res.data);
  } catch (err) {
    console.error('profile error', err.response?.data || err.message);
  }
    
    
    }
    
};
</script>

<template>
    <div>
      <NavBar />
      <Home :user="user"/>
    </div>
</template>


<style scoped>

</style>

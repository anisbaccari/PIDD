<template>
    
    <div  v-if="user && user.username" class="Logged" id ="logged">
      <p> You are logged  {{ user.username }}</p>
      <div class="logOut">
        <button @click="logout">log out</button>
      </div>
    </div>
    <div v-else>
      <h2>Login</h2>
      <form @submit.prevent="login">
        <input v-model="DataUser.username" placeholder="Username" required />
        <input v-model="DataUser.password" type="password" placeholder="Password" required />
        <button type="submit">Login</button>
      </form>
    </div>
  </template>
  
  <script>
  import api from '../api';
  
  export default {
    props : ['user','setUser','getUser'],
    data() {
      console.log("[LoginForn data  ] getUser : ",this?.getUser())
      return {
        DataUser : this?.getUser() || {username: "",password: ""},
        message :''
      };
    },
    methods: {
      async login() {
        try {
          console.log("[auth/Login] > user : ",this.DataUser.username)
          const res = await api.post('/auth/login', {
            username: this.DataUser.username,
            password: this.DataUser.password
          });
          // Store the token in localStorage
          console.log('Login successful, token:', res.data.token);
          localStorage.setItem('token', res.data.token);
          this.message = res.data.message;
          console.log('user successful :', res.data.user);
          this.setUser(res.data.user);
        } catch (err) {
          this.message = err.response?.data?.error || 'Login failed';
        }
      },
      logout(){
          localStorage.removeItem('token');
          this.setUser(null);
          console.log('[LoginForn] Log Out :');

      }
    }
  };
  </script>
  
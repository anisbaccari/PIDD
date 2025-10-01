<template>
    
    <div  v-if="user && user.username" class="Logged" id ="logged">
      <p> You are logged</p>
    </div>
    <div v-else>
      <h2>Login</h2>
      <form @submit.prevent="login">
        <input v-model="user.username" placeholder="Username" required />
        <input v-model="user.password" type="password" placeholder="Password" required />
        <button type="submit">Login</button>
      </form>
    </div>
  </template>
  
  <script>
  import api from '../api';
  
  export default {
    props : ['setUser'],
    data() {
      return {
        user : {username :'',password: ''},
        message :''
      };
    },
    methods: {
      async login() {
        try {
          const res = await api.post('/auth/login', {
            username: this.user.username,
            password: this.user.password
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
      }
    }
  };
  </script>
  
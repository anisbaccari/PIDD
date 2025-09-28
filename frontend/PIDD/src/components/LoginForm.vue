<template>
    <div>
      <h2>Login</h2>
      <form @submit.prevent="login">
        <input v-model="username" placeholder="Username" required />
        <input v-model="password" type="password" placeholder="Password" required />
        <button type="submit">Login</button>
      </form>
      <p v-if="message">{{ message }}</p>
    </div>
  </template>
  
  <script>
  import api from '../api';
  
  export default {
    data() {
      return {
        username: '',
        password: '',
        message: ''
      };
    },
    methods: {
      async login() {
        try {
          const res = await api.post('/login', {
            username: this.username,
            password: this.password
          });
          this.message = res.data.message;
        } catch (err) {
          this.message = err.response?.data?.error || 'Login failed';
        }
      }
    }
  };
  </script>
  
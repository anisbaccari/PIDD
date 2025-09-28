<template>
    <div>
      <h2>Register</h2>
      <form @submit.prevent="register">
        <input v-model="username" placeholder="Username" required />
        <input v-model="password" type="password" placeholder="Password" required />
        <button type="submit">Register</button>
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
      async register() {
        try {
          const res = await api.post('/register', {
            username: this.username,
            password: this.password
          });
          this.message = `User registered with ID: ${res.data.userId}`;
        } catch (err) {
          this.message = err.response?.data?.error || 'Registration failed';
        }
      }
    }
  };
  </script>
  
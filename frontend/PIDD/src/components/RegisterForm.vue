<template>

    <div v-if="user && user.username" class="registered" ></div>
    <div v-else>
      <h2>Register</h2>
      <form @submit.prevent="register">
        <input v-model="user.username" placeholder="Username" required />
        <input v-model="user.password" type="password" placeholder="Password" required />
        <button type="submit">Register</button>
      </form>
    </div>
  </template>
  
  <script>
  import api from '../api';
  
  export default {
    props : ['setUser'],
    data() {
      return {
        user : {  username: '',password: ''},
        message: ''
      };
    },
    methods: {
      async register() {
        try {
          const res = await api.post('/auth/register', {
            username: this.user.username,
            password: this.user.password
          });
          this.message = `User registered with ID: ${res.data.userId}`;
        } catch (err) {
          this.message = err.response?.data?.error || 'Registration failed';
        }
      }
    }
  };
  </script>
  
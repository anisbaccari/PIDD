<template>

    <div v-if="user && user.username" class="registered" ></div>
    <div v-else>
      <h2>Register</h2>
      <form @submit.prevent="register">
        <input v-model="DataUser.username" placeholder="Username" required />
        <input v-model="DataUser.password" type="password" placeholder="Password" required />
        <button type="submit">Register</button>
      </form>
      <p v-if="message"> {{ message }}</p>
    </div>
  </template>
  
  <script>
  import api from '../api';
  
  export default {
    props : ['user','getUser','setUser'],
    data() {
      return {
        DataUser : this?.getUser() ||  {  username: '',password: ''},
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
        } catch (err) {
          this.message = err.response?.data?.error || 'Registration failed';
        }
      }
    }
  };
  </script>
  
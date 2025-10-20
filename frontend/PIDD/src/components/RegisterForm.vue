<template>

    <div v-if="user" class="registered" ></div>
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
              console.log("[register] : ", this.DataUser.password);

              const res = await api.post('/auth/register', {
                username: this.DataUser.username,
                password: this.DataUser.password
              });

              console.log("[register] res : ",res.data);
              let user = { username : this.DataUser.username};
              this.setUser(user);

        } catch (err) {
              console.log("[register] err : ", err);

          this.message = err.response?.data?.error || 'Registration failed';
        }
      }
    }
  };
  </script>
  
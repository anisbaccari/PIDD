<template>
  <div class="home" id="home">
    <h1>Welcome to the Home Page</h1>

    <div v-if="user">
      <p>Logged in as: {{ user.username }}</p>
      <p>User ID: {{ user.id }}</p>
    </div>

    <div v-else>
      <p>You are not logged in.</p>
    </div>
  </div>
</template>

<script>
import api from '../api';

export default {
  name: 'Home',
  data() {
    return {
      user: null,
    };
  },
  async created() {
    try {
      const res = await api.get('/profile'); // backend protected route
      this.user = res.data.user;
    } catch (err) {
      console.log('Not logged in or token invalid', err);
      this.user = null;
    }
  },
};
</script>

<style src="../assets/styles/Home.css" scoped></style>

<template>
  <div class="home" id="home">
    <h1>Welcome to the Home </h1>

    <div v-if="user">
      <p>Logged in as: {{ user.username }}</p>
      <p>User ID: {{ user.id }}</p>
    </div>

    <div v-else>
      <p>You are not logged in.</p>
    </div>
    <footer />
  </div>
</template>

<script>

import api from '../api';
import Footer from '../components/Footer.vue';

export default {
  name: 'Home',
  components: { Footer },
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

<style src="../assets/styles/Home.css" scoped>
html, body {
  height: 100%;
}
#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
main {
  flex: 1;
}
</style>

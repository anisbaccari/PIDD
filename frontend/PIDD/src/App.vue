<script>
import RegisterForm from './components/RegisterForm.vue';
import LoginForm from './components/LoginForm.vue';
import Home from './views/Home.vue';
import NavBar from './components/NavBar.vue';
export default {
  components: { NavBar,Home }
};
</script>

<template>
    <div>
      <NavBar />
      <Home />
    </div>
</template>


<style scoped>

</style>

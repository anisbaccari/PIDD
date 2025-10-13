<script>
import LoginForm from './LoginForm.vue';
import RegisterForm from './RegisterForm.vue';
export default {
  components: { RegisterForm, LoginForm },
  name:'NavBar'
};


</script>

<template>
  <div class="navbar" id="navbar">
    <RegisterForm />
    <LoginForm />
  </div> 
  <footer />
</template>
<style src="../assets/styles/NavBar.css"></style>
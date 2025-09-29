<script>
import RegisterForm from './RegisterForm.vue';
import LoginForm from './LoginForm.vue';
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
</template>
<style src="../assets/styles/NavBar.css"></style>
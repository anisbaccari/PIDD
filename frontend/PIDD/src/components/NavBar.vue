<script>
import RegisterForm from './RegisterForm.vue';
import LoginForm from './LoginForm.vue';
import Profil from './Profil.vue';
export default {
  components: { Profil,RegisterForm, LoginForm },
  name:'NavBar',
  props : ['user','setUser','getUser']

};

  


</script>
<template>
  <div class="navbar" id="navbar">
    <LoginForm :user="user" :setUser="setUser" :getUser="getUser" />
    <Profil :user="user" :setUser="setUser" :getUser="getUser" />
    <RegisterForm  :user="user" :setUser="setUser" :getUser="getUser" />
  </div> 
</template>
<style src="../assets/styles/NavBar.css"></style>
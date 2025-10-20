<template>
    <router-link v-if="user  && $route.path == '/profilview'" to="/">  Home</router-link>
    <router-link v-if="user  && $route.path == '/'" to="/profilview">  Profil</router-link>

</template>


<script>

export default { 
    props : ['user','getUser','setUser'],
    name:'Profil',
}

</script>
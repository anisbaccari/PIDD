<template>
    <router-link v-if="user  && $route.path == '/profil'" to="/">  Home</router-link>
    <router-link v-if="user  && $route.path == '/'" to="/profil">  Profil</router-link>

</template>


<script>

export default { 
    props : ['user','getUser','setUser'],
    name:'Profil',
}

</script>
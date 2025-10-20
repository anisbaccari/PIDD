<template>
    <h1 v-if="user && user.username"> Welcome {{ user.username }}</h1>
    <h1 v-else> Welcome You </h1>
</template>

<script>

export default {
    props : ['user','setUser','getUser'],
    name:'Index'
}

</script>
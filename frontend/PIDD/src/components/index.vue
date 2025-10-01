<template>
    <h1 v-if="user && user.username"> Welcome {{ user.username }}</h1>
    <h1 v-else> Welcome You </h1>
</template>

<script>

export default {
    props : ['user'],
    name:'Index'
}

</script>
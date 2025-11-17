<template>

    <div class="ProfilBox">
        <ProfileCard :user="user" :setUser="setUser" :getUser="getUser"  />
    </div>
</template>



<script>
import ProfileCard from '../components/ProfileCard.vue';
export default {
    components: {ProfileCard},
    props: ['user','getUser','setUser']
}

</script>
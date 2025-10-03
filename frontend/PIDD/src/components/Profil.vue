<template>
    <div v-if="user"> <button @click="getProfil" > Profil</button ></div>
</template>



<script>
import api from '../api';

export default {
    props : ["user","getUser","setUser"],
    name : 'Profil',
    data(){
         return {
           DataUser  : this.getUser() || { username : "", password :""},
           token : ""
         }   
    },
    methods :{
      async  getProfil(){
        try {
                this.token = localStorage.getItem('token'); 
                if(this.token == "")
                {
                    console.log("[Profil] : no token found ");
                    return;
                }
                console.log("[Profil] : token found : ",this.token);
                await api.get('/profil');
            } catch (error) {
                console.error("[Profil] Error : ",error);
            }
        }
    }
}

</script>
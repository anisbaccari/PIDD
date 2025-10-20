<template>

<div class="ProfilBox">
    <div class="ProfilOn" v-if="DataUser">
        <p> user found {{ DataUser.username }} id : {{ DataUser.id }}  </p>
    </div>
    <div class="ProfilOn" v-else>
        <p> no user</p>
    </div>

</div>
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
                const res =  await api.get('/profil');
                console.log("[Profil] response  : ", res.data.user);
                this.DataUser.username = res.data.user.username;

            } catch (error) {
                console.error("[Profil] Error : ",error);
            }
        }
    },
    mounted(){
        this.getProfil();
    }
}

</script>
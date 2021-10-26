<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>Login</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Cadastre-se</ion-title>
        </ion-toolbar>
      </ion-header>

      <ion-grid>
        <ion-card style="height: 600px; border-radius: 9px">
        <ion-progress-bar v-if="processing" type="indeterminate"></ion-progress-bar>
          <ion-card-header style="">
            <ion-card-title style="text-align: center;">Cadastre-se</ion-card-title>
          </ion-card-header>
          <!-- Valor -->
          <ion-card-content style="">
            <ion-row class="text-center">
            <ion-col size="1"></ion-col>
              <ion-col size="10">
                <ion-item>
                  <ion-label position="floating">Nome</ion-label>
                  <ion-input
                    v-model="name"
                  ></ion-input>
                </ion-item>
              </ion-col>
              <ion-col size="1"></ion-col>
              <ion-col size="1"></ion-col>
              <ion-col size="10">
                <ion-item>
                  <ion-label position="floating">Email</ion-label>
                  <ion-input v-model="email"></ion-input>
                </ion-item>
              </ion-col>
              <ion-col size="1"></ion-col>
              <ion-col size="1"></ion-col>
              <ion-col size="10">
                <ion-item>
                  <ion-label position="floating">Senha</ion-label>
                  <ion-input
                    v-model="password"
                    type="password"
                  ></ion-input>
                </ion-item>
              </ion-col>
              <ion-col size="1"></ion-col>
              <ion-col size="1"></ion-col>
              <ion-col size="10">
                <ion-item>
                  <ion-label position="floating">Confirme a senha</ion-label>
                  <ion-input
                    v-model="passwordConfirm"
                    type="password"
                  ></ion-input>
                </ion-item>
              </ion-col>
              <ion-col size="1"></ion-col>
            </ion-row>
            <!-- Valor -->

            <!-- Salvar -->
            <ion-row>
              <ion-col size="1"></ion-col>
              <ion-col size="10">
                <ion-button expand="block" shape="round" @click="registerUser()"
                  >Salvar</ion-button
                >
              </ion-col>
              <ion-col size="1"></ion-col>
            </ion-row>
            <!-- Salvar -->
          </ion-card-content>
        </ion-card>
      </ion-grid>
    </ion-content>
  </ion-page>
</template>

<script>
import {
  IonToolbar,
  IonContent,
  IonHeader,
  IonTitle,
  IonInput,
  IonPage,
} from "@ionic/vue";

import { 
  getFirestore, 
  collection,
  // addDoc,
  set,
  setDoc,
  doc
} from "firebase/firestore";

import { createUserWithEmailAndPassword, getAuth,signOut} from "firebase/auth";

export default {
  name: "Tab2",
  components: {
    IonContent,
    IonToolbar,
    IonHeader,
    IonTitle,
    IonInput,
    IonPage,
  },
  data: () => {
    return {
      name: 'Elizeu',
      email: 'elizeu@gmail.com',
      password: '123456',
      passwordConfirm: '123456',
      processing: false
    };
  },
  mounted() {
    const auth = getAuth()
    signOut(auth)
    console.log('Register mounted')
  },
  methods: {
    async registerUser() {
      if (this.validateForm()) {
        const db = getFirestore();
        this.processing = true
        createUserWithEmailAndPassword(getAuth(), this.email, this.password).then(async (userCredential) => {
          const uid = userCredential.user.uid
          setDoc(doc(db, 'users', uid), {name: this.name, emergencyReserveReached: 0, monthlyIncome:0, emergencyReserveGoal:0, expenses: []})

          this.showToast('success', 'Usuário cadastrado com sucesso')
          setTimeout(()=>{
              this.processing = false
              this.$router.push('/tabs/tab1')
            }, 2000)
        })
        .catch((error) => {
            if(error.message.includes('email-already-in-use')){
              this.showToast('danger', 'Email já está em uso')
            }else if(error.message.includes('invalid-email')){
              this.showToast('danger', 'Email inválido')
            }else{
              this.showToast('danger', 'Erro ao cadastrar usuário')
            }
            console.log(error.message)

            setTimeout(()=>{
              this.processing = false
            }, 2000)
        })

      }
    },
    validateForm() {
      if (this.name == '') {
        this.showToast('danger', 'Informe seu nome.');
        return false;
      }

      if (this.email == '') {
        this.showToast('danger', 'Informe seu e-email.');
        return false;
      }

      if (this.password == '') {
        this.showToast('danger', 'Informe a senha.');
        return false;
      }

      if (this.password !== this.passwordConfirm) {
        this.showToast('danger', 'Senhas não conferem.');
        return false;
      }

      return true;
    }
  }
}
</script>

<style scoped>
.ion-color-primary{
  --ion-color-base: white!important
}

ion-title{
  color: #3880ff;
}

ion-content {
  --ion-background-color: #3880ff;
}

ion-router-link{
  color: #F74FA8!important;
}

ion-item {
  /* font-size: 12px!important; */
  --ion-background-color: white;
}

ion-card {
  --ion-background-color: white;
}

ion-label {
  font-family: "LabelInputsFont" !important;
  /* font-size: 15px!important; */
  color: #F74FA8!important;
  font-weight: bold;
}

.head-list {
  font-family: "HeadTableFont" !important;
}

ion-card-header{
  padding: 60px;
}

@media screen and (min-width: 800px) {
  ion-card {
    width: 30%;
  }

  ion-grid{
    display: flex; 
    align-items: center; 
    justify-content: center;
  }
}
</style>
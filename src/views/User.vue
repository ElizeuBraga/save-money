<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>{{user.name}}</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Dados</ion-title>
        </ion-toolbar>
      </ion-header>

      <ion-grid>
        <ion-card>
        <!-- Descrição -->
        <ion-row>
          <ion-col size="12">
            <ion-item>
              <ion-label position="floating" size="small">Nome:</ion-label>
              <ion-input v-model="user.name"></ion-input>
            </ion-item>
          </ion-col>
          <ion-col size="12">
            <ion-item>
              <ion-label position="floating">Email:</ion-label>
              <ion-input v-model="user.email"></ion-input>
            </ion-item>
          </ion-col>
          <ion-col size="12">
            <ion-item>
              <ion-label position="floating">Telefone:</ion-label>
              <ion-input v-model="user.phone"></ion-input>
            </ion-item>
          </ion-col>
          </ion-row>
          <ion-row v-if="updatePwd">
          <ion-col size="12">
            <ion-label position="center">Para atualizar a senha basta preenche-la</ion-label>
            <ion-item>
              <ion-label position="floating">Senha atual:</ion-label>
              <ion-input v-model="user.password"></ion-input>
            </ion-item>
          </ion-col>
          <ion-col size="12">
            <ion-item>
              <ion-label position="floating">Nova Senha:</ion-label>
              <ion-input v-model="user.newPassword"></ion-input>
            </ion-item>
          </ion-col>
          <ion-col>
            <ion-item>
              <ion-label position="floating">Confirmar senha:</ion-label>
              <ion-input v-model="user.passwordConfirm"></ion-input>
            </ion-item>
          </ion-col>
        </ion-row>
        <!-- Descrição -->

        <!-- Salvar -->
        <ion-row>
          <ion-col class="ion-text-center">
            <ion-button expand="block" shape="round" @click="save">Salvar</ion-button>
            <ion-route-link v-if="!updatePwd" @click="setUpdatePawd(true)">Alterar senha</ion-route-link>
            <ion-route-link v-else @click="setUpdatePawd(false)">Não atualizar a senha</ion-route-link>
          </ion-col>
        </ion-row>
        <!-- Salvar -->
        </ion-card>
      </ion-grid>
    </ion-content>
  </ion-page>
</template>

<script>
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonInput,
} from "@ionic/vue";
import axios from "axios";

export default {
  name: "Tab2",
  components: {
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonPage,
    IonInput,
  },
  data: () => {
    return {
      user:{
        id:"",
        name:"",
        email:"",
        phone:""
      },
      updatePwd: false,
      expense: {
        description: "",
        payment: "",
        amount: "",
        role: "",
        month: String(new Date().getMonth() + 2)
      },
      expenses: [],
    };
  },
  async mounted() {
    this.user = JSON.parse(localStorage.getItem('user'))

    console.log(this.user)
    axios.create({
      withCredentials: false,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE,PATCH,OPTIONS",
      },
    });

    await this.loadExpenses()
  },
  methods: {
    setUpdatePawd(arg){
      this.updatePwd = arg
    },

    async save() {
      if (this.validateForm()) {
          axios
            .post(process.env.VUE_APP_API_URL + "/users", this.user)
            .then((response) => {
              // localStorage.setItem('user', JSON.stringify(response.data[0]))
              if (response.status == 201) {
                this.showToast("success", "Salvo com sucesso!");
                this.clearForm();
                this.loadExpenses()
              }
          });
      }
    },

    updateExpense(object){
      this.expense = JSON.parse(JSON.stringify(object));
      this.expense.role = String(object.role)
      this.expense.month = String(object.month)
    },

    validateForm() {
      if (!this.user.name || this.user.name == "") {
        this.showToast("danger", "Informe seu nome.");
        return false;
      }

      if (!this.user.email || this.user.email == "") {
        this.showToast("danger", "Informe seu email.");
        return false;
      }

      if(this.updatePwd){
        if (!this.user.password || this.user.password == "") {
          this.showToast("danger", "Informe a senha atual.");
          return false;
        }

        if (!this.user.newPassword || this.user.newPassword == "") {
          this.showToast("danger", "Informe a nova senha.");
          return false;
        } 

        if (!this.user.passwordConfirm || this.user.passwordConfirm == "") {
          this.showToast("danger", "Confirme a senha.");
          return false;
        }

        if (this.user.passwordConfirm != this.user.newPassword) {
          this.showToast("danger", "Senhas não conferem.");
          return false;
        } 
      }

      return true;
    },

    clearForm() {
      this.expense.description = ""
      this.expense.amount = "";
      this.expense.role = "";
      this.expense.id = "";
      this.expense.month = String(new Date().getMonth() + 2);
    },

    async loadExpenses(){
      await axios
      .get(process.env.VUE_APP_API_URL + "/expenses", {
        params: { roleToGet: "getExpenses" },
      })
      .then((response) => {
        this.expenses = response.data;
      });
    }
  },
};
</script>

<style scoped>
  ion-content{
    --ion-background-color:#e9eff0;
  }

  ion-item{
    /* font-size: 12px!important; */
    --ion-background-color:white;
  }

  ion-card{
    --ion-background-color:white;
  }

  ion-label{
    font-family: 'LabelInputsFont'!important;
  }

  .head-list{
    font-family: 'HeadTableFont'!important;
  }
</style>
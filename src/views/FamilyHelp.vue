<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>Ajude a família</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Ajude a família</ion-title>
        </ion-toolbar>
      </ion-header>

      <ion-grid>
        <ion-card>
          <ion-row>
            <ion-col>
              <ion-item>
                <ion-label position="floating">Mês:</ion-label>
                <ion-input type="month" v-model="help.month"></ion-input>
              </ion-item>
            </ion-col>

            <ion-col>
              <ion-item>
                <ion-label position="floating">Pessoa:</ion-label>
                <ion-select
                  v-model="help.userHelpedId"
                  placeholder="Selecione"
                >
                  <ion-select-option v-for="p in personsToHelp" :value="p.id" :key="p.id">{{p.name}}</ion-select-option>
                </ion-select>
              </ion-item>
            </ion-col>

            <ion-col>
              <ion-item>
                <ion-label position="floating">Quem ajuda:</ion-label>
                <ion-select
                  v-model="help.userDonorId"
                  placeholder="Selecione"
                  multiple
                  :disabled="(help.userHelpedId == '')"
                >
                  <ion-select-option v-for="p in personsToHelp" :disabled="(help.userHelpedId == p.id)" :value="p.id" :key="p.id">{{p.name}}</ion-select-option>
                </ion-select>
              </ion-item>
            </ion-col>
          </ion-row>

          <ion-row>
            <ion-col>
              <ion-item>
                <ion-label  position="floating">Finalidade:</ion-label>
                <ion-input v-model="help.description"></ion-input>
              </ion-item>
            </ion-col>
            <ion-col>
              <ion-item>
                <ion-label position="floating">Valor:</ion-label>
                <ion-input type="number" @keyup="formatMoney" v-model="help.amount"></ion-input>
              </ion-item>
            </ion-col>
          </ion-row>

          <ion-row>
            <ion-col>
              <ion-button expand="block" @click="save">Salvar</ion-button>
            </ion-col>
          </ion-row>
        </ion-card>

        <ion-card>
          <ion-row>
            <ion-col>
              <ion-text color="dark" style="text-align: center">
                <h5>Valores para o próximo mês</h5>
              </ion-text>
            </ion-col>
          </ion-row>
          <ion-row>
            <ion-col size="12" v-for="u in expensesToHelp" :key="u.name">
            <ion-item>
                <ion-label class="head-list">{{u.name}}</ion-label>
            </ion-item>
            <ion-list v-for="e in u.helps" :key="e.description">
              <ion-item>
                <ion-label>{{ e.description }}</ion-label>
                <ion-label>{{ 'R$ ' + parseFloat(e.amount).toFixed(2).replace('.', ',') }}</ion-label>
              </ion-item>
            </ion-list>
          </ion-col>
          </ion-row>
          <!-- List of Text Items -->
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
  IonSelect,
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
    IonSelect,
  },
  data: () => {
    return {
      help: {
        month: "",
        amount: "",
        description: "",
        userHelpedId: "",
        userDonorId:""
      },
      expensesToHelp: [],
      personsToHelp: [],
    };
  },

 watch:{
   'help.userHelpedId': function(value){
    //  help.userDonorId
    if(this.help.userDonorId.length > 0){
      // const index = this.help.userDonorId.indexOf(value)

      // if (index > -1) {
      //   this.help.userDonorId.splice(index, 1);
      // }

      this.help.userDonorId = []
    }
   }
 },

  mounted() {
    axios.create({
      withCredentials: false,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE,PATCH,OPTIONS",
      },
    });

    this.loadUsers();
    this.loadExpensesToHelp();
  },
  methods: {
    formatMoney(){
      console.log('Teste')
    },

    async save() {
      console.log(this.help)
      if (this.validateForm()) {
        this.help.month = parseInt(this.help.month.slice(-2));
        axios
          .post(
            process.env.VUE_APP_API_URL + "/expensesToHelp",
            this.help
          )
          .then((response) => {
            if (response.status == 201) {
              this.showToast("success", "Salvo com sucesso!");
              this.clearForm();
              this.loadExpensesToHelp();
            }
          });
      }
    },

    validateForm() {
      if (this.help.month == "") {
        this.showToast("danger", "Escolha o mês.");
        return false;
      }

      if (this.help.userId == "") {
        this.showToast("danger", "Escolha alguém.");
        return false;
      }


      if (this.help.description == "") {
        this.showToast("danger", "Informe a finalidade.");
        return false;
      }

      if (this.help.amount == "") {
        this.showToast("danger", "Digite um valor maior que zero.");
        return false;
      }


      return true;
    },

    clearForm() {
      this.help =  {
        month: "",
        amount: "",
        description: "",
        userHelpedId: "",
        userDonorId:""
      }
    },

    loadExpensesToHelp() {
      axios
        .get(process.env.VUE_APP_API_URL + "/expensesToHelp")
        .then((response) => {
          this.expensesToHelp = response.data;
          console.log(response.data)
        });
    },

    loadUsers() {
      axios
      .get(process.env.VUE_APP_API_URL + "/users")
      .then((response) => {
        this.personsToHelp = response.data;
      });
    },
  },
};
</script>

<style scoped>
ion-content {
  --ion-background-color: #e9eff0;
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
}

.head-list {
  font-family: "HeadTableFont" !important;
}
</style>
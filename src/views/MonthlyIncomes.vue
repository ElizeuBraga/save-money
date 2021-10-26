<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>Gastos</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Renda mensal</ion-title>
        </ion-toolbar>
      </ion-header>

      <ion-grid>
        <ion-card>
        <!-- Month -->
        <ion-row>
          <ion-col>
            <ion-item>
              <ion-label>Mês</ion-label>
              <ion-select v-model="monthlyIncome.month" placeholder="Selecione">
                <ion-select-option value="1">1</ion-select-option>
                <ion-select-option value="2">2</ion-select-option>
                <ion-select-option value="3">3</ion-select-option>
                <ion-select-option value="4">4</ion-select-option>
                <ion-select-option value="5">5</ion-select-option>
                <ion-select-option value="6">6</ion-select-option>
                <ion-select-option value="7">7</ion-select-option>
                <ion-select-option value="8">8</ion-select-option>
                <ion-select-option value="9">9</ion-select-option>
                <ion-select-option value="10">10</ion-select-option>
                <ion-select-option value="11">11</ion-select-option>
                <ion-select-option value="12">12</ion-select-option>
              </ion-select>
            </ion-item>
          </ion-col>
        </ion-row>
        <!-- Month -->

        <!-- Valor -->
        <ion-row>
          <ion-col>
            <ion-item>
              <ion-label position="floating">Valor</ion-label>
              <ion-input v-model="monthlyIncome.amount"></ion-input>
            </ion-item>
          </ion-col>
        </ion-row>
        <!-- Valor -->

        <!-- Salvar -->
        <ion-row>
          <ion-col>
            <ion-button expand="block" @click="save">Salvar</ion-button>
          </ion-col>
        </ion-row>
        <!-- Salvar -->
        </ion-card>

        <!-- List of Text Items -->
        <ion-card>
        <ion-row>
          <ion-col>
            <ion-text color="dark" style="text-align:center;" >
              <h5>Inseridos recentes</h5>
            </ion-text>
        </ion-col>
        </ion-row>
        <ion-row>
          <ion-col>
            <ion-item>
                <ion-label class="head-list">Mês</ion-label>
                <ion-label class="head-list">Valor</ion-label>
            </ion-item>
            <ion-list v-for="m in monthlyIncomes" :key="m.id">
              <ion-item>
                <ion-label>{{ m.month }}</ion-label>
                <ion-label>{{ 'R$ ' + parseFloat(m.amount).toFixed(2).replace('.', ',') }}</ion-label>
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
      monthlyIncome: {
        month: "",
        amount: "",
      },
      monthlyIncomes: [],
    };
  },
  mounted() {
    axios.create({
      withCredentials: false,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE,PATCH,OPTIONS",
      },
    });

    this.loadExpenses()
  },
  methods: {
    async save() {
      if (this.validateForm()) {
        axios
          .post(process.env.VUE_APP_API_URL + "/monthlyIncomes", this.monthlyIncome)
          .then((response) => {
            if (response.status == 201) {
              this.showToast("success", "Salvo com sucesso!");
              this.clearForm();
              this.loadExpenses()
            }
          });
      }
    },

    validateForm() {
      if (this.monthlyIncome.month == "") {
        this.showToast("danger", "Escolha o mês.");
        return false;
      }

      if (this.monthlyIncome.amount == "") {
        this.showToast("danger", "Preencha o valor.");
        return false;
      }

      return true;
    },

    clearForm() {
      this.monthlyIncome = {
        month: "",
        amount: ""
      };
    },

    loadExpenses(){
      axios
      .get(process.env.VUE_APP_API_URL + "/monthlyIncomes")
      .then((response) => {
        this.monthlyIncomes = response.data;
        console.log(this.monthlyIncomes)
        // console.log(response.data)
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
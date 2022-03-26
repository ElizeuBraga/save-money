<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="dark">
        <ion-row>
          <ion-col>
            <ion-label>Sobre o sistema</ion-label>
          </ion-col>
        </ion-row>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <ion-card>
        <ion-card-content>
          <ion-row  v-for="item in system" :key="item" @click="insertOrUpdatePayment(item)">
            <ion-col>
              <ion-label>Versão - {{item.version ? item.version : '-'}}</ion-label>
            </ion-col>
            <ion-item-divider></ion-item-divider>
          </ion-row>
        </ion-card-content>
      </ion-card>

      <ion-fab vertical="bottom" horizontal="end" slot="fixed">
        <ion-fab-button color="dark" @click="insertOrUpdatePayment()" style="font-size: 30px">+</ion-fab-button>
      </ion-fab>
    </ion-content>
  </ion-page>
</template>

<script>
import { 
  IonPage,
  IonLabel,
  IonHeader,
  IonToolbar,
  IonContent,
} from '@ionic/vue';

import Swal from 'sweetalert2'

import {
  getAllPayments,
  updatePayment,
  insertPayment
} from '../models/payments'

import {
  updateExpensePayment
} from '../models/expense'

import {
  geSystemData
} from '../models/system'

export default  {
  name: 'Tab3',
  components: {
    IonPage,
    IonLabel,
    IonHeader,
    IonToolbar,
    IonContent,
  },

  data:()=>{
    return {
      system: []
    }
  },

  async mounted(){
    this.loadAllData()
  },

  methods:{
    async loadAllData(){
      this.system = await geSystemData() 
    },

    async insertOrUpdatePayment(payment= null){
      Swal.fire({
        title: payment ? payment.name : 'Nova forma de pagamento',
        input: 'text',
        showCancelButton: true,
        cancelButtonText:'Cancelar',
        confirmButtonText: 'Salvar',
        confirmButtonColor: 'green',
        cancelButtonColor: 'blue',
        showCloseButton: true,
        inputValue: payment ? payment.name : '',
        preConfirm:(value)=>{
          if(value === ''){
            Swal.showValidationMessage('Informe o nome')
          }
        }
      }).then(async (values)=>{
        if(values.isConfirmed){
          if(payment){
            updateExpensePayment(payment.name, values.value)
            payment.name = values.value
            updatePayment(payment)
          }else{
            insertPayment({
              name: values.value
            })
          }

          this.loadAllData()
        }
      })
    },
  }
}
</script>
<style scoped>
  ion-card {
  padding: 20px;
  --ion-background-color: white;
  border-radius: 9px;
  padding-bottom: 40px;
}

ion-content {
  --ion-background-color: #252525;
}

ion-item-divider{
  margin-top: 0px;
  min-height: 1px!important;
}
</style>
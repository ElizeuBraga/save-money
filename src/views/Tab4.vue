<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="dark">
        <ion-row>
          <ion-col>
            <ion-label>Pessoas</ion-label>
          </ion-col>
        </ion-row>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <ion-card>
        <ion-card-title class="ion-text-center">
          Pessoas
        </ion-card-title>
        <ion-card-content>
          <ion-row  v-for="item in persons" :key="item" @click="insertOrUpdatePerson(item)">
            <ion-col>
              <ion-label>{{item.name ? item.name : '-'}}</ion-label>
            </ion-col>
            <ion-item-divider></ion-item-divider>
          </ion-row>
        </ion-card-content>
      </ion-card>

      <ion-fab vertical="bottom" horizontal="end" slot="fixed">
        <ion-fab-button color="dark" @click="insertOrUpdatePerson()" style="font-size: 30px">+</ion-fab-button>
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
  getAllPersons,
  updatePerson,
  insertPerson
} from '../models/persons'

import {
  updateReceivablePerson
} from '../models/receivables'

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
      persons: []
    }
  },

  async mounted(){
    this.persons = await getAllPersons() 
  },

  methods:{
    async insertOrUpdatePerson(person= null){
      Swal.fire({
        title: person ? person.name : 'Nova pessoa',
        input: 'text',
        showCancelButton: true,
        cancelButtonText:'Cancelar',
        confirmButtonText: 'Salvar',
        confirmButtonColor: 'green',
        cancelButtonColor: 'blue',
        showCloseButton: true,
        inputValue: person ? person.name : '',
        preConfirm:(value)=>{
          if(value === ''){
            Swal.showValidationMessage('Informe o nome')
          }
        }
      }).then(async (values)=>{
        if(values.isConfirmed){
          if(person){
            updateReceivablePerson(person.name, values.value)
            person.name = values.value
            updatePerson(person)
          }else{
            insertPerson({
              name: values.value
            })
          }
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
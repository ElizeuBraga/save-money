<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="dark">
        <ion-row>
          <ion-col>
            <ion-label>Regras</ion-label>
          </ion-col>
        </ion-row>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <ion-card>
        <ion-card-content>
          <ion-row  v-for="item in rules" :key="item" @click="insertOrUpdateRole(item)">
            <ion-col>
              <ion-label>{{item.name ? item.name : '-'}}</ion-label>
            </ion-col>
            <ion-item-divider></ion-item-divider>
          </ion-row>
          <ion-row  v-if="rules.length === 0">
            <ion-col class="ion-text-center">
              <ion-label color="danger" style="font-style: italic">Nenhum item</ion-label>
            </ion-col>
            <ion-item-divider></ion-item-divider>
          </ion-row>
        </ion-card-content>
      </ion-card>

      <ion-fab vertical="bottom" horizontal="end" slot="fixed">
        <ion-fab-button color="dark" @click="insertOrUpdateRole()" style="font-size: 30px">+</ion-fab-button>
      </ion-fab>
    </ion-content>
  </ion-page>
</template>

<script>
import { 
  IonPage,
  IonLabel,
  IonHeader,
  IonContent,
  IonToolbar,
} from '@ionic/vue';

import Swal from 'sweetalert2'

import {
  getAllRules,
  updateRole,
  insertRole
} from '../models/rules'

export default  {
  name: 'Tab3',
  components: {
    IonPage,
    IonLabel,
    IonHeader,
    IonContent,
    IonToolbar,
  },

  data:()=>{
    return {
      rules: []
    }
  },

  async mounted(){
    this.loadAllData()
  },

  methods:{
    async loadAllData(){
      this.rules = await getAllRules() 
    },

    async insertOrUpdateRole(rule= null){
      Swal.fire({
        title: rule ? rule.name : 'Nova regra',
        input: 'text',
        showCancelButton: true,
        cancelButtonText:'Cancelar',
        confirmButtonText: 'Salvar',
        confirmButtonColor: 'green',
        cancelButtonColor: 'blue',
        showCloseButton: true,
        inputValue: rule ? rule.name : '',
        preConfirm:(value)=>{
          if(value === ''){
            Swal.showValidationMessage('Informe o nome')
          }
        }
      }).then(async (values)=>{
        if(values.isConfirmed){
          if(rule){
            rule.name = values.value
            updateRole(rule)
          }else{
            insertRole({
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
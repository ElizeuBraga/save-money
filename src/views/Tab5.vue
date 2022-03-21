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
            <!-- <ion-col class="ion-text-right">
              <ion-label>{{formatMoney(item.price)}}</ion-label>
            </ion-col> -->
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
import { IonPage,IonHeader,IonToolbar,IonContent,IonLabel} from '@ionic/vue';
import { peopleOutline, arrowForwardOutline} from 'ionicons/icons';
import Swal from 'sweetalert2'
import {
  getAllRoles,
  updateRole,
  insertRole
} from '../models/rules'

import {
  // updateReceivablePerson
} from '../models/receivables'
// import TollbarComponent from '../components/TollbarComponent.vue'

export default  {
  name: 'Tab3',
  components: {IonPage,IonHeader,IonToolbar,IonContent,IonLabel},
  setup(){
    return{
      peopleOutline, arrowForwardOutline
    }
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
      this.rules = await getAllRoles() 
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
            // updateReceivablePerson(rule.name, values.value)
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
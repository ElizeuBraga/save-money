<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="dark">
        <ion-row>
          <ion-col>
            <ion-label>Categorias</ion-label>
          </ion-col>
        </ion-row>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <ion-card>
        <ion-card-content>
          <ion-row  v-for="item in categories" :key="item" @click="insertOrUpdateRole(item)">
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
import { 
  IonPage,
  IonLabel,
  IonHeader,
  IonToolbar,
  IonContent,
} from '@ionic/vue';

import Swal from 'sweetalert2'

import {
  getAllCategorys,
  updateCategory,
  insertCategory
} from '../models/categories'

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
      categories: []
    }
  },

  async mounted(){
    this.loadAllData()
  },

  methods:{
    async loadAllData(){
      this.categories = await getAllCategorys() 
    },

    async insertOrUpdateRole(category= null){
      Swal.fire({
        title: category ? category.name : 'Nova categoria',
        input: 'text',
        showCancelButton: true,
        cancelButtonText:'Cancelar',
        confirmButtonText: 'Salvar',
        confirmButtonColor: 'green',
        cancelButtonColor: 'blue',
        showCloseButton: true,
        inputValue: category ? category.name : '',
        preConfirm:(value)=>{
          if(value === ''){
            Swal.showValidationMessage('Informe o nome')
          }
        }
      }).then(async (values)=>{
        if(values.isConfirmed){
          if(category){
            category.name = values.value
            updateCategory(category)
          }else{
            insertCategory({
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
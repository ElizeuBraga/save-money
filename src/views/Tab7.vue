<template>
  <ion-page>
    <!-- Header -->
    <ion-header>
      <ion-toolbar color="dark">
        <tollbar-component tab="tab1"/>
      </ion-toolbar>
    </ion-header>
    <!-- Header -->

    <ion-content :fullscreen="true">
      <ion-card>
        <ion-card-title class="ion-text-center">
          Produtos
        </ion-card-title>
        <ion-card-content>
          <ion-row  v-for="item in expenses" :key="item" @click="undelete(item)">
            <ion-col>
              <ion-label>{{item.description ? item.description : '-'}}</ion-label>
            </ion-col>
            <ion-col class="ion-text-right">
              <ion-label>{{formatMoney(item.price)}}</ion-label>
            </ion-col>
            <ion-item-divider></ion-item-divider>
          </ion-row>
          <ion-row  v-if="expenses.length === 0">
            <ion-col class="ion-text-center">
              <ion-label color="danger" style="font-style: italic">Nenhum item</ion-label>
            </ion-col>
            <ion-item-divider></ion-item-divider>
          </ion-row>
        </ion-card-content>
      </ion-card>
    </ion-content>
  </ion-page>
</template>

<script>

import { 
  update, 
  getDeletedExpense
} from '../models/expense'

import Swal from 'sweetalert2'
import eventBus from '../eventBus'
  import { dates } from '../Helper'
import { IonItemDivider } from "@ionic/vue";
import TollbarComponent from '../components/TollbarComponent.vue'

export default {
  components:{
    IonItemDivider,
    TollbarComponent,
  },
  
  data: () => {
    return {
      expenses: [],
      totalExp: 0,
      yearMonth: '',
    }
  },

  async mounted() {
    this.yearMonth = dates(null, 'yyyy-mm', 1);
    eventBus().emitter.on("changeMonthSelect", async (e)=>{
      this.yearMonth = e
      await this.loadAllData()
    });
    await this.loadAllData()
  },

  methods: {
    undelete(item){
      Swal.fire({
        title: item.description,
        showCancelButton: true,
        cancelButtonText: 'Cancelar',
        confirmButtonText: 'Desfazer'
      }).then((values)=>{
        if(values.isConfirmed){
          item.deletedAt = null
          update(item)
        }

        this.loadAllData()
      })
    },

    async loadAllData(){
      this.expenses = await getDeletedExpense(this.yearMonth)

      eventBus().emitter.emit("loadAllData", true);
    }
  },
};
</script>
<style scoped>
.ion-progress-bar-infopercentage {
  height: 30px !important;
  /* margin: 5px !important; */
  border-radius: 15px !important;
}

ion-col{
  --padding-bottom: 0px
}

.progress-buffer-bar {
  margin: 5px !important;
}

ion-card {
  padding: 20px;
  --ion-background-color: white;
  border-radius: 9px;
  padding-bottom: 40px;
}

.head-list {
  font-family: "HeadTableFont" !important;
}

ion-content {
  --ion-background-color: #e9eff0;
}

@media screen and (min-width: 800px) {
  ion-card {
    width: 40%;
    font-size: 16px!important;
  }

  ion-grid{
    display: flex; 
    align-items: center; 
    justify-content: center;
  }
}

/* alerts */
.btn-cancel-alert{
  color: red!important;
}

.btn-save-alert{
  color: green!important;
}

.wallet{
  background: white;
  border-radius: 15px;
  padding: 3px 6px 3px 6px;
  font-size: 20px!important;
  font-weight: bold;
}

ion-item-divider{
  margin-top: -10px;
  min-height: 20px!important;
}

ion-content {
  --ion-background-color: #252525;
}

.swal2-popup {
  font-family: "LabelInputsFont" !important;
}

hr
{
    background-color: #eee;
    border: 0 none;
    color: #eee;
    height: 1px;
    margin: 0!important;
}
</style>
<template>
  <ion-row>
      <ion-col>
        <ion-select @ionChange="sendEvent($event)" :selected-text="defaultmonth" :value="defaultmonth" interface="popover">
          <ion-select-option v-for="m in months" :value="m" :key="m">{{m}}</ion-select-option>
        </ion-select>
      </ion-col>
      <ion-col size="6" class="ion-text-right">
        <ion-label class="wallet" :color="(total > 0) ? 'success' : 'danger'">{{formatMoney(total)}}</ion-label>
      </ion-col>
  </ion-row>
</template>


<script lang="ts">
// no-parsing-error

import {
  IonSelect, IonSelectOption, IonRow, IonCol, IonLabel
} from '@ionic/vue'

import eventBus from '../eventBus';

export default {
  components:{
    IonSelect, IonSelectOption,IonRow, IonCol, IonLabel
  },
  props: {
    total: Number,
    title: String,
    months: Array,
    defaultmonth: String,
  },

  mounted(){
    console.log('Tollbar montado')
  },

  methods:{
    sendEvent(e: any){
      eventBus().emitter.emit("changeMonthSelect", e.target.value);
    },
    formatMoney(amount: any) {
      if(amount){
        return parseFloat(amount).toLocaleString('pt-br',{style: 'currency', currency: 'BRL'});
      }else{
        return "R$ " + parseFloat("0.00").toFixed(2).replace(".", ",");
      }
    },
  }
}
</script>

<style scoped>
  .wallet{
    font-size: 20px!important;
    font-weight: bold;
  }
</style>
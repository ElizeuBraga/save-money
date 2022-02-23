<template>
  <ion-page>
    <ion-tabs>
      <!-- <ion-tab-bar color="dark" slot="bottom">  
        <ion-tab-button tab="tab1" href="/tabs/tab1">
          <ion-icon color="warning" :icon="arrowUp"/>
          <ion-label>Resumo</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="tab2" href="/tabs/tab2">
          <ion-icon color="danger" :icon="arrowUp"/>
          <ion-label>Saídas</ion-label>
        </ion-tab-button>
        
        <ion-tab-button tab="tab3" href="/tabs/tab3">
          <ion-icon color="success" :icon="arrowDown" />
          <ion-label>Entradas</ion-label>
        </ion-tab-button>
      </ion-tab-bar> -->
    </ion-tabs>
  </ion-page>
</template>

<script lang="ts">
import { IonTabs, IonPage } from '@ionic/vue';
import { trendingUp, add, menu, arrowUp, arrowDown} from 'ionicons/icons';
import eventBus from '../eventBus'

export default {
  name: 'Tabs',
  components: {IonTabs, IonPage },
  setup() {
    return {
      trendingUp,
      add,
      menu,
      arrowDown,
      arrowUp
    }
  },

  methods:{
    tabChanged(){
      eventBus().emitter.emit("tabChanged");
    },

    openModalNewExpense(){
      eventBus().emitter.emit("openModalNewExpense");
    }
  }

  // VUE_APP_API_URL=http://192.168.1.87:3000  
}
</script>
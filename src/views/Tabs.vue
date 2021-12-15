<template>
  <ion-page>
    <ion-tabs>
      <ion-tab-bar slot="bottom">
        <ion-tab-button @click="tabChanged()" tab="tab1" href="/tabs/tab1">
          <ion-icon :icon="trendingUp" />
          <ion-label>Home</ion-label>
        </ion-tab-button>
          
        <ion-tab-button tab="tab2" href="/tabs/tab2">
          <ion-icon color="red" :icon="arrowUp" />
          <ion-label>Saídas</ion-label>
        </ion-tab-button>
        
        <ion-tab-button tab="tab3" href="/tabs/tab3">
          <ion-icon color="green" :icon="arrowDown" />
          <ion-label>Entradas</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="tab4" href="/tabs/tab4">
          <ion-icon :icon="menu" />
          <ion-label>Menu</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  </ion-page>
</template>

<script lang="ts">
import { IonTabBar, IonTabButton, IonTabs, IonLabel, IonIcon, IonPage } from '@ionic/vue';
import { trendingUp, add, menu, arrowUp, arrowDown} from 'ionicons/icons';
import eventBus from '../eventBus'

export default {
  name: 'Tabs',
  components: { IonLabel, IonTabs, IonTabBar, IonTabButton, IonIcon, IonPage },
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
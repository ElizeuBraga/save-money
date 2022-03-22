<template>
  <ion-page>
    <ion-tabs>
      <ion-tab-bar color="dark" slot="bottom">  
        <ion-tab-button tab="tab1" href="/tabs/tab1">
          <ion-icon color="danger" :icon="arrowUp"/>
          <ion-label>Saidas</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="tab2" href="/tabs/tab2">
          <ion-icon color="success" :icon="arrowDown"/>
          <ion-label>Entradas</ion-label>
        </ion-tab-button>
        
        <ion-tab-button tab="tab3" href="/tabs/tab3">
          <ion-icon :icon="menu" />
          <ion-label>Menu</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  </ion-page>
</template>

<script>
import { 
  IonTabs, 
  IonPage, 
  IonIcon, 
  IonLabel ,
  IonTabBar, 
  IonTabButton, 
} from '@ionic/vue';

import {  
  menu, 
  arrowUp, 
  arrowDown,
} from 'ionicons/icons';

export default {
  name: 'Tabs',
  components: {
    IonTabs, 
    IonPage, 
    IonIcon, 
    IonLabel ,
    IonTabBar, 
    IonTabButton,
  },
  setup() {
    return {
      menu,
      arrowUp,
      arrowDown,
    }
  }
}
</script>
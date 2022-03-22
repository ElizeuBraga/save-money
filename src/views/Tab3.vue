<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="dark">
        <ion-row>
          <ion-col>
            <ion-label>Menu</ion-label>
          </ion-col>
        </ion-row>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Menu</ion-title>
        </ion-toolbar>
      </ion-header>
      
      <ion-list>
        <ion-item>
          <ion-icon color="primary" :icon="peopleOutline" />
          <ion-label style="margin-left:5px">
            <ion-router-link color="black" href="/tabs/tab4">Pessoas</ion-router-link>
          </ion-label>
        </ion-item>
        <ion-item>
          <ion-icon color="primary" :icon="peopleOutline" />
          <ion-label style="margin-left:5px">
            <ion-router-link color="black" href="/tabs/tab5">Regras</ion-router-link>
          </ion-label>
        </ion-item>
        <ion-item>
          <ion-icon color="primary" :icon="peopleOutline" />
          <ion-label style="margin-left:5px">
            <ion-router-link color="black" href="/tabs/tab6">Categorias</ion-router-link>
          </ion-label>
        </ion-item>
        <ion-item>
          <ion-icon color="primary" :icon="peopleOutline" />
          <ion-label style="margin-left:5px">
            <ion-router-link color="black" href="/tabs/tab7">Itens excluídos</ion-router-link>
          </ion-label>
        </ion-item>
      </ion-list>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { 
  IonItem, 
  IonList, 
  IonIcon,
  IonPage,
  IonTitle,
  IonLabel,
  IonHeader,
  IonToolbar,
  IonContent,
} from '@ionic/vue';

import { 
  peopleOutline, 
  arrowForwardOutline
} from 'ionicons/icons';

export default  {
  name: 'Tab3',
  components: {
    IonItem, 
    IonList, 
    IonIcon,
    IonPage,
    IonTitle,
    IonLabel,
    IonHeader,
    IonToolbar,
    IonContent,
  },
  setup(){
    return{
      peopleOutline, 
      arrowForwardOutline
    }
  }
}
</script>
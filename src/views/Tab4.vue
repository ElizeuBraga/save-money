<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <tollbar-component title="Menu"/>
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
            <ion-router-link color="black" href="/tabs/user">Alterar dados</ion-router-link>
          </ion-label>
        </ion-item>
        <ion-item>
          <ion-icon color="primary" :icon="peopleOutline" />
          <ion-label style="margin-left:5px">
            <ion-router-link color="black" href="/tabs/toReceiveFromThirdParties">Pessoas que me devem</ion-router-link>
          </ion-label>
        </ion-item>
        <ion-item>
          <ion-icon color="danger" :icon="arrowForwardOutline" />
          <ion-label style="margin-left:5px">
          <ion-router-link color="danger" href="/">Sair</ion-router-link>
          </ion-label>
        </ion-item>
      </ion-list>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { IonPage,IonHeader,IonToolbar,IonTitle,IonContent,IonLabel,IonItem, IonList, IonIcon} from '@ionic/vue';
import { peopleOutline, arrowForwardOutline} from 'ionicons/icons';
import TollbarComponent from '../components/TollbarComponent.vue'

export default  {
  name: 'Tab3',
  components: {IonPage,IonHeader,IonToolbar,IonTitle,IonContent,IonLabel,IonItem, IonList, IonIcon, TollbarComponent},
  setup(){
    return{
      peopleOutline, arrowForwardOutline
    }
  }
}
</script>
<style scoped>
  .wallet{
    background: white;
    border-radius: 15px;
    padding: 3px 6px 3px 6px;
    font-size: 20px!important;
    font-weight: bold;
  }
</style>
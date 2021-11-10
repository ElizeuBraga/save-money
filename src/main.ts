import App from './App.vue'
import router from './router';
import { createApp } from 'vue'

import { 
  IonCol,
  IonRow,
  IonGrid,
  IonCard,
  IonItem,
  IonPage, 
  IonLabel, 
  IonicVue, 
  IonTitle,
  IonInput,
  IonButton,
  IonHeader,
  IonToolbar,
  IonContent,
  IonCardTitle,
  IonCardHeader,
  IonProgressBar,
  IonCardContent,
  toastController,
} from '@ionic/vue';

/* Core CSS required for Ionic components to work properly */
import '@ionic/vue/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/vue/css/normalize.css';
import '@ionic/vue/css/structure.css';
import '@ionic/vue/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/vue/css/padding.css';
import '@ionic/vue/css/float-elements.css';
import '@ionic/vue/css/text-alignment.css';
import '@ionic/vue/css/text-transformation.css';
import '@ionic/vue/css/flex-utils.css';
import '@ionic/vue/css/display.css';

/* Theme variables */
import './theme/variables.css';

import './theme/custom.css';

import './registerServiceWorker';

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { doc, getFirestore, Timestamp} from "firebase/firestore";

const firebaseConfig = {
    apiKey: process.env.VUE_APP_FIRE_API_KEY,
    authDomain: process.env.VUE_APP_FIRE_AUTH_DOMAIN,
    databaseURL: process.env.VUE_APP_FIRE_DB_URL,
    projectId: process.env.VUE_APP_FIRE_PROJECT_ID,
    storageBucket: process.env.VUE_APP_FIRE_STORAGE_BUCKET,
    messagingSenderId: process.env.VUE_APP_FIRE_MESSAGING_SENDER_ID,
    appId: process.env.VUE_APP_FIRE_APP_ID,
    measurementId: process.env.VUE_APP_FIRE_MEASUREMENT_ID
};

/* eslint-disable */ 

initializeApp(firebaseConfig);

const app = createApp(App).use(IonicVue).use(router)

app.mixin({
  components:{
    IonCol,
    IonRow,
    IonGrid,
    IonCard,
    IonItem,
    IonPage, 
    IonLabel, 
    IonTitle,
    IonInput,
    IonButton,
    IonHeader,
    IonToolbar,
    IonContent,
    IonCardTitle,
    IonCardHeader,
    IonProgressBar,
    IonCardContent,
  },
  data:()=>{
    return{
      actualize: false,
      milliseconds: Timestamp.now().toMillis()
    }
  },

  methods:{
    async showToast(color: string, message: string) {
      const toast = await toastController.create({
        message: message,
        duration: 2000,
        position: "top",
        color: color,
      });
      return toast.present();
    },

    formatMoney(amount: any) {
      if(amount){
        return amount.toLocaleString('pt-br',{style: 'currency', currency: 'BRL'});
      }else{
        return "R$ " + parseFloat("0.00").toFixed(2).replace(".", ",");
      }
    },

    formatDate(date: any){
      const day = new Date(date).getDate();
      if(!date || isNaN(day)){
        return '-'
      }
      
      let dateFormated = "dia " + day;
      const today = new Date().getDate();
      if(today == day){
        dateFormated = "Hoje";
      }
      if((today-1) == day){
        dateFormated = "Ontem";
      }
      return dateFormated;
    },

    async getUid(){
      const auth = getAuth()
      return auth.currentUser!.uid;
    }
  }
})
  
router.isReady().then(() => {
  app.mount('#app');
});
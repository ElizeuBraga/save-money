import { createApp } from 'vue'
import { IonicVue } from '@ionic/vue';
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: process.env.VUE_APP_FIRE_API_KEY,
  authDomain: process.env.VUE_APP_FIRE_AUTH_DOMAIN,
  projectId: process.env.VUE_APP_FIRE_PROJECT_ID,
  storageBucket: process.env.VUE_APP_FIRE_STORAGE_BUCKET,
  messagingSenderId: process.env.VUE_APP_FIRE_MESSAGING_SENDER_ID,
  appId: process.env.VUE_APP_FIRE_APP_ID,
  measurementId: process.env.VUE_APP_FIRE_MEASUREMENT_ID
};

initializeApp(firebaseConfig);

import App from './App.vue'
import router from './router';


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

const app = createApp(App).use(IonicVue).use(router)

app.mixin({
  methods:{
    formatMoney(amount: any) {
      if(amount){
        return parseFloat(amount).toLocaleString('pt-br',{style: 'currency', currency: 'BRL'});
      }else{
        return "R$ " + parseFloat("0.00").toFixed(2).replace(".", ",");
      }
    }
  }
})
  
router.isReady().then(() => {
  app.mount('#app');
});
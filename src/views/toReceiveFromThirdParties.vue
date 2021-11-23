<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>Pessoas que me devem</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Renda mensal</ion-title>
        </ion-toolbar>
      </ion-header>

      <ion-grid>
        <ion-card>
        <!-- Month -->
        <ion-row>
          <ion-col>
            <ion-item>
              <ion-label position="floating">Nome:</ion-label>
              <ion-input v-model="name"></ion-input>
            </ion-item>
          </ion-col>
        </ion-row>
        <!-- Month -->

        <!-- Valor -->
        <ion-row>
          <ion-col>
            <ion-item>
              <ion-label position="floating">Valor:</ion-label>
              <ion-input v-model="price"></ion-input>
            </ion-item>
          </ion-col>
        </ion-row>
        <!-- Valor -->

        <!-- Valor -->
        <ion-row>
          <ion-col>
            <ion-item>
              <ion-label position="floating">Quantidade de parcelas:</ion-label>
              <ion-input v-model="repeat"></ion-input>
            </ion-item>
          </ion-col>
        </ion-row>
        <!-- Valor -->

        <!-- Valor -->
        <ion-row>
          <ion-col>
            <ion-item>
              <ion-label position="floating">Data de vencimento:</ion-label>
              <ion-input type="date" v-model="expiration"></ion-input>
            </ion-item>
          </ion-col>
        </ion-row>
        <!-- Valor -->

        <!-- Salvar -->
        <ion-row>
          <ion-col>
            <ion-button expand="block" @click="save">Salvar</ion-button>
          </ion-col>
        </ion-row>
        <!-- Salvar -->
        </ion-card>

        <!-- List of Text Items -->
        <ion-card>
        <ion-row>
          <!-- <ion-col>
            <ion-text color="dark" style="text-align:center;" >
              <h5>Inseridos recentes</h5>
            </ion-text>
        </ion-col>
        </ion-row>
        <ion-row>
          <ion-col>
            <ion-list v-for="rfto in receiveFromThirtyParties" :key="rfto.id">
              <ion-item>
                <ion-label>{{ rfto.name }}</ion-label>
                <ion-label>{{ rfto.price }}</ion-label>
              </ion-item>
            </ion-list>
          </ion-col> -->

          <ion-col size="12">

          <ion-slides @ionSlideDidChange="slideChanged($event)">
            <ion-slide v-for="m in months" :key="m">
              <span v-if="initMonth != ''">{{initMonth}}</span>
              <span v-else>{{m}}</span>
            </ion-slide>
          </ion-slides>
          </ion-col>
          <ion-col>
            <ion-list v-for="rfto in receiveFromThirtyParties" :key="rfto.id">
              <ion-item>
                <ion-label>{{ rfto.name }}</ion-label>
                <ion-label>{{ rfto.price }}</ion-label>
              </ion-item>
            </ion-list>
          </ion-col>
        </ion-row>
        <!-- List of Text Items -->
        </ion-card>
      </ion-grid>
    </ion-content>
  </ion-page>
</template>

<script>
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonInput,
  IonSlides,
  IonSlide
} from "@ionic/vue";
import { getFirestore, doc, addDoc, collection, Timestamp, onSnapshot} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { dates, addZero, months } from "../Helper";
import eventBus from '../eventBus'

export default {
  name: "Tab2",
  components: {
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonPage,
    IonInput,
    IonSlides,
    IonSlide
  },
  data: () => {
    return {
      name: '',
      price: '',
      repeat: '',
      expiration: '',
      receiveFromThirtyParties:[{name: 'Elizeu'}],

      initMonth: '', 
      months: months(),

      milliseconds: Timestamp.now().toMillis(),
      year: String(new Date(Timestamp.now().toMillis()).getFullYear()),
      month: String(new Date(Timestamp.now().toMillis()).getMonth() + 2),
      
      userRef: doc(getFirestore(), "users", getAuth().currentUser.uid),
      yearRef: null,
      monthRef: null,
      toReceiveRef: null
    };
  },
  async mounted() {
    await this.loadData(this.month)
  },
  methods: {
    slideChanged(e){
      e.target.getActiveIndex().then(i => {
        this.loadData(i + 1)
      });
    },

    async loadData(month){
      let total = 0;
      const toReceiveRef = collection(this.userRef, this.year, addZero(month), 'toReceiveFromThirdParties')
      onSnapshot(toReceiveRef, (expSnapshot) => {
        console.log(expSnapshot)
        this.receiveFromThirtyParties = []
        expSnapshot.docs.forEach((doc)=>{
          const e = doc.data()
          e.id = doc.id
          total += parseFloat(e.price)
          this.receiveFromThirtyParties.push(e)
        })

        this.sendToHome(total)

        this.receiveFromThirtyParties.sort((a, b) => {
          return  b.price - a.price;
        })
      })
    },
    
    async save() {
      let year = dates(this.expiration).year
      let month = dates(this.expiration).month
      const day = dates(this.expiration).day
      
      let milliseconds = new Date(this.expiration).getTime()

      let yearRef = collection(this.userRef, year)
      let monthRef = doc(yearRef, month)
      let toReceiveRef = collection(monthRef, 'toReceiveFromThirdParties')


      if(this.validateForm()){
        addDoc(toReceiveRef, {name: this.name, price: parseFloat(this.price), expiration: milliseconds})
        let repeat = parseInt(this.repeat)

        while (repeat > 1) {
          if(parseInt(month) == 12){
            year = String(parseInt(year) + 1)
            month = '01'
            yearRef = collection(this.userRef, year)
            monthRef = doc(yearRef, month)
          }else{
            month = addZero(parseInt(month) + 1)
            monthRef = doc(yearRef, month)
          }

          const fullDate = year+'-'+month+'-'+day
          milliseconds = new Date(fullDate).getTime()

          toReceiveRef = collection(monthRef, 'toReceiveFromThirdParties')
          addDoc(toReceiveRef, {name: this.name, price: parseFloat(this.price), expiration: milliseconds})
          repeat --
        }

        console.log()

        this.showToast('success', 'Inserido com sucesso!')

        this.resetDataDefault()
        this.clearForm()
      }
    },

    resetDataDefault(){
        this.milliseconds = Timestamp.now().toMillis()
        this.year = String(new Date(Timestamp.now().toMillis()).getFullYear())
        this.month = String(new Date(Timestamp.now().toMillis()).getMonth()+1)
    },

    sendToHome(total){
      eventBus().emitter.emit("totalToReceive", total);
    },

    validateForm() {
      if (this.name == "") {
        this.showToast("danger", "Insira o nome.");
        return false;
      }

      if (this.price == "") {
        this.showToast("danger", "Preencha o valor.");
        return false;
      }

      if (this.expiration == "") {
        this.showToast("danger", "Informe a data de vencimento.");
        return false;
      }

      if (this.repeat == "") {
        this.showToast("danger", "Informe a quantidade de parcelas.");
        return false;
      }

      return true;
    },

    clearForm() {
      this.name = ''
      this.price = ''
      this.price = '0'
    }
  },
};
</script>

<style scoped>
  ion-content{
    --ion-background-color:#e9eff0;
  }

  ion-item{
    /* font-size: 12px!important; */
    --ion-background-color:white;
  }

  ion-card{
    --ion-background-color:white;
  }

  ion-label{
    font-family: 'LabelInputsFont'!important;
  }

  .head-list{
    font-family: 'HeadTableFont'!important;
  }
</style>
<template>
  <ion-page id="ionPage">
    <!-- Header -->
    <ion-header>
      <ion-toolbar color="primary">
        <ion-row>
          <ion-col>
            <ion-title>Home</ion-title>
          </ion-col>
          <ion-col size="6" class="ion-text-right">
            <ion-label class="wallet" :color="((monthlyIncome - amountExpense) > 0) ? 'success' : 'danger'">{{formatMoney(monthlyIncome - amountExpense)}}</ion-label>
          </ion-col>
        </ion-row>
      </ion-toolbar>
    </ion-header>
    <!-- Header -->


    <ion-content :fullscreen="true">
      <ion-row>
      <!--Resume card-->
        <ion-grid>
          <ion-card>
            <ion-progress-bar v-if="!loaded" type="indeterminate"></ion-progress-bar>
            <ion-card-title class="ion-text-center">
              Resumo
            </ion-card-title>
            <ion-card-content>
              <ion-row style="margin-bottom: 12px">
                <ion-progress-bar
                  :color="colorForBarExpenses()"
                  :value="((amountExpense * 100)/ monthlyIncome)/100"
                  class="ion-progress-bar-infopercentage"
                ></ion-progress-bar>

                <ion-col class="ion-no-padding ion-text-left">
                  <ion-label class="label-italic">
                      Proventos:<b>{{formatMoney(monthlyIncome)}}</b>
                  </ion-label>
                </ion-col>
                <ion-col class="ion-no-padding ion-text-right">
                  <ion-label class="label-italic">Gastos:<b>{{formatMoney(amountExpense)}}</b></ion-label>
                </ion-col>
              </ion-row>

              <ion-row>
                <ion-progress-bar
                  :color="colorForBarEmergencyGoal()"
                  :value="((emergencyReserveReached * 100) / emergencyReserveGoal)/100"
                  class="ion-progress-bar-infopercentage"
                ></ion-progress-bar>

                <ion-col class="ion-no-padding ion-text-left">
                  <ion-label class="label-italic" @click="alertUpdateEmergencyReserveGoal()">Meta:<b>{{formatMoney(emergencyReserveGoal)}}</b></ion-label>
                </ion-col>
                <ion-col class="ion-no-padding ion-text-right">
                  <ion-label class="label-italic" @click="alertUpdateEmergencyReserveReached()">Conquista:<b>{{formatMoney(emergencyReserveReached)}}</b></ion-label>
                </ion-col>
                <ion-col class="label-italic ion-text-center" size="12" v-if="amountToConquist > 0">
                  {{formatMoney(amountToConquist)}} para conquistar o {{colorForBarEmergencyGoal() == 'danger' ? 'vermelho' : colorForBarEmergencyGoal() == 'yellow' ? 'Amarelo' : 'verde'}}
                </ion-col>
                <ion-col class="label-italic ion-text-center" size="12" v-else>
                  Parabéns pela conquista {{name}}!
                </ion-col>
              </ion-row>
            </ion-card-content>
          </ion-card>
        </ion-grid>
        <!--Resume card-->

        <ion-col size="12">
          <ion-grid>
            <ion-card>
                <ion-slides :options="slideOpts" @ionSlideDidChange="slideChanged($event)">
                  <ion-slide v-for="m in months" :key="m">
                    <span style="background: #3880ff; color: white; border-radius: 20px; padding: 0px 6px 0px 6px">{{m}}</span>
                  </ion-slide>
                </ion-slides>

              <ion-card-content align="center">
                <ion-list v-for="e in expenses" :key="e.id">
                  <ion-item @click="presentActionSheet(e)">
                    <ion-img style="height: 30px; width: 30px; margin-right: 5px" :src="e.img"></ion-img>
                    <ion-label class="ion-text-left">{{e.description}}</ion-label>
                    <ion-label class="ion-text-right">{{"R$ " + parseFloat(e.price).toFixed(2).replace(".", ",")}}</ion-label>
                  </ion-item>
                </ion-list>

                <ion-list v-if="expenses.length == 0">
                  <ion-item>
                    <ion-label class="ion-text-center label-italic" color="danger">Nenhum item encontrado</ion-label>
                  </ion-item>
                </ion-list>
                <ion-row>
                  <ion-col class="ion-text-left">
                    <b><ion-label>Total</ion-label></b>
                  </ion-col>
                  <ion-col class="ion-text-right">
                    <b><ion-label>{{formatMoney(amountExpense)}}</ion-label></b>
                  </ion-col>
                </ion-row>
              </ion-card-content>
              <!-- List of Text Items -->
            </ion-card>
          </ion-grid>
        </ion-col>
      </ion-row>
    </ion-content>
  </ion-page>
</template>

<script>

import eventBus from '../eventBus'
import { addZero, getMonths, getNextMonthInt, getNextMonthIndex, userRef, monthRef, expRef, getActualYear} from '../Helper'
import { doc, updateDoc, onSnapshot, addDoc, collection, deleteDoc, Timestamp, arrayUnion } from "firebase/firestore";
import { alertController, IonList, actionSheetController, IonSlides, IonSlide, IonImg} from "@ionic/vue";

export default {
  components:{ IonList, IonSlides, IonSlide, IonImg},
  data: () => {
    return {
      slideOpts:{
        initialSlide: getNextMonthIndex(),
        speed: 400
      },
      name: '',
      months: getMonths(),
      loaded: false,
      emergencyReserveGoal: 0,
      emergencyReserveReached: 0,
      amountExpense: 0,
      monthlyIncome: 0,
      expenses: [],
      toReceiveFromThirdParties: [],

      milliseconds: Timestamp.now().toMillis(),
      
      userRef: null,
      monthRef: null,
      expensesRef: null
    }
  },

  async mounted() {
    this.mountReferences()

    const month = getNextMonthInt();
    let year = getActualYear()

    if(month === 1){
      year = getActualYear() + 1
    }

    this.loadExpenses(year, month)
    eventBus().emitter.on("tabChanged", () => {
        this.loaded = false
        setTimeout(async()=>{
          this.loadExpenses(year, month)
        }, 3000)
    });

    eventBus().emitter.on("openModalNewExpense", () => {
      this.alertNewExpense()
    });
  },
  methods: {
    slideChanged(e){
      e.target.getActiveIndex().then(i => {
        const month = i+1;
        let year = getActualYear()

        if(getNextMonthInt() === 1){
          year = getActualYear() + 1
        }

        this.loadExpenses(year, month)
        this.loadData(year, month)
      });
    },

    async mountReferences(){
      this.userRef = userRef()
      this.monthRef = monthRef()
      this.expensesRef = expRef()
    },

    colorForBarExpenses(){
      const result = ((this.amountExpense * 100) / this.monthlyIncome) 
      if(result < 33){
        return 'success'
      }else if(result > 66){
        return 'danger' 
      }else{
        return 'warning'
      }
    },

    colorForBarEmergencyGoal(){
      const result = ((this.emergencyReserveReached * 100) / this.emergencyReserveGoal)
      const amountForColor = this.emergencyReserveGoal / 3;

      if(result < 33.333){
        const amountToConquistRed = amountForColor - this.emergencyReserveReached
        this.amountToConquist = amountToConquistRed
        return 'danger'
      }else if(result > 66.666){
        const amountToConquistRed = (amountForColor * 3) - this.emergencyReserveReached
        this.amountToConquist = amountToConquistRed
        return 'success' 
      }else{
        const amountToConquistRed = (amountForColor * 2) - this.emergencyReserveReached
        this.amountToConquist = amountToConquistRed
        return 'warning'
      }
    },

    sumExpenses(){
      this.amountExpense = 0
      this.expenses.forEach((e)=>{
        this.amountExpense += e.price
      })
    },

    async loadUserData(){
      onSnapshot(userRef(), (userSnapshot) => {
        this.emergencyReserveGoal = userSnapshot.data().emergencyReserveGoal
        this.emergencyReserveReached = userSnapshot.data().emergencyReserveReached
      })
    },

    async loadExpenses(year, month){
      this.mountReferences()
      onSnapshot(expRef(year, month), (expSnapshot) => {
        this.expenses = []
        expSnapshot.docs.forEach((doc)=>{
          const e = doc.data()
          e.id = doc.id
          this.expenses.push(e)
        })

        this.sumExpenses()

        this.expenses.sort((a, b) => {
          return  b.price - a.price;
        })
      })
      this.loaded = true
    },

    async alertListToReceiveFromThirdParties(){
      this.toReceiveFromThirdParties.sort((a, b) => {
          return  b.price - a.price;
      })

      let html = '<ul>';
      this.toReceiveFromThirdParties.forEach((element)=>{
        html +=`<li>${element.name} - ${this.formatMoney(element.price)}</li>`
      })

      html += '</ul>';

      const alert = await alertController
        .create({
          header: 'Lista proventos',
          message: html,
          buttons: [
            {
              handler:()=>{
                const teste = document.getElementById('name').value
                console.log(teste)
              },
              text: 'Fechar'
            }
          ],
        })
      
      await alert.present()
    },

    async alertToReceiveFromThirdParties(){
      const alert = await alertController
        .create({
          header: 'Alterar renda mensal',
          inputs: [
            {
              name: 'name',
              id: 'name',
              value: '',
              placeholder: 'Nome do devedor',
            },
            {
              name: 'price',
              id: 'price',
              value: '',
              placeholder: 'Digite o valor',
              type: 'number'
            }
          ],
          buttons: [
            {
              text: 'Salvar',
              handler:(values)=>{
                this.newToReceiveFromThirdParties(values)
              }
            },
            {
              text: 'Cancelar'
            }
          ],
        })
      
      await alert.present()
    },

    newToReceiveFromThirdParties(values){
      updateDoc(this.monthRef, {
        toReceiveFromThirdParties : arrayUnion({name: values.name, price: parseFloat(values.price)})
      })

      this.showToast('success', this.formatMoney(parseFloat(values.price)) + ' para ' + values.name + ' inserido')
    },

    async alertUpdateEmergencyReserveGoal() {
        const alert = await alertController
        .create({
          header: 'Alterar meta',
          inputs: [
            {
              name: 'price',
              id: 'price',
              value: this.emergencyReserveGoal,
              placeholder: 'Digite o novo valor',
              type: 'number'
            }
          ],
          buttons: [
            {
              text: 'Salvar',
              handler:(values)=>{
                this.updateEmergencyReserveGoal(values.price)
              }
            },
            {
              text: 'Cancelar'
            }
          ],
        })
      
      await alert.present()
    },

    updateEmergencyReserveGoal(price){
      updateDoc(this.userRef, {
        emergencyReserveGoal : parseFloat(price)
      })

      this.showToast('success', 'Meta alterada!')
    },

    async alertUpdateEmergencyReserveReached() {
        const alert = await alertController
        .create({
          header: 'Alterar conquista',
          inputs: [
            {
              name: 'price',
              id: 'price',
              value: this.emergencyReserveReached,
              placeholder: 'Digite o novo valor',
              type: 'number'
            }
          ],
          buttons: [
            {
              text: 'Salvar',
              handler: (values) => {
                this.updateEmergencyReserveReached(values.price);
              },
            },
            {
              text: 'Cancelar'
            },
          ],
        })
      
      await alert.present();
    },

    async updateEmergencyReserveReached(price){
      await updateDoc(this.userRef, {
        emergencyReserveReached : parseFloat(price)
      })

      this.showToast('success', 'Conquista alterada com sucesso!')
    },

    async alertNewExpense(){
      const alert = await alertController
        .create({
          cssClass: 'my-custom-class',
          header: 'Novo item',
          inputs: [
            {
              label: 'Descrição',
              name: 'description',
              id: 'description',
              value: '',
              placeholder: 'Digite uma descrição',
            },
            {
              label: 'Valor',
              name: 'price',
              id: 'price',
              value: '',
              placeholder: 'Digite o valor',
              type: 'number'
            },
            {
              label: 'Data de vencimento',
              name: 'expiration',
              id: 'expiration',
              value: getActualYear() + '-' + addZero(getNextMonthInt()) +'-10',
              type: 'date'
            },
            {
              label: 'Repetir',
              name: 'repeat',
              id: 'repeat',
              value: '',
              placeholder: 'Repetir?',
              type: 'number',
              max: 60
            }
          ],
          buttons: [
            {
              text: 'Salvar',
              handler: (values) => {
                this.saveNewExpense(values);
              },
            },
            {
              text: 'Cancelar'
            }
          ],
        });

      const description = document.getElementById('description')
      const price = document.getElementById('price')
      const repeat = document.getElementById('repeat')

      description.setAttribute('autocomplete', 'off')
      price.setAttribute('autocomplete', 'off')
      repeat.setAttribute('autocomplete', 'off')

      return alert.present();
    },

    async saveNewExpense(expense){
      let img = '../img/imgs/'+expense.description.toLowerCase()+'.png'
  
      if(!await this.imageExists(img)){
        img = '../img/imgs/default.png'
      }

      // if repeat
      let repeat = parseInt(expense.repeat)

    
      const day = new Date(expense.expiration).getUTCDate()
      let month = new Date(expense.expiration).getMonth() + 1
      let year = new Date(expense.expiration).getFullYear()

      let expiration = new Date(`${year}-${addZero(month)}-${day}`).getTime()
      addDoc(expRef(year, month), {description: expense.description, price: parseFloat(expense.price), img: img, expiration: expiration, createdAt: this.milliseconds})

      
      while (repeat > 1) {
        if(parseInt(month) == 12){
          year = String(parseInt(year) + 1)
          month = 1
        }else{
          month = String(parseInt(month) + 1)
        }
        
        expiration = new Date(`${year}-${addZero(month)}-${day}`).getTime()
        addDoc(expRef(year, month), {description: expense.description, price: parseFloat(expense.price), img: img, expiration: expiration, createdAt: this.milliseconds})
        repeat --
      }

      this.showToast('success', 'Novo item adicionado!')
    },

    async alertUpdateExpense(expense){
      const alert = await alertController
        .create({
          cssClass: 'my-custom-class',
          header: 'Editar item',
          inputs: [
            {
              name: 'id',
              id: 'id',
              value: expense.id,
              type: 'hidden'
            },
            {
              name: 'description',
              id: 'description',
              value: expense.description,
              placeholder: 'Digite uma descrição',
            },
            {
              name: 'price',
              id: 'price',
              value: expense.price,
              placeholder: 'Digite o valor',
              type: 'number'
            },
            {
              label: 'Data de vencimento',
              name: 'expiration',
              id: 'expiration',
              value: this.formatDateYYYMMMDDD(expense.expiration),
              type: 'date'
            },
          ],
          buttons: [
            {
              text: 'Salvar',
              handler: (values) => {
                this.updateExpense(values);
              },
            },
            {
              text: 'Cancelar'
            }
          ],
        });
      return alert.present();
    },

    formatDateYYYMMMDDD(date) {
      const d = new Date(date)
        let month = '' + (d.getMonth() + 1)
        let day = '' + d.getDate()
        const year = d.getFullYear()

        if (month.length < 2) 
            month = '0' + month;
        if (day.length < 2) 
            day = '0' + day;
        
        return [year, month, day].join('-');
    },

    async updateExpense(expense){
      let img = '../img/imgs/'+expense.description.toLowerCase()+'.png'

      if(!await this.imageExists(img)){
        img = '../img/imgs/default.png'
      }

      const day = new Date(expense.expiration).getUTCDate()
      const month = new Date(expense.expiration).getMonth() + 1
      const year = new Date(expense.expiration).getFullYear()

      const expiration = new Date(`${year}-${month}-${day}`).getTime()

      updateDoc(doc(expRef(month, year), expense.id), {description: expense.description, price: parseFloat(expense.price), img: img, expiration: expiration, createdAt: this.milliseconds})

      this.showToast('success', 'Item editado com sucesso!')
    },

    async imageExists(imgUrl) {
      if (!imgUrl) {
          return false;
      }
      return new Promise(res => {
          const image = new Image();
          image.onload = () => res(true);
          image.onerror = () => res(false);
          image.src = imgUrl;
      });
    },

    deleteExpense(expense){
      deleteDoc(doc(this.expensesRef, expense.id));
      this.showToast('success', 'Item excluído!')
    },

    async presentActionSheet(expense) {
      const actionSheet = await actionSheetController
        .create({
          header: 'Opções',
          cssClass: 'my-custom-class',
          buttons: [
            {
              text: 'Editar',
              handler: () => {
                this.alertUpdateExpense(expense)
              },
            },
            {
              text: 'Excluir',
              handler: () => {
                this.deleteExpense(expense)
              },
            }
          ],
        });
      await actionSheet.present();
    },

    async loadData(year, month){
      this.monthlyIncome = 0
      const toReceiveRef = collection(monthRef(year, month), 'toReceiveFromThirdParties')
      onSnapshot(toReceiveRef, (toReceiveSnapshot) => {
        toReceiveSnapshot.docs.forEach((doc)=>{
          const e = doc.data()
          this.monthlyIncome += parseFloat(e.price)
        })
      })
    },
  },

  computed:{
    returnTotalFromThirdParties(){
      let total = 0
      this.toReceiveFromThirdParties.forEach(element => {
        total += element.price
      });

      return total;
    },
  }
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
</style>
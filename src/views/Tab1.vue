<template>
  <ion-page>
    <!-- Header -->
    <ion-header>
      <ion-toolbar color="primary">
        <ion-row>
          <ion-col>
            <ion-title>Home</ion-title>
          </ion-col>
          <ion-col size="6" class="ion-text-right">
            <ion-label class="wallet" :color="((totalToreceive - amountExpense) > 0) ? 'success' : 'danger'">{{formatMoney(totalToreceive - amountExpense)}}</ion-label>
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
                  :value="((amountExpense * 100)/totalToreceive)/100"
                  class="ion-progress-bar-infopercentage"
                ></ion-progress-bar>

                <ion-col class="ion-no-padding ion-text-left">
                  <ion-label class="label-italic">
                      Proventos:<b>{{formatMoney(totalToreceive)}}</b>
                  </ion-label>
                </ion-col>
                <ion-col class="ion-no-padding ion-text-right">
                  <ion-label class="label-italic">Gastos:<b>{{formatMoney(amountExpense)}}</b></ion-label>
                </ion-col>
              </ion-row>

              <ion-row>
                <ion-progress-bar
                  :color="colorForBarEmergencyGoal()"
                  :value="calcBarEmergencyGoal"
                  class="ion-progress-bar-infopercentage"
                ></ion-progress-bar>

                <ion-col class="ion-no-padding ion-text-left">
                  <ion-label class="label-italic" @click="alertUpdateEmergencyReserveGoal()">Meta:<b>{{formatMoney(emergencyReserveGoal)}}</b></ion-label><br>
                  <ion-label class="label-italic" @click="alertUpdateEmergencyReserveReached()">Faltam:<b>{{formatMoney(emergencyGoalMissing)}}</b></ion-label>
                </ion-col>
                <ion-col class="ion-no-padding ion-text-right">
                  <ion-label class="label-italic" @click="alertUpdateEmergencyReserveReached()">Conquista:<b>{{formatMoney(emergencyReserveReached)}}</b></ion-label><br>
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
import { addZero, getMonths, getNextMonthInt, getNextMonthIndex, userRef, expRef, getActualYear, toReceiveRef, formatInputReal, formatInputRealV3} from '../Helper'
import { doc, updateDoc, onSnapshot, addDoc, deleteDoc, Timestamp, arrayUnion } from "firebase/firestore";
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
      expenses: [],
      toReceives:[],

      milliseconds: Timestamp.now().toMillis(),
      
      userRef: null,
      monthRef: null,
      expensesRef: null,

      allData: null
    }
  },

  async mounted() {
    this.loadAllData()

    setTimeout(() => {
      if(this.emergencyReserveGoal === 0){
        this.alertUpdateEmergencyReserveGoal()
      }
    }, 2000);

    eventBus().emitter.on("openModalNewExpense", () => {
      this.alertNewExpense()
    });
  },
  methods: {
    loadAllData(year = null, month = null){
      if(!year && !month){
        month = getNextMonthInt();
        year = getActualYear()
  
        if(month === 1){
          year = getActualYear() + 1
        }
      }

      // load user data
      onSnapshot(userRef(), (userSnapshot) => {
        this.emergencyReserveReached = userSnapshot.data().emergencyReserveReached
        this.emergencyReserveGoal = userSnapshot.data().emergencyReserveGoal
      })

      // load expenses data
      onSnapshot(expRef(year, month), (expSnapshot) => {
        this.expenses = []
        expSnapshot.docs.forEach((doc)=>{
          const e = doc.data()
          e.id = doc.id
          this.expenses.push(e)
        })

        this.expenses.sort((a, b) => {
          return  b.price - a.price;
        })
      })

      // load toReceiveData
      onSnapshot(toReceiveRef(year, month), (toReceiveSnapShot) => {
        this.toReceives = []
        toReceiveSnapShot.docs.forEach((doc)=>{
          const e = doc.data()
          e.id = doc.id
          this.toReceives.push(e)
        })
      })

      this.loaded = true
    },

    slideChanged(e){
      e.target.getActiveIndex().then(i => {
        const month = i+1;
        let year = getActualYear()

        if(getNextMonthInt() === 1){
          year = getActualYear() + 1
        }

        this.loadAllData(year, month)
      });
    },

    colorForBarExpenses(){
      const result = ((this.amountExpense * 100) / this.totalToreceive) 
      if(result < 33){
        return 'success'
      }else if(result > 66){
        return 'danger' 
      }else{
        return 'warning'
      }
    },

    colorForBarEmergencyGoal(){
      if(this.emergencyReserveReached === 0 && this.emergencyReserveGoal === 0){
        return 'danger'
      }else if(this.emergencyReserveGoal === 0 && this.emergencyReserveReached > 0){
        return 'success'
      }else if(this.emergencyReserveReached === 0 && this.emergencyReserveGoal > 0){
        return 'danger'
      }else{
        const result = ((this.emergencyReserveReached * 100) / this.emergencyReserveGoal)
        if(result > 66.6){
          return 'success'
        }else if(result < 33.33){
          return 'danger' 
        }else{
          return 'warning'
        }
      }
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
          message: this.emergencyReserveGoal === 0 ? 'Informe uma meta para reserva de emergência' : 'Altere suma meta',
          inputs: [
            {
              name: 'price',
              id: 'price',
              value: formatInputRealV3(this.emergencyReserveGoal),
              placeholder: 'Digite o novo valor',
              type: 'number',
              step:".01"
            }
          ],
          buttons: [
            {
              text: 'Salvar',
              handler:(values)=>{
                console.log(values.price)
                this.updateEmergencyReserveGoal(formatInputReal(values.price))
              }
            },
            {
              text: 'Cancelar'
            }
          ],
        })

      await alert.present()
      const price = document.getElementById('price')
      price.focus()
      price.addEventListener("keyup", function() {
        console.log(price.value)
        price.value = formatInputReal(price.value)
      });
    },

    updateEmergencyReserveGoal(price){
      updateDoc(userRef(), {
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
              value: formatInputRealV3(this.emergencyReserveReached),
              placeholder: 'Digite o novo valor',
              type: 'number'
            }
          ],
          buttons: [
            {
              text: 'Salvar',
              handler: (values) => {
                this.updateEmergencyReserveReached(formatInputReal(values.price));
              },
            },
            {
              text: 'Cancelar'
            },
          ],
        })
      
      await alert.present();

      const price = document.getElementById('price')
      price.focus()
      price.addEventListener("keyup", function() {
        console.log(price.value)
        price.value = formatInputReal(price.value)
      });
    },

    async updateEmergencyReserveReached(price){
      await updateDoc(userRef(), {
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

      updateDoc(doc(expRef(year, month), expense.id), {description: expense.description, price: parseFloat(expense.price), img: img, expiration: expiration, createdAt: this.milliseconds})

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
    }
  },

  computed:{
    emergencyGoalMissing(){
      return this.emergencyReserveGoal > this.emergencyReserveReached ? this.emergencyReserveGoal - this.emergencyReserveReached : 0
    },

    returnTotalFromThirdParties(){
      let total = 0
      this.toReceiveFromThirdParties.forEach(element => {
        total += element.price
      });

      return total;
    },

    amountExpense(){
      let total = 0
      this.expenses.forEach((e)=>{
        total += e.price
      })

      return total;
    },

    totalToreceive(){
      let total = 0
      this.toReceives.forEach((e)=>{
        total += e.price
      })

      return total;
    },

    calcBarEmergencyGoal(){
      if(this.emergencyReserveReached === 0 && this.emergencyReserveGoal === 0){
        return 0
      }

      const result = ((this.emergencyReserveReached * 100) / this.emergencyReserveGoal)/100
      return result
    }
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
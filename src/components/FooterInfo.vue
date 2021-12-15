<template>
  <ion-row style="position: fixed;bottom: 0;width: 100%; background:white">
      <ion-col class="ion-text-center">
        <b><ion-label>Total</ion-label></b>
      </ion-col>
      <ion-col class="ion-text-center">
        <b><ion-label>{{total}}</ion-label></b>
      </ion-col>
  </ion-row>
</template>

<script lang="ts">
export default {
  name: 'ExploreContainer',
  props: {
    total: String
  },

  mounted(){
    console.log('Footer montado')
    console.log(this.name)
  }
}
</script>

<style scoped>
  
</style>
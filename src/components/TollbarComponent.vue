<template>
  <ion-row>
      <ion-col>
        <ion-title>{{title}}</ion-title>
      </ion-col>
      <ion-col size="6" class="ion-text-right">
        <ion-label class="wallet" :color="(total > 0) ? 'success' : 'danger'">{{formatMoney(total)}}</ion-label>
      </ion-col>
  </ion-row>
</template>

<script lang="ts">
export default {
  props: {
    total: Number,
    title: String,
  },

  mounted(){
    console.log('Tollbar montado')
  }
}
</script>

<style scoped>
  .wallet{
    font-size: 20px!important;
    font-weight: bold;
  }
</style>
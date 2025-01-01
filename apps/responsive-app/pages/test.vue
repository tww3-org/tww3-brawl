<template>
    <div>
        <img height="130" alt="unit"
            src="https://res.cloudinary.com/fishofstone/image/upload/twwstats/api/6705472705443252068/ui/portraits/units/no_culture/brt_prophetess_campaign_02_0.webp">
    </div>
    <div id="background">
        hi
    </div>
    <q-img
      src="https://res.cloudinary.com/fishofstone/image/upload/twwstats/api/6705472705443252068/ui/portraits/units/no_culture/brt_prophetess_campaign_02_0.webp"
      spinner-color="white"
      style="height: 170px; max-width: 300px; filter: blur(1px) sepia()"
      fit="contain"
      class="rounded-borders"
    >
      <div class="absolute-bottom text-subtitle1 text-center">
        Caption
      </div>
    </q-img>
</template>

<script setup lang="ts">

</script>

<style scoped>

.my-custom-image {
    filter: blur(1px) sepia()
}


#background {
    width: 100px;
    object-fit: cover;
    background-image: url("https://res.cloudinary.com/fishofstone/image/upload/twwstats/api/6705472705443252068/ui/portraits/units/no_culture/brt_prophetess_campaign_02_0.webp");
}
</style>
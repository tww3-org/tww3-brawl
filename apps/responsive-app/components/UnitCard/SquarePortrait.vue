<template>
  <div class="container" :class="{ 'selected': selected }">
    <img :src="getSquareBorder(versionId)">
    <img :src="getSquareHover(versionId)" class="square-hover">
    <img v-if="imageUrl" :src="imageUrl" :alt="label" class="item-card__image" fit="contain" />
    <div class="label"> {{ label }} </div>
  </div>
</template>

<script setup lang="ts">
import { getSquareBorder, getSquareHover } from '@tww3-brawl/sdk/src/utils/getImageUrl';

interface Props {
  versionId?: string;
  imageUrl?: string;
  label: string;
  selected?: boolean;
}

withDefaults(defineProps<Props>(), {
  imageUrl: '',
  selected: false,
  versionId: '7020588859072995689',
});
</script>

<style scoped lang="scss">

.selected {
  @include emphazed-card;
  .square-hover {
      display: block !important;
  }
}

.container {
  padding: 0;
  gap: 0;
  width: $square-icon-size;
  height: $square-icon-size;

  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-around;
  color: #333;
  font-size: var(--font-size-sm);

  &:hover {
    @include emphazed-card;
    .square-hover {
      display: block;
    }
  }

  img:nth-child(1) {
    position: absolute;
    width: $square-icon-size;
    height: $square-icon-size;
  }

  img:nth-child(2) {
    position: absolute;
    width: $square-icon-size;
    height: $square-icon-size;
  }

  img:nth-child(3) {
    width: calc($square-icon-size - 10px);
  }


  .label {
    overflow: ellipsis;
    text-align: center;
  }

  .square-hover {
    display: none;
  }
}

.selected {
  @include emphazed-card;
}
</style>
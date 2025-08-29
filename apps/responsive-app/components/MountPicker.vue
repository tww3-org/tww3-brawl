<template>
    <q-btn-dropdown>
        <q-list>
            <q-item v-for="mount in model.battle_mounts" :key="mount.mounted_unit" @click="selectMount(mount)">
                <q-avatar>
                    <img :src="getImageUrl(model.version, mount.icon_name)">
                  </q-avatar>

                {{ mount.mount_name }}
            </q-item>
        </q-list>
    </q-btn-dropdown>
</template>

<script setup lang="ts">
import type { Unit } from '@tww3-brawl/sdk/src/types';
import { getImageUrl } from '@tww3-brawl/sdk/src/utils/getImageUrl';
const model = defineModel<Unit>({ required: true });

function selectMount(mount: Unit['battle_mounts'][number]) {
    // TODO: Implement unit composable and use it here
}
</script>

<style scoped>

</style>